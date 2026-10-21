import { z } from "zod";

/** Only allow reviewed visual labels, never model-authored prose in reports. */
export const VISUELE_KENMERKEN = {
  roodheid: ["Roodheid zichtbaar", "Visible redness"],
  rood_puntje: ["Rood puntje zichtbaar", "Visible red spot"],
  ringvorm: ["Ringvorm zichtbaar", "Visible ring shape"],
  donker_puntje: ["Donker puntje zichtbaar", "Visible dark spot"],
  korstje: ["Korstje zichtbaar", "Visible scab"],
  verkleuring: ["Verkleuring zichtbaar", "Visible discolouration"],
  blaar: ["Blaarvorm zichtbaar", "Visible blister shape"],
  onscherp: ["Beeld onscherp", "Image out of focus"],
  donker_beeld: ["Beeld donker", "Dark image"],
  schild: ["Schild zichtbaar", "Visible shield"],
  tekening: ["Tekening op het schild zichtbaar", "Visible shield markings"],
  gestreepte_poten: ["Gestreepte poten zichtbaar", "Visible striped legs"],
  monddelen: ["Monddelen zichtbaar", "Visible mouthparts"],
  antennes: ["Antennes of vleugels zichtbaar", "Visible antennae or wings"],
  onduidelijk: ["Details niet duidelijk zichtbaar", "Details not clearly visible"],
} as const;

export const kenmerkIds = Object.keys(VISUELE_KENMERKEN);
const schema = z.object({
  categorie: z.string(),
  zekerheid: z.enum(["laag", "gemiddeld", "hoog"]),
  kenmerken: z.array(z.string()).max(4),
}).strict();

export function valideerFotoVergelijking(data: unknown, ids: string[], fallback: string, en: boolean) {
  const parsed = schema.safeParse(data);
  if (!parsed.success || !ids.includes(parsed.data.categorie) ||
      parsed.data.kenmerken.some((id) => !kenmerkIds.includes(id))) {
    return { categorie: fallback, zekerheid: "laag" as const, kenmerken: [] as string[] };
  }
  return {
    categorie: parsed.data.categorie,
    zekerheid: parsed.data.zekerheid,
    kenmerken: parsed.data.kenmerken.map((id) => {
      const label = VISUELE_KENMERKEN[id as keyof typeof VISUELE_KENMERKEN];
      return label[en ? 1 : 0];
    }),
  };
}