import { describe, expect, it } from "vitest";
import { berekenProvincieKaart } from "../src/lib/provincieklassen";
import { ziekteKaartKlasse } from "../src/lib/ziektekaart";
import { PROVINCIES, ZIEKTEN } from "../src/data/tekenData";

describe("Brongebonden kaartberekening", () => {
  const invoer = [10, 30, 50, 70, 90].map((meldingen, i) => ({ provincieId: String(i), meldingen, inwoners: 100000, habitatFactor: 2, tbeGevallen: 0 }));
  it("weegt TBE-woonprovincietellingen niet mee in scores of vijf klassen", () => {
    const basis = berekenProvincieKaart(invoer);
    const gewijzigd = berekenProvincieKaart(invoer.map((r, i) => ({ ...r, tbeGevallen: [25, 22, 8, 100, 0][i] ?? 0 })));
    expect(gewijzigd.grenzen).toEqual(basis.grenzen);
    expect(gewijzigd.provincies.map((p) => [p.score, p.klasse])).toEqual(basis.provincies.map((p) => [p.score, p.klasse]));
    expect(basis.provincies.map((p) => p.klasse)).toEqual([5, 4, 3, 2, 1]);
    expect(basis.provincies.find((p) => p.provincieId === "0")?.score).toBe(20);
  });
  it("leidt voor alfa-gal en onbekende percentages geen provinciale rangorde af", () => {
    for (const id of ["alfagal", "bartonella", "tularemie"]) {
      const ziekte = ZIEKTEN.find((z) => z.id === id);
      if (!ziekte) throw new Error(id);
      expect(PROVINCIES.map((p) => ziekteKaartKlasse(ziekte, p))).toEqual(Array(12).fill(1));
    }
  });
  it("onderscheidt TBE uitsluitend met de gepubliceerde lokale bewijsstatus", () => {
    const ziekte = ZIEKTEN.find((z) => z.id === "tbe");
    if (!ziekte) throw new Error("TBE ontbreekt");
    expect(ziekteKaartKlasse(ziekte, PROVINCIES.find((p) => p.id === "friesland"))).toBe(3);
    expect(ziekteKaartKlasse(ziekte, PROVINCIES.find((p) => p.id === "zeeland"))).toBe(2);
    expect(ziekteKaartKlasse(ziekte, PROVINCIES.find((p) => p.id === "groningen"))).toBe(1);
  });
});