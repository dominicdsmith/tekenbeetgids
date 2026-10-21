import { GEMEENTEN } from "@/data/gemeentePaths";

export type MeldSoort = "dermacentor" | "hyalomma";
/** Hoe een melding tot stand kwam: bevestigde NVWA-vondst, onderzoek mét NVWA, of onderzoek zonder NVWA. */
export type BronType = "nvwa" | "nvwa-onderzoek" | "onderzoek";
export type TekenMelding = {
  id: string;
  soort: MeldSoort;
  gebied: string;
  periode: string;
  bron: string;
  bronType: BronType;
  url: string;
  omschrijving: string;
  omschrijvingEn: string;
  positie?: readonly [number, number] | undefined;
};

export const NVWA_TEKEN_URL = "https://www.nvwa.nl/onderwerpen/plant/muggen-knutten-en-teken/teken";
/** Officieel NVWA-meldformulier vectoren (één formulier voor Reuzenteek én Vlekkenteek). */
export const NVWA_MELD_URL = "https://formulieren.nvwa.nl/formulier/nl-NL/Extern/sc1149_MeldingVectoren.aspx";
export const TEKEN_MELDINGEN: TekenMelding[] = [
  ...[
    ["De Maashorst", "Maashorst", "04-2012"],
    ["Dintelse Gorzen", "Steenbergen", "2011–2013"],
    ["Egmond aan Zee", "Bergen (NH.)", "2012–2013"],
    ["Utrechtse Heuvelrug", "Utrechtse Heuvelrug", "2012"],
    ["Rozenburg", "Rotterdam", "2011–2013"],
    ["Tholen / Oud-Vossemeer / Sint Philipsland", "Tholen", "2012–2013"],
  ].map(([gebied = "", gemeente = "", periode = ""]): TekenMelding => ({
    id: `dermacentor-${gemeente}`, soort: "dermacentor", gebied, periode,
    bron: "Universiteit Utrecht e.a. (2015), tabel 1",
    bronType: "onderzoek",
    url: "https://doi.org/10.1186/s13071-015-0841-2",
    omschrijving: `Vlekkenteken uit de vegetatie verzameld in dit onderzoeksgebied. Aanvullend wetenschappelijk onderzoek naast NVWA-monitoring, geen actuele NVWA-melding. De stip staat bij benadering in de gemeente ${gemeente}, niet op de exacte vindplaats; locaties binnen dezelfde gemeente zijn gebundeld.`,
    omschrijvingEn: `Ornate dog ticks collected from vegetation in this study area. Supplementary scientific research alongside NVWA monitoring, not a current NVWA report. The dot is approximate within ${gemeente} municipality, not the exact site; locations in the same municipality are grouped.`,
    positie: GEMEENTEN.find((g) => g.naam === gemeente)?.c,
  })),
  {
    id: "hyalomma-odoorn-2019", soort: "hyalomma", gebied: "Odoorn", periode: "13-07-2019",
    bron: "RIVM / NVWA-CMV", bronType: "nvwa", url: "https://www.rivm.nl/nieuws/drentse-teek-is-hyalommateek",
    omschrijving: "Bevestigde vondst van een Hyalomma marginatum-vrouwtje. NVWA-CMV vond bij vervolgonderzoek geen andere Hyalomma-teken. De stip staat bij benadering in de gemeente Borger-Odoorn; de exacte vindplaats is niet openbaar.",
    omschrijvingEn: "Confirmed finding of a female Hyalomma marginatum. NVWA-CMV found no other Hyalomma ticks during follow-up surveillance. The dot is approximate, within Borger-Odoorn municipality; the exact site is not public.",
    positie: GEMEENTEN.find((g) => g.naam === "Borger-Odoorn")?.c,
  },
  {
    id: "hyalomma-achterhoek-2019", soort: "hyalomma", gebied: "Achterhoek", periode: "07-2019",
    bron: "RIVM / NVWA-CMV", bronType: "nvwa", url: "https://www.rivm.nl/nieuws/drentse-teek-is-hyalommateek",
    omschrijving: "Bevestigde vondst van een volwassen Hyalomma marginatum, een week vóór de vondst in Odoorn. De stip geeft alleen de regio Achterhoek aan, niet de precieze vindplaats of een melding in die gemeente.",
    omschrijvingEn: "Confirmed finding of an adult Hyalomma marginatum, one week before the Odoorn finding. The dot indicates the Achterhoek region only, not the exact site or a report in that municipality.",
    positie: GEMEENTEN.find((g) => g.naam === "Oost Gelre")?.c,
  },
  {
    id: "dermacentor-kust-2014-2016", soort: "dermacentor", gebied: "Zuidwestelijke kustgebieden", periode: "2014–2016",
    bron: "Onderzoek met NVWA-CMV / RIVM", bronType: "nvwa-onderzoek", url: "https://doi.org/10.1016/j.heliyon.2019.e01270",
    omschrijving: "Vlekkenteken verzameld in kustgebieden, vooral in het zuidwesten, tijdens monitoring in 2014–2016. De publicatie noemt geen afzonderlijke vindplaatsen; daarom geen exacte stip op de kaart.",
    omschrijvingEn: "Ornate dog ticks collected in coastal areas, mainly in the southwest, during surveillance in 2014–2016. The publication does not name individual sites, so no precise dot is shown on the map.",
  },
];

/** Koppelt elke melding met een stip aan de gemeente (CBS 2025) waar die stip bij benadering staat. */
const MELD_PER_GEMEENTE: ReadonlyMap<string, TekenMelding[]> = (() => {
  const map = new Map<string, TekenMelding[]>();
  for (const m of TEKEN_MELDINGEN) {
    if (!m.positie) continue;
    const g = GEMEENTEN.find((x) => x.c[0] === m.positie![0] && x.c[1] === m.positie![1]);
    if (!g) continue;
    const lijst = map.get(g.id) ?? [];
    lijst.push(m);
    map.set(g.id, lijst);
  }
  return map;
})();

/** Meldingen met stip in of bij benadering in deze gemeente. */
export function meldingenVoorGemeente(gemeenteId: string): TekenMelding[] {
  return MELD_PER_GEMEENTE.get(gemeenteId) ?? [];
}

/** Meldingen met stip in deze provincie (via de gemeente van de stip). */
export function meldingenVoorProvincie(provId: string): TekenMelding[] {
  const result: TekenMelding[] = [];
  for (const [gemId, lijst] of MELD_PER_GEMEENTE) {
    const g = GEMEENTEN.find((x) => x.id === gemId);
    if (g?.prov === provId) result.push(...lijst);
  }
  return result;
}
