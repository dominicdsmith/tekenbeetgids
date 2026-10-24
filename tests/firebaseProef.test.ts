import { describe, expect, test } from "bun:test";
import { controleerProefBeheer, legeProef, PROEF_DOCUMENT, proefInput, verwerkProef } from "../src/lib/firebase-proef";
const a = "00000000-0000-4000-8000-000000000001";
const b = "00000000-0000-4000-8000-000000000002";
const c = "00000000-0000-4000-8000-000000000003";
const tijd = "2026-10-23T21:30:00Z";
describe("Firebase proefisolatie", () => {
  test("alleen proefdatabase en geen instelbaar productiepad", () => {
    expect(PROEF_DOCUMENT).toBe("projects/tekenbeetgids-vertex-ai/databases/tekenbeetgids-proef/documents/proef_runs/werkruimte");
    expect(() => proefInput.parse({ actie: "deelname", verzoek: a, database: "productie" })).toThrow();
  });
  test("geen vrije persoonsgegevens of foto's", () => {
    expect(() => proefInput.parse({ actie: "klacht", verzoek: a, bericht: "persoonlijke inhoud" })).toThrow();
    expect(() => proefInput.parse({ actie: "registratie", verzoek: a, foto: "image" })).toThrow();
  });
  test("beheer vereist bevestigde rol zonder controlefout", () => {
    expect(() => controleerProefBeheer(false, null)).toThrow();
    expect(() => controleerProefBeheer(true, new Error())).toThrow();
    expect(() => controleerProefBeheer(true, null)).not.toThrow();
  });
  test("registratie vereist bestaande proefdeelname", () => {
    expect(() => verwerkProef(legeProef(), { actie: "registratie", verzoek: b, nummer: `PROEF-${a}` }, tijd)).toThrow();
  });
  test("deelname en registratie worden gekoppeld en samen ingetrokken", () => {
    const deelname = verwerkProef(legeProef(), { actie: "deelname", verzoek: a }, tijd);
    const registratie = verwerkProef(deelname, { actie: "registratie", verzoek: b, nummer: `PROEF-${a}` }, tijd);
    expect(registratie.records).toHaveLength(2);
    const result = verwerkProef(registratie, { actie: "intrekken", verzoek: c, nummer: `PROEF-${a}` }, tijd);
    expect(result.records).toHaveLength(0);
    expect(result.ingetrokken).toEqual([`PROEF-${a}`]);
    expect(verwerkProef(result, { actie: "deelname", verzoek: a }, tijd).records).toHaveLength(0);
  });
  test("dubbel verzoek maakt geen tweede record", () => {
    const state = verwerkProef(legeProef(), { actie: "klacht", verzoek: a }, tijd);
    expect(verwerkProef(state, { actie: "klacht", verzoek: a }, tijd).records).toHaveLength(1);
  });
  test("proeftaak verwerkt uitsluitend fictieve verzoeken", () => {
    const state = verwerkProef(legeProef(), { actie: "klacht", verzoek: a }, tijd);
    const result = verwerkProef(state, { actie: "verwerken", verzoek: b }, tijd);
    expect(result.records[0]?.status).toBe("Proef afgehandeld");
    expect(result.records[1]?.soort).toBe("taak");
    expect(result.fictief).toBe(true);
  });
  test("maximaal drie gekoppelde proefregistraties", () => {
    let state = verwerkProef(legeProef(), { actie: "deelname", verzoek: a }, tijd);
    for (let i = 2; i <= 4; i++) state = verwerkProef(state, { actie: "registratie", verzoek: `00000000-0000-4000-8000-00000000000${i}`, nummer: `PROEF-${a}` }, tijd);
    expect(() => verwerkProef(state, { actie: "registratie", verzoek: "00000000-0000-4000-8000-000000000005", nummer: `PROEF-${a}` }, tijd)).toThrow();
  });
  test("opslimiet van honderd handmatige proefacties", () => {
    const state = legeProef();
    state.verzoeken = Array.from({ length: 100 }, (_, i) => `actie-${i}`);
    expect(() => verwerkProef(state, { actie: "deelname", verzoek: a }, tijd)).toThrow();
  });
});