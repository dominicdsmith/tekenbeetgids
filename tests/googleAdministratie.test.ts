import { describe, expect, it } from "vitest";
import { GOOGLE_EXPORT_COLLECTIES, leesGoogleMomentopname, versleutelGoogleExport } from "@/lib/google-administratie";
import { MIGRATIE_DATABASE } from "@/lib/firebase-migratie";

describe("Google beheer en export", () => {
  it("leest alle collecties onder dezelfde momentopname en bewaart intrekkingen", async () => {
    const transacties: string[] = [];
    const gelezen: string[] = [];
    const result = await leesGoogleMomentopname(async (path, init) => {
      if (path.endsWith("beginTransaction")) return { transaction: "snapshot" };
      if (path.endsWith("rollback")) return {};
      const body = JSON.parse(String(init?.body));
      transacties.push(body.transaction); const collectie = body.structuredQuery.from[0].collectionId; gelezen.push(collectie);
      if (collectie === "intrekkingen") return [{ document: { name: `${MIGRATIE_DATABASE}/documents/intrekkingen/TRK-2026-ABC123`, fields: { ingetrokken: { booleanValue: true } } } }];
      return [];
    });
    expect(gelezen).toEqual([...GOOGLE_EXPORT_COLLECTIES]);
    expect(transacties.every(t => t === "snapshot")).toBe(true);
    expect(result.tabellen["intrekkingen"]).toEqual([{ nummer: "TRK-2026-ABC123", ingetrokken: true }]);
  });
  it("weigert een export met onvolledige records", async () => {
    await expect(leesGoogleMomentopname(async path => path.endsWith("beginTransaction") ? { transaction: "snapshot" } : path.endsWith("rollback") ? {} : [{ document: { name: `${MIGRATIE_DATABASE}/documents/deelnames/123`, fields: {} } }])).rejects.toThrow();
  });
  it("herstelt de versleutelde export met 100000 herhalingen zonder inhoudverlies", async () => {
    const inhoud = { bron: "Google Firestore", tabellen: { deelnames: [{ id: "synthetic" }], intrekkingen: [{ nummer: "TRK-2026-ABC123" }] } };
    const wachtzin = "uitsluitend-fictieve-testwachtzin";
    const envelope = JSON.parse(await versleutelGoogleExport(inhoud, wachtzin));
    const bytes = (s: string) => Uint8Array.from(atob(s), c => c.charCodeAt(0));
    expect(envelope.iteraties).toBe(100_000);
    expect(envelope.formaat).toBe("TekenbeetGids-backup-v1");
    const basis = await crypto.subtle.importKey("raw", new TextEncoder().encode(wachtzin), "PBKDF2", false, ["deriveKey"]);
    const key = await crypto.subtle.deriveKey({ name: "PBKDF2", salt: bytes(envelope.zout), iterations: envelope.iteraties, hash: "SHA-256" }, basis, { name: "AES-GCM", length: 256 }, false, ["decrypt"]);
    const decoded = await crypto.subtle.decrypt({ name: "AES-GCM", iv: bytes(envelope.iv) }, key, bytes(envelope.data));
    expect(JSON.parse(new TextDecoder().decode(decoded))).toEqual(inhoud);
  });
  it("weigert ontbrekende encryptiesleutels", async () => {
    await expect(versleutelGoogleExport({ test: true }, "kort")).rejects.toThrow();
  });
});