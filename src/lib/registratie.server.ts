import { getRequestHeader } from "@tanstack/react-start/server";
import { z } from "zod";
import type { Json } from "@/integrations/supabase/types";

const registratieSchema = z.object({
  overzicht: z.string().trim().min(20).max(30000),
  gegevens: z.record(z.string(), z.unknown()).refine((value) => JSON.stringify(value).length <= 60000, "Registratie is te groot"),
  taal: z.enum(["nl", "en"]),
  /* Opslag gebeurt alleen na toestemming; het deelnamenummer is dan al toegekend. */
  nummer: z.string().trim().regex(/^TRK-\d{4}-[A-Z0-9]{6}$/),
  intrekcode: z.string().trim().min(6).max(40),
});

export type RegistratieInvoer = z.input<typeof registratieSchema>;
export type TekenbeetRegistratie = {
  id: string;
  created_at: string;
  registratienummer: string;
  taal: string;
  overzicht: string;
  gegevens: Record<string, Json>;
};

async function hashIp(ip: string) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(`tbg-registratie:${ip}`));
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

function maakRegistratienummer() {
  const tekens = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = crypto.getRandomValues(new Uint8Array(8));
  return `TBG-${new Date().getFullYear()}-${Array.from(bytes, (byte) => tekens[byte % tekens.length]).join("")}`;
}

export async function bewaarRegistratie(data: z.output<typeof registratieSchema>) {
  /* Alleen opslaan met een geldig deelnamenummer + bijbehorende geheime intrekcode. */
  const { controleerIntrekcode } = await import("@/lib/beveiliging.server");
  if (!(await controleerIntrekcode(data.nummer, data.intrekcode))) return { ok: false as const, reden: "geweigerd" as const };
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data: deelname } = await supabaseAdmin
    .from("onderzoek_deelnames")
    .select("deelnamenummer")
    .eq("deelnamenummer", data.nummer)
    .maybeSingle();
  if (!deelname) return { ok: false as const, reden: "geweigerd" as const };
  const { count: bestaand } = await supabaseAdmin
    .from("tekenbeet_registraties")
    .select("id", { count: "exact", head: true })
    .like("registratienummer", `${data.nummer}%`);
  if ((bestaand ?? 0) >= 3) return { ok: false as const, reden: "limiet" as const };
  const ip = (getRequestHeader("cf-connecting-ip") || getRequestHeader("x-forwarded-for") || "").split(",")[0]?.trim() ?? "";
  const ipHash = ip ? await hashIp(ip) : null;

  if (ipHash) {
    const sinds = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const { count } = await supabaseAdmin
      .from("tekenbeet_registraties")
      .select("id", { count: "exact", head: true })
      .eq("ip_hash", ipHash)
      .gte("created_at", sinds);
    if ((count ?? 0) >= 10) return { ok: false as const, reden: "limiet" as const };
  }

  const gegevens = data.gegevens as Record<string, never>;
  for (let poging = 0; poging < 5; poging += 1) {
    const registratienummer = poging === 0 ? data.nummer : `${data.nummer}-${maakRegistratienummer().slice(-4)}`;
    const { error } = await supabaseAdmin.from("tekenbeet_registraties").insert({
      registratienummer,
      taal: data.taal,
      overzicht: data.overzicht,
      gegevens,
      ip_hash: ipHash,
    });
    if (!error) return { ok: true as const, registratienummer };
    if (error.code !== "23505") return { ok: false as const, reden: "opslag" as const };
  }
  return { ok: false as const, reden: "opslag" as const };
}

export async function leesRegistraties(context: { supabase: any; userId: string }) {
  const { data: isAdmin } = await context.supabase.rpc("has_role", { _user_id: context.userId, _role: "admin" });
  if (!isAdmin) throw new Error("Geen toegang");
  const { data, error } = await context.supabase
    .from("tekenbeet_registraties")
    .select("id, created_at, registratienummer, taal, overzicht, gegevens")
    .order("created_at", { ascending: false })
    .limit(5000);
  if (error) throw new Error(error.message);
  return (data ?? []).map((row: { id: string; created_at: string; registratienummer: string; taal: string; overzicht: string; gegevens: Json }) => ({
    ...row,
    gegevens: row.gegevens && typeof row.gegevens === "object" ? row.gegevens : {},
  })) as TekenbeetRegistratie[];
}
