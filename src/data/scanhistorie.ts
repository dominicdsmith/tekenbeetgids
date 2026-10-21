// Historisch overzicht van de beveiligingsscans van TekenRisicoKaart.
// Voeg bij iedere scan een nieuw item bovenaan toe (nieuwste eerst).
// Bewust samenvattend: alleen status en aard van de waarschuwing, geen technische details.

export type ScanWaarschuwing = {
  /** Korte titel van de waarschuwing */
  titel: string;
  /** "kritiek" | "waarschuwing" | "info" */
  niveau: "kritiek" | "waarschuwing" | "info";
  /** Status: open, opgelost, gemitigeerd of geaccepteerd */
  status: "open" | "opgelost" | "gemitigeerd" | "geaccepteerd";
  /** Korte toelichting in gewone taal */
  toelichting: string;
};

export type ScanItem = {
  /** Leesbare datum van de scan */
  datum: string;
  /** Tijdstip (Nederlandse tijd) */
  tijd: string;
  /** Release/versie waarop is gescand, bijv. "v1 — update 29082026" */
  release: string;
  /** Korte commit-aanduiding of build-referentie */
  commit: string;
  /** Welke scanners zijn gedraaid */
  scanners: string[];
  /** Gevonden waarschuwingen (leeg = schoon) */
  waarschuwingen: ScanWaarschuwing[];
};

export const SCANHISTORIE: ScanItem[] = [
  {
    datum: "29 augustus 2026",
    tijd: "21:12",
    release: "v1 — update 29082026",
    commit: "rolcontrole-hardening",
    scanners: ["Database (RLS/policies)", "Supabase linter", "Wiz", "MCP", "Supply chain"],
    waarschuwingen: [
      {
        titel: "Rolcontrole-functie uitvoerbaar door ingelogde gebruikers",
        niveau: "waarschuwing",
        status: "gemitigeerd",
        toelichting:
          "De functie is nodig voor de toegangsregels. Ingelogde gebruikers kunnen er nu alleen nog hun eigen rol mee opvragen; vragen over andere accounts geven altijd 'nee'.",
      },
      {
        titel: "Extensie in openbaar schema",
        niveau: "waarschuwing",
        status: "geaccepteerd",
        toelichting: "Bestaande platforminstelling van de database, niet door de website veroorzaakt.",
      },
    ],
  },
  {
    datum: "29 augustus 2026",
    tijd: "17:13",
    release: "v1 — update 29082026",
    commit: "publicatie-live",
    scanners: ["Database (RLS/policies)", "Supabase linter", "Wiz", "MCP", "Supply chain"],
    waarschuwingen: [
      {
        titel: "Rolcontrole-functie uitvoerbaar door ingelogde gebruikers",
        niveau: "waarschuwing",
        status: "geaccepteerd",
        toelichting: "Bekende melding, eerder beoordeeld en bewust geaccepteerd.",
      },
    ],
  },
  {
    datum: "29 augustus 2026",
    tijd: "17:11",
    release: "v1 — update 29082026",
    commit: "pre-publicatie",
    scanners: ["Database (RLS/policies)", "Supabase linter", "Wiz", "MCP", "Supply chain"],
    waarschuwingen: [
      {
        titel: "Rolcontrole-functie uitvoerbaar door ingelogde gebruikers",
        niveau: "waarschuwing",
        status: "geaccepteerd",
        toelichting: "Bekende melding, eerder beoordeeld en bewust geaccepteerd.",
      },
    ],
  },
];

export const LAATSTE_SCAN: ScanItem | undefined = SCANHISTORIE[0];
