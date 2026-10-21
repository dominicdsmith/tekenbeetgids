import { describe, expect, it } from "vitest";
import { ALFA_GAL_BEHANDELINGEN, alfaGalBehandelingNaam, alfaGalBehandelingStappen } from "../src/data/alfaGalBehandeling";

describe("alpha-gal treatment recording", () => {
  it("offers the three requested measures with bilingual report labels", () => {
    expect(ALFA_GAL_BEHANDELINGEN.map((item) => item.nl)).toEqual(["Dieet", "Antihistaminica", "Adrenaline-auto-injector"]);
    expect(alfaGalBehandelingNaam("antihistaminica", true)).toBe("Antihistamines");
  });
  it("excludes antibiotics and TBE medicines from the alpha-gal branch", () => {
    expect(alfaGalBehandelingStappen(0, "ja")).toEqual(["testbehandeld_0__alfagal", "testmiddelen_0__alfagal"]);
    expect(alfaGalBehandelingStappen(0, "nee")).toEqual(["testbehandeld_0__alfagal"]);
  });
});