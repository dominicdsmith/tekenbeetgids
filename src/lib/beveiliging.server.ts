import { getRequestHeader } from "@tanstack/react-start/server";

/* Gedeelde beveiligingshulpjes (alleen server). */

function hex(buf: ArrayBuffer) {
  return Array.from(new Uint8Array(buf), (b) => b.toString(16).padStart(2, "0")).join("");
}

function gelijk(a: string, b: string) {
  if (a.length !== b.length) return false;
  let r = 0;
  for (let i = 0; i < a.length; i++) r |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return r === 0;
}

/** Geheime intrekcode bij een deelnamenummer (HMAC met een server-only sleutel). */
export async function maakIntrekcode(deelnamenummer: string) {
  const geheim = process.env["SUPABASE_SERVICE_ROLE_KEY"];
  if (!geheim) throw new Error("Serversleutel ontbreekt");
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(`trk-intrekcode:${geheim}`),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(deelnamenummer.toUpperCase()));
  const tekens = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return Array.from(new Uint8Array(sig).slice(0, 10), (b) => tekens[b % tekens.length]).join("");
}

export async function controleerIntrekcode(deelnamenummer: string, code: string | undefined | null) {
  if (!code) return false;
  const verwacht = await maakIntrekcode(deelnamenummer);
  return gelijk(verwacht, code.trim().toUpperCase().replace(/[^A-Z0-9]/g, ""));
}

/** Uurlimiet per (gehasht) IP-adres voor een bepaalde actie. */
export async function binnenLimiet(actie: string, maxPerUur: number, ipOverride?: string) {
  const kop = getRequestHeader("cf-connecting-ip") || getRequestHeader("x-forwarded-for") || getRequestHeader("x-real-ip") || "onbekend";
  const uitKop = kop.split(",")[0]?.trim() || "onbekend";
  const ip = ipOverride ?? uitKop;
  const ipHash = hex(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(`trk-${actie}:${ip}`)));
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const nu = new Date();
  const { data: rl } = await supabaseAdmin
    .from("contact_rate_limit")
    .select("ip_hash, window_start, aantal")
    .eq("ip_hash", ipHash)
    .maybeSingle();
  const verlopen = !rl || nu.getTime() - new Date(rl.window_start).getTime() > 60 * 60_000;
  if (!verlopen && rl!.aantal >= maxPerUur) return false;
  await supabaseAdmin.from("contact_rate_limit").upsert({
    ip_hash: ipHash,
    window_start: verlopen ? nu.toISOString() : rl!.window_start,
    aantal: verlopen ? 1 : rl!.aantal + 1,
  });
  return true;
}

/** Controleert het geheime token van de geplande taken. */
export async function isGeldigeCronAanroep(request: Request) {
  const token = request.headers.get("x-cron-token") ?? "";
  if (token.length < 32) return false;
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data } = await (supabaseAdmin as unknown as {
    from: (t: string) => { select: (c: string) => { eq: (k: string, v: string) => { maybeSingle: () => Promise<{ data: { waarde: string } | null }> } } };
  })
    .from("interne_sleutels")
    .select("waarde")
    .eq("naam", "cron")
    .maybeSingle();
  return Boolean(data?.waarde) && gelijk(data!.waarde, token);
}

/** Daglimiet per (gehasht) IP-adres voor een bepaalde actie. */
export async function binnenDagLimiet(actie: string, maxPerDag: number, ipOverride?: string) {
  const kop = getRequestHeader("cf-connecting-ip") || getRequestHeader("x-forwarded-for") || getRequestHeader("x-real-ip") || "onbekend";
  const uitKop = kop.split(",")[0]?.trim() || "onbekend";
  const ip = ipOverride ?? uitKop;
  const ipHash = hex(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(`trk-dag-${actie}:${ip}`)));
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const nu = new Date();
  const { data: rl } = await supabaseAdmin
    .from("contact_rate_limit")
    .select("ip_hash, window_start, aantal")
    .eq("ip_hash", ipHash)
    .maybeSingle();
  const verlopen = !rl || nu.getTime() - new Date(rl.window_start).getTime() > 24 * 60 * 60_000;
  if (!verlopen && rl!.aantal >= maxPerDag) return false;
  await supabaseAdmin.from("contact_rate_limit").upsert({
    ip_hash: ipHash,
    window_start: verlopen ? nu.toISOString() : rl!.window_start,
    aantal: verlopen ? 1 : rl!.aantal + 1,
  });
  return true;
}

/** Alleen aanroepen vanaf de eigen website toestaan (geen proxy voor vreemde sites/scripts). */
export function zelfdeHerkomst(): boolean {
  const host = getRequestHeader("host") ?? "";
  const bron = getRequestHeader("origin") ?? getRequestHeader("referer") ?? "";
  if (!host || !bron) return false;
  try {
    return new URL(bron).host === host;
  } catch {
    return false;
  }
}

/** Fotoscan: per bezoeker max 1/uur en 2/dag, en voor alle bezoekers samen max 10/uur en 40/dag (kostenplafond). */
export async function fotoscanToegestaan() {
  if (!(await binnenLimiet("fotoscan", 1))) return false;
  if (!(await binnenDagLimiet("fotoscan", 2))) return false;
  if (!(await binnenLimiet("fotoscan-totaal", 10, "alle-bezoekers"))) return false;
  return binnenDagLimiet("fotoscan-totaal", 40, "alle-bezoekers");
}

/** Stabiele vingerafdruk van een geüploade foto (voor de scan-cache). */
export async function fotoscanHash(afbeelding: string) {
  return hex(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(afbeelding)));
}

type FotoscanCacheRij = { resultaat: unknown; created_at: string };

/** Geeft een eerder scanresultaat voor dezelfde foto terug (max 24 uur oud), zodat de AI niet opnieuw wordt aangeroepen. */
export async function fotoscanCacheOphalen(hash: string, soort: string, taal: string) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data } = await (supabaseAdmin as unknown as {
    from: (t: string) => {
      select: (c: string) => {
        eq: (k: string, v: string) => {
          eq: (k: string, v: string) => {
            eq: (k: string, v: string) => { maybeSingle: () => Promise<{ data: FotoscanCacheRij | null }> };
          };
        };
      };
    };
  })
    .from("fotoscan_cache")
    .select("resultaat, created_at")
    .eq("hash", hash)
    .eq("soort", soort)
    .eq("taal", taal)
    .maybeSingle();
  if (!data) return null;
  if (soort !== "access" && Date.now() - new Date(data.created_at).getTime() > 24 * 60 * 60_000) return null;
  return data.resultaat;
}

/** Bewaart een scanresultaat zodat een herhaalde upload van dezelfde foto geen nieuwe AI-aanroep kost. */
export async function fotoscanCacheOpslaan(hash: string, soort: string, taal: string, resultaat: unknown) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  await (supabaseAdmin as unknown as {
    from: (t: string) => { upsert: (r: Record<string, unknown>) => Promise<unknown> };
  })
    .from("fotoscan_cache")
    // Access blocks must survive the daily 24-hour cache cleanup. Only an
    // explicit publisher action after restoring access may remove this row.
    .upsert({ hash, soort, taal, resultaat, created_at: soort === "access" ? "9999-01-01T00:00:00.000Z" : new Date().toISOString() });
}
