import teek3080 from "@/assets/teek-3080.jpg.asset.json";
import teek3081 from "@/assets/teek-3081.jpg.asset.json";
import teek3083 from "@/assets/teek-3083.jpg.asset.json";
import teek3084 from "@/assets/teek-3084.jpg.asset.json";
import teek3085 from "@/assets/teek-3085.jpg.asset.json";

// Foto's van de officiële bronnen: Stichting Tekenbeetziekten en RIVM (met bronvermelding)
export type TeekFoto = { src: string; bijschrift: string; bron: string; bronUrl: string };
export const TEEK_FOTO: Record<string, TeekFoto[]> = {
  ricinus: [{
    src: "https://www.tekenbeetziekten.nl/site/assets/files/1096/ixodes_ricinus_schapenteek_op_grasspriet.jpg",
    bijschrift: "De schapenteek (Ixodes ricinus) op een grasspriet. Foto: Hans Smid.",
    bron: "Stichting Tekenbeetziekten — tekenbeetziekten.nl",
    bronUrl: "https://www.tekenbeetziekten.nl/de-teek-en-tekenbeetziekten/de-teek/",
  }],
  dermacentor: [{
    src: "https://www.tekenbeetziekten.nl/site/assets/files/1096/dermacentor_reticulatus_mannetje_vrouwtje.jpg",
    bijschrift: "Vlekkenteek (Dermacentor reticulatus), mannetje en vrouwtje.",
    bron: "Stichting Tekenbeetziekten — tekenbeetziekten.nl",
    bronUrl: "https://www.tekenbeetziekten.nl/de-teek-en-tekenbeetziekten/de-teek/",
  }],
  hyalomma: [{
    src: "https://www.rivm.nl/sites/default/files/styles/large/public/2019-07/Hyalomma%20vs%20schapenteek.jpg?itok=hKIjTgaj",
    bijschrift: "Hyalomma-teek (vrouwtje en mannetje) naast de schapenteek ter vergelijking.",
    bron: "RIVM — rivm.nl",
    bronUrl: "https://www.rivm.nl/tekenbeten/soorten-teken",
  }],
  hexagonus: [
    { src: teek3081.url, bijschrift: "Egelteek (Ixodes hexagonus), volwassen vrouwtje.", bron: "Waarneming.nl", bronUrl: "https://www.waarneming.nl/" },
    { src: teek3080.url, bijschrift: "Egelteek (Ixodes hexagonus), detailopname onderzijde.", bron: "Waarneming.nl", bronUrl: "https://www.waarneming.nl/" },
  ],
  rhipicephalus: [
    { src: teek3083.url, bijschrift: "Bruine hondenteek (Rhipicephalus sanguineus), twee exemplaren.", bron: "Picture Insect", bronUrl: "https://pictureinsect.com/" },
  ],
  argas: [
    { src: teek3084.url, bijschrift: "Duiventeek (Argas reflexus), bovenaanzicht.", bron: "iNaturalist", bronUrl: "https://www.inaturalist.org/" },
    { src: teek3085.url, bijschrift: "Duiventeek (Argas reflexus), detailopname.", bron: "iNaturalist", bronUrl: "https://www.inaturalist.org/" },
  ],
};
