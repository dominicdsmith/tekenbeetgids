import { MIGRATIE_DATABASE } from "./firebase-migratie";
import type { SpiegelTransport } from "./firebase-spiegel-transactie";

export const GOOGLE_EXPORT_COLLECTIES = ["deelnames", "registraties", "contact_berichten", "privacy_verzoeken", "tellingen", "intrekkingen"] as const;
type Document = { name: string; fields?: Record<string, { stringValue?: string; booleanValue?: boolean }> };

/** One read-only transaction spans every page and collection. No partial snapshots. */
export async function leesGoogleMomentopname(transport: SpiegelTransport) {
  const start = await transport(`${MIGRATIE_DATABASE}/documents:beginTransaction`, {
    method: "POST", body: JSON.stringify({ options: { readOnly: {} } }),
  }) as { transaction?: string };
  if (!start.transaction) throw new Error("Google-momentopname niet beschikbaar");
  const transaction = start.transaction;
  const tabellen: Record<string, Record<string, unknown>[]> = {};
  try {
    for (const collectie of GOOGLE_EXPORT_COLLECTIES) {
      const rijen: Record<string, unknown>[] = [];
      const ids = new Set<string>();
      let laatste: string | undefined;
      while (true) {
        const resultaat = await transport(`${MIGRATIE_DATABASE}/documents:runQuery`, {
          method: "POST", body: JSON.stringify({ transaction, structuredQuery: {
            from: [{ collectionId: collectie }], orderBy: [{ field: { fieldPath: "__name__" }, direction: "ASCENDING" }], limit: 500,
            ...(laatste ? { startAt: { values: [{ referenceValue: laatste }], before: false } } : {}),
          } }),
        }) as { document?: Document }[];
        if (!Array.isArray(resultaat)) throw new Error("Onvolledige Google-momentopname");
        const documenten = resultaat.flatMap(r => r.document ? [r.document] : []);
        for (const doc of documenten) {
          if (!doc.name.startsWith(`${MIGRATIE_DATABASE}/documents/${collectie}/`) || ids.has(doc.name)) throw new Error("Ongeldige Google-paginering");
          ids.add(doc.name);
          if (collectie === "intrekkingen") {
            rijen.push({ nummer: doc.name.split("/").pop(), ingetrokken: doc.fields?.["ingetrokken"]?.booleanValue === true });
          } else {
            const inhoud: unknown = JSON.parse(doc.fields?.["gegevens"]?.stringValue ?? "null");
            if (!inhoud || typeof inhoud !== "object" || Array.isArray(inhoud)) throw new Error("Onvolledig Google-record");
            const rij = inhoud as Record<string, unknown>;
            if (rij["id"] !== doc.fields?.["bron_id"]?.stringValue || doc.name.split("/").pop() !== rij["id"]) throw new Error("Ongeldig Google-record");
            rijen.push({ ...rij,
              ...(doc.fields?.["status"]?.stringValue ? { status: doc.fields["status"].stringValue } : {}),
              ...(doc.fields?.["gemeld_op"]?.stringValue ? { gemeld_op: doc.fields["gemeld_op"].stringValue } : {}),
            });
          }
        }
        if (documenten.length < 500) break;
        laatste = documenten.at(-1)?.name;
        if (rijen.length >= 200_000) throw new Error("Exportgrens bereikt; geen gedeeltelijke back-up toegestaan");
      }
      tabellen[collectie] = rijen;
    }
    return { bron: "Google Firestore", tabellen, aantallen: Object.fromEntries(Object.entries(tabellen).map(([k, r]) => [k, r.length])) };
  } finally {
    await transport(`${MIGRATIE_DATABASE}/documents:rollback`, { method: "POST", body: JSON.stringify({ transaction }) }).catch(() => undefined);
  }
}

const b64 = (bytes: Uint8Array) => { let tekst = ""; for (const b of bytes) tekst += String.fromCharCode(b); return btoa(tekst); };

/** Compatible portable encrypted export; never uploads plaintext. */
export async function versleutelGoogleExport(inhoud: unknown, wachtzin: string) {
  if (wachtzin.length < 12) throw new Error("Back-upsleutel niet ingesteld");
  const zout = crypto.getRandomValues(new Uint8Array(16)), iv = crypto.getRandomValues(new Uint8Array(12));
  const basis = await crypto.subtle.importKey("raw", new TextEncoder().encode(wachtzin), "PBKDF2", false, ["deriveKey"]);
  const key = await crypto.subtle.deriveKey({ name: "PBKDF2", salt: zout, iterations: 100_000, hash: "SHA-256" }, basis, { name: "AES-GCM", length: 256 }, false, ["encrypt"]);
  const data = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, new TextEncoder().encode(JSON.stringify(inhoud)));
  return JSON.stringify({ formaat: "TekenbeetGids-backup-v1", alg: "AES-256-GCM", kdf: "PBKDF2-SHA256", iteraties: 100_000, zout: b64(zout), iv: b64(iv), data: b64(new Uint8Array(data)) });
}