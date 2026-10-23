import { describe, expect, it } from "bun:test";
import { bevestigdeScan } from "../src/lib/scanOvername";

describe("separate confirmation before questionnaire adoption", () => {
  it("does not adopt a tick species until confirmation", () => {
    const scan = { soort: "duiventeek" };
    expect(bevestigdeScan(scan, false)).toBeNull();
    expect(bevestigdeScan(scan, true)).toEqual({ soort: "duiventeek" });
  });
  it("does not adopt a skin observation until confirmation", () => {
    const scan = { categorie: "em" };
    expect(bevestigdeScan(scan, false)).toBeNull();
    expect(bevestigdeScan(scan, true)).toEqual({ categorie: "em" });
  });
});