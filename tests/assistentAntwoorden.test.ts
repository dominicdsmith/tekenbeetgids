import { describe, expect, it } from "vitest";
import {
  ASSISTENT_ANTWOORDEN,
  gecontroleerdAntwoord,
  medischeVraag,
  medisch,
  onbekend,
} from "../src/lib/assistentAntwoorden";

describe("restricted information assistant", () => {
  it("answers guide questions from the same dataset as the map", () => {
    const antwoord = gecontroleerdAntwoord({ status: "answer", antwoordId: "pdf:0" }, "nl");
    expect(antwoord.onderwerp?.id).toBe("pdf");
    expect(antwoord.tekst).toBe(
      ASSISTENT_ANTWOORDEN.find((item) => item.id === "pdf:0")?.antwoord.nl,
    );
  });
  it("never displays model-authored prose or an unknown identifier", () => {
    expect(
      gecontroleerdAntwoord(
        { status: "answer", antwoordId: "take-antibiotics", text: "Take antibiotics" },
        "en",
      ),
    ).toEqual({ tekst: onbekend("en") });
  });
  it("declines medical answers regardless of a selected website answer", () => {
    expect(gecontroleerdAntwoord({ status: "medical", antwoordId: "gids:0" }, "nl")).toEqual({
      tekst: medisch("nl"),
    });
  });
  it.each([
    "Heb ik Lyme met deze rode vlek?",
    "Welke antibiotica moet ik nemen?",
    "Should I see a doctor?",
    "I have fever and pain",
  ])("blocks a medical question locally: %s", (vraag) => {
    expect(medischeVraag(vraag)).toBe(true);
  });
  it("allows a question about PDF navigation", () => {
    expect(medischeVraag("Waar vind ik mijn PDF?")).toBe(false);
  });
});
