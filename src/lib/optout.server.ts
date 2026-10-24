import { bridgeHeader } from "./bridgeHeaders.server";
import { z } from "zod";

/**
 * Intrekken van deelname aan onderzoek (opt-out).
 * Beveiligd op dezelfde manier als het contactformulier: honeypot, tijdcontrole,
 * rekensom en een uurlimiet per (gehasht) IP-adres. Er zijn geen persoonsgegevens
 * nodig: alleen het unieke deelnamenummer dat de deelnemer zelf heeft bewaard.
 */
export const optOutSchema = z.object({
  deelnamenummer: z
    .string()
    .trim()
    .toUpperCase()
    .regex(/^TRK-\d{4}-[A-Z0-9]{6}$/, "Ongeldig deelnamenummer"),
  intrekcode: z.string().trim().max(20).optional().default(""),
  toelichting: z.string().trim().max(500).optional().default(""),
  website: z.string().max(0).optional().default(""),
  geopendOp: z.number().int().positive(),
  somA: z.number().int().min(2).max(8),
  somB: z.number().int().min(1).max(8),
  somAntwoord: z.number().int().min(3).max(16),
});

export type OptOutInvoer = z.input<typeof optOutSchema>;

const MAIL_GATEWAY = "https://connector-gateway.lovable.dev/google_mail/gmail/v1";
const ONTVANGER = "noreply@tekenbeetgids.nl";

async function hashIp(ip: string) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(`trk-optout:${ip}`));
  return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, "0")).join("");
}

function base64url(bytes: Uint8Array) {
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

/* Verwijdert de rij van dit deelnamenummer uit de gekoppelde werkkopie (afgeschermde werkomgeving bij Google). */
async function wisKopieRij(deelnamenummer: string) {
  const { wisDeelname: wisNextcloudRij } = await import("@/lib/werkkopie.server");
  await wisNextcloudRij(deelnamenummer);
}

async function meldOptOut(deelnamenummer: string, toelichting: string, verwijderd: { onderzoek: number; registratie: number }) {
  const lovableKey = process.env["LOVABLE_API_KEY"];
  const gmailKey = process.env["GOOGLE_MAIL_API_KEY"];
  if (!lovableKey || !gmailKey) return false;
  const body = [
    "Een deelnemer heeft de deelname aan onderzoek ingetrokken (opt-out).",
    "",
    `Deelnamenummer: ${deelnamenummer}`,
    `Verwijderde onderzoeksdeelnames: ${verwijderd.onderzoek}`,
    `Verwijderde registraties: ${verwijderd.registratie}`,
    `Toelichting: ${toelichting || "-"}`,
    "",
    "— Automatisch gemeld door tekenrisicokaart.nl",
  ].join("\r\n");
  const raw = [
    `To: ${ONTVANGER}`,
    `Subject: [TRK] Deelname ingetrokken (${deelnamenummer})`,
    "MIME-Version: 1.0",
    'Content-Type: text/plain; charset="UTF-8"',
    "Content-Transfer-Encoding: base64",
    "",
    base64url(new TextEncoder().encode(body)).replace(/-/g, "+").replace(/_/g, "/"),
  ].join("\r\n");
  try {
    const res = await fetch(`${MAIL_GATEWAY}/users/me/messages/send`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${lovableKey}`,
        "X-Connection-Api-Key": gmailKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ raw: base64url(new TextEncoder().encode(raw)) }),
    });
    return res.ok;
  } catch (e) {
    console.error("opt-out mail mislukt", e);
    return false;
  }
}

export async function verwerkOptOut(data: z.output<typeof optOutSchema>) {
  if (data.website) return { ok: true as const, reden: "spam" as const, verwijderd: 0 };
  if (data.somAntwoord !== data.somA + data.somB) return { ok: false as const, reden: "controle" as const };
  const invulTijd = Date.now() - data.geopendOp;
  if (!Number.isFinite(invulTijd) || invulTijd < 3_000 || invulTijd > 6 * 60 * 60_000) {
    return { ok: false as const, reden: "tempo" as const };
  }

  const ip =
    (bridgeHeader("cf-connecting-ip") || bridgeHeader("x-forwarded-for") || bridgeHeader("x-real-ip") || "onbekend")
      .split(",")[0]
      ?.trim() || "onbekend";
  const ipHash = await hashIp(ip);
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const nu = new Date();

  /* Uurlimiet: maximaal 5 pogingen per IP, zodat nummers niet kunnen worden geraden. */
  const { data: rl } = await supabaseAdmin
    .from("contact_rate_limit")
    .select("ip_hash, window_start, aantal")
    .eq("ip_hash", ipHash)
    .maybeSingle();
  if (rl) {
    const verstreken = nu.getTime() - new Date(rl.window_start).getTime();
    if (verstreken <= 60 * 60_000 && rl.aantal >= 5) {
      return { ok: false as const, reden: "limiet" as const, minuten: Math.max(1, Math.ceil((60 * 60_000 - verstreken) / 60_000)) };
    }
  }
  const verlopen = !rl || nu.getTime() - new Date(rl.window_start).getTime() > 60 * 60_000;
  await supabaseAdmin.from("contact_rate_limit").upsert({
    ip_hash: ipHash,
    window_start: verlopen ? nu.toISOString() : rl!.window_start,
    aantal: verlopen ? 1 : rl!.aantal + 1,
  });

  const nummer = data.deelnamenummer;
  /* Zonder geldige intrekcode wordt er niets verwijderd; het verzoek gaat ter handmatige controle naar de beheerder. */
  const { controleerIntrekcode } = await import("@/lib/beveiliging.server");
  if (!(await controleerIntrekcode(nummer, data.intrekcode))) {
    const gemeld = await meldOptOut(nummer, `[HANDMATIG CONTROLEREN - geen geldige intrekcode] ${data.toelichting}`, { onderzoek: 0, registratie: 0 });
    return { ok: true as const, reden: "handmatig" as const, verwijderd: 0, gemeld };
  }
  const { data: gewist, error } = await supabaseAdmin
    .from("onderzoek_deelnames")
    .delete()
    .eq("deelnamenummer", nummer)
    .select("id");
  if (error) {
    console.error("opt-out verwijderen mislukt", error.message);
    return { ok: false as const, reden: "server" as const };
  }

  /* De bijbehorende beveiligde registratie draagt hetzelfde nummer (eventueel met achtervoegsel). */
  const { data: gewistReg } = await supabaseAdmin
    .from("tekenbeet_registraties")
    .delete()
    .like("registratienummer", `${nummer}%`)
    .select("id");

  const aantal = (gewist?.length ?? 0) + (gewistReg?.length ?? 0);
  if (aantal === 0) return { ok: false as const, reden: "onbekend" as const };

  try {
    await wisKopieRij(nummer);
  } catch (e) {
    console.error("opt-out kopierij wissen mislukt", e);
  }
  /* Verwijder ook de live-spiegel bij Google (fase B deel 2); mislukken blokkeert de intrekking niet. */
  try {
    const { spiegelWisIntrekking } = await import("@/lib/firebase-spiegel.server");
    await spiegelWisIntrekking(nummer);
  } catch (e) {
    console.error("Spiegel-intrekking mislukt:", e);
  }
  const gemeld = await meldOptOut(nummer, data.toelichting, {
    onderzoek: gewist?.length ?? 0,
    registratie: gewistReg?.length ?? 0,
  });

  return { ok: true as const, reden: "verwijderd" as const, verwijderd: aantal, gemeld };
}
