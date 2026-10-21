import { PEILDATUM_AUTO } from "./appVersie";
import { PLAATSEN } from "./plaatsen";

export type Ziekte = { id: string; naam: string; kleur: string; pct: string; pctNoot?: string; type: string; zoonose?: boolean; risk: Record<string, number>; tekst: string; sympt: string };
export type TbeStatus = "humaan" | "detectie" | "geen";
export type Provincie = { id: string; naam: string; risk: number; tbe: boolean; tbeStatus: TbeStatus; tbeBron?: string; lymePct: string; samenvatting: string; habitat: string; ziekten: string[]; tip: string; preventie: string[]; gemeentes: string[] };

export const STZ = {
  rood:"#1D4E63", terra:"#2E7BA0", wit:"#FFFFFF",
  tekst:"#123A52", lijn:"#A63428", creme:"#F5FAFE", header:"#F5FAFE",
};

// Lyme risk levels per province (for risk-colour layer)
export const RISK = ["#C9D5DB","#CFE9F8","#A9DDF5","#4A9FD4","#2E7BA0","#1D4E63"];
export const RISK_LBL = ["Geen","Zeer laag","Laag","Matig","Hoog","Zeer hoog"];

// Toelichting bij de klassenindeling
export const RISICO_TOELICHTING =
  "De provincieklasse is een eigen gewogen indicatie, geen klasse van Tekenradar of RIVM. Zij gebruikt Tekenradar-meldingen per 100.000 inwoners, vermenigvuldigd met een habitatfactor voor bos, heide en duin. Ruwe aantallen meten vooral bevolkingsomvang en meldgedrag. De vijf klassen volgen de actuele spreiding van de berekende scores en bewegen mee als de gegevens veranderen. In elke provincie kan een lokaal natuurgebied hoger of lager uitvallen dan de provincieklasse. Dit is een epidemiologische indicatie, geen gemeten tekendichtheid of individuele kansberekening.";

// Peildatum en meldingsbias
export const PEILDATUM = PEILDATUM_AUTO;
export const LAATST_BIJGEWERKT = PEILDATUM_AUTO;
/** Periode waarop de onderliggende brongegevens betrekking hebben (niet de renderdatum). */
export const DATA_PEILDATUM =
  "brongegevens: meldingen 2019–2025, voorlopige TBE-jaarcijfers 2023–2025 (seizoen 2026 niet inbegrepen) volgens RIVM Meldingen Infectieziekten (Osiris-AIZ-selectiedatum 10 maart 2026), Tekenradar-jaarcijfers 2025, LCI-richtlijn TBE, Staat van Infectieziekten 2024 en Wijburg et al. 2026";
/** Peildatum per afzonderlijke brongegevensbron: waar de gegevens vandaan komen en op welke periode ze slaan. */
export const BRON_PEILDATA: { sleutel?: string; bron: string; url?: string; peildatum: string; toelichting: string }[] = [
  {
    sleutel: "stz",
    bron: "Stichting Tekenbeetziekten",
    url: "https://www.tekenbeetziekten.nl",
    peildatum: "cijferpagina, geraadpleegd 2026",
    toelichting: "Seroprevalentiecijfers (circa 87.000 besmettingen per jaar) en voorlichting.",
  },
  {
    sleutel: "lymevereniging",
    bron: "Lymevereniging",
    url: "https://www.lymevereniging.nl",
    peildatum: "geraadpleegd 2026",
    toelichting: "Patiëntinformatie en cijfers over ziektelast en beloop.",
  },
  {
    sleutel: "rivm_lyme",
    bron: "RIVM / LCI-richtlijnen",
    url: "https://www.rivm.nl/tekenbeten-en-lyme",
    peildatum: "richtlijnversies 2025–2026; Staat van Infectieziekten 2024",
    toelichting: "Landelijke kerncijfers, ziektebeelden en de richtlijnteksten per tekenbeetziekte.",
  },
  {
    bron: "GGD-regio's",
    url: "https://www.ggd.nl",
    peildatum: "regiogegevens t/m 2025",
    toelichting: "Regionale meldingen en signaleringen, gebruikt bij de TBE-markering.",
  },
  {
    sleutel: "tekenradar",
    bron: "Tekenradar.nl (RIVM en Wageningen University & Research)",
    url: "https://www.tekenradar.nl",
    peildatum: "tekenbeetmeldingen 2019–2025",
    toelichting: "Basis voor de provincieklasse: Tekenradar-meldingen per 100.000 inwoners, gewogen met habitat.",
  },
  {
    sleutel: "wur",
    bron: "Nederlands Kennisnetwerk voor Teken / Wageningen University & Research",
    url: "https://www.wur.nl/nl/onderzoek-resultaten/onderzoeksinstituten/environmental-research/teken-en-tekenbeetziekten.htm",
    peildatum: "onderzoeksgegevens t/m 2025",
    toelichting: "Besmettingspercentages van teken en onderzoek naar tekensoorten en habitat.",
  },
  {
    sleutel: "lci_tbe",
    bron: "TBE-meldingen (RIVM/LCI)",
    url: "https://www.rivm.nl/tbe",
    peildatum: "gebruikte, niet onafhankelijk geverifieerde selectie: 25 meldingen in 2025, 22 in 2024 en 8 in 2023 (Osiris-AIZ-selectiedatum 10 maart 2026); seizoen 2026 niet inbegrepen",
    toelichting: "Humane meldingen en waarschijnlijke besmettingsplaatsen.",
  },
  {
    sleutel: "nvwa",
    bron: "NVWA (Centrum Monitoring Vectoren)",
    url: "https://www.nvwa.nl",
    peildatum: "monitoringsgegevens t/m 2026",
    toelichting: "Monitoring en soortdeterminatie van inheemse en exotische teken (o.a. Hyalomma, bruine hondenteek); onderbouwt de tekensoorten-informatie en de referentiedatabase voor de AI-scan.",
  },
  {
    sleutel: "cbs",
    bron: "CBS (Centraal Bureau voor de Statistiek)",
    url: "https://www.cbs.nl/nl-nl/visualisaties/dashboard-bevolking/regionaal",
    peildatum: "bevolkingscijfers per provincie, 1 januari 2026",
    toelichting: "Inwonertal per provincie; gebruikt om meldingen om te rekenen naar cijfers per 100.000 inwoners en om landelijke schattingen naar rato over de provincies te verdelen.",
  },
  {
    sleutel: "ggd",
    bron: "GGD'en (GGD GHOR Nederland)",
    url: "https://www.ggdghorkennisnet.nl/",
    peildatum: "regionale signalering en infectieziekte-informatie, geraadpleegd 2026",
    toelichting: "Regionale meldingen, uitbraken en lokale voorlichting over tekenbeten en tekenbeetziekten; onderbouwt de provinciewaarschuwingen en de verwijzing naar de huisarts/GGD.",
  },
  {
    sleutel: "ecdc",
    bron: "ECDC (Europees Centrum voor ziektepreventie en -bestrijding)",
    url: "https://www.ecdc.europa.eu/en/tick-borne-encephalitis",
    peildatum: "Europese verspreidingsgegevens TBE en CCHF, geraadpleegd 2026",
    toelichting: "Verspreiding van TBE en CCHF in Europa en de opmars van de Hyalomma-reuzenteek; onderbouwt de Europese context en de CCHF-informatie.",
  },
  {
    sleutel: "dwhc",
    bron: "DWHC (Dutch Wildlife Health Centre)",
    url: "https://dwhc.nl/ziekten/teken-encefalitis/",
    peildatum: "reeënsurveillance en TBE-risicokaart, geraadpleegd 2026",
    toelichting: "Nationale reeënsurveillance (bloedonderzoek bij reeën) en de overzichtskaart van het TBE-virus in Nederland; onderbouwt de TBE-markering en de TBE-meldingen op de kaart.",
  },
  {
    sleutel: "erasmusmc",
    bron: "Erasmus MC (Viroscience)",
    url: "https://www.erasmusmc.nl/nl-nl/research/departments/viroscience",
    peildatum: "virologische diagnostiek en onderzoek TBE, geraadpleegd 2026",
    toelichting: "Referentiediagnostiek en onderzoek naar het TBE-virus bij mens en teek; onderbouwt de TBE-meldingen en -cijfers.",
  },
  {
    sleutel: "labmicta",
    bron: "LabMicTA",
    url: "https://www.labmicta.nl",
    peildatum: "laboratoriumdiagnostiek tekenbeetziekten, geraadpleegd 2026",
    toelichting: "Regionaal laboratorium voor medische microbiologie (Twente/Achterhoek): diagnostiek van TBE en andere tekenbeetziekten; onderbouwt de TBE-cijfers in Oost-Nederland.",
  },
  {
    sleutel: "artemis",
    bron: "Artemis One Health",
    url: "https://www.artemisonehealth.com",
    peildatum: "One Health-onderzoek tekenoverdraagbare virussen, geraadpleegd 2026",
    toelichting: "Onderzoek naar zoönotische en tekenoverdraagbare virussen (waaronder TBE) bij mens, dier en teek; onderbouwt de TBE-informatie.",
  },
  {
    bron: "Wijburg et al. (2026), Eurosurveillance",
    url: "https://www.eurosurveillance.org",
    peildatum: "publicatie 2026, veldgegevens t/m 2024",
    toelichting: "Habitatgeschiktheidsmodel (R0) voor TBE gecombineerd met gerichte veldmonitoring; de eigen detecties in teken en wild onderbouwen de TBE-markering.",
  },
  {
    sleutel: "uu_proefschrift_wijburg",
    bron: "Wijburg S.R. (2026), proefschrift Universiteit Utrecht — Improving National Surveillance of Wildlife and Vector-Borne Diseases Using Spatial Data-Science",
    url: "https://dspace.library.uu.nl/items/3c53a0e1-848b-4ab4-aa5d-d38bbff85b4a",
    peildatum: "verdedigd 1 september 2026 (DOI 10.33540/3645)",
    toelichting: "Ruimtelijke modellen voor teken, wild en vectoroverdraagbare ziekten in Nederland; onderbouwt de TBE-markering, niet de algemene provincieklassen.",
  },
  {
    sleutel: "uu_zoonosen",
    bron: "Universiteit Utrecht, faculteit Diergeneeskunde — dossier Zoönosen",
    url: "https://www.uu.nl/organisatie/faculteit-diergeneeskunde/nieuws-agenda/achtergrond/dossiers/zoonosen",
    peildatum: "dossier, doorlopend bijgewerkt (geraadpleegd 2026)",
    toelichting: "Achtergrond en duiding over zoönosen in Nederland (waaronder tekenoverdraagbare ziekten), gebruikt voor de uitleg bij ziektebeelden en risicocommunicatie.",
  },

  {
    sleutel: "beetplek_db",
    bron: "Eigen referentiedatabase beetplekken (TekenRisicoKaart)",
    peildatum: "2 september 2026",
    toelichting: "Gevalideerde voorbeeldfoto's en kenmerkenbeschrijvingen voor de AI-scan van de beetplek, gebaseerd op beeldmateriaal en voorlichting van Stichting Tekenbeetziekten, RIVM, Lymevereniging en de NHG-behandelrichtlijn Tekenbeet en erythema migrans.",
  },
  {
    sleutel: "teek_db",
    bron: "Eigen referentiedatabase tekensoorten (TekenRisicoKaart)",
    peildatum: "2 september 2026",
    toelichting: "Gevalideerde voorbeeldfoto's en kenmerkenbeschrijvingen voor de AI-scan van de teek, gebaseerd op Stichting Tekenbeetziekten, RIVM en Centrum Monitoring Vectoren (NVWA), met foto's van Waarneming.nl, Picture Insect en iNaturalist.",
  },
];
export const WIJBURG_CITATIE =
  "Wijburg S. et al., Euro Surveill. 2026;31(20):2500767 — een studie die een R0-habitatgeschiktheidsmodel voor TBEV combineert met gerichte monitoring van teken en wild; de monitoringresultaten kwamen overeen met de door het model voorspelde risicogebieden en bevestigden verdere verspreiding van het virus. Geen meldingentelling. Deze studie onderbouwt de TBE-markering, niet de risicoklassen op de kaart.";
export const MELDINGSBIAS_KORT =
  "Let op meldingsbias: de provincieklasse gebruikt Tekenradar-meldingen per 100.000 inwoners, gewogen met habitat. Dit meet geen tekendichtheid of individuele infectiekans; lokale natuurgebieden kunnen afwijken van de provincieklasse.";

/**
 * Aandeel tekenbeten dat in de eigen tuin is opgelopen, per provincie (RIVM /
 * Tekenradar, peiljaar 2026). Het RIVM publiceert deze cijfers als percentage
 * van alle gemelde tekenbeten in die provincie — niet als meldingen per 100.000.
 */
export const TUINBEET_PCT: Record<string, string> = {
  groningen: "meer dan 40%",
  friesland: "30–40%",
  drenthe: "meer dan 40%",
  overijssel: "30–40%",
  flevoland: "30–40%",
  gelderland: "30–40%",
  noordholland: "minder dan 30%",
  utrecht: "minder dan 30%",
  zuidholland: "30–40%",
  zeeland: "meer dan 40%",
  noordbrabant: "minder dan 30%",
  limburg: "30–40%",
};
export const TUINBEET_TOELICHTING =
  "Aandeel van de gemelde tekenbeten dat in de eigen tuin is opgelopen (RIVM/Tekenradar, 2026). Dit is géén aantal meldingen per 100.000 inwoners. In Drenthe, Groningen en Zeeland ligt het aandeel boven de 40%, in Noord-Holland, Utrecht en Noord-Brabant onder de 30%. Het RIVM geeft aan dat de oorzaak van dit verschil niet bekend is.";
export const TUINBEET_BRON = { naam: "RIVM / Tekenradar.nl", url: "https://www.rivm.nl/tekenbeten-en-lyme/actuele-tekenradar-cijfers", label: "actuele tekencijfers" };

/**
 * Geschat aantal tekenbeten per provincie per jaar. Afgeleid van de landelijke
 * RIVM-schatting van circa 1,5 miljoen tekenbeten per jaar, verdeeld naar
 * inwonertal per provincie (CBS). Dit is een indicatieve schatting, geen
 * telling van meldingen en geen cijfer per 100.000 inwoners.
 */
export const TEKENBEET_AANTAL: Record<string, number> = {
  groningen: 50000,
  friesland: 55000,
  drenthe: 42000,
  overijssel: 99000,
  flevoland: 38000,
  gelderland: 178000,
  noordholland: 248000,
  utrecht: 117000,
  zuidholland: 321000,
  zeeland: 33000,
  noordbrabant: 219000,
  limburg: 94000,
};
export const TEKENBEET_TOELICHTING =
  "Bevolkingsverdeelde schatting per provincie. De landelijke RIVM-schatting van circa 1,5 miljoen tekenbeten per jaar is naar inwonertal verdeeld (CBS). Dit is een geschat absoluut aantal beten, geen provinciale meting of meldingentelling. De provincieklasse gebruikt afzonderlijk Tekenradar-meldingen per 100.000 inwoners, gewogen met habitat. Het werkelijke aantal beten kan sterk afwijken door habitat, buitenactiviteit en meldgedrag. Voor de omvangscategorie telt de getoonde schatting: 50.000 valt in 50.000 – 99.999, dus ook Groningen. Deze grens is geen biologische risicogrens.";
export const TEKENBEET_BRON = { naam: "RIVM (landelijke schatting) en CBS (inwonertal)", url: "https://www.rivm.nl/tekenbeten-en-lyme/cijfers", label: "RIVM-cijfers tekenbeten en lyme" };
export const TEKENBEET_KLASSEN: { label: string; min: number }[] = [
  { label: "200.000 of meer", min: 200000 },
  { label: "100.000 – 199.999", min: 100000 },
  { label: "50.000 – 99.999", min: 50000 },
  { label: "minder dan 50.000", min: 0 },
];
export function tekenbeetKlasse(aantal: number | undefined): string {
  if (aantal == null) return "onbekend";
  return TEKENBEET_KLASSEN.find((k) => aantal >= k.min)?.label ?? "onbekend";
}



export const CIJFER_NUANCE: { vraag: string; punten: string[]; slot: string } = {
  vraag: "Waarom verschillen deze cijfers?",
  punten: [
    "Circa 27.000 Lyme-diagnoses per jaar is de RIVM-schatting voor 2017 uit huisartsenonderzoek: ongeveer 25.500 met erythema migrans en 1.500 met andere verschijnselen van verspreide Lyme. Het is geen actuele jaarlijkse EM-registratie.",
    "Stichting Tekenbeetziekten plaatst hier kanttekeningen bij: op basis van seroprevalentie komt men uit op circa 87.000 besmettingen per jaar, oftewel ongeveer 5,8% risico per tekenbeet.",
    "Tekenradar meldt dat gemiddeld 1 op de 3 teken besmet is met een ándere tekenoverdraagbare ziekteverwekker dan Borrelia.",
    "De verschillen komen door meetmethode: registraties en huisartsmeldingen tellen alleen herkende gevallen, seroprevalentie-onderzoek meet antistoffen in de bevolking en vangt ook niet-herkende infecties.",
  ],
  slot: "Deze website en web-app toont beide lijnen naast elkaar, zodat u zelf ziet welke bron welk cijfer geeft.",
};

/** Tweetalige uitleg bij het landelijke overzicht van de 11 tekenbeetziekten. */
export const LANDELIJK_ZIEKTEN_UITLEG = {
  aantal: 11,
  subtitel: {
    nl: "~50% van de teken draagt één of meer ziekteverwekkers",
    en: "~50% of ticks carry one or more disease agents",
  },
  vraag: {
    nl: "Wat staat er in de lijst — en waarom?",
    en: "What is on the list — and why?",
  },
  tekst: {
    nl: "In de lijst staan 11 aandoeningen die met teken en tekenbeten in verband worden gebracht. Bij verschillende aandoeningen is overdracht via teken vastgesteld; bij R. helvetica is de ziekterol bij mensen onzeker. Bij het alfa-galsyndroom gaat het niet om een verwekker maar om een allergische aandoening die na een tekenbeet kan ontstaan. Bij bartonellose is overdracht via een tekenbeet niet wetenschappelijk vastgesteld; de bacterie wordt wel in teken aangetroffen. CCHF (Krim-Congo hemorragische koorts) is in Nederland nooit bij mens of teek vastgesteld en staat alleen als internationale reizigerscontext in het overzicht. Aandoeningen waarvoor overdracht via teken in Nederland niet is aangetoond of onvoldoende onderzocht, zoals ehrlichiose, nemen we niet op. Zo blijft zichtbaar welke bewijsstatus bij iedere aandoening hoort.",
    en: "The list contains 11 conditions associated with ticks and tick bites. Tick-borne transmission is established for several conditions; the role of R. helvetica in human disease is uncertain. Alpha-gal syndrome is not caused by a pathogen but is an allergic condition that can develop after a tick bite. Tick-borne transmission of bartonellosis has not been scientifically established, although the bacterium has been found in ticks. CCHF (Crimean-Congo haemorrhagic fever) has never been detected in humans or ticks in the Netherlands and is included only as international travel context. Conditions for which tick-borne transmission in the Netherlands has not been demonstrated or has been insufficiently studied, such as ehrlichiosis, are not included. This makes the evidence status of each condition explicit.",
  },
};

// ─── 11 TEKENBEETZIEKTEN met eigen kleur ─────────────────────────────────────
export const TBE_LOCATIES_LIJST = "de Sallandse Heuvelrug, Utrechtse Heuvelrug, Twente, Achterhoek, Terschelling, Zandvoort, Ermelo, centraal Noord-Brabant en de noordoostelijke Flevopolder";

export const ZIEKTEN: Ziekte[] = [
  { id:"lyme",        naam:"Ziekte van Lyme",             kleur:"#E07020", pct:"~20%", pctNoot:"RIVM: circa 20% (ongeveer 1 op 5), een afgerond voorlichtingscijfer; de publieksbron specificeert hiervoor geen afzonderlijk onderzoeksjaar, tekenstadium of testmethode. Stichting Tekenbeetziekten vermeldt gemiddeld 29,3% op basis van Jahfari et al. (2016): PCR/reverse line blot van 314 bij mensen verwijderde Ixodes ricinus, verzameld via huisartsen in 2007–2008 (4 larven, 167 nimfen, 135 volwassen, 8 onbekend); 92 waren Borrelia-positief. Dit is een onderzoekssteekproef, geen lokaal maximum en geen actuele, representatieve landelijke meting. Bron en methode verschillen; geen van beide percentages is een infectiekans per beet.", type:"Bacterie", zoonose:true,
    risk:{groningen:3,friesland:2,drenthe:5,overijssel:4,flevoland:3,gelderland:4,noordholland:4,utrecht:4,zuidholland:3,zeeland:3,noordbrabant:3,limburg:3},
    tekst:"Meest voorkomende tekenbeetziekte in Nederland. Een groter wordende rode of blauwrode vlek of ring kan passen bij erythema migrans; alleen een arts kan dit beoordelen.",
    sympt:"Mogelijke klachten zijn een groter wordende rode of blauwrode vlek of ring, koorts, gewrichtsklachten en vermoeidheid; niet iedereen heeft dezelfde klachten"},
  { id:"tbe",         naam:"TBE – Tekenencefalitis",      kleur:"#8B2FC9", pct:"~0,07% lokaal", pctNoot:"Lokale schatting: ongeveer 1 op de 1.500 teken (0,07%) in gebieden waar TBE-virus is gevonden. Dit is geen gemeten landelijk gemiddelde en geen infectiekans per beet.", type:"Virus", zoonose:true,
    risk:{groningen:1,friesland:2,drenthe:2,overijssel:4,flevoland:3,gelderland:4,noordholland:3,utrecht:4,zuidholland:1,zeeland:2,noordbrabant:2,limburg:2},
    tekst:"Vaccin beschikbaar. Bekende gepubliceerde vindplaatsen en waarschijnlijke besmettingsplaatsen zijn onder meer " + TBE_LOCATIES_LIJST + ". TBE kan in heel Nederland in lokale haarden voorkomen.",

    sympt:"Koorts, hoofdpijn, hersenvliesontsteking, nekstijfheid"},
  { id:"rickettsia",  naam:"Rickettsia – onzekere ziekterol", kleur:"#D94040", pct:"31,1% (onderzoek)", pctNoot:"Coipan et al. (2013): 31,1% R. helvetica tegenover 11,8% B. burgdorferi s.l. in zoekende Ixodes ricinus (nimfen en volwassen teken), individueel onderzocht met PCR/reverse line blot. Verzameld op 21 locaties in 2006–2010 en één locatie in 2000–2009. Dit is geen actueel landelijk gemiddelde. Een andere steekproef van bij mensen verwijderde teken (2007–2008; Jahfari et al., 2016) vond circa 22% Rickettsia-soorten, waaronder R. helvetica en R. monacensis. Deze noemers zijn niet uitwisselbaar.", type:"Bacterie",
    risk:{groningen:3,friesland:2,drenthe:4,overijssel:3,flevoland:3,gelderland:4,noordholland:4,utrecht:4,zuidholland:3,zeeland:3,noordbrabant:3,limburg:3},
    tekst:"Rickettsia helvetica werd in het onderzoek naar zoekende Nederlandse teken van Coipan et al. (2013) het vaakst aangetroffen van de onderzochte micro-organismen. De rol bij ziekte bij mensen is onzeker; veel DNA-vondsten in teken betekenen niet veel ziektegevallen.",
    sympt:"Voor R. helvetica is geen eenduidig ziektebeeld vastgesteld. Koorts is beschreven; de typische combinatie van vlekkenkoorts en eschar mag niet aan deze bacterie worden toegeschreven."},
  { id:"neoehrlichia",naam:"Neoehrlichiose",              kleur:"#6B8E23", pct:"5,4% (onderzoek)", pctNoot:"Jahfari et al. (2016): 5,4% Candidatus Neoehrlichia mikurensis in bij mensen verwijderde Ixodes ricinus uit 2007–2008; 312 teken onderzocht met real-time PCR, binnen een steekproef van 314 teken (larven, nimfen en volwassen teken). DNA-aantoning, geen actuele landelijke prevalentie, provinciale meting of infectiekans per beet.", type:"Bacterie", zoonose:true,
    risk:{groningen:2,friesland:2,drenthe:3,overijssel:3,flevoland:2,gelderland:3,noordholland:2,utrecht:2,zuidholland:2,zeeland:2,noordbrabant:2,limburg:2},
    tekst:"Kan lijken op Lyme. Ernstig bij immuungecompromitteerden.",
    sympt:"Koorts, vermoeidheid, spierpijn"},
  { id:"babesia",     naam:"Babesiose",                   kleur:"#E07B3A", pct:"3,5%", pctNoot:"Jahfari et al. (2016): 3,5% Babesia-soorten in 314 bij mensen verwijderde Ixodes ricinus uit 2007–2008 (4 larven, 167 nimfen, 135 volwassen teken, 8 met onbekend stadium), individueel onderzocht met PCR/reverse line blot. Geen landelijk gemiddelde. Coipan et al. (2013) vond 1,7% in zoekende nimfen en volwassen teken uit 2000–2010; dit betreft een andere steekproef.", type:"Parasiet", zoonose:true,
    risk:{groningen:2,friesland:2,drenthe:3,overijssel:3,flevoland:2,gelderland:3,noordholland:1,utrecht:2,zuidholland:1,zeeland:2,noordbrabant:2,limburg:2},
    tekst:"De gebruikelijke antibiotica tegen Lyme zijn niet gericht op deze parasiet. In 2024 werd de eerste in Nederland opgelopen besmetting beschreven.",
    sympt:"Mogelijke klachten zijn koorts, bloedarmoede, geelzucht en donkere urine; klachten en ernst kunnen verschillen"},
  { id:"miyamotoi",   naam:"Borrelia miyamotoi-ziekte",   kleur:"#B8860B", pct:"2,3%", pctNoot:"Jahfari et al. (2016): 2,3% B. miyamotoi, real-time PCR van 302 bij mensen verwijderde Ixodes ricinus uit de steekproef van 2007–2008 (larven, nimfen en volwassen teken; stadiumverdeling voor deze 302 niet apart vermeld). Individuele teken, geen pools en geen landelijk gemiddelde. Andere onderzoeken met pools van zoekende nimfen hebben een andere noemer.", type:"Bacterie", zoonose:true,
    risk:{groningen:2,friesland:2,drenthe:3,overijssel:3,flevoland:2,gelderland:3,noordholland:2,utrecht:2,zuidholland:2,zeeland:2,noordbrabant:2,limburg:2},
    tekst:"Terugkerende koortsaanvallen kunnen voorkomen. Standaard Lyme-serologie is niet bedoeld om deze specifieke infectie aan te tonen.",
    sympt:"Mogelijke klacht is terugkerende koorts; een rode ring is niet kenmerkend"},
  { id:"anaplasma",   naam:"Anaplasmose",                 kleur:"#4682B4", pct:"1% (onderzoek)", pctNoot:"Jahfari et al. (2016): 3 van 314 bij mensen verwijderde Ixodes ricinus uit 2007–2008 positief voor Anaplasma phagocytophilum (1,0%), onderzocht met PCR/reverse line blot (larven, nimfen en volwassen teken). DNA-aantoning, geen actuele landelijke prevalentie, provinciale meting of infectiekans per beet.", type:"Bacterie", zoonose:true,
    risk:{groningen:2,friesland:2,drenthe:2,overijssel:2,flevoland:2,gelderland:2,noordholland:1,utrecht:2,zuidholland:1,zeeland:1,noordbrabant:2,limburg:2},
    tekst:"Kan gepaard gaan met een verlaagd aantal witte bloedcellen. Een arts bepaalt of en welke antibiotica passend zijn.",
    sympt:"Mogelijke klachten en bevindingen zijn hoge koorts, hoofdpijn en verlaagde witte bloedcellen"},
  { id:"bartonella",  naam:"Bartonellose",                kleur:"#8B6914", pct:"Onbekend", pctNoot:"Overdracht via een tekenbeet is niet wetenschappelijk vastgesteld. Een provinciale vergelijking van een tekengebonden infectiekans is niet onderbouwd.", type:"Bacterie", zoonose:true,
    risk:{groningen:1,friesland:1,drenthe:2,overijssel:2,flevoland:1,gelderland:2,noordholland:1,utrecht:1,zuidholland:1,zeeland:1,noordbrabant:2,limburg:2},
    tekst:"Bartonella wordt in teken aangetroffen; dit bewijst geen overdracht naar mensen via een tekenbeet.",
    sympt:"Griepachtig, neurologische klachten, streepvormige huiduitslag"},
  { id:"tularemie",   naam:"Tularemie",                   kleur:"#556B2F", pct:"Aangetoond", type:"Bacterie", zoonose:true,
    risk:{groningen:1,friesland:1,drenthe:1,overijssel:1,flevoland:1,gelderland:1,noordholland:1,utrecht:1,zuidholland:1,zeeland:1,noordbrabant:1,limburg:1},
    tekst:"Francisella tularensis aangetoond in NL teken. Primair via diercontact.",
    sympt:"Koorts, zweren, gezwollen lymfeklieren"},
  { id:"alfagal",     naam:"Alfa-galsyndroom",            kleur:"#E75480", pct:"Gedocumenteerd", type:"Allergische aandoening (geen verwekker)",
    risk:{groningen:2,friesland:2,drenthe:3,overijssel:2,flevoland:2,gelderland:3,noordholland:1,utrecht:2,zuidholland:1,zeeland:2,noordbrabant:2,limburg:2},
    tekst:"Vleesallergie na tekenbeet. Alpha-gal molecuul uit speeksel veroorzaakt immuunreactie.",
    sympt:"Allergie 3-6u na vlees: jeuk, netelroos, anafylaxie"},
  { id:"cchf",        naam:"CCHF – Krim-Congo hemorragische koorts", kleur:"#E3B505", pct:"Niet in NL", pctNoot:"Nooit aangetoond in Nederlandse teken of patiënten; daarom overal risicoklasse Geen.", type:"Virus", zoonose:true,
    risk:{groningen:0,friesland:0,drenthe:0,overijssel:0,flevoland:0,gelderland:0,noordholland:0,utrecht:0,zuidholland:0,zeeland:0,noordbrabant:0,limburg:0},
    tekst:"Komt in Nederland (nog) niet voor: het virus is hier nooit bij mens of teek vastgesteld. In Europa wel in opmars — o.a. Spanje, Balkan, Griekenland, Turkije en Bulgarije (bron: ECDC).",
    sympt:"Hoge koorts, spierpijn, braken, bloedingen (ernstig verloop mogelijk)"},
];


// ─── EXTRA UITLEG PER ZIEKTE ─────────────────────────────────────────────────
export type ZiekteExtra = { incubatie: string; overdracht: string; behandeling: string; arts: string; weetje: string };
export const ZIEKTE_EXTRA: Record<string, ZiekteExtra> = {
  lyme: { incubatie:"3 dagen tot 3 maanden (rode ring meestal na 7–14 dagen)",
    overdracht:"Borrelia kan via een besmette teek worden overgedragen. De kans op Lyme hangt onder meer af van de aanhechtingsduur en de teek. Snel verwijderen verkleint het risico, maar 24 uur is geen harde veilige grens. Verwijder een teek altijd zo snel mogelijk.",
    behandeling:"Een typisch erythema migrans (EM) is een klinische diagnose: een arts stelt die op basis van het huidbeeld en de voorgeschiedenis. Een bloedtest is dan niet nodig om behandeling te starten. Lyme wordt met antibiotica behandeld. Bij EM kan een arts bijvoorbeeld doxycycline of amoxicilline voorschrijven; zwangerschap, leeftijd, allergieën en het ziektebeeld bepalen de keuze. Azitromycine is geen algemene vervanger voor zwangeren of kinderen. Deze Lyme-behandelopties gelden niet automatisch voor anaplasmose of andere tekenbeetziekten.",
    arts:"Bespreek een groter wordende rode of blauwrode vlek of ring, of klachten zoals koorts, gewrichts- of zenuwklachten na een tekenbeet met een arts.",
    weetje:"RIVM: circa 20% (ongeveer 1 op 5), een afgerond voorlichtingscijfer; de publieksbron specificeert hiervoor geen afzonderlijk onderzoeksjaar, tekenstadium of testmethode. Stichting Tekenbeetziekten vermeldt gemiddeld 29,3% op basis van Jahfari et al. (2016): PCR/reverse line blot van 314 bij mensen verwijderde Ixodes ricinus, verzameld via huisartsen in 2007–2008 (4 larven, 167 nimfen, 135 volwassen, 8 onbekend); 92 waren Borrelia-positief. Dit is een onderzoekssteekproef, geen lokaal maximum en geen actuele, representatieve landelijke meting. Bron en methode verschillen; geen van beide percentages is een infectiekans per beet. Circa 27.000 Lyme-diagnoses per jaar is de RIVM-schatting voor 2017 uit huisartsenonderzoek: ongeveer 25.500 met erythema migrans en 1.500 met andere verschijnselen van verspreide Lyme. Het is geen actuele jaarlijkse EM-registratie." },
  tbe: { incubatie:"Meestal 7–14 dagen. Bij een ziekteverloop in twee fasen volgen eerst griepachtige klachten, zoals koorts, hoofdpijn en spierpijn (fase 1), daarna een klachtenvrije periode en bij een deel van de patiënten neurologische klachten door hersenvlies- of hersenontsteking (fase 2). Veel infecties geven geen klachten; niet iedereen doorloopt beide fasen en de eerste fase kan ontbreken",
    overdracht:"TBE-virus bevindt zich in de speekselklieren van een besmette teek en kan al kort na aanhechting, tijdens de beet, worden overgedragen. Borrelia-overdracht hangt doorgaans sterker samen met de aanhechtingsduur en vindt vaak pas na uren plaats, maar er is ook voor Lyme geen harde veilige tijdsgrens. Niet iedere beet leidt tot een infectie. Verwijder een teek altijd zo snel mogelijk, maar snelle verwijdering biedt geen betrouwbare bescherming tegen TBE. Overdracht is ook mogelijk via rauwmelkse producten van besmette geiten, schapen of koeien.",
    behandeling:"Antibiotica werken niet tegen TBE, omdat TBE door een virus wordt veroorzaakt. Er is geen specifieke antivirale behandeling; medische zorg is ondersteunend. Vaccinatie is de specifieke preventieve maatregel tegen TBE, maar biedt geen volledige garantie en beschermt niet tegen Lyme of andere tekenbeetziekten. Tekenbeten voorkomen en tekencontroles blijven daarom belangrijk. Een arts of GGD kan informatie geven over vaccinatie bij verblijf in risicogebieden.",
    arts:"Bij koorts met hoofdpijn, nekstijfheid, verwardheid of verlammingsverschijnselen na bosbezoek.",
    weetje:"Sinds 1 maart 2025 is TBE meldingsplichtig (groep C); eerdere cijfers berusten op vrijwillige melding. Volgens de LCI-richtlijn zijn tussen 2016 en juni 2024 23 patiënten gemeld die TBE in Nederland opliepen. Dit is een andere periode en populatie dan de totale jaarmeldingen." },
  rickettsia: { incubatie:"Voor R. helvetica niet betrouwbaar vastgesteld",
    overdracht:"R. helvetica is in Nederlandse teken aangetoond. De betekenis van een tekenbeet voor ziekte bij mensen is bij deze bacterie onzeker; DNA-aantoning in een teek bewijst geen infectie of ziekte bij de gebeten persoon.",
    behandeling:"Een arts beoordeelt een eventuele rickettsiose en de behandeling; een positieve teektest is geen behandelindicatie.",
    arts:"Leg nieuwe klachten na een tekenbeet vast en bespreek ze met een arts; deze informatie stelt geen diagnose.",
    weetje:"R. helvetica is een potentieel ziekteverwekkende bacterie met een onzekere ziekterol. Andere Rickettsia-soorten kunnen wel vastgestelde vlekkenkoorts met eschar veroorzaken, bijvoorbeeld in reizigerscontext." },
  neoehrlichia: { incubatie:"1–3 weken",
    overdracht:"Candidatus Neoehrlichia mikurensis kan via de beet van een besmette Ixodes-teek worden overgedragen. De bacterie kan cellen van de bloedvatwand infecteren.",
    behandeling:"Deze bacteriële infectie kan met antibiotica worden behandeld; een arts bepaalt middel en duur, mede op basis van de afweer.",
    arts:"Bij aanhoudende koorts of trombose-achtige klachten na een tekenbeet.",
    weetje:"Wordt door standaard Lyme-tests gemist; vooral gevaarlijk voor mensen met een verzwakt afweersysteem." },
  babesia: { incubatie:"1–4 weken, soms langer",
    overdracht:"Babesia-parasieten kunnen via de beet van een besmette Ixodes-teek worden overgedragen en infecteren rode bloedcellen. Overdracht kan ook via besmet bloed bij een transfusie plaatsvinden.",
    behandeling:"Behandeling kan bestaan uit middelen gericht tegen de parasiet, soms gecombineerd met een antibioticum. Een arts bepaalt middel en duur; gebruikelijke Lyme-antibiotica alleen behandelen babesiose niet.",
    arts:"Bij koorts met bleekheid, donkere urine of geelzucht na een tekenbeet.",
    weetje:"Mensen zonder milt of met een verminderde afweer kunnen een ernstiger beloop hebben." },
  miyamotoi: { incubatie:"1–3 weken",
    overdracht:"Borrelia miyamotoi kan via de beet van een besmette Ixodes-teek worden overgedragen. Deze bacterie behoort tot de terugkerende-koortsbacteriën.",
    behandeling:"Deze bacteriële infectie kan met antibiotica worden behandeld; een arts bepaalt middel en duur op basis van het ziektebeeld.",
    arts:"Bij koorts die in golven terugkomt zonder duidelijke oorzaak.",
    weetje:"Deze bacterie verschilt van de Borrelia-soorten die Lyme veroorzaken." },
  anaplasma: { incubatie:"5–14 dagen",
    overdracht:"Anaplasma phagocytophilum kan via de beet van een besmette Ixodes-teek worden overgedragen en infecteert bepaalde witte bloedcellen.",
    behandeling:"Deze bacteriële infectie kan met antibiotica worden behandeld; een arts bepaalt middel en duur.",
    arts:"Bij hoge koorts met hoofdpijn en spierpijn, zeker bij afwijkend bloedbeeld.",
    weetje:"Kan samen met Lyme voorkomen; het bloedbeeld toont vaak lage witte bloedcellen en bloedplaatjes." },
  bartonella: { incubatie:"Dagen tot weken",
    overdracht:"Bartonella-soorten; overdracht is bewezen via een krab of beet van een kat (kattenkrabziekte) en via vlooien. Ook een lik op een wondje of via kattenvlooien-uitwerpselen kan besmetting geven.",
    behandeling:"Als behandeling nodig is, bepaalt een arts op basis van oorzaak en ziektebeeld of antibiotica passend zijn.",
    arts:"Bij langdurige lymfeklierzwelling, koorts of onverklaarde neurologische klachten.",
    weetje:"De gegevens over teken staan los van de bewezen routes via katten en vlooien." },
  tularemie: { incubatie:"3–5 dagen (tot 14 dagen)",
    overdracht:"Francisella tularensis, meestal via hazen of knaagdieren; tekenbeet is een mogelijke route.",
    behandeling:"Deze bacteriële infectie kan met antibiotica worden behandeld; een arts bepaalt middel en duur.",
    arts:"Bij een zweertje op de beetplek met gezwollen lymfeklieren en koorts.",
    weetje:"Ook wel hazenpest genoemd; sinds 2011 weer af en toe in Nederland vastgesteld." },
  cchf: { incubatie:"1–9 dagen na een tekenbeet (tot 13 dagen na contact met bloed of weefsel)",
    overdracht:"Krim-Congovirus (CCHFV), vooral via een beet van de reuzenteek (Hyalomma) of het pletten van zo'n teek. Ook via bloed en weefsel van besmet vee en van patiënt op verzorger.",
    behandeling:"Er is geen algemeen beschikbare specifieke behandeling; medische zorg is ondersteunend en vindt bij ernstige ziekte in het ziekenhuis plaats.",
    arts:"Direct bij hoge koorts, ernstige spierpijn of bloedingen na verblijf in een risicogebied in Zuid- of Zuidoost-Europa.",
    weetje:"Volgens het ECDC breidt het verspreidingsgebied zich noordwaarts uit door klimaatverandering en trekvogels die Hyalomma-teken meebrengen. In Nederland is het virus nog niet aangetoond, maar de reuzenteek wordt hier inmiddels wel gevonden." },
  alfagal: { incubatie:"Klachten ontstaan weken na de beet, telkens 3–6 uur na het eten van vlees",
    overdracht:"Alpha-gal-suiker uit tekenspeeksel zet het afweersysteem aan tot een allergie voor zoogdiervlees.",
    behandeling:"Behandeling en voedingsaanpassingen worden individueel met een arts of allergoloog bepaald; daarbij kunnen vermijding en medicijnen voor allergische reacties aan bod komen.",
    arts:"Bij netelroos, buikklachten of benauwdheid enkele uren na vlees eten.",
    weetje:"De vertraging van uren maakt dat de link met vlees — en met de tekenbeet — vaak lang onopgemerkt blijft." },
};

// ─── UITLEG RISICONIVEAUS ────────────────────────────────────────────────────
export const RISK_UITLEG = [
  "Deze ziekte is in Nederland niet aangetoond; dat is geen individuele garantie. Reizen naar gebieden waar zij voorkomt is een afzonderlijke context.",
  "Zeer lage relatieve indicatie op basis van genormaliseerde meldingen en habitat; lokale afwijkingen blijven mogelijk.",
  "Lage relatieve indicatie op basis van genormaliseerde meldingen en habitat; lokale hotspots blijven mogelijk.",
  "Matige relatieve indicatie op basis van genormaliseerde meldingen en habitat; dit is geen meting van tekendichtheid.",
  "Hoge relatieve indicatie op basis van genormaliseerde meldingen en habitat; meldgedrag beïnvloedt de uitkomst.",
  "Zeer hoge relatieve indicatie op basis van genormaliseerde meldingen en habitat; geen individuele kansberekening.",
];

// ─── PROVINCIES DATA ─────────────────────────────────────────────────────────
export const PROVINCIES: Provincie[] = [
  { id:"groningen",    naam:"Groningen",    risk:2, tbe:false, tbeStatus:"geen", tbeBron:"Nog geen gepubliceerde vondst van TBE-virus of antistoffen in teken of wild, en geen besmetting bekend die in deze provincie is opgelopen (peiling t/m 2025).", lymePct:"~20% (RIVM); 29,3% (STZ, onderzoek 2007–2008)",
    samenvatting:"Teken in veengebieden, langs de Waddenkust en in bosranden. Meer dan 40% van tekenbeten in de eigen tuin.",
    habitat:"Veengebieden, Lauwersmeer, Waddenkust en bosranden.",
    ziekten:["lyme","rickettsia"],
    tip:"Tuinieren is een onderschatte risicobron.", preventie:["Tekencheck na tuinieren","Hoog gras vermijden","Wandelpaden volgen","Direct verwijderen bij tekenbeet"],
    gemeentes:["Groningen","Veendam","Stadskanaal","Delfzijl","Winschoten","Appingedam","Hoogezand-Sappemeer","Leek","Zuidhorn","Eemsmond"] },
  { id:"friesland",    naam:"Friesland",    risk:2, tbe:true,  tbeStatus:"humaan", tbeBron:"Een aantal personen met Terschelling als bron in 2023 (RIVM Infectieziekten Bulletin, 6 maart 2025); virus in teken op het eiland aangetoond in 2023 en 2024. Geen patiëntentelling per woonprovincie.", lymePct:"~20% (RIVM); 29,3% (STZ, onderzoek 2007–2008)",
    samenvatting:"Teken kunnen voorkomen in weiden, bosranden en op de Waddeneilanden. Volgens het RIVM had een aantal met TBE-virus geïnfecteerde personen in 2023 Terschelling als bron. Op het eiland is in 2023 en 2024 TBE-virus in teken aangetoond.",

    habitat:"Weiden, meren, bosranden en de Waddeneilanden Vlieland, Terschelling, Ameland en Schiermonnikoog (duinen, struweel en rietmoerassen).",
    ziekten:["lyme","tbe","rickettsia"],
    tip:"Op de Friese Waddeneilanden zijn teken actief in duinen en struweel.", preventie:["Tekentang altijd meenemen","Hoge begroeiing vermijden","Kleding controleren","Kinderen extra controleren"],
    gemeentes:["Leeuwarden","Sneek","Drachten","Heerenveen","Harlingen","Franeker","Bolsward","Dokkum","Wolvega","Gorredijk","Vlieland","Terschelling","Ameland","Schiermonnikoog"] },
  { id:"drenthe",      naam:"Drenthe",      risk:4, tbe:true, tbeStatus:"detectie", tbeBron:"Aanwijzingen in de GGD-regio: antistoffen of virus in teken/wild (Wijburg et al. 2026); geen besmetting bij mensen bekend die in deze provincie is opgelopen.", lymePct:"~20% (RIVM); 29,3% (STZ, onderzoek 2007–2008)",
    samenvatting:"Drenthe heeft in de aangehaalde Tekenradar-reeks de meeste meldingen per inwoner: 142 per 100.000 inwoners. Dit meet meldingen, geen tekendichtheid. De kaartklasse gebruikt daarnaast habitatweging. Het bevolkingsverdeelde aantal van circa 42.000 is geen provinciale meting en staat los van die klasse. Heidevelden, hoogvenen en bossen zijn geschikte tekengebieden. In deze GGD-regio zijn aanwijzingen voor aanwezigheid van het TBE-virus gevonden (antistoffen of virus in teken of wild); een humaan geval is hier niet bekend.",
    habitat:"Heidevelden, hoogveen (Bargerveen), loofbossen, Drentsche Aa.",
    ziekten:["lyme","tbe","rickettsia","babesia"],
    tip:"Controleer na elke wandeling huid én haargrens.", preventie:["Draag bedekkende kleding","Gebruik tekenwerende middelen","Controleer na buitenzijn","Verwijder direct met tekentang"],
    gemeentes:["Assen","Emmen","Meppel","Hoogeveen","Coevorden","Borger-Odoorn","Aa en Hunze","Westerveld","Tynaarlo","De Wolden","Noordenveld","Midden-Drenthe"] },
  { id:"overijssel",   naam:"Overijssel",   risk:4, tbe:true,  tbeStatus:"humaan", tbeBron:"Een in Nederland opgelopen humane infectie beschreven in Oost-Nederland (2016); daarnaast meerjarige virusvondsten in teken op de Sallandse Heuvelrug en in Twente.",  lymePct:"~20% (RIVM); 29,3% (STZ, onderzoek 2007–2008)",
    samenvatting:"Sallandse Heuvelrug en Twente zijn gebieden met gepubliceerde TBE-vondsten. Een vindplaats is geen telling van patiënten.",
    habitat:"Sallandse Heuvelrug, Twente, IJsselvallei.",
    ziekten:["lyme","tbe","rickettsia"],
    tip:"Informatie over TBE-vaccinatie kan relevant zijn bij regelmatig verblijf in bekende risicogebieden.", preventie:["TBE-vaccinatie bespreken met huisarts of GGD","Huid controleren na bosbezoek","Teek zo snel mogelijk verwijderen","Klachten vastleggen en met een arts bespreken"],
    gemeentes:["Enschede","Zwolle","Deventer","Hengelo","Almelo","Oldenzaal","Ommen","Hardenberg","Steenwijk","Kampen","Raalte","Dalfsen"] },
  { id:"flevoland",    naam:"Flevoland",    risk:3, tbe:true,  tbeStatus:"humaan", tbeBron:"De noordoostelijke Flevopolder is genoemd als waarschijnlijke plaats van een in Nederland opgelopen humane TBE-infectie in de LCI-richtlijn TBE van het RIVM. Daarnaast aanwijzingen in teken/wild.", lymePct:"~20% (RIVM); 29,3% (STZ, onderzoek 2007–2008)",
    samenvatting:"Jonge polderbossen en de Oostvaardersplassen hebben een hoge gastheerdichtheid, waardoor de tekenpopulatie snel groeit. In het noordoosten van de Flevopolder zijn aanwijzingen voor het virus in teken en wild gevonden.",
    habitat:"Jonge polderbossen (Horsterwold, Kuinderbos, Voorsterbos), Oostvaardersplassen, Lelystad-bossen.",
    ziekten:["lyme","tbe","rickettsia"],
    tip:"De Oostvaardersplassen is wildgebied — extra alertheid.", preventie:["Paden niet verlaten","Bedekkende kleding","Tekencheck na bezoek","Huisdieren ook controleren"],
    gemeentes:["Lelystad","Almere","Dronten","Urk","Zeewolde","Emmeloord","Biddinghuizen","Swifterbant","Nagele"] },
  { id:"gelderland",   naam:"Gelderland",   risk:4, tbe:true,  tbeStatus:"humaan", tbeBron:"Humaan geval Ermelo (2023); virus en antistoffen aangetoond in teken en reeën (Veluwe, Achterhoek).",  lymePct:"~20% (RIVM); 29,3% (STZ, onderzoek 2007–2008)",
    samenvatting:"Veluwe en Achterhoek zijn bekende risicogebieden. TBE aangetroffen in teken.",
    habitat:"Veluwe, Achterhoek, Gelderse Vallei — grootste bosgebied NL.",
    ziekten:["lyme","tbe","rickettsia","babesia"],
    tip:"Op de Veluwe zijn veel geschikte leefgebieden voor teken.", preventie:["Lange broeken in sokken","DEET-houdende middelen","Dagelijkse tekencheck","Klachten vastleggen en met een arts bespreken"],
    gemeentes:["Arnhem","Nijmegen","Apeldoorn","Ede","Doetinchem","Harderwijk","Tiel","Wageningen","Zutphen","Barneveld","Winterswijk","Culemborg","Buren","Montferland"] },
  { id:"noordholland", naam:"Noord-Holland", risk:3, tbe:true, tbeStatus:"humaan", tbeBron:"Humaan geval Zandvoort (2023, duingebied); aanwijzingen in teken/wild in de regio.", lymePct:"~20% (RIVM); 29,3% (STZ, onderzoek 2007–2008)",
    samenvatting:"In de duingebieden (Amsterdamse Waterleidingduinen, Schoorl, Noordhollands Duinreservaat) en het Gooi kan de lokale tekenactiviteit afwijken van de actuele provincieklasse. De klasse blijft een relatieve indicatie op basis van genormaliseerde meldingen, habitat. In 2023 werd Zandvoort genoemd als waarschijnlijke besmettingsplaats van een in Nederland opgelopen humane TBE-infectie.",
    habitat:"Gooi, duingebieden (Kennemerland/Zandvoort), Amsterdam Bos, Waterland en het Waddeneiland Texel (duinen, struweel en bosjes).",
    ziekten:["lyme","tbe","rickettsia"],

    tip:"Ook in stadsparken en in de duinen van Texel kunnen teken voorkomen.", preventie:["Tekencheck na parkbezoek","Kinderen controleren","Tekentang thuis bewaren","Bij twijfel: huisarts"],
    gemeentes:["Amsterdam","Haarlem","Alkmaar","Zaandam","Hoorn","Den Helder","Hilversum","Purmerend","Heerhugowaard","Amstelveen","Haarlemmermeer","Enkhuizen","Edam-Volendam","Castricum","Bergen","Texel"] },
  { id:"utrecht",      naam:"Utrecht",      risk:3, tbe:true,  tbeStatus:"humaan", tbeBron:"Humane gevallen Utrechtse Heuvelrug (waaronder eerste patiënt in NL, 2016); virus en reeënserologie aangetoond in het gebied.",  lymePct:"~20% (RIVM); 29,3% (STZ, onderzoek 2007–2008)",
    samenvatting:"Utrechtse Heuvelrug is bevestigd TBE-gebied met bos en heide op zandgrond: habitatrisico is hier duidelijk verhoogd.",
    habitat:"Utrechtse Heuvelrug, Nationaal Park Utrechtse Heuvelrug, Loosdrechtse Plassen.",
    ziekten:["lyme","tbe","rickettsia"],
    tip:"Broekspijpen in sokken bij bosbezoek.", preventie:["Broekspijpen in sokken","Lichte kleding","Tekencheck na wandeling","TBE-vaccinatie overwegen"],
    gemeentes:["Utrecht","Amersfoort","Zeist","Soest","Woerden","Veenendaal","Nieuwegein","IJsselstein","Houten","Baarn","Bunschoten","De Bilt","Lopik","Oudewater","Wijk bij Duurstede"] },
  { id:"zuidholland",  naam:"Zuid-Holland", risk:2, tbe:false, tbeStatus:"geen", tbeBron:"Nog geen gepubliceerde vondst van TBE-virus of antistoffen in teken of wild, en geen besmetting bekend die in deze provincie is opgelopen (peiling t/m 2025).", lymePct:"~20% (RIVM); 29,3% (STZ, onderzoek 2007–2008)",
    samenvatting:"Minder aaneengesloten natuur, maar in de Hollandse duinen, de Biesbosch en landgoederen zijn teken lokaal talrijk.",
    habitat:"Biesbosch, Hollandse duinen, Groene Hart, Hoeksche Waard.",
    ziekten:["lyme","rickettsia"],
    tip:"De Biesbosch is een onderschat tekengebied.", preventie:["Tekencheck na Biesbosch","Waterdichte kleding in riet","Tekentang meenemen","Direct verwijderen"],
    gemeentes:["Rotterdam","Den Haag","Dordrecht","Leiden","Delft","Zoetermeer","Gouda","Schiedam","Vlaardingen","Spijkenisse","Westland","Lansingerland","Alphen aan den Rijn","Katwijk","Leiden","Leidschendam-Voorburg","Pijnacker-Nootdorp"] },
  { id:"zeeland",      naam:"Zeeland",      risk:2, tbe:true,  tbeStatus:"detectie", tbeBron:"Eén bevestigde teek met TBE-virus (Wijburg et al. 2026) — een gebied dat eerder niet als risicogebied bekend stond.", lymePct:"~20% (RIVM); 29,3% (STZ, onderzoek 2007–2008)",
    samenvatting:"Teken in duinen en bosgebieden op de Zeeuwse eilanden. Meer dan 40% van beten in de tuin.",
    habitat:"Zeeuwse duinen, poldergebieden, bosgebieden op Walcheren, Schouwen.",
    ziekten:["lyme","rickettsia"],
    tip:"Ook in kustduinen zijn teken actief.", preventie:["Tekencheck na duinbezoek","Tuinhandschoenen","Teek zo snel mogelijk verwijderen","Huidverandering vastleggen en met een arts bespreken"],
    gemeentes:["Middelburg","Vlissingen","Goes","Terneuzen","Zierikzee","Hulst","Oostburg","Brouwershaven","Breskens"] },
  { id:"noordbrabant", naam:"Noord-Brabant", risk:2, tbe:true,  tbeStatus:"detectie", tbeBron:"Antistoffen/virus aangetoond in teken of reeën in centraal Noord-Brabant; geen besmetting bij mensen bekend die in deze provincie is opgelopen.", lymePct:"~20% (RIVM); 29,3% (STZ, onderzoek 2007–2008)",
    samenvatting:"De Peel, Brabantse Wal en Kempen zijn bekende tekengebieden.",
    habitat:"Brabantse Wal, De Peel, Kempen, Loonse en Drunense Duinen.",
    ziekten:["lyme","rickettsia","babesia"],
    tip:"Kinderen in hoge begroeiing lopen verhoogd risico.", preventie:["Kinderen dagelijks controleren","Hoog gras vermijden","Tekencheck bij douchen","Ouders ook controleren"],
    gemeentes:["Eindhoven","Tilburg","Breda","Den Bosch","Helmond","Bergen op Zoom","Oss","Roosendaal","Waalwijk","Veghel","Boxmeer","Cuijk","Uden","Sint-Michielsgestel","Bernheze","Landerd","Gemert-Bakel","Schijndel","Sint-Oedenrode","Vught","Haaren"] },
  { id:"limburg",      naam:"Limburg",      risk:2, tbe:true,  tbeStatus:"detectie", tbeBron:"Aanwijzingen in de GGD-regio via reeënserologie of teken (Wijburg et al. 2026); geen besmetting bij mensen bekend die in deze provincie is opgelopen.", lymePct:"~20% (RIVM); 29,3% (STZ, onderzoek 2007–2008)",
    samenvatting:"Zuid-Limburg met heuvelachtig boslandschap ideaal voor teken.",
    habitat:"Mergelland, Geuldal, heuvelachtig bosgebied van Zuid-Limburg.",
    ziekten:["lyme","rickettsia","babesia"],
    tip:"Check na wandelingen ook nek en haargrens.", preventie:["Extra aandacht nek en hoofdhuid","Wandelschoenen en lange sokken","Tekencheck thuis","Activiteiten bijhouden"],
    gemeentes:["Maastricht","Venlo","Roermond","Sittard-Geleen","Heerlen","Weert","Venray","Kerkrade","Brunssum","Landgraaf","Valkenburg aan de Geul","Vaals","Gulpen-Wittem","Meerssen","Stein","Beekdaelen"] },
];

// ─── MAANDEN ─────────────────────────────────────────────────────────────────
export const MAANDEN = [
  {k:"Jan",v:0,info:"Laagste activiteit; teken zijn nooit helemaal weg. Boven ongeveer 5–7 °C worden ze weer actiever."},
  {k:"Feb",v:1,info:"Lage activiteit. Op zachte dagen (boven ongeveer 5–7 °C) kunnen teken bijten."},
  {k:"Mrt",v:2,info:"Activiteit neemt toe. Bij warm weer stijgt het aantal tekenbeten snel."},
  {k:"Apr",v:3,info:"Hoge activiteit. Lente zorgt voor snel stijgende tekenpopulatie."},
  {k:"Mei",v:4,info:"PIEKSEIZOEN. Mei is samen met juni de gevaarlijkste maand."},
  {k:"Jun",v:4,info:"PIEKSEIZOEN. Juni is vaak een maand met hoge tekenactiviteit; het verloop verschilt per jaar en locatie."},
  {k:"Jul",v:3,info:"Hoge activiteit. Hitte vermindert licht, maar teken blijven actief in schaduw."},
  {k:"Aug",v:3,info:"Hoge activiteit. Tweede golf van nimfen. Vakantiegaande families lopen risico."},
  {k:"Sep",v:4,info:"TWEEDE PIEKSEIZOEN. September-piek door nieuwe generatie teken."},
  {k:"Okt",v:3,info:"Hoge activiteit begin maand. Afkoeling brengt geleidelijke daling."},
  {k:"Nov",v:1,info:"Lage activiteit. Teken worden traag maar kunnen nog steeds bijten."},
  {k:"Dec",v:0,info:"Lage activiteit, maar niet nul: op zachte winterdagen kunt u nog een teek oplopen."},
];
export const MAAND_COL = ["#E8F3FA","#A9DDF5","#4A9FD4","#2E7BA0","#1D4E63"];
export const curMnd = new Date().getMonth();

export type TbeSoort = "humaan" | "detectie";
export const TBE_SOORT_LBL: Record<TbeSoort, string> = {
  humaan: "Humane infectie vastgesteld / waarschijnlijke besmettingsplaats",
  detectie: "Virus of antistoffen aangetoond in teken of wild",
};

/** Drie klassen: de derde klasse is nadrukkelijk géén "vrij van TBE". */
export const TBE_STATUS_LBL: Record<TbeStatus, string> = {
  humaan: "Humane infectie vastgesteld / waarschijnlijke besmettingsplaats",
  detectie: "Virus of antistoffen aangetoond in teken of wild",
  geen: "Nog niet aangetoond — uitsluiting niet mogelijk",
};

export const TBE_LANDELIJK =
  "TBE is inmiddels in het merendeel van de Nederlandse provincies aangetroffen: in 18 van de 25 GGD-regio's zijn aanwijzingen voor aanwezigheid gevonden. De LCI-richtlijn gaat ervan uit dat het TBE-virus in teken en dierlijke reservoirs in heel Nederland kan voorkomen, in lokale haarden. Daarom is de kaart niet aan/uit maar driedelig: humane infectie vastgesteld, virus of antistoffen aangetoond in teken of wild, of nog niet aangetoond. Die laatste klasse betekent níét dat TBE is uitgesloten; ook in regio's zonder aantoning blijven bewustwording en paraatheid nodig (Wijburg et al. 2026).";

export const TBE_HAARDEN_ZIN =
  "TBE komt voor in kleine, lokale haarden en niet provinciedekkend: 'aangetoond' betekent dat het virus ergens in die provincie is gevonden, niet dat het overal in die provincie zit — en 'nog niet aangetoond' betekent niet dat er geen risico is. De twee kaartlagen meten bovendien verschillende dingen: de risicoklasse volgt uit Tekenradar-meldingen per 100.000 inwoners, gewogen met habitat, de TBE-markering uit aangetoonde virusaanwezigheid. Bekende gepubliceerde vindplaatsen en waarschijnlijke besmettingsplaatsen zijn onder meer " + TBE_LOCATIES_LIJST + ".";

export const WIJBURG_BRON_DOI = "https://doi.org/10.2807/1560-7917.ES.2026.31.20.2500767";

export const TBE_BRON =
  "Bronnen: LCI-richtlijn TBE (RIVM), Tekenradar.nl, Staat van Infectieziekten 2024 (RIVM) en " + WIJBURG_CITATIE + " Peildatum " + PEILDATUM + " (" + DATA_PEILDATUM + ").";

export const TBE_CIJFERS =
  "Sinds 1 maart 2025 is TBE meldingsplichtig (groep C). De gebruikte, nog niet onafhankelijk geverifieerde Osiris-selectie vermeldt 25 meldingen voor 2025, 22 voor 2024 en 8 voor 2023 — die laatste twee jaren nog op basis van vrijwillige melding. Verschillen in meldingsplicht en volledigheid beperken de vergelijkbaarheid tussen jaren. Meldingen omvatten zowel in Nederland als in het buitenland opgelopen infecties. Bron: RIVM, Overzicht meldingen infectieziekten (Osiris-AIZ, selectiedatum 10 maart 2026). Deze jaarreeks bevat het seizoen 2026 niet; een automatische broncontrole maakt dit geen actuele seizoenstelling. Volgens de LCI-richtlijn zijn tussen 2016 en juni 2024 23 patiënten gemeld die TBE in Nederland opliepen.";

/** Uitleg dat de ziektespecifieke schaal iets anders meet dan de provincieklasse. */
export const ZIEKTESCHAAL_UITLEG =
  "Let op: de twee kaartlagen meten verschillende dingen. De algemene provincieklasse volgt uit Tekenradar-meldingen per 100.000 inwoners, gewogen met habitat. Alleen TBE heeft brongebonden lokale aanwijzingen. Voor andere aandoeningen ontbreken vergelijkbare provinciale onderzoeksgegevens; landelijke steekproefpercentages onderbouwen geen provinciale rangorde. Alfa-gal is een allergie, geen verwekker. De lagen zijn geen individuele infectiekans.";

export const TEKENRADAR_2025 =
  "Tekenradar.nl ontving in 2025 10.795 doorgegeven tekenbeten: 41% meer dan in 2024 en het hoogste aantal sinds 2020. Meer meldingen betekent niet automatisch meer teken; het weerspiegelt ook meer aandacht voor tekenbeten.";

export const TBE_MELDINGEN: { cx: number; cy: number; naam: string; soort: TbeSoort; info: string; advies: string }[] = [
  {cx:388.7,cy:254.9,naam:"Sallandse Heuvelrug (Overijssel)",soort:"humaan",info:"Een in Nederland opgelopen humane TBE-infectie werd in Oost-Nederland beschreven in 2016. Ook TBE-virus aangetroffen in teken in Nationaal Park Sallandse Heuvelrug.",advies:"TBE-vaccinatie aanbevolen bij regelmatig bosbezoek. Raadpleeg huisarts of GGD."},
  {cx:257.6,cy:314.9,naam:"Utrechtse Heuvelrug (Utrecht)",soort:"humaan",info:"Bevestigde haard: humane TBE-besmettingen via tekenbeet gedocumenteerd.",advies:"TBE-vaccin beschikbaar via huisarts. Meldingsplichtig per 1 mrt 2025."},
  {cx:441.4,cy:264.9,naam:"Twente (Overijssel)",soort:"detectie",info:"TBE-virus aangetoond in teken in Twente.",advies:"Verhoogde waakzaamheid aanbevolen. Bespreek TBE-vaccinatie met huisarts."},
  {cx:404.6,cy:324.8,naam:"Achterhoek (Gelderland)",soort:"detectie",info:"TBE-antistoffen aangetoond bij reeën in dit gebied.",advies:"Overweeg TBE-vaccinatie bij regelmatig bosbezoek in de Achterhoek."},
  {cx:322.8,cy:300.0,naam:"Veluwe / Ermelo (Gelderland)",soort:"humaan",info:"TBE-virus en antistoffen bij wilde dieren aangetoond op en rond de Veluwe. In 2023 werd Ermelo genoemd als waarschijnlijke besmettingsplaats van een humane TBE-melding (Staat van Infectieziekten 2024).",advies:"Tekencheck na elk bosbezoek; bespreek vaccinatie bij frequent verblijf in natuurgebied."},
  {cx:80.9,cy:400.0,naam:"Zeeland",soort:"detectie",info:"TBE-virus bevestigd in een teek in Zeeland (Wijburg et al., Euro Surveill. 2026;31(20):2500767) — een gebied dat eerder niet als risicogebied bekend stond.",advies:"Geen humane meldingen bekend; blijf teken snel verwijderen en let op klachten na een beet."},
  {cx:226.8,cy:400.0,naam:"Noord-Brabant",soort:"detectie",info:"Antistoffen tegen TBE-virus aangetoond bij reeën in Noord-Brabant.",advies:"Tekencheck na bos- en heidebezoek; bij koortsklachten na een beet naar de huisarts."},
  {cx:329.1,cy:468.0,naam:"Limburg",soort:"detectie",info:"Antistoffen tegen TBE-virus aangetoond bij reeën in Limburg.",advies:"Tekencheck na bos- en heidebezoek; bij koortsklachten na een beet naar de huisarts."},
  {cx:258.4,cy:41.9,naam:"Terschelling (Friesland)",soort:"humaan",info:"Het RIVM schrijft dat in 2023 een aantal met TBE-virus geïnfecteerde personen Terschelling als bron had (Infectieziekten Bulletin, 6 maart 2025). Het bulletin noemt positieve teken in 2023 en 2024; het publiceert hier geen exact patiëntenaantal.",advies:"Tekencheck na duin- en bosbezoek op de Waddeneilanden; bespreek TBE-vaccinatie bij frequent verblijf."},
  {cx:296.0,cy:178.0,naam:"Noordoostelijke Flevopolder (Flevoland)",soort:"humaan",info:"Het noordoosten van de Flevopolder staat bij het RIVM vermeld als waarschijnlijke besmettingsplaats van een humane TBE-melding.",advies:"Tekencheck na bezoek aan polderbossen; bij koorts of neurologische klachten na een beet naar de huisarts."},
  {cx:186.0,cy:262.0,naam:"Zandvoort (Noord-Holland)",soort:"humaan",info:"In 2023 werd Zandvoort genoemd als waarschijnlijke besmettingsplaats van een zeker in Nederland opgelopen humane TBE-infectie, buiten de toen bekende risicogebieden (Staat van Infectieziekten 2024).",advies:"Tekencheck na duinbezoek in Kennemerland; bij koorts of neurologische klachten na een beet naar de huisarts."},
  {cx:400.0,cy:155.0,naam:"Drenthe",soort:"detectie",info:"TBE-virus dan wel antistoffen aangetoond in teken of wilde dieren in Drenthe; geen humane melding met Drenthe als waarschijnlijke besmettingsplaats bekend.",advies:"Tekencheck na bos- en heidebezoek; bij koorts of neurologische klachten na een beet naar de huisarts."},
];

// Criterium voor de TBE-markering op de kaart
export const TBE_CRITERIUM =
  "Criterium voor een TBE-markering: een gepubliceerde bevestigde vondst van het TBE-virus (of antistoffen) in teken of dieren, óf een humane melding met dit gebied als waarschijnlijke besmettingsplaats. Peildatum " + PEILDATUM + " (" + DATA_PEILDATUM + "). Let op: de klasse 'nog niet aangetoond' betekent níét dat er geen risico is — alleen dat er voor dat gebied (nog) geen bevestiging is gepubliceerd; uitsluiting is niet mogelijk.";


// Toelichting op de klassengrenzen (Help)
export const KLASSE_METHODE: string[] = [
  "Databron: openbare meldingen van Tekenradar.nl en RIVM over de periode 2019–2025, aangevuld met habitatgegevens (bos, heide, duin, struweel). De TBE-markering steunt daarnaast op de LCI-richtlijn TBE, de Staat van Infectieziekten 2024 en " + WIJBURG_CITATIE,
  "Rekeneenheid: gemelde tekenbeten per 100.000 inwoners, vermenigvuldigd met een habitatfactor voor bos, heide en duin — niet de absolute meldingsaantallen.",
  "Klassengrenzen: vijf gelijke stappen tussen de laagste en hoogste actuele provinciescore. Score = meldingen per 100.000 inwoners × habitatfactor. De numerieke grenzen en de berekening per provincie staan in de legenda en de provinciepanelen. Het zijn geen vaste drempels in ongewogen meldingen en geen medisch gevalideerde grenzen.",
  "Meldingsbias: meldingen zeggen ook iets over meldgedrag. Dichtbevolkte of toeristische gebieden melden meer, dunbevolkte gebieden minder. Daarom is Noord-Holland (duinen) hoger geklasseerd dan het aantal meldingen alleen zou aangeven.",
  "TBE-markeringen tonen gepubliceerde vindplaatsen. De algemene provincieklasse gebruikt een afzonderlijke gewogen score; een TBE-vindplaats bepaalt niet op zichzelf de klasse.",
  "Waarom u in de legenda alle klassen ziet, ook klassen zonder provincie: de legenda toont bewust de volledige schaal van Geen tot en met Zeer hoog. Een lege klasse betekent niet dat gegevens ontbreken, maar dat op dit moment geen enkele provincie in die klasse valt. De klasse Geen wordt wel gebruikt in de ziektelagen: CCHF staat in alle provincies op Geen omdat het virus hier nooit is aangetoond. Let op: de ziektelagen hebben een eigen, ziektespecifieke schaal en zijn niet één-op-één te vergelijken met de algemene provincieklasse op de kaart",
  "Een TBE-vondst bij dieren zegt niet hoeveel besmette teken er per bezoek zijn. Noord-Brabant en Limburg hebben een TBE-markering; hun algemene klasse volgt afzonderlijk uit meldingen per inwoner, habitatweging. De actuele klasse kan veranderen.",
  "De provincieklasse van Zuid-Holland beschrijft de gewogen provinciescore, niet de lokale duin- en Biesboschgebieden. Lokale natuurgebieden kunnen daarvan sterk afwijken; de bevolkingsverdeelde schatting van het aantal beten bepaalt deze klasse niet.",
];


export type SearchItem = { lbl: string; type: string; prov: Provincie; key: string; gemeente?: string };

const norm = (s: string) =>
  s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, "");

export const SEARCH_DB: SearchItem[] = [];
const gezien = new Set<string>();
PROVINCIES.forEach((p) => {
  SEARCH_DB.push({ lbl: p.naam, type: "Provincie", prov: p, key: norm(p.naam) });
});
PLAATSEN.forEach(([plaats, gemeente, provId]) => {
  const p = PROVINCIES.find((x) => x.id === provId);
  if (!p) return;
  const isGem = plaats === gemeente;
  const k = norm(plaats) + provId;
  if (gezien.has(k)) return;
  gezien.add(k);
  SEARCH_DB.push({ lbl: plaats, type: isGem ? "Gemeente" : "Plaats", prov: p, key: norm(plaats), gemeente });
});

export function zoekPlaatsen(q: string, limit = 10): SearchItem[] {
  const n = norm(q);
  if (!n) return [];
  const starts: SearchItem[] = [];
  const bevat: SearchItem[] = [];
  for (const i of SEARCH_DB) {
    if (i.key.startsWith(n)) starts.push(i);
    else if (i.key.includes(n)) bevat.push(i);
    if (starts.length >= limit * 3) break;
  }
  const rank = (i: SearchItem) => (i.type === "Provincie" ? 0 : i.type === "Gemeente" ? 1 : 2);
  return [...starts.sort((a, b) => rank(a) - rank(b) || a.lbl.length - b.lbl.length), ...bevat].slice(0, limit);
}

// ─── STEDELIJK GEBIED / OPENBAAR GROEN PER PROVINCIE ─────────────────────────
export const STEDELIJK_GEBIED: Record<string, string> = {
  groningen: "Stadspark en Noorderplantsoen (Groningen), Kardinge, volkstuincomplexen, sportvelden langs bosranden en begraafplaatsen.",
  friesland: "Rengerspark en Groene Ster (Leeuwarden), stadsbossen bij Drachten en Heerenveen, campings en recreatieplassen, en dorpsranden, duinparken en vakantieparken op Vlieland, Terschelling, Ameland en Schiermonnikoog.",
  drenthe: "Asserbos en Baggelhuizerplas (Assen), stadsranden van Emmen en Hoogeveen, vakantieparken, campings en mountainbikeroutes.",
  overijssel: "Het Engelse Werk en Park de Wezenlanden (Zwolle), Ledeboerpark en Het Rutbeek (Enschede), sportparken en recreatieplassen.",
  flevoland: "Stadsbossen van Almere (Beginbos, Kromslootpark), Wisentbos Dronten, Bosbad Zeewolde, sportvelden en fietsroutes langs bosranden.",
  gelderland: "Park Sonsbeek en Zypendaal (Arnhem), Goffertpark (Nijmegen), stadsranden Apeldoorn/Ede, campings en recreatieplassen op de Veluwe.",
  noordholland: "Amsterdamse Bos, Vondelpark-randen, Kennemerduinen bij Haarlem, Spaarnwoude, volkstuinen en sportparken langs groenstroken, plus dorpsranden, duinparken en campings op Texel.",
  utrecht: "Amelisweerd en Máximapark (Utrecht), Panbos en Bos Nieuw Wulven, sportvelden en scoutingterreinen aan de rand van de Heuvelrug.",
  zuidholland: "Kralingse Bos en Zuiderpark (Rotterdam), Haagse Bos en Zuiderpark (Den Haag), Bieslandse Bos, volkstuinen en sportparken.",
  zeeland: "Stadsranden van Middelburg en Vlissingen, duinparken bij badplaatsen, campings, recreatieterreinen en sportvelden bij bosranden.",
  noordbrabant: "Stadsbossen van Tilburg en Breda (Mastbos-rand), Bossche Broek, Genneper Parken (Eindhoven), campings en sportparken.",
  limburg: "Stadspark Maastricht en Jekerdal, Kaldenkerkerweg-bossen (Venlo), vakantieparken, sportvelden en wandelroutes in het heuvelland.",
};

// ─── CIJFERS STICHTING TEKENBEETZIEKTEN ──────────────────────────────────────
export const STZ_BRON = {
  naam: "Stichting Tekenbeetziekten",
  url: "https://www.tekenbeetziekten.nl/de-teek-en-tekenbeetziekten/andere-tekenbeetziekten/",
  label: "tekenbeetziekten.nl/andere-tekenbeetziekten",
};
export const STZ_CIJFERS: { label: string; waarde: string }[] = [
  { label: "Teken met Borrelia", waarde: "~1 op 3 (29,3%)" },
  { label: "Teken met één of meer verwekkers", waarde: "ongeveer de helft" },
  { label: "Tekenbeten per jaar", waarde: "1,5 miljoen" },
  { label: "Lymepatiënten per jaar", waarde: "meer dan 80.000" },
];
// ─── GEGEVENS LYMEVERENIGING ─────────────────────────────────────────────────
export const LV_BRON = {
  naam: "Lymevereniging",
  url: "https://www.lymevereniging.nl",
  label: "lymevereniging.nl",
};
export const LV_PUNTEN: string[] = [
  "Niet iedereen krijgt een rode ring (erythema migrans): bij een deel van de mensen blijft die vlek uit, terwijl er wel een infectie is.",
  "Klachten kunnen breed zijn: langdurige vermoeidheid, spier- en gewrichtspijn, zenuwklachten en concentratieproblemen.",
  "Een deel van de patiënten houdt na de standaardbehandeling langdurige klachten; ga bij aanhoudende klachten terug naar de huisarts.",
  "Noteer datum en plek van de beet en houd de plek en uw klachten enkele weken in de gaten — dat helpt bij de diagnose.",
  "De Lymevereniging biedt patiënteninformatie, lotgenotencontact en hulp bij vragen over diagnostiek en behandeling.",
];

export const STZ_VERWEKKERS: Record<string, string> = {
  lyme: "29,3%",
  rickettsia: "22,5% (bij mensen verwijderde teken, 2007–2008)",
  neoehrlichia: "5,4%",
  anaplasma: "1%",
  babesia: "3,5%",
  miyamotoi: "2,3%",
  tbe: "< 0,1%",
};

// ─── LCI-RICHTLIJNEN (RIVM) ──────────────────────────────────────────────────
export const LCI_BRON = {
  naam: "LCI-richtlijnen (RIVM)",
  url: "https://lci.rivm.nl/richtlijnen",
  label: "lci.rivm.nl/richtlijnen",
};
export const LCI_PUNTEN: string[] = [
  "De LCI-richtlijnen van het RIVM (Landelijke Coördinatie Infectieziektebestrijding) zijn de professionele standaard voor artsen en GGD'en bij infectieziekten, waaronder tekenbeetziekten.",
  "Per ziekte beschrijven ze de verwekker, incubatietijd, besmettingsweg, diagnostiek, behandeling, meldingsplicht en maatregelen voor de omgeving.",
  "Voor Lyme, tekenencefalitis (TBE) en tularemie bestaan aparte LCI-richtlijnen; TBE is sinds 1 maart 2025 meldingsplichtig.",
  "Voor tekenbeetziekten zonder eigen richtlijn (zoals babesiose, anaplasmose, neoehrlichiose, Borrelia miyamotoi, bartonellose en alfa-galsyndroom) geldt de algemene LCI-informatie over teken en tekenbeten.",
  "De richtlijnen zijn openbaar en worden periodiek herzien; deze website en web-app vat ze beknopt samen en verwijst naar de originele tekst.",
];

export type LciInfo = { omschrijving: string; url: string; label: string };
export const ZIEKTE_LCI: Record<string, LciInfo> = {
  lyme: { omschrijving: "LCI-richtlijn Lymeziekte: beschrijft diagnostiek (serologie in twee stappen), antibiotische behandeling per ziektebeeld en het beleid na een tekenbeet; profylaxe wordt in Nederland niet standaard geadviseerd.", url: "https://lci.rivm.nl/richtlijnen/lymeziekte", label: "lci.rivm.nl/richtlijnen/lymeziekte" },
  tbe: { omschrijving: "LCI-richtlijn Tekenencefalitis (TBE): beschrijft het tweefasige beloop, diagnostiek via serologie, het ontbreken van antivirale behandeling, vaccinatie-indicaties en de meldingsplicht sinds 1 maart 2025.", url: "https://lci.rivm.nl/richtlijnen/tekenencefalitis", label: "lci.rivm.nl/richtlijnen/tekenencefalitis" },
  rickettsia: { omschrijving: "Voor R. helvetica is de ziekterol onzeker. Deze algemene LCI-bronverwijzing is geen specifieke behandelrichtlijn voor deze bacterie.", url: "https://lci.rivm.nl/richtlijnen", label: "lci.rivm.nl/richtlijnen" },
  neoehrlichia: { omschrijving: "Neoehrlichiose kent geen eigen LCI-richtlijn; het RIVM verwijst naar de algemene LCI-informatie over tekenbeten en naar specialistische zorg bij een verzwakt afweersysteem.", url: "https://lci.rivm.nl/richtlijnen", label: "lci.rivm.nl/richtlijnen" },
  babesia: { omschrijving: "Voor babesiose bestaat geen aparte LCI-richtlijn; het RIVM beschrijft de ziekte in de algemene LCI-informatie over tekenbeetziekten, met aandacht voor mensen zonder milt.", url: "https://lci.rivm.nl/richtlijnen", label: "lci.rivm.nl/richtlijnen" },
  miyamotoi: { omschrijving: "Borrelia miyamotoi-ziekte heeft geen eigen LCI-richtlijn; het RIVM benoemt de verwekker in de algemene LCI-informatie over teken en in de richtlijn Lymeziekte.", url: "https://lci.rivm.nl/richtlijnen/lymeziekte", label: "lci.rivm.nl/richtlijnen/lymeziekte" },
  anaplasma: { omschrijving: "Anaplasmose kent geen aparte LCI-richtlijn; het RIVM rekent de ziekte tot de overige tekenoverdraagbare aandoeningen in de algemene LCI-informatie, met doxycycline als behandeling.", url: "https://lci.rivm.nl/richtlijnen", label: "lci.rivm.nl/richtlijnen" },
  bartonella: { omschrijving: "Bartonellose (kattenkrabziekte) wordt door het RIVM beschreven bij zoönosen; overdracht via een tekenbeet is in de LCI-informatie niet als bewezen route opgenomen.", url: "https://lci.rivm.nl/richtlijnen", label: "lci.rivm.nl/richtlijnen" },
  tularemie: { omschrijving: "LCI-richtlijn Tularemie: beschrijft de besmettingsroutes (hazen, knaagdieren, water, insecten- en tekenbeten), de klinische vormen, diagnostiek, antibiotische behandeling en de meldingsplicht (groep C).", url: "https://lci.rivm.nl/richtlijnen/tularemie", label: "lci.rivm.nl/richtlijnen/tularemie" },
  cchf: { omschrijving: "CCHF valt onder de LCI-aanpak voor virale hemorragische koortsen: strikte isolatie, melding groep A en beschermende maatregelen voor zorgverleners; in Nederland is het virus nog niet vastgesteld.", url: "https://lci.rivm.nl/richtlijnen", label: "lci.rivm.nl/richtlijnen" },
  alfagal: { omschrijving: "Het alfa-galsyndroom is een allergie en geen meldingsplichtige infectieziekte; er is daarom geen LCI-richtlijn. Het RIVM verwijst naar de algemene informatie over tekenbeten en naar allergiezorg.", url: "https://lci.rivm.nl/richtlijnen", label: "lci.rivm.nl/richtlijnen" },
};




// ─── ALGEMENE PREVENTIE (geen plaatsnamen of gebieden) ───────────────────────
export const PREVENTIE_ALGEMEEN: string[] = [
  "Draag bedekkende kleding: lange mouwen, lange broek in de sokken en dichte schoenen.",
  "Blijf op de paden en vermijd hoog gras, struikgewas en bladeren langs de rand.",
  "Gebruik een insectenwerend middel met DEET op onbedekte huid en op kleding.",
  "Kies lichte kleding, daarop ziet u teken sneller zitten.",
  "Doe na elk verblijf in het groen — ook in de eigen tuin — een tekencheck over het hele lichaam.",
  "Let vooral op warme, dunne huid: liezen, knieholtes, oksels, bilspleet, navel, nek en achter de oren.",
  "Controleer kinderen extra, met aandacht voor hoofd, hals en haargrens.",
  "Controleer ook huisdieren; zij kunnen teken mee naar binnen nemen.",
  "Verwijder een teek zo snel mogelijk met een tekentang of puntig pincet: recht en gelijkmatig eruit trekken.",
  "Ontsmet de plek na verwijdering en noteer de datum en plek op het lichaam.",
  "Houd de bijtplek 3 maanden in de gaten; bij een rode ring, uitslag of griepachtige klachten naar de huisarts.",
  "Houd de tuin kort gemaaid, verwijder bladafval en houd speelplekken vrij van hoge begroeiing.",
];

// ─── TEKENSOORTEN IN NEDERLAND (bron: Stichting Tekenbeetziekten) ────────────
export type Tekensoort = {
  id: string; naam: string; latijn: string; kleur: string;
  status: string;            // hoe vaak komt hij voor
  herkenning: string;
  voorkomen: string;         // waar in Nederland / welk leefgebied
  ziekten: string[];         // ids uit ZIEKTEN
  extraZiekten?: string[];   // ziekten die niet in de lijst staan
  tekst: string;
};

export const TEKENSOORTEN: Tekensoort[] = [
  {
    id: "ricinus", naam: "Schapenteek", latijn: "Ixodes ricinus", kleur: "#1D4E63",
    status: "Verreweg de meest voorkomende teek in Nederland (>90% van de tekenbeten bij mensen).",
    herkenning: "2–3 mm, plat en donkerbruin/zwart met roodbruin achterlijf bij het vrouwtje; volgezogen grijs-bruin bolletje. Larve 0,5 mm (6 poten), nimf ~1,5 mm.",
    voorkomen: "In heel Nederland: loof- en gemengd bos, bosranden, duinen, heide, ruig gras, parken, recreatieterreinen en in de eigen tuin. Teken zijn het hele jaar aanwezig en worden actiever boven ongeveer 5–7 °C.",
    ziekten: ["lyme", "tbe", "anaplasma", "babesia", "miyamotoi", "neoehrlichia", "rickettsia", "alfagal", "bartonella", "tularemie"],
    tekst: "De schapenteek is de belangrijkste overbrenger van tekenbeetziekten op de mens in Nederland. Nimfen veroorzaken de meeste besmettingen omdat ze klein zijn en vaak onopgemerkt blijven.",
  },
  {
    id: "hexagonus", naam: "Egelteek", latijn: "Ixodes hexagonus", kleur: "#2E7BA0",
    status: "Algemeen, maar bijt de mens veel minder vaak dan de schapenteek.",
    herkenning: "Lijkt sterk op de schapenteek, iets lichter van kleur met een hoekig (zeshoekig) schildje.",
    voorkomen: "Rond nesten en holen van egels, marterachtigen, vossen, honden en katten — dus ook in tuinen, schuurtjes en stadsgroen.",
    ziekten: ["lyme", "anaplasma", "babesia"],
    tekst: "Deze teek voedt zich vooral op egels en huisdieren en kan zo teken en ziekteverwekkers tot in de tuin brengen. Bij mensen bijt hij zelden, maar overdracht van Borrelia is mogelijk.",
  },
  {
    id: "dermacentor", naam: "Vlekkenteek (Dermacentor-teek)", latijn: "Dermacentor reticulatus", kleur: "#6B1A9C",
    status: "Minder vaak voorkomend, maar in opmars in Nederland.",
    herkenning: "Groter dan de schapenteek met een opvallend wit-bruin gemarmerd (gevlekt) rugschild.",
    voorkomen: "Vochtige graslanden, rivier- en beekdalen, natuurgebieden met ruige vegetatie; lokaal aangetroffen in onder meer Gelderland, Limburg, Noord-Brabant en Zuid-Holland. Ook actief in het koudere seizoen.",
    ziekten: ["tbe", "rickettsia", "babesia"],
    extraZiekten: ["Vlekkenkoorts (Rickettsia raoultii / R. slovaca)", "Hondenbabesiose"],
    tekst: "De vlekkenteek, ook wel Dermacentor-teek genoemd, kan het TBE-virus overdragen en draagt Rickettsia raoultii, die vlekkenkoorts kan veroorzaken. Hij is taai: hij overleeft maanden onder water en heeft meer dan 60 gastheersoorten. Waarnemingen kunt u melden op waarneming.nl.",
  },
  {
    id: "hyalomma", naam: "Reuzenteek (Hyalomma-teek)", latijn: "Hyalomma marginatum", kleur: "#2E7BA0",
    status: "Zeldzaam; wordt sinds enkele jaren vaker in Nederland gevonden, meestal op paarden en vee.",
    herkenning: "Twee keer zo groot als de schapenteek (vrouwtje 5–6,5 mm), gestreepte pootjes, roodbruin gegroefd lijf en goed ontwikkelde ogen.",
    voorkomen: "Meegebracht door trekvogels in het voorjaar, wilde hoefdieren of import van vee. Droge, warme open gebieden; vondsten onder andere in Drenthe.",
    ziekten: ["rickettsia", "cchf"],
    extraZiekten: ["Vlekkenkoorts (Rickettsia aeschlimannii)", "Piroplasmose bij paarden"],
    tekst: "De reuzenteek of Hyalomma-teek jaagt actief: hij ziet een gastheer van meters afstand en rent erop af. Hij is de belangrijkste overbrenger van het Krim-Congovirus; in Nederland is dat virus nog niet vastgesteld, maar Nederland geldt door klimaatverandering als potentieel vestigingsgebied.",
  },
  {
    id: "rhipicephalus", naam: "Bruine hondenteek", latijn: "Rhipicephalus sanguineus", kleur: "#4A9FD4",
    status: "Niet inheems; wordt meegenomen vanuit Zuid-Europa met honden die op vakantie zijn geweest.",
    herkenning: "Roodbruin, langwerpig lichaam met een puntige kop; kan zich binnenshuis vermeerderen.",
    voorkomen: "Vooral in en om woningen en kennels, na terugkeer van een hond uit Zuid-Europa.",
    ziekten: ["rickettsia", "babesia", "anaplasma"],
    extraZiekten: ["Ehrlichiose bij honden", "Mediterrane vlekkenkoorts"],
    tekst: "Deze teek is aangepast aan honden en kan als enige tekensoort een huis of kennel koloniseren. Controleer honden na een verblijf in het buitenland extra goed.",
  },
  {
    id: "argas", naam: "Duiventeek", latijn: "Argas reflexus", kleur: "#8A6A3A",
    status: "Zachte teek, lokaal rond duivenhokken en zolders met duiven.",
    herkenning: "Platte, leerachtige, lichtbruine teek zonder hard rugschild; zuigt slechts kort bloed.",
    voorkomen: "Duivenhokken, kerkzolders, spouwmuren en zolders in stedelijk gebied.",
    ziekten: [],
    extraZiekten: ["Heftige allergische (huid)reacties op de beet"],
    tekst: "De duiventeek bijt mensen alleen als de duiven verdwenen zijn. Ziekteoverdracht op de mens is in Nederland niet aangetoond; de klachten komen vooral door allergische reacties.",
  },
];

// welke tekensoorten spelen een rol per provincie
export const PROV_TEKEN: Record<string, string[]> = {
  groningen:["ricinus","hexagonus"], friesland:["ricinus","hexagonus"], drenthe:["ricinus","hexagonus","hyalomma"],
  overijssel:["ricinus","hexagonus","dermacentor"], flevoland:["ricinus","hexagonus"],
  gelderland:["ricinus","hexagonus","dermacentor"], utrecht:["ricinus","hexagonus"],
  noordholland:["ricinus","hexagonus"], zuidholland:["ricinus","hexagonus","dermacentor"],
  zeeland:["ricinus","hexagonus"], noordbrabant:["ricinus","hexagonus","dermacentor"],
  limburg:["ricinus","hexagonus","dermacentor"],
};

export const tekenVoorZiekte = (ziekteId: string) => TEKENSOORTEN.filter((t) => t.ziekten.includes(ziekteId));
export const tekenVoorProvincie = (provId: string) =>
  (PROV_TEKEN[provId] ?? ["ricinus"]).map((id) => TEKENSOORTEN.find((t) => t.id === id)).filter(Boolean) as Tekensoort[];
