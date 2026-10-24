import { describe, expect, it } from "vitest";
import { intrekkingDocument, markeerIntrekking, schrijfZonderIntrekking, type SpiegelTransport } from "@/lib/firebase-spiegel-transactie";

describe("Google intrekkingsbeveiliging", () => {
  it("beschermt deelname en achtervoegselregistratie met hetzelfde intrekkingsdocument", () => {
    expect(intrekkingDocument("TRK-2026-ABC123-9F2K")).toBe(intrekkingDocument("TRK-2026-ABC123"));
    expect(() => intrekkingDocument("../../vreemd")).toThrow();
  });
  it("schrijft een ingetrokken deelname nooit terug", async () => {
    const calls: string[] = [];
    const transport: SpiegelTransport = async path => {
      calls.push(path);
      return path.endsWith("beginTransaction") ? { transaction: "test" } : path.endsWith("batchGet") ? [{ found: { name: "marker" } }] : {};
    };
    expect(await schrijfZonderIntrekking(transport, "TRK-2026-ABC123", [{ update: {} }])).toBe(false);
    expect(calls.some(p => p.endsWith(":commit"))).toBe(false);
    expect(calls.some(p => p.endsWith(":rollback"))).toBe(true);
  });
  it("bindt toegestane writes aan de transactie van de intrekkingscontrole", async () => {
    let body: Record<string, unknown> = {};
    const writes = [{ update: { name: "synthetic" } }];
    const transport: SpiegelTransport = async (path, init) => {
      if (path.endsWith("beginTransaction")) return { transaction: "test" };
      if (path.endsWith("batchGet")) return [{ missing: intrekkingDocument("TRK-2026-ABC123") }];
      body = JSON.parse(String(init?.body)); return {};
    };
    expect(await schrijfZonderIntrekking(transport, "TRK-2026-ABC123", writes)).toBe(true);
    expect(body).toEqual({ transaction: "test", writes });
  });
  it("faalt gesloten bij een onvolledige intrekkingscontrole", async () => {
    const calls: string[] = [];
    const transport: SpiegelTransport = async path => { calls.push(path); return path.endsWith("beginTransaction") ? { transaction: "test" } : []; };
    await expect(schrijfZonderIntrekking(transport, "TRK-2026-ABC123", [])).rejects.toThrow();
    expect(calls.some(p => p.endsWith(":commit"))).toBe(false);
  });
  it("bewaart in het intrekkingsdocument geen rapport of persoonlijke inhoud", async () => {
    let body: unknown;
    await markeerIntrekking(async (_path, init) => { body = JSON.parse(String(init?.body)); return {}; }, "TRK-2026-ABC123");
    expect(body).toEqual({ writes: [{ update: { name: intrekkingDocument("TRK-2026-ABC123"), fields: {
      ingetrokken: { booleanValue: true }, google_verwijdering: { stringValue: "in-behandeling" }, bijgewerkt: { timestampValue: expect.any(String) },
    } } }] });
  });
});