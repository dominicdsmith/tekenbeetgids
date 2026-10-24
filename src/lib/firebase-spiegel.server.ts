import { createServerOnlyFn } from "@tanstack/react-start";
import { MIGRATIE_DATABASE } from "./firebase-migratie";
import { codeerSpiegelLog, codeerSpiegelRij, nummerValtOnderIntrekking, spiegelTabel } from "./firebase-spiegel";
import { intrekkingDocument, markeerIntrekking, schrijfZonderIntrekking } from "./firebase-spiegel-transactie";

type Transport = (path: string, init?: RequestInit) => Promise<unknown>;

export const maakSpiegelTransport = createServerOnlyFn((): Transport | null => {
  const key = process.env["GOOGLE_CLOUD_PLATFORM_API_KEY"];
  const lovableKey = process.env["LOVABLE_API_KEY"];
  if (!key || !lovableKey) return null;
  return async (path, init = {}) => {
    const response = await fetch(`https://connector-gateway.lovable.dev/google_cloud_platform/firestore/v1/${path}`, {
      ...init,
      headers: { "Authorization": `Bearer ${lovableKey}`, "X-Connection-Api-Key": key, "Content-Type": "application/json" },
    });
    if (!response.ok) throw new Error(`Google-spiegel weigerde de handeling (${response.status})`);
    return response.json();
  };
});

async function logSpiegel(transport: Transport | null, actie: string, tabel: string, ok: boolean, detail: string) {
  if (!transport) return;
  try {
    const regel = codeerSpiegelLog(actie, tabel, ok, detail, new Date().toISOString());
    await transport(`${MIGRATIE_DATABASE}/documents:commit`, {
      method: "POST",
      body: JSON.stringify({ writes: [{ update: { name: regel.naam, fields: regel.velden } }] }),
    });
  } catch (e) {
    console.error("Spiegellog schrijven mislukt:", e);
  }
}

/**
 * Kopieert één net opgeslagen bronrij naar Google. Mislukken blokkeert de
 * schrijfactie nooit: de huidige administratie blijft leidend en de mislukking
 * wordt zichtbaar in de migratie_log.
 */
export async function spiegelOpslaan(bron: string, rij: Record<string, unknown>): Promise<void> {
  const tabel = spiegelTabel(bron);
  if (!tabel) return;
  let transport: Transport | null = null;
  try {
    transport = maakSpiegelTransport();
    if (!transport) return;
    const gecodeerd = codeerSpiegelRij(tabel, rij, new Date().toISOString());
    const nummer = gecodeerd.velden.nummer;
    if ((bron === "onderzoek_deelnames" || bron === "tekenbeet_registraties") && "stringValue" in nummer) {
      await schrijfZonderIntrekking(transport, nummer.stringValue, [{ update: { name: gecodeerd.naam, fields: gecodeerd.velden } }]);
      return;
    }
    await transport(`${MIGRATIE_DATABASE}/documents:commit`, {
      method: "POST",
      body: JSON.stringify({ writes: [{ update: { name: gecodeerd.naam, fields: gecodeerd.velden } }] }),
    });
  } catch (e) {
    console.error(`Spiegel naar Google mislukt (${bron}):`, e);
    await logSpiegel(transport, "opslaan", bron, false, e instanceof Error ? e.message : "onbekende fout");
  }
}

/** Verwijdert bij een intrekking alle gespiegelde documenten die onder het deelnamenummer vallen. */
export async function spiegelWisIntrekking(deelnamenummer: string): Promise<void> {
  let transport: Transport | null = null;
  try {
    transport = maakSpiegelTransport();
    if (!transport) return;
    await markeerIntrekking(transport, deelnamenummer);
    for (const collectie of ["deelnames", "registraties"] as const) {
      let token: string | null = null;
      const namen: string[] = [];
      do {
        const query = `?pageSize=1000&mask.fieldPaths=nummer${token ? `&pageToken=${encodeURIComponent(token)}` : ""}`;
        const page = await transport(`${MIGRATIE_DATABASE}/documents/${collectie}${query}`) as {
          documents?: { name: string; fields?: { nummer?: { stringValue?: string } } }[];
          nextPageToken?: string;
        };
        for (const doc of page.documents ?? []) {
          if (nummerValtOnderIntrekking(doc.fields?.nummer?.stringValue, deelnamenummer)) namen.push(doc.name);
        }
        token = page.nextPageToken ?? null;
      } while (token);
      for (let i = 0; i < namen.length; i += 500) {
        await transport(`${MIGRATIE_DATABASE}/documents:commit`, {
          method: "POST",
          body: JSON.stringify({ writes: namen.slice(i, i + 500).map(name => ({ delete: name })) }),
        });
      }
    }
    // Completion requires read-back; a failed/uncertain deletion keeps its pending marker.
    for (const collectie of ["deelnames", "registraties"] as const) {
      const gevonden = await transport(`${MIGRATIE_DATABASE}/documents:runQuery`, { method: "POST", body: JSON.stringify({ structuredQuery: {
        from: [{ collectionId: collectie }], select: { fields: [{ fieldPath: "nummer" }] },
        where: { compositeFilter: { op: "AND", filters: [
          { fieldFilter: { field: { fieldPath: "nummer" }, op: "GREATER_THAN_OR_EQUAL", value: { stringValue: deelnamenummer } } },
          { fieldFilter: { field: { fieldPath: "nummer" }, op: "LESS_THAN", value: { stringValue: `${deelnamenummer}\uf8ff` } } },
        ] } }, limit: 1,
      } }) }) as { document?: unknown }[];
      if (!Array.isArray(gevonden) || gevonden.some(r => r.document)) throw new Error("Google-verwijdering nog niet bevestigd");
    }
    await transport(`${MIGRATIE_DATABASE}/documents:commit`, { method: "POST", body: JSON.stringify({ writes: [{ update: {
      name: intrekkingDocument(deelnamenummer), fields: { google_verwijdering: { stringValue: "afgerond" }, bijgewerkt: { timestampValue: new Date().toISOString() } },
    }, updateMask: { fieldPaths: ["google_verwijdering", "bijgewerkt"] }, currentDocument: { exists: true } }] }) });
  } catch (e) {
    console.error("Spiegel-intrekking mislukt:", e);
    await logSpiegel(transport, "intrekken", deelnamenummer, false, e instanceof Error ? e.message : "onbekende fout");
  }
}

/** Werk de status van een gespiegelde deelname bij (bijv. "Tekenbeet gemeld"). */
export async function spiegelDeelnameStatus(deelnamenummer: string, status: string, gemeldOp: string): Promise<void> {
  let transport: Transport | null = null;
  try {
    transport = maakSpiegelTransport();
    if (!transport) return;
    let token: string | null = null;
    let naam: string | null = null;
    do {
      const query = `?pageSize=1000&mask.fieldPaths=nummer${token ? `&pageToken=${encodeURIComponent(token)}` : ""}`;
      const page = await transport(`${MIGRATIE_DATABASE}/documents/deelnames${query}`) as {
        documents?: { name: string; fields?: { nummer?: { stringValue?: string } } }[];
        nextPageToken?: string;
      };
      const gevonden = (page.documents ?? []).find(d => d.fields?.nummer?.stringValue === deelnamenummer);
      if (gevonden) { naam = gevonden.name; break; }
      token = page.nextPageToken ?? null;
    } while (token);
    if (!naam) return;
    await schrijfZonderIntrekking(transport, deelnamenummer, [{
        update: { name: naam, fields: { status: { stringValue: status }, gemeld_op: { stringValue: gemeldOp } } },
        updateMask: { fieldPaths: ["status", "gemeld_op"] },
        currentDocument: { exists: true },
      }]);
  } catch (e) {
    console.error("Spiegel-statusbijwerking mislukt:", e);
    await logSpiegel(transport, "status", deelnamenummer, false, e instanceof Error ? e.message : "onbekende fout");
  }
}
