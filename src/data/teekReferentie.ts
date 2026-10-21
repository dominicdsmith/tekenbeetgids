/* Referentiegegevens voor de AI-scan van de teek zelf.
   Gebaseerd op de tekensoorten die in Nederland mensen bijten
   (Stichting Tekenbeetziekten, RIVM en Centrum Monitoring Vectoren). */

export interface TeekReferentie {
  id: string;
  naam: string;
  naamEn: string;
  kenmerken: string;
  advies: string;
  adviesEn: string;
}

export interface TeekScanResultaat {
  soort: string;          // id uit TEEK_REFERENTIE
  titel: string;
  zekerheid: "laag" | "gemiddeld" | "hoog";
  kenmerken: string[];
  advies: string;
}

export const TEEK_REFERENTIE: TeekReferentie[] = [
  {
    id: "schapenteek", naam: "Schapenteek (Ixodes ricinus)", naamEn: "Sheep tick (Ixodes ricinus)",
    kenmerken: "Effen bruin tot zwart schild zonder tekening, 0,5–3 mm, achterlijf grijsbruin als hij volgezogen is.",
    advies: "De kenmerken vertonen overeenkomst met de gewone schapenteek, de soort achter de meeste tekenbeten in Nederland. Deze vergelijking is indicatief; leg de beet en eventuele veranderingen vast.",
    adviesEn: "The features resemble the common sheep tick, the species behind most tick bites in the Netherlands. This comparison is indicative; record the bite and any changes.",
  },
  {
    id: "egelteek", naam: "Egelteek (Ixodes hexagonus)", naamEn: "Hedgehog tick (Ixodes hexagonus)",
    kenmerken: "Sterk lijkend op de schapenteek, iets gedrongener, leeft in nesten van egels, vossen en marterachtigen.",
    advies: "De kenmerken vertonen overeenkomst met een egelteek. Deze soort leeft vaak bij nesten van egels, vossen en marterachtigen; noteer waar de teek is gevonden.",
    adviesEn: "The features resemble a hedgehog tick. This species often lives near nests of hedgehogs, foxes and mustelids; record where the tick was found.",
  },
  {
    id: "vlekkenteek", naam: "Vlekkenteek (Dermacentor reticulatus)", naamEn: "Ornate dog tick (Dermacentor reticulatus)",
    kenmerken: "Groter dan de schapenteek, opvallend gemarmerd wit-bruin schild.",
    advies: "De kenmerken vertonen overeenkomst met een vlekkenteek. De vergelijking is indicatief. U kunt de vondst melden bij de NVWA voor monitoring.",
    adviesEn: "The features resemble an ornate dog tick. The comparison is indicative. You can report the find to the NVWA for monitoring.",
  },
  {
    id: "reuzenteek", naam: "Reuzenteek (Hyalomma marginatum)", naamEn: "Giant tick (Hyalomma marginatum)",
    kenmerken: "Fors, 5 mm of groter, duidelijk gestreepte poten, lange monddelen.",
    advies: "De kenmerken vertonen overeenkomst met een reuzenteek. Deze soort is zeldzaam in Nederland. Plet het exemplaar niet; bewaar het en meld de vondst bij de NVWA voor identificatie en monitoring.",
    adviesEn: "The features resemble a giant Hyalomma tick. This species is rare in the Netherlands. Do not crush the specimen; keep it and report the find to the NVWA for identification and monitoring.",
  },
  {
    id: "hondenteek", naam: "Bruine hondenteek (Rhipicephalus sanguineus)", naamEn: "Brown dog tick (Rhipicephalus sanguineus)",
    kenmerken: "Roodbruin en slank, zeshoekig kopstuk, komt vooral mee met honden uit Zuid-Europa.",
    advies: "De kenmerken vertonen overeenkomst met een bruine hondenteek. Deze soort kan zich binnenshuis voortplanten; noteer de vindplaats en meld de vondst bij de NVWA voor monitoring.",
    adviesEn: "The features resemble a brown dog tick. This species can reproduce indoors; record where it was found and report the find to the NVWA for monitoring.",
  },
  {
    id: "duiventeek", naam: "Duiventeek (Argas reflexus)", naamEn: "Pigeon tick (Argas reflexus)",
    kenmerken: "Zachte teek: plat, rondovaal en leerachtig, zonder hard schild; leeft in duivennesten en op zolders.",
    advies: "De kenmerken vertonen overeenkomst met een duiventeek. Deze soort leeft vaak bij duivennesten; noteer de vindplaats en controleer de omgeving op een nest.",
    adviesEn: "The features resemble a pigeon tick. This species often lives near pigeon nests; record where it was found and check the surroundings for a nest.",
  },
  {
    id: "geen_teek", naam: "Geen duidelijke overeenkomst met een teek", naamEn: "No clear resemblance to a tick",
    kenmerken: "Zes poten en vleugels of antennes, of een duidelijk ander insect of spinnetje.",
    advies: "De zichtbare kenmerken komen niet duidelijk overeen met de referentiesoorten. Bewaar het exemplaar als u het later door een deskundige wilt laten identificeren.",
    adviesEn: "The visible features do not clearly match the reference species. Keep the specimen if you want an expert to identify it later.",
  },
  {
    id: "onbekend", naam: "Onduidelijke foto", naamEn: "Unclear photo",
    kenmerken: "Onscherp, te ver weg of te donker om de soort te herkennen.",
    advies: "De foto is te onduidelijk om de soort te herkennen. Maak een nieuwe, scherpe foto bij daglicht van ongeveer 10 cm afstand, het liefst met een muntstuk ernaast. Ga bij twijfel uit van de schapenteek.",
    adviesEn: "The photo is too unclear to identify the species. Take a new, sharp photo in daylight from about 10 cm away, ideally with a coin next to it. When in doubt, assume the sheep tick.",
  },
];
