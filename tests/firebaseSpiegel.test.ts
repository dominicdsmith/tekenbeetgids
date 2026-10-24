import { describe, expect, it } from "vitest";
import {
  codeerSpiegelLog, codeerSpiegelRij, nummerValtOnderIntrekking, SPIEGEL_TABELLEN, spiegelTabel,
} from "@/lib/firebase-spiegel";
import { MIGRATIE_DATABASE, MIGRATIE_TABELLEN } from "@/lib/firebase-migratie";

const id = "123e4567-e89b-42d3-a456-426614174000";

describe("firebase-spiegel", () => {
  it("dekt alle vier migratietabellen plus tellingen en back-uplog", () => {
    expect(SPIEGEL_TABELLEN).toHaveLength(6);
    for (const t of MIGRATIE_TABELLEN) expect(spiegelTabel(t.bron)?.collectie).toBe(t.collectie);
    expect(spiegelTabel("tekenbeet_tellingen")?.collectie).toBe("tellingen");
    expect(spiegelTabel("backup_log")?.collectie).toBe("backuplog");
    expect(spiegelTabel("onbekend")).toBeNull();
  });

  it("codeert een nieuwe rij met bron-id, nummer en volledige gegevens", () => {
    const rij = { id, deelnamenummer: "TRK-2026-ABC123", status: "Ingediend", created_at: "2026-10-24T10:00:00Z" };
    const uit = codeerSpiegelRij(spiegelTabel("onderzoek_deelnames")!, rij, "2026-10-24T10:00:01Z");
    expect(uit.naam).toBe(`${MIGRATIE_DATABASE}/documents/deelnames/${id}`);
    expect(uit.velden.nummer).toEqual({ stringValue: "TRK-2026-ABC123" });
    expect(JSON.parse(uit.velden.gegevens.stringValue)).toEqual(rij);
  });

  it("gebruikt uitgevoerd_op als aanmaaktijd voor het back-uplog", () => {
    const rij = { id, geslaagd: true, bestand: "backup-2026-10-24.json.enc", uitgevoerd_op: "2026-10-24T02:15:00Z" };
    const uit = codeerSpiegelRij(spiegelTabel("backup_log")!, rij, "2026-10-24T02:15:01Z");
    expect(uit.velden.aangemaakt_op).toEqual({ stringValue: "2026-10-24T02:15:00Z" });
    expect(uit.velden.nummer).toEqual({ nullValue: null });
  });

  it("weigert rijen zonder geldig uuid", () => {
    expect(() => codeerSpiegelRij(spiegelTabel("tellingen" ) ?? spiegelTabel("tekenbeet_tellingen")!, { id: "x" }, "t")).toThrow();
  });

  it("schrijft logregels zonder recordinhoud", () => {
    const uit = codeerSpiegelLog("opslaan", "onderzoek_deelnames", false, "Google-spiegel weigerde de handeling (500)", "2026-10-24T10:00:00Z");
    expect(uit.naam).toContain("/documents/migratie_log/");
    expect(uit.velden.ok).toEqual({ booleanValue: false });
    expect(uit.velden.detail.stringValue.length).toBeLessThanOrEqual(200);
    expect(JSON.stringify(uit.velden)).not.toContain("rapport");
  });

  it("herkent welke nummers onder een intrekking vallen", () => {
    expect(nummerValtOnderIntrekking("TRK-2026-ABC123", "TRK-2026-ABC123")).toBe(true);
    expect(nummerValtOnderIntrekking("TRK-2026-ABC123-9F2K", "TRK-2026-ABC123")).toBe(true);
    expect(nummerValtOnderIntrekking("TRK-2026-ABC124", "TRK-2026-ABC123")).toBe(false);
    expect(nummerValtOnderIntrekking(null, "TRK-2026-ABC123")).toBe(false);
  });
});
