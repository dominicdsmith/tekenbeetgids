import { bridgeHeader } from "./bridgeHeaders.server";
import { getRequest } from "@tanstack/react-start/server";
import { z } from "zod";
import { maakReferentie, maakVerzoeknummer } from "@/lib/contact-ref";

export const contactSchema = z.object({
  naam: z.string().trim().min(2, "Naam is te kort").max(100, "Naam is te lang").regex(/^[\p{L}\p{M}'’\-. ]+$/u, "Naam bevat ongeldige tekens"),
  email: z.string().trim().email("Ongeldig e-mailadres").max(255),
  onderwerp: z.string().trim().min(3, "Onderwerp is te kort").max(150, "Onderwerp is te lang"),
  bericht: z.string().trim().min(10, "Bericht is te kort").max(2000, "Bericht is te lang"),
  website: z.string().max(0).optional().default(""),
  geopendOp: z.number().int().positive(),
  somA: z.number().int().min(2).max(8),
  somB: z.number().int().min(1).max(8),
  somAntwoord: z.number().int().min(3).max(16),
  soort: z.enum(["algemeen", "data", "correctie", "privacyverzoek", "privacyklacht", "overig"]).optional().default("algemeen"),
  bewaren: z.boolean().optional().default(false),
  taal: z.enum(["nl", "en"]).optional().default("nl"),
});

export type ContactInvoer = z.input<typeof contactSchema>;

const striptControl = (s: string) => s.replace(/[\u0000-\u001F\u007F]/g, " ").replace(/\s+/g, " ").trim();
const striptRegels = (s: string) => s.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "").trim();
const SPAM_TERMEN = /\b(viagra|cialis|casino|porn|sex ?cam|crypto ?(pump|signal)|bitcoin ?(profit|invest)|forex|seo ?service|backlinks?|loan offer|payday|escort|replica watch|betting|bet ?now)\b/i;

async function hashIp(ip: string) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(`trk-contact:${ip}`));
  return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, "0")).join("");
}

async function hashEmail(email: string) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(`trk-mail:${email}`));
  return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, "0")).join("");
}

function isSpamInhoud(onderwerp: string, bericht: string) {
  const geheel = `${onderwerp}\n${bericht}`;
  const links = geheel.match(/https?:\/\/|www\.|\[url|<a\s/gi)?.length ?? 0;
  const letters = geheel.replace(/[^A-Za-z]/g, "");
  const teVeelHoofdletters = letters.length > 40 && letters.replace(/[^A-Z]/g, "").length / letters.length > 0.7;
  const nauwelijksTekst = links > 0 && bericht.replace(/https?:\/\/\S+/gi, "").trim().length < 15;
  return links >= 3 || SPAM_TERMEN.test(geheel) || /<\s*(script|iframe|object|embed)/i.test(geheel) || teVeelHoofdletters || nauwelijksTekst;
}

export async function verwerkContact(data: z.output<typeof contactSchema>) {
  if (data.website) return { ok: true as const, reden: "spam" as const };
  if (data.somAntwoord !== data.somA + data.somB) return { ok: false as const, reden: "controle" as const };
  // Tijdcontrole: te snel ingevuld wijst op een bot, een heel oud formulier op een hergebruikt script.
  const invulTijd = Date.now() - data.geopendOp;
  if (!Number.isFinite(invulTijd) || invulTijd < 4_000 || invulTijd > 6 * 60 * 60_000) {
    return { ok: false as const, reden: "tempo" as const };
  }
  if (isSpamInhoud(data.onderwerp, data.bericht)) return { ok: false as const, reden: "spam_inhoud" as const };

  const forwarded = bridgeHeader("x-forwarded-for") ?? "";
  const ip = forwarded.split(",")[0]?.trim() || bridgeHeader("cf-connecting-ip") || bridgeHeader("x-real-ip") || "onbekend";
  const ipHash = await hashIp(ip);
  const userAgent = (getRequest().headers.get("user-agent") ?? "").slice(0, 300);
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const nu = new Date();

  const { data: rl, error: rateError } = await supabaseAdmin
    .from("contact_rate_limit")
    .select("ip_hash, window_start, aantal")
    .eq("ip_hash", ipHash)
    .maybeSingle();
  if (rateError) return { ok: false as const, reden: "server" as const };

  if (rl) {
    const verstreken = nu.getTime() - new Date(rl.window_start).getTime();
    const verlopen = verstreken > 60 * 60_000;
    if (!verlopen && rl.aantal >= 5) {
      return { ok: false as const, reden: "limiet" as const, minuten: Math.max(1, Math.ceil((60 * 60_000 - verstreken) / 60_000)) };
    }
  }

  // Dagelijkse bovengrens per afzender, naast het uurvenster hierboven.
  const dagGrens = new Date(nu.getTime() - 24 * 60 * 60_000).toISOString();
  const { count: dagAantal, error: dagError } = await supabaseAdmin
    .from("contact_berichten")
    .select("id", { count: "exact", head: true })
    .eq("ip_hash", ipHash)
    .gte("created_at", dagGrens);
  if (dagError) return { ok: false as const, reden: "server" as const };
  if ((dagAantal ?? 0) >= 10) return { ok: false as const, reden: "limiet" as const, minuten: 60 };

  const naamVolledig = striptControl(data.naam).slice(0, 100);
  const emailVolledig = striptControl(data.email).slice(0, 255).toLowerCase();
  const isPrivacy = data.soort === "privacyklacht" || data.soort === "privacyverzoek";
  const rij = {
    // Alleen klachten en privacymeldingen worden geregistreerd — zonder naam en
    // e-mailadres, uitsluitend onder het incidentnummer en de meldingstekst.
    naam: "",
    email: "",
    onderwerp: striptControl(data.onderwerp).slice(0, 150),
    bericht: striptRegels(data.bericht).slice(0, 2000),
    ip_hash: ipHash,
    user_agent: userAgent,
  };
  const grens = new Date(nu.getTime() - 10 * 60_000).toISOString();
  const { data: recent, error: recentError } = await supabaseAdmin
    .from("contact_berichten")
    .select("bericht")
    .eq("ip_hash", ipHash)
    .gte("created_at", grens)
    .limit(10);
  if (recentError) return { ok: false as const, reden: "server" as const };
  if (recent?.some((r) => r.bericht === rij.bericht)) return { ok: false as const, reden: "dubbel" as const };

  const verlopen = !rl || nu.getTime() - new Date(rl.window_start).getTime() > 60 * 60_000;
  const { error: tellerError } = await supabaseAdmin.from("contact_rate_limit").upsert({
    ip_hash: ipHash,
    window_start: verlopen ? nu.toISOString() : rl.window_start,
    aantal: verlopen ? 1 : rl.aantal + 1,
  });
  if (tellerError) console.error("contact rate-limit teller mislukt", tellerError.message);

  // Alleen privacyklachten en -verzoeken worden geregistreerd in de database —
  // onder incidentnummer en meldingstekst, zonder naam en e-mailadres.
  // Alle andere onderwerpen krijgen alleen een bevestigingsmail met incidentnummer.
  let referentie: string;
  let verzoeknummer: string | undefined;
  if (isPrivacy) {
    const { data: nieuw, error } = await supabaseAdmin.from("contact_berichten").insert(rij).select("id, created_at").single();
    if (error || !nieuw) {
      console.error("contact insert mislukt", error?.message);
      return { ok: false as const, reden: "server" as const };
    }
    referentie = maakReferentie(nieuw.id, nieuw.created_at);
    /* Live-spiegel naar Google (fase B deel 2); mislukken blokkeert de melding niet. */
    try {
      const { spiegelOpslaan } = await import("@/lib/firebase-spiegel.server");
      await spiegelOpslaan("contact_berichten", { ...nieuw, ...rij });
    } catch (e) {
      console.error("Spiegel-koppeling mislukt:", e);
    }

    // Op verzoek óók in het aparte, afgeschermde register met een eigen
    // verzoeknummer (art. 30 AVG) — eveneens zonder naam en e-mailadres.
    if (data.bewaren) {
      const nummer = maakVerzoeknummer(nieuw.created_at);
      const pvRij = {
        verzoeknummer: nummer,
        soort: data.soort === "privacyklacht" ? "klacht" : "verzoek",
        naam: "",
        email: "",
        bericht: rij.bericht,
        taal: data.taal,
        ip_hash: ipHash,
        contact_referentie: referentie,
      };
      const { data: pvNieuw, error: pvError } = await supabaseAdmin.from("privacy_verzoeken").insert(pvRij).select("id, created_at").single();
      if (pvError) console.error("privacyregister insert mislukt", pvError.message);
      else {
        verzoeknummer = nummer;
        /* Live-spiegel naar Google (fase B deel 2); mislukken blokkeert niet. */
        try {
          const { spiegelOpslaan } = await import("@/lib/firebase-spiegel.server");
          await spiegelOpslaan("privacy_verzoeken", { ...pvNieuw, ...pvRij });
        } catch (e) {
          console.error("Spiegel-koppeling mislukt:", e);
        }
      }
    }

    // Anonieme kopie naar de afgeschermde werkomgeving bij Google: klachten → Klachtenregister,
    // verzoeken → Privacyverzoeken. Mislukken blokkeert de melding niet.
    try {
      const { voegMeldingToe: voegMeldingToeAanNextcloud } = await import("@/lib/werkkopie.server");
      await voegMeldingToeAanNextcloud({ referentie, soort: data.soort as "privacyklacht" | "privacyverzoek", onderwerp: rij.onderwerp, bericht: rij.bericht, taal: data.taal, verzoeknummer });
    } catch (e) {
      console.error("Werkkopie-synchronisatie melding mislukt:", e);
    }
  } else {
    // Geen registratie: incidentnummer op basis van een vers willekeurig nummer.
    referentie = maakReferentie(crypto.randomUUID(), nu.toISOString());
  }

  // Bevestigingsmails streng begrenzen, zodat het formulier niet misbruikt kan
  // worden om willekeurige adressen te bestoken:
  // - max. 1 bevestiging per e-mailadres per 24 uur;
  // - max. 30 bevestigingen per dag voor alle afzenders samen (globaal plafond).
  // De beheermail gaat altijd uit; alleen de bevestiging aan de afzender wordt overgeslagen.
  const mailHash = await hashEmail(emailVolledig);
  const { data: mailRls, error: mailRlError } = await supabaseAdmin
    .from("contact_rate_limit")
    .select("ip_hash, window_start, aantal")
    .in("ip_hash", [mailHash, "globaal-bevestiging"]);
  if (mailRlError) return { ok: false as const, reden: "server" as const };
  const mailRl = mailRls?.find((r) => r.ip_hash === mailHash);
  const globaalRl = mailRls?.find((r) => r.ip_hash === "globaal-bevestiging");
  const mailVerlopen = !mailRl || nu.getTime() - new Date(mailRl.window_start).getTime() > 24 * 60 * 60_000;
  const globaalVerlopen = !globaalRl || nu.getTime() - new Date(globaalRl.window_start).getTime() > 24 * 60 * 60_000;
  const stuurBevestiging =
    (mailVerlopen || (mailRl?.aantal ?? 0) < 1) && (globaalVerlopen || (globaalRl?.aantal ?? 0) < 30);
  if (stuurBevestiging) {
    const { error: mailTellerError } = await supabaseAdmin.from("contact_rate_limit").upsert([
      {
        ip_hash: mailHash,
        window_start: mailVerlopen ? nu.toISOString() : mailRl.window_start,
        aantal: mailVerlopen ? 1 : mailRl.aantal + 1,
      },
      {
        ip_hash: "globaal-bevestiging",
        window_start: globaalVerlopen ? nu.toISOString() : globaalRl.window_start,
        aantal: globaalVerlopen ? 1 : globaalRl.aantal + 1,
      },
    ]);
    if (mailTellerError) console.error("mail rate-limit teller mislukt", mailTellerError.message);
  }

  const { verstuurContactMail } = await import("@/lib/contact-mail.server");
  const gemaild = await verstuurContactMail({
    naam: naamVolledig,
    email: emailVolledig,
    onderwerp: rij.onderwerp,
    bericht: rij.bericht,
    referentie,
    taal: data.taal,
    bevestiging: stuurBevestiging,
    ...(verzoeknummer ? { verzoeknummer } : {}),
  });

  return { ok: true as const, reden: isPrivacy ? ("opgeslagen" as const) : ("alleen_mail" as const), referentie, verzoeknummer, gemaild };
}

export async function leesPrivacyVerzoeken(context: { supabase: any; userId: string }) {
  const { data: isAdmin } = await context.supabase.rpc("has_role", { _user_id: context.userId, _role: "admin" });
  if (!isAdmin) throw new Error("Geen toegang");
  const { data, error } = await context.supabase
    .from("privacy_verzoeken")
    .select("id, verzoeknummer, soort, naam, email, bericht, taal, status, afgehandeld_op, contact_referentie, created_at")
    .order("created_at", { ascending: false })
    .limit(500);
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function leesContactBerichten(context: { supabase: any; userId: string }) {
  const { data: isAdmin } = await context.supabase.rpc("has_role", { _user_id: context.userId, _role: "admin" });
  if (!isAdmin) throw new Error("Geen toegang");
  const { data, error } = await context.supabase
    .from("contact_berichten")
    .select("id, naam, email, onderwerp, bericht, created_at")
    .order("created_at", { ascending: false })
    .limit(500);
  if (error) throw new Error(error.message);
  return data ?? [];
}