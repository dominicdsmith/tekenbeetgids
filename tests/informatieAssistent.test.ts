import { describe, expect, it } from "vitest";
import { assistentLink, assistentOnderwerpen } from "../src/data/informatieAssistent";

describe("information assistant navigation", () => {
  it("offers map topics without guide-only topics", () => {
    expect(assistentOnderwerpen("kaart").map((item) => item.id)).toEqual([
      "kaart", "gebieden", "meldingen", "onderzoek", "privacy", "bronnen", "website", "cookies", "verklaringen", "ziekten",
    ]);
  });
  it("offers guide topics without map-only topics", () => {
    expect(assistentOnderwerpen("gids").map((item) => item.id)).toEqual([
      "gids", "foto", "pdf", "onderzoek", "privacy", "bronnen", "website", "cookies", "verklaringen", "ziekten",
    ]);
  });
  it("opens withdrawal on the map domain when the guide is the home page", () => {
    const item = assistentOnderwerpen("gids").find((topic) => topic.id === "onderzoek");
    if (!item) throw new Error("Missing research topic");
    expect(assistentLink(item, true)).toBe("https://tekenrisicokaart.nl/?tab=help#help-onderzoek");
    expect(assistentLink(item, false)).toBe("/?tab=help#help-onderzoek");
  });
});