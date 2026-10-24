import { MIGRATIE_DATABASE } from "./firebase-migratie";

export type TaakStatus = {
  taak: string; schema: string; actief: boolean; laatsteStatus: string | null;
  laatsteStart: string | null; laatsteEinde: string | null; mislukt7d: number; runs7d: number;
  oordeel: "ok" | "fout" | "inactief" | "onbekend"; bijgewerkt: string;
};

export type TaakRij = {
  taak: string; schema_cron: string; actief: boolean; laatste_status: string | null;
  laatste_start: string | null; laatste_einde: string | null; mislukt_7d: number | string; runs_7d: number | string;
};

/** Bepaalt het oordeel per taak: mislukte runs of een niet-geslaagde laatste run zijn een fout. */
export function beoordeelTaak(r: TaakRij, bijgewerkt: string): TaakStatus {
  const mislukt = Number(r.mislukt_7d) || 0;
  const oordeel: TaakStatus["oordeel"] = !r.actief ? "inactief"
    : !r.laatste_status ? "onbekend"
    : r.laatste_status !== "succeeded" || mislukt > 0 ? "fout" : "ok";
  return {
    taak: r.taak, schema: r.schema_cron, actief: r.actief, laatsteStatus: r.laatste_status,
    laatsteStart: r.laatste_start, laatsteEinde: r.laatste_einde, mislukt7d: mislukt,
    runs7d: Number(r.runs_7d) || 0, oordeel, bijgewerkt,
  };
}

const s = (v: string | null) => (v == null ? { nullValue: null } : { stringValue: v });

export function taakDocument(t: TaakStatus) {
  const id = t.taak.replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 100);
  return {
    name: `${MIGRATIE_DATABASE}/documents/taakstatus/${id}`,
    fields: {
      taak: { stringValue: t.taak }, schema: { stringValue: t.schema }, actief: { booleanValue: t.actief },
      laatsteStatus: s(t.laatsteStatus), laatsteStart: s(t.laatsteStart), laatsteEinde: s(t.laatsteEinde),
      mislukt7d: { integerValue: String(t.mislukt7d) }, runs7d: { integerValue: String(t.runs7d) },
      oordeel: { stringValue: t.oordeel }, bijgewerkt: { stringValue: t.bijgewerkt },
    },
  };
}

type FsVeld = { stringValue?: string; booleanValue?: boolean; integerValue?: string; nullValue?: null };
export function leesTaakDocument(f: Record<string, FsVeld>): TaakStatus {
  return {
    taak: f["taak"]?.stringValue ?? "", schema: f["schema"]?.stringValue ?? "", actief: Boolean(f["actief"]?.booleanValue),
    laatsteStatus: f["laatsteStatus"]?.stringValue ?? null, laatsteStart: f["laatsteStart"]?.stringValue ?? null,
    laatsteEinde: f["laatsteEinde"]?.stringValue ?? null, mislukt7d: Number(f["mislukt7d"]?.integerValue ?? 0),
    runs7d: Number(f["runs7d"]?.integerValue ?? 0),
    oordeel: (f["oordeel"]?.stringValue as TaakStatus["oordeel"]) ?? "onbekend", bijgewerkt: f["bijgewerkt"]?.stringValue ?? "",
  };
}
