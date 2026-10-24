import { MIGRATIE_TABELLEN } from "./firebase-migratie";

export type Rij = Record<string, unknown>;
export type BronLezer = {
  tel: (tabel: string) => Promise<number>;
  pagina: (tabel: string, vanaf: number, tot: number) => Promise<Rij[]>;
};

/** Independent counts bracket deterministic ID-ordered pages; never accept truncated reads. */
export async function leesVolledigeBron(lezer: BronLezer) {
  const resultaat: Record<string, Rij[]> = {};
  for (const tabel of MIGRATIE_TABELLEN) {
    const verwacht = await lezer.tel(tabel.bron);
    if (!Number.isSafeInteger(verwacht) || verwacht < 0) throw new Error("Ongeldige brontelling.");
    const rijen: Rij[] = [];
    const ids = new Set<string>();
    for (let vanaf = 0; vanaf < verwacht; vanaf += 500) {
      const pagina = await lezer.pagina(tabel.bron, vanaf, Math.min(vanaf + 499, verwacht - 1));
      if (pagina.length !== Math.min(500, verwacht - vanaf)) throw new Error("Onvolledige bronlezing; controle opnieuw uitvoeren.");
      for (const rij of pagina) {
        if (typeof rij["id"] !== "string" || ids.has(rij["id"])) throw new Error("Ontbrekend of dubbel record; controle opnieuw uitvoeren.");
        ids.add(rij["id"]);
        rijen.push(rij);
      }
    }
    if (await lezer.tel(tabel.bron) !== verwacht) throw new Error("Bron gewijzigd tijdens controle; opnieuw uitvoeren.");
    resultaat[tabel.bron] = rijen;
  }
  return resultaat;
}

function canoniek(waarde: unknown): string {
  if (Array.isArray(waarde)) return `[${waarde.map(canoniek).join(",")}]`;
  if (waarde !== null && typeof waarde === "object") {
    const object = waarde as Record<string, unknown>;
    return `{${Object.keys(object).sort().map(k => `${JSON.stringify(k)}:${canoniek(object[k])}`).join(",")}}`;
  }
  return JSON.stringify(waarde) ?? "null";
}

export type RecordControle = { tabel: string; ontbreekt: number; extra: number; afwijkend: number; gelijk: boolean };

export type RijControle = { id: string; status: "gelijk" | "ontbreekt" | "extra" | "afwijkend"; velden: { veld: string; gelijk: boolean; bronAanwezig: boolean; googleAanwezig: boolean }[] };

const ZICHTBARE_VELDEN = new Set(["id", "created_at", "deelnamenummer", "gegevens", "gemeld_op", "rapport", "status", "taal", "bericht", "email", "naam", "onderwerp", "afgehandeld_op", "contact_referentie", "soort", "updated_at", "verzoeknummer", "overzicht", "registratienummer"]);

export function googleEffectieveRij(rij: Rij, status?: string, gemeldOp?: string): Rij {
  return { ...rij, ...(status !== undefined ? { status } : {}), ...(gemeldOp !== undefined ? { gemeld_op: gemeldOp } : {}) };
}

/** Compare every value on the server, returning only IDs and field equality, never stored values. */
export function vergelijkRecordDetails(bron: Rij[], google: Rij[]): RijControle[] {
  const indexeer = (rijen: Rij[]) => {
    const index = new Map<string, Rij>();
    for (const rij of rijen) {
      const id = rij["id"];
      if (typeof id !== "string" || index.has(id)) throw new Error("Ongeldige recordverzameling.");
      index.set(id, rij);
    }
    return index;
  };
  const b = indexeer(bron), g = indexeer(google);
  return [...new Set([...b.keys(), ...g.keys()])].sort().map(id => {
    const br = b.get(id), gr = g.get(id);
    const sleutels = [...new Set([...Object.keys(br ?? {}), ...Object.keys(gr ?? {})])].sort();
    const velden = sleutels.map(veld => {
      const bronAanwezig = br !== undefined && Object.hasOwn(br, veld);
      const googleAanwezig = gr !== undefined && Object.hasOwn(gr, veld);
      return {
        veld: ZICHTBARE_VELDEN.has(veld) ? veld : "Afgeschermd controleveld",
        gelijk: bronAanwezig === googleAanwezig && canoniek(br?.[veld]) === canoniek(gr?.[veld]),
        bronAanwezig, googleAanwezig,
      };
    });
    return { id, status: !br ? "extra" : !gr ? "ontbreekt" : velden.every(v => v.gelijk) ? "gelijk" : "afwijkend", velden };
  });
}

/** Return aggregates only, never IDs or record content to the browser. */
export function vergelijkRecords(tabel: string, bron: Rij[], google: Rij[]): RecordControle {
  const maakIndex = (rijen: Rij[]) => {
    const index = new Map<string, string>();
    for (const rij of rijen) {
      if (typeof rij["id"] !== "string" || index.has(rij["id"])) throw new Error("Ongeldige recordverzameling.");
      index.set(rij["id"], canoniek(rij));
    }
    return index;
  };
  const b = maakIndex(bron), g = maakIndex(google);
  let ontbreekt = 0, extra = 0, afwijkend = 0;
  for (const [id, inhoud] of b) {
    if (!g.has(id)) ontbreekt++;
    else if (g.get(id) !== inhoud) afwijkend++;
  }
  for (const id of g.keys()) if (!b.has(id)) extra++;
  return { tabel, ontbreekt, extra, afwijkend, gelijk: ontbreekt === 0 && extra === 0 && afwijkend === 0 };
}