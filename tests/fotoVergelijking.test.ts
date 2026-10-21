import { describe, expect, it } from "bun:test";
import { valideerFotoVergelijking } from "../src/lib/fotoVergelijking";
import { BEETPLEK_REFERENTIE, BEETPLEK_ZONDER_KENMERK, maakBeetplekResultaat } from "../src/data/beetplekReferentie";

describe("reviewed photo outputs", () => {
  const ids = BEETPLEK_REFERENTIE.map((r) => r.id);
  it("rejects diagnostic prose even in a valid category", () => {
    const result = valideerFotoVergelijking({ categorie: "em", zekerheid: "hoog", kenmerken: ["You probably have Lyme"] }, ids, "onduidelijk", true);
    expect(result).toEqual({ categorie: "onduidelijk", zekerheid: "laag", kenmerken: [] });
  });
  it("rejects extra medical fields and malformed payloads", () => {
    for (const data of [null, "Lyme", { categorie: "em", zekerheid: "hoog", kenmerken: [], advies: "See your doctor today" }]) {
      expect(valideerFotoVergelijking(data, ids, "onduidelijk", false).categorie).toBe("onduidelijk");
    }
  });
  it("renders only reviewed bilingual visual labels", () => {
    const data = { categorie: "em", zekerheid: "laag", kenmerken: ["roodheid", "ringvorm"] };
    expect(valideerFotoVergelijking(data, ids, "onduidelijk", true).kenmerken).toEqual(["Visible redness", "Visible ring shape"]);
    expect(valideerFotoVergelijking(data, ids, "onduidelijk", false).kenmerken).toEqual(["Roodheid zichtbaar", "Ringvorm zichtbaar"]);
  });
  it("does not infer growth or a need for care from skin reference outputs", () => {
    for (const ref of BEETPLEK_REFERENTIE) {
      expect(ref.advies).not.toMatch(/huisarts|112|spoed|Lyme|erythema migrans/);
      expect(ref.vergelijking).not.toMatch(/huisarts|112|spoed|Lyme|erythema migrans|antibiot|diagnos/i);
      if (!BEETPLEK_ZONDER_KENMERK.includes(ref.id)) {
        expect(ref.vergelijking).toMatch(/Deze vergelijking stelt niet vast/);
        expect(ref.vergelijkingEn).toMatch(/This comparison does not establish/);
      }
      expect(ref.naam).not.toMatch(/groter wordende/i);
      expect(ref).not.toHaveProperty("urgentie");
    }
  });
  it("keeps poor quality, absent features and non-skin/unreadable outcomes separate in both languages", () => {
    for (const en of [false, true]) {
      const results = BEETPLEK_ZONDER_KENMERK.map((categorie) => maakBeetplekResultaat({ categorie, zekerheid: "laag", kenmerken: ["Visible redness"] }, en));
      expect(new Set(results.map((r) => r.weergave)).size).toBe(4);
      for (const result of results) {
        expect(result.kenmerken).toEqual([]);
        expect(result.vergelijking).not.toMatch(/overeenkomst|resemblance|huidreactie|skin reaction/i);
      }
      expect(results[0].vergelijking).toMatch(en ? /daylight/ : /daglicht/);
      expect(results[0].advies).not.toMatch(/huisarts|GP|nothing is wrong|niets aan de hand/);
      expect(results[1].advies).toMatch(en ? /does not mean that nothing is wrong/ : /niet dat er niets aan de hand is/);
      expect(results[1].advies).toMatch(en ? /your GP/ : /uw huisarts/);
    }
  });
  it("adds a non-reassuring safety sentence to described features without inventing prose", () => {
    for (const en of [false, true]) {
      const result = maakBeetplekResultaat({ categorie: "normaal", zekerheid: "hoog", kenmerken: [] }, en);
      expect(result.advies).toMatch(en ? /does not mean that nothing is wrong/ : /niet dat er niets aan de hand is/);
    }
    expect(() => maakBeetplekResultaat({ categorie: "ongeldige_uitkomst", zekerheid: "laag", kenmerken: [] }, false)).toThrow();
  });
});