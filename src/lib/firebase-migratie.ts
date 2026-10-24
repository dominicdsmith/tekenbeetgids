import { z } from "zod";
import type { RecordControle, RijControle } from "./firebase-migratie-controle";

export const MIGRATIE_DATABASE = "projects/tekenbeetgids-vertex-ai/databases/tekenbeetgids-prod";

/** Bron­tabel → Firestore-collection in tekenbeetgids-prod. Alleen administratie, geen cijferdata. */
export const MIGRATIE_TABELLEN = [
  { bron: "onderzoek_deelnames", collectie: "deelnames", nummerVeld: "deelnamenummer" },
  { bron: "tekenbeet_registraties", collectie: "registraties", nummerVeld: "registratienummer" },
  { bron: "contact_berichten", collectie: "contact_berichten", nummerVeld: null },
  { bron: "privacy_verzoeken", collectie: "privacy_verzoeken", nummerVeld: "verzoeknummer" },
] as const;
export type MigratieTabel = (typeof MIGRATIE_TABELLEN)[number];

export const migratieInput = z.object({
  actie: z.enum(["tellen", "overzetten", "controleren"]),
}).strict();
export type MigratieInput = z.infer<typeof migratieInput>;

export const spiegelLogInput = z.object({ actie: z.literal("spiegellog") }).strict();

/** Eén regel uit de live-spiegellog: alleen actie, tabel, uitkomst en tijd — nooit recordinhoud. */
export type SpiegelLogRegel = { actie: string; tabel: string; ok: boolean; detail: string; tijd: string };

export type MigratieAantallen = { tabel: string; bron: number; google: number; gelijk: boolean }[];
export type MigratieResultaat = {
  aantallen: MigratieAantallen;
  records?: RecordControle[];
  details?: { tabel: string; rijen: RijControle[] }[];
  overgezet: number;
  tijd: string;
};

export function controleerMigratieBeheer(isAdmin: unknown, error: unknown) {
  if (error || isAdmin !== true) throw new Error("Geen toegang tot de migratieomgeving");
}

/** Firestore-documentvelden voor één bronrij; de volledige rij gaat mee als JSON-tekst. */
export function codeerRij(tabel: MigratieTabel, rij: Record<string, unknown>, tijd: string) {
  const id = rij["id"];
  if (typeof id !== "string" || !/^[a-f0-9-]{36}$/.test(id)) throw new Error(`Ongeldig record-id in ${tabel.bron}`);
  const nummer = tabel.nummerVeld ? rij[tabel.nummerVeld] : null;
  return {
    naam: `${MIGRATIE_DATABASE}/documents/${tabel.collectie}/${id}`,
    velden: {
      bron_id: { stringValue: id },
      bron_tabel: { stringValue: tabel.bron },
      nummer: typeof nummer === "string" ? { stringValue: nummer } : { nullValue: null },
      aangemaakt_op: { stringValue: String(rij["created_at"] ?? "") },
      gegevens: { stringValue: JSON.stringify(rij) },
      gemigreerd_op: { timestampValue: tijd },
    },
  };
}

/** Vergelijk bron- en Google-aantallen per tabel. */
export function vergelijkAantallen(bron: Record<string, number>, google: Record<string, number>): MigratieAantallen {
  return MIGRATIE_TABELLEN.map(t => ({
    tabel: t.bron,
    bron: bron[t.bron] ?? 0,
    google: google[t.collectie] ?? 0,
    gelijk: (bron[t.bron] ?? 0) === (google[t.collectie] ?? 0),
  }));
}

/** Splits writes in Firestore-commitbatches van maximaal 500. */
export function batches<T>(items: T[], grootte = 500): T[][] {
  const uit: T[][] = [];
  for (let i = 0; i < items.length; i += grootte) uit.push(items.slice(i, i + grootte));
  return uit;
}
