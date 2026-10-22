import { getRequest } from "@tanstack/react-start/server";
import { MAX_BRIDGE_BYTES, bridgeSignature, cloudBackendUrl, verifyBridgeSignature, type CloudAction } from "./cloudBridgeProtocol";

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
  const ip = (request.headers.get("cf-connecting-ip") || request.headers.get("x-forwarded-for") || "onbekend").split(",")[0]?.trim().slice(0, 100) ?? "onbekend";
  const response = await fetch(target, {
    method: "POST", redirect: "error", signal: request.signal,
    headers: {
      "Content-Type": "application/json", "x-bridge-action": action,
      "x-bridge-time": timestamp, "x-bridge-nonce": nonce, "x-bridge-ip": ip,
      "x-bridge-signature": await bridgeSignature(secret, action, timestamp, nonce, body, ip),
    }, body,
  });
  if (!response.ok) throw new Error("De bronadministratie is tijdelijk niet bereikbaar");
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
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data: claimed, error } = await (supabaseAdmin as unknown as { rpc: (name: string, args: Record<string, string>) => Promise<{ data: boolean; error: unknown }> }).rpc("claim_cloud_bridge_request", { request_nonce: request.headers.get("x-bridge-nonce") ?? "" });
  if (error || !claimed) return new Response(null, { status: 409, headers: noStore });
  let data: unknown;
  try { data = JSON.parse(body); } catch { return new Response(null, { status: 400 }); }
  const origin = new URL(request.url).origin;
  request.headers.set("origin", origin);
  request.headers.set("host", new URL(origin).host);
  request.headers.set("referer", origin);
  const ip = request.headers.get("x-bridge-ip") ?? "onbekend";
  request.headers.set("cf-connecting-ip", ip);
  request.headers.set("x-forwarded-for", ip);
  const action = request.headers.get("x-bridge-action");
  let result: unknown;
  switch (action) {
    case "deelname": result = await (await import("./onderzoek.functions")).meldAanVoorOnderzoek({ data }); break;
    case "melding": result = await (await import("./onderzoek.functions")).meldTekenbeetGemeld({ data }); break;
    case "registratie": result = await (await import("./registratie.functions")).slaTekenbeetRegistratieOp({ data }); break;
    case "contact": result = await (await import("./contact.functions")).verstuurContact({ data }); break;
    case "optout": result = await (await import("./optout.functions")).trekDeelnameIn({ data }); break;
    case "telling": result = await (await import("./telling.functions")).registreerTellingFn({ data }); break;
    case "teekscan": result = await (await import("./teekscan.functions")).scanTeekFn({ data }); break;
    case "beetscan": result = await (await import("./beetscan.functions")).scanBeetplekFn({ data }); break;
    case "assistent": return (await import("./assistent-ai.server")).handleAssistent(new Request(new URL("/api/public/assistent", origin), { method: "POST", headers: request.headers, body, signal: request.signal }));
    case "status": {
      const { error: dbError } = await supabaseAdmin.from("onderzoek_deelnames").select("id", { head: true }).limit(1);
      const ready = !dbError && ["GOOGLE_VERTEX_API_KEY", "LOVABLE_API_KEY", "GOOGLE_MAIL_API_KEY", "GOOGLE_DRIVE_API_KEY", "GOOGLE_SHEETS_API_KEY"].every((name) => Boolean(process.env[name]));
      return Response.json({ ok: ready }, { status: ready ? 200 : 503, headers: noStore });
    }
    default: return new Response(null, { status: 400 });
  }
  return Response.json(result, { headers: noStore });
}
