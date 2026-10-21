export const GEMINI_MODEL = "gemini-3.8-flash";
export const GEMINI_API_ORIGIN = "https://generativelanguage.googleapis.com";

/** Fail closed: only completed, non-blocked JSON responses are accepted. */
export function leesGeminiJson(text: string, finishReason: string | undefined, blocked: boolean): unknown {
  if (blocked || finishReason !== "STOP" || !text.trim())
    throw new Error("Geen afgeronde AI-vergelijking ontvangen. / No completed AI comparison received.");
  try { return JSON.parse(text) as unknown; }
  catch { throw new Error("Ongeldige AI-uitkomst. / Invalid AI output."); }
}