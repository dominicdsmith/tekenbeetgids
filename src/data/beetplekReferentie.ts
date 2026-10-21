/* Referentiebeschrijvingen voor een informatieve visuele vergelijking.
   De vergelijking benoemt alleen zichtbare kenmerken en stelt geen diagnose. */
export interface BeetplekReferentie {
  id: string;
  naam: string;
  naamEn: string;
  /** Neutrale weergave van het zichtbare kenmerk, bijv. "Plaatselijke roodheid zichtbaar". */
  weergave: string;
  weergaveEn: string;
  /** Vaste, gecontroleerde vergelijkingstekst bij de scanuitslag. */
  vergelijking: string;
  vergelijkingEn: string;
  kenmerken: string;
  advies: string;
  adviesEn: string;
}

export const BEETPLEK_REFERENTIE: BeetplekReferentie[] = [
  {
    id: "normaal",
    naam: "Kleine, plaatselijke roodheid",
    naamEn: "Small, local redness",
    weergave: "Plaatselijke roodheid zichtbaar",
    weergaveEn: "Local redness visible",
    vergelijking:
      "De afbeelding vertoont zichtbare roodheid die overeenkomt met kenmerken in de geselecteerde referentiebeelden. Deze vergelijking stelt niet vast waardoor de roodheid is ontstaan en kan geen aandoening, urgentie of behandeling vaststellen. Uit één foto zijn groei, klachten en ernst niet af te leiden. Leg datum en veranderingen zelf vast.",
    vergelijkingEn:
      "The image shows visible redness that matches features in the selected reference descriptions. This comparison does not establish what caused the redness and cannot determine a condition, urgency or treatment. A single photo cannot establish growth, symptoms or severity. Record dates and changes yourself.",
    kenmerken:
      "Klein, plaatselijk rood puntje of vlekje zonder duidelijke ringvorm.",
    advies:
      "Dit is een visuele overeenkomst met een referentiebeschrijving, geen vaststelling van de oorzaak. Uit één foto zijn groei, klachten en ernst niet af te leiden. Leg datum en veranderingen zelf vast.",
    adviesEn:
      "This is a visual resemblance to a reference description, not a determination of the cause. A single photo cannot establish growth, symptoms or severity. Record dates and changes yourself.",
  },
  {
    id: "rood_puntje",
    naam: "Rood puntje",
    naamEn: "Red spot",
    weergave: "Rood puntje zichtbaar",
    weergaveEn: "Red spot visible",
    vergelijking:
      "De afbeelding vertoont een rood puntje dat overeenkomt met kenmerken in de geselecteerde referentiebeelden. Deze vergelijking stelt niet vast waardoor het rode puntje is ontstaan en kan geen aandoening, urgentie of behandeling vaststellen. Uit één foto zijn groei, klachten en ernst niet af te leiden. Leg datum en veranderingen zelf vast.",
    vergelijkingEn:
      "The image shows a red spot that matches features in the selected reference descriptions. This comparison does not establish what caused the red spot and cannot determine a condition, urgency or treatment. A single photo cannot establish growth, symptoms or severity. Record dates and changes yourself.",
    kenmerken:
      "Klein, afgerond rood puntje of stipje op de huid, zonder duidelijke ringvorm en zonder grotere vlek eromheen.",
    advies:
      "Dit is een visuele overeenkomst met een referentiebeschrijving, geen vaststelling van de oorzaak. Uit één foto zijn groei, klachten en ernst niet af te leiden. Leg datum en veranderingen zelf vast.",
    adviesEn:
      "This is a visual resemblance to a reference description, not a determination of the cause. A single photo cannot establish growth, symptoms or severity. Record dates and changes yourself.",
  },
  {
    id: "em",
    naam: "Rode vlek of ring",
    naamEn: "Red patch or ring",
    weergave: "Rode vlek of ring zichtbaar",
    weergaveEn: "Red patch or ring visible",
    vergelijking:
      "De afbeelding vertoont een rode vlek of ring die overeenkomt met kenmerken in de geselecteerde referentiebeelden. Deze vergelijking stelt niet vast waardoor de rode vlek of ring is ontstaan en kan geen aandoening, urgentie of behandeling vaststellen. Uit één foto zijn groei, klachten en ernst niet af te leiden. Leg datum en veranderingen zelf vast.",
    vergelijkingEn:
      "The image shows a red patch or ring that matches features in the selected reference descriptions. This comparison does not establish what caused the red patch or ring and cannot determine a condition, urgency or treatment. A single photo cannot establish growth, symptoms or severity. Record dates and changes yourself.",
    kenmerken:
      "Rode vlek of ring, soms met een lichter midden en een duidelijke rand. Groei of afmetingen zijn niet betrouwbaar uit één foto af te leiden.",
    advies:
      "Dit is een visuele overeenkomst met een referentiebeschrijving, geen vaststelling van de oorzaak. Uit één foto zijn groei, klachten en ernst niet af te leiden. Leg datum en veranderingen zelf vast.",
    adviesEn:
      "This is a visual resemblance to a reference description, not a determination of the cause. A single photo cannot establish growth, symptoms or severity. Record dates and changes yourself.",
  },
  {
    id: "infectie",
    naam: "Roodheid rond het wondje",
    naamEn: "Redness around the wound",
    weergave: "Roodheid rond het wondje zichtbaar",
    weergaveEn: "Redness around the wound visible",
    vergelijking:
      "De afbeelding vertoont roodheid rond het wondje die overeenkomt met kenmerken in de geselecteerde referentiebeelden. Deze vergelijking stelt niet vast waardoor de roodheid is ontstaan en kan geen aandoening, urgentie of behandeling vaststellen. Uit één foto zijn groei, klachten en ernst niet af te leiden. Leg datum en veranderingen zelf vast.",
    vergelijkingEn:
      "The image shows redness around the wound that matches features in the selected reference descriptions. This comparison does not establish what caused the redness and cannot determine a condition, urgency or treatment. A single photo cannot establish growth, symptoms or severity. Record dates and changes yourself.",
    kenmerken:
      "Roodheid rond een wondje, soms met geel/witte verkleuring, een korstje of rode strepen.",
    advies:
      "Dit is een visuele overeenkomst met een referentiebeschrijving, geen vaststelling van de oorzaak. Uit één foto zijn groei, klachten en ernst niet af te leiden. Leg datum en veranderingen zelf vast.",
    adviesEn:
      "This is a visual resemblance to a reference description, not a determination of the cause. A single photo cannot establish growth, symptoms or severity. Record dates and changes yourself.",
  },
  {
    id: "monddelen",
    naam: "Donker puntje in de beetplek",
    naamEn: "Dark spot in the bite site",
    weergave: "Donker puntje in de beetplek zichtbaar",
    weergaveEn: "Dark spot in the bite site visible",
    vergelijking:
      "De afbeelding vertoont een donker puntje in de beetplek dat overeenkomt met kenmerken in de geselecteerde referentiebeelden. Deze vergelijking stelt niet vast wat het donkere puntje is en kan geen aandoening, urgentie of behandeling vaststellen. Uit één foto zijn groei, klachten en ernst niet af te leiden. Leg datum en veranderingen zelf vast.",
    vergelijkingEn:
      "The image shows a dark spot in the bite site that matches features in the selected reference descriptions. This comparison does not establish what the dark spot is and cannot determine a condition, urgency or treatment. A single photo cannot establish growth, symptoms or severity. Record dates and changes yourself.",
    kenmerken:
      "Klein donker of zwart puntje midden in de beetplek, als een splintertje in de huid, met een klein rood randje eromheen.",
    advies:
      "Dit is een visuele overeenkomst met een referentiebeschrijving, geen vaststelling van de oorzaak. Uit één foto zijn groei, klachten en ernst niet af te leiden. Leg datum en veranderingen zelf vast.",
    adviesEn:
      "This is a visual resemblance to a reference description, not a determination of the cause. A single photo cannot establish growth, symptoms or severity. Record dates and changes yourself.",
  },
  {
    id: "eschar",
    naam: "Donker korstje met rode rand",
    naamEn: "Dark scab with a red edge",
    weergave: "Donker korstje met rode rand zichtbaar",
    weergaveEn: "Dark scab with a red edge visible",
    vergelijking:
      "De afbeelding vertoont een donker korstje met rode rand dat overeenkomt met kenmerken in de geselecteerde referentiebeelden. Deze vergelijking stelt niet vast waardoor het korstje is ontstaan en kan geen aandoening, urgentie of behandeling vaststellen. Uit één foto zijn groei, klachten en ernst niet af te leiden. Leg datum en veranderingen zelf vast.",
    vergelijkingEn:
      "The image shows a dark scab with a red edge that matches features in the selected reference descriptions. This comparison does not establish what caused the scab and cannot determine a condition, urgency or treatment. A single photo cannot establish growth, symptoms or severity. Record dates and changes yourself.",
    kenmerken:
      "Zwart of donkerbruin korstje met een rode rand eromheen.",
    advies:
      "Dit is een visuele overeenkomst met een referentiebeschrijving, geen vaststelling van de oorzaak. Uit één foto zijn groei, klachten en ernst niet af te leiden. Leg datum en veranderingen zelf vast.",
    adviesEn:
      "This is a visual resemblance to a reference description, not a determination of the cause. A single photo cannot establish growth, symptoms or severity. Record dates and changes yourself.",
  },
  {
    id: "uitgebreid",
    naam: "Uitgebreide huidverandering",
    naamEn: "Extensive skin change",
    weergave: "Uitgebreide huidverandering zichtbaar",
    weergaveEn: "Extensive skin change visible",
    vergelijking:
      "De afbeelding vertoont uitgebreide huidveranderingen die overeenkomen met kenmerken in de geselecteerde referentiebeelden. Deze vergelijking stelt niet vast waardoor de huidverandering is ontstaan en kan geen aandoening, urgentie of behandeling vaststellen. Uit één foto zijn groei, klachten en ernst niet af te leiden. Leg datum en veranderingen zelf vast.",
    vergelijkingEn:
      "The image shows extensive skin changes that match features in the selected reference descriptions. This comparison does not establish what caused the skin change and cannot determine a condition, urgency or treatment. A single photo cannot establish growth, symptoms or severity. Record dates and changes yourself.",
    kenmerken:
      "Roodheid over een groter zichtbaar gebied, blaarvormen, meerdere vlekken of blauwpaarse verkleuring.",
    advies:
      "Dit is een visuele overeenkomst met een referentiebeschrijving, geen vaststelling van de oorzaak. Uit één foto zijn groei, klachten en ernst niet af te leiden. Leg datum en veranderingen zelf vast.",
    adviesEn:
      "This is a visual resemblance to a reference description, not a determination of the cause. A single photo cannot establish growth, symptoms or severity. Record dates and changes yourself.",
  },
  {
    id: "onduidelijk",
    naam: "Foto niet bruikbaar",
    naamEn: "Photo not usable",
    weergave: "Foto niet bruikbaar",
    weergaveEn: "Photo not usable",
    vergelijking:
      "Deze foto is niet scherp of helder genoeg. Maak een nieuwe foto in daglicht.",
    vergelijkingEn:
      "This photo is not sharp or clear enough. Take a new photo in daylight.",
    kenmerken:
      "Huidfoto herkenbaar, maar onscherp, te donker of te ver weg om kenmerken te beschrijven. Niet gebruiken voor een scherpe huidfoto zonder passend kenmerk.",
    advies:
      "Deze foto is niet scherp of helder genoeg. Maak een nieuwe foto in daglicht.",
    adviesEn:
      "This photo is not sharp or clear enough. Take a new photo in daylight.",
  },
  {
    id: "geen_kenmerk",
    naam: "Geen kenmerk beschreven", naamEn: "No feature described",
    weergave: "Geen kenmerk beschreven", weergaveEn: "No feature described",
    vergelijking: "Er is geen kenmerk beschreven. Dat betekent niet dat er niets aan de hand is.",
    vergelijkingEn: "No feature has been described. This does not mean that nothing is wrong.",
    kenmerken: "Scherpe, voldoende heldere huidfoto zonder zichtbaar kenmerk dat met de aangeboden referentiebeschrijvingen overeenkomt. Dit stelt niet vast dat de huid gezond is.",
    advies: "Er is geen kenmerk beschreven. Dat betekent niet dat er niets aan de hand is.",
    adviesEn: "No feature has been described. This does not mean that nothing is wrong.",
  },
  {
    id: "geen_huidfoto",
    naam: "Geen huidfoto herkend", naamEn: "No skin photo recognised",
    weergave: "Geen huidfoto herkend", weergaveEn: "No skin photo recognised",
    vergelijking: "Op deze afbeelding is geen huidfoto herkend. Kies een foto van de huid die u wilt vastleggen.",
    vergelijkingEn: "No skin photo was recognised in this image. Choose a photo of the skin you wish to record.",
    kenmerken: "Leesbare afbeelding van iets anders dan huid, zoals een object, landschap, document of teek zonder huid.",
    advies: "Op deze afbeelding is geen huidfoto herkend. Kies een foto van de huid die u wilt vastleggen.",
    adviesEn: "No skin photo was recognised in this image. Choose a photo of the skin you wish to record.",
  },
  {
    id: "onleesbaar",
    naam: "Afbeelding onleesbaar", naamEn: "Image unreadable",
    weergave: "Afbeelding onleesbaar", weergaveEn: "Image unreadable",
    vergelijking: "Deze afbeelding kon niet worden gelezen. Kies een andere foto.",
    vergelijkingEn: "This image could not be read. Choose another photo.",
    kenmerken: "Afbeelding niet leesbaar of inhoud niet herkenbaar; niet vast te stellen of huid is afgebeeld. Geen uitspraak over huidkenmerken.",
    advies: "Deze afbeelding kon niet worden gelezen. Kies een andere foto.",
    adviesEn: "This image could not be read. Choose another photo.",
  },
];

export const BEETPLEK_ZONDER_KENMERK = ["onduidelijk", "geen_kenmerk", "geen_huidfoto", "onleesbaar"];
export const SCAN_VEILIGHEIDSZIN = [
  "Dit betekent niet dat er niets aan de hand is.",
  "This does not mean that nothing is wrong.",
] as const;
export const SCAN_HUISARTSBOODSCHAP = [
  "Algemene informatie, los van de foto: bespreek aanhoudende zorgen, koorts of een groter wordende rode huidafwijking met uw huisarts. Bij een acute, ernstige of levensbedreigende situatie belt u 112.",
  "General information, independent of the photo: discuss persistent concerns, fever or a growing red skin change with your GP. In an acute, serious or life-threatening situation, call 112.",
] as const;

/** One reviewed template for screen and reports; no model-authored prose. */
export function maakBeetplekResultaat(result: { categorie: string; zekerheid: "laag" | "gemiddeld" | "hoog"; kenmerken: string[] }, en: boolean): ScanResultaat {
  const ref = BEETPLEK_REFERENTIE.find((r) => r.id === result.categorie);
  if (!ref) throw new Error(en ? "Invalid comparison." : "Ongeldige vergelijking.");
  const geenKenmerk = BEETPLEK_ZONDER_KENMERK.includes(ref.id);
  const veiligheidszin = SCAN_VEILIGHEIDSZIN[en ? 1 : 0];
  const vergelijking = en ? ref.vergelijkingEn : ref.vergelijking;
  const advies = geenKenmerk ? vergelijking : `${en ? ref.adviesEn : ref.advies} ${veiligheidszin}`;
  return {
    categorie: ref.id, titel: en ? ref.naamEn : ref.naam,
    weergave: en ? ref.weergaveEn : ref.weergave,
    vergelijking, zekerheid: result.zekerheid,
    kenmerken: geenKenmerk ? [] : result.kenmerken,
    advies: ref.id === "geen_kenmerk" ? `${advies} ${SCAN_HUISARTSBOODSCHAP[en ? 1 : 0]}` : advies,
  };
}

export interface ScanResultaat {
  categorie: string;      // id uit BEETPLEK_REFERENTIE
  titel: string;
  weergave: string;
  vergelijking: string;
  zekerheid: "laag" | "gemiddeld" | "hoog";
  kenmerken: string[];
  advies: string;
}
