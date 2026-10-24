import { describe, expect, it } from "vitest";
import {
  batches, codeerRij, controleerMigratieBeheer, MIGRATIE_DATABASE, MIGRATIE_TABELLEN,
  migratieInput, spiegelLogInput, vergelijkAantallen,
} from "@/lib/firebase-migratie";

const tabel = MIGRATIE_TABELLEN[0]; // onderzoek_deelnames → deelnames
const id = "123e4567-e89b-42d3-a456-426614174000";

describe("firebase-migratie", () => {
  it("accepteert alleen de vaste acties", () => {
    expect(migratieInput.safeParse({ actie: "tellen" }).success).toBe(true);
    expect(migratieInput.safeParse({ actie: "overzetten" }).success).toBe(true);
    expect(migratieInput.safeParse({ actie: "controleren" }).success).toBe(true);
    expect(migratieInput.safeParse({ actie: "spiegellog" }).success).toBe(false);
    expect(spiegelLogInput.safeParse({ actie: "spiegellog" }).success).toBe(true);
    expect(spiegelLogInput.safeParse({ actie: "tellen" }).success).toBe(false);
    expect(migratieInput.safeParse({ actie: "verwijderen" }).success).toBe(false);
    expect(migratieInput.safeParse({ actie: "tellen", extra: 1 }).success).toBe(false);
  });

  it("codeert een rij met bron-id, nummer en volledige gegevens", () => {
    const rij = { id, deelnamenummer: "TB-2026-0001", status: "actief", created_at: "2026-10-01T10:00:00Z", gegevens: { a: 1 } };
    const uit = codeerRij(tabel, rij, "2026-10-23T22:00:00Z");
    expect(uit.naam).toBe(`${MIGRATIE_DATABASE}/documents/deelnames/${id}`);
    expect(uit.velden.bron_id).toEqual({ stringValue: id });
    expect(uit.velden.nummer).toEqual({ stringValue: "TB-2026-0001" });
    expect(JSON.parse(uit.velden.gegevens.stringValue)).toEqual(rij);
    expect(uit.velden.gemigreerd_op).toEqual({ timestampValue: "2026-10-23T22:00:00Z" });
  });

  it("zet ontbrekend nummer om in null en weigert ongeldige ids", () => {
    const contact = MIGRATIE_TABELLEN[2];
    const uit = codeerRij(contact, { id, created_at: "2026-10-01T10:00:00Z" }, "2026-10-23T22:00:00Z");
    expect(uit.velden.nummer).toEqual({ nullValue: null });
    expect(() => codeerRij(tabel, { id: "geen-uuid" }, "2026-10-23T22:00:00Z")).toThrow();
  });

  it("vergelijkt aantallen per tabel en markeert verschillen", () => {
    const uit = vergelijkAantallen(
      { onderzoek_deelnames: 6, tekenbeet_registraties: 1, contact_berichten: 1, privacy_verzoeken: 0 },
      { deelnames: 6, registraties: 0, contact_berichten: 1, privacy_verzoeken: 0 },
    );
    expect(uit).toHaveLength(4);
    expect(uit.find(a => a.tabel === "onderzoek_deelnames")?.gelijk).toBe(true);
    expect(uit.find(a => a.tabel === "tekenbeet_registraties")?.gelijk).toBe(false);
  });

  it("splitst writes in batches van maximaal 500", () => {
    const items = Array.from({ length: 1200 }, (_, i) => i);
    const uit = batches(items);
    expect(uit).toHaveLength(3);
    expect(uit[0]).toHaveLength(500);
    expect(uit[2]).toHaveLength(200);
  });

  it("weigert niet-beheerders", () => {
    expect(() => controleerMigratieBeheer(true, null)).not.toThrow();
    expect(() => controleerMigratieBeheer(false, null)).toThrow();
    expect(() => controleerMigratieBeheer(null, new Error("x"))).toThrow();
  });
});
