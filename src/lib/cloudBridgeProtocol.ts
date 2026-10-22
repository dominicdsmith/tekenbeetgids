export const CLOUD_ACTIONS = ["deelname", "registratie", "melding", "contact", "optout", "telling", "teekscan", "beetscan", "assistent", "status"] as const;
export type CloudAction = (typeof CLOUD_ACTIONS)[number];
export const BRIDGE_PATH = "/api/public/cloud-backend";
export const MAX_BRIDGE_BYTES = 8_100_000;

export async function signBridgeRequest(secret: string, action: string, timestamp: string, nonce: string, body: string, ip: string) {
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign", "verify"]);
  const payload = JSON.stringify([action, timestamp, nonce, body, ip]);
  return { key, payload: new TextEncoder().encode(payload) };
}

export async function bridgeSignature(secret: string, action: string, timestamp: string, nonce: string, body: string, ip: string) {
  const { key, payload } = await signBridgeRequest(secret, action, timestamp, nonce, body, ip);
  const signature = await crypto.subtle.sign("HMAC", key, payload);
  return Array.from(new Uint8Array(signature), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

export async function verifyBridgeSignature(secret: string, headers: Headers, body: string, now = Date.now()) {
  const action = headers.get("x-bridge-action") ?? "";
  const timestamp = headers.get("x-bridge-time") ?? "";
  const nonce = headers.get("x-bridge-nonce") ?? "";
  const signature = headers.get("x-bridge-signature") ?? "";
  const ip = headers.get("x-bridge-ip") ?? "";
  if (!CLOUD_ACTIONS.some((allowed) => allowed === action) || !/^\d{13}$/.test(timestamp) || Math.abs(now - Number(timestamp)) > 60_000 || !/^[0-9a-f-]{36}$/.test(nonce) || !/^[0-9a-f]{64}$/.test(signature) || ip.length > 100) return false;
  const { key, payload } = await signBridgeRequest(secret, action, timestamp, nonce, body, ip);
  const bytes = Uint8Array.from(signature.match(/.{2}/g) ?? [], (byte) => parseInt(byte, 16));
  return crypto.subtle.verify("HMAC", key, bytes, payload);
}

export function cloudBackendUrl(value: string) {
  const url = new URL(value);
  if (url.protocol !== "https:" || url.username || url.password || url.search || url.hash || url.pathname !== "/" || url.hostname === "localhost" || url.hostname.endsWith(".run.app")) throw new Error("Ongeldig adres van de bronadministratie");
  return new URL(BRIDGE_PATH, url);
}
