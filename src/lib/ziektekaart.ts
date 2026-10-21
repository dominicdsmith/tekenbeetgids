import type { Provincie, Ziekte } from "../data/tekenData";

/** Alleen TBE heeft brongebonden lokale aanwezigheidsstatussen; landelijke
 * onderzoekspercentages zijn geen onderbouwing voor provinciale ranglijsten. */
export function ziekteKaartKlasse(ziekte: Ziekte, provincie?: Provincie): number {
  if (ziekte.id === "cchf") return 0;
  if (ziekte.id !== "tbe" || !provincie) return 1;
  return provincie.tbeStatus === "humaan" ? 3 : provincie.tbeStatus === "detectie" ? 2 : 1;
}

export function ziekteKaartLabel(ziekte: Ziekte, provincie?: Provincie): string {
  if (ziekte.id === "cchf") return "Niet aangetoond in Nederland";
  if (ziekte.id !== "tbe") return "Geen onderbouwde provinciale vergelijking";
  if (!provincie) return "Gepubliceerde lokale TBE-aanwijzingen";
  return provincie.tbeStatus === "humaan"
    ? "Humane infectie / waarschijnlijke besmettingsplaats"
    : provincie.tbeStatus === "detectie"
      ? "Virus of antistoffen in teken of wild"
      : "Nog niet aangetoond — uitsluiting niet mogelijk";
}