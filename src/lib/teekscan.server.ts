import { TEEK_REFERENTIE, type TeekScanResultaat } from "@/data/teekReferentie";
import { vraagFotoVergelijking } from "./foto-ai.server";
import { valideerFotoVergelijking } from "./fotoVergelijking";
export type { TeekScanResultaat };

export async function scanTeek(afbeelding: string, taal: "nl" | "en"): Promise<TeekScanResultaat> {
  const en = taal === "en";
  const ids = TEEK_REFERENTIE.map((r) => r.id);
  const refs = TEEK_REFERENTIE.map((r) => `${r.id}: ${r.kenmerken}`).join("\n");
  const raw = await vraagFotoVergelijking(afbeelding, refs, ids, en);
  const result = valideerFotoVergelijking(raw, ids, "onbekend", en);
  const ref = TEEK_REFERENTIE.find((r) => r.id === result.categorie);
  if (!ref) throw new Error(en ? "Invalid comparison." : "Ongeldige vergelijking.");
  return { soort: ref.id, titel: en ? ref.naamEn : ref.naam,
    zekerheid: result.zekerheid, kenmerken: result.kenmerken, advies: en ? ref.adviesEn : ref.advies };
}
