/** Only reviewed public errors may cross the bridge; never forward arbitrary exception text. */
const SCAN_LIMIT_MESSAGES = [
  "Te veel scans. Probeer het later opnieuw.",
  "Too many scans. Please try again later.",
] as const;

export function publicBridgeError(action: string | null, error: unknown) {
  const message = error instanceof Error ? error.message : "";
  if ((action === "teekscan" || action === "beetscan") && SCAN_LIMIT_MESSAGES.some((known) => known === message)) {
    return { status: 429, body: { ok: false, code: "scan_limit", message } };
  }
  return { status: 503, body: { ok: false, stage: "handler" } };
}

export function reviewedBridgeMessage(status: number, body: unknown): string | null {
  if (status !== 429 || !body || typeof body !== "object") return null;
  const value = body as { code?: unknown; message?: unknown };
  if (value.code !== "scan_limit" || typeof value.message !== "string") return null;
  return SCAN_LIMIT_MESSAGES.some((known) => known === value.message) ? value.message : null;
}