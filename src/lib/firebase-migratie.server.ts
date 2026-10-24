import { createServerOnlyFn } from "@tanstack/react-start";
import {
  MIGRATIE_DATABASE, MIGRATIE_TABELLEN, vergelijkAantallen,
  type MigratieInput, type MigratieResultaat, type SpiegelLogRegel,
} from "./firebase-migratie";
import { leesVolledigeBron, vergelijkRecords, vergelijkRecordDetails, googleEffectieveRij, type Rij } from "./firebase-migratie-controle";

type Transport = (path: string, init?: RequestInit) => Promise<unknown>;
type AdministratieLezer = {
  from: (tabel: string) => {
    select: (velden: string, opties?: { count: "exact"; head: true }) =>
      PromiseLike<{ count: number | null; error: unknown }> & {
        order: (veld: string, opties: { ascending: true }) => {
          range: (vanaf: number, tot: number) => PromiseLike<{ data: Rij[] | null; error: unknown }>;
        };
      };
  };
};

export const maakMigratieTransport = createServerOnlyFn((): Transport => {
  const key = process.env["GOOGLE_CLOUD_PLATFORM_API_KEY"];
  const lovableKey = process.env["LOVABLE_API_KEY"];
  if (!key || !lovableKey) throw new Error("De Google-koppeling voor de migratie is niet beschikbaar");
  return async (path, init = {}) => {
    const response = await fetch(`https://connector-gateway.lovable.dev/google_cloud_platform/firestore/v1/${path}`, {
      ...init,
      headers: { "Authorization": `Bearer ${lovableKey}`, "X-Connection-Api-Key": key, "Content-Type": "application/json" },
    });
    if (!response.ok) {
      console.error("Firebase migratie request failed", response.status);
      throw new Error("Google kon de migratiehandeling niet afronden; de bronadministratie is niet gewijzigd.");
    }
    return response.json();
  };
});

async function leesGoogleRecords(transport: Transport, collectie: string): Promise<Rij[]> {
  const rijen: Rij[] = [];
  let token: string | null = null;
  const tokens = new Set<string>();
  do {
    const query = `?pageSize=500&mask.fieldPaths=gegevens&mask.fieldPaths=bron_id&mask.fieldPaths=status&mask.fieldPaths=gemeld_op${token ? `&pageToken=${encodeURIComponent(token)}` : ""}`;
    const page = await transport(`${MIGRATIE_DATABASE}/documents/${collectie}${query}`) as {
      documents?: { fields?: { gegevens?: { stringValue?: string }; bron_id?: { stringValue?: string }; status?: { stringValue?: string }; gemeld_op?: { stringValue?: string } } }[];
      nextPageToken?: string;
    };
    for (const document of page.documents ?? []) {
      const tekst = document.fields?.gegevens?.stringValue;
      if (!tekst) throw new Error("Onvolledig Google-record; omschakeling niet mogelijk.");
      const rij: unknown = JSON.parse(tekst);
      if (!rij || typeof rij !== "object" || Array.isArray(rij) || (rij as Rij)["id"] !== document.fields?.bron_id?.stringValue) {
        throw new Error("Ongeldig Google-record; omschakeling niet mogelijk.");
      }
      rijen.push(googleEffectieveRij(rij as Rij, document.fields?.status?.stringValue, document.fields?.gemeld_op?.stringValue));
    }
    token = page.nextPageToken ?? null;
    if (token && tokens.has(token)) throw new Error("Google-paginering kon niet worden afgerond.");
    if (token) tokens.add(token);
  } while (token);
  return rijen;
}

async function telGoogle(transport: Transport): Promise<Record<string, number>> {
  const uit: Record<string, number> = {};
  for (const t of MIGRATIE_TABELLEN) {
    let totaal = 0;
    let token: string | null = null;
    do {
      const query = `?pageSize=1000&mask.fieldPaths=bron_id${token ? `&pageToken=${encodeURIComponent(token)}` : ""}`;
      const page = await transport(`${MIGRATIE_DATABASE}/documents/${t.collectie}${query}`) as { documents?: unknown[]; nextPageToken?: string };
      totaal += page.documents?.length ?? 0;
      token = page.nextPageToken ?? null;
    } while (token);
    uit[t.collectie] = totaal;
  }
  return uit;
}

/** Laatste 20 spiegellogregels (nieuwste eerst); alleen actie, tabel, uitkomst en tijd. */
export async function leesSpiegelLog(transport: Transport): Promise<SpiegelLogRegel[]> {
  const page = await transport(
    `${MIGRATIE_DATABASE}/documents/migratie_log?pageSize=20&orderBy=${encodeURIComponent("tijd desc")}`,
  ) as { documents?: { fields?: Record<string, { stringValue?: string; booleanValue?: boolean; timestampValue?: string }> }[] };
  return (page.documents ?? []).map(d => ({
    actie: d.fields?.["actie"]?.stringValue ?? "",
    tabel: d.fields?.["tabel"]?.stringValue ?? "",
    ok: d.fields?.["ok"]?.booleanValue === true,
    detail: d.fields?.["detail"]?.stringValue ?? "",
    tijd: d.fields?.["tijd"]?.timestampValue ?? "",
  }));
}

export async function voerMigratieUit(input: MigratieInput, transport: Transport): Promise<MigratieResultaat> {
  if (input.actie === "overzetten") throw new Error("Opnieuw kopiëren is geblokkeerd zolang de live-spiegel actief is; dit kan ingetrokken gegevens terugplaatsen.");
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const admin = supabaseAdmin as unknown as AdministratieLezer;
  const tijd = new Date().toISOString();
  const bron = await leesVolledigeBron({
    tel: async tabel => {
      const { count, error } = await admin.from(tabel).select("id", { count: "exact", head: true });
      if (error || count === null) throw new Error("De volledige brontelling is niet beschikbaar.");
      return count;
    },
    pagina: async (tabel, vanaf, tot) => {
      const { data, error } = await admin.from(tabel).select("*").order("id", { ascending: true }).range(vanaf, tot);
      if (error || !data) throw new Error("De bronadministratie kon niet volledig worden gelezen.");
      return data as Rij[];
    },
  });
  const vergelijkingen = input.actie === "controleren" ? await Promise.all(MIGRATIE_TABELLEN.map(async t => {
    const googleRijen = await leesGoogleRecords(transport, t.collectie);
    const bronRijen = bron[t.bron] ?? [];
    return { record: vergelijkRecords(t.bron, bronRijen, googleRijen), detail: { tabel: t.bron, rijen: vergelijkRecordDetails(bronRijen, googleRijen) } };
  })) : undefined;
  const google = await telGoogle(transport);
  const bronAantallen = Object.fromEntries(MIGRATIE_TABELLEN.map(t => [t.bron, (bron[t.bron] ?? []).length]));
  return { aantallen: vergelijkAantallen(bronAantallen, google), ...(vergelijkingen ? { records: vergelijkingen.map(v => v.record), details: vergelijkingen.map(v => v.detail) } : {}), overgezet: 0, tijd };
}
