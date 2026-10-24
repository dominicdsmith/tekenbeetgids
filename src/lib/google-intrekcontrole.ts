import { verifieerGoogleCode } from "./google-intrekcodes";
import type { SpiegelTransport } from "./firebase-spiegel-transactie";

/** Shadow verification never changes the live legacy decision or stores submitted codes. */
export async function controleerGoogleNaastOudeCode(transport: SpiegelTransport | null, nummer: string, code: string) {
  if (!transport) return "niet-beschikbaar" as const;
  try { return await verifieerGoogleCode(transport, nummer, code) ? "gelijk" as const : "afwijkend" as const; }
  catch { return "niet-beschikbaar" as const; }
}