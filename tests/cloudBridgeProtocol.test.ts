import { describe, expect, it } from "bun:test";
import { bridgeSignature, cloudBackendUrl, verifyBridgeSignature } from "../src/lib/cloudBridgeProtocol";

const fixture = "public-test-fixture-not-a-deployment-credential";
async function headersFor(body: string, action = "registratie", time = Date.now()) {
  const timestamp = String(time);
  const nonce = "12345678-1234-1234-1234-123456789abc";
  const ip = "192.0.2.1";
  return new Headers({ "x-bridge-action": action, "x-bridge-time": timestamp, "x-bridge-nonce": nonce, "x-bridge-ip": ip,
    "x-bridge-signature": await bridgeSignature(fixture, action, timestamp, nonce, body, ip) });
}
describe("Cloud Run connection keeps Lovable Cloud protected", () => {
  it("accepts the signed action and rejects altered registration data", async () => {
    const body = '{"nummer":"TRK-2026-ABCDEF"}';
    const headers = await headersFor(body);
    expect(await verifyBridgeSignature(fixture, headers, body)).toBe(true);
    expect(await verifyBridgeSignature(fixture, headers, '{"nummer":"TRK-2026-OTHER1"}')).toBe(false);
  });
  it("rejects expired and future requests", async () => {
    const now = Date.now();
    expect(await verifyBridgeSignature(fixture, await headersFor("{}", "deelname", now - 61_000), "{}", now)).toBe(false);
    expect(await verifyBridgeSignature(fixture, await headersFor("{}", "deelname", now + 61_000), "{}", now)).toBe(false);
  });
  it("cannot become an admin or arbitrary database proxy", async () => {
    expect(await verifyBridgeSignature(fixture, await headersFor("{}", "admin"), "{}")).toBe(false);
    expect(await verifyBridgeSignature(fixture, await headersFor("{}", "sql"), "{}")).toBe(false);
  });
  it("rejects a forged visitor identity", async () => {
    const headers = await headersFor("{}");
    headers.set("x-bridge-ip", "192.0.2.2");
    expect(await verifyBridgeSignature(fixture, headers, "{}")).toBe(false);
  });
  it("requires an HTTPS Lovable backend origin, not the Cloud Run site itself", () => {
    expect(cloudBackendUrl("https://tekenrisicokaart.lovable.app").pathname).toBe("/api/public/cloud-backend");
    expect(() => cloudBackendUrl("http://example.com")).toThrow();
    expect(() => cloudBackendUrl("https://example.run.app")).toThrow();
    expect(() => cloudBackendUrl("https://example.com/unrelated")).toThrow();
  });
});
