import { describe, expect, it } from "vitest";
import { leesVolledigeBron, vergelijkRecords, vergelijkRecordDetails, googleEffectieveRij, type Rij } from "@/lib/firebase-migratie-controle";

describe("volledige migratiecontrole", () => {
  it("vergelijkt iedere record-id en toont ontbrekende, extra en gewijzigde velden", () => {
    const uit = vergelijkRecordDetails([{ id: "a", status: "oud" }, { id: "b" }], [{ id: "a", status: "nieuw" }, { id: "c" }]);
    expect(uit.map(r => [r.id, r.status])).toEqual([["a", "afwijkend"], ["b", "ontbreekt"], ["c", "extra"]]);
    expect(uit[0]?.velden.find(v => v.veld === "status")).toEqual({ veld: "status", gelijk: false, bronAanwezig: true, googleAanwezig: true });
  });

  it("geeft nooit inhoud of geheime veldnamen terug maar vergelijkt deze wel", () => {
    const uit = vergelijkRecordDetails([{ id: "a", naam: "Persoon", intrekcode_fingerprint: "geheim-a" }], [{ id: "a", naam: "Persoon", intrekcode_fingerprint: "geheim-b" }]);
    expect(uit[0]?.status).toBe("afwijkend");
    expect(uit[0]?.velden.find(v => v.veld === "Afgeschermd controleveld")?.gelijk).toBe(false);
    expect(JSON.stringify(uit)).not.toMatch(/Persoon|geheim-a|geheim-b|intrekcode_fingerprint/);
  });

  it("vergelijkt geneste inhoud en onderscheidt een afwezig veld van null", () => {
    expect(vergelijkRecordDetails([{ id: "a", gegevens: { x: [1, 2] }, rapport: null }], [{ id: "a", gegevens: { x: [1, 3] } }])[0]?.velden.filter(v => !v.gelijk).map(v => v.veld)).toEqual(["gegevens", "rapport"]);
    expect(vergelijkRecordDetails([{ id: "a", gegevens: { x: 1, y: 2 } }], [{ gegevens: { y: 2, x: 1 }, id: "a" }])[0]?.status).toBe("gelijk");
  });

  it("weigert dubbele ids voor de detailvergelijking", () => {
    expect(() => vergelijkRecordDetails([{ id: "a" }, { id: "a" }], [])).toThrow("Ongeldige");
  });

  it("verbergt onbekende veldnamen en alle geneste waarden", () => {
    const uit = vergelijkRecordDetails([{ id: "a", geheimInNaam: "privaat", gegevens: { code: "verborgen" } }], []);
    expect(JSON.stringify(uit)).not.toMatch(/geheimInNaam|privaat|verborgen|\"code\"/);
    expect(uit[0]?.status).toBe("ontbreekt");
  });

  it("vergelijkt actuele Google-status in plaats van verouderde JSON-status", () => {
    const rij = googleEffectieveRij({ id: "a", status: "nieuw", gemeld_op: null }, "gemeld", "2026-10-23T23:00:00Z");
    expect(vergelijkRecords("deelnames", [{ id: "a", status: "gemeld", gemeld_op: "2026-10-23T23:00:00Z" }], [rij]).gelijk).toBe(true);
    expect(googleEffectieveRij({ id: "a", status: "nieuw" })).toEqual({ id: "a", status: "nieuw" });
  });
  it("leest meer dan de standaard rijlimiet met vaste paginering", async () => {
    const rijen = Array.from({ length: 1201 }, (_, i) => ({ id: String(i).padStart(6, "0") }));
    const bereiken: number[][] = [];
    const uit = await leesVolledigeBron({
      tel: async t => t === "onderzoek_deelnames" ? 1201 : 0,
      pagina: async (_t, vanaf, tot) => { bereiken.push([vanaf, tot]); return rijen.slice(vanaf, tot + 1); },
    });
    expect(uit.onderzoek_deelnames).toHaveLength(1201);
    expect(bereiken).toEqual([[0, 499], [500, 999], [1000, 1200]]);
  });

  it("weigert een afgekapt resultaat ondanks een geslaagde leesaanroep", async () => {
    await expect(leesVolledigeBron({ tel: async () => 2, pagina: async () => [{ id: "a" }] })).rejects.toThrow("Onvolledige");
  });

  it("weigert een gewijzigde brontelling tijdens lezen", async () => {
    let telling = 0;
    await expect(leesVolledigeBron({ tel: async () => ++telling, pagina: async () => [{ id: "a" }] })).rejects.toThrow("Bron gewijzigd");
  });

  it("weigert dubbele ids tussen pagina's", async () => {
    await expect(leesVolledigeBron({ tel: async () => 2, pagina: async () => [{ id: "a" }, { id: "a" }] })).rejects.toThrow("dubbel");
  });

  it("herkent verschillende deelnemers ondanks gelijke aantallen", () => {
    expect(vergelijkRecords("deelnames", [{ id: "a" }], [{ id: "b" }])).toEqual({ tabel: "deelnames", ontbreekt: 1, extra: 1, afwijkend: 0, gelijk: false });
  });

  it("herkent inhoudswijzigingen en negeert alleen de volgorde van objectsleutels", () => {
    const bron: Rij[] = [{ id: "a", gegevens: { x: 1, y: 2 } }];
    expect(vergelijkRecords("deelnames", bron, [{ gegevens: { y: 2, x: 1 }, id: "a" }]).gelijk).toBe(true);
    expect(vergelijkRecords("deelnames", bron, [{ id: "a", gegevens: { x: 1, y: 3 } }]).afwijkend).toBe(1);
  });

  it("geeft alleen aantallen terug zonder persoonlijke records", () => {
    const uit = vergelijkRecords("deelnames", [{ id: "privaat-id", naam: "fictief" }], []);
    expect(Object.keys(uit).sort()).toEqual(["afwijkend", "extra", "gelijk", "ontbreekt", "tabel"]);
    expect(JSON.stringify(uit)).not.toContain("privaat-id");
  });
});