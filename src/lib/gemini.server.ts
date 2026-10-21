import { GoogleGenAI } from "@google/genai";
import { GEMINI_API_ORIGIN, GEMINI_MODEL, leesGeminiJson } from "./geminiConfig";

export class GeminiFout extends Error {
  constructor(public status: number) {
    super(status === 429
      ? "Google Gemini is tijdelijk bezet of het gebruikslimiet is bereikt. / Google Gemini is busy or its usage limit has been reached."
      : "Google Gemini kon deze aanvraag niet afronden. / Google Gemini could not complete this request.");
  }
}

/** Direct paid Gemini API. No Files API, cached content or conversation persistence. */
export async function vraagGeminiJson(
  instructions: string,
  contents: { role: string; parts: ({ text: string } | { inlineData: { mimeType: string; data: string } })[] }[],
  schema: Record<string, unknown>,
  signal?: AbortSignal,
): Promise<unknown> {
  const key = process.env["GOOGLE_VERTEX_API_KEY"];
  if (!key) throw new GeminiFout(401);
  const ai = new GoogleGenAI({ apiKey: key, vertexai: false, httpOptions: {
    baseUrl: GEMINI_API_ORIGIN, apiVersion: "v1beta", timeout: 60000,
    retryOptions: { attempts: 1 },
  } });
  try {
    const stream = await ai.models.generateContentStream({
      model: GEMINI_MODEL,
      contents,
      config: {
        systemInstruction: instructions,
        responseMimeType: "application/json",
        responseJsonSchema: schema,
        maxOutputTokens: 2048,
        ...(signal ? { abortSignal: signal } : {}),
      },
    });
    let text = "", finishReason: string | undefined, blocked = false;
    for await (const chunk of stream) {
      if (signal?.aborted) throw new DOMException("Aborted", "AbortError");
      blocked ||= Boolean(chunk.promptFeedback?.blockReason);
      for (const candidate of chunk.candidates ?? []) {
        if (candidate.finishReason) finishReason = candidate.finishReason;
        for (const part of candidate.content?.parts ?? []) {
          if (part.text && !part.thought) text += part.text;
        }
      }
      if (text.length > 16000) throw new GeminiFout(502);
    }
    return leesGeminiJson(text, finishReason, blocked);
  } catch (error) {
    if (signal?.aborted) throw new DOMException("Aborted", "AbortError");
    if (error instanceof GeminiFout) throw error;
    const status = error && typeof error === "object" && "status" in error ? Number(error.status) : 502;
    // Never expose upstream error bodies, which may contain request content.
    throw new GeminiFout([400, 401, 402, 403, 429].includes(status) ? status : 502);
  }
}