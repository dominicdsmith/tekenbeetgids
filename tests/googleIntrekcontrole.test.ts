import { describe, expect, it } from "vitest";
import { controleerGoogleNaastOudeCode } from "../src/lib/google-intrekcontrole";
describe("Google schaduwcontrole", () => {
  it("verandert bij ontbrekende Google-toegang de oude beslissing niet", async () => {
    expect(await controleerGoogleNaastOudeCode(null, "TRK-2026-ABC123", "ABCDEFGHJK")).toBe("niet-beschikbaar");
  });
  it("maakt een Google-storing een beperkte status, geen nieuwe beslissing", async () => {
    expect(await controleerGoogleNaastOudeCode(async () => { throw new Error("synthetic"); }, "TRK-2026-ABC123", "ABCDEFGHJK")).toBe("niet-beschikbaar");
  });
  it("registreert een ontbrekende Google-code als afwijkend", async () => {
    expect(await controleerGoogleNaastOudeCode(async () => [], "TRK-2026-ABC123", "ABCDEFGHJK")).toBe("afwijkend");
  });
});