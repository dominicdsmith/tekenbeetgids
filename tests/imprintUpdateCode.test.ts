import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { LAATSTE_UPDATE_AUTO, PEILDATUM_AUTO } from "../src/data/appVersie";
import { APP_VERSIE, CHANGELOG } from "../src/data/changelog";

/**
 * DDMMYYYY is niet als tekst te vergelijken (de dag staat vooraan), dus zetten
 * we codes om naar JJJJMMDD zodat "ouder" en "jonger" kloppen.
 */
const dagSleutel = (code: string) => (/^\d{8}$/.test(code) ? `${code.slice(4)}${code.slice(2, 4)}${code.slice(0, 2)}` : "");

const maanden: Record<string, string> = {
  januari: "01", februari: "02", maart: "03", april: "04", mei: "05", juni: "06",
  juli: "07", augustus: "08", september: "09", oktober: "10", november: "11", december: "12",
};

/** "15 oktober 2026" → "20261015" */
function datumSleutel(datum: string) {
  const m = datum.match(/(\d{1,2})\s+([a-z]+)\s+(\d{4})/);
  if (!m) throw new Error(`onbekende datum: ${datum}`);
  return `${m[3]}${maandOf(m[2])}${m[1].padStart(2, "0")}`;
}
function maandOf(naam: string) {
  const maand = maanden[naam];
  if (!maand) throw new Error(`onbekende maand: ${naam}`);
  return maand;
}

describe("Imprint: updatecode dagdatumjaartal", () => {
  it("is een automatische code van acht cijfers (ddmmjjjj)", () => {
    expect(LAATSTE_UPDATE_AUTO).toMatch(/^\d{8}$/);
    const dag = Number(LAATSTE_UPDATE_AUTO.slice(0, 2));
    const maand = Number(LAATSTE_UPDATE_AUTO.slice(2, 4));
    const jaar = Number(LAATSTE_UPDATE_AUTO.slice(4));
    expect(dag).toBeGreaterThanOrEqual(1);
    expect(dag).toBeLessThanOrEqual(31);
    expect(maand).toBeGreaterThanOrEqual(1);
    expect(maand).toBeLessThanOrEqual(12);
    expect(jaar).toBeGreaterThanOrEqual(2026);
  });

  it("loopt niet achter op het logboek of de peildatum van de gegevens", () => {
    const changelog = readFileSync(join(process.cwd(), "src/data/changelog.ts"), "utf8");
    const codes = [...changelog.matchAll(/update:\s*"(\d{8})"/g)].map((m) => m[1]);
    const nieuwste = codes.sort((a, b) => dagSleutel(a).localeCompare(dagSleutel(b))).at(-1) ?? "";
    expect(nieuwste).not.toBe("");
    expect(dagSleutel(LAATSTE_UPDATE_AUTO) >= dagSleutel(nieuwste)).toBe(true);
    expect(dagSleutel(LAATSTE_UPDATE_AUTO) >= datumSleutel(PEILDATUM_AUTO)).toBe(true);
  });

  it("is de waarde die het Imprint voor de websiteversie toont", () => {
    const kaart = readFileSync(join(process.cwd(), "src/components/kaart/Tekenkaart.tsx"), "utf8");
    expect(kaart).toContain("Update ${LAATSTE_UPDATE_AUTO}");
    expect(kaart).not.toContain("Update ${LAATSTE_UPDATE}");
  });
});

describe("Imprint: versienummer loopt op per update", () => {
  it("is v plus het aantal updates in het logboek (start v27 na alle afgelopen updates)", () => {
    expect(APP_VERSIE).toBe(`v${CHANGELOG.length}`);
    expect(CHANGELOG.length).toBeGreaterThanOrEqual(27);
  });

  it("stijgt mee zodra er een nieuwe update bovenaan komt", () => {
    const oud = APP_VERSIE;
    const bron = readFileSync(join(process.cwd(), "src/data/changelog.ts"), "utf8");
    expect(bron).toContain("APP_VERSIE = `v${CHANGELOG.length}`");
    expect(bron).not.toContain("APP_VERSIE = `v${LAATSTE.versie}`");
    expect(oud).not.toBe("");
  });
});
