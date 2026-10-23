import { getRequest } from "@tanstack/react-start/server";
import { reviewedBridgeMessage } from "./cloudBridgeErrors";
import { BRIDGE_PATH, MAX_BRIDGE_BYTES, bridgeSignature, cloudBackendUrl, verifyBridgeSignature, type CloudAction } from "./cloudBridgeProtocol";

export async function forwardCloudRequest(action: CloudAction, body: string, request: Request): Promise<Response | null> {
  const backend = process.env["CLOUD_BACKEND_URL"];
  if (!backend) {
    if (process.env["APP_HOSTING"] === "cloud-run") throw new Error("De verbinding met de bronadministratie ontbreekt");
    return null;
  }
  const secret = process.env["CLOUD_BACKEND_SECRET"];
  if (!secret) throw new Error("De beveiligde verbinding is nog niet ingesteld");
  const target = cloudBackendUrl(backend);
  if (target.origin === new URL(request.url).origin) throw new Error("Circulaire verbinding geweigerd");
  if (new TextEncoder().encode(body).byteLength > MAX_BRIDGE_BYTES) throw new Error("Aanvraag is te groot");
  const timestamp = String(Date.now());
  const nonce = crypto.randomUUID();
  // Never accept a caller-provided bridge identity. Use the ingress IP only.
  const ip = (request.headers.get("cf-connecting-ip") || request.headers.get("x-forwarded-for") || "onbekend").split(",")[0]?.trim().slice(0, 100) ?? "onbekend";
  const response = await fetch(target, {
    method: "POST", redirect: "error", signal: request.signal,
    headers: {
      "Content-Type": "application/json", "x-bridge-action": action,
      "x-bridge-time": timestamp, "x-bridge-nonce": nonce, "x-bridge-ip": ip,
      "x-bridge-signature": await bridgeSignature(secret, action, timestamp, nonce, body, ip),
    }, body,
  });
  if (!response.ok && action !== "status") {
    const publicMessage = reviewedBridgeMessage(response.status, await response.json().catch(() => null));
    console.error("cloud bridge rejected", { action, status: response.status });
    throw new Error(publicMessage ?? "De bronadministratie is tijdelijk niet bereikbaar");
  }
  return response;
}

export async function runCloudAction<T>(action: CloudAction, data: unknown, local: () => Promise<T>): Promise<T> {
  const response = await forwardCloudRequest(action, JSON.stringify(data), getRequest());
  if (response) return await response.json() as T;
  return local();
}

export async function acceptCloudRequest(request: Request): Promise<Response> {
  const noStore = { "Cache-Control": "no-store" };
  const secret = process.env["CLOUD_BACKEND_SECRET"];
  if (!secret || process.env["CLOUD_BACKEND_URL"] || process.env["APP_HOSTING"] === "cloud-run") return Response.json({ ok: false }, { status: 503, headers: noStore });
  if (Number(request.headers.get("content-length") ?? 0) > MAX_BRIDGE_BYTES) return new Response(null, { status: 413 });
  // Bounded streaming read: never buffer an unbounded body without content-length.
  const reader = request.body?.getReader();
  if (!reader) return new Response(null, { status: 400 });
  const chunks: Uint8Array[] = [];
  let size = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > MAX_BRIDGE_BYTES) { await reader.cancel(); return new Response(null, { status: 413 }); }
    chunks.push(value);
  }
  const joined = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) { joined.set(chunk, offset); offset += chunk.byteLength; }
  const body = new TextDecoder().decode(joined);
  if (!(await verifyBridgeSignature(secret, request.headers, body))) return new Response(null, { status: 401, headers: noStore });
  // Consume the signed nonce atomically before executing any action. No retries of writes.
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data: claimed, error } = await (supabaseAdmin as unknown as { rpc: (name: string, args: Record<string, string>) => Promise<{ data: boolean; error: unknown }> }).rpc("claim_cloud_bridge_request", { request_nonce: request.headers.get("x-bridge-nonce") ?? "" });
  if (error || !claimed) return new Response(null, { status: 409, headers: noStore });
  let data: unknown;
  try { data = JSON.parse(body); } catch { return new Response(null, { status: 400 }); }
  // Headers are replaced only AFTER signature verification. Existing local IP limits
  // and origin checks then run in this request's own context, without global state.
  const origin = new URL(request.url).origin;
  const action = request.headers.get("x-bridge-action");
  const ip = request.headers.get("x-bridge-ip") ?? "onbekend";
  // Incoming headers are immutable on the edge runtime; supply request-scoped replacements instead.
  const vervangen = { origin, host: new URL(origin).host, referer: origin, "cf-connecting-ip": ip, "x-forwarded-for": ip };
  const { withBridgeHeaders } = await import("./bridgeHeaders.server");
  const metKoppen = <T,>(run: () => Promise<T>) => withBridgeHeaders(vervangen, run);
  let result: unknown;
  switch (action) {
    case "deelname": result = await metKoppen(async () => (await import("./onderzoek.functions")).meldAanVoorOnderzoek({ data })); break;
    case "melding": result = await metKoppen(async () => (await import("./onderzoek.functions")).meldTekenbeetGemeld({ data })); break;
    case "registratie": result = await metKoppen(async () => (await import("./registratie.functions")).slaTekenbeetRegistratieOp({ data })); break;
    case "contact": result = await metKoppen(async () => (await import("./contact.functions")).verstuurContact({ data })); break;
    case "optout": result = await metKoppen(async () => (await import("./optout.functions")).trekDeelnameIn({ data })); break;
    case "telling": result = await metKoppen(async () => (await import("./telling.functions")).registreerTellingFn({ data })); break;
    case "teekscan": result = await metKoppen(async () => (await import("./teekscan.functions")).scanTeekFn({ data })); break;
    case "beetscan": result = await metKoppen(async () => (await import("./beetscan.functions")).scanBeetplekFn({ data })); break;
    case "assistent": {
      const koppen = new Headers(request.headers);
      for (const [k, v] of Object.entries(vervangen)) koppen.set(k, v);
      return metKoppen(async () => (await import("./assistent-ai.server")).handleAssistent(new Request(new URL("/api/public/assistent", origin), { method: "POST", headers: koppen, body, signal: request.signal })));
    }
    case "status": {
      const { error: dbError } = await supabaseAdmin.from("onderzoek_deelnames").select("id", { head: true }).limit(1);
      // Only names of missing settings are reported (never values), and only to signed callers.
      const missing = ["GOOGLE_VERTEX_API_KEY", "LOVABLE_API_KEY", "GOOGLE_MAIL_API_KEY", "GOOGLE_DRIVE_API_KEY", "GOOGLE_SHEETS_API_KEY"].filter((name) => !process.env[name]);
      const ready = !dbError && missing.length === 0;
      if (dbError) console.error("bridge status db check failed", dbError.code, dbError.message);
      return Response.json({ ok: ready, database: !dbError, missing }, { status: ready ? 200 : 503, headers: noStore });
    }
    default: return new Response(null, { status: 400 });
  }
  return Response.json(result, { headers: noStore });
}