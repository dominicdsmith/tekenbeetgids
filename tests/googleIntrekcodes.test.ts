import { describe, expect, it } from "vitest";
import { codeDocument, codeVingerafdruk, migreerCode, verifieerGoogleCode } from "@/lib/google-intrekcodes";
import { intrekkingDocument } from "@/lib/firebase-spiegel-transactie";
import { MIGRATIE_DATABASE } from "@/lib/firebase-migratie";
const nummer = "TRK-2026-ABC123", id = "123e4567-e89b-42d3-a456-426614174000", code = "ABCDEFGHJK";
const participant = `${MIGRATIE_DATABASE}/documents/deelnames/${id}`;
describe("Google legacy intrekcodes", () => {
  it("houdt oude codes geldig zonder de code of serversleutel op te slaan", async () => {
    let opgeslagen = "";
    await migreerCode(async (path, init) => {
      if (path.endsWith("beginTransaction")) return { transaction: "synthetic" };
      if (path.endsWith("batchGet")) return [{ found: { name: participant, fields: { nummer: { stringValue: nummer } } } }, { missing: intrekkingDocument(nummer) }, { missing: codeDocument(nummer) }];
      opgeslagen = String(init?.body); return {};
    }, nummer, id, code);
    expect(opgeslagen).toContain(await codeVingerafdruk(nummer, code));
    expect(opgeslagen).not.toContain(code);
  });
  it("verifieert een bestaande code bij een actieve Google-deelname", async () => {
    const fingerprint = await codeVingerafdruk(nummer, code);
    let requests = 0;
    expect(await verifieerGoogleCode(async () => ++requests === 1 ? [{ found: { name: codeDocument(nummer), fields: { fingerprint: { stringValue: fingerprint }, deelname_id: { stringValue: id } } } }, { missing: intrekkingDocument(nummer) }] : [{ found: { name: participant, fields: { nummer: { stringValue: nummer } } } }], nummer, code)).toBe(true);
  });
  it("weigert een ingetrokken deelnemer ondanks een bestaande code", async () => {
    expect(await verifieerGoogleCode(async () => [{ found: { name: codeDocument(nummer) } }, { found: { name: intrekkingDocument(nummer) } }], nummer, code)).toBe(false);
  });
  it("weigert een code zonder actieve deelname", async () => {
    const fingerprint = await codeVingerafdruk(nummer, code); let n = 0;
    expect(await verifieerGoogleCode(async () => ++n === 1 ? [{ found: { name: codeDocument(nummer), fields: { fingerprint: { stringValue: fingerprint }, deelname_id: { stringValue: id } } } }, { missing: intrekkingDocument(nummer) }] : [{ missing: participant }], nummer, code)).toBe(false);
  });
  it("bindt de vingerafdruk aan het deelnamenummer", async () => {
    expect(await codeVingerafdruk(nummer, code)).not.toBe(await codeVingerafdruk("TRK-2026-ABC124", code));
  });
  it("overschrijft geen afwijkende reeds opgeslagen code", async () => {
    let commit = false;
    await expect(migreerCode(async path => {
      if (path.endsWith("beginTransaction")) return { transaction: "synthetic" };
      if (path.endsWith("batchGet")) return [{ found: { name: participant, fields: { nummer: { stringValue: nummer } } } }, { missing: intrekkingDocument(nummer) }, { found: { name: codeDocument(nummer), fields: { fingerprint: { stringValue: "wrong" } } } }];
      if (path.endsWith("commit")) commit = true; return {};
    }, nummer, id, code)).rejects.toThrow();
    expect(commit).toBe(false);
  });
});