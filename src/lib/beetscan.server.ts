import { BEETPLEK_REFERENTIE, maakBeetplekResultaat, type ScanResultaat } from "@/data/beetplekReferentie";
import { vraagFotoVergelijking } from "./foto-ai.server";
import { valideerFotoVergelijking } from "./fotoVergelijking";
export type { ScanResultaat };

export async function scanBeetplek(afbeelding: string, taal: "nl" | "en"): Promise<ScanResultaat> {
  const en = taal === "en";
  const ids = BEETPLEK_REFERENTIE.map((r) => r.id);
  const refs = BEETPLEK_REFERENTIE.map((r) => `${r.id}: ${r.kenmerken}`).join("\n");
  const raw = await vraagFotoVergelijking(afbeelding, refs, ids, en);
  const result = valideerFotoVergelijking(raw, ids, "ongeldige_uitkomst", en);
  return maakBeetplekResultaat(result, en);
}
