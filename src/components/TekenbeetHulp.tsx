import { useState, useRef, useEffect } from "react";
import { Link, useRouteContext } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";

import { STZ, RISK, RISK_LBL, PEILDATUM, DATA_PEILDATUM, ZIEKTEN } from "@/data/tekenData";

import { leesTaal, useTaal } from "@/lib/taal";
import { vertaalTekst } from "@/lib/vertaling";
import { VERWIJDER_VERSION } from "@/data/appVersie";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import AntibioticaKeuze from "@/components/AntibioticaKeuze";
import { antibioticumNaam } from "@/data/antibiotica";
import { ALFA_GAL_BEHANDELINGEN, alfaGalBehandelingNaam, alfaGalBehandelingStappen } from "@/data/alfaGalBehandeling";
import { scanBeetplekFn } from "@/lib/beetscan.functions";
import { scanTeekFn } from "@/lib/teekscan.functions";
import { meldAanVoorOnderzoek, meldTekenbeetGemeld } from "@/lib/onderzoek.functions";
import { registreerTellingFn } from "@/lib/telling.functions";
import { slaTekenbeetRegistratieOp } from "@/lib/registratie.functions";
import { BEETPLEK_ZONDER_KENMERK, SCAN_VEILIGHEIDSZIN, SCAN_HUISARTSBOODSCHAP, type ScanResultaat } from "@/data/beetplekReferentie";
import type { TeekScanResultaat } from "@/data/teekReferentie";
import tekenbeetGidsLogo from "@/assets/tekenbeetgids-logo.png";
import TaalKnop from "@/components/TaalKnop";
import InhoudsDatum from "@/components/InhoudsDatum";
import InformatieAssistent from "@/components/InformatieAssistent";
import { maakPdf, deelOfDownloadPdf, openPdf, isIOS, isMobiel } from "@/lib/rapportPdf";


/**
 * TekenbeetGids — informatie en inzicht na een tekenbeet
 * Voor TekenRisicoKaart.nl · Dominic Smith Advies
 *
 * De toepassing ordent ingevoerde informatie en toont algemene aandachtspunten.
 * Zij stelt geen diagnose, bepaalt geen urgentie en geeft geen behandeladvies.
 */

/* ============ huisstijl: leest uit de app-tokens (STZ) ============ */
const T = {
  primair: STZ.rood, // #1D4E63
  primairDonker: STZ.tekst, // #123A52
  primairLicht: STZ.header, // #E6F1F8
  achtergrond: STZ.creme, // #F5FAFD
  lijn: "#D6E4EC",
  papier: STZ.wit,
  inkt: STZ.tekst,
  grijs: "#5A8299",
  alarm: STZ.lijn, // #A63428
  alarmLicht: "#FBEAE7",
  font: "'Helvetica Neue',Arial,sans-serif",
};

/* Vaste zin over de grens van de AI-fotoscan: vóór de scan (bevestigingsvenster),
   bij de uitkomst en in het rapport. [0] = NL, [1] = EN. */
const AI_BEPERKING = [
  "Deze AI-fotoscan vergelijkt uitsluitend zichtbare kenmerken en kan de ziekte van Lyme of een andere aandoening niet vaststellen of uitsluiten.",
  "This AI photo scan compares visible features only and can neither establish nor rule out Lyme disease or any other condition.",
];

/* ============ tekensoorten ============ */
type SoortKlasse = "ixodes" | "hard" | "zacht";
interface TekenSoort {
  id: string; naam: string; latijn: string; bijnaam?: string; klasse: SoortKlasse;
  kenmerk: string; context: string; melden?: boolean; hond?: boolean;
  kleur: string;       // zelfde kleurcode als in de Teken-tab van de app
  foto?: string;       // sleutel in TEEK_FOTO (tekenData/teekFotos)
}
const TEKENSOORTEN: TekenSoort[] = [
  {
    id: "schapenteek", naam: "Schapenteek", latijn: "Ixodes ricinus", klasse: "ixodes",
    kleur: "#1D4E63", foto: "ricinus",
    kenmerk: "Effen bruin tot zwart, zonder tekening op het schild. Larve 0,5–1 mm, nimf 1–1,5 mm, volwassen ongeveer 3 mm.",
    context: "Verreweg de meeste tekenbeten bij mensen in Nederland. Circa 1 op de 5 draagt de Borrelia-bacterie bij zich. Ook TBE, rickettsiose, anaplasmose, babesiose, neoehrlichiose en Borrelia miyamotoi lopen via deze teek.",
  },
  {
    id: "egelteek", naam: "Egelteek", latijn: "Ixodes hexagonus", klasse: "ixodes",
    kleur: "#2E7BA0", foto: "hexagonus",
    kenmerk: "Lijkt sterk op de schapenteek. Leeft in nesten van egels, vossen en marterachtigen en is het hele jaar door actief.",
    context: "Bijt mensen zelden, maar draagt vrijwel dezelfde ziekteverwekkers als de schapenteek. Het advies is daarom hetzelfde. Kwam de beet uit de tuin? Kijk dan of er een egel- of vossennest in de buurt zit.",
  },
  {
    id: "vlekkenteek", naam: "Vlekkenteek", bijnaam: "Dermacentor-teek", latijn: "Dermacentor reticulatus", klasse: "hard",
    kleur: "#6B1A9C", foto: "dermacentor",
    kenmerk: "Groter dan de schapenteek, met een opvallend gemarmerd wit-bruin schild.",
    context: "Geldt niet als overdrager van de Borrelia-bacterie, maar wel van onder meer Rickettsia. Voor honden is deze soort van belang vanwege babesiose.",
    melden: true,
  },
  {
    id: "reuzenteek", naam: "Reuzenteek", bijnaam: "Hyalomma-teek", latijn: "Hyalomma marginatum", klasse: "hard",
    kleur: "#2E7BA0", foto: "hyalomma",
    kenmerk: "Fors, 5 mm of groter, met duidelijk gestreepte poten. Jaagt actief op zijn gastheer in plaats van af te wachten.",
    context: "Zeldzaam hier; komt vooral mee met trekvogels. Kan rickettsiose overdragen. Het Krim-Congovirus is in Nederland nooit bij mens of teek vastgesteld, maar in Zuid- en Zuidoost-Europa wel. Plet zo'n teek niet.",
    melden: true,
  },
  {
    id: "hondenteek", naam: "Bruine hondenteek", latijn: "Rhipicephalus sanguineus", klasse: "hard",
    kleur: "#4A9FD4", foto: "rhipicephalus",
    kenmerk: "Roodbruin en slank. Komt niet in de Nederlandse natuur voor, maar reist mee met honden uit Zuid-Europa.",
    context: "Kiest vrijwel altijd de hond als gastheer en bijt mensen zelden. Bijzonder is dat deze soort zijn hele levenscyclus binnenshuis kan voltooien, dus een enkele vondst betekent vaak dat er meer zitten.",
    melden: true, hond: true,
  },
  {
    id: "duiventeek", naam: "Duiventeek", latijn: "Argas reflexus", klasse: "zacht",
    kleur: "#8A6A3A", foto: "argas",
    kenmerk: "Een zachte teek: plat, rondovaal en leerachtig, zonder hard schild. Leeft in duivennesten, op zolders en achter dakbeschot.",
    context: "Zuigt 's nachts kort bloed — minuten tot ongeveer een uur — en laat daarna weer los. Draagt in Nederland geen ziekten over op mensen. De klacht is de beet zelf: die kan een felle, jeukende reactie geven en soms een ernstige allergische reactie.",
  },
  {
    id: "onbekend", naam: "Weet ik niet, de teek is weggegooid", latijn: "", klasse: "ixodes",
    kleur: "#5A8299",
    kenmerk: "De teek is weggegooid, of ik heb er niet goed naar gekeken.",
    context: "Dan gaan we uit van de schapenteek. Die is verantwoordelijk voor het overgrote deel van de tekenbeten bij mensen in Nederland.",
  },
];

/* ============ provincies (klassen uit TekenRisicoKaart.nl) ============ */
type TbeStatus = "humaan" | "vondst" | "geen" | "buitenland";
interface Prov { id: string; naam: string; klasse: number | null; tbe: TbeStatus; gebied?: string }
const PROVINCIES: Prov[] = [
  { id: "gr", naam: "Groningen", klasse: 2, tbe: "geen", gebied: "Teken in veengebieden, langs de Waddenkust en in bosranden." },
  { id: "fr", naam: "Friesland", klasse: 2, tbe: "humaan", gebied: "Op Terschelling is in 2023 én 2024 TBE-virus in teken aangetoond; in 2023 werd een humane infectie aan het eiland toegeschreven." },
  { id: "dr", naam: "Drenthe", klasse: 4, tbe: "vondst", gebied: "Hoge relatieve risico-indicatie door genormaliseerde meldingen en geschikt habitat, waaronder heidevelden, hoogvenen en bossen." },
  { id: "ov", naam: "Overijssel", klasse: 4, tbe: "humaan", gebied: "Sallandse Heuvelrug (eerste Nederlandse TBE-geval, 2016) en Twente." },
  { id: "fl", naam: "Flevoland", klasse: 3, tbe: "humaan", gebied: "Het noordoosten van de Flevopolder staat bij het RIVM als waarschijnlijke besmettingsplaats van een humane TBE-melding." },
  { id: "ge", naam: "Gelderland", klasse: 4, tbe: "humaan", gebied: "Veluwe en Achterhoek; humaan geval Ermelo (2023), virus aangetoond in teken en reeën." },
  { id: "nh", naam: "Noord-Holland", klasse: 3, tbe: "humaan", gebied: "In duingebieden en het Gooi kan de lokale tekenactiviteit afwijken van de provinciale indicatie; Zandvoort werd in 2023 als waarschijnlijke besmettingsplaats genoemd." },
  { id: "ut", naam: "Utrecht", klasse: 3, tbe: "humaan", gebied: "De Utrechtse Heuvelrug is bevestigd TBE-gebied: bos en heide op zandgrond." },
  { id: "zh", naam: "Zuid-Holland", klasse: 2, tbe: "geen", gebied: "In de Hollandse duinen, de Biesbosch en op landgoederen zijn teken lokaal talrijk." },
  { id: "ze", naam: "Zeeland", klasse: 2, tbe: "vondst", gebied: "Eén bevestigde teek met TBE-virus (Wijburg et al. 2026) — eerder gold Zeeland niet als risicogebied." },
  { id: "nb", naam: "Noord-Brabant", klasse: 2, tbe: "vondst", gebied: "De Peel, Brabantse Wal en Kempen; in centraal Noord-Brabant is TBEV aangetoond in teken of reeën." },
  { id: "li", naam: "Limburg", klasse: 2, tbe: "vondst", gebied: "Zuid-Limburg met heuvelachtig boslandschap; aanwijzingen via reeënserologie of teken." },
  { id: "buitenland", naam: "In het buitenland", klasse: null, tbe: "buitenland" },
  { id: "onbekend", naam: "Weet ik niet", klasse: null, tbe: "geen" },
];

const TBE_TEKST: Record<TbeStatus, string> = {
  humaan: "Humane infectie vastgesteld of waarschijnlijke besmettingsplaats.",
  vondst: "Virus of antistoffen aangetoond in teken of wild.",
  geen: "TBE nog niet aangetoond — uitsluiting is niet mogelijk.",
  buitenland: "",
};

/* ============ klachten & bijzonderheden ============ */
interface Vink { id: string; label: string; spoed?: boolean; em?: boolean }
const KLACHTEN: Vink[] = [
  { id: "spoed_neuro", label: "Aangezichtsverlamming, dubbelzien, nekstijfheid of verwardheid", spoed: true },
  { id: "spoed_hart", label: "Hartkloppingen, duizeligheid of flauwvallen", spoed: true },
  { id: "em", label: "Een rode vlek of ring die groter wordt — rond de beet of ergens anders", em: true },
  { id: "koorts", label: "Koorts, koude rillingen of een grieperig gevoel" },
  { id: "eschar", label: "Een zwart korstje op de beetplek, of huiduitslag met vlekken" },
  { id: "zenuw", label: "Uitstralende pijn, tintelingen of krachtsverlies" },
  { id: "gewricht", label: "Een pijnlijk, gezwollen gewricht (vaak de knie)" },
  { id: "moe", label: "Ongewone vermoeidheid of malaise" },
];
const BIJZONDERHEDEN: Vink[] = [
  { id: "zwanger", label: "Zwanger" },
  { id: "kind8", label: "Kind jonger dan 8 jaar" },
  { id: "doxyallergie", label: "Overgevoelig voor doxycycline" },
  { id: "afweer", label: "Verminderde afweer of geen milt" },
];
const OMGEVING: Vink[] = [
  { id: "stedelijk", label: "Stedelijk gebied" },
  { id: "tuin", label: "Tuin" },
  { id: "park", label: "Park" },
  { id: "sportveld", label: "Sportveld" },
  { id: "recreatie", label: "Recreatiegebied" },
  { id: "natuur", label: "Natuur" },
  { id: "bos", label: "Bos" },
  { id: "duinen", label: "Duinen" },
];
const WEER: Vink[] = [
  { id: "zon", label: "Zon" },
  { id: "bewolkt", label: "Bewolkt" },
  { id: "heet", label: "Heet" },
  { id: "warm", label: "Warm" },
  { id: "koud", label: "Koud" },
  { id: "regenachtig", label: "Regenachtig" },
];
const FOTO: Vink[] = [
  { id: "beetplek", label: "Foto van beetplek" },
  { id: "teek", label: "Foto van de teek" },
];

/* Extra locatievelden per aangekruiste omgeving. Sleutel in Antwoorden.locatie:
   `${omgevingId}:${veldId}`. */
const LOC_VELDEN: Record<string, Vink[]> = {
  stedelijk: [
    { id: "straat", label: "Straatnaam" },
    { id: "plaats", label: "Plaatsnaam" },
  ],
  tuin: [
    { id: "straat", label: "Straatnaam" },
    { id: "plaats", label: "Plaatsnaam" },
  ],
  park: [
    { id: "naam", label: "Naam park" },
    { id: "straat", label: "Straatnaam" },
    { id: "plaats", label: "Plaatsnaam" },
  ],
  sportveld: [
    { id: "naam", label: "Naam sportveld" },
    { id: "straat", label: "Straatnaam" },
    { id: "plaats", label: "Plaatsnaam" },
  ],
  recreatie: [
    { id: "naam", label: "Naam recreatiegebied" },
    { id: "straat", label: "Straatnaam" },
    { id: "plaats", label: "Plaatsnaam" },
  ],
  natuur: [
    { id: "naam", label: "Naam natuurgebied" },
    { id: "straat", label: "Straatnaam" },
    { id: "plaats", label: "Plaatsnaam" },
  ],
  bos: [
    { id: "naam", label: "Naam bos" },
    { id: "straat", label: "Straatnaam" },
    { id: "plaats", label: "Plaatsnaam" },
  ],
  duinen: [
    { id: "naam", label: "Naam duingebied" },
    { id: "straat", label: "Straatnaam" },
    { id: "plaats", label: "Plaatsnaam" },
  ],
};
const LOC_EN: Record<string, string> = {
  straat: "Street name", plaats: "Town/city",
  "stedelijk:naam": "Area name", "tuin:naam": "Garden name",
  "park:naam": "Park name", "sportveld:naam": "Sports field name",
  "recreatie:naam": "Recreational area name", "natuur:naam": "Nature area name",
  "bos:naam": "Woodland name", "duinen:naam": "Dune area name",
};
const locVeldLabel = (en: boolean, omgId: string, veld: Vink) =>
  en ? (LOC_EN[`${omgId}:${veld.id}`] || LOC_EN[veld.id] || veld.label) : veld.label;

/* Foto's blijven op het toestel: ze worden alleen verkleind in het geheugen bewaard
   en meegeprint in de samenvatting. Er gaat niets naar een server. */
const MAX_FOTOS = 3;
const TOEGESTANE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"];
const MAX_BESTAND_MB = 12;
const MAX_BESTAND = MAX_BESTAND_MB * 1024 * 1024;
/* Doelgrootte per foto in de pdf: klein genoeg om te mailen/printen. */
const DOEL_BYTES = 320 * 1024;

function controleerBestand(f: File): string | null {
  const type = (f.type || "").toLowerCase();
  const isBeeld = type.startsWith("image/") && (TOEGESTANE_TYPES.includes(type) || type === "image/jpg");
  if (!isBeeld) return `Bestandstype niet toegestaan: alleen JPG, PNG of WEBP.`;
  if (f.size > MAX_BESTAND) return `Bestand te groot: maximaal ${MAX_BESTAND_MB} MB per foto.`;
  return null;
}

/* Verkleinen en comprimeren voor de pdf: max 1000 px en stapsgewijs
   lagere kwaliteit tot de foto onder de doelgrootte blijft. */
async function leesFoto(file: File): Promise<string> {
  const dataUrl = await new Promise<string>((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(String(r.result));
    r.onerror = () => rej(r.error);
    r.readAsDataURL(file);
  });
  try {
    const img = await new Promise<HTMLImageElement>((res, rej) => {
      const i = new Image();
      i.onload = () => res(i);
      i.onerror = () => rej(new Error("laden mislukt"));
      i.src = dataUrl;
    });
    let max = 1000;
    let uit = dataUrl;
    for (let ronde = 0; ronde < 3; ronde++) {
      const schaal = Math.min(1, max / Math.max(img.width, img.height));
      const c = document.createElement("canvas");
      c.width = Math.max(1, Math.round(img.width * schaal));
      c.height = Math.max(1, Math.round(img.height * schaal));
      const ctx = c.getContext("2d");
      if (!ctx) return dataUrl;
      ctx.fillStyle = "#fff";
      ctx.fillRect(0, 0, c.width, c.height);
      ctx.drawImage(img, 0, 0, c.width, c.height);
      for (const kwaliteit of [0.8, 0.68, 0.55]) {
        uit = c.toDataURL("image/jpeg", kwaliteit);
        if (uit.length * 0.75 <= DOEL_BYTES) return uit;
      }
      max = Math.round(max * 0.75);
    }
    return uit;
  } catch {
    return dataUrl;
  }
}


/* Seizoen wordt automatisch bepaald uit de datum van de beet (of vandaag). */
function bepaalSeizoen(datum: string) {
  const d = datum ? new Date(datum) : new Date();
  const m = Number.isNaN(d.getTime()) ? new Date().getMonth() + 1 : d.getMonth() + 1;
  if (m === 12 || m <= 2) return { nl: "Winter", en: "Winter" };
  if (m <= 5) return { nl: "Lente", en: "Spring" };
  if (m <= 8) return { nl: "Zomer", en: "Summer" };
  return { nl: "Herfst", en: "Autumn" };
}

/* ============ antwoorden-type ============ */
/* Behandeling per positieve testuitslag. */
export interface Behandeling {
  behandeld: string | null;   // ja | nee | onbekend
  antibiotica: string[];      // antibiotica-id's, "anders" of "onbekend"
  abAnders: string;
  duur: Record<string, { aantal: string; eenheid: string; jaar?: string }>; // per antibioticum
  ander: string | null;       // ja | nee | onbekend (ander medicijn naast antibiotica)
  middelen: { naam: string; aantal: string; eenheid: string }[];
  tbe: string | null;         // behandeling symptomen TBE: ja | nee | onbekend
  tbeMiddelen: string[];      // medicijnen bij TBE-behandeling (symptomatisch)
  exp: string | null;         // experimenteel (antiviraal) medicijn: ja | nee | onbekend
  expMiddelen: string[];      // experimentele medicijnen
  herstel: string | null;     // klachten verdwenen na behandeling: ja | deels | nee | onbekend
  opnieuw: string | null;     // opnieuw behandeld na blijvende klachten: ja | nee | onbekend
  opnieuwAantal: string;      // tijd tot de nieuwe behandeling
  opnieuwEenheid: string;     // dagen | weken | maanden
  herstel2: string | null;    // klachten na de nieuwe behandeling: ja | deels | nee | onbekend
}
const legeBehandeling = (): Behandeling => ({ behandeld: null, antibiotica: [], abAnders: "", duur: {}, ander: null, middelen: [{ naam: "", aantal: "", eenheid: "dagen" }], tbe: null, tbeMiddelen: [""], exp: null, expMiddelen: [""], herstel: null, opnieuw: null, opnieuwAantal: "", opnieuwEenheid: "dagen", herstel2: null });

/* Per eerdere tekenbeet: is er toen getest en zo ja, waarop/waarop niet/door wie/waar. */
export interface BeetTest {
  getest: string | null;      // ja | nee | onbekend
  ziekten: string[];          // ziekte-id's of "onbekend"
  wat: string[];              // bloed | liquor | anders | onbekend
  watAnders: string;
  uitslagen: Record<string, string>;       // ziekte-id -> positief | negatief
  behandelingen: Record<string, Behandeling>; // per positieve ziekte-id
  wie: string | null;         // huisarts | specialist | andere_arts | arts_buitenland | onbekend
  land: string;               // landnaam of "Weet ik niet"
  moment: string | null;      // hoe lang na de beet is getest
  herhaald: string | null;    // is de test later herhaald: ja | nee | onbekend
  em: string | null;          // was er toen een EM (rode kring): ja | nee | onbekend
  emKlachten: string | null;  // daarna meteen klachten: ja | nee | onbekend
  emBehandeld: string | null; // daarna meteen behandeld: ja | nee | onbekend
  emTijdAantal: string;       // tijd tussen EM en behandeling (aantal)
  emTijdEenheid: string;      // dagen | weken | maanden | jaren
}
const legeTest = (): BeetTest => ({ getest: null, ziekten: [], wat: [], watAnders: "", uitslagen: {}, behandelingen: {}, wie: null, land: "", moment: null, herhaald: null, em: null, emKlachten: null, emBehandeld: null, emTijdAantal: "", emTijdEenheid: "dagen" });

/* De tien tekenbeetziekten waarop in de praktijk getest wordt (CCHF komt niet in NL voor). */
const TEST_ZIEKTEN = ZIEKTEN.filter((z) => z.id !== "cchf").map((z) => ({ id: z.id, label: z.naam }));

/* Antibiotica die bij tekenbeetziekten worden voorgeschreven. */
const TBE_VACCINS: { id: string; label: string }[] = [
  { id: "fsme_immun", label: "FSME-IMMUN (TicoVac)" },
  { id: "encepur", label: "Encepur" },
];
const RISICO_BEROEPEN: { id: string; label: string }[] = [
  { id: "boswachter", label: "Boswachter / bosbouwer" },
  { id: "hovenier", label: "Hovenier / groenvoorziening" },
  { id: "jager", label: "Jager / wildbeheerder" },
  { id: "natuurbeheerder", label: "Natuur- of landschapsbeheerder" },
  { id: "landbouw", label: "Land- of tuinbouw" },
  { id: "veehouder", label: "Veehouder / veeverzorger" },
  { id: "dierenarts", label: "Dierenarts / dierenverzorger" },
  { id: "militair", label: "Militair" },
  { id: "gids", label: "Excursiegids / buitensportbegeleider" },
];
const EENHEDEN = (en: boolean) => [
  { id: "dagen", label: en ? "days" : "dagen" },
  { id: "weken", label: en ? "weeks" : "weken" },
  { id: "maanden", label: en ? "months" : "maanden" },
];
const ziekteNaam = (id: string) => ZIEKTEN.find((z) => z.id === id)?.naam ?? id;
/* Ziekten met een positieve testuitslag (bepaalt de behandelvragen). */
const positieveZiekten = (t?: BeetTest): string[] =>
  t && t.getest === "ja" ? t.ziekten.filter((z) => z !== "onbekend" && t.uitslagen[z] === "positief") : [];

const LANDEN = [
  "Nederland", "België", "Duitsland", "Frankrijk", "Luxemburg", "Verenigd Koninkrijk", "Ierland",
  "Oostenrijk", "Zwitserland", "Italië", "Spanje", "Portugal", "Griekenland", "Kroatië", "Slovenië",
  "Tsjechië", "Slowakije", "Hongarije", "Polen", "Denemarken", "Zweden", "Noorwegen", "Finland",
  "Estland", "Letland", "Litouwen", "Roemenië", "Bulgarije", "Turkije", "Verenigde Staten", "Canada",
  "Marokko", "Indonesië", "Suriname", "Curaçao", "Aruba", "Australië", "Nieuw-Zeeland",
  "China", "Japan", "Zuid-Afrika", "Brazilië", "India", "Thailand",
];

/* Extra vragen over de beet zelf, de verwijdering en het beloop. */
const LICHAAMSDELEN: { id: string; label: string }[] = [
  { id: "hoofd", label: "Hoofd, gezicht of oor" },
  { id: "hals", label: "Hals of nek" },
  { id: "romp", label: "Romp (borst, buik of rug)" },
  { id: "oksel", label: "Oksel" },
  { id: "arm", label: "Arm of hand" },
  { id: "lies", label: "Lies, geslachtsdeel of bilnaad" },
  { id: "been", label: "Been of knieholte" },
  { id: "voet", label: "Voet of enkel" },
];
const WIE_VERWIJDERD: { id: string; label: string }[] = [
  { id: "zelf", label: "Ikzelf" },
  { id: "naaste", label: "Partner, familielid of bekende" },
  { id: "huisarts", label: "Huisarts of praktijkondersteuner" },
  { id: "andere_zorg", label: "Andere zorgverlener (apotheek, EHBO, ziekenhuis)" },
  { id: "onbekend", label: "Weet ik niet" },
];
const HOE_VERWIJDERD: { id: string; label: string }[] = [
  { id: "tekenpincet", label: "Tekenpincet of puntig pincet" },
  { id: "tekenkaart", label: "Tekenkaart, tekenlasso of tekenhaak" },
  { id: "nagels", label: "Met de nagels of vingers" },
  { id: "middel", label: "Met een middel erop (olie, alcohol, zeep of vuur)" },
  { id: "vanzelf", label: "De teek liet zelf los" },
  { id: "onbekend", label: "Weet ik niet" },
];
const RESTANT: { id: string; label: string }[] = [
  { id: "nee", label: "Nee, de teek kwam er in zijn geheel uit" },
  { id: "ja", label: "Ja, er bleef een stukje (kopje of monddelen) achter" },
  { id: "onbekend", label: "Weet ik niet" },
];
const TEEK_BEWAARD: { id: string; label: string }[] = [
  { id: "bewaard", label: "Bewaard (bijvoorbeeld in een zakje of potje)" },
  { id: "ingestuurd", label: "Ingestuurd of laten onderzoeken" },
  { id: "weggegooid", label: "Weggegooid" },
  { id: "kwijt", label: "Kwijtgeraakt of nooit gezien" },
  { id: "onbekend", label: "Weet ik niet" },
];
const KLACHTEN_DUUR: { id: string; label: string }[] = [
  { id: "dagen", label: "Korter dan een week" },
  { id: "weken", label: "1 tot 4 weken" },
  { id: "maanden", label: "1 tot 6 maanden" },
  { id: "lang", label: "Langer dan 6 maanden" },
  { id: "onbekend", label: "Weet ik niet" },
];
const ARTS_CONTACT: { id: string; label: string }[] = [
  { id: "nee", label: "Nee, nog geen contact gehad" },
  { id: "huisarts", label: "Ja, huisarts" },
  { id: "hap", label: "Ja, huisartsenpost of spoedeisende hulp" },
  { id: "specialist", label: "Ja, specialist in het ziekenhuis" },
  { id: "anders", label: "Ja, andere zorgverlener" },
];
const TEST_MOMENT: { id: string; label: string }[] = [
  { id: "binnen2", label: "Binnen 2 weken na de tekenbeet" },
  { id: "2tot6", label: "2 tot 6 weken na de tekenbeet" },
  { id: "6tot12", label: "6 weken tot 3 maanden na de tekenbeet" },
  { id: "later", label: "Langer dan 3 maanden na de tekenbeet" },
  { id: "onbekend", label: "Weet ik niet" },
];

/* Locatie van een eerdere tekenbeet: Nederland (provincie + plaats) of buitenland (land + plaats). */
type BeetLocatie = { nederland: string | null; provincie: string; plaats: string; land: string; landPlaats: string };
const legeBeetLocatie = (): BeetLocatie => ({ nederland: null, provincie: "", plaats: "", land: "", landPlaats: "" });

interface AbKuur { soort: string; soortAnders: string; aandoening: string; jaar: string; duurAantal: string; duurEenheid: string }
const legeAbKuur = (): AbKuur => ({ soort: "", soortAnders: "", aandoening: "", jaar: "", duurAantal: "", duurEenheid: "dagen" });
interface Antwoorden {
  vast: string | null; soort: string | null; uiterlijk: string | null;
  duur: string | null; verwijderd: string | null; provincie: string | null;
  omgeving: string[]; weer: string[]; foto: string[];
  beelden: { beetplek: string[]; teek: string[] };
  klachten: string[]; bijzonder: string[]; datum: string;
  locatie: Record<string, string>;
  scan: ScanResultaat | null;
  teekScan: TeekScanResultaat | null;
  lichaamsdeel: string[]; wieVerwijderd: string | null; hoeVerwijderd: string | null;
  restant: string | null; teekBewaard: string | null;
  klachtenDuur: string | null; artsContact: string | null;
  /* Vraag direct na de tussentijdse rapportage: was er een EM (rode kring)? */
  emHuidig: string | null;
  /* Handmatige EM-vraag direct na de beetplekstap zonder AI-scan: ja | nee | onbekend. */
  emManueel: string | null;
  eerste: string | null; aantalBeten: string; beetDatums: string[];
  beetLocaties: BeetLocatie[];
  testen: BeetTest[];
  abTussen: string | null; abTussenSoort: string; abTussenSoortAnders: string;
  abTussenAandoening: string; abTussenJaar: string; abTussenDuurAantal: string; abTussenDuurEenheid: string;
  /* Extra antibiotica-kuren tussendoor (herhaalbaar blok). abTussenNog[k] = antwoord op
     "Had u nog een behandeling met antibiotica?" na kuur k (0 = de eerste kuur hierboven). */
  abTussenExtra: AbKuur[]; abTussenNog: (string | null)[];
  tbeVaccin: string | null; tbeVaccinWelk: string; tbeVaccinAnders: string;
  risicoBeroep: string | null;
  leeftijd: string; geslacht: string | null; woonplaats: string;
  afkomst: string | null; nationaliteit: string | null; nationaliteitAnders: string;
  opleiding: string | null;
  huisdieren: string | null;   // hond, kat etc.: ja | nee
  hobbydieren: string | null;  // konijnen, kippen, duiven, geiten, schapen, pony's/paarden etc.: ja | nee
}
const leeg = (): Antwoorden => ({ vast: null, soort: null, uiterlijk: null, duur: null, verwijderd: null, provincie: null, omgeving: [], weer: [], foto: [], beelden: { beetplek: [], teek: [] }, klachten: [], bijzonder: [], datum: "", locatie: {}, scan: null, teekScan: null, lichaamsdeel: [], wieVerwijderd: null, hoeVerwijderd: null, restant: null, teekBewaard: null, klachtenDuur: null, artsContact: null, emHuidig: null, emManueel: null, eerste: null, aantalBeten: "", beetDatums: [], beetLocaties: [], testen: [], abTussen: null, abTussenSoort: "", abTussenSoortAnders: "", abTussenAandoening: "", abTussenJaar: "", abTussenDuurAantal: "", abTussenDuurEenheid: "dagen", abTussenExtra: [], abTussenNog: [], tbeVaccin: null, tbeVaccinWelk: "", tbeVaccinAnders: "", risicoBeroep: null, leeftijd: "", geslacht: null, woonplaats: "", afkomst: null, nationaliteit: null, nationaliteitAnders: "", opleiding: null, huisdieren: null, hobbydieren: null });


/* Herhaalbaar blok: na elke antibiotica-kuur tussendoor volgt "Had u nog een behandeling?" —
   bij "ja" komt er een extra soort- en aandoeningvraag bij. */
function abTussenStappen(a: Antwoorden): string[] {
  const stappen = ["ab_tussen_soort", "ab_tussen_aandoening", "ab_tussen_jaar", "ab_tussen_duur", "ab_tussen_nog"];
  for (let i = 0; i < a.abTussenExtra.length; i++) {
    if (a.abTussenNog[i] !== "ja") break;
    stappen.push(`ab_tussen_soort_x${i}`, `ab_tussen_aandoening_x${i}`, `ab_tussen_jaar_x${i}`, `ab_tussen_duur_x${i}`, `ab_tussen_nog_x${i}`);
  }
  return stappen;
}

/* ============ beslisboom ============ */
interface Advies { toon: "spoed" | "urgent" | "overleg" | "afwachten"; titel: string; tekst: string; keuze?: boolean; zacht?: boolean }
function bepaalAdvies(a: Antwoorden): Advies {
  const k = a.klachten;
  const soort = TEKENSOORTEN.find((t) => t.id === a.soort);
  const spoed = k.includes("spoed_neuro") || k.includes("spoed_hart");
  const em = k.includes("em");
  const overig = ["koorts", "eschar", "zenuw", "gewricht", "moe"].some((x) => k.includes(x));
  const langVast = a.duur === "lang" || (a.duur === "onbekend" && a.uiterlijk === "bol");
  const venster = a.verwijderd === "binnen" || a.verwijderd === "onbekend";
  const klasse = soort ? soort.klasse : "ixodes";

  if (spoed)
    return { toon: "spoed", titel: "Aandachtspunten bij de vastgelegde klachten",
      tekst: "U hebt klachten vastgelegd die belangrijk zijn om met een arts te bespreken. TekenbeetGids kan de oorzaak of ernst daarvan niet beoordelen. Bij een levensbedreigende situatie belt u 112." };
  if (em)
    return { toon: "urgent", titel: "Aandachtspunt: groter wordende rode vlek of ring",
      tekst: "U hebt een groter wordende rode vlek of ring vastgelegd. Een digitale vragenlijst kan de oorzaak niet vaststellen. Noteer de afmetingen, maak een foto met een muntstuk ernaast en bespreek de verandering bij twijfel met uw huisarts." };
  if (overig)
    return { toon: "urgent", titel: "Aandachtspunten bij klachten na een tekenbeet",
      tekst: "U hebt één of meer klachten vastgelegd. Zulke klachten kunnen verschillende oorzaken hebben; TekenbeetGids beoordeelt niet welke oorzaak van toepassing is. Bewaar uw overzicht en bespreek uw situatie bij twijfel met uw huisarts." };
  if (klasse === "zacht")
    return { toon: "afwachten", zacht: true, titel: "Informatie over de vastgelegde tekensoort",
      tekst: "U hebt een duiventeek vastgelegd. Deze soort leeft vaak bij duivennesten en kan een plaatselijke huidreactie geven. TekenbeetGids kan een individuele reactie niet beoordelen; leg veranderingen vast en bespreek zorgen met uw huisarts." };
  if (klasse === "hard")
    return { toon: "afwachten", titel: "Informatie over de vastgelegde tekensoort",
      tekst: "U hebt een harde tekensoort vastgelegd. De soortherkenning en fotovergelijking zijn indicatief en kunnen fouten bevatten. Noteer veranderingen van de beetplek en bespreek klachten of twijfel met uw huisarts." };
  if (langVast && venster)
    return { toon: "overleg", titel: "Aandachtspunt: duur en moment van verwijderen",
      tekst: "U hebt vastgelegd dat de teek mogelijk 24 uur of langer vastzat en minder dan 72 uur geleden is verwijderd. Deze tijden kunnen relevant zijn in een gesprek met uw huisarts. TekenbeetGids bepaalt niet welke medische vervolgstap passend is." };
  if (langVast)
    return { toon: "afwachten", titel: "Aandachtspunt: teek langer vastgelegd",
      tekst: "U hebt vastgelegd dat de teek mogelijk 24 uur of langer vastzat. Bewaar de datum, foto's en andere gegevens in uw overzicht. Bespreek klachten, huidveranderingen of vragen met uw huisarts." };
  return { toon: "afwachten", titel: "Overzicht van uw vastgelegde situatie",
    tekst: "U hebt vastgelegd dat de teek korter dan 24 uur vastzat en dat u geen klachten hebt geselecteerd. Dit tijdsgegeven is relevante context, maar 24 uur is geen harde veilige grens. Dit overzicht is algemene informatie en geen individuele risicobeoordeling. Leg veranderingen vast en bespreek vragen met uw huisarts." };
}

/* ============ algemene informatie per vastgelegd profiel ============ */
export interface Tip { kop: string; tekst: string }

/* Neutrale registratie-informatie op basis van leeftijd, beroep, eerdere behandeling en TBE-vaccinatie. */
function persoonlijkeTips(a: Antwoorden, en: boolean): Tip[] {
  const tips: Tip[] = [];
  const leeftijd = Number.parseInt(a.leeftijd, 10);

  if (Number.isFinite(leeftijd)) {
    tips.push({
      kop: en ? "Age recorded" : "Leeftijd vastgelegd",
      tekst: en
        ? "Age can be useful context when discussing a tick bite with a doctor. Tick Bite Guide does not use it to assess a condition, urgency or treatment."
        : "Leeftijd kan relevante context zijn wanneer u een tekenbeet met een arts bespreekt. TekenbeetGids gebruikt dit gegeven niet om een aandoening, urgentie of behandeling vast te stellen.",
    });
  }

  if (a.risicoBeroep && a.risicoBeroep !== "nee" && a.risicoBeroep !== "onbekend") {
    const beroep = RISICO_BEROEPEN.find((x) => x.id === a.risicoBeroep)?.label ?? a.risicoBeroep;
    tips.push({
      kop: en ? "Outdoor work recorded" : "Buitenberoep vastgelegd",
      tekst: en
        ? `You recorded ${beroep.toLowerCase()} as your occupation. Regular tick checks after work in green surroundings are general preventive information.`
        : `U hebt ${beroep.toLowerCase()} als beroep vastgelegd. Regelmatige tekencontroles na werk in het groen zijn algemene preventieve informatie.`,
    });
  }

  if (a.tbeVaccin) {
    tips.push({
      kop: en ? "TBE vaccination status recorded" : "TBE-vaccinatiestatus vastgelegd",
      tekst: en
        ? "Your stated TBE vaccination status is included in the personal record. Questions about vaccination belong with your GP or public health service."
        : "Uw opgegeven TBE-vaccinatiestatus staat in het persoonlijke overzicht. Vragen over vaccinatie horen bij uw huisarts of de GGD.",
    });
  }

  if (a.testen.some((test) => test.getest === "ja") || a.abTussen === "ja") {
    tips.push({
      kop: en ? "Earlier tests and medicines recorded" : "Eerdere tests en medicijnen vastgelegd",
      tekst: en
        ? "The tests, results and medicines you entered are listed factually in the record. A doctor can interpret them in their medical context."
        : "De ingevulde tests, uitslagen en medicijnen staan feitelijk in het overzicht. Een arts kan deze in hun medische context beoordelen.",
    });
  }

  return tips;
}

/* ============ hulpteksten ============ */
const TITEL: Record<string, string> = {
  eerste: "Heeft u eerder een tekenbeet gehad?",
  aantal: "Hoe vaak bent u door een teek gebeten?",
  vast: "Zit de teek nog vast in de huid?",
  verwijderen: "Verwijder de teek eerst",
  scan: "Scan de beetplek",
  em_manueel: "Rode vlek",
  soort: "Welke teek was het?",
  uiterlijk: "Hoe vol zat de teek?",
  scan_teek: "Scan de teek",
  duur: "Hoe lang zat de teek vast?",
  verwijderd: "Wanneer is de teek verwijderd?",
  provincie: "Waar bent u gebeten?",
  omgeving: "In wat voor omgeving bent u gebeten?",
  weer: "Wat voor weer was het?",
  foto: "Heeft u foto's gemaakt?",
  lichaamsdeel: "Waar op het lichaam zat de teek?",
  wie_verwijderd: "Wie heeft de teek verwijderd?",
  hoe_verwijderd: "Hoe is de teek verwijderd?",
  restant: "Is er een deel van de teek achtergebleven?",
  em_nu: "Uitkomst tussentijdse rapportage",
  teek_bewaard: "Wat is er met de teek gebeurd?",
  klachten: "Heeft u klachten sinds de beet?",
  klachten_duur: "Hoe lang heeft u deze klachten al?",
  arts: "Heeft u over deze tekenbeet al contact gehad met een arts?",
  bijzonder: "Zijn er nog bijzonderheden?",
  ab_tussen: "Heeft u in de tussenliggende periode van toen tot nu voor een andere aandoening antibiotica voorgeschreven gekregen?",
  ab_tussen_soort: "Wat voor soort antibiotica heeft u gekregen?",
  ab_tussen_aandoening: "Voor wat voor aandoening kreeg u deze antibiotica?",
  ab_tussen_jaar: "In welk jaar kreeg u deze antibiotica?",
  ab_tussen_duur: "Hoe lang duurde deze antibioticakuur?",
  ab_tussen_nog: "Had u nog een behandeling met antibiotica?",
  tbe_vaccin: "Bent u gevaccineerd voor TBE?",
  tbe_vaccin_welk: "Welk vaccin heeft u gekregen?",
  leeftijd: "Wat is uw leeftijd?",
  geslacht: "Wat is uw geslacht?",
  woonplaats: "Wat is uw woonplaats?",
  afkomst: "Wat is uw afkomst (etnische achtergrond)?",
  nationaliteit: "Wat is uw nationaliteit?",
  opleiding: "Wat is uw hoogst genoten opleidingsniveau?",
  risico_beroep: "Werkt u in één van de risicoberoepen (met een verhoogde kans om tekenbeten op te lopen)?",
  huisdieren: "Heeft u huisdieren (hond, kat etc.)?",
  hobbydieren: "Heeft u hobbydieren (konijnen, kippen, duiven, geiten, schapen, pony’s / paarden, etc.)?",
};
const UITLEG: Record<string, string> = {
  eerste: "Dit helpt bij het landelijke onderzoek naar tekenbeten.",
  aantal: "Tel ook eerdere tekenbeten mee, dus ook deze beet.",
  vast: "Verwijder een teek altijd zo snel mogelijk. Snelle verwijdering verkleint de kans op overdracht van Borrelia, maar geeft geen garantie dat overdracht niet heeft plaatsgevonden.",
  verwijderen: "Volg deze stappen en ga daarna verder met de vragen.",
  scan: "Maak of upload een foto van de beetplek. Foto's blijven lokaal op uw apparaat, tenzij u expliciet kiest voor een AI-scan. Bij een AI-scan wordt de foto via onze server doorgestuurd naar een externe AI-dienst voor verwerking. De foto wordt niet door ons opgeslagen, niet toegevoegd aan het onderzoeksbestand en wordt door ons niet gebruikt voor het trainen van AI-modellen. De uitkomst beschrijft alleen zichtbare kenmerken; zij stelt geen aandoening of urgentie vast en geeft geen medisch advies.",
  em_manueel: "Ziet u een rode vlek op of rond de beetplek? Uw antwoord wordt alleen in uw overzicht opgenomen. De gids stelt niet vast waardoor de vlek is ontstaan.",
  soort: "In Nederland komen zo'n vijftien soorten voor; deze zes bijten mensen. Kies wat het meest lijkt op wat u zag — twijfelt u of is de teek weggegooid, kies dan \"weet ik niet, de teek is weggegooid\".",
  uiterlijk: "Hoe vol een teek is kan een aanwijzing geven voor de aanhechtingsduur, maar bepaalt die niet precies.",
  scan_teek: "Maak of upload een foto van de verwijderde teek. Foto's blijven lokaal op uw apparaat, tenzij u expliciet kiest voor een AI-scan. Bij een AI-scan wordt de foto via onze server doorgestuurd naar een externe AI-dienst voor verwerking. De foto wordt niet door ons opgeslagen, niet toegevoegd aan het onderzoeksbestand en wordt door ons niet gebruikt voor het trainen van AI-modellen. De uitkomst is een visuele soortvergelijking en geen medische beoordeling.",
  duur: "Noteer hoe lang de teek volgens u vastzat. Een schatting is voldoende; kies bij twijfel “Weet ik niet”. De gids registreert dit tijdsgegeven zonder er een medische beoordeling aan te verbinden.",
  verwijderd: "De datum en tijd van verwijdering zijn nuttig voor uw eigen overzicht. Een arts kan deze informatie gebruiken om uw situatie te beoordelen.",
  provincie: "Teken komen in alle provincies voor, ook in tuinen, parken en duinen. De provincie verandert het advies niet, maar geeft wel context uit de kaart.",
  omgeving: "Kruis alles aan wat van toepassing is. Dit helpt de huisarts en de monitoring om de beet in context te plaatsen.",
  weer: "Kruis alles aan wat van toepassing is. Het seizoen wordt automatisch toegevoegd op basis van de datum.",
  foto: "Foto's zijn waardevol voor uw huisarts en voor uw eigen dossier. Kruis aan wat u hebt gemaakt.",
  lichaamsdeel: "Kruis alles aan wat van toepassing is. Teken kruipen naar warme, vochtige plekken: lies, oksel, knieholte, bilnaad en bij kinderen vaak hoofd en hals. Op die plekken worden beten later ontdekt, waardoor de teek langer vastzit.",
  wie_verwijderd: "Deze vraag helpt onderzoekers inzicht te krijgen in hoe teken in de praktijk worden verwijderd. Uw antwoord wordt alleen voor onderzoek opgeslagen als u daarvoor toestemming geeft.",
  hoe_verwijderd: "Pak de teek zo dicht mogelijk bij de huid met een puntig pincet of geschikt tekenhulpmiddel en trek hem rustig uit de huid. Gebruik vóór het verwijderen geen olie, alcohol, zeep of vuur. Reinig de beetplek en het hulpmiddel zo nodig na het verwijderen met 70% alcohol of povidonjodium.",
  restant: "Leg vast of u na het verwijderen nog een stukje van de teek zag. Deze vragenlijst kan niet bepalen wat een zichtbaar stukje is of welke zorg nodig is.",
  em_nu: "Dit overzicht beschrijft een rode vlek op basis van uw antwoorden of de fotovergelijking. De gids stelt geen EM of andere aandoening vast en sluit deze niet uit.",
  teek_bewaard: "Een bewaarde teek kan later helpen bij het bepalen van de soort. Onderzoek van de teek zelf zegt niets over de vraag of u besmet bent — de uitslag verandert het advies daarom niet.",
  klachten: "Kruis alles aan wat van toepassing is.",
  klachten_duur: "Leg vast hoe lang u de klachten hebt. Dit is een tijdsgegeven voor uw eigen overzicht; de gids beoordeelt de oorzaak of ernst niet.",
  arts: "Zo weet u huisarts wat er al is gedaan, en telt het mee in het onderzoek naar de zorg na een tekenbeet.",
  bijzonder: "Dit bepaalt welk middel de huisarts eventueel kan voorschrijven.",
  ab_tussen: "Antibiotica voor een andere aandoening (bijvoorbeeld een blaasontsteking of longontsteking) kunnen invloed hebben op klachten en testuitslagen. Daarom vragen we dit apart.",
  ab_tussen_soort: "Kies het antibioticum dat de arts heeft voorgeschreven. Staat het er niet bij, kies dan \"Anders, namelijk\".",
  ab_tussen_aandoening: "Bijvoorbeeld een blaasontsteking, keelontsteking of huidinfectie. Weet u het niet meer, kies dan \"Weet ik niet\".",
  ab_tussen_jaar: "Een schatting is goed genoeg. Weet u het niet meer, laat het veld dan leeg en ga verder.",
  ab_tussen_duur: "Vul in hoeveel dagen, weken of maanden de kuur duurde. Weet u het niet meer, laat het aantal dan leeg.",
  ab_tussen_nog: "Denk aan elke aparte kuur die u in de tussenliggende periode heeft gehad, ook voor een andere aandoening.",
  tbe_vaccin: "TBE (tekenencefalitis) kan worden voorkomen met een vaccin. Deze gegevens helpen bij het landelijke onderzoek naar tekenbeten.",
  tbe_vaccin_welk: "Kies het vaccin dat u heeft gekregen. Staat het er niet bij, kies dan \"Anders, namelijk\".",
  leeftijd: "Deze gegevens helpen bij het landelijke onderzoek naar tekenbeten. U bent niet verplicht ze in te vullen.",
  geslacht: "Deze gegevens helpen bij het landelijke onderzoek naar tekenbeten.",
  woonplaats: "Vul een postcode of plaatsnaam in.",
  afkomst: "Deze gegevens helpen bij het landelijke onderzoek naar tekenbeten.",
  nationaliteit: "Deze gegevens helpen bij het landelijke onderzoek naar tekenbeten.",
  opleiding: "Deze gegevens helpen bij het landelijke onderzoek naar tekenbeten.",
  risico_beroep: "Sommige beroepen brengen u vaker in gebieden met teken, zoals bossen en weilanden. Kies uw beroep of kies \"Nee\" of \"Weet ik niet\".",
  huisdieren: "Huisdieren kunnen teken mee naar binnen nemen. Deze gegevens helpen bij het landelijke onderzoek naar tekenbeten.",
  hobbydieren: "Dieren in de tuin of wei komen vaak in gebieden waar teken leven. Deze gegevens helpen bij het landelijke onderzoek naar tekenbeten.",
};

const LOGBOEK_UITLEG_EN: Record<string, string> = {
  verwijderd: "The date and time of removal are useful for your own record. A doctor can use this information to assess your situation.",
  wie_verwijderd: "This question helps researchers understand how ticks are removed in practice. Your answer is stored for research only if you consent.",
  duur: "Record how long you think the tick was attached. An estimate is sufficient; choose ‘Don’t know’ if unsure. The guide records this time without making a medical assessment.",
  restant: "Record whether you saw a fragment of the tick after removal. This questionnaire cannot determine what a visible fragment is or what care is needed.",
  klachten_duur: "Record how long you have had the symptoms. This is a time entry for your own record; the guide does not assess the cause or severity.",
  scan: "Take or upload a photo of the bite site. Photos stay local on your device unless you explicitly choose an AI scan. With an AI scan, the photo is sent via our server to an external AI service for processing. The photo is not stored by us, not added to the research dataset and not used by us to train AI models. The result describes visible features only; it does not identify a condition or urgency and provides no medical advice.",
  scan_teek: "Take or upload a photo of the removed tick. Photos stay local on your device unless you explicitly choose an AI scan. With an AI scan, the photo is sent via our server to an external AI service for processing. The photo is not stored by us, not added to the research dataset and not used by us to train AI models. The result is a visual species comparison, not a medical assessment.",
};

const optieLabel = (lijst: { id: string; label: string }[], id: string | null, en = false) => {
  if (!id) return null;
  const label = lijst.find((x) => x.id === id)?.label ?? id;
  return vertaalTekst(label, en);
};

function naamVanSoort(t: TekenSoort) {
  const basis = t.bijnaam ? `${t.naam} (${t.bijnaam})` : t.naam;
  return t.latijn ? `${basis} · ${t.latijn}` : basis;
}
function samenvattingDelen(a: Antwoorden) {
  const en = leesTaal() === "en";
  const p = PROVINCIES.find((x) => x.id === a.provincie);
  const t = TEKENSOORTEN.find((x) => x.id === a.soort);
  const kl = !a.klachten.length || a.klachten.includes("geen")
    ? (en ? "none" : "geen")
    : a.klachten.map((id) => vertaalTekst(KLACHTEN.find((k) => k.id === id)?.label ?? id, en)).join("; ");
  const bz = a.bijzonder.length && !a.bijzonder.includes("geen")
    ? a.bijzonder.map((id) => BIJZONDERHEDEN.find((b) => b.id === id)?.label).join("; ")
    : null;
  const duurMap = en
    ? ({ kort: "less than 24 hours", lang: "24 hours or longer" } as Record<string, string>)
    : ({ kort: "korter dan 24 uur", lang: "24 uur of langer" } as Record<string, string>);
  const verwMap = en
    ? ({ binnen: "less than 72 hours ago", buiten: "more than 72 hours ago" } as Record<string, string>)
    : ({ binnen: "minder dan 72 uur geleden", buiten: "langer dan 72 uur geleden" } as Record<string, string>);
  const uiterlijkMap = en
    ? ({ plat: "small and flat", bol: "round and engorged", onbekend: "unknown" } as Record<string, string>)
    : ({ plat: "klein en plat", bol: "bol en volgezogen", onbekend: "onbekend" } as Record<string, string>);
  const onbekend = en ? "unknown" : "onbekend";
  const omgevingEn: Record<string, string> = { stedelijk: "Urban area", tuin: "Garden", park: "Park", sportveld: "Sports field", recreatie: "Recreational area", natuur: "Nature", bos: "Woodland", duinen: "Dunes" };
  const weerEn: Record<string, string> = { zon: "Sunny", bewolkt: "Cloudy", heet: "Hot", warm: "Warm", koud: "Cold", regenachtig: "Rainy" };
  const omg = a.omgeving.length
    ? a.omgeving.map((id) => (en ? omgevingEn[id] : OMGEVING.find((o) => o.id === id)?.label)).filter(Boolean).join("; ")
    : null;
  const loc = a.omgeving
    .flatMap((omgId) => (LOC_VELDEN[omgId] || [])
      .map((veld) => {
        const v = (a.locatie[`${omgId}:${veld.id}`] || "").trim();
        return v ? `${locVeldLabel(en, omgId, veld)}: ${v}` : null;
      })
      .filter(Boolean))
    .join("; ");
  const wr = a.weer.length
    ? a.weer.map((id) => (en ? weerEn[id] : WEER.find((o) => o.id === id)?.label)).filter(Boolean).join("; ")
    : null;
  const fotoEn: Record<string, string> = { beetplek: "Photo of bite site", teek: "Photo of tick" };
  const ft = a.foto.length
    ? a.foto.map((id) => (en ? fotoEn[id] : FOTO.find((o) => o.id === id)?.label)).filter(Boolean).join("; ")
    : null;
  const seizoen = bepaalSeizoen(a.datum);
  const titel = en ? "Tick bite — personal record" : "Tekenbeet — persoonlijk overzicht";
  const risicoLabel = en ? "tick risk" : "tekenrisico";
  const eerderRegels = [
    a.eerste ? `${en ? "Earlier tick bite(s)" : "Eerder een tekenbeet gehad"}: ${({ ja: en ? "Yes" : "Ja", nee: en ? "No" : "Nee", onbekend: en ? "Don't know" : "Weet ik niet" } as Record<string, string>)[a.eerste] || a.eerste}` : null,
    a.aantalBeten ? `${en ? "Number of tick bites" : "Aantal tekenbeten"}: ${a.aantalBeten}` : null,
    ...a.beetDatums.filter((d) => d && d.split("-")[0] && d.split("-")[1]).map((d, i) => `${en ? (i === 0 ? "First tick bite" : `Tick bite ${i + 1}`) : (i === 0 ? "Eerste tekenbeet" : `Tekenbeet ${i + 1}`)}: ${d}`),
    ...a.beetLocaties.map((loc, i) => {
      if (!loc?.nederland) return null;
      const lbl = en ? (i === 0 ? "First tick bite" : `Tick bite ${i + 1}`) : (i === 0 ? "Eerste tekenbeet" : `Tekenbeet ${i + 1}`);
      const txt = loc.nederland === "ja"
        ? `${en ? "Yes" : "Ja"} — ${loc.provincie}${loc.plaats.trim() ? `, ${loc.plaats.trim()}` : ""}`
        : loc.nederland === "nee"
          ? `${en ? "No, abroad" : "Nee, in het buitenland"} — ${loc.land}${loc.landPlaats.trim() ? `, ${loc.landPlaats.trim()}` : ""}`
          : (en ? "Don't know" : "Weet ik niet");
      return `${lbl} — ${en ? "bitten in the Netherlands" : "toen in Nederland gebeten"}: ${txt}`;
    }).filter(Boolean),
    ...a.testen.flatMap((t, i) => {
      if (!t.getest) return [];
      const lbl = en ? (i === 0 ? "First tick bite" : `Tick bite ${i + 1}`) : (i === 0 ? "Eerste tekenbeet" : `Tekenbeet ${i + 1}`);
      const jnMap = en ? ({ ja: "Yes", nee: "No", onbekend: "Don't know" } as Record<string, string>) : ({ ja: "Ja", nee: "Nee", onbekend: "Weet ik niet" } as Record<string, string>);
      const regels = [`${lbl} — ${en ? "tested at the time" : "toen getest"}: ${jnMap[t.getest] || t.getest}`];
      if (t.getest === "ja") {
        const z = t.ziekten.length ? t.ziekten.map((id) => id === "onbekend" ? (en ? "Don't know" : "Weet ik niet") : ZIEKTEN.find((x) => x.id === id)?.naam).filter(Boolean).join("; ") : null;
        if (z) regels.push(`${lbl} — ${en ? "tested for" : "waarop getest"}: ${z}`);
        const w = t.wat.length ? t.wat.map((id) => id === "anders" && t.watAnders.trim() ? `${en ? "Other" : "Anders"}: ${t.watAnders.trim()}` : ({ bloed: en ? "Blood" : "Bloed", liquor: "Liquor", anders: en ? "Other" : "Anders", onbekend: en ? "Don't know" : "Weet ik niet" } as Record<string, string>)[id]).filter(Boolean).join("; ") : null;
        if (w) regels.push(`${lbl} — ${en ? "what was tested" : "wat is getest"}: ${w}`);
        if (t.moment) regels.push(`${lbl} — ${en ? "time between bite and test" : "moment van testen"}: ${optieLabel(TEST_MOMENT, t.moment, en)}`);
        if (t.herhaald) regels.push(`${lbl} — ${en ? "test repeated later" : "test later herhaald"}: ${jnMap[t.herhaald] || t.herhaald}`);
        const uit = Object.entries(t.uitslagen || {}).map(([id, u]) => `${ziekteNaam(id)}: ${u === "positief" ? (en ? "positive" : "positief") : (en ? "negative" : "negatief")}`).join("; ");
        if (uit) regels.push(`${lbl} — ${en ? "test results" : "uitslag test"}: ${uit}`);
        for (const zid of positieveZiekten(t)) {
          const b = t.behandelingen[zid];
          if (!b || !b.behandeld) continue;
          const eenh = (u: string) => (en ? ({ dagen: "days", weken: "weeks", maanden: "months" } as Record<string, string>)[u] ?? u : u);
          regels.push(`${lbl} — ${ziekteNaam(zid)}: ${en ? "treated" : "behandeld"}: ${jnMap[b.behandeld] || b.behandeld}`);
          if (b.behandeld === "ja") {
            if (zid === "alfagal") {
              const maatregelen = b.middelen.filter((m) => m.naam.trim()).map((m) => alfaGalBehandelingNaam(m.naam, en)).join("; ");
              if (maatregelen) regels.push(`${lbl} — ${ziekteNaam(zid)}: ${en ? "recorded treatment or measures" : "vastgelegde behandeling of maatregelen"}: ${maatregelen}`);
              continue;
            }
            const ab = b.antibiotica.map((id) => {
              if (id === "onbekend") return en ? "Don't know" : "Weet ik niet";
              const naam = id === "anders" ? (b.abAnders.trim() || (en ? "Other" : "Anders")) : antibioticumNaam(id, en);
              const d = b.duur[id];
              return d && d.aantal ? `${naam} (${d.aantal} ${eenh(d.eenheid)}${d.jaar ? `, ${d.jaar}` : ""})` : naam;
            }).join("; ");
            if (ab) regels.push(`${lbl} — ${ziekteNaam(zid)}: ${en ? "antibiotics" : "antibiotica"}: ${ab}`);
            if (b.ander) regels.push(`${lbl} — ${ziekteNaam(zid)}: ${en ? "other medicine" : "ander medicijn"}: ${jnMap[b.ander] || b.ander}`);
            if (b.ander === "ja") {
              const mid = b.middelen.filter((m) => m.naam.trim()).map((m) => `${m.naam.trim()}${m.aantal ? ` (${m.aantal} ${eenh(m.eenheid)})` : ""}`).join("; ");
              if (mid) regels.push(`${lbl} — ${ziekteNaam(zid)}: ${en ? "other medicines" : "andere medicijnen"}: ${mid}`);
            }
            if (b.tbe) regels.push(`${lbl} — ${ziekteNaam(zid)}: ${en ? "treatment of symptoms" : "behandeling symptomen"}: ${jnMap[b.tbe] || b.tbe}`);
            if (b.tbe === "ja") {
              const tmid = (b.tbeMiddelen || []).map((m) => m.trim()).filter(Boolean).join("; ");
              if (tmid) regels.push(`${lbl} — ${ziekteNaam(zid)}: ${en ? "medicines for symptoms" : "medicijnen voor symptomen"}: ${tmid}`);
            }
            if (b.exp) regels.push(`${lbl} — ${ziekteNaam(zid)}: ${en ? "experimental medicine" : "experimenteel medicijn"}: ${jnMap[b.exp] || b.exp}`);
            if (b.exp === "ja") {
              const emid = (b.expMiddelen || []).map((m) => m.trim()).filter(Boolean).join("; ");
              if (emid) regels.push(`${lbl} — ${ziekteNaam(zid)}: ${en ? "experimental medicines" : "experimentele medicijnen"}: ${emid}`);
            }
            const herstelMap: Record<string, string> = { ja: en ? "resolved" : "verdwenen", deels: en ? "partly resolved" : "deels verdwenen", nee: en ? "persisted" : "gebleven", onbekend: en ? "don't know" : "weet ik niet" };
            if (b.herstel) regels.push(`${lbl} — ${ziekteNaam(zid)}: ${en ? "symptoms after treatment" : "klachten na behandeling"}: ${herstelMap[b.herstel] || b.herstel}`);
            if (b.opnieuw) regels.push(`${lbl} — ${ziekteNaam(zid)}: ${en ? "treated again afterwards" : "daarna opnieuw behandeld"}: ${jnMap[b.opnieuw] || b.opnieuw}`);
            if (b.opnieuw === "ja" && b.opnieuwAantal) regels.push(`${lbl} — ${ziekteNaam(zid)}: ${en ? "time until the new treatment" : "tijd tot de nieuwe behandeling"}: ${b.opnieuwAantal} ${eenh(b.opnieuwEenheid)}`);
            if (b.herstel2) regels.push(`${lbl} — ${ziekteNaam(zid)}: ${en ? "symptoms after the new treatment" : "klachten na de nieuwe behandeling"}: ${herstelMap[b.herstel2] || b.herstel2}`);
          }
        }
        if (t.wie) regels.push(`${lbl} — ${en ? "test requested by" : "test aangevraagd door"}: ${({ huisarts: en ? "GP" : "Huisarts", specialist: en ? "Specialist (hospital)" : "Specialist (ziekenhuis)", andere_arts: en ? "Other doctor" : "Andere arts", arts_buitenland: en ? "Doctor abroad" : "Arts in buitenland", onbekend: en ? "Don't know" : "Weet ik niet" } as Record<string, string>)[t.wie] || t.wie}`);
        if (t.land) regels.push(`${lbl} — ${en ? "country of the test" : "land van de test"}: ${t.land}`);
      }
      return regels;
    }),
    a.abTussen ? `${en ? "Antibiotics prescribed for another condition (between then and now)" : "Antibiotica voorgeschreven voor een andere aandoening (tussen toen en nu)"}: ${({ ja: en ? "Yes" : "Ja", nee: en ? "No" : "Nee", onbekend: en ? "Don't know" : "Weet ik niet" } as Record<string, string>)[a.abTussen] || a.abTussen}` : null,
    a.abTussen === "ja" && a.abTussenSoort
      ? `${en ? "Type of antibiotic (other condition)" : "Soort antibiotica (andere aandoening)"}: ${a.abTussenSoort === "anders" ? (a.abTussenSoortAnders.trim() || (en ? "Other" : "Anders")) : a.abTussenSoort === "onbekend" ? (en ? "Don't know" : "Weet ik niet") : antibioticumNaam(a.abTussenSoort, en)}`
      : null,
    a.abTussen === "ja" && a.abTussenAandoening.trim()
      ? `${en ? "Condition for which antibiotics were prescribed" : "Aandoening waarvoor antibiotica"}: ${a.abTussenAandoening.trim()}`
      : null,
    a.abTussen === "ja" && a.abTussenJaar.trim()
      ? `${en ? "Year of this antibiotic course" : "Jaartal van deze antibioticakuur"}: ${a.abTussenJaar.trim()}`
      : null,
    a.abTussen === "ja" && a.abTussenDuurAantal.trim()
      ? `${en ? "Duration of this antibiotic course" : "Duur van deze antibioticakuur"}: ${a.abTussenDuurAantal.trim()} ${EENHEDEN(en).find((u) => u.id === (a.abTussenDuurEenheid || "dagen"))?.label ?? a.abTussenDuurEenheid}`
      : null,
    ...a.abTussenExtra.flatMap((k, i) => {
      if (a.abTussenNog[i] !== "ja") return [];
      const soort = k.soort === "anders" ? (k.soortAnders.trim() || (en ? "Other" : "Anders")) : k.soort === "onbekend" ? (en ? "Don't know" : "Weet ik niet") : antibioticumNaam(k.soort, en);
      const extra = [
        k.aandoening.trim() && k.aandoening !== "Weet ik niet" ? `${en ? "for" : "voor"}: ${k.aandoening.trim()}` : "",
        k.jaar.trim() ? `${en ? "year" : "jaartal"}: ${k.jaar.trim()}` : "",
        k.duurAantal.trim() ? `${en ? "duration" : "duur"}: ${k.duurAantal.trim()} ${EENHEDEN(en).find((u) => u.id === (k.duurEenheid || "dagen"))?.label ?? k.duurEenheid}` : "",
      ].filter(Boolean);
      return [
        `${en ? `Additional antibiotic course ${i + 2}` : `Extra antibioticakuur ${i + 2}`}: ${soort || (en ? "unknown" : "onbekend")}${extra.length ? ` — ${extra.join(", ")}` : ""}`,
      ];
    }),
  ].filter(Boolean) as string[];

  const huidigRegels = [
    a.datum ? `${en ? "Date of bite/removal" : "Datum beet/verwijdering"}: ${a.datum}` : null,
    `${en ? "Season" : "Seizoen"}: ${en ? seizoen.en : seizoen.nl}`,
    `${en ? "Tick species (estimate)" : "Tekensoort (inschatting)"}: ${t && t.id !== "onbekend" ? vertaalTekst(naamVanSoort(t), en) : onbekend}`,
    `${en ? "Tick was" : "Teek was"}: ${uiterlijkMap[a.uiterlijk || ""] || onbekend}`,
    `${en ? "Attachment duration" : "Hechtingsduur"}: ${duurMap[a.duur || ""] || onbekend}`,
    `${en ? "Removed" : "Verwijderd"}: ${verwMap[a.verwijderd || ""] || onbekend}`,
    a.lichaamsdeel.length ? `${en ? "Location on the body" : "Plaats op het lichaam"}: ${a.lichaamsdeel.includes("geen") ? onbekend : a.lichaamsdeel.map((id) => vertaalTekst(LICHAAMSDELEN.find((x) => x.id === id)?.label ?? id, en)).filter(Boolean).join("; ")}` : null,
    a.wieVerwijderd ? `${en ? "Removed by" : "Teek verwijderd door"}: ${optieLabel(WIE_VERWIJDERD, a.wieVerwijderd, en)}` : null,
    a.hoeVerwijderd ? `${en ? "Removal method" : "Wijze van verwijderen"}: ${optieLabel(HOE_VERWIJDERD, a.hoeVerwijderd, en)}` : null,
    a.restant ? `${en ? "Tick part left behind" : "Deel van de teek achtergebleven"}: ${optieLabel(RESTANT, a.restant, en)}` : null,
    a.teekBewaard ? `${en ? "What happened to the tick" : "Wat is er met de teek gebeurd"}: ${optieLabel(TEEK_BEWAARD, a.teekBewaard, en)}` : null,
    `${en ? "Place of the bite" : "Plaats van de beet"}: ${p ? p.naam : onbekend}${p && p.klasse !== null ? ` (${risicoLabel} ${RISK_LBL[p.klasse]?.toLowerCase()}, TBE: ${TBE_TEKST[p.tbe].replace(/\.$/, "")})` : ""}`,
    `${en ? "Environment" : "Omgeving"}: ${omg || onbekend}${loc ? ` — ${loc}` : ""}`,
    `${en ? "Weather" : "Weertype"}: ${wr || onbekend}`,
    `${en ? "Photos" : "Foto's"}: ${ft || onbekend}${a.beelden.beetplek.length ? ` (${a.beelden.beetplek.length} ${en ? "bite site photo(s) included below" : "beetplekfoto(’s) hieronder opgenomen"})` : ""}${a.beelden.teek.length ? ` (${a.beelden.teek.length} ${en ? "tick photo(s) included below" : "teekfoto(’s) hieronder opgenomen"})` : ""}`,
    a.scan ? `${en ? "AI scan of bite site" : "AI-scan beetplek"}: ${a.scan.weergave || a.scan.titel} — ${a.scan.advies}` : null,
    a.teekScan ? `${en ? "AI scan of tick" : "AI-scan teek"}: ${a.teekScan.titel} — ${a.teekScan.advies}` : null,
    a.emManueel ? `${en ? "Red spot (indicated without AI comparison)" : "Rode vlek (aangegeven zonder AI-vergelijking)"}: ${({ ja: en ? "You have a red spot" : "U heeft een rode vlek", nee: en ? "No red spot reported" : "Geen rode vlek aangegeven", onbekend: en ? "Don't know" : "Weet ik niet" } as Record<string, string>)[a.emManueel] || a.emManueel}` : null,
    `${en ? "Symptoms" : "Klachten"}: ${kl}`,
    a.klachtenDuur ? `${en ? "Duration of symptoms" : "Duur van de klachten"}: ${optieLabel(KLACHTEN_DUUR, a.klachtenDuur, en)}` : null,
    a.artsContact ? `${en ? "Contact with a doctor about this bite" : "Contact met arts over deze beet"}: ${optieLabel(ARTS_CONTACT, a.artsContact, en)}` : null,
    bz ? `${en ? "Special circumstances" : "Bijzonderheden"}: ${bz}` : null,
  ].filter(Boolean) as string[];

  const algemeenRegels = [
    a.tbeVaccin ? `${en ? "Vaccinated against TBE" : "Gevaccineerd voor TBE"}: ${({ ja: en ? "Yes" : "Ja", nee: en ? "No" : "Nee", onbekend: en ? "Don't know" : "Weet ik niet" } as Record<string, string>)[a.tbeVaccin] || a.tbeVaccin}` : null,
    a.tbeVaccin === "ja" && a.tbeVaccinWelk
      ? `${en ? "TBE vaccine" : "TBE-vaccin"}: ${a.tbeVaccinWelk === "anders" ? (a.tbeVaccinAnders.trim() || (en ? "Other" : "Anders")) : a.tbeVaccinWelk === "onbekend" ? (en ? "Don't know" : "Weet ik niet") : (TBE_VACCINS.find((x) => x.id === a.tbeVaccinWelk)?.label ?? a.tbeVaccinWelk)}`
      : null,
    a.leeftijd ? `${en ? "Age" : "Leeftijd"}: ${a.leeftijd} ${en ? "years" : "jaar"}` : null,
    a.geslacht ? `${en ? "Sex" : "Geslacht"}: ${({ man: en ? "Male" : "Man", vrouw: en ? "Female" : "Vrouw", anders: en ? "Other" : "Anders", geen: en ? "Prefer not to say" : "Wil ik niet zeggen" } as Record<string, string>)[a.geslacht] || a.geslacht}` : null,
    a.woonplaats.trim() ? `${en ? "Place of residence" : "Woonplaats"}: ${a.woonplaats.trim()}` : null,
    a.afkomst ? `${en ? "Background" : "Afkomst"}: ${({ nederlands: en ? "Dutch" : "Nederlands", europees: en ? "Other European" : "Overig Europees", buiten_europees: en ? "Non-European" : "Buiten-Europees", anders: en ? "Other" : "Anders", geen: en ? "Prefer not to say" : "Wil ik niet zeggen" } as Record<string, string>)[a.afkomst] || a.afkomst}` : null,
    a.nationaliteit ? `${en ? "Nationality" : "Nationaliteit"}: ${a.nationaliteit === "andere" && a.nationaliteitAnders.trim() ? a.nationaliteitAnders.trim() : ({ nederlandse: en ? "Dutch" : "Nederlandse", dubbele: en ? "Dutch and another nationality" : "Nederlandse en nog een nationaliteit", andere: en ? "Other nationality" : "Andere nationaliteit", geen: en ? "Prefer not to say" : "Wil ik niet zeggen" } as Record<string, string>)[a.nationaliteit] || a.nationaliteit}` : null,
    a.opleiding ? `${en ? "Education level" : "Opleidingsniveau"}: ${vertaalTekst(({ basis: "Basisonderwijs", voortgezet: "Voortgezet onderwijs (VMBO / HAVO / VWO)", mbo: "MBO", hbo_wo: "HBO / WO", anders: "Anders", geen: "Wil ik niet zeggen" } as Record<string, string>)[a.opleiding] || a.opleiding, en)}` : null,
    a.risicoBeroep ? `${en ? "Risk occupation (higher chance of tick bites)" : "Risicoberoep (verhoogde kans op tekenbeten)"}: ${a.risicoBeroep === "nee" ? (en ? "No" : "Nee") : a.risicoBeroep === "onbekend" ? (en ? "Don't know" : "Weet ik niet") : vertaalTekst(RISICO_BEROEPEN.find((x) => x.id === a.risicoBeroep)?.label ?? a.risicoBeroep, en)}` : null,
    a.huisdieren ? `${en ? "Pets (dog, cat, etc.)" : "Huisdieren (hond, kat etc.)"}: ${a.huisdieren === "ja" ? (en ? "Yes" : "Ja") : (en ? "No" : "Nee")}` : null,
    a.hobbydieren ? `${en ? "Hobby animals (rabbits, chickens, pigeons, goats, sheep, ponies/horses, etc.)" : "Hobbydieren (konijnen, kippen, duiven, geiten, schapen, pony’s / paarden, etc.)"}: ${a.hobbydieren === "ja" ? (en ? "Yes" : "Ja") : (en ? "No" : "Nee")}` : null,
  ].filter(Boolean) as string[];

  return {
    titel,
    huidig: huidigRegels,
    eerder: eerderRegels,
    algemeen: algemeenRegels,
    tips: persoonlijkeTips(a, en),
    voet: en
      ? `Created with Tick Bite Guide (reference date ${PEILDATUM}).`
      : `Opgesteld met TekenbeetGids (peildatum ${PEILDATUM}).`,
    kop: {
      huidig: en ? "Current tick bite (incl. AI scans and photos)" : "Huidige tekenbeet (incl. AI-scans en foto's)",
      eerder: en ? "Earlier tick bites" : "Eerdere tekenbeten",
      algemeen: en ? "About the person" : "Over de persoon",
      tips: en ? "Relevant general information" : "Relevante algemene informatie",
    },
  };
}

/* Platte tekstversie met kopjes: gebruikt voor kopiëren en voor het onderzoeksrapport. */
function samenvatting(a: Antwoorden) {
  const d = samenvattingDelen(a);
  const blok = (kop: string, regels: string[]) => (regels.length ? [`${kop}:`, ...regels.map((r) => `- ${r}`), ""] : []);
  return [
    d.titel,
    "",
    ...blok(d.kop.huidig, d.huidig),
    ...blok(d.kop.eerder, d.eerder),
    ...blok(d.kop.algemeen, d.algemeen),
    ...blok(d.kop.tips, d.tips.map((t) => `${t.kop}: ${t.tekst}`)),
    d.voet,
  ].join("\n");
}

/* Printbaar overzicht: de browser biedt in het printvenster ook "Opslaan als pdf". */
function bouwPrintHtml(a: Antwoorden, advies: Advies, tussentijds = false, tussen?: { a: Antwoorden; advies: Advies } | null) {
  const en = leesTaal() === "en";
  const esc = (s: string) => s.replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c] as string));
  /* Teksten lopen via de vertaaldatabase, zodat het rapport in de gekozen taal staat. */
  const tr = (s: string) => esc(vertaalTekst(s, en));
  const d = samenvattingDelen(a);
  const lijst = (regels: string[]) => `<ul>${regels.map((r) => `<li>${tr(r)}</li>`).join("")}</ul>`;
  /* Foto's uit een gegeven set antwoorden; gebruikt voor zowel het hoofddeel als het tussentijdse deel. */
  const fotoBlokken = (x: Antwoorden) =>
    `${x.beelden.beetplek.length ? `<div class="fotoblok"><div class="fotokop">${en ? "Photo of bite site" : "Foto van beetplek"}</div><div class="fotos">${x.beelden.beetplek.map((src: string) => `<img src="${src}" alt="">`).join("")}</div></div>` : ""}` +
    `${x.beelden.teek.length ? `<div class="fotoblok"><div class="fotokop">${en ? "Photo of tick" : "Foto van de teek"}</div><div class="fotos">${x.beelden.teek.map((src: string) => `<img src="${src}" alt="">`).join("")}</div></div>` : ""}`;
  /* Het eindrapport bevat ook het eerder gemaakte tussentijdse rapport, inclusief de foto's van dat moment. */
  const tussenBlok = (() => {
    if (tussentijds || !tussen) return "";
    const td = samenvattingDelen(tussen.a);
    return `<h2>${en ? "Interim record (previously generated)" : "Tussentijds overzicht (eerder gemaakt)"}</h2>
  <h3>${tr(tussen.advies.titel)}</h3>
  <p>${tr(tussen.advies.tekst)}</p>
  ${lijst(td.huidig)}
  ${fotoBlokken(tussen.a)}
  ${td.tips.length ? td.tips.map((t) => `<p><strong>${tr(t.kop)}</strong><br>${tr(t.tekst)}</p>`).join("") : ""}`;
  })();
  /* Watermerk als herhalende achtergrond: fixed element dat op elke pdf-pagina wordt herhaald. */
  const wmTegel = `<svg xmlns="http://www.w3.org/2000/svg" width="460" height="320" viewBox="0 0 460 320"><g transform="rotate(-32 230 160)" fill="${T.primair}" fill-opacity="0.10" font-family="Helvetica,Arial,sans-serif" text-anchor="middle"><text x="230" y="150" font-size="36" font-weight="700">TekenbeetGids</text><text x="230" y="182" font-size="17" letter-spacing="2">www.tekenbeetgids.nl</text></g></svg>`;
  const wmUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(wmTegel)}`;
  /* Rode aandachtbox en tijdbalkjes, zoals in de rapportweergave op het scherm. */
  const pct = (u: number) => (u / 96) * 100;
  const balkRij = (label: string, grens: number, fill: { pct: number; kleur: string; streep?: boolean } | null) =>
    `<div class="tijdbalk" style="margin:4mm 0 6mm;"><div style="font-size:9pt;font-weight:700;color:${T.grijs};margin-bottom:7mm;">${tr(label)}</div>` +
    `<div style="position:relative;height:3mm;background:${T.primairLicht};border-radius:1.5mm;-webkit-print-color-adjust:exact;print-color-adjust:exact;">` +
    (fill ? `<div style="position:absolute;left:0;top:0;bottom:0;width:${fill.pct}%;border-radius:1.5mm;background:${fill.streep ? `repeating-linear-gradient(135deg, ${fill.kleur}, ${fill.kleur} 1.2mm, transparent 1.2mm, transparent 2.4mm)` : fill.kleur};-webkit-print-color-adjust:exact;print-color-adjust:exact;"></div>` : "") +
    `<div style="position:absolute;left:${pct(grens)}%;top:-1mm;bottom:-1mm;width:0.5mm;background:${T.primairDonker};"></div>` +
    `<div style="position:absolute;left:${pct(grens)}%;transform:translateX(-50%);bottom:100%;font-size:8pt;font-weight:700;color:${T.primairDonker};white-space:nowrap;">${grens} uur</div>` +
    `</div></div>`;
  const duurBalk = a.duur === "kort" ? { pct: pct(18), kleur: "#4A9FD4" } : a.duur === "lang" ? { pct: pct(60), kleur: T.alarm } : a.duur === "onbekend" ? { pct: pct(96), kleur: T.grijs, streep: true } : null;
  const verwijderdBalk = a.verwijderd === "binnen" ? { pct: pct(40), kleur: T.primair } : a.verwijderd === "buiten" ? { pct: pct(96), kleur: T.grijs } : a.verwijderd === "onbekend" ? { pct: pct(96), kleur: T.grijs, streep: true } : null;
  const tijdbalkjes = balkRij("Hoe lang de teek vastzat", 24, duurBalk) + balkRij("Tijd sinds verwijderen", 72, verwijderdBalk);
  const alarmBlok = `<p style="margin:4mm 0;padding:3mm 4mm;background:${T.alarmLicht};border-left:1.5mm solid ${T.alarm};border-radius:2mm;color:${T.alarm};font-weight:600;-webkit-print-color-adjust:exact;print-color-adjust:exact;">${tr("Bespreek klachten of vragen met een arts. Bij een levensbedreigende situatie belt u 112.")}</p>`;
  /* De grens van de AI-fotoscan hoort ook in het rapport, zodat de lezer (bijv. de huisarts) die ziet. */
  const aiNotitie = a.scan || a.teekScan
    ? `<p style="font-size:9.5pt;color:${T.grijs};">${tr("De AI-fotoscans in dit overzicht vergelijken uitsluitend zichtbare kenmerken en kunnen de ziekte van Lyme of een andere aandoening niet vaststellen of uitsluiten.")}</p>`
    : "";
  return `<!doctype html><html lang="${en ? "en" : "nl"}"><head><meta charset="utf-8"><title>${en ? "Summary GP" : "Samenvatting huisarts"}</title>
<style>
  @page { margin: 18mm; }
  html { position: relative; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  .watermerk { position: fixed; inset: 0; z-index: -1; background-image: url("${wmUrl}"); background-repeat: repeat; background-position: center top; opacity: 1; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  body { font-family: Helvetica, Arial, sans-serif; color: ${T.inkt}; font-size: 12pt; line-height: 1.55; margin: 0; padding: 14mm 14mm 34mm; background: transparent; position: relative; z-index: 1; }

  h1 { font-size: 15pt; color: ${T.primairDonker}; margin: 0 0 2mm; }
  h2 { font-size: 13pt; color: ${advies.toon === "spoed" || advies.toon === "urgent" ? T.alarm : T.primair}; margin: 6mm 0 2mm; }
  h3 { font-size: 11.5pt; color: ${T.primairDonker}; margin: 5mm 0 1.5mm; border-bottom: 1px solid ${T.lijn}; padding-bottom: 1mm; }
  .eyebrow { font-size: 8pt; letter-spacing: .12em; text-transform: uppercase; color: ${T.grijs}; }
  ul { padding-left: 5mm; }
  li { margin-bottom: 1.5mm; }
  .disclaimer { position: fixed; left: 0; right: 0; bottom: 0; margin: 0; padding: 3mm 4mm; border: 1px solid ${T.alarm}; border-radius: 2mm; background: #fff; font-size: 9pt; color: ${T.alarm}; z-index: 2; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  .fotoblok { margin: 4mm 0; page-break-inside: avoid; }
  .fotokop { font-size: 9.5pt; color: ${T.grijs}; margin-bottom: 1.5mm; }
  .fotos { display: flex; flex-wrap: wrap; gap: 3mm; }
  .fotos img { width: 55mm; max-height: 55mm; object-fit: contain; border: 1px solid ${T.lijn}; border-radius: 2mm; }
  .voet { margin-top: 8mm; font-size: 8.5pt; color: ${T.alarm}; border-top: 1px solid ${T.alarm}; padding-top: 3mm; }
  @media print { .disclaimer, .watermerk { position: fixed; -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
</style></head><body>

  <div class="watermerk" aria-hidden="true"></div>
  <p class="disclaimer"><strong>${en ? "Disclaimer" : "Disclaimer"}:</strong> ${en
    ? "This overview records information you entered. It does not assess your situation, determine urgency, provide medical advice or make a diagnosis. Discuss concerns with a doctor; call 112 in a life-threatening emergency."
    : "Dit overzicht registreert door u ingevoerde informatie. Het beoordeelt uw situatie niet, bepaalt geen urgentie, geeft geen medisch advies en stelt geen diagnose. Bespreek zorgen met een arts; bel 112 bij een levensbedreigende situatie."}</p>
  <div class="eyebrow">${en ? "Tick Bite Guide" : "TekenbeetGids"}</div>
  <h1>${tussentijds
     ? (en ? "Interim personal record" : "Tussentijds persoonlijk overzicht")
     : (en ? "Personal tick-bite record" : "Persoonlijk tekenbeetoverzicht")}</h1>
  <h2>${tr(advies.titel)}</h2>
  <p>${tr(advies.tekst)}</p>
  ${aiNotitie}
  ${tussentijds ? alarmBlok + tijdbalkjes : ""}
  <h2>${en ? "Information you recorded" : "Vastgelegde informatie"}</h2>

  <h3>${tr(d.kop.huidig)}</h3>
  ${lijst(d.huidig)}
  ${fotoBlokken(a)}

  ${d.eerder.length ? `<h3>${tr(d.kop.eerder)}</h3>${lijst(d.eerder)}` : ""}
  ${d.algemeen.length ? `<h3>${tr(d.kop.algemeen)}</h3>${lijst(d.algemeen)}` : ""}
  ${d.tips.length ? `<h3>${tr(d.kop.tips)}</h3>${d.tips.map((t) => `<p><strong>${tr(t.kop)}</strong><br>${tr(t.tekst)}</p>`).join("")}` : ""}
  ${tussenBlok}





  <p class="voet">${en
    ? "If you have symptoms: call your GP. In case of paralysis, severe confusion or shortness of breath: call 112."
    : "Bij klachten: bel uw huisarts. Bij verlamming, ernstige verwardheid of benauwdheid: bel 112."}</p>
</body></html>`;
}


/* Printen via een verborgen iframe: werkt ook als pop-ups geblokkeerd zijn (iOS/Safari). */
function printHtml(html: string) {
  try {
    const oud = document.getElementById("trk-print-frame");
    if (oud) oud.remove();

    const frame = document.createElement("iframe");
    frame.id = "trk-print-frame";
    frame.setAttribute("aria-hidden", "true");
    frame.style.cssText = "position:fixed;right:0;bottom:0;width:1px;height:1px;border:0;opacity:0;pointer-events:none;";
    document.body.appendChild(frame);

    const doc = frame.contentDocument;
    if (!doc) throw new Error("geen document");
    doc.open();
    doc.write(html);
    doc.close();

    const start = () => {
      const win = frame.contentWindow;
      if (!win) return;
      try {
        win.focus();
        win.print();
      } catch {
        openInNieuwTabblad(html);
      }
      window.setTimeout(() => frame.remove(), 60000);
    };

    if (frame.contentWindow?.document.readyState === "complete") window.setTimeout(start, 150);
    else frame.onload = () => window.setTimeout(start, 150);
  } catch {
    openInNieuwTabblad(html);
  }
}

/* Laatste redmiddel: open het overzicht in een nieuw tabblad zodat de gebruiker zelf kan printen/opslaan. */
function openInNieuwTabblad(html: string) {
  const blob = new Blob([html], { type: "text/html" });
  const url = URL.createObjectURL(blob);
  const w = window.open(url, "_blank");
  if (!w) {
    const a = document.createElement("a");
    a.href = url;
    a.download = "samenvatting-huisarts.html";
    document.body.appendChild(a);
    a.click();
    a.remove();
  }
  window.setTimeout(() => URL.revokeObjectURL(url), 60000);
}


/* ============ deelnemen aan onderzoek ============ */

/* Gepseudonimiseerde gegevens: foto's en vrije locatieteksten gaan niet mee. */
function anonimiseer(a: Antwoorden): Record<string, unknown> {
  const { beelden: _beelden, locatie: _locatie, ...rest } = a as Antwoorden & Record<string, unknown>;
  return {
    ...rest,
    scan: a.scan ? { titel: a.scan.titel, zekerheid: a.scan.zekerheid } : null,
    teekScan: a.teekScan ? { titel: a.teekScan.titel, zekerheid: a.teekScan.zekerheid } : null,
    aantalFotosBeetplek: a.beelden.beetplek.length,
    aantalFotosTeek: a.beelden.teek.length,
  };
}

function toestemmingTekst(en: boolean) {
  return en
    ? [
        "You are giving permission to make the answers you filled in with Tick Bite Guide, including the summary for your GP, available for scientific research into tick bites and tick-borne diseases in the Netherlands.",
        "The data is stored pseudonymously. No name, address, e-mail address, date of birth or photos are stored. You receive a unique participation number; Combining location, date and symptoms may permit indirect identification; the data is not fully anonymous.",
        "Participation is voluntary and free. You can withdraw at any time via the opt-out under Help using your participation number and withdrawal code, or via the contact form; your record will then be deleted.",
        "The pseudonymous data is used for statistics and research reports only, and is never sold or shared for commercial purposes.",
        "A copy of this consent form is stored together with your data under your participation number.",
      ]
    : [
        "U geeft toestemming om de antwoorden die u in TekenbeetGids heeft ingevuld, inclusief het rapport voor de huisarts, beschikbaar te stellen voor wetenschappelijk onderzoek naar tekenbeten en tekenziekten in Nederland.",
        "De gegevens worden gepseudonimiseerd opgeslagen. Er wordt geen naam, adres, e-mailadres, geboortedatum of foto bewaard. U ontvangt een uniek deelnamenummer; Combinaties van locatie, datum en klachten kunnen indirect herkenbaar zijn; de gegevens zijn niet volledig anoniem.",
        "Deelname is vrijwillig en kosteloos. U kunt zich altijd terugtrekken via de opt-out onder Help met uw deelnamenummer en intrekcode, of via het contactformulier; uw gegevens worden dan verwijderd.",
        "De gepseudonimiseerde gegevens worden alleen gebruikt voor statistiek en onderzoeksrapportages en worden nooit verkocht of commercieel gedeeld.",
        "Een kopie van dit toestemmingsformulier wordt samen met uw gegevens onder uw deelnamenummer opgeslagen.",
      ];
}

/* Printbaar toestemmingsformulier met het volledige huisartsrapport erbij. */
function bouwOnderzoekHtml(a: Antwoorden, advies: Advies, nummer: string | null, intrekcode: string | null) {
  const en = leesTaal() === "en";
  const esc = (s: string) => s.replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c] as string));
  /* Teksten lopen via de vertaaldatabase, zodat het rapport in de gekozen taal staat. */
  const tr = (s: string) => esc(vertaalTekst(s, en));
  const regels = samenvatting(a).split("\n").filter(Boolean);
  const wmTegel = `<svg xmlns="http://www.w3.org/2000/svg" width="460" height="320" viewBox="0 0 460 320"><g transform="rotate(-32 230 160)" fill="${T.primair}" fill-opacity="0.10" font-family="Helvetica,Arial,sans-serif" text-anchor="middle"><text x="230" y="150" font-size="24" font-weight="700">TekenRisicoKaart - TekenbeetGids</text><text x="230" y="182" font-size="17" letter-spacing="2">www.tekenrisicokaart.nl</text></g></svg>`;
  const wmUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(wmTegel)}`;
  return `<!doctype html><html lang="${en ? "en" : "nl"}"><head><meta charset="utf-8"><title>${en ? "Consent form research" : "Toestemmingsformulier onderzoek"}</title>
<style>
  @page { margin: 18mm; }
  html { position: relative; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  .watermerk { position: fixed; inset: 0; z-index: -1; background-image: url("${wmUrl}"); background-repeat: repeat; background-position: center top; }
  body { font-family: Helvetica, Arial, sans-serif; color: ${T.inkt}; font-size: 12pt; line-height: 1.55; margin: 0; padding: 14mm 14mm 34mm; background: transparent; position: relative; z-index: 1; }
  h1 { font-size: 15pt; color: ${T.primairDonker}; margin: 0 0 2mm; }
  h2 { font-size: 13pt; color: ${T.primair}; margin: 6mm 0 2mm; }
  .eyebrow { font-size: 8pt; letter-spacing: .12em; text-transform: uppercase; color: ${T.grijs}; }
  .nummer { font-size: 13pt; font-weight: 700; color: ${T.primairDonker}; border: 1px solid ${T.primair}; border-radius: 2mm; padding: 3mm 4mm; display: inline-block; }
  ul { padding-left: 5mm; } li { margin-bottom: 1.5mm; }
  .disclaimer { position: fixed; left: 0; right: 0; bottom: 0; margin: 0; padding: 3mm 4mm; border: 1px solid ${T.alarm}; border-radius: 2mm; background: #fff; font-size: 9pt; color: ${T.alarm}; z-index: 2; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  .voet { margin-top: 8mm; font-size: 8.5pt; color: ${T.grijs}; border-top: 1px solid ${T.alarm}; padding-top: 3mm; }
</style></head><body>
  <div class="watermerk" aria-hidden="true"></div>
  <p class="disclaimer"><strong>Disclaimer:</strong> ${en
      ? "This record contains information entered by the user. It does not assess the situation, determine urgency, provide medical advice or make a diagnosis."
      : "Dit overzicht bevat door de gebruiker ingevoerde informatie. Het beoordeelt de situatie niet, bepaalt geen urgentie, geeft geen medisch advies en stelt geen diagnose."}</p>
  <div class="eyebrow">${en ? "Tick Bite Guide" : "TekenbeetGids"}</div>
  <h1>${en ? "Consent form — participation in research" : "Toestemmingsformulier — deelnemen aan onderzoek"}</h1>
  ${nummer ? `<p class="nummer">${en ? "Participation number" : "Deelnamenummer"}: ${esc(nummer)}</p>` : ""}
  ${intrekcode ? `<p class="nummer">${en ? "Withdrawal code (keep it secret)" : "Intrekcode (geheim houden)"}: ${esc(intrekcode)}</p>` : ""}
  <ul>${toestemmingTekst(en).map((r) => `<li>${esc(r)}</li>`).join("")}</ul>
  <h2>${tr(advies.titel)}</h2>
  <p>${tr(advies.tekst)}</p>
  <h2>${en ? "Personal record (pseudonymised)" : "Persoonlijk overzicht (gepseudonimiseerd)"}</h2>
  <ul>${regels.slice(1).map((r) => `<li>${tr(r)}</li>`).join("")}</ul>
  <p class="voet">TekenRisicoKaart - TekenbeetGids — www.tekenrisicokaart.nl · ${en ? "Dominic Smith Consultancy" : "Dominic Smith Advies"}. ${en ? "Reference date" : "Peildatum"} ${esc(PEILDATUM)}.</p>
</body></html>`;
}

function OnderzoekDialoog({ a, advies, sluit, onNummer }: { a: Antwoorden; advies: Advies; sluit: () => void; onNummer?: (n: string, code: string) => void }) {
  const en = useTaal() === "en";
  const [akkoord, setAkkoord] = useState(false);
  const [bezig, setBezig] = useState(false);
  const [nummer, setNummer] = useState<string | null>(null);
  const [fout, setFout] = useState<string | null>(null);
  const [gekopieerd, setGekopieerd] = useState(false);
  const [intrekcode, setIntrekcode] = useState<string | null>(null);

  const slaRegistratieOp = useServerFn(slaTekenbeetRegistratieOp);

  const verstuur = async () => {
    if (!akkoord || bezig || nummer) return;
    setBezig(true);
    setFout(null);
    try {
      const res = await meldAanVoorOnderzoek({
        data: {
          rapport: samenvatting(a),
          advies: { titel: advies.titel, tekst: advies.tekst },
          gegevens: {
            ...anonimiseer(a),
            /* Persoonlijke tips per risicoprofiel (leeftijd, beroep, behandeling, vaccinatie). */
            tips: persoonlijkeTips(a, en),
            /* Kopie van het ondertekende toestemmingsformulier (consent). */
            toestemming: {
              titel: en ? "Consent form — participation in research" : "Toestemmingsformulier — deelnemen aan onderzoek",
              teksten: toestemmingTekst(en),
              verklaring: en
                ? "I have read the above and explicitly consent to the processing of my pseudonymised health data for this research (Article 9(2)(a) GDPR)."
                : "Ik heb het bovenstaande gelezen en geef uitdrukkelijk toestemming voor de verwerking van mijn gepseudonimiseerde gezondheidsgegevens voor dit onderzoek (artikel 9 lid 2 onder a AVG).",
              akkoord: true,
              akkoordOp: new Date().toISOString(),
            },
          },
          taal: en ? "en" : "nl",
        },
      });
      if (res.ok) {
        setNummer(res.deelnamenummer);
        setIntrekcode(res.intrekcode);
        onNummer?.(res.deelnamenummer, res.intrekcode);
        /* Pas na toestemming wordt de rapportage beveiligd opgeslagen onder het deelnamenummer. */
        const { beelden: _beelden, ...gegevensZonderFotos } = a;
        void slaRegistratieOp({
          data: { taal: en ? "en" : "nl", overzicht: samenvatting(a), gegevens: gegevensZonderFotos, nummer: res.deelnamenummer, intrekcode: res.intrekcode },
        }).catch(() => undefined);
      }
      else setFout(en ? "Saving failed. Please try again later." : "Opslaan is niet gelukt. Probeer het later opnieuw.");
    } catch {
      setFout(en ? "Saving failed. Please try again later." : "Opslaan is niet gelukt. Probeer het later opnieuw.");
    } finally {
      setBezig(false);
    }
  };

  const bevestigingsHtml = nummer ? bouwOnderzoekHtml(a, advies, nummer, intrekcode) : null;
  const printDirect = () => {
    if (bevestigingsHtml) printHtml(bevestigingsHtml);
  };
  const kopieerNummer = () => {
    if (!nummer) return;
    try {
      void navigator.clipboard.writeText(nummer);
      setGekopieerd(true);
      window.setTimeout(() => setGekopieerd(false), 2500);
    } catch { setGekopieerd(false); }
  };

  return (
    <div role="dialog" aria-modal="true" aria-label={en ? "Consent form research" : "Toestemmingsformulier onderzoek"}
      style={{ position: "fixed", inset: 0, zIndex: 4000, background: "rgba(12,32,44,0.55)", display: "flex", alignItems: "center", justifyContent: "center", padding: 12 }}
      onClick={sluit}>
      <div onClick={(e) => e.stopPropagation()}
        style={{ background: T.achtergrond, border: `1px solid ${T.alarm}`, borderRadius: 10, width: "100%", maxWidth: 560, maxHeight: "92vh", overflowY: "auto", padding: "14px 14px 16px" }}>

        {nummer ? (
          /* Bevestigingspagina na akkoord */
          <>
            <div style={{ textAlign: "center", marginTop: 4 }}>
              <div style={{ width: 56, height: 56, borderRadius: "50%", background: T.primairLicht, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 10px", fontSize: 28 }}>
                ✓
              </div>
              <h2 style={{ ...S.h2, margin: "0 0 6px", color: T.primairDonker }}>{en ? "Thank you for participating" : "Bedankt voor uw deelname"}</h2>
              <p style={{ ...S.p, margin: 0 }}>
                {en ? "Your data has been saved pseudonymously." : "Uw gegevens zijn gepseudonimiseerd opgeslagen."}
              </p>
            </div>

            <div style={{ marginTop: 16, padding: "14px 16px", background: T.primairLicht, borderRadius: 10, textAlign: "center", border: `1px solid ${T.primair}` }}>
              <div style={{ ...S.eyebrow, color: T.primair }}>{en ? "Your unique participation number" : "Uw unieke deelnamenummer"}</div>
              <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: "0.05em", color: T.primairDonker, margin: "8px 0", fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace" }}>
                {nummer}
              </div>
              {intrekcode && (
                <div style={{ fontSize: 12, color: T.primairDonker, margin: "0 0 6px" }}>
                  {en ? "Personal withdrawal code (keep it secret): " : "Persoonlijke intrekcode (geheim houden): "}
                  <strong style={{ fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace", letterSpacing: "0.05em" }}>{intrekcode}</strong>
                </div>
              )}
              <button type="button" onClick={kopieerNummer}
                style={{ ...S.knop, width: "auto", padding: "7px 14px", fontSize: 12, marginTop: 4 }}>
                {gekopieerd ? (en ? "Copied ✓" : "Gekopieerd ✓") : (en ? "Copy number" : "Nummer kopiëren")}
              </button>
            </div>

            <div style={{ marginTop: 14, padding: "12px 14px", background: T.papier, borderRadius: 8 }}>
              <p style={{ ...S.p, margin: 0, fontSize: 12 }}>
                {en
                  ? "No name, address, email address, date of birth or photos were stored. Only the participation number links you to your submission. Save this PDF proof with your participation number and withdrawal code for your records."
                  : "Er is geen naam, adres, e-mailadres, geboortedatum of foto opgeslagen. Alleen het deelnamenummer verbindt u aan uw inzending. Bewaar dit PDF-bewijs met deelnamenummer en intrekcode voor uw eigen administratie."}
              </p>
            </div>

            <div style={{ display: "flex", gap: 8, marginTop: 14, flexWrap: "wrap" }}>
              <button type="button" onClick={printDirect} disabled={!bevestigingsHtml}
                style={{ ...S.knop, flex: "1 1 160px", width: "auto" }}>
                {en ? "Save PDF proof" : "PDF-bewijs opslaan"}
              </button>
              <button type="button" onClick={printDirect} disabled={!bevestigingsHtml}
                style={{ ...S.knop, flex: "1 1 160px", width: "auto", background: "transparent", color: T.primair, border: `1.5px solid ${T.primair}` }}>
                {en ? "Print PDF proof" : "PDF-bewijs printen"}
              </button>
              <button type="button" onClick={sluit}
                style={{ ...S.knop, flex: "1 1 110px", width: "auto", background: "transparent", color: T.grijs, border: `1.5px solid ${T.lijn}` }}>
                {en ? "Close" : "Sluiten"}
              </button>
            </div>
            <p style={{ fontSize: 10.5, lineHeight: 1.5, color: T.grijs, margin: "8px 0 0" }}>
              {en
                ? "Choose ‘Save as PDF’ in the print dialog to download the proof with your participation number and withdrawal code."
                : "Kies in het printvenster bij bestemming ‘Opslaan als pdf’ om het bewijs met uw deelnamenummer en intrekcode te downloaden."}
            </p>
          </>
        ) : (
          /* Toestemmingsformulier vóór akkoord */
          <>
            <div style={S.eyebrow}>{en ? "Consent form" : "Toestemmingsformulier"}</div>
            <h2 style={{ ...S.h2, margin: "6px 0 4px" }}>{en ? "Participate in research" : "Deelnemen aan onderzoek"}</h2>
            <ul style={S.lijst}>
              {toestemmingTekst(en).map((r) => <li key={r}>{r}</li>)}
            </ul>

            <label style={{ display: "flex", gap: 8, alignItems: "flex-start", marginTop: 10, fontSize: 12.5, lineHeight: 1.5, color: T.inkt }}>
              <input type="checkbox" checked={akkoord} onChange={(e) => setAkkoord(e.target.checked)} style={{ marginTop: 3 }} />
              <span>{en
                ? "I have read the above and explicitly consent to the processing of my pseudonymised health data for this research (Article 9(2)(a) GDPR)."
                : "Ik heb het bovenstaande gelezen en geef uitdrukkelijk toestemming voor de verwerking van mijn gepseudonimiseerde gezondheidsgegevens voor dit onderzoek (artikel 9 lid 2 onder a AVG)."}</span>
            </label>

            {fout && <p style={{ ...S.p, color: T.alarm }}>{fout}</p>}

            <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
              <button type="button" onClick={verstuur} disabled={!akkoord || bezig}
                style={{ ...S.knop, flex: "1 1 150px", width: "auto", opacity: !akkoord || bezig ? 0.5 : 1 }}>
                {bezig ? (en ? "Saving…" : "Bezig met opslaan…") : (en ? "Agree" : "Akkoord")}
              </button>
              <button type="button" onClick={sluit}
                style={{ ...S.knop, flex: "1 1 110px", width: "auto", background: "transparent", color: T.grijs, border: `1.5px solid ${T.lijn}` }}>
                {en ? "Close" : "Sluiten"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}


/* Voorbeeldvenster: eerst controleren, daarna printen of als pdf opslaan.
   De pdf wordt direct bij openen in de browser gemaakt, zodat de knoppen
   binnen de tik van de gebruiker kunnen werken (vereist door iOS Safari). */
function PrintVoorbeeld({ html, sluit }: { html: string; sluit: () => void }) {
  const en = useTaal() === "en";
  const frameRef = useRef<HTMLIFrameElement>(null);
  const [pdf, setPdf] = useState<Blob | null>(null);
  const [pdfFout, setPdfFout] = useState(false);
  const [melding, setMelding] = useState<string | null>(null);
  const naam = en ? "tick-bite-report.pdf" : "tekenbeet-rapport.pdf";

  useEffect(() => {
    let actief = true;
    setPdf(null);
    setPdfFout(false);
    maakPdf(html)
      .then((b) => { if (actief) setPdf(b); })
      .catch(() => { if (actief) setPdfFout(true); });
    return () => { actief = false; };
  }, [html]);

  const printFrame = () => {
    const win = frameRef.current?.contentWindow;
    try {
      if (!win) throw new Error("geen frame");
      win.focus();
      win.print();
    } catch {
      printHtml(html);
    }
  };

  /* Print / pdf: op iPhone/iPad via het deelmenu (Afdrukken of Bewaar in Bestanden),
     elders via het printvenster van de browser (met ook "Opslaan als pdf"). */
  const print = async () => {
    setMelding(null);
    if (isIOS() && pdf) {
      const nav = navigator as Navigator & { canShare?: (d: ShareData) => boolean };
      const file = new File([pdf], naam, { type: "application/pdf" });
      if (nav.share && nav.canShare?.({ files: [file] })) {
        try {
          await nav.share({ files: [file], title: naam });
          return;
        } catch (e) {
          if ((e as Error)?.name === "AbortError") return;
        }
      }
      if (openPdf(pdf)) return;
    }
    printFrame();
  };

  /* Opslaan / pdf: echt pdf-bestand. Mobiel via het deelmenu, computer als download. */
  const opslaan = async () => {
    setMelding(null);
    if (pdf) {
      await deelOfDownloadPdf(pdf, naam, isMobiel());
      return;
    }
    /* Pdf maken lukte niet: val terug op het printvenster, daar kan ook als pdf worden bewaard. */
    setMelding(en
      ? "The PDF could not be created on this device. Choose ‘Save as PDF’ in the print dialog instead."
      : "De pdf kon op dit apparaat niet worden gemaakt. Kies in het printvenster ‘Opslaan als pdf’.");
    printFrame();
  };

  const bezig = !pdf && !pdfFout;
  const randKnop = { ...S.knop, flex: "1 1 140px", width: "auto", background: "transparent", color: T.primair, border: `1.5px solid ${T.primair}` };
  return (
    <div role="dialog" aria-modal="true"
      style={{ position: "fixed", inset: 0, zIndex: 4000, background: "rgba(12,32,44,0.55)", display: "flex", alignItems: "center", justifyContent: "center", padding: 12 }}
      onClick={sluit}>
      <div onClick={(e) => e.stopPropagation()}
        style={{ background: T.achtergrond, border: `1px solid ${T.alarm}`, borderRadius: 10, width: "100%", maxWidth: 720, maxHeight: "92vh", display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <div style={{ padding: "12px 14px 8px" }}>
          <div style={S.eyebrow}>{en ? "Print preview" : "Print-voorbeeld"}</div>
          <h2 style={{ ...S.h2, margin: "6px 0 0" }}>{en ? "Check your overview" : "Controleert u overzicht"}</h2>
          <p style={{ ...S.p, margin: "4px 0 0" }}>
            {en
              ? "This is exactly what will be printed or saved as a PDF. ‘Print / PDF’ opens the print options; ‘Save / PDF’ saves a PDF file (on iPhone: choose Save to Files)."
              : "Dit is precies wat er geprint of als pdf opgeslagen wordt. ‘Print / pdf’ opent de printopties; ‘Opslaan / pdf’ bewaart een pdf-bestand (op iPhone: kies Bewaar in Bestanden)."}
          </p>
        </div>
        <iframe ref={frameRef} title={en ? "Print preview" : "Print-voorbeeld"} srcDoc={html}
          style={{ flex: 1, minHeight: 300, width: "100%", border: `1px solid ${T.lijn}`, borderLeft: "none", borderRight: "none", background: "#fff" }} />
        {melding && <p style={{ ...S.p, color: T.alarm, margin: "8px 14px 0" }}>{melding}</p>}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", padding: "10px 14px 14px" }}>
          <button type="button" onClick={() => { void print(); }} disabled={bezig && isIOS()}
            style={{ ...S.knop, flex: "1 1 140px", width: "auto", opacity: bezig && isIOS() ? 0.6 : 1 }}>
            {bezig && isIOS() ? (en ? "Preparing PDF…" : "Pdf wordt gemaakt…") : (en ? "Print / PDF" : "Print / pdf")}
          </button>
          <button type="button" onClick={() => { void opslaan(); }} disabled={bezig}
            style={{ ...randKnop, opacity: bezig ? 0.6 : 1 }}>
            {bezig ? (en ? "Preparing PDF…" : "Pdf wordt gemaakt…") : (en ? "Save / PDF" : "Opslaan / pdf")}
          </button>
          <button type="button" onClick={sluit} style={randKnop}>
            {en ? "Back" : "Terug"}
          </button>
        </div>
      </div>
    </div>
  );
}


/* ============ stijlen ============ */
const S = {
  wrap: {
    padding: 14,
    paddingTop: "max(34px, calc(env(safe-area-inset-top) + 14px))",
    maxWidth: 720,
    margin: "0 auto",
    fontFamily: T.font,
    color: T.inkt,
    background: T.primairLicht,
  },
  kaart: { background: T.achtergrond, border: `1px solid ${T.alarm}`, borderRadius: 10, padding: "12px 13px 15px" },
  eyebrow: { fontSize: 10, fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", color: T.primair },
  h2: { fontSize: 16, lineHeight: 1.3, margin: "8px 0 4px", color: T.primairDonker, fontWeight: 800 },
  h3: { fontSize: 12.5, margin: "14px 0 5px", fontWeight: 800, color: T.primairDonker },
  p: { fontSize: 12.5, lineHeight: 1.6, margin: "0 0 8px", color: T.inkt },
  lijst: { margin: 0, paddingLeft: 18, fontSize: 12.5, lineHeight: 1.6, display: "grid", gap: 5, color: T.inkt },
  knop: { display: "block", width: "100%", padding: "11px 16px", background: T.primair, color: "#fff", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: T.font },
  optie: { textAlign: "left" as const, padding: "11px 13px", borderRadius: 8, border: `1px solid ${T.lijn}`, background: T.papier, fontSize: 12.5, color: T.inkt, cursor: "pointer", lineHeight: 1.45, fontFamily: T.font, width: "100%" },
  terug: { marginTop: 14, background: "none", border: "none", padding: 0, color: T.grijs, fontSize: 12, cursor: "pointer", fontFamily: T.font },
};

/* ============ kleine onderdelen ============ */
function A({ href, children }: { href: string; children: React.ReactNode }) {
  return <a href={href} target="_blank" rel="noopener noreferrer" style={{ color: T.primair, fontWeight: 600 }}>{children}</a>;
}

function Keuzes({ opties, kies, waarde }: { opties: { id: string; label: string; sub?: string; klasse?: number | null }[]; kies: (v: string) => void; waarde?: string | null }) {
  const en = useTaal() === "en";
  return (
    <div style={{ display: "grid", gap: 8, marginTop: 12 }}>
      {opties.map((o) => {
        const actief = waarde === o.id;
        return (
          <button key={o.id} type="button" onClick={() => kies(o.id)}
            style={{ ...S.optie, borderColor: actief ? T.primair : T.lijn, background: actief ? T.primairLicht : T.papier }}>
            <span style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 600 }}>
              {o.klasse !== undefined && o.klasse !== null && (
                <span aria-hidden style={{ width: 10, height: 10, borderRadius: 3, background: RISK[o.klasse], flexShrink: 0, display: "inline-block" }} />
              )}
              {vertaalTekst(o.label, en)}
            </span>
            {o.sub && <span style={{ display: "block", marginTop: 4, fontSize: 11.5, color: T.grijs, lineHeight: 1.5 }}>{vertaalTekst(o.sub, en)}</span>}
          </button>
        );
      })}
    </div>
  );
}


function Vinkjes({ opties, toggle, waarden, tekstGrootte }: { opties: Vink[]; toggle: (v: string) => void; waarden: string[]; tekstGrootte?: number }) {
  const en = useTaal() === "en";
  return (
    <div style={{ display: "grid", gap: 8, marginTop: 12 }}>
      {opties.map((o) => {
        const actief = waarden.includes(o.id);
        const kl = T.primair;
        return (
          <Button key={o.id} type="button" onClick={() => toggle(o.id)} aria-pressed={actief}
            style={{ ...S.optie, display: "flex", gap: 10, alignItems: "flex-start", justifyContent: "flex-start", flexWrap: "nowrap", height: "auto", minHeight: 42, whiteSpace: "normal", textAlign: "left", fontSize: tekstGrootte ?? 12.5, borderColor: actief ? kl : T.lijn, background: actief ? T.primairLicht : T.papier }}>
            <span aria-hidden style={{ width: 16, height: 16, borderRadius: 4, border: `1.5px solid ${kl}`, background: actief ? kl : "transparent", color: "#fff", fontSize: 11, lineHeight: "16px", textAlign: "center", flexShrink: 0, marginTop: 1 }}>{actief ? "✓" : ""}</span>
            <span style={{ fontWeight: 500, color: T.inkt, whiteSpace: "normal", flex: 1, minWidth: 0 }}>{vertaalTekst(o.label, en)}</span>
          </Button>
        );
      })}
    </div>
  );
}

function Notitie({ children }: { children: React.ReactNode }) {
  return <p style={{ margin: "10px 0 0", padding: "8px 11px", background: T.primairLicht, borderRadius: 8, fontSize: 11.5, lineHeight: 1.55, color: T.primairDonker }}>{children}</p>;
}

function Verwijderen({ onKlaar }: { onKlaar: () => void }) {
  const en = useTaal() === "en";
  const bron = {
    rivm: { nl: "RIVM", en: "RIVM" },
    stz: { nl: "Stichting Tekenbeetziekten", en: "Stichting Tekenbeetziekten" },
    vl: { nl: "Vlaanderen is zorg", en: "Vlaanderen is zorg" },
    eigen: { nl: "Eigen afbeelding", en: "Own image" },
  };
  const afb = (src: string, alt: string, key: "rivm" | "stz" | "vl" | "eigen", url: string) => ({ src: `${src}?v=${VERWIJDER_VERSION}`, alt, bron: bron[key][en ? "en" : "nl"], url });
  const rijen: [string, string, ReturnType<typeof afb>[]?][] = [
    ["Gebruik een pincet of tekenkaart.", "Een puntige pincet of tekenkaart. Geen nagels, geen lus van draad.", [
      afb("/verwijderen/pincet-detail.png", en ? "Pointed tick removal tweezers." : "Puntige tekenpincet.", "eigen", ""),
      afb("/verwijderen/tekenkaart-safe.png", en ? "Tick removal card (SAFECARD)." : "Tekenkaart (SAFECARD).", "eigen", ""),
    ]],
    ["Pak de teek zo dicht mogelijk bij de huid vast, bij de kop, en trek hem loodrecht en rustig uit de huid.", "Knijp niet in het lijfje: links goed, rechts fout. Niet draaien, niet rukken.", [
      afb("/verwijderen/stz-goed-fout.jpg", en ? "Left: grasp the tick at the head, correct. Right: squeezing the body, wrong." : "Links: teek bij de kop pakken, goed. Rechts: in het lijfje knijpen, fout.", "stz", "https://www.tekenbeetziekten.nl"),
      afb("/verwijderen/tekenkaart-stappen.png", en ? "Removing a tick with a tick card in three steps." : "Teek verwijderen met een tekenkaart in drie stappen.", "vl", "https://www.zorg-en-gezondheid.be/"),
    ]],
    ["Ontsmet de huid daarna met alcohol 70%.", "Vóóraf géén alcohol, jodium, olie of zeep — dat kan de teek juist doen leegspuiten.", [afb("/verwijderen/rivm-verwijder-4.png", en ? "Disinfect the bite site afterwards." : "Ontsmet de beetplek nadien.", "rivm", "https://www.rivm.nl/tekenbeten")]],
    ["Noteer datum, tijd en plek op uw lichaam.", "Een foto van de beet is later goud waard bij de huisarts.", [afb("/verwijderen/rivm-noteer.png", en ? "Note date, time and place of the bite." : "Noteer datum, tijd en plek van de beet.", "rivm", "https://www.rivm.nl/tekenbeten")]],
    ["Controleer de beetplek en uw klachten.", "Zet met pen een kring rond de beetplek. Let op een rode vlek of ring rond de beet, koorts, of gewrichts- of spierpijn. Bel bij twijfel de huisarts.", [afb("/verwijderen/lyme-symptomen.png", en ? "Lyme symptoms: expanding red ring around the bite, fever, joint or muscle pain." : "Lyme-symptomen: uitdijende rode ring rond de beet, koorts, gewrichts- of spierpijn.", "stz", "https://www.tekenbeetziekten.nl")]],
    ["Maak een foto van de verwijderde teek.", "Bewaar de teek in een dicht potje of een plastic zakje met lucht."],
  ];
  return (
    <div>
      <div style={{ display: "grid", gap: 8, marginTop: 12 }}>
        {rijen.map(([k, s, imgs], i) => (
          <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start", padding: "9px 11px", border: `1px solid ${T.lijn}`, borderRadius: 8, background: T.papier }}>
            <span style={{ fontSize: 11, fontWeight: 800, color: T.primair, flexShrink: 0, marginTop: 1 }}>{String(i + 1).padStart(2, "0")}</span>
            <span style={{ flex: 1 }}>
              <strong style={{ display: "block", fontSize: 12.5 }}>{k}</strong>
              <span style={{ fontSize: 11.5, color: T.grijs }}>{s}</span>
              {imgs && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 8 }}>
                  {imgs.map((img, j) => (
                    <div key={j} style={{ flex: "1 1 180px", maxWidth: 280, borderRadius: 6, overflow: "hidden", border: `1px solid ${T.lijn}`, background: T.achtergrond }}>
                      <img src={img.src} alt={img.alt} loading="lazy" style={{ display: "block", width: "100%", height: "auto" }} />
                    </div>
                  ))}
                </div>
              )}
            </span>
          </div>
        ))}
      </div>
      <Notitie>Blijft er een stukje kop achter? Dat is ongevaarlijk. Het komt er vanzelf uit, net als bij een splinter.</Notitie>
      <button type="button" onClick={onKlaar} style={{ ...S.knop, marginTop: 14 }}>De teek is eruit — ga verder</button>
      <div style={{ marginTop: 18, padding: "10px 12px", borderRadius: 8, background: T.primairLicht, border: `1px solid ${T.lijn}` }}>
        <strong style={{ fontSize: 12, color: T.primairDonker, display: "block", marginBottom: 6 }}>{en ? "Sources" : "Bronnen"}</strong>
        <ul style={{ margin: 0, paddingLeft: 16, fontSize: 11, color: T.inkt, lineHeight: 1.5 }}>
          <li><a href="https://www.rivm.nl/tekenbeten" target="_blank" rel="noopener noreferrer" style={{ color: T.primair, textDecoration: "underline" }}>RIVM</a></li>
          <li><a href="https://www.tekenbeetziekten.nl" target="_blank" rel="noopener noreferrer" style={{ color: T.primair, textDecoration: "underline" }}>Stichting Tekenbeetziekten</a></li>
          <li><a href="https://lymevereniging.nl" target="_blank" rel="noopener noreferrer" style={{ color: T.primair, textDecoration: "underline" }}>Lymevereniging</a></li>
        </ul>
      </div>
    </div>
  );
}

function Tijdlijn({ duur, verwijderd }: { duur: string | null; verwijderd: string | null }) {
  const en = useTaal() === "en";
  const pct = (u: number) => (u / 96) * 100;
  const balk = (tot: number, kleur: string, streep?: boolean): React.CSSProperties => ({
    position: "absolute", left: 0, width: `${pct(tot)}%`, top: 0, bottom: 0, borderRadius: 4,
    background: streep ? `repeating-linear-gradient(135deg, ${kleur}, ${kleur} 4px, transparent 4px, transparent 8px)` : kleur,
  });
  const rijen = [
    { label: "Hoe lang de teek vastzat", grens: 24,
      stijl: duur === "kort" ? balk(18, "#4A9FD4") : duur === "lang" ? balk(60, T.alarm) : duur === "onbekend" ? balk(96, T.grijs, true) : null },
    { label: "Tijd sinds verwijderen", grens: 72,
      stijl: verwijderd === "binnen" ? balk(40, T.primair) : verwijderd === "buiten" ? balk(96, T.grijs) : verwijderd === "onbekend" ? balk(96, T.grijs, true) : null },
  ];
  return (
    <div style={{ display: "grid", gap: 10, margin: "14px 0 4px" }}>
      {rijen.map((r, i) => (
        <div key={i}>
          <div style={{ fontSize: 10.5, fontWeight: 700, color: T.grijs, marginBottom: 16 }}>{vertaalTekst(r.label, en)}</div>
          <div style={{ position: "relative", height: 10, background: T.primairLicht, borderRadius: 4 }}>
            {r.stijl && <div style={r.stijl} />}
            <span style={{ position: "absolute", left: `${pct(r.grens)}%`, top: -3, bottom: -3, width: 1.5, background: T.primairDonker }} />
            <span style={{ position: "absolute", left: `${pct(r.grens)}%`, transform: "translateX(-50%)", bottom: "calc(100% + 5px)", fontSize: 9, color: T.primairDonker, fontWeight: 700, whiteSpace: "nowrap" }}>{r.grens} uur</span>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ============ tussentijdse informatie (na vraag 11) ============ */
const TUSSEN = "tussenadvies";

function RapportFotos({ beelden }: { beelden: Antwoorden["beelden"] }) {
  const en = useTaal() === "en";
  return <>{(["beetplek", "teek"] as const).map((soort) => {
    if (!beelden[soort].length) return null;
    const titel = soort === "beetplek"
      ? (en ? "Photo of bite site" : "Foto van beetplek")
      : (en ? "Photo of tick" : "Foto van de teek");
    return <section key={soort} className="mt-4">
      <h3 style={S.h3}>{titel}</h3>
      <div className="grid grid-cols-2 gap-3">
        {beelden[soort].map((src, i) => <img key={`${soort}-${i}`} src={src}
          alt={`${titel} ${i + 1}`} className="aspect-square w-full rounded-md border border-border object-contain bg-card" />)}
      </div>
    </section>;
  })}</>;
}

function TussenAdvies({ a, advies, verder, terug, wisFotos, bewaarTussen }: { a: Antwoorden; advies: Advies; verder: () => void; terug: () => void; wisFotos: () => void; bewaarTussen: (snap: { a: Antwoorden; advies: Advies }) => void }) {
  const [voorbeeld, setVoorbeeld] = useState<string | null>(null);
  const [gekopieerd, setGekopieerd] = useState(false);
  const en = useTaal() === "en";
  const tips = persoonlijkeTips(a, en);
  const kleur = advies.toon === "spoed" || advies.toon === "urgent" ? T.alarm : T.primair;
  const gegevens = samenvattingDelen(a);

  const kopieer = () => {
    try {
      navigator.clipboard.writeText(samenvatting(a));
      setGekopieerd(true);
      setTimeout(() => setGekopieerd(false), 2500);
    } catch { setGekopieerd(false); }
  };

  return (
    <div style={{ ...S.kaart, borderTop: `3px solid ${kleur}` }}>
      <div style={S.eyebrow}>{en ? "Your attention points" : "Uw aandachtspunten"}</div>
      <h2 style={{ ...S.h2, color: kleur }}>{advies.titel}</h2>
      <p style={S.p}>{advies.tekst}</p>

      <p style={{
        ...S.p,
        marginTop: 10,
        padding: 12,
        background: T.alarmLicht,
        borderRadius: 8,
        borderLeft: `4px solid ${T.alarm}`,
        fontWeight: 600,
        color: T.alarm,
      }}>
        {vertaalTekst("Bespreek klachten of vragen met een arts. Bij een levensbedreigende situatie belt u 112.", en)}
      </p>

      <Tijdlijn duur={a.duur} verwijderd={a.verwijderd} />

      <h3 style={S.h3}>{en ? "Information you recorded" : "Vastgelegde informatie"}</h3>
      <ul style={S.lijst}>{gegevens.huidig.map((regel, i) => <li key={i}>{vertaalTekst(regel, en)}</li>)}</ul>

      {tips.length > 0 && (
        <>
          <h3 style={S.h3}>{en ? "Relevant general information" : "Relevante algemene informatie"}</h3>
          {tips.map((t) => (
            <div key={t.kop} style={{ marginTop: 8, padding: "10px 12px", background: T.primairLicht, borderRadius: 8 }}>
              <div style={{ ...S.eyebrow, color: T.primair }}>{t.kop}</div>
              <p style={{ ...S.p, margin: "5px 0 0" }}>{t.tekst}</p>
            </div>
          ))}
        </>
      )}

      <h3 style={S.h3}>{en ? "Your personal record" : "Uw persoonlijke overzicht"}</h3>
      <RapportFotos beelden={a.beelden} />
      <p style={S.p}>
        {en
          ? "You can already save or print an interim record of the answers entered so far. The complete record at the end includes this interim record."
          : "U kunt nu al een tussentijds overzicht opslaan of printen met de antwoorden tot hier. Het complete overzicht aan het einde bevat dit tussentijdse overzicht."}
      </p>
      <button type="button" onClick={kopieer} style={{ ...S.knop, marginTop: 12 }}>
        {gekopieerd
          ? (en ? "Copied ✓" : "Gekopieerd ✓")
          : (en ? "Copy and save for your GP and/or specialist" : "Kopieer en sla op voor de huisarts en/of specialist")}
      </button>
      <div style={{ display: "flex", gap: 8, marginTop: 8, flexWrap: "wrap" }}>
        <button type="button" onClick={() => { setVoorbeeld(bouwPrintHtml(a, advies, true)); bewaarTussen({ a, advies }); wisFotos(); }}
          style={{ ...S.knop, flex: "1 1 160px", width: "auto", background: "transparent", color: T.primair, border: `1.5px solid ${T.primair}` }}>
          {en ? "Print / PDF" : "Print / pdf"}
        </button>
        <button type="button" onClick={() => { setVoorbeeld(bouwPrintHtml(a, advies, true)); bewaarTussen({ a, advies }); wisFotos(); }}
          style={{ ...S.knop, flex: "1 1 160px", width: "auto", background: "transparent", color: T.primair, border: `1.5px solid ${T.primair}` }}>
          {en ? "Save / PDF" : "Opslaan / pdf"}
        </button>
      </div>
      <p style={{ fontSize: 10.5, lineHeight: 1.5, color: T.grijs, margin: "7px 0 0" }}>
        {en
          ? "You will see a preview first. Then print the report or save it as a PDF file. The photos remain temporarily available for both reports and repeated PDF export until you reset the wizard or close the page."
          : "U krijgt eerst een voorbeeld te zien. Daarna print u het rapport of sla u het op als pdf-bestand. De foto's blijven tijdelijk beschikbaar voor beide rapporten en herhaalde pdf-export tot u de wizard reset of de pagina sluit."}
      </p>
      {voorbeeld && <PrintVoorbeeld html={voorbeeld} sluit={() => setVoorbeeld(null)} />}

      <div style={{ ...S.kaart, marginTop: 14, padding: 14 }}>
        <div style={S.eyebrow}>{en ? "Report your tick bite" : "Meld uw tekenbeet"}</div>
        <p style={{ ...S.p, marginTop: 8 }}>
          {en
            ? <>Report the bite on <A href="https://tekenradar.nl">Tekenradar.nl</A>. This helps researchers track where and when ticks are active — and you keep your own bite on record.</>
            : <>Meld de beet op <A href="https://tekenradar.nl">Tekenradar.nl</A>. Daarmee helpt u onderzoekers volgen waar en wanneer teken actief zijn — en u houdt uw eigen beet bij.</>}
        </p>
        <p style={{
          ...S.p,
          marginTop: 10,
          padding: 12,
          background: T.primairLicht,
          borderRadius: 8,
          borderLeft: `4px solid ${T.primair}`,
          fontWeight: 500,
          color: T.primairDonker,
        }}>
          {en
            ? "You can report your bite now or after completing the questions. Report the same bite only once."
            : "U kunt uw beet nu melden of na het afronden van de vragen. Meld dezelfde beet slechts één keer."}
        </p>
        <a href="https://tekenradar.nl" target="_blank" rel="noopener noreferrer"
          style={{ ...S.knop, marginTop: 10, textAlign: "center", textDecoration: "none", display: "block" }}>
          {en ? "Report tick bite on Tekenradar.nl" : "Meld tekenbeet bij Tekenradar.nl"}
        </a>
      </div>

      <button type="button" onClick={verder} style={{ ...S.knop, marginTop: 14 }}>
        {en ? "Continue with the next questions" : "Ga door met de volgende vragen"}
      </button>
      <p style={{ ...S.p, marginTop: 8, fontSize: 13.5 }}>
        {en
          ? "Continue to create a more complete record of your entries."
          : "Ga verder om een vollediger overzicht te maken van uw antwoorden."}
      </p>
      <button type="button" onClick={terug} style={S.terug}>
        {en ? "← Previous" : "← Vorige"}
      </button>
    </div>
  );
}

/* ============ resultaat ============ */
function Resultaat({ a, advies, setDatum, opnieuw, wisFotos, tussen }: { a: Antwoorden; advies: Advies; setDatum: (v: string) => void; opnieuw: () => void; wisFotos: () => void; tussen?: { a: Antwoorden; advies: Advies } | null }) {
  const [gekopieerd, setGekopieerd] = useState(false);
  const [voorbeeld, setVoorbeeld] = useState<string | null>(null);
  const [onderzoek, setOnderzoek] = useState(false);
  const [deelnamenummer, setDeelnamenummer] = useState<string | null>(null);
  const [intrekcode, setIntrekcode] = useState<string | null>(null);
  const [gemeld, setGemeld] = useState(false);
  const en = useTaal() === "en";
  const tips = persoonlijkeTips(a, en);

  /* Na het drukken op de meldknop krijgt een lopende deelname de status 'Tekenbeet gemeld'. */
  const meldTekenradar = () => {
    setGemeld(true);
    if (!deelnamenummer || !intrekcode) return;
    void meldTekenbeetGemeld({ data: { deelnamenummer, intrekcode } }).catch(() => undefined);
  };

  const prov = PROVINCIES.find((p) => p.id === a.provincie);
  const soort = TEKENSOORTEN.find((t) => t.id === a.soort);
  const urgent = advies.toon === "spoed" || advies.toon === "urgent";
  const kleur = urgent ? T.alarm : T.primair;

  const kopieer = () => {
    try {
      navigator.clipboard.writeText(samenvatting(a));
      setGekopieerd(true);
      setTimeout(() => setGekopieerd(false), 2500);
    } catch { setGekopieerd(false); }
  };

  return (
    <>
      <div style={{ ...S.kaart, borderTop: `3px solid ${kleur}` }}>
        <div style={S.eyebrow}>{en ? "Your attention points" : "Uw aandachtspunten"}</div>
        <h2 style={{ ...S.h2, color: kleur }}>{advies.titel}</h2>
        <p style={S.p}>{advies.tekst}</p>

        <p style={{
          ...S.p,
          marginTop: 10,
          padding: 12,
          background: T.alarmLicht,
          borderRadius: 8,
          borderLeft: `4px solid ${T.alarm}`,
          fontWeight: 600,
          color: T.alarm,
        }}>
          {vertaalTekst("Bespreek klachten of vragen met een arts. Bij een levensbedreigende situatie belt u 112.", en)}
        </p>

        <Tijdlijn duur={a.duur} verwijderd={a.verwijderd} />

        {tips.length > 0 && (
          <>
            <h3 style={S.h3}>{en ? "Relevant general information" : "Relevante algemene informatie"}</h3>
            {tips.map((t) => (
              <div key={t.kop} style={{ marginTop: 8, padding: "10px 12px", background: T.primairLicht, borderRadius: 8 }}>
                <div style={{ ...S.eyebrow, color: T.primair }}>{t.kop}</div>
                <p style={{ ...S.p, margin: "5px 0 0" }}>{t.tekst}</p>
              </div>
            ))}
            <p style={{ fontSize: 10.5, lineHeight: 1.5, color: T.grijs, margin: "7px 0 0" }}>
              {en ? "This general information was selected from the details you entered. It is not an individual medical assessment." : "Deze algemene informatie is geselecteerd aan de hand van de gegevens die u hebt ingevuld. Het is geen individuele medische beoordeling."}
            </p>
          </>
        )}

        {soort && (
          <>
            <h3 style={S.h3}>{en ? "About this tick" : "Over deze teek"}</h3>
            <p style={S.p}>
              <strong>{vertaalTekst(soort.naam, en)}</strong>
              {soort.bijnaam && ` (${vertaalTekst(soort.bijnaam, en)})`}
              {soort.latijn && <em> · {soort.latijn}</em>}. {vertaalTekst(soort.context, en)}
            </p>
            {soort.melden && <Notitie>{vertaalTekst("Meld uw vondst bij de NVWA. Het Centrum Monitoring Vectoren brengt in kaart waar de vlekkenteek, de reuzenteek en de bruine hondenteek in Nederland opduiken.", en)}</Notitie>}
            {soort.hond && <Notitie>{vertaalTekst("Controleer ook uw hond en bel de dierenarts. Deze soort kan zich binnenshuis voortplanten, dus kijk in manden, kieren en plinten.", en)}</Notitie>}
            {soort.klasse === "zacht" && <Notitie>{vertaalTekst("Laat een duivennest op zolder of aan de gevel weghalen en de ruimte behandelen. Zolang het nest er zit, komen de beten terug.", en)}</Notitie>}
          </>
        )}

        <h3 style={S.h3}>{en ? "Recording and general information" : "Vastleggen en algemene informatie"}</h3>
        {advies.zacht ? (
          <ul style={S.lijst}>
            <li>{vertaalTekst("Noteer de datum en maak een foto van de beetplek, zodat u kunt zien of de zwelling toe- of afneemt.", en)}</li>
            <li>{vertaalTekst("Zoek de bron: een duivennest op zolder, achter dakbeschot of aan de gevel.", en)}</li>
            <li>{vertaalTekst("Bel de huisarts bij een felle of groter wordende zwelling. Bel 112 bij benauwdheid, een dik gezicht of duizeligheid.", en)}</li>
            <li>{vertaalTekst("De drie-maandencontrole op een rode ring is hier niet nodig; die hoort bij de schapenteek.", en)}</li>
          </ul>
        ) : (
          <ul style={S.lijst}>
            <li>{vertaalTekst("Noteer de datum van de beet en waar op uw lichaam hij zat. Maak een foto.", en)}</li>
            <li>{vertaalTekst("Houd de beetplek én de rest van uw lichaam drie maanden in de gaten.", en)}</li>
            <li>{vertaalTekst("Leg huidveranderingen rond de beetplek en elders op het lichaam vast. Bespreek een groter wordende rode of blauwrode vlek of ring, of nieuwe klachten na een tekenbeet, met een arts.", en)}</li>
            <li>{vertaalTekst("Een bloedtest kort na een tekenbeet kan een vroege infectie niet betrouwbaar uitsluiten. Een arts bepaalt of en wanneer onderzoek zinvol is.", en)}</li>
          </ul>
        )}

        <label style={{ display: "block", marginTop: 12, fontSize: 11.5, fontWeight: 700, color: T.grijs }}>
          {en ? "Date of the bite (for your own records)" : "Datum van de beet (voor uw eigen dossier)"}
          <input type="date" value={a.datum} onChange={(e) => setDatum(e.target.value)}
            style={{ display: "block", marginTop: 5, padding: "8px 10px", border: `1px solid ${T.lijn}`, borderRadius: 8, fontFamily: T.font, fontSize: 13, width: "100%", maxWidth: 220, background: T.papier, color: T.inkt, boxSizing: "border-box" }} />
        </label>
        <h3 style={S.h3}>{en ? "Personal record (complete)" : "Persoonlijk overzicht (compleet)"}</h3>
        <RapportFotos beelden={a.beelden} />
        <p style={S.p}>
          {en
            ? "This complete record includes the attention points and all answers you entered."
            : "Dit complete overzicht bevat de aandachtspunten en alle antwoorden die u hebt ingevuld."}
        </p>
        <button type="button" onClick={kopieer} style={{ ...S.knop, marginTop: 12 }}>
          {gekopieerd ? (en ? "Copied ✓" : "Gekopieerd ✓") : (en ? "Copy summary for your GP and/or specialist" : "Kopieer samenvatting voor de huisarts en/of specialist")}
        </button>
        <div style={{ display: "flex", gap: 8, marginTop: 8, flexWrap: "wrap" }}>
          <button type="button" onClick={() => { setVoorbeeld(bouwPrintHtml(a, advies, false, tussen)); wisFotos(); }}
            style={{ ...S.knop, flex: "1 1 160px", width: "auto", background: "transparent", color: T.primair, border: `1.5px solid ${T.primair}` }}>
            {en ? "Print / PDF" : "Print / pdf"}
          </button>
          <button type="button" onClick={() => { setVoorbeeld(bouwPrintHtml(a, advies, false, tussen)); wisFotos(); }}
            style={{ ...S.knop, flex: "1 1 160px", width: "auto", background: "transparent", color: T.primair, border: `1.5px solid ${T.primair}` }}>
            {en ? "Save / PDF" : "Opslaan / pdf"}
          </button>
        </div>
        <p style={{ fontSize: 10.5, lineHeight: 1.5, color: T.grijs, margin: "7px 0 0" }}>
          {en ? "You will first see a preview. Save the overview as a PDF or print it for your own records or to discuss with a doctor. The photos remain temporarily available for both reports and repeated PDF export until you reset the wizard or close the page." : <>U krijgt eerst een voorbeeld te zien. Sla het overzicht op als pdf of print het voor uw eigen dossier of om met een arts te bespreken. De foto&apos;s blijven tijdelijk beschikbaar voor beide rapporten en herhaalde pdf-export tot u de wizard reset of de pagina sluit.</>}
        </p>
        {voorbeeld && <PrintVoorbeeld html={voorbeeld} sluit={() => setVoorbeeld(null)} />}

        <h3 style={S.h3}>{en ? "Take part in research" : "Deelnemen aan onderzoek"}</h3>
        <p style={S.p}>
          {en
            ? "You can make the information entered in Tick Bite Guide, including the report for your GP and/or specialist, available pseudonymously for scientific research into tick bites in the Netherlands. You first read the consent form; after agreeing, you receive a unique participant number and the data is stored in the research database."
            : "U kunt de ingevulde gegevens van TekenbeetGids, inclusief het rapport voor de huisarts en/of specialist, gepseudonimiseerd beschikbaar stellen voor wetenschappelijk onderzoek naar tekenbeten in Nederland. U leest eerst het toestemmingsformulier; na akkoord krijgt u een uniek deelnamenummer en worden de gegevens opgeslagen in de onderzoeksdatabase."}
        </p>
        <button type="button" onClick={() => setOnderzoek(true)} style={{ ...S.knop, marginTop: 4 }}>
          {en ? "Take part in research" : "Deelnemen aan onderzoek"}
        </button>
        <p style={{ fontSize: 10.5, lineHeight: 1.5, color: T.grijs, margin: "7px 0 0" }}>
          {en ? "No name, address, email address or photos are stored." : <>Geen naam, adres, e-mailadres of foto&apos;s worden opgeslagen.</>}
        </p>
        {onderzoek && <OnderzoekDialoog a={a} advies={advies} sluit={() => setOnderzoek(false)} onNummer={(n, c) => { setDeelnamenummer(n); setIntrekcode(c); }} />}

      </div>


      {prov && (
        <div style={{ ...S.kaart, marginTop: 12 }}>
          <div style={S.eyebrow}>{en ? "Context" : "Context"} — {prov.naam}</div>
          {prov.id === "buitenland" ? (
            <p style={{ ...S.p, marginTop: 8 }}>{en ? "A tick bite abroad may involve different pathogens than in the Netherlands. Tell your doctor in which country and area you were bitten; they can consult an infectious-disease specialist or Lyme expertise centre if necessary." : "Bij een tekenbeet in het buitenland spelen andere ziekteverwekkers dan hier. Vertel uw huisarts in welk land en welk gebied u bent gebeten; die kan zo nodig overleggen met een internist-infectioloog of een Lyme-expertisecentrum."}</p>
          ) : (
            <>
              {prov.klasse !== null && (
                <p style={{ ...S.p, marginTop: 8, display: "flex", alignItems: "center", gap: 8 }}>
                  <span aria-hidden style={{ width: 11, height: 11, borderRadius: 3, background: RISK[prov.klasse], flexShrink: 0 }} />
                  <span>{en ? "Tick risk indication" : "Tekenrisico-indicatie"} <strong>{vertaalTekst(RISK_LBL[prov.klasse] ?? "", en).toLowerCase()}</strong> {en ? "— class based on reported tick bites, not a measurement of tick density." : "— klasse op basis van gemelde tekenbeten, geen meting van tekendichtheid."}</span>
                </p>
              )}
              <ul style={{ ...S.lijst, marginTop: 6 }}>
                <li>{en ? "Lyme disease: ticks carrying Borrelia occur in every province, including urban parks and gardens. About 1 in 5 Dutch ticks carries the bacterium; 2 to 3 percent of bites lead to Lyme disease." : "Ziekte van Lyme: teken met Borrelia komen in alle provincies voor, ook in stadsparken en tuinen. Circa 1 op de 5 Nederlandse teken draagt de bacterie; 2 tot 3 procent van de beten leidt tot Lyme."}</li>
                <li>TBE: {vertaalTekst(TBE_TEKST[prov.tbe], en)} {prov.gebied ? vertaalTekst(prov.gebied, en) : ""}</li>
                <li>{en ? "TBE occurs in small, local clusters rather than across an entire province. The virus can be transmitted earlier during a bite than Borrelia; an exact safe time window cannot be established. Prompt removal remains important but does not reliably protect against TBE. In areas where the virus has been found, an estimated 1 in 1,500 ticks carries it. View the full map on TekenRisicoKaart.nl." : "TBE zit in kleine, lokale haarden en niet provinciedekkend. Het virus kan eerder tijdens de beet worden overgedragen dan Borrelia; een exact veilig tijdsvenster is niet vast te stellen. Snel verwijderen blijft belangrijk, maar biedt geen betrouwbare bescherming tegen TBE. In gebieden waar het virus is gevonden draagt naar schatting 1 op de 1.500 teken het bij zich. Bekijk de volledige kaart op TekenRisicoKaart.nl."}</li>
              </ul>
            </>
          )}
        </div>
      )}

      <div style={{ ...S.kaart, marginTop: 12 }}>
        <div style={S.eyebrow}>{en ? "Report your tick bite" : "Meldt uw tekenbeet"}</div>
        <p style={{ ...S.p, marginTop: 8 }}>
          {en
            ? <>Report the bite on <A href="https://tekenradar.nl">Tekenradar.nl</A>. This helps researchers track where and when ticks are active — and you keep your own bite on record.</>
            : <>Meld de beet op <A href="https://tekenradar.nl">Tekenradar.nl</A>. Daarmee help uw onderzoekers volgen waar en wanneer teken actief zijn — en u houdt uw eigen beet bij.</>}
        </p>
        <a href="https://tekenradar.nl" target="_blank" rel="noopener noreferrer" onClick={meldTekenradar}
          style={{ ...S.knop, marginTop: 10, textAlign: "center", textDecoration: "none", display: "block" }}>
          {en ? "Report tick bite" : "Tekenbeet melden"}
        </a>
        {gemeld && (
          <p style={{ fontSize: 10.5, lineHeight: 1.5, color: T.grijs, margin: "7px 0 0" }}>
            {deelnamenummer
              ? (en ? `Your participation (${deelnamenummer}) now has the status ‘Tick bite reported’.` : `Uw deelname (${deelnamenummer}) heeft nu de status ‘Tekenbeet gemeld’.`)
              : (en ? "Tekenradar has opened in a new tab." : "Tekenradar is in een nieuw tabblad geopend.")}
          </p>
        )}
      </div>

      <div style={{ ...S.kaart, marginTop: 12 }}>
        <div style={S.eyebrow}>{en ? "Where to go next" : "Waar u verder terechtkunt"}</div>
        <ul style={{ ...S.lijst, marginTop: 8 }}>
          <li><A href="https://www.rivm.nl/tekenbeet-en-lyme">RIVM</A> — {en ? "national information on ticks, Lyme disease and tick-borne encephalitis." : "landelijke informatie over teken, de ziekte van Lyme en tekenencefalitis."}</li>
          <li><A href="https://www.ggd.nl">GGD</A> — {en ? "your regional public health service, including questions about TBE vaccination." : "uw regionale GGD, onder meer voor vragen over vaccinatie tegen tekenencefalitis."}</li>
          <li><A href="https://www.tekenbeetziekten.nl">Stichting Tekenbeetziekten</A> — {en ? "patient information on Lyme and other tick-borne diseases." : "patiëntenvoorlichting over Lyme en de andere tekenbeetziekten."}</li>
          <li><A href="https://www.lymevereniging.nl">Lymevereniging</A> — {en ? "peer support, advocacy and the Symptom Tracker." : "lotgenotencontact, belangenbehartiging en de Symptomentracker."}</li>
        </ul>

        <Notitie>{en ? "Not sure? Always call your own GP. For paralysis, severe confusion, shortness of breath or rapid deterioration, call 112." : "Twijfelt u? Bel altijd uw eigen huisarts. Bij verlamming, ernstige verwardheid, benauwdheid of snelle verslechtering belt u 112."}</Notitie>
      </div>

      <button type="button" onClick={opnieuw} style={{ ...S.knop, marginTop: 12 }}>
        {en ? "Start over" : "Begin opnieuw"}
      </button>
    </>
  );
}

/* Upload-blok per vraag: foto's blijven lokaal en komen in de samenvatting/pdf. */
function FotoUpload({ titel, beelden, voegToe, verwijder }: {
  titel: string; beelden: string[]; voegToe: (fs: File[]) => void; verwijder: (i: number) => void;
}) {
  const en = useTaal() === "en";
  const vol = beelden.length >= MAX_FOTOS;
  const [fout, setFout] = useState<string | null>(null);
  const kies = (lijst: FileList) => {
    const goed: File[] = [];
    let melding: string | null = null;
    for (const f of Array.from(lijst)) {
      const m = controleerBestand(f);
      if (m) melding = m; else goed.push(f);
    }
    setFout(melding);
    if (goed.length) voegToe(goed);
  };
  return (
    <div style={{ marginTop: 10, padding: 12, border: `1px solid ${T.lijn}`, borderRadius: 10, background: "#fff" }}>
      <div style={{ fontSize: 14, fontWeight: 600, color: T.primairDonker, marginBottom: 8 }}>{titel}</div>
      {beelden.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 8 }}>
          {beelden.map((src, i) => (
            <div key={i} style={{ position: "relative" }}>
              <img src={src} alt="" style={{ width: 92, height: 92, objectFit: "cover", borderRadius: 8, border: `1px solid ${T.lijn}`, display: "block" }} />
              <button type="button" onClick={() => verwijder(i)} aria-label="Foto verwijderen"
                style={{ position: "absolute", top: -8, right: -8, width: 24, height: 24, borderRadius: 12, border: `1px solid ${T.alarm}`, background: "#fff", color: T.alarm, fontSize: 14, lineHeight: "20px", cursor: "pointer", padding: 0 }}>×</button>
            </div>
          ))}
        </div>
      )}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        <label style={{ display: "inline-block", padding: "8px 14px", borderRadius: 8, border: `1.5px solid ${T.primair}`, color: T.primair, fontSize: 14, fontWeight: 600, cursor: vol ? "not-allowed" : "pointer", opacity: vol ? 0.45 : 1 }}>
          {vol ? "Maximum bereikt" : "Foto uploaden"}
          <input type="file" accept="image/jpeg,image/png,image/webp" multiple disabled={vol}
            onChange={(e) => { if (e.target.files?.length) kies(e.target.files); e.target.value = ""; }}
            style={{ display: "none" }} />
        </label>
        {!vol && (
          <label style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: 8, border: `1.5px solid ${T.primair}`, background: T.primair, color: "#fff", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
            {en ? "Take photo" : "Foto maken"}
            <span style={{ fontSize: 11, fontWeight: 500, opacity: 0.85, lineHeight: 1.2 }}>
              {en ? "(only usable with a tablet and/or smartphone)" : "(Alleen bruikbaar met een tablet en/of smartphone)"}
            </span>
            <input type="file" accept="image/*" capture="environment"
              onChange={(e) => { if (e.target.files?.length) kies(e.target.files); e.target.value = ""; }}
              style={{ display: "none" }} />
          </label>
        )}
      </div>

      {fout && (
        <div role="alert" style={{ fontSize: 12.5, color: T.alarm, marginTop: 8, fontWeight: 600 }}>{fout}</div>
      )}
      <div style={{ fontSize: 12, color: T.grijs, marginTop: 6 }}>{en ? `Maximum ${MAX_FOTOS} photos, JPG, PNG or WEBP up to ${MAX_BESTAND_MB} MB per photo. ` : `Maximaal ${MAX_FOTOS} foto's, JPG, PNG of WEBP tot ${MAX_BESTAND_MB} MB per foto. `}{en
        ? "Photos are automatically resized and remain local on your device. They are not sent to our server unless you explicitly choose an AI-scan. Photos can be included locally in your summary and PDF."
        : "Foto's worden automatisch verkleind en blijven lokaal op uw apparaat. Ze worden niet naar onze server verzonden, tenzij u expliciet kiest voor een AI-scan. Foto's kunnen lokaal worden opgenomen in uw samenvatting en PDF."}</div>

    </div>
  );
}

/* Stap: AI-scan van de beetplek.
   De foto wordt verkleind, blijft in de samenvatting/pdf en wordt eenmalig
   naar de AI gestuurd die hem met de referentiebeelden vergelijkt. */
function ScanStap({ beelden, voegToe, verwijder, resultaat, zetResultaat, verder }: {
  beelden: string[]; voegToe: (fs: File[]) => void; verwijder: (i: number) => void;
  resultaat: ScanResultaat | null; zetResultaat: (r: ScanResultaat | null) => void; verder: () => void;
}) {
  const en = useTaal() === "en";
  const [bezig, setBezig] = useState(false);
  const [fout, setFout] = useState<string | null>(null);
  const [bevestiging, setBevestiging] = useState(false);
  const laatste = beelden[beelden.length - 1];

  const scan = async () => {
    if (!laatste) return;
    setBevestiging(false);
    setBezig(true); setFout(null); zetResultaat(null);
    try {
      const r = await scanBeetplekFn({ data: { afbeelding: laatste, taal: en ? "en" : "nl" } });
      zetResultaat(r as ScanResultaat);
    } catch (e) {
      setFout(e instanceof Error ? e.message : en ? "The scan failed. Please try again." : "De scan is mislukt. Probeer het opnieuw.");
    } finally {
      setBezig(false);
    }
  };

  /* Upload stays local; invalidate stale results without sending the photo. */
  const vorigeLaatste = useRef<string | undefined>(undefined);
  useEffect(() => {
    if (laatste !== vorigeLaatste.current) { zetResultaat(null); setBevestiging(false); }
    vorigeLaatste.current = laatste;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [laatste]);

  const geenKenmerk = resultaat ? BEETPLEK_ZONDER_KENMERK.includes(resultaat.categorie) : false;
  const toonVeiligheid = resultaat && (!geenKenmerk || resultaat.categorie === "geen_kenmerk");

  return (
    <>
      {/* 1. Eerst de opties foto maken en foto uploaden */}
      <FotoUpload titel={en ? "Photograph or upload the bite site" : "Beetplek fotograferen of uploaden"}
        beelden={beelden} voegToe={voegToe} verwijder={verwijder} />

      {/* 2. Daarna de scanoptie */}
      <p style={{ ...S.p, marginTop: 12 }}>
        {en
          ? "Please note: only after your separate confirmation will the selected photo be sent via our server to the Google AI Studio / Gemini API for external AI processing. This is separate from research consent."
          : "Let op: pas na uw aparte bevestiging wordt de geselecteerde foto via onze server naar de Google AI Studio / Gemini API gestuurd voor externe AI-verwerking. Dit staat los van onderzoekstoestemming."}
      </p>
      <Button type="button" onClick={() => setBevestiging(true)} disabled={!laatste || bezig}
        style={{ ...S.knop, marginTop: 12, opacity: !laatste || bezig ? 0.4 : 1 }}>
        {bezig ? (en ? "Scanning…" : "Bezig met scannen…") : (en ? "Scan the bite site" : "Scan de beetplek")}
      </Button>
      <Dialog open={bevestiging} onOpenChange={setBevestiging}>
        <DialogContent className="w-[calc(100%-2rem)] max-h-[85dvh] overflow-y-auto rounded-lg">
          <DialogTitle className="pr-6 leading-snug">{en ? "Confirm external AI processing" : "Externe AI-verwerking bevestigen"}</DialogTitle>
          <DialogDescription className="leading-relaxed">
            {en
              ? "Do you explicitly consent to sending this photo via our server to the Google AI Studio / Gemini API for this scan? Google processes the photo; an EU processing region is not guaranteed."
              : "Geeft u uitdrukkelijk toestemming om deze foto voor deze scan via onze server naar de Google AI Studio / Gemini API te sturen? Google verwerkt de foto; een EU-verwerkingsregio is niet gegarandeerd."}
          </DialogDescription>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {en
              ? "Without confirmation, the photo stays local. We do not store the scan photo or add it to the research dataset. Research requires separate consent. Provider retention periods and Gemini contractual coverage remain unverified; the Google storage agreement does not establish coverage of this AI service."
              : "Zonder bevestiging blijft de foto lokaal. Wij slaan de scanfoto niet op en voegen deze niet toe aan het onderzoeksbestand. Voor onderzoek is aparte toestemming nodig. Bewaartermijnen bij dienstverleners en Gemini-contractdekking zijn nog niet geverifieerd; de Google-opslagovereenkomst bewijst geen dekking van deze AI-dienst."}
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed">{AI_BEPERKING[en ? 1 : 0]}</p>
          <a href="https://ai.google.dev/gemini-api/terms" target="_blank" rel="noopener noreferrer" className="text-sm text-primary underline">{en ? "Gemini API terms" : "Voorwaarden Gemini API"}</a>
          <div className="flex flex-col gap-2">
            <Button type="button" className="h-auto min-h-10 whitespace-normal" onClick={scan}>{en ? "I consent — send photo and scan" : "Ik geef toestemming — verstuur foto en scan"}</Button>
            <Button type="button" variant="outline" onClick={() => setBevestiging(false)}>{en ? "Cancel — do not send photo" : "Annuleren — foto niet versturen"}</Button>
          </div>
        </DialogContent>
      </Dialog>
      <p style={{ ...S.p, marginTop: 8, fontSize: 11.5, color: T.grijs }}>
        {en
          ? "You are using an AI system here (art. 50 EU AI Act). With an AI scan, the photo is sent via our server to an external AI service for processing. The photo is not stored by us, not added to the research dataset and not used by us to train AI models. More information about processing by external service providers and local storage can be found in the privacy statement and the cookie policy. The result describes visible features only and provides no medical advice."
          : "U gebruikt hier een AI-systeem (art. 50 Europese AI-verordening). Bij een AI-scan wordt de foto via onze server doorgestuurd naar een externe AI-dienst voor verwerking. De foto wordt niet door ons opgeslagen, niet toegevoegd aan het onderzoeksbestand en door ons niet gebruikt voor het trainen van AI-modellen. Meer informatie over de verwerking door externe dienstverleners en lokale opslag vindt u in de privacyverklaring en het cookiebeleid. De uitkomst beschrijft alleen zichtbare kenmerken en geeft geen medisch advies."}
      </p>
      {!laatste && !bezig && (
        <p style={{ ...S.p, marginTop: 8, color: T.grijs }}>
          {en
            ? "First photograph or upload the bite site above, then start the scan."
            : "Maak of upload hierboven eerst een foto van de beetplek, daarna start u de scan."}
        </p>
      )}


      {fout && <div role="alert" style={{ fontSize: 12.5, color: T.alarm, marginTop: 8, fontWeight: 600 }}>{fout}</div>}

      {resultaat && (
        <div role="status" data-scan-result className="mt-3 rounded-lg border border-primary bg-background p-3 text-foreground">
          <div className="text-xs font-semibold text-muted-foreground">{en ? "AI-scan result" : "Uitkomst AI-scan"}</div>
          <div className="mt-1 text-base font-bold text-primary">{resultaat.weergave}</div>
          {!geenKenmerk && <p className="mt-2 text-sm leading-relaxed">{en ? "Visual resemblance to reference features. This is a descriptive comparison, not a medical assessment." : "Visuele overeenkomst met referentiekenmerken. Dit is een beschrijvende vergelijking, geen medische beoordeling."}</p>}
          <p className="mt-2 text-sm leading-relaxed">{resultaat.vergelijking}</p>
          <p className="mt-2 text-sm leading-relaxed">{AI_BEPERKING[en ? 1 : 0]}</p>
          {toonVeiligheid && <>
            {resultaat.categorie !== "geen_kenmerk" && <p className="mt-2 text-sm font-semibold leading-relaxed">{SCAN_VEILIGHEIDSZIN[en ? 1 : 0]}</p>}
            <p className="mt-2 text-sm leading-relaxed">{SCAN_HUISARTSBOODSCHAP[en ? 1 : 0]}</p>
          </>}
        </div>
      )}

      <p style={{ ...S.p, marginTop: 12 }}>
        {!toonVeiligheid && SCAN_HUISARTSBOODSCHAP[en ? 1 : 0]}
      </p>
      {(() => {
        const klaar = !bezig;
        return (
          <button type="button" onClick={verder} disabled={!klaar}
            style={{ ...S.knop, marginTop: 12, background: klaar ? T.primair : "#9DC2D6", cursor: klaar ? "pointer" : "not-allowed" }}>
            {laatste
              ? (bezig
                ? (en ? "Scanning…" : "Bezig met scannen…")
                : resultaat
                  ? (en ? "Save and continue" : "Opslaan en verder")
                  : (en ? "Continue without AI comparison" : "Verder zonder AI-vergelijking"))
              : (en ? "I don't see a clear bite site" : "Ik zie geen duidelijke beetplek")}
          </button>
        );
      })()}
      {/* Aparte knop: altijd een expliciete keuze om zonder AI-vergelijking door te gaan.
          Verborgen als de hoofdknop die tekst al toont (foto aanwezig, geen scanresultaat). */}
      {!(laatste && !resultaat && !bezig) && (
        <button type="button" onClick={() => { zetResultaat(null); verder(); }} disabled={bezig}
          style={{ ...S.knop, marginTop: 8, background: "transparent", color: T.primair, border: `1.5px solid ${T.primair}`, opacity: bezig ? 0.4 : 1, cursor: bezig ? "not-allowed" : "pointer" }}>
          {en ? "Continue without AI comparison" : "Verder zonder AI-vergelijking"}
        </button>
      )}
    </>
  );
}

/* Stap: AI-scan van de verwijderde teek.
   De foto wordt verkleind, blijft in de samenvatting/pdf en wordt eenmalig
   naar de AI gestuurd die hem met de zes mensen-bijtende soorten vergelijkt. */
function ScanTeekStap({ beelden, voegToe, verwijder, resultaat, zetResultaat, zetSoort, verder }: {
  beelden: string[]; voegToe: (fs: File[]) => void; verwijder: (i: number) => void;
  resultaat: TeekScanResultaat | null; zetResultaat: (r: TeekScanResultaat | null) => void;
  zetSoort: (id: string) => void; verder: () => void;
}) {
  const en = useTaal() === "en";
  const [bezig, setBezig] = useState(false);
  const [fout, setFout] = useState<string | null>(null);
  const [bevestiging, setBevestiging] = useState(false);
  const laatste = beelden[beelden.length - 1];

  const scan = async () => {
    if (!laatste) return;
    setBevestiging(false);
    setBezig(true); setFout(null); zetResultaat(null);
    try {
      const r = await scanTeekFn({ data: { afbeelding: laatste, taal: en ? "en" : "nl" } });
      const res = r as TeekScanResultaat;
      zetResultaat(res);
      if (res.soort && TEKENSOORTEN.some((t) => t.id === res.soort)) zetSoort(res.soort);
    } catch (e) {
      setFout(e instanceof Error ? e.message : en ? "The scan failed. Please try again." : "De scan is mislukt. Probeer het opnieuw.");
    } finally {
      setBezig(false);
    }
  };

  /* Upload stays local; invalidate stale results without sending the photo. */
  const vorigeLaatste = useRef<string | undefined>(undefined);
  useEffect(() => {
    if (laatste !== vorigeLaatste.current) { zetResultaat(null); setBevestiging(false); }
    vorigeLaatste.current = laatste;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [laatste]);

  const kleur = resultaat && (resultaat.soort === "geen_teek" || resultaat.soort === "onbekend") ? T.grijs : T.primair;

  return (
    <>
      <FotoUpload titel={en ? "Photograph or upload the tick" : "Teek fotograferen of uploaden"}
        beelden={beelden} voegToe={voegToe} verwijder={verwijder} />

      <p style={{ ...S.p, marginTop: 12 }}>
        {en
          ? "Please note: only after your separate confirmation will the selected photo be sent via our server to the Google AI Studio / Gemini API for external AI processing. This is separate from research consent."
          : "Let op: pas na uw aparte bevestiging wordt de geselecteerde foto via onze server naar de Google AI Studio / Gemini API gestuurd voor externe AI-verwerking. Dit staat los van onderzoekstoestemming."}
      </p>
      <Button type="button" onClick={() => setBevestiging(true)} disabled={!laatste || bezig}
        style={{ ...S.knop, marginTop: 12, opacity: !laatste || bezig ? 0.4 : 1 }}>
        {bezig ? (en ? "Scanning…" : "Bezig met scannen…") : (en ? "Scan the tick" : "Scan de teek")}
      </Button>
      <Dialog open={bevestiging} onOpenChange={setBevestiging}>
        <DialogContent className="w-[calc(100%-2rem)] max-h-[85dvh] overflow-y-auto rounded-lg">
          <DialogTitle className="pr-6 leading-snug">{en ? "Confirm external AI processing" : "Externe AI-verwerking bevestigen"}</DialogTitle>
          <DialogDescription className="leading-relaxed">
            {en
              ? "Do you explicitly consent to sending this photo via our server to the Google AI Studio / Gemini API for this scan? Google processes the photo; an EU processing region is not guaranteed."
              : "Geeft u uitdrukkelijk toestemming om deze foto voor deze scan via onze server naar de Google AI Studio / Gemini API te sturen? Google verwerkt de foto; een EU-verwerkingsregio is niet gegarandeerd."}
          </DialogDescription>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {en
              ? "Without confirmation, the photo stays local. We do not store the scan photo or add it to the research dataset. Research requires separate consent. Provider retention periods and Gemini contractual coverage remain unverified; the Google storage agreement does not establish coverage of this AI service."
              : "Zonder bevestiging blijft de foto lokaal. Wij slaan de scanfoto niet op en voegen deze niet toe aan het onderzoeksbestand. Voor onderzoek is aparte toestemming nodig. Bewaartermijnen bij dienstverleners en Gemini-contractdekking zijn nog niet geverifieerd; de Google-opslagovereenkomst bewijst geen dekking van deze AI-dienst."}
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed">{AI_BEPERKING[en ? 1 : 0]}</p>
          <a href="https://ai.google.dev/gemini-api/terms" target="_blank" rel="noopener noreferrer" className="text-sm text-primary underline">{en ? "Gemini API terms" : "Voorwaarden Gemini API"}</a>
          <div className="flex flex-col gap-2">
            <Button type="button" className="h-auto min-h-10 whitespace-normal" onClick={scan}>{en ? "I consent — send photo and scan" : "Ik geef toestemming — verstuur foto en scan"}</Button>
            <Button type="button" variant="outline" onClick={() => setBevestiging(false)}>{en ? "Cancel — do not send photo" : "Annuleren — foto niet versturen"}</Button>
          </div>
        </DialogContent>
      </Dialog>
      <p style={{ ...S.p, marginTop: 8, fontSize: 11.5, color: T.grijs }}>
        {en
          ? "You are using an AI system here (art. 50 EU AI Act). With an AI scan, the photo is sent via our server to an external AI service for processing. The photo is not stored by us, not added to the research dataset and not used by us to train AI models. More information about processing by external service providers and local storage can be found in the privacy statement and the cookie policy. The result is an indicative species comparison, not a medical assessment."
          : "U gebruikt hier een AI-systeem (art. 50 Europese AI-verordening). Bij een AI-scan wordt de foto via onze server doorgestuurd naar een externe AI-dienst voor verwerking. De foto wordt niet door ons opgeslagen, niet toegevoegd aan het onderzoeksbestand en door ons niet gebruikt voor het trainen van AI-modellen. Meer informatie over de verwerking door externe dienstverleners en lokale opslag vindt u in de privacyverklaring en het cookiebeleid. De uitkomst is een indicatieve soortvergelijking en geen medische beoordeling."}
      </p>
      {!laatste && !bezig && (
        <p style={{ ...S.p, marginTop: 8, color: T.grijs }}>
          {en
            ? "First photograph or upload the tick above, then start the scan."
            : "Maak of upload hierboven eerst een foto van de teek, daarna start u de scan."}
        </p>
      )}

      {fout && <div role="alert" style={{ fontSize: 12.5, color: T.alarm, marginTop: 8, fontWeight: 600 }}>{fout}</div>}

      {resultaat && (
        <div style={{ marginTop: 12, padding: 12, border: `1px solid ${kleur}`, borderRadius: 10, background: "#fff" }}>
          <div style={{ ...S.eyebrow, color: T.grijs }}>{en ? "AI comparison with the reference species" : "AI-vergelijking met de referentiesoorten"}</div>
          <div style={{ fontSize: 15, fontWeight: 700, color: kleur, marginTop: 4 }}>{resultaat.titel}</div>

          {resultaat.kenmerken.length > 0 && (
            <ul style={{ margin: "8px 0 0", paddingLeft: 18, fontSize: 13, color: T.inkt, lineHeight: 1.55 }}>
              {resultaat.kenmerken.map((k, i) => <li key={i}>{k}</li>)}
            </ul>
          )}
          <p style={{ ...S.p, marginTop: 8 }}>{resultaat.advies}</p>
          <p style={{ fontSize: 11.5, color: T.grijs, marginTop: 8, lineHeight: 1.55 }}>
            {en
              ? "This automated comparison describes visible features only. It cannot diagnose a condition, determine urgency or decide what care is appropriate."
              : "Deze geautomatiseerde vergelijking beschrijft alleen zichtbare kenmerken. Zij kan geen aandoening vaststellen, geen urgentie bepalen en niet beslissen welke zorg passend is."}
          </p>
          <p style={{ fontSize: 11.5, color: T.grijs, marginTop: 8, lineHeight: 1.55 }}>{AI_BEPERKING[en ? 1 : 0]}</p>
        </div>
      )}

      <button type="button" onClick={verder} disabled={bezig}
        style={{ ...S.knop, marginTop: 12, background: !bezig ? T.primair : "#9DC2D6", cursor: !bezig ? "pointer" : "not-allowed" }}>
        {bezig
          ? (en ? "Scanning…" : "Bezig met scannen…")
          : resultaat
            ? (en ? "Save and continue" : "Opslaan en verder")
            : laatste
              ? (en ? "Continue without AI comparison" : "Verder zonder AI-vergelijking")
              : (en ? "Continue without AI comparison" : "Verder zonder AI-vergelijking")}
      </button>
    </>
  );
}




/* ============ hoofdcomponent ============ */

export default function TekenbeetHulp() {
  const en = useTaal() === "en";
  const [stap, setStap] = useState(-1);
  const [a, setA] = useState<Antwoorden>(leeg());
  /* Momentopname van het tussentijdse rapport (inclusief foto's), zodat het eindrapport het volledig kan tonen. */
  const [tussenSnap, setTussenSnap] = useState<{ a: Antwoorden; advies: Advies } | null>(null);
  const [mobile, setMobile] = useState(false);
  const kop = useRef<HTMLHeadingElement>(null);

  useEffect(() => { kop.current?.focus(); }, [stap]);
  useEffect(() => {
    const check = () => setMobile(window.innerWidth < 680);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const set = <K extends keyof Antwoorden>(k: K, v: Antwoorden[K]) => setA((p) => ({ ...p, [k]: v }));
  const toggle = (k: "klachten" | "bijzonder" | "omgeving" | "weer" | "foto" | "lichaamsdeel", v: string) =>
    setA((p) => {
      const l = p[k];
      if (v === "geen") return { ...p, [k]: l.includes("geen") ? [] : ["geen"] };
      const z = l.filter((x) => x !== "geen");
      return { ...p, [k]: z.includes(v) ? z.filter((x) => x !== v) : [...z, v] };
    });

  /* Foto's verkleinen en lokaal in de state bewaren; ook het vinkje wordt gezet. */
  const voegBeeldenToe = async (soort: "beetplek" | "teek", fs: File[]) => {
    const bestanden = fs.filter((f) => !controleerBestand(f)).slice(0, MAX_FOTOS);
    const nieuw = await Promise.all(bestanden.map(leesFoto));
    setA((p) => ({
      ...p,
      beelden: { ...p.beelden, [soort]: [...p.beelden[soort], ...nieuw].slice(0, MAX_FOTOS) },
      foto: p.foto.filter((x) => x !== "geen").includes(soort)
        ? p.foto.filter((x) => x !== "geen")
        : [...p.foto.filter((x) => x !== "geen"), soort],
    }));
  };
  const verwijderBeeld = (soort: "beetplek" | "teek", i: number) =>
    setA((p) => ({ ...p, beelden: { ...p.beelden, [soort]: p.beelden[soort].filter((_, x) => x !== i) } }));


  const nBeten = Math.min(Math.max(parseInt(a.aantalBeten, 10) || 0, 0), 10);
  const stappen = [
    "vast",
    a.vast === "ja" || a.vast === "onzeker" ? "verwijderen" : null,
"scan",
    /* Geen beschreven kenmerk is geen negatief huidantwoord: behoud handmatige invoer. */
    !a.scan || BEETPLEK_ZONDER_KENMERK.includes(a.scan.categorie) ? "em_manueel" : null,
    "uiterlijk",
    a.uiterlijk === "onbekend" ? null : "scan_teek",
    /* Handmatige soortvraag alleen als de AI-scan (of het overslaan ervan) geen soort heeft vastgelegd. */
    a.soort ? null : "soort",
    "duur",
    "verwijderd",
    "lichaamsdeel",
    "wie_verwijderd",
    "hoe_verwijderd",
    "restant",
    "klachten",
    a.klachten.length && !a.klachten.includes("geen") ? "klachten_duur" : null,
    "teek_bewaard",
    "provincie",
    "omgeving",
    "weer",
    "arts",
    "bijzonder",
    "eerste",
    a.eerste === "ja" ? "aantal" : null,
    ...(a.eerste === "ja" && nBeten > 0
      ? Array.from({ length: nBeten }, (_, i) => {
          const t = a.testen[i];
          return [
            `beetdatum_${i}`,
            `beetnl_${i}`,
            `em_${i}`,
            ...(t?.em === "ja"
              ? [
                  `emklachten_${i}`,
                  ...(t.emKlachten === "ja"
                    ? [
                        `embehandeld_${i}`,
                        ...(t.emBehandeld === "ja" ? [`emtijd_${i}`] : []),
                      ]
                    : []),
                ]
              : []),
            `getest_${i}`,
            ...(t?.getest === "ja"
              ? [
                  `testziekten_${i}`,
                  `testwat_${i}`,
                  `testmoment_${i}`,
                  ...(t.ziekten.filter((z) => z !== "onbekend").length ? [`testuitslag_${i}`, `testherhaald_${i}`] : []),
                  ...positieveZiekten(t).flatMap((z) => {
                    const b = t.behandelingen[z];
                    if (z === "alfagal") return alfaGalBehandelingStappen(i, b?.behandeld);
                    /* TBE is een virus: geen antibiotica. Alleen vragen over symptoombehandeling en experimentele medicijnen. */
                    if (z === "tbe") {
                      return [
                        `testbehandeld_${i}__${z}`,
                        ...(b?.behandeld === "ja"
                          ? [
                              `testtbe_${i}__${z}`,
                              ...(b.tbe === "ja" ? [`testtbemiddelen_${i}__${z}`] : []),
                              `testexp_${i}__${z}`,
                              ...(b.exp === "ja" ? [`testexpmiddelen_${i}__${z}`] : []),
                              `testherstel_${i}__${z}`,
                            ]
                          : []),
                      ];
                    }
                    return [
                      `testbehandeld_${i}__${z}`,
                      ...(b?.behandeld === "ja"
                        ? [
                            `testab_${i}__${z}`,
                            `testander_${i}__${z}`,
                            ...(b.ander === "ja" ? [`testmiddelen_${i}__${z}`] : []),
                            `testtbe_${i}__${z}`,
                            ...(b.tbe === "ja" ? [`testtbemiddelen_${i}__${z}`] : []),
                            `testherstel_${i}__${z}`,
                            /* Bleven er klachten over, dan vragen we naar een nieuwe behandeling en het herstel daarna. */
                            ...(b.herstel === "deels" || b.herstel === "nee"
                              ? [
                                  `testopnieuw_${i}__${z}`,
                                  ...(b.opnieuw === "ja"
                                    ? [`testopnieuwtijd_${i}__${z}`, `testherstel2_${i}__${z}`]
                                    : []),
                                ]
                              : []),
                          ]
                        : []),
                    ];
                  }),
                  `testwie_${i}`,
                  `testland_${i}`,
                ]
              : []),
          ];
        }).flat()
      : []),
    ...(a.eerste === "ja"
      ? ["ab_tussen", ...(a.abTussen === "ja" ? abTussenStappen(a) : [])]
      : []),
    "tbe_vaccin",
    ...(a.tbeVaccin === "ja" ? ["tbe_vaccin_welk"] : []),
    "leeftijd",
    "geslacht",
    "woonplaats",
    "afkomst",
    "nationaliteit",
    "opleiding",
    "risico_beroep",
    "huisdieren",
    "hobbydieren",
  ].filter(Boolean) as string[];
  /* Direct na de klachtenvraag een tussentijds advies tonen; deze tussenstap telt niet mee in de vraagnummering. */
  let tussenIndex = stappen.indexOf("klachten") + 1;
  if (stappen[tussenIndex] === "klachten_duur") tussenIndex += 1;
  stappen.splice(tussenIndex, 0, TUSSEN, "em_nu");

  const huidig = stappen[stap] ?? "";
  const klaar = stap >= stappen.length;
  const tussen = huidig === TUSSEN;
  const vraagTotaal = stappen.filter((s) => s !== TUSSEN).length;
  const vraagNummer = Math.min(stap + 1 - (stap > tussenIndex ? 1 : 0), vraagTotaal);
  const advies: Advies | null = tussen ? {
    toon: "afwachten",
    titel: en ? "Your record so far" : "Uw overzicht tot nu toe",
    tekst: en ? "Save this record if you would like to discuss your situation with a healthcare professional. The guide records your answers without assessing a condition, urgency or treatment." : "Sla dit overzicht op als u uw situatie wilt bespreken met een zorgverlener. De gids registreert uw antwoorden zonder een aandoening, urgentie of behandeling te beoordelen.",
  } : klaar ? bepaalAdvies(a) : null;

  /* Geen automatische opslag: de rapportage wordt alleen bewaard na toestemming voor onderzoek. */
  const behStap = huidig.match(/^(testbehandeld|testab|testander|testmiddelen|testtbemiddelen|testtbe|testexpmiddelen|testexp|testherstel2|testherstel|testopnieuwtijd|testopnieuw)_(\d+)__(.+)$/);
  const dynStap = behStap ?? huidig.match(/^(beetdatum|beetnl|em|emklachten|embehandeld|emtijd|getest|testziekten|testwat|testmoment|testherhaald|testuitslag|testwie|testland)_(\d+)$/);
  const dynSoort = dynStap?.[1] ?? "";
  const dynIndex = dynStap ? parseInt(dynStap[2] ?? "0", 10) : -1;
  const behZiekte = behStap?.[3] ?? "";
  const beetIndex = dynSoort === "beetdatum" ? dynIndex : -1;
  const nlIndex = dynSoort === "beetnl" ? dynIndex : -1;
  const testIndex = dynSoort && dynSoort !== "beetdatum" && dynSoort !== "beetnl" ? dynIndex : -1;
  /* Herhaalbaar antibiotica-blok: kuur 0 = de eerste (abTussenSoort/...), kuur k>0 = abTussenExtra[k-1]. */
  const abKuurIndex = (prefix: string) =>
    huidig === prefix ? 0 : huidig.startsWith(`${prefix}_x`) ? Number(huidig.slice(prefix.length + 2)) + 1 : -1;
  const abSoortKuur = abKuurIndex("ab_tussen_soort");
  const abAandoeningKuur = abKuurIndex("ab_tussen_aandoening");
  const abJaarKuur = abKuurIndex("ab_tussen_jaar");
  const abDuurKuur = abKuurIndex("ab_tussen_duur");
  const abNogKuur = abKuurIndex("ab_tussen_nog");
  const abKuur = (k: number): AbKuur =>
    k === 0
      ? {
          soort: a.abTussenSoort, soortAnders: a.abTussenSoortAnders, aandoening: a.abTussenAandoening,
          jaar: a.abTussenJaar, duurAantal: a.abTussenDuurAantal, duurEenheid: a.abTussenDuurEenheid || "dagen",
        }
      : { ...legeAbKuur(), ...a.abTussenExtra[k - 1] };
  const zetAbKuur = (k: number, patch: Partial<AbKuur>) =>
    k === 0
      ? setA((p) => ({
          ...p,
          ...(patch.soort !== undefined ? { abTussenSoort: patch.soort } : {}),
          ...(patch.soortAnders !== undefined ? { abTussenSoortAnders: patch.soortAnders } : {}),
          ...(patch.aandoening !== undefined ? { abTussenAandoening: patch.aandoening } : {}),
          ...(patch.jaar !== undefined ? { abTussenJaar: patch.jaar } : {}),
          ...(patch.duurAantal !== undefined ? { abTussenDuurAantal: patch.duurAantal } : {}),
          ...(patch.duurEenheid !== undefined ? { abTussenDuurEenheid: patch.duurEenheid } : {}),
        }))
      : zetAbExtra(k - 1, patch);
  const beetLbl = (i: number) => (en ? (i === 0 ? "first tick bite" : `tick bite ${i + 1}`) : (i === 0 ? "uw eerste tekenbeet" : `uw ${i + 1}e tekenbeet`));
  const zn = behZiekte ? ziekteNaam(behZiekte) : "";
  const testTitels: Record<string, string> = {
    getest: en ? `Were you tested after your ${beetLbl(testIndex)}?` : `Bent u toen getest na ${beetLbl(testIndex)}?`,
    testziekten: en ? `What were you tested for (${beetLbl(testIndex)})?` : `Waar bent u op getest (${beetLbl(testIndex)})?`,
    testwat: en ? `What was tested (${beetLbl(testIndex)})?` : `Wat is getest (${beetLbl(testIndex)})?`,
    testuitslag: en ? `What was the result of the test (${beetLbl(testIndex)})?` : `Wat was de uitslag van de test (${beetLbl(testIndex)})?`,
    testbehandeld: en ? `Were you treated for ${zn} (${beetLbl(testIndex)})?` : `Bent u behandeld voor ${zn} (${beetLbl(testIndex)})?`,
    testab: en ? `Which antibiotics did you receive for ${zn}?` : `Met welk antibiotica bent u behandeld voor ${zn}?`,
    testander: en ? `Besides antibiotics, were you treated with another medicine for ${zn}?` : `Bent u naast antibiotica nog met een ander medicijn behandeld voor ${zn}?`,
    testmiddelen: behZiekte === "alfagal"
      ? (en ? "Which treatment or measures have you agreed with your doctor for alpha-gal syndrome?" : "Welke behandeling of maatregelen heeft u met uw arts afgesproken voor het alfa-galsyndroom?")
      : (en ? `Which other medicines did you receive for ${zn}?` : `Welke andere medicijnen heeft u gekregen voor ${zn}?`),
    testtbe: behZiekte === "tbe"
      ? (en ? "Was this a treatment for the symptoms?" : "Was dit een behandeling voor de symptomen?")
      : (en ? `Did you receive treatment for the symptoms of ${zn}?` : `Bent u behandeld voor de symptomen van ${zn}?`),
    testtbemiddelen: en ? "With which medicine were you treated?" : "Met welk medicijn bent u behandeld?",
    testexp: en ? "Were you treated with an experimental medicine (for example an antiviral medicine)?" : "Bent u behandeld met een experimenteel medicijn (bijvoorbeeld een antiviraal medicijn)?",
    testexpmiddelen: en ? "With which experimental medicine were you treated?" : "Met welk experimenteel medicijn bent u behandeld?",
    testmoment: en ? `How long after the tick bite was the test done (${beetLbl(testIndex)})?` : `Hoe lang na de tekenbeet is de test gedaan (${beetLbl(testIndex)})?`,
    testherhaald: en ? `Was the test repeated later (${beetLbl(testIndex)})?` : `Is de test later herhaald (${beetLbl(testIndex)})?`,
    testherstel: en ? `Did your symptoms disappear after the treatment for ${zn}?` : `Zijn uw klachten na de behandeling voor ${zn} verdwenen?`,
    testopnieuw: en ? "Were you treated again afterwards?" : "Bent u daarna opnieuw behandeld?",
    testopnieuwtijd: en ? "How long afterwards were you treated?" : "Hoe lang daarna bent u behandeld?",
    testherstel2: en ? `Did your symptoms disappear after this new treatment for ${zn}?` : `Zijn uw klachten na deze nieuwe behandeling voor ${zn} verdwenen?`,
    em: en ? `Did you have an EM (red ring) at that time (${beetLbl(testIndex)})?` : `Had u toen een EM (rode kring) (${beetLbl(testIndex)})?`,
    emklachten: en ? "Did you have symptoms straight after that?" : "Had u daarna meteen klachten?",
    embehandeld: en ? "Were you treated straight after that?" : "Bent u daarna meteen behandeld?",
    emtijd: en ? "How much time was there between the EM (red ring) and the treatment?" : "Hoeveel tijd zat er tussen de EM (rode kring) en de behandeling?",
    testwie: en ? `Who requested the test (${beetLbl(testIndex)})?` : `Wie heeft de test aangevraagd (${beetLbl(testIndex)})?`,
    testland: en ? `Where was this test performed (${beetLbl(testIndex)})?` : `Waar is deze test uitgevoerd (${beetLbl(testIndex)})?`,
  };
  const huidigeTitel = beetIndex >= 0
    ? (beetIndex === 0
      ? (en ? "When was your first tick bite?" : "Wanneer was uw eerste tekenbeet?")
      : (en ? `When was tick bite number ${beetIndex + 1}?` : `Wanneer was uw ${beetIndex + 1}e tekenbeet?`))
    : nlIndex >= 0
      ? (en ? `Were you bitten in the Netherlands at that time (${beetLbl(nlIndex)})?` : `Bent u toen in Nederland gebeten (${beetLbl(nlIndex)})?`)
      : testIndex >= 0 ? testTitels[dynSoort] : vertaalTekst(TITEL[huidig] ?? TITEL[huidig.replace(/_x\d+$/, "")] ?? "", en);
  const testUitleg: Record<string, string> = {
    getest: en ? "For example a blood test because you became ill after this tick bite." : "Bijvoorbeeld een bloedtest omdat u na deze tekenbeet klachten kreeg.",
    testziekten: en ? "Multiple answers possible." : "Meerdere antwoorden mogelijk.",
    testuitslag: en ? "Give the result per disease you were tested for." : "Geef per ziekte waarop u getest bent de uitslag aan.",
    testab: en ? "Multiple answers possible. Fill in the duration per antibiotic." : "Meerdere antwoorden mogelijk. Vul per antibioticum in hoe lang u behandeld bent.",
    testmiddelen: behZiekte === "alfagal"
      ? (en ? "Antibiotics do not treat alpha-gal syndrome. Record the agreed measures; this is not a treatment recommendation." : "Antibiotica behandelen het alfa-galsyndroom niet. Leg de afgesproken maatregelen vast; dit is geen behandeladvies.")
      : (en ? "Fill in the name and duration per medicine." : "Vul per medicijn de naam en de duur van de behandeling in."),
    testtbe: en ? "Some tick-borne diseases — such as TBE — have no cure; only the symptoms are treated (for example painkillers or fever-reducing medicines)." : "Sommige tekenbeetziekten — zoals TBE — zijn niet met antibiotica te behandelen; alleen de symptomen worden behandeld (bijvoorbeeld pijnstillers of koortsverlagende middelen).",
    testtbemiddelen: en ? "Fill in the name of each medicine. Add a line per medicine if you received several." : "Vul per medicijn de naam in. Gebruik bij meerdere medicijnen de knop om een regel toe te voegen.",
    testexp: en ? "There is no standard antiviral treatment for TBE. In studies or abroad, experimental medicines are sometimes used." : "Voor TBE bestaat geen standaard antivirale behandeling. In het kader van onderzoek of in het buitenland worden soms experimentele medicijnen gebruikt.",
    testexpmiddelen: en ? "Fill in the name of each medicine. Add a line per medicine if you received several." : "Vul per medicijn de naam in. Gebruik bij meerdere medicijnen de knop om een regel toe te voegen.",
    testmoment: en ? "Antibodies often only become detectable a few weeks after the bite, so the timing of the test matters when interpreting the result." : "Antistoffen zijn vaak pas enkele weken na de beet aantoonbaar. Het moment van testen bepaalt daarom mede hoe betrouwbaar een uitslag is.",
    testherhaald: en ? "A test early after the bite is sometimes repeated a few weeks later." : "Een test kort na de beet wordt soms na enkele weken herhaald om een vroege, nog negatieve uitslag te controleren.",
    em: en ? "An EM (erythema migrans) is a red ring or patch that spreads around the bite site." : "Een EM (erythema migrans) is een rode kring of vlek die zich rond de beetplek uitbreidt.",
    emtijd: en ? "Fill in the number and choose the unit." : "Vul het aantal in en kies de eenheid.",
    testherstel: en ? "This helps research into how well treatments work." : "Dit helpt bij het onderzoek naar hoe goed behandelingen aanslaan. Blijvende klachten na behandeling komen voor en zijn belangrijk om vast te leggen.",
    testopnieuwtijd: en ? "Fill in the number and choose the unit." : "Vul het aantal in en kies de eenheid.",
    testherstel2: en ? "This helps research into how well a repeated treatment works." : "Dit helpt bij het onderzoek naar hoe goed een herhaalde behandeling aanslaat.",
  };
  const huidigeUitleg = nlIndex >= 0
    ? (en ? "Tick-borne diseases also occur abroad — sometimes other ones than in the Netherlands. That is why we ask where this bite happened." : "Ook in het buitenland komen tekenbeetziekten voor — soms andere dan in Nederland. Daarom vragen we waar deze beet is opgelopen.")
    : testIndex >= 0 ? testUitleg[dynSoort] : (en && LOGBOEK_UITLEG_EN[huidig] ? LOGBOEK_UITLEG_EN[huidig] : vertaalTekst(UITLEG[huidig] ?? UITLEG[huidig.replace(/_x\d+$/, "")] ?? "", en));
  const zetBeetLocatie = (i: number, patch: Partial<BeetLocatie>) =>
    setA((p) => {
      const beetLocaties = [...p.beetLocaties];
      beetLocaties[i] = { ...(beetLocaties[i] ?? legeBeetLocatie()), ...patch };
      return { ...p, beetLocaties };
    });
  /* Antwoord op "Had u nog een behandeling met antibiotica?" na kuur k. Bij "ja" komt er een lege extrakuur bij. */
  const zetAbNog = (k: number, v: string) =>
    setA((p) => {
      const abTussenNog = [...p.abTussenNog];
      abTussenNog[k] = v;
      const abTussenExtra = [...p.abTussenExtra];
      if (v === "ja" && !abTussenExtra[k]) abTussenExtra[k] = legeAbKuur();
      return { ...p, abTussenNog, abTussenExtra };
    });
  const zetAbExtra = (k: number, patch: Partial<AbKuur>) =>
    setA((p) => {
      const abTussenExtra = [...p.abTussenExtra];
      abTussenExtra[k] = { ...legeAbKuur(), ...abTussenExtra[k], ...patch };
      return { ...p, abTussenExtra };
    });
  const zetTest = (i: number, patch: Partial<BeetTest>) =>
    setA((p) => {
      const testen = [...p.testen];
      testen[i] = { ...(testen[i] ?? legeTest()), ...patch };
      return { ...p, testen };
    });
  const zetBeh = (i: number, ziekte: string, patch: Partial<Behandeling>) =>
    setA((p) => {
      const testen = [...p.testen];
      const t = testen[i] ?? legeTest();
      const beh = { ...(t.behandelingen[ziekte] ?? legeBehandeling()), ...patch };
      testen[i] = { ...t, behandelingen: { ...t.behandelingen, [ziekte]: beh } };
      return { ...p, testen };
    });
  const huidigeBeh = testIndex >= 0 && behZiekte ? (a.testen[testIndex]?.behandelingen[behZiekte] ?? legeBehandeling()) : legeBehandeling();

  // Help staat in TekenRisicoKaart. Op het domein tekenbeetgids.nl toont "/"
  // deze wizard zelf, dus daar linken we direct naar TekenRisicoKaart.nl; anders
  // blijven we op dezelfde oorsprong (ook in de geïnstalleerde web-app).
  const routeContext = useRouteContext({ from: "__root__" }) as {
    isTekenbeetHulpHost?: boolean;
  };
  const isTekenbeetHulpHost = Boolean(routeContext.isTekenbeetHulpHost);
  const helpHref = isTekenbeetHulpHost
    ? "https://tekenrisicokaart.nl/?tab=help#help-tekenbeetgids"
    : "/?tab=help#help-tekenbeetgids";


  return (
    <div style={S.wrap}>
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "flex-start", gap: 7, marginTop: 4, marginBottom: 10 }}>
        <img src={tekenbeetGidsLogo} alt="TekenbeetGids" style={{ height: mobile ? 26 : 34, width: "auto", objectFit: "contain" }} />
        <TaalKnop kleur={STZ.rood} scheiding={STZ.lijn} marginLinks={0} />
        <span aria-hidden="true" style={{ color: "#7FB2CC", fontSize: 13, lineHeight: 1 }}>|</span>
        {isTekenbeetHulpHost ? (
          <a
            href={helpHref}
            style={{
              color: "#A63428",
              fontSize: 9,
              fontWeight: 400,
              letterSpacing: ".02em",
              textDecoration: "none",
              lineHeight: 1,
            }}
          >
            Help
          </a>
        ) : (
          <Link
            to="/"
            search={{ tab: "help" }}
            hash="help-tekenbeetgids"
            style={{
              color: "#A63428",
              fontSize: 9,
              fontWeight: 400,
              letterSpacing: ".02em",
              textDecoration: "none",
              lineHeight: 1,
            }}
          >
            Help
          </Link>
        )}

      </div>

      <div
        style={{
          ...S.eyebrow,
          fontSize: 13,
          textAlign: "left",
          marginBottom: 10,
          color: T.primair,
        }}
      >
        {vertaalTekst("TEKENBEETGIDS", en)}
      </div>



      {stap === -1 && (
        <div style={S.kaart}>
          <h2 ref={kop} tabIndex={-1} style={{ ...S.h2, marginTop: 2, outline: "none" }}>
            {en ? "Guide after a tick bite: educational questionnaire and personal record." : "Gids na een tekenbeet: educatieve vragenlijst en persoonlijk overzicht."}
          </h2>
          <p style={{ ...S.p, marginTop: 10 }}>
            {en
              ? "Answer factual questions about the tick and skin reaction and save a personal record. The guide organises what you enter but does not assess your personal risk, determine urgency, make a diagnosis or recommend treatment."
              : "Beantwoord feitelijke vragen over de teek en de huidreactie en bewaar een persoonlijk overzicht. De gids ordent wat u invoert, maar beoordeelt uw persoonlijke risico niet, bepaalt geen urgentie, stelt geen diagnose en adviseert geen behandeling."}
          </p>
          <p style={{ ...S.p, marginTop: 8, fontSize: 13 }}>
            {en
              ? "Tick Bite Guide organises information about your tick bite and how it develops. The information is general and does not replace an assessment by a doctor."
              : "TekenbeetGids ordent informatie over uw tekenbeet en het verloop daarvan. De algemene informatie vervangt geen beoordeling door een arts."}
          </p>
          <p style={{ ...S.p, marginTop: 12, fontSize: 13 }}>
            {en
              ? "Photos remain local on your device and can be included locally in your summary and PDF. Only if you explicitly choose an AI-scan is the selected photo sent via our server to an external AI service for processing. We do not store the photo or add it to the research dataset. Health data is stored for research only with your separate explicit consent. Research consent is not consent for AI processing, and choosing an AI-scan is not consent to participate in research. More information is available in the privacy statement and cookie policy."
              : "Foto’s blijven lokaal op uw apparaat en kunnen lokaal worden opgenomen in uw samenvatting en PDF. Alleen als u expliciet kiest voor een AI-scan, wordt de geselecteerde foto via onze server naar een externe AI-dienst gestuurd voor verwerking. Wij slaan de foto niet op en voegen deze niet toe aan het onderzoeksbestand. Gezondheidsgegevens worden alleen met uw afzonderlijke uitdrukkelijke toestemming voor onderzoeksdoeleinden opgeslagen. Onderzoekstoestemming is geen toestemming voor AI-verwerking en een AI-scan is geen toestemming voor onderzoeksdeelname. Meer informatie vindt u in de privacyverklaring en het cookiebeleid."}
          </p>
          <p style={{ ...S.p, marginTop: 10, fontSize: 13 }}>
            {en
              ? "Before you start, please review our terms and notices:"
              : "Lees vóór u begint onze voorwaarden en verklaringen:"}
          </p>
          <div style={{ marginTop: 6, display: "flex", flexWrap: "wrap", gap: "6px 14px" }}>
            {([
              { to: "/gebruiksvoorwaarden", nl: "Gebruiksvoorwaarden", en: "Terms of Use" },
              { to: "/privacyverklaring", nl: "Privacyverklaring", en: "Privacy Notice" },
              { to: "/privacyverklaring-gezondheidsgegevens", nl: "Privacyverklaring Gezondheidsgegevens", en: "Health Data Privacy Notice" },
              { to: "/cookiebeleid", nl: "Cookiebeleid", en: "Cookie Policy" },
              { to: "/transparantieverklaring", nl: "Transparantieverklaring", en: "Transparency Statement" },
              { to: "/toegankelijkheidsverklaring", nl: "Toegankelijkheidsverklaring", en: "Accessibility Statement" },
              { to: "/verwerkingsregister", nl: "Verwerkingsregister", en: "Record of Processing Activities" },
              { to: "/gegevensbeschermingseffectbeoordeling", nl: "Gegevensbeschermingseffectbeoordeling (DPIA)", en: "Data Protection Impact Assessment (DPIA)" },
            ] as const).map((l) => (
              <Link key={l.to} to={l.to} style={{ color: T.primair, fontWeight: 700, fontSize: 12 }}>
                {en ? l.en : l.nl}
              </Link>
            ))}
          </div>
          <p style={{ ...S.p, marginTop: 12, fontSize: 13 }}>
            <InhoudsDatum en={en} gids />
          </p>
          <p style={{ ...S.p, marginTop: 10, fontSize: 12, marginBottom: 0 }}>
            {en
              ? "By starting you agree to the Terms of Use. Your answers in the tick bite questionnaire stay on your own device. Only when you separately consent to take part in research are your answers securely stored for that purpose under a unique participant number. For the website to function, limited technical data may also be processed. If you contact us or submit a privacy request, we process the data needed to handle your message or request. Photos are only sent to an external AI service if you choose the AI scan yourself."
              : "Door te beginnen gaat u akkoord met de Gebruiksvoorwaarden. Uw antwoorden in de tekenbeetvragenlijst blijven op uw eigen toestel. Alleen wanneer u afzonderlijk toestemming geeft voor deelname aan onderzoek, worden uw antwoorden daarvoor beveiligd opgeslagen onder een uniek deelnamenummer. Voor het functioneren van de website kunnen daarnaast beperkte technische gegevens worden verwerkt. Als u contact met ons opneemt of een privacyverzoek indient, verwerken wij de gegevens die nodig zijn om uw bericht of verzoek af te handelen. Foto's worden alleen naar een externe AI-dienst gestuurd als u zelf voor de AI-scan kiest."}
          </p>
          <Button type="button" onClick={() => setStap(0)} style={{ ...S.knop, marginTop: 14 }}>{en ? "Start" : "Begin"}</Button>
        </div>
      )}

      {tussen && advies && (
        <TussenAdvies a={{ ...a, beelden: {
          beetplek: a.beelden.beetplek.length ? a.beelden.beetplek : tussenSnap?.a.beelden.beetplek ?? [],
          teek: a.beelden.teek.length ? a.beelden.teek : tussenSnap?.a.beelden.teek ?? [],
        } }} advies={advies} verder={() => { setTussenSnap((snap) => snap ?? { a, advies }); setStap((s) => s + 1); }} terug={() => setStap((s) => Math.max(-1, s - 1))}
          bewaarTussen={setTussenSnap}
          wisFotos={() => setA((p) => ({ ...p, beelden: { beetplek: [], teek: [] } }))} />
      )}

      {stap >= 0 && !klaar && !tussen && (
        <div style={S.kaart}>
          <div style={{ marginBottom: 8 }}>
            <div style={{ height: 4, borderRadius: 99, background: T.primairLicht, overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${(vraagNummer / vraagTotaal) * 100}%`, background: T.primair, borderRadius: 99, transition: "width .25s ease" }} />
            </div>
            <div style={{ ...S.eyebrow, marginTop: 6, color: T.grijs }}>{en ? `Question ${vraagNummer} of ${vraagTotaal}` : `Vraag ${vraagNummer} van ${vraagTotaal}`}</div>
          </div>

          <h2 ref={kop} tabIndex={-1} style={{ ...S.h2, outline: "none" }}>{huidigeTitel}</h2>
          {huidigeUitleg && <p style={S.p}>{huidigeUitleg}</p>}

          {huidig === "eerste" && (
            <Keuzes waarde={a.eerste} opties={[
              { id: "ja", label: en ? "Yes" : "Ja" },
              { id: "nee", label: en ? "No" : "Nee" },
              { id: "onbekend", label: en ? "Don't know" : "Weet ik niet" },
            ]} kies={(v) => { set("eerste", v); setStap((s) => s + 1); }} />
          )}

          {huidig === "aantal" && (
            <>
              <input type="number" inputMode="numeric" min={1} max={99} placeholder={en ? "Enter a number" : "Getal invullen"}
                value={a.aantalBeten} onChange={(e) => set("aantalBeten", e.target.value.replace(/[^0-9]/g, "").slice(0, 2))}
                style={{ padding: "10px 12px", border: `1px solid ${T.lijn}`, borderRadius: 8, fontFamily: T.font, fontSize: 14, width: 140, background: T.papier, color: T.inkt }} />
              <button type="button" onClick={() => setStap((s) => s + 1)} disabled={!nBeten}
                style={{ ...S.knop, marginTop: 14, opacity: nBeten ? 1 : 0.4 }}>{en ? "Next" : "Volgende"}</button>
            </>
          )}

          {beetIndex >= 0 && (() => {
            const val = a.beetDatums[beetIndex] || "";
            const [jr, md] = val.split("-");
            const compleet = Boolean(jr && md);
            const maanden = en
              ? ["January","February","March","April","May","June","July","August","September","October","November","December"]
              : ["januari","februari","maart","april","mei","juni","juli","augustus","september","oktober","november","december"];
            const jaren = Array.from({ length: new Date().getFullYear() - 1989 }, (_, i) => String(1990 + i)).reverse();
            const zet = (m: string, j: string) => {
              setA((p) => { const d = [...p.beetDatums]; d[beetIndex] = `${j}-${m}`; return { ...p, beetDatums: d }; });
            };
            const selStyle = { padding: "10px 12px", border: `1px solid ${T.lijn}`, borderRadius: 8, fontFamily: T.font, fontSize: 14, background: T.papier, color: T.inkt } as const;
            return (
              <>
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  <select value={md || ""} onChange={(e) => zet(e.target.value, jr || "")} style={selStyle} aria-label={en ? "Month" : "Maand"}>
                    <option value="">{en ? "Select month" : "Selecteer maand"}</option>
                    {maanden.map((m, i) => <option key={m} value={String(i + 1).padStart(2, "0")}>{m}</option>)}
                  </select>
                  <select value={jr || ""} onChange={(e) => zet(md || "", e.target.value)} style={selStyle} aria-label={en ? "Year" : "Jaar"}>
                    <option value="">{en ? "Select year" : "Selecteer jaar"}</option>
                    {jaren.map((j) => <option key={j} value={j}>{j}</option>)}
                  </select>
                </div>
                <button type="button" onClick={() => setStap((s) => s + 1)} disabled={!compleet}
                  style={{ ...S.knop, marginTop: 14, opacity: compleet ? 1 : 0.4 }}>{en ? "Next" : "Volgende"}</button>
              </>
            );
          })()}

          {nlIndex >= 0 && (() => {
            const loc = a.beetLocaties[nlIndex] ?? legeBeetLocatie();
            const compleet = loc.nederland === "onbekend"
              || (loc.nederland === "ja" && Boolean(loc.provincie) && loc.plaats.trim().length > 0)
              || (loc.nederland === "nee" && Boolean(loc.land) && loc.landPlaats.trim().length > 0);
            const selStyle = { padding: "10px 12px", border: `1px solid ${T.lijn}`, borderRadius: 8, fontFamily: T.font, fontSize: 14, background: T.papier, color: T.inkt, width: "100%", boxSizing: "border-box" } as const;
            const inpStyle = { ...selStyle, marginTop: 8 };
            return (
              <>
                <Keuzes waarde={loc.nederland} opties={[
                  { id: "ja", label: en ? "Yes" : "Ja" },
                  { id: "nee", label: en ? "No" : "Nee" },
                  { id: "onbekend", label: en ? "Don't know" : "Weet ik niet" },
                ]} kies={(v) => zetBeetLocatie(nlIndex, { nederland: v })} />
                {loc.nederland === "ja" && (
                  <div style={{ marginTop: 12 }}>
                    <select value={loc.provincie} onChange={(e) => zetBeetLocatie(nlIndex, { provincie: e.target.value })}
                      style={selStyle} aria-label={en ? "Select province" : "Selecteer provincie"}>
                      <option value="">{en ? "Select province" : "Selecteer provincie"}</option>
                      {PROVINCIES.filter((p) => p.klasse !== null).map((p) => <option key={p.id} value={p.naam}>{p.naam}</option>)}
                    </select>
                    <input type="text" value={loc.plaats} onChange={(e) => zetBeetLocatie(nlIndex, { plaats: e.target.value })}
                      placeholder={en ? "Enter place name" : "Vul plaatsnaam in"}
                      style={inpStyle} aria-label={en ? "Place name" : "Plaatsnaam"} />
                  </div>
                )}
                {loc.nederland === "nee" && (
                  <div style={{ marginTop: 12 }}>
                    <select value={loc.land} onChange={(e) => zetBeetLocatie(nlIndex, { land: e.target.value })}
                      style={selStyle} aria-label={en ? "Select country" : "Selecteer land"}>
                      <option value="">{en ? "In which country were you bitten?" : "In welk land bent u gebeten?"}</option>
                      {LANDEN.filter((l) => l !== "Nederland").map((l) => <option key={l} value={l}>{l}</option>)}
                    </select>
                    <input type="text" value={loc.landPlaats} onChange={(e) => zetBeetLocatie(nlIndex, { landPlaats: e.target.value })}
                      placeholder={en ? "Enter place name" : "Vul plaatsnaam in"}
                      style={inpStyle} aria-label={en ? "Place name" : "Plaatsnaam"} />
                  </div>
                )}
                <button type="button" onClick={() => setStap((s) => s + 1)} disabled={!compleet}
                  style={{ ...S.knop, marginTop: 14, opacity: compleet ? 1 : 0.4 }}>{en ? "Next" : "Volgende"}</button>
              </>
            );
          })()}

          {dynSoort === "testmoment" && testIndex >= 0 && (
            <Keuzes waarde={a.testen[testIndex]?.moment ?? null} opties={TEST_MOMENT}
              kies={(v) => { zetTest(testIndex, { moment: v }); setStap((s) => s + 1); }} />
          )}

          {dynSoort === "testherhaald" && testIndex >= 0 && (
            <Keuzes waarde={a.testen[testIndex]?.herhaald ?? null} opties={[
              { id: "ja", label: en ? "Yes" : "Ja" },
              { id: "nee", label: en ? "No" : "Nee" },
              { id: "onbekend", label: en ? "Don't know" : "Weet ik niet" },
            ]} kies={(v) => { zetTest(testIndex, { herhaald: v }); setStap((s) => s + 1); }} />
          )}

          {dynSoort === "testherstel" && testIndex >= 0 && behZiekte && (
            <Keuzes waarde={huidigeBeh.herstel} opties={[
              { id: "ja", label: en ? "Yes, fully recovered" : "Ja, de klachten zijn verdwenen" },
              { id: "deels", label: en ? "Partly" : "Deels, er bleven klachten over" },
              { id: "nee", label: en ? "No" : "Nee, de klachten bleven" },
              { id: "onbekend", label: en ? "Don't know" : "Weet ik niet" },
            ]} kies={(v) => { zetBeh(testIndex, behZiekte, { herstel: v }); setStap((s) => s + 1); }} />
          )}

          {dynSoort === "testherstel2" && testIndex >= 0 && behZiekte && (
            <Keuzes waarde={huidigeBeh.herstel2} opties={[
              { id: "ja", label: en ? "Yes, fully recovered" : "Ja, de klachten zijn verdwenen" },
              { id: "deels", label: en ? "Partly" : "Deels, er bleven klachten over" },
              { id: "nee", label: en ? "No" : "Nee, de klachten bleven" },
              { id: "onbekend", label: en ? "Don't know" : "Weet ik niet" },
            ]} kies={(v) => { zetBeh(testIndex, behZiekte, { herstel2: v }); setStap((s) => s + 1); }} />
          )}

          {dynSoort === "testopnieuw" && testIndex >= 0 && behZiekte && (
            <Keuzes waarde={huidigeBeh.opnieuw} opties={[
              { id: "ja", label: en ? "Yes" : "Ja" },
              { id: "nee", label: en ? "No" : "Nee" },
              { id: "onbekend", label: en ? "Don't know" : "Weet ik niet" },
            ]} kies={(v) => { zetBeh(testIndex, behZiekte, { opnieuw: v }); setStap((s) => s + 1); }} />
          )}

          {dynSoort === "testopnieuwtijd" && testIndex >= 0 && behZiekte && (() => {
            const b = huidigeBeh;
            const selStyle = { padding: "10px 12px", border: `1px solid ${T.lijn}`, borderRadius: 8, fontFamily: T.font, fontSize: 14, background: T.papier, color: T.inkt } as const;
            const eenheden = [
              { id: "dagen", label: en ? "days" : "dagen" },
              { id: "weken", label: en ? "weeks" : "weken" },
              { id: "maanden", label: en ? "months" : "maanden" },
            ];
            return (
              <>
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
                  <input type="number" inputMode="numeric" min={0} max={999} placeholder={en ? "Number" : "Aantal"}
                    value={b.opnieuwAantal}
                    onChange={(e) => zetBeh(testIndex, behZiekte, { opnieuwAantal: e.target.value.replace(/[^0-9]/g, "").slice(0, 3) })}
                    style={{ ...selStyle, width: 120 }} aria-label={en ? "Number" : "Aantal"} />
                  <select value={b.opnieuwEenheid || "dagen"} onChange={(e) => zetBeh(testIndex, behZiekte, { opnieuwEenheid: e.target.value })}
                    style={selStyle} aria-label={en ? "Unit" : "Eenheid"}>
                    {eenheden.map((x) => <option key={x.id} value={x.id}>{x.label}</option>)}
                  </select>
                </div>
                <button type="button" onClick={() => setStap((s) => s + 1)} disabled={!b.opnieuwAantal}
                  style={{ ...S.knop, marginTop: 14, opacity: b.opnieuwAantal ? 1 : 0.4 }}>{en ? "Next" : "Volgende"}</button>
              </>
            );
          })()}

          {huidig === "em_manueel" && (
            <>
              <Keuzes waarde={a.emManueel} opties={[
                { id: "ja", label: en ? "Yes, I see a red spot" : "Ja, ik zie een rode vlek" },
                { id: "nee", label: en ? "No" : "Nee" },
                { id: "onbekend", label: en ? "Don't know" : "Weet ik niet" },
              ]} kies={(v) => { set("emManueel", v); setStap((s) => s + 1); }} />
              <Notitie>{en
                ? "This answer is only recorded in your overview. The guide does not establish what caused the red spot."
                : "Dit antwoord wordt alleen in uw overzicht vastgelegd. De gids stelt niet vast waardoor de rode vlek is ontstaan."}</Notitie>
            </>
          )}

          {huidig === "em_nu" && (() => {
            const welEm = a.klachten.includes("em") || a.scan?.categorie === "em" || a.emManueel === "ja";
            return (
              <div>
                <div style={{
                  marginTop: 10, padding: "16px 14px", borderRadius: 10, fontWeight: 700, fontSize: 16,
                  background: welEm ? T.alarmLicht : T.primairLicht,
                  borderLeft: `4px solid ${welEm ? T.alarm : T.primair}`,
                  color: welEm ? T.alarm : T.primairDonker,
                }}>
                  {en
                    ? (welEm ? "You have a red spot" : "No red spot reported or recognised")
                    : (welEm ? "U heeft een rode vlek" : "Geen rode vlek aangegeven of herkend")}
                </div>
                <p style={{ ...S.p, marginTop: 10 }}>
                  {en
                    ? "This description is based on your answers or the photo comparison. It does not establish or rule out EM or another condition."
                    : "Deze beschrijving is gebaseerd op uw antwoorden of de fotovergelijking. Zij stelt geen EM of andere aandoening vast en sluit deze niet uit."}
                </p>
                <button type="button" style={{ ...S.knop, marginTop: 12 }}
                  onClick={() => { set("emHuidig", welEm ? "ja" : "nee"); setStap((s) => s + 1); }}>
                  {en ? "Continue to the next question" : "Ga door naar de volgende vraag"}
                </button>
              </div>
            );
          })()}

          {(dynSoort === "em" || dynSoort === "emklachten" || dynSoort === "embehandeld") && testIndex >= 0 && (
            <Keuzes waarde={(a.testen[testIndex]?.[dynSoort === "em" ? "em" : dynSoort === "emklachten" ? "emKlachten" : "emBehandeld"]) ?? null} opties={[
              { id: "ja", label: en ? "Yes" : "Ja" },
              { id: "nee", label: en ? "No" : "Nee" },
              { id: "onbekend", label: en ? "Don't know" : "Weet ik niet" },
            ]} kies={(v) => {
              zetTest(testIndex, dynSoort === "em" ? { em: v } : dynSoort === "emklachten" ? { emKlachten: v } : { emBehandeld: v });
              setStap((s) => s + 1);
            }} />
          )}

          {dynSoort === "emtijd" && testIndex >= 0 && (() => {
            const t = a.testen[testIndex] ?? legeTest();
            const selStyle = { padding: "10px 12px", border: `1px solid ${T.lijn}`, borderRadius: 8, fontFamily: T.font, fontSize: 14, background: T.papier, color: T.inkt } as const;
            const eenheden = [
              { id: "dagen", label: en ? "days" : "dagen" },
              { id: "weken", label: en ? "weeks" : "weken" },
              { id: "maanden", label: en ? "months" : "maanden" },
              { id: "jaren", label: en ? "years" : "jaren" },
            ];
            return (
              <>
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
                  <input type="number" inputMode="numeric" min={0} max={999} placeholder={en ? "Number" : "Aantal"}
                    value={t.emTijdAantal}
                    onChange={(e) => zetTest(testIndex, { emTijdAantal: e.target.value.replace(/[^0-9]/g, "").slice(0, 3) })}
                    style={{ ...selStyle, width: 120 }} aria-label={en ? "Number" : "Aantal"} />
                  <select value={t.emTijdEenheid || "dagen"} onChange={(e) => zetTest(testIndex, { emTijdEenheid: e.target.value })}
                    style={selStyle} aria-label={en ? "Unit" : "Eenheid"}>
                    {eenheden.map((x) => <option key={x.id} value={x.id}>{x.label}</option>)}
                  </select>
                </div>
                <button type="button" onClick={() => setStap((s) => s + 1)} disabled={!t.emTijdAantal}
                  style={{ ...S.knop, marginTop: 14, opacity: t.emTijdAantal ? 1 : 0.4 }}>{en ? "Next" : "Volgende"}</button>
              </>
            );
          })()}

          {dynSoort === "getest" && testIndex >= 0 && (
            <Keuzes waarde={a.testen[testIndex]?.getest ?? null} opties={[
              { id: "ja", label: en ? "Yes" : "Ja" },
              { id: "nee", label: en ? "No" : "Nee" },
              { id: "onbekend", label: en ? "Don't know" : "Weet ik niet" },
            ]} kies={(v) => { zetTest(testIndex, { getest: v }); setStap((s) => s + 1); }} />
          )}

          {dynSoort === "testziekten" && testIndex >= 0 && (() => {
            const waarden = a.testen[testIndex]?.ziekten ?? [];
            const toggleZiekte = (v: string) => {
              const huidige = a.testen[testIndex]?.ziekten ?? [];
              const nieuw = v === "onbekend"
                ? (huidige.includes("onbekend") ? [] : ["onbekend"])
                : huidige.includes(v)
                  ? huidige.filter((x) => x !== v)
                  : [...huidige.filter((x) => x !== "onbekend"), v];
              zetTest(testIndex, { ziekten: nieuw });
            };
            return (
              <>
                <Vinkjes opties={[...TEST_ZIEKTEN, { id: "onbekend", label: en ? "Don't know" : "Weet ik niet" }]} toggle={toggleZiekte} waarden={waarden} />
                <button type="button" onClick={() => setStap((s) => s + 1)} disabled={!waarden.length}
                  style={{ ...S.knop, marginTop: 14, opacity: waarden.length ? 1 : 0.4 }}>{en ? "Next" : "Volgende"}</button>
              </>
            );
          })()}

          {dynSoort === "testwat" && testIndex >= 0 && (() => {
            const waarden = a.testen[testIndex]?.wat ?? [];
            const toggleWat = (v: string) => {
              const huidige = a.testen[testIndex]?.wat ?? [];
              const nieuw = v === "onbekend"
                ? (huidige.includes("onbekend") ? [] : ["onbekend"])
                : huidige.includes(v)
                  ? huidige.filter((x) => x !== v)
                  : [...huidige.filter((x) => x !== "onbekend"), v];
              zetTest(testIndex, { wat: nieuw });
            };
            const klaarWat = waarden.length > 0 && (!waarden.includes("anders") || (a.testen[testIndex]?.watAnders ?? "").trim().length > 0);
            return (
              <>
                <Vinkjes opties={[
                  { id: "bloed", label: en ? "Blood" : "Bloed" },
                  { id: "liquor", label: en ? "Cerebrospinal fluid (lumbar puncture)" : "Liquor (hersenvocht, ruggenprik)" },
                  { id: "anders", label: en ? "Other, namely:" : "Anders, namelijk:" },
                  { id: "onbekend", label: en ? "Don't know" : "Weet ik niet" },
                ]} toggle={toggleWat} waarden={waarden} />
                {waarden.includes("anders") && (
                  <input type="text" placeholder={en ? "Fill in what was tested" : "Vul in wat is getest"}
                    value={a.testen[testIndex]?.watAnders ?? ""} onChange={(e) => zetTest(testIndex, { watAnders: e.target.value })}
                    style={{ marginTop: 10, padding: "10px 12px", border: `1px solid ${T.lijn}`, borderRadius: 8, fontFamily: T.font, fontSize: 14, width: "100%", background: T.papier, color: T.inkt, boxSizing: "border-box" }} />
                )}
                <button type="button" onClick={() => setStap((s) => s + 1)} disabled={!klaarWat}
                  style={{ ...S.knop, marginTop: 14, opacity: klaarWat ? 1 : 0.4 }}>{en ? "Next" : "Volgende"}</button>
              </>
            );
          })()}

          {dynSoort === "testuitslag" && testIndex >= 0 && (() => {
            const t = a.testen[testIndex] ?? legeTest();
            const lijst = t.ziekten.filter((z) => z !== "onbekend");
            const compleet = lijst.every((z) => t.uitslagen[z]);
            return (
              <>
                <div style={{ display: "grid", gap: 10 }}>
                  {lijst.map((z) => (
                    <div key={z} style={{ border: `1px solid ${T.lijn}`, borderRadius: 10, padding: "10px 12px" }}>
                      <div style={{ fontFamily: T.font, fontSize: 14, fontWeight: 600, color: T.inkt, marginBottom: 8 }}>{ziekteNaam(z)}</div>
                      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                        {[{ id: "positief", label: en ? "Positive" : "Positief" }, { id: "negatief", label: en ? "Negative" : "Negatief" }].map((o) => {
                          const actief = t.uitslagen[z] === o.id;
                          return (
                            <button key={o.id} type="button"
                              onClick={() => zetTest(testIndex, { uitslagen: { ...t.uitslagen, [z]: o.id } })}
                              style={{ padding: "8px 14px", borderRadius: 999, cursor: "pointer", fontFamily: T.font, fontSize: 14,
                                border: `1px solid ${actief ? T.primair : T.lijn}`, background: actief ? T.primair : T.papier, color: actief ? "#fff" : T.inkt }}>
                              {o.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
                <button type="button" onClick={() => setStap((s) => s + 1)} disabled={!compleet}
                  style={{ ...S.knop, marginTop: 14, opacity: compleet ? 1 : 0.4 }}>{en ? "Next" : "Volgende"}</button>
              </>
            );
          })()}

          {dynSoort === "testbehandeld" && testIndex >= 0 && (
            <Keuzes waarde={huidigeBeh.behandeld} opties={[
              { id: "ja", label: en ? "Yes" : "Ja" },
              { id: "nee", label: en ? "No" : "Nee" },
              { id: "onbekend", label: en ? "Don't know" : "Weet ik niet" },
            ]} kies={(v) => { zetBeh(testIndex, behZiekte, { behandeld: v }); setStap((s) => s + 1); }} />
          )}

          {dynSoort === "testab" && testIndex >= 0 && (() => {
            const b = huidigeBeh;
            const toggleAb = (v: string) => {
              const nieuw = v === "onbekend"
                ? (b.antibiotica.includes("onbekend") ? [] : ["onbekend"])
                : b.antibiotica.includes(v)
                  ? b.antibiotica.filter((x) => x !== v)
                  : [...b.antibiotica.filter((x) => x !== "onbekend"), v];
              zetBeh(testIndex, behZiekte, { antibiotica: nieuw });
            };
            const gekozen = b.antibiotica.filter((x) => x !== "onbekend");
            const klaarAb = b.antibiotica.length > 0
              && (!b.antibiotica.includes("anders") || b.abAnders.trim().length > 0)
              && gekozen.every((id) => (b.duur[id]?.aantal ?? "").trim().length > 0);
            const veld: React.CSSProperties = { padding: "8px 10px", border: `1px solid ${T.lijn}`, borderRadius: 8, fontFamily: T.font, fontSize: 14, background: T.papier, color: T.inkt };
            return (
              <>
                <AntibioticaKeuze key={huidig} meervoud kies={toggleAb} waarden={b.antibiotica} />
                {b.antibiotica.includes("anders") && (
                  <input type="text" placeholder={en ? "Name of the antibiotic" : "Naam van het antibioticum"}
                    value={b.abAnders} onChange={(e) => zetBeh(testIndex, behZiekte, { abAnders: e.target.value })}
                    style={{ ...veld, marginTop: 10, width: "100%", boxSizing: "border-box" }} />
                )}
                {gekozen.length > 0 && (
                  <div style={{ marginTop: 14, display: "grid", gap: 10 }}>
                    <p style={{ ...S.p, margin: 0 }}>{en ? "How long were you treated, and in which year?" : "Hoe lang bent u behandeld, en in welk jaar?"}</p>
                    {gekozen.map((id) => {
                      const label = id === "anders" ? (b.abAnders.trim() || (en ? "Other" : "Anders")) : antibioticumNaam(id, en);
                      const d = b.duur[id] ?? { aantal: "", eenheid: "dagen", jaar: "" };
                      return (
                        <div key={id} style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                          <span style={{ fontFamily: T.font, fontSize: 14, color: T.inkt, minWidth: 130 }}>{label}</span>
                          <input type="number" min={1} inputMode="numeric" placeholder={en ? "Number" : "Aantal"} value={d.aantal}
                            onChange={(e) => zetBeh(testIndex, behZiekte, { duur: { ...b.duur, [id]: { ...d, aantal: e.target.value.replace(/[^0-9]/g, "").slice(0, 3) } } })}
                            style={{ ...veld, width: 90 }} />
                          <select value={d.eenheid} aria-label={en ? "Unit" : "Eenheid"}
                            onChange={(e) => zetBeh(testIndex, behZiekte, { duur: { ...b.duur, [id]: { ...d, eenheid: e.target.value } } })}
                            style={veld}>
                            {EENHEDEN(en).map((u) => <option key={u.id} value={u.id}>{u.label}</option>)}
                          </select>
                          <input type="number" inputMode="numeric" min={1900} max={new Date().getFullYear()}
                            placeholder={en ? "Year" : "Jaartal"} value={d.jaar ?? ""}
                            onChange={(e) => zetBeh(testIndex, behZiekte, { duur: { ...b.duur, [id]: { ...d, jaar: e.target.value.replace(/[^0-9]/g, "").slice(0, 4) } } })}
                            style={{ ...veld, width: 100 }} />
                        </div>
                      );
                    })}
                  </div>
                )}
                <button type="button" onClick={() => setStap((s) => s + 1)} disabled={!klaarAb}
                  style={{ ...S.knop, marginTop: 14, opacity: klaarAb ? 1 : 0.4 }}>{en ? "Next" : "Volgende"}</button>
              </>
            );
          })()}

          {dynSoort === "testander" && testIndex >= 0 && (
            <Keuzes waarde={huidigeBeh.ander} opties={[
              { id: "ja", label: en ? "Yes" : "Ja" },
              { id: "nee", label: en ? "No" : "Nee" },
              { id: "onbekend", label: en ? "Don't know" : "Weet ik niet" },
            ]} kies={(v) => { zetBeh(testIndex, behZiekte, { ander: v }); setStap((s) => s + 1); }} />
          )}

          {dynSoort === "testmiddelen" && testIndex >= 0 && (() => {
            const b = huidigeBeh;
            if (behZiekte === "alfagal") {
              const geselecteerd = b.middelen.map((m) => m.naam).filter(Boolean);
              const opties = [...ALFA_GAL_BEHANDELINGEN.map((item) => ({ id: item.id, label: en ? item.en : item.nl })), { id: "onbekend", label: en ? "Don't know" : "Weet ik niet" }];
              return <div className="mt-3 grid gap-2">
                {opties.map((item) => <Button key={item.id} type="button" variant="outline" aria-pressed={geselecteerd.includes(item.id)}
                  className="h-auto min-h-11 justify-start whitespace-normal text-left text-xs"
                  onClick={() => {
                    const namen = geselecteerd.includes(item.id) ? geselecteerd.filter((id) => id !== item.id)
                      : item.id === "onbekend" ? [item.id] : [...geselecteerd.filter((id) => id !== "onbekend"), item.id];
                    zetBeh(testIndex, behZiekte, { middelen: namen.map((naam) => ({ naam, aantal: "", eenheid: "dagen" })) });
                  }}>
                  <span aria-hidden="true">{geselecteerd.includes(item.id) ? "☑" : "☐"}</span>{item.label}
                </Button>)}
                <Button type="button" disabled={!geselecteerd.length} onClick={() => setStap((s) => s + 1)}>{en ? "Next" : "Volgende"}</Button>
              </div>;
            }
            const rijen = b.middelen.length ? b.middelen : [{ naam: "", aantal: "", eenheid: "dagen" }];
            const zetRij = (idx: number, patch: Partial<{ naam: string; aantal: string; eenheid: string }>) => {
              const nieuw = rijen.map((r, i2) => (i2 === idx ? { ...r, ...patch } : r));
              zetBeh(testIndex, behZiekte, { middelen: nieuw });
            };
            const klaarMid = rijen.some((r) => r.naam.trim() && r.aantal.trim())
              && rijen.every((r) => (!r.naam.trim() && !r.aantal.trim()) || (r.naam.trim() && r.aantal.trim()));
            const veld: React.CSSProperties = { padding: "8px 10px", border: `1px solid ${T.lijn}`, borderRadius: 8, fontFamily: T.font, fontSize: 14, background: T.papier, color: T.inkt };
            return (
              <>
                <div style={{ display: "grid", gap: 10 }}>
                  {rijen.map((r, idx) => (
                    <div key={idx} style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                      <input type="text" placeholder={`${en ? "Medicine" : "Middel"} ${idx + 1}`} value={r.naam}
                        onChange={(e) => zetRij(idx, { naam: e.target.value })} style={{ ...veld, flex: "1 1 160px", minWidth: 140 }} />
                      <input type="number" min={1} inputMode="numeric" placeholder={en ? "Number" : "Aantal"} value={r.aantal}
                        onChange={(e) => zetRij(idx, { aantal: e.target.value.replace(/[^0-9]/g, "").slice(0, 3) })} style={{ ...veld, width: 90 }} />
                      <select value={r.eenheid} aria-label={en ? "Unit" : "Eenheid"}
                        onChange={(e) => zetRij(idx, { eenheid: e.target.value })} style={veld}>
                        {EENHEDEN(en).map((u) => <option key={u.id} value={u.id}>{u.label}</option>)}
                      </select>
                    </div>
                  ))}
                </div>
                <button type="button" onClick={() => zetBeh(testIndex, behZiekte, { middelen: [...rijen, { naam: "", aantal: "", eenheid: "dagen" }] })}
                  style={{ ...S.knop, marginTop: 12, background: "transparent", color: T.primair, border: `1px solid ${T.primair}` }}>
                  {en ? "Add medicine" : "Middel toevoegen"}
                </button>
                <button type="button" onClick={() => setStap((s) => s + 1)} disabled={!klaarMid}
                  style={{ ...S.knop, marginTop: 14, opacity: klaarMid ? 1 : 0.4 }}>{en ? "Next" : "Volgende"}</button>
              </>
            );
          })()}

          {dynSoort === "testtbe" && testIndex >= 0 && (
            <Keuzes waarde={huidigeBeh.tbe} opties={[
              { id: "ja", label: en ? "Yes" : "Ja" },
              { id: "nee", label: en ? "No" : "Nee" },
              { id: "onbekend", label: en ? "Don't know" : "Weet ik niet" },
            ]} kies={(v) => { zetBeh(testIndex, behZiekte, { tbe: v }); setStap((s) => s + 1); }} />
          )}

          {dynSoort === "testtbemiddelen" && testIndex >= 0 && (() => {
            const rijen = huidigeBeh.tbeMiddelen.length ? huidigeBeh.tbeMiddelen : [""];
            const zetRij = (idx: number, waarde: string) => {
              const nieuw = rijen.map((r, i2) => (i2 === idx ? waarde : r));
              zetBeh(testIndex, behZiekte, { tbeMiddelen: nieuw });
            };
            const klaarMid = rijen.some((r) => r.trim());
            const veld: React.CSSProperties = { padding: "8px 10px", border: `1px solid ${T.lijn}`, borderRadius: 8, fontFamily: T.font, fontSize: 14, background: T.papier, color: T.inkt, width: "100%", boxSizing: "border-box" };
            return (
              <>
                <div style={{ display: "grid", gap: 10 }}>
                  {rijen.map((r, idx) => (
                    <input key={idx} type="text" placeholder={`${en ? "Medicine" : "Medicijn"} ${idx + 1}`} value={r}
                      onChange={(e) => zetRij(idx, e.target.value)} style={veld} />
                  ))}
                </div>
                <button type="button" onClick={() => zetBeh(testIndex, behZiekte, { tbeMiddelen: [...rijen, ""] })}
                  style={{ ...S.knop, marginTop: 12, background: "transparent", color: T.primair, border: `1px solid ${T.primair}` }}>
                  {en ? "Add medicine" : "Medicijn toevoegen"}
                </button>
                <button type="button" onClick={() => setStap((s) => s + 1)} disabled={!klaarMid}
                  style={{ ...S.knop, marginTop: 14, opacity: klaarMid ? 1 : 0.4 }}>{en ? "Next" : "Volgende"}</button>
              </>
            );
          })()}

          {dynSoort === "testexp" && testIndex >= 0 && (
            <Keuzes waarde={huidigeBeh.exp} opties={[
              { id: "ja", label: en ? "Yes" : "Ja" },
              { id: "nee", label: en ? "No" : "Nee" },
              { id: "onbekend", label: en ? "Don't know" : "Weet ik niet" },
            ]} kies={(v) => { zetBeh(testIndex, behZiekte, { exp: v }); setStap((s) => s + 1); }} />
          )}

          {dynSoort === "testexpmiddelen" && testIndex >= 0 && (() => {
            const rijen = huidigeBeh.expMiddelen.length ? huidigeBeh.expMiddelen : [""];
            const zetRij = (idx: number, waarde: string) => {
              const nieuw = rijen.map((r, i2) => (i2 === idx ? waarde : r));
              zetBeh(testIndex, behZiekte, { expMiddelen: nieuw });
            };
            const klaarMid = rijen.some((r) => r.trim());
            const veld: React.CSSProperties = { padding: "8px 10px", border: `1px solid ${T.lijn}`, borderRadius: 8, fontFamily: T.font, fontSize: 14, background: T.papier, color: T.inkt, width: "100%", boxSizing: "border-box" };
            return (
              <>
                <div style={{ display: "grid", gap: 10 }}>
                  {rijen.map((r, idx) => (
                    <input key={idx} type="text" placeholder={`${en ? "Medicine" : "Medicijn"} ${idx + 1}`} value={r}
                      onChange={(e) => zetRij(idx, e.target.value)} style={veld} />
                  ))}
                </div>
                <button type="button" onClick={() => zetBeh(testIndex, behZiekte, { expMiddelen: [...rijen, ""] })}
                  style={{ ...S.knop, marginTop: 12, background: "transparent", color: T.primair, border: `1px solid ${T.primair}` }}>
                  {en ? "Add medicine" : "Medicijn toevoegen"}
                </button>
                <button type="button" onClick={() => setStap((s) => s + 1)} disabled={!klaarMid}
                  style={{ ...S.knop, marginTop: 14, opacity: klaarMid ? 1 : 0.4 }}>{en ? "Next" : "Volgende"}</button>
              </>
            );
          })()}

          {dynSoort === "testwie" && testIndex >= 0 && (
            <Keuzes waarde={a.testen[testIndex]?.wie ?? null} opties={[
              { id: "huisarts", label: en ? "GP" : "Huisarts" },
              { id: "specialist", label: en ? "Specialist (hospital)" : "Specialist (ziekenhuis)" },
              { id: "andere_arts", label: en ? "Other doctor" : "Andere arts" },
              { id: "arts_buitenland", label: en ? "Doctor abroad" : "Arts in buitenland" },
              { id: "onbekend", label: en ? "Don't know" : "Weet ik niet" },
            ]} kies={(v) => { zetTest(testIndex, { wie: v }); setStap((s) => s + 1); }} />
          )}

          {dynSoort === "testland" && testIndex >= 0 && (
            <>
              <select value={a.testen[testIndex]?.land ?? ""} onChange={(e) => zetTest(testIndex, { land: e.target.value })}
                style={{ padding: "10px 12px", border: `1px solid ${T.lijn}`, borderRadius: 8, fontFamily: T.font, fontSize: 14, background: T.papier, color: T.inkt, width: "100%", boxSizing: "border-box" }}
                aria-label={en ? "Select country" : "Selecteer land"}>
                <option value="">{en ? "Select country" : "Selecteer land"}</option>
                {LANDEN.map((l) => <option key={l} value={l}>{l}</option>)}
                <option value={en ? "Don't know" : "Weet ik niet"}>{en ? "Don't know" : "Weet ik niet"}</option>
              </select>
              <button type="button" onClick={() => setStap((s) => s + 1)} disabled={!(a.testen[testIndex]?.land ?? "")}
                style={{ ...S.knop, marginTop: 14, opacity: (a.testen[testIndex]?.land ?? "") ? 1 : 0.4 }}>{en ? "Next" : "Volgende"}</button>
            </>
          )}

          {huidig === "vast" && (
            <Keuzes waarde={a.vast} opties={[
              { id: "ja", label: "Ja, de teek zit nog vast" },
              { id: "nee", label: "Nee, de teek is er al uit" },
              { id: "onzeker", label: "Ik weet het niet zeker" },
            ]} kies={(v) => { set("vast", v); setStap((s) => s + 1); }} />
          )}

          {huidig === "verwijderen" && <Verwijderen onKlaar={() => setStap((s) => s + 1)} />}

          {huidig === "scan" && (
            <ScanStap beelden={a.beelden.beetplek}
              voegToe={(fs) => voegBeeldenToe("beetplek", fs)}
              verwijder={(i) => verwijderBeeld("beetplek", i)}
              resultaat={a.scan} zetResultaat={(r) => set("scan", r)}
              verder={() => setStap((st) => st + 1)} />
          )}

          {huidig === "uiterlijk" && (
            <Keuzes waarde={a.uiterlijk} opties={[
              { id: "plat", label: en ? "Small and flat" : "Klein en plat", sub: en ? "Like a freckle or tiny spider." : "Als een sproet of klein spinnetje." },
              { id: "bol", label: en ? "Round and engorged" : "Bol en volgezogen", sub: en ? "Like a grey-brown pea or berry." : "Als een grijs-bruin erwtje of besje." },
              { id: "onbekend", label: en ? "Don't know, I threw the tick away" : "Weet ik niet, de teek is weggegooid", sub: en ? "Then we cannot estimate the attachment time from the appearance." : "Dan kunnen we het uiterlijk niet gebruiken om de hechtingsduur in te schatten." },
            ]} kies={(v) => {
              set("uiterlijk", v);
              setStap((s) => s + 1);
            }} />
          )}

          {huidig === "scan_teek" && (
            <ScanTeekStap beelden={a.beelden.teek}
              voegToe={(fs) => voegBeeldenToe("teek", fs)}
              verwijder={(i) => verwijderBeeld("teek", i)}
              resultaat={a.teekScan} zetResultaat={(r) => {
                set("teekScan", r);
                /* Actieve tekenbeten-telling: datum, locatie en tekensoort gepseudonimiseerd vastleggen. */
                if (r && r.soort !== "geen_teek") {
                  void registreerTellingFn({ data: {
                    datum: a.datum || null,
                    provincieId: PROVINCIES.find((p) => p.id === a.provincie)?.naam ?? null,
                    plaats: (a.locatie as Record<string, string>)["plaats"] ?? null,
                    soort: r.titel || r.soort,
                    bron: "scan",
                  } }).catch(() => undefined);
                }
              }}
              zetSoort={(id) => set("soort", id)}
              verder={() => setStap((st) => st + 1)} />
          )}

          {huidig === "soort" && (
            <Keuzes waarde={a.soort}
              opties={TEKENSOORTEN.map((t) => ({ id: t.id, label: t.naam, sub: t.kenmerk }))}
              /* De soortstap valt uit de lijst zodra de soort is gekozen; dezelfde index wijst dan al naar de volgende vraag. */
              kies={(v) => { set("soort", v); setStap((s) => s); }} />
          )}

          {huidig === "duur" && (
            <>
              <Keuzes waarde={a.duur} opties={[
                { id: "kort", label: en ? "Less than 24 hours" : "Korter dan 24 uur" },
                { id: "lang", label: en ? "24 hours or longer" : "24 uur of langer" },
              ]} kies={(v) => { set("duur", v); setStap((s) => s + 1); }} />
              {a.uiterlijk === "bol" && (
                <Notitie>{en ? "You indicated that the tick was engorged. This may suggest longer attachment, but does not determine the duration precisely." : "U gaf aan dat de teek volgezogen was. Dat kan op langere aanhechting wijzen, maar bepaalt de duur niet precies."}</Notitie>
              )}
            </>
          )}

          {huidig === "verwijderd" && (
            <Keuzes waarde={a.verwijderd} opties={[
              { id: "binnen", label: en ? "Less than 72 hours ago" : "Minder dan 72 uur geleden" },
              { id: "buiten", label: en ? "More than 72 hours ago" : "Langer dan 72 uur geleden" },
              { id: "onbekend", label: en ? "Don't know" : "Weet ik niet" },
            ]} kies={(v) => { set("verwijderd", v); setStap((s) => s + 1); }} />
          )}

          {huidig === "lichaamsdeel" && (
            <>
              <Vinkjes opties={[...LICHAAMSDELEN.map((x) => ({ ...x, label: vertaalTekst(x.label, en) })), { id: "geen", label: en ? "Don't know" : "Weet ik niet" }]} toggle={(v) => toggle("lichaamsdeel", v)} waarden={a.lichaamsdeel} />
              <button type="button" onClick={() => setStap((s) => s + 1)} disabled={!a.lichaamsdeel.length}
                style={{ ...S.knop, marginTop: 14, opacity: a.lichaamsdeel.length ? 1 : 0.4 }}>{en ? "Next" : "Volgende"}</button>
            </>
          )}

          {huidig === "wie_verwijderd" && (
            <Keuzes waarde={a.wieVerwijderd} opties={WIE_VERWIJDERD}
              kies={(v) => { set("wieVerwijderd", v); setStap((s) => s + 1); }} />
          )}

          {huidig === "hoe_verwijderd" && (
            <>
              <Keuzes waarde={a.hoeVerwijderd} opties={HOE_VERWIJDERD}
                kies={(v) => { set("hoeVerwijderd", v); setStap((s) => s + 1); }} />
              {a.hoeVerwijderd === "middel" && (
                <Notitie>{en ? "Applying a substance to the tick is discouraged. Tell your GP: this may have caused the tick to release extra saliva, which can slightly increase the chance of transmission." : "Een middel op de teek smeren wordt afgeraden. Vertel dit aan uw huisarts: de teek kan hierdoor extra speeksel hebben afgegeven, waardoor de kans op overdracht iets groter is."}</Notitie>
              )}
            </>
          )}

          {huidig === "restant" && (
            <>
              <Keuzes waarde={a.restant} opties={RESTANT}
                kies={(v) => { set("restant", v); setStap((s) => s + 1); }} />
              {a.restant === "ja" && (
                <Notitie>{en ? "Record any visible fragment and changes in the skin. The guide does not assess what care is appropriate." : "Leg een zichtbaar stukje en veranderingen van de huid vast. De gids beoordeelt niet welke zorg passend is."}</Notitie>
              )}
            </>
          )}

          {huidig === "teek_bewaard" && (
            <Keuzes waarde={a.teekBewaard} opties={TEEK_BEWAARD}
              kies={(v) => { set("teekBewaard", v); setStap((s) => s + 1); }} />
          )}

          {huidig === "klachten_duur" && (
            <Keuzes waarde={a.klachtenDuur} opties={KLACHTEN_DUUR}
              kies={(v) => { set("klachtenDuur", v); setStap((s) => s + 1); }} />
          )}

          {huidig === "arts" && (
            <Keuzes waarde={a.artsContact} opties={ARTS_CONTACT}
              kies={(v) => { set("artsContact", v); setStap((s) => s + 1); }} />
          )}

          {huidig === "provincie" && (
            <Keuzes waarde={a.provincie} opties={PROVINCIES.map((p) => ({ id: p.id, label: p.naam, klasse: p.klasse }))}
              kies={(v) => { set("provincie", v); setStap((s) => s + 1); }} />
          )}

          {huidig === "omgeving" && (
            <>
              <Vinkjes opties={[...OMGEVING, { id: "geen", label: en ? "Don't know" : "Weet ik niet" }]} toggle={(v) => toggle("omgeving", v)} waarden={a.omgeving} />
              {a.omgeving.some((id) => LOC_VELDEN[id]) && (
                <div style={{ marginTop: 12, display: "grid", gap: 10 }}>
                  {a.omgeving.filter((id) => LOC_VELDEN[id]).map((omgId) => (
                    <fieldset key={omgId} style={{ border: `1px solid ${T.lijn}`, borderRadius: 8, padding: "8px 10px 10px", margin: 0 }}>
                      <legend style={{ fontSize: 11.5, fontWeight: 700, color: T.primairDonker, padding: "0 4px" }}>
                         {vertaalTekst(OMGEVING.find((o) => o.id === omgId)?.label ?? "", en)}
                      </legend>
                      {(LOC_VELDEN[omgId] || []).map((veld) => (
                        <label key={veld.id} style={{ display: "block", marginTop: 6, fontSize: 11.5, fontWeight: 700, color: T.grijs }}>
                          {locVeldLabel(en, omgId, veld)}
                          <input type="text" value={a.locatie[`${omgId}:${veld.id}`] || ""}
                            onChange={(e) => setA((p) => ({ ...p, locatie: { ...p.locatie, [`${omgId}:${veld.id}`]: e.target.value } }))}
                            style={{ display: "block", marginTop: 3, padding: "8px 10px", border: `1px solid ${T.lijn}`, borderRadius: 8, fontFamily: T.font, fontSize: 13, width: "100%", background: T.papier, color: T.inkt, boxSizing: "border-box" }} />
                        </label>
                      ))}
                    </fieldset>
                  ))}
                </div>
              )}
              <button type="button" onClick={() => setStap((s) => s + 1)} disabled={!a.omgeving.length}
                style={{ ...S.knop, marginTop: 14, opacity: a.omgeving.length ? 1 : 0.4 }}>{en ? "Next" : "Volgende"}</button>
            </>
          )}

          {huidig === "weer" && (
            <>
              <Vinkjes opties={[...WEER, { id: "geen", label: en ? "Don't know" : "Weet ik niet" }]} toggle={(v) => toggle("weer", v)} waarden={a.weer} />
              <Notitie>{en ? "Season (automatic)" : "Seizoen (automatisch)"}: {en ? bepaalSeizoen(a.datum).en : bepaalSeizoen(a.datum).nl}</Notitie>
              <button type="button" onClick={() => setStap((s) => s + 1)} disabled={!a.weer.length}
                style={{ ...S.knop, marginTop: 14, opacity: a.weer.length ? 1 : 0.4 }}>{en ? "Next" : "Volgende"}</button>
            </>
          )}



          {huidig === "klachten" && (
            <>
              <Vinkjes tekstGrootte={11.5} opties={[...KLACHTEN, { id: "geen", label: en ? "No symptoms" : "Nee, geen klachten" }]} toggle={(v) => toggle("klachten", v)} waarden={a.klachten} />
              <Notitie>{en ? "For serious or acute health concerns, contact your GP or an emergency service directly. Call 112 in a life-threatening emergency. This general notice is independent of your answers." : "Bij ernstige of acute gezondheidsklachten kunt u rechtstreeks contact opnemen met uw huisarts of de spoeddienst. Bij een levensbedreigende situatie belt u 112. Deze algemene melding staat los van uw antwoorden."}</Notitie>
              <button type="button" onClick={() => setStap((s) => s + 1)} disabled={!a.klachten.length}
                style={{ ...S.knop, marginTop: 14, opacity: a.klachten.length ? 1 : 0.4 }}>{en ? "Next" : "Volgende"}</button>
            </>
          )}

          {huidig === "bijzonder" && (
            <>
              <Vinkjes opties={[...BIJZONDERHEDEN, { id: "geen", label: en ? "None of these" : "Geen van deze" }]} toggle={(v) => toggle("bijzonder", v)} waarden={a.bijzonder} />
              <button type="button" onClick={() => setStap((s) => s + 1)} disabled={!a.bijzonder.length}
                style={{ ...S.knop, marginTop: 14, opacity: a.bijzonder.length ? 1 : 0.4 }}>{en ? "Next" : "Volgende"}</button>
            </>
          )}

          {huidig === "ab_tussen" && (
            <Keuzes waarde={a.abTussen} opties={[
              { id: "ja", label: en ? "Yes" : "Ja" },
              { id: "nee", label: en ? "No" : "Nee" },
              { id: "onbekend", label: en ? "Don't know" : "Weet ik niet" },
            ]} kies={(v) => { set("abTussen", v); setStap((s) => s + 1); }} />
          )}

          {abSoortKuur >= 0 && (
            <>
              <AntibioticaKeuze key={huidig} waarden={[abKuur(abSoortKuur).soort]} kies={(v) => {
                zetAbKuur(abSoortKuur, { soort: v });
                if (v !== "anders") setStap((s) => s + 1);
              }} />
              {abKuur(abSoortKuur).soort === "anders" && (
                <>
                  <input type="text" placeholder={en ? "Enter the name of the antibiotic" : "Naam van het antibioticum invullen"}
                    value={abKuur(abSoortKuur).soortAnders} onChange={(e) => zetAbKuur(abSoortKuur, { soortAnders: e.target.value })}
                    style={{ marginTop: 10, padding: "10px 12px", border: `1px solid ${T.lijn}`, borderRadius: 8, fontFamily: T.font, fontSize: 14, width: "100%", background: T.papier, color: T.inkt, boxSizing: "border-box" }} />
                  <button type="button" onClick={() => setStap((s) => s + 1)} disabled={!abKuur(abSoortKuur).soortAnders.trim()}
                    style={{ ...S.knop, marginTop: 14, opacity: abKuur(abSoortKuur).soortAnders.trim() ? 1 : 0.4 }}>{en ? "Next" : "Volgende"}</button>
                </>
              )}
            </>
          )}

          {abAandoeningKuur >= 0 && (
            <>
              <input type="text" placeholder={en ? "Enter the condition" : "Aandoening invullen"}
                value={abKuur(abAandoeningKuur).aandoening === "Weet ik niet" ? "" : abKuur(abAandoeningKuur).aandoening}
                onChange={(e) => zetAbKuur(abAandoeningKuur, { aandoening: e.target.value })}
                style={{ padding: "10px 12px", border: `1px solid ${T.lijn}`, borderRadius: 8, fontFamily: T.font, fontSize: 14, width: "100%", background: T.papier, color: T.inkt, boxSizing: "border-box" }} />
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <button type="button" onClick={() => setStap((s) => s + 1)} disabled={!abKuur(abAandoeningKuur).aandoening.trim() || abKuur(abAandoeningKuur).aandoening === "Weet ik niet"}
                  style={{ ...S.knop, marginTop: 14, opacity: abKuur(abAandoeningKuur).aandoening.trim() && abKuur(abAandoeningKuur).aandoening !== "Weet ik niet" ? 1 : 0.4 }}>{en ? "Next" : "Volgende"}</button>
                <button type="button" onClick={() => { zetAbKuur(abAandoeningKuur, { aandoening: "Weet ik niet" }); setStap((s) => s + 1); }}
                  style={{ ...S.knop, marginTop: 14, background: T.papier, color: T.primairDonker }}>{en ? "Don't know" : "Weet ik niet"}</button>
              </div>
            </>
          )}

          {abJaarKuur >= 0 && (
            <>
              <input type="number" inputMode="numeric" min={1900} max={new Date().getFullYear()}
                placeholder={en ? "Year (e.g. 2021)" : "Jaartal (bijv. 2021)"}
                value={abKuur(abJaarKuur).jaar}
                onChange={(e) => zetAbKuur(abJaarKuur, { jaar: e.target.value.replace(/[^0-9]/g, "").slice(0, 4) })}
                style={{ padding: "10px 12px", border: `1px solid ${T.lijn}`, borderRadius: 8, fontFamily: T.font, fontSize: 14, width: "100%", background: T.papier, color: T.inkt, boxSizing: "border-box" }} />
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <button type="button" onClick={() => setStap((s) => s + 1)} disabled={abKuur(abJaarKuur).jaar.length !== 4}
                  style={{ ...S.knop, marginTop: 14, opacity: abKuur(abJaarKuur).jaar.length === 4 ? 1 : 0.4 }}>{en ? "Next" : "Volgende"}</button>
                <button type="button" onClick={() => { zetAbKuur(abJaarKuur, { jaar: "" }); setStap((s) => s + 1); }}
                  style={{ ...S.knop, marginTop: 14, background: T.papier, color: T.primairDonker }}>{en ? "Don't know" : "Weet ik niet"}</button>
              </div>
            </>
          )}

          {abDuurKuur >= 0 && (
            <>
              <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                <input type="number" inputMode="numeric" min={1} placeholder={en ? "Number" : "Aantal"}
                  value={abKuur(abDuurKuur).duurAantal}
                  onChange={(e) => zetAbKuur(abDuurKuur, { duurAantal: e.target.value.replace(/[^0-9]/g, "").slice(0, 3) })}
                  style={{ padding: "10px 12px", border: `1px solid ${T.lijn}`, borderRadius: 8, fontFamily: T.font, fontSize: 14, width: 110, background: T.papier, color: T.inkt }} />
                <select value={abKuur(abDuurKuur).duurEenheid || "dagen"} aria-label={en ? "Unit" : "Eenheid"}
                  onChange={(e) => zetAbKuur(abDuurKuur, { duurEenheid: e.target.value })}
                  style={{ padding: "10px 12px", border: `1px solid ${T.lijn}`, borderRadius: 8, fontFamily: T.font, fontSize: 14, background: T.papier, color: T.inkt }}>
                  {EENHEDEN(en).map((u) => <option key={u.id} value={u.id}>{u.label}</option>)}
                </select>
              </div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <button type="button" onClick={() => setStap((s) => s + 1)} disabled={!abKuur(abDuurKuur).duurAantal.trim()}
                  style={{ ...S.knop, marginTop: 14, opacity: abKuur(abDuurKuur).duurAantal.trim() ? 1 : 0.4 }}>{en ? "Next" : "Volgende"}</button>
                <button type="button" onClick={() => { zetAbKuur(abDuurKuur, { duurAantal: "" }); setStap((s) => s + 1); }}
                  style={{ ...S.knop, marginTop: 14, background: T.papier, color: T.primairDonker }}>{en ? "Don't know" : "Weet ik niet"}</button>
              </div>
            </>
          )}


          {abNogKuur >= 0 && (
            <Keuzes waarde={a.abTussenNog[abNogKuur] ?? null} opties={[
              { id: "ja", label: en ? "Yes" : "Ja" },
              { id: "nee", label: en ? "No" : "Nee" },
              { id: "onbekend", label: en ? "Don't know" : "Weet ik niet" },
            ]} kies={(v) => { zetAbNog(abNogKuur, v); setStap((s) => s + 1); }} />
          )}

          {huidig === "tbe_vaccin" && (
            <Keuzes waarde={a.tbeVaccin} opties={[
              { id: "ja", label: en ? "Yes" : "Ja" },
              { id: "nee", label: en ? "No" : "Nee" },
              { id: "onbekend", label: en ? "Don't know" : "Weet ik niet" },
            ]} kies={(v) => { set("tbeVaccin", v); setStap((s) => s + 1); }} />
          )}

          {huidig === "tbe_vaccin_welk" && (
            <>
              <Keuzes waarde={a.tbeVaccinWelk} opties={[
                ...TBE_VACCINS,
                { id: "anders", label: en ? "Other, namely:" : "Anders, namelijk:" },
                { id: "onbekend", label: en ? "Don't know" : "Weet ik niet" },
              ]} kies={(v) => {
                set("tbeVaccinWelk", v);
                if (v !== "anders") setStap((s) => s + 1);
              }} />
              {a.tbeVaccinWelk === "anders" && (
                <>
                  <input type="text" placeholder={en ? "Enter the name of the vaccine" : "Naam van het vaccin invullen"}
                    value={a.tbeVaccinAnders} onChange={(e) => set("tbeVaccinAnders", e.target.value)}
                    style={{ marginTop: 10, padding: "10px 12px", border: `1px solid ${T.lijn}`, borderRadius: 8, fontFamily: T.font, fontSize: 14, width: "100%", background: T.papier, color: T.inkt, boxSizing: "border-box" }} />
                  <button type="button" onClick={() => setStap((s) => s + 1)} disabled={!a.tbeVaccinAnders.trim()}
                    style={{ ...S.knop, marginTop: 14, opacity: a.tbeVaccinAnders.trim() ? 1 : 0.4 }}>{en ? "Next" : "Volgende"}</button>
                </>
              )}
            </>
          )}

          {huidig === "leeftijd" && (
            <>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <input type="number" inputMode="numeric" min={0} max={120} placeholder={en ? "Enter a number" : "Cijfer invullen"}
                  value={a.leeftijd} onChange={(e) => set("leeftijd", e.target.value.replace(/[^0-9]/g, "").slice(0, 3))}
                  style={{ padding: "10px 12px", border: `1px solid ${T.lijn}`, borderRadius: 8, fontFamily: T.font, fontSize: 14, width: 140, background: T.papier, color: T.inkt }} />
                <span style={{ fontSize: 13, color: T.inkt }}>{en ? "years" : "jaar"}</span>
              </div>
              <button type="button" onClick={() => setStap((s) => s + 1)} disabled={!a.leeftijd}
                style={{ ...S.knop, marginTop: 14, opacity: a.leeftijd ? 1 : 0.4 }}>{en ? "Next" : "Volgende"}</button>
            </>
          )}

          {huidig === "geslacht" && (
            <Keuzes waarde={a.geslacht} opties={[
              { id: "man", label: en ? "Male" : "Man" },
              { id: "vrouw", label: en ? "Female" : "Vrouw" },
              { id: "anders", label: en ? "Other" : "Anders" },
              { id: "geen", label: en ? "Prefer not to say" : "Wil ik niet zeggen" },
            ]} kies={(v) => { set("geslacht", v); setStap((s) => s + 1); }} />
          )}

          {huidig === "woonplaats" && (
            <>
              <input type="text" placeholder={en ? "Enter postcode or place name" : "Postcode of plaatsnaam invullen"}
                value={a.woonplaats} onChange={(e) => set("woonplaats", e.target.value)}
                style={{ padding: "10px 12px", border: `1px solid ${T.lijn}`, borderRadius: 8, fontFamily: T.font, fontSize: 14, width: "100%", background: T.papier, color: T.inkt, boxSizing: "border-box" }} />
              <button type="button" onClick={() => setStap((s) => s + 1)} disabled={!a.woonplaats.trim()}
                style={{ ...S.knop, marginTop: 14, opacity: a.woonplaats.trim() ? 1 : 0.4 }}>{en ? "Next" : "Volgende"}</button>
            </>
          )}

          {huidig === "afkomst" && (
            <Keuzes waarde={a.afkomst} opties={[
              { id: "nederlands", label: en ? "Dutch" : "Nederlands" },
              { id: "europees", label: en ? "Other European" : "Overig Europees" },
              { id: "buiten_europees", label: en ? "Non-European" : "Buiten-Europees" },
              { id: "anders", label: en ? "Other" : "Anders" },
              { id: "geen", label: en ? "Prefer not to say" : "Wil ik niet zeggen" },
            ]} kies={(v) => { set("afkomst", v); setStap((s) => s + 1); }} />
          )}

          {huidig === "nationaliteit" && (
            <>
              <Keuzes waarde={a.nationaliteit} opties={[
                { id: "nederlandse", label: en ? "Dutch" : "Nederlandse" },
                { id: "dubbele", label: en ? "Dutch and another nationality" : "Nederlandse en nog een nationaliteit" },
                { id: "andere", label: en ? "Other nationality:" : "Andere nationaliteit:" },
                { id: "geen", label: en ? "Prefer not to say" : "Wil ik niet zeggen" },
              ]} kies={(v) => {
                set("nationaliteit", v);
                if (v !== "andere") setStap((s) => s + 1);
              }} />
              {a.nationaliteit === "andere" && (
                <>
                  <input type="text" placeholder={en ? "Enter nationality" : "Nationaliteit invullen"}
                    value={a.nationaliteitAnders} onChange={(e) => set("nationaliteitAnders", e.target.value)}
                    style={{ marginTop: 10, padding: "10px 12px", border: `1px solid ${T.lijn}`, borderRadius: 8, fontFamily: T.font, fontSize: 14, width: "100%", background: T.papier, color: T.inkt, boxSizing: "border-box" }} />
                  <button type="button" onClick={() => setStap((s) => s + 1)} disabled={!a.nationaliteitAnders.trim()}
                    style={{ ...S.knop, marginTop: 14, opacity: a.nationaliteitAnders.trim() ? 1 : 0.4 }}>{en ? "Next" : "Volgende"}</button>
                </>
              )}
            </>
          )}

          {huidig === "opleiding" && (
            <Keuzes waarde={a.opleiding} opties={[
              { id: "basis", label: en ? "Primary education" : "Basisonderwijs" },
              { id: "voortgezet", label: en ? "Secondary education (VMBO / HAVO / VWO)" : "Voortgezet onderwijs (VMBO / HAVO / VWO)" },
              { id: "mbo", label: "MBO" },
              { id: "hbo_wo", label: "HBO / WO" },
              { id: "anders", label: en ? "Other" : "Anders" },
              { id: "geen", label: en ? "Prefer not to say" : "Wil ik niet zeggen" },
            ]} kies={(v) => { set("opleiding", v); setStap((s) => s + 1); }} />
          )}

          {huidig === "risico_beroep" && (
            <>
              <Keuzes waarde={a.risicoBeroep} opties={[
                 ...RISICO_BEROEPEN.map((x) => ({ ...x, label: vertaalTekst(x.label, en) })),
                { id: "nee", label: en ? "No" : "Nee" },
                { id: "onbekend", label: en ? "Don't know" : "Weet ik niet" },
              ]} kies={(v) => { set("risicoBeroep", v); setStap((s) => s + 1); }} />
            </>
          )}

          {huidig === "huisdieren" && (
            <Keuzes waarde={a.huisdieren} opties={[
              { id: "ja", label: en ? "Yes" : "Ja" },
              { id: "nee", label: en ? "No" : "Nee" },
            ]} kies={(v) => { set("huisdieren", v); setStap((s) => s + 1); }} />
          )}

          {huidig === "hobbydieren" && (
            <>
              <Keuzes waarde={a.hobbydieren} opties={[
                { id: "ja", label: en ? "Yes" : "Ja" },
                { id: "nee", label: en ? "No" : "Nee" },
              ]} kies={(v) => { set("hobbydieren", v); setStap((s) => s + 1); }} />
              <Notitie>{en ? "This is the last question. After this you will see your attention points and personal record." : "Dit is de laatste vraag. Daarna ziet u uw aandachtspunten en persoonlijke overzicht."}</Notitie>
            </>
          )}

          <button type="button" onClick={() => setStap((s) => Math.max(-1, s - 1))} style={S.terug}>
            {en ? "← Previous" : "← Vorige"}
          </button>
        </div>
      )}

      {klaar && advies && (
        <>
          <Resultaat a={{ ...a, beelden: {
            beetplek: a.beelden.beetplek.length ? a.beelden.beetplek : tussenSnap?.a.beelden.beetplek ?? [],
            teek: a.beelden.teek.length ? a.beelden.teek : tussenSnap?.a.beelden.teek ?? [],
          } }} advies={advies} setDatum={(v) => set("datum", v)} opnieuw={() => { setA(leeg()); setTussenSnap(null); setStap(-1); }}
            tussen={tussenSnap}
            wisFotos={() => setA((p) => ({ ...p, beelden: { beetplek: [], teek: [] } }))} />
        </>
      )}

      <p style={{ fontSize: 10, lineHeight: 1.6, color: T.grijs, marginTop: 12 }}>
        {en
          ? "Tick Bite Guide records information and shows general attention points. It does not assess your situation or replace a doctor."
          : "TekenbeetGids legt informatie vast en toont algemene aandachtspunten. De gids beoordeelt uw situatie niet en vervangt geen arts."}
      </p>

      {/* Assistent zweeft rechtsonder, buiten de kopregel. */}
      <InformatieAssistent context="gids" gidsHost={isTekenbeetHulpHost} />
    </div>
  );
}
