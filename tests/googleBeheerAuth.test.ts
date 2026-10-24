import { describe, expect, it } from "vitest";
import { controleerGoogleBeheerClaims } from "@/lib/google-beheer-auth";

const claims = { sub: "approved-uid", email: "ddsmith@dominicsmith.nl", email_verified: true, firebase: { sign_in_provider: "google.com" } };
describe("zelfstandige Google-beheeridentiteit", () => {
  it("laat alleen goedgekeurde UID en geverifieerd zakelijk Google-account toe", () => {
    expect(controleerGoogleBeheerClaims(claims, "approved-uid")).toBe("approved-uid");
  });
  it("weigert zonder vooraf geconfigureerde UID", () => {
    expect(() => controleerGoogleBeheerClaims(claims, undefined)).toThrow();
  });
  it("weigert een andere UID ook met hetzelfde emailadres", () => {
    expect(() => controleerGoogleBeheerClaims({ ...claims, sub: "other" }, "approved-uid")).toThrow();
  });
  it("weigert ieder ander emailadres", () => {
    expect(() => controleerGoogleBeheerClaims({ ...claims, email: "other@example.org" }, "approved-uid")).toThrow();
  });
  it("weigert ongeverifieerde identiteit", () => {
    expect(() => controleerGoogleBeheerClaims({ ...claims, email_verified: false }, "approved-uid")).toThrow();
  });
  it("weigert wachtwoordlogin en door gebruiker geschreven profielrollen", () => {
    expect(() => controleerGoogleBeheerClaims({ ...claims, role: "admin", firebase: { sign_in_provider: "password" } }, "approved-uid")).toThrow();
  });
});