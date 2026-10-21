import { describe, expect, it } from "vitest";
import { zuiverTekstVoorPdf } from "../src/lib/rapportPdf";
import { VERTALINGEN } from "../src/data/vertalingen";

describe("zuiverTekstVoorPdf", () => {
  it("vervangt tekens die het pdf-lettertype niet kent door een leesbare benadering", () => {
    expect(zuiverTekstVoorPdf("pijl → rechts")).toBe("pijl -> rechts");
    expect(zuiverTekstVoorPdf("vinkje ✓ klaar")).toBe("vinkje v klaar");
    expect(zuiverTekstVoorPdf("waarschuwing ⚠ let op")).toBe("waarschuwing ! let op");
  });

  it("behoudt Nederlandse en Engelse leestekens binnen WinAnsi", () => {
    expect(zuiverTekstVoorPdf("één ä two • drie — vier € vijf")).toBe("één ä two • drie — vier € vijf");
  });
});

describe("AI-beperking en toegankelijkheid in de vertalingen", () => {
  it("vertaalt de vaste zin over de grens van de AI-fotoscan in het rapport", () => {
    const nl = "De AI-fotoscans in dit overzicht vergelijken uitsluitend zichtbare kenmerken en kunnen de ziekte van Lyme of een andere aandoening niet vaststellen of uitsluiten.";
    expect(VERTALINGEN[nl]).toContain("can neither establish nor rule out Lyme disease");
  });

  it("beschrijft in de toegankelijkheidsverklaring dat pdf's echte tekst bevatten maar nog geen PDF/UA-tags", () => {
    const nl = Object.keys(VERTALINGEN).find((k) => k.startsWith("Automatisch gemaakte PDF- en printoverzichten"));
    expect(nl).toBeTruthy();
    expect(nl).toContain("echte, selecteerbare tekst");
    expect(nl).toContain("PDF/UA");
    expect(VERTALINGEN[nl!]).toContain("real, selectable text");
  });
});
