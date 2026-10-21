import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";

/**
 * Geeft de hostnaam van het huidige request terug (server-side).
 * Gebruikt in route-guards om domeinspecifieke landingpages te regelen.
 */
export const readRequestHost = createServerFn({ method: "GET" }).handler(() => {
  const request = getRequest();
  if (!request) return "";
  const headers = request.headers;
  if (!headers) return "";
  const forwarded = headers.get("x-forwarded-host");
  const rawHost = (typeof forwarded === "string" && forwarded) || headers.get("host");
  const host = typeof rawHost === "string" ? rawHost.split(",")[0]!.trim() : "";

  const parts = host.split(":");
  return parts[0]?.toLowerCase() ?? "";
});
