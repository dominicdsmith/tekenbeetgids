import { describe, expect, it } from "bun:test";
import { GEMINI_MODEL, GEMINI_API_ORIGIN, leesGeminiJson } from "../src/lib/geminiConfig";

describe("direct Gemini API", () => {
  it("uses the requested Gemini model", () => expect(GEMINI_MODEL).toBe("gemini-3.8-flash"));
  it("uses AI Studio rather than Vertex or a gateway", () => expect(GEMINI_API_ORIGIN).toBe("https://generativelanguage.googleapis.com"));
  it("accepts completed structured identifiers", () => expect(leesGeminiJson('{"status":"unknown","antwoordId":null}', "STOP", false)).toEqual({ status: "unknown", antwoordId: null }));
  it("rejects safety blocked output", () => expect(() => leesGeminiJson('{}', "STOP", true)).toThrow());
  it("rejects incomplete output", () => expect(() => leesGeminiJson('{}', "MAX_TOKENS", false)).toThrow());
  it("rejects unstructured prose", () => expect(() => leesGeminiJson('Take antibiotics', "STOP", false)).toThrow());
});