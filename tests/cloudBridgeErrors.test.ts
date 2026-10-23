import { describe, expect, it } from "bun:test";
import { publicBridgeError, reviewedBridgeMessage } from "../src/lib/cloudBridgeErrors";

describe("Bridge error boundaries", () => {
  it("preserves scan limits in Dutch and English instead of claiming an outage", () => {
    for (const action of ["teekscan", "beetscan"]) {
      for (const message of ["Te veel scans. Probeer het later opnieuw.", "Too many scans. Please try again later."]) {
        const response = publicBridgeError(action, new Error(message));
        expect(response.status).toBe(429);
        expect(reviewedBridgeMessage(response.status, response.body)).toBe(message);
      }
    }
  });
  it("never exposes arbitrary backend exception text", () => {
    expect(publicBridgeError("teekscan", new Error("private provider detail")).body).toEqual({ ok: false, stage: "handler" });
    expect(publicBridgeError("contact", new Error("Te veel scans. Probeer het later opnieuw.")).status).toBe(503);
    expect(reviewedBridgeMessage(429, { code: "scan_limit", message: "private detail" })).toBeNull();
    expect(reviewedBridgeMessage(503, { code: "scan_limit", message: "Te veel scans. Probeer het later opnieuw." })).toBeNull();
  });
});