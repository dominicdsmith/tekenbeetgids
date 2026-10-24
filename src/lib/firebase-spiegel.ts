import { MIGRATIE_DATABASE, MIGRATIE_TABELLEN, type MigratieTabel } from "./firebase-migratie";

/**
 * Live-spiegel naar Google (fase B deel 2): elke nieuwe schrijfactie in de
 * huidige administratie wordt óók naar tekenbeetgids-prod gekopieerd.
 * De huidige administratie blijft leidend tot de definitieve omschakeling;
 * een mislukte spiegel blokkeert de schrijfactie nooit.
 */

/** Brontabellen die naast de vier migratietabellen ook live worden gespiegeld. */
export const SPIEGEL_EXTRA_TABELLEN = [
  { bron: "tekenbeet_tellingen", collectie: "tellingen", nummerVeld: null },
  { bron: "backup_log", collectie: "backuplog", nummerVeld: null },
] as const;
export type SpiegelExtraTabel = (typeof SPIEGEL_EXTRA_TABELLEN)[number];

export type SpiegelTabel = MigratieTabel | SpiegelExtraTabel;

export const SPIEGEL_TABELLEN: readonly SpiegelTabel[] = [...MIGRATIE_TABELLEN, ...SPIEGEL_EXTRA_TABELLEN];

export function spiegelTabel(bron: string): SpiegelTabel | null {
  return SPIEGEL_TABELLEN.find(t => t.bron === bron) ?? null;
}

/** Firestore-document voor één nieuwe bronrij; de volledige rij gaat mee als JSON-tekst. */
export function codeerSpiegelRij(tabel: SpiegelTabel, rij: Record<string, unknown>, tijd: string) {
  const id = rij["id"];
  if (typeof id !== "string" || !/^[a-f0-9-]{36}$/.test(id)) throw new Error(`Ongeldig record-id in ${tabel.bron}`);
  const nummer = tabel.nummerVeld ? rij[tabel.nummerVeld] : null;
  return {
    naam: `${MIGRATIE_DATABASE}/documents/${tabel.collectie}/${id}`,
    velden: {
      bron_id: { stringValue: id },
      bron_tabel: { stringValue: tabel.bron },
      nummer: typeof nummer === "string" ? { stringValue: nummer } : { nullValue: null },
      aangemaakt_op: { stringValue: String(rij["created_at"] ?? rij["uitgevoerd_op"] ?? "") },
      gegevens: { stringValue: JSON.stringify(rij) },
      gemigreerd_op: { timestampValue: tijd },
    },
  };
}

/** Logregel in de collectie migratie_log: alleen actie, tabel, uitkomst en tijd — nooit recordinhoud. */
export function codeerSpiegelLog(actie: string, tabel: string, ok: boolean, detail: string, tijd: string) {
  return {
    naam: `${MIGRATIE_DATABASE}/documents/migratie_log/${crypto.randomUUID()}`,
    velden: {
      actie: { stringValue: actie.slice(0, 40) },
      tabel: { stringValue: tabel.slice(0, 60) },
      ok: { booleanValue: ok },
      detail: { stringValue: detail.slice(0, 200) },
      tijd: { timestampValue: tijd },
    },
  };
}

/** Welke documenten bij een intrekking moeten verdwijnen: nummer gelijk aan of beginnend met het deelnamenummer. */
export function nummerValtOnderIntrekking(nummer: unknown, deelnamenummer: string): boolean {
  return typeof nummer === "string" && (nummer === deelnamenummer || nummer.startsWith(`${deelnamenummer}-`));
}
