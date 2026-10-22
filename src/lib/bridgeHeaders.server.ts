import { AsyncLocalStorage } from "node:async_hooks";
import { getRequestHeader } from "@tanstack/react-start/server";

// Incoming request headers are immutable on the edge runtime. Verified Cloud Run
// bridge calls supply replacement headers here, scoped to that one request only.
const overrides = new AsyncLocalStorage<Record<string, string>>();

export function withBridgeHeaders<T>(headers: Record<string, string>, run: () => Promise<T>): Promise<T> {
  return overrides.run(headers, run);
}

export function bridgeHeader(name: string): string | undefined {
  const value = overrides.getStore()?.[name.toLowerCase()];
  return value ?? getRequestHeader(name as never) ?? undefined;
}

/**
 * Alleen aanvragen vanaf de eigen website. Achter proxies (Cloud Run, Lovable)
 * ziet de server de aanvraag soms als http:// terwijl de browser https://
 * stuurt; vergelijk daarom de host, niet de volledige herkomst-URL.
 */
export function zelfdeOorsprong(request: Request): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return false;
  try {
    const bron = new URL(origin);
    const doorgestuurd = (request.headers.get("x-forwarded-host") ?? "").split(",")[0]?.trim();
    const host = (doorgestuurd || request.headers.get("host") || new URL(request.url).host).toLowerCase();
    return bron.host === host;
  } catch {
    return false;
  }
}
