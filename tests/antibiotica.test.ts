import { describe, expect, it } from "vitest";
import { ANTIBIOTICA, antibioticumNaam } from "../src/data/antibiotica";

describe("Prescription recording", () => {
  it("keeps the requested five entries first without losing legacy identifiers", () => {
    expect(ANTIBIOTICA.slice(0, 5).map((m) => m.id)).toEqual([
      "doxycycline", "amoxicilline", "azitromycine", "cefuroxim", "ceftriaxon",
    ]);
    expect(new Set(ANTIBIOTICA.map((m) => m.id)).size).toBe(ANTIBIOTICA.length);
    expect(antibioticumNaam("atovaquon", false)).toContain("Atovaquon");
  });
  it("uses English medicine names in English reports", () => {
    expect(antibioticumNaam("amoxicilline", true)).toBe("Amoxicillin");
    expect(antibioticumNaam("ceftriaxon", true)).toBe("Ceftriaxone");
    expect(antibioticumNaam("oude-code", true)).toBe("oude-code");
  });
});