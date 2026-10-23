import { afterEach, describe, expect, it } from "bun:test";
import { deelOfDownloadPdf, isIOS } from "../src/lib/rapportPdf";

const originalNavigator = Object.getOwnPropertyDescriptor(globalThis, "navigator");
afterEach(() => {
  if (originalNavigator) Object.defineProperty(globalThis, "navigator", originalNavigator);
  else Reflect.deleteProperty(globalThis, "navigator");
});
function setNavigator(value: unknown) {
  Object.defineProperty(globalThis, "navigator", { value, configurable: true });
}

describe("Local PDF export on iOS", () => {
  it("recognises iPhones and touch iPads", () => {
    setNavigator({ userAgent: "iPhone", maxTouchPoints: 5 });
    expect(isIOS()).toBe(true);
    setNavigator({ userAgent: "Macintosh", maxTouchPoints: 5 });
    expect(isIOS()).toBe(true);
    setNavigator({ userAgent: "Macintosh", maxTouchPoints: 0 });
    expect(isIOS()).toBe(false);
  });
  it("shares an actual PDF file immediately without uploading", async () => {
    let shared: ShareData | undefined;
    setNavigator({ canShare: () => true, share: async (data: ShareData) => { shared = data; } });
    expect(await deelOfDownloadPdf(new Blob(["%PDF-test"], { type: "application/pdf" }), "proof.pdf", true)).toBe(true);
    expect(shared?.files?.[0]?.name).toBe("proof.pdf");
    expect(shared?.files?.[0]?.type).toBe("application/pdf");
    expect(await shared?.files?.[0]?.text()).toBe("%PDF-test");
  });
  it("treats closing the share sheet as cancellation, not an export failure", async () => {
    setNavigator({ canShare: () => true, share: async () => { throw new DOMException("Cancelled", "AbortError"); } });
    expect(await deelOfDownloadPdf(new Blob(["%PDF-test"]), "proof.pdf", true)).toBe(false);
  });
});