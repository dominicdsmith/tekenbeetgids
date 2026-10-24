import { describe, expect, it } from "vitest";
import { beoordeelIntrekStatus } from "../src/lib/google-intrekstatus";
const nummer = "TRK-2026-ABC123";
const deelname = { id: "synthetic-id", nummer };
const code = { nummer, deelnameId: deelname.id, fingerprint: "a".repeat(64), versie: "legacy-sha256-v1" };
describe("Google intrekkingscontrole", () => {
  it("telt voorbereide oude codes zonder geheimen in resultaat", () => {
    const r = beoordeelIntrekStatus([deelname], [], [code], [], "tijd");
    expect(r.oudeCodesGereed).toBe(1); expect(JSON.stringify(r)).not.toContain(code.fingerprint); expect(JSON.stringify(r)).not.toContain(nummer);
  });
  it("signaleert ontbrekende oude codes", () => expect(beoordeelIntrekStatus([deelname], [], [], [], "tijd").codesOntbreken).toBe(1));
  it("weigert een code die bij een andere deelname hoort", () => expect(beoordeelIntrekStatus([deelname], [], [{ ...code, deelnameId: "other" }], [], "tijd").codesAfwijkend).toBe(1));
  it("signaleert achtergebleven registraties bij intrekking", () => expect(beoordeelIntrekStatus([], [{ id: "test", nummer: `${nummer}-A` }], [code], [nummer], "tijd").intrekkingenNietAfgerond).toBe(1));
  it("beschouwt ingetrokken deelnemers niet als actief", () => {
    const r = beoordeelIntrekStatus([deelname], [], [code], [nummer], "tijd");
    expect(r.actieveDeelnames).toBe(0); expect(r.intrekkingenNietAfgerond).toBe(1);
  });
  it("bevestigt verwijderde Google records zonder codes te heractiveren", () => {
    const r = beoordeelIntrekStatus([], [], [code], [nummer], "tijd");
    expect(r.intrekkingen).toBe(1); expect(r.intrekkingenNietAfgerond).toBe(0); expect(r.oudeCodesGereed).toBe(0);
  });
});