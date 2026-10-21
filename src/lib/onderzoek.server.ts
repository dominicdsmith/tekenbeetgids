import { getRequestHeader } from "@tanstack/react-start/server";
import { z } from "zod";
import type { Json } from "@/integrations/supabase/types";

/* Deelname aan onderzoek: gepseudonimiseerde opslag van de ingevulde TekenbeetGids-gegevens. */
export const onderzoekSchema = z.object({
  rapport: z.string().trim().min(20, "Rapport ontbreekt").max(20000, "Rapport is te lang"),
  gegevens: z.record(z.string(), z.unknown()).default({}),
  advies: z.object({ titel: z.string().max(500), tekst: z.string().max(5000) }).optional(),
  taal: z.enum(["nl", "en"]).default("nl"),
});

export type OnderzoekInvoer = z.input<typeof onderzoekSchema>;

export type OnderzoekDeelname = {
  id: string;
  created_at: string;
  deelnamenummer: string;
  taal: string;
  rapport: string;
  gegevens: Record<string, Json>;
  ip_hash: string | null;
  status: string;
  gemeld_op: string | null;
};

/* Status na het drukken op de meldknop van Tekenradar. */
export const meldingSchema = z.object({
  deelnamenummer: z.string().trim().regex(/^TRK-\d{4}-[A-Z0-9]{6}$/, "Ongeldig deelnamenummer"),
  intrekcode: z.string().trim().min(6).max(20),
});

export async function markeerTekenbeetGemeld(data: z.output<typeof meldingSchema>) {
  const { controleerIntrekcode } = await import("@/lib/beveiliging.server");
  if (!(await controleerIntrekcode(data.deelnamenummer, data.intrekcode))) return { ok: false as const };
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const gemeldOp = new Date().toISOString();
  const { error } = await supabaseAdmin
    .from("onderzoek_deelnames")
    .update({ status: "Tekenbeet gemeld", gemeld_op: gemeldOp })
    .eq("deelnamenummer", data.deelnamenummer);
  if (error) return { ok: false as const };
  /* Synchroniseer de status ook naar de gekoppelde werkkopie (afgeschermde werkomgeving bij Google); mislukken blokkeert niet. */
  try {
    const { werkDeelnameStatusBij: werkNextcloudStatusBij } = await import("@/lib/werkkopie.server");
    await werkNextcloudStatusBij(data.deelnamenummer, gemeldOp);
  } catch (e) {
    console.error("Werkkopie-statusbijwerking mislukt:", e);
  }
  return { ok: true as const, status: "Tekenbeet gemeld" as const };
}

async function hashIp(ip: string) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(`trk-onderzoek:${ip}`));
  return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, "0")).join("");
}

/* Uniek, niet naar een persoon herleidbaar deelnamenummer: TRK-JJJJ-XXXXXX */
function maakDeelnamenummer() {
  const tekens = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = crypto.getRandomValues(new Uint8Array(6));
  const staart = Array.from(bytes, (b) => tekens[b % tekens.length]).join("");
  return `TRK-${new Date().getFullYear()}-${staart}`;
}

export async function bewaarDeelname(data: z.output<typeof onderzoekSchema>) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const ip = (getRequestHeader("cf-connecting-ip") || getRequestHeader("x-forwarded-for") || "").split(",")[0]?.trim();
  const ipHash = ip ? await hashIp(ip) : null;
  const gegevens = { ...data.gegevens, advies: data.advies ?? null } as unknown as Record<string, never>;

  for (let poging = 0; poging < 5; poging++) {
    const deelnamenummer = maakDeelnamenummer();
    const { error } = await supabaseAdmin
      .from("onderzoek_deelnames")
      .insert({ deelnamenummer, rapport: data.rapport, gegevens, taal: data.taal, ip_hash: ipHash });
    if (!error) {
      /* Kopie naar de gekoppelde werkkopie (afgeschermde werkomgeving bij Google); mislukken hiervan blokkeert de deelname niet. */
      try {
        await voegToeAanNextcloud(deelnamenummer, data);
      } catch (e) {
        console.error("Werkkopie-koppeling mislukt:", e);
      }
      try {
        const { verstuurBeheerMelding } = await import("@/lib/contact-mail.server");
        await verstuurBeheerMelding(`Nieuwe onderzoeksdeelname ${deelnamenummer}`, [
          `Er is een nieuwe onderzoeksdeelname opgeslagen.`,
          `Deelnamenummer: ${deelnamenummer}`,
          `Taal: ${data.taal}`,
        ]);
      } catch (e) {
        console.error("beheermelding deelname mislukt", e);
      }
      const { maakIntrekcode } = await import("@/lib/beveiliging.server");
      return { ok: true as const, deelnamenummer, intrekcode: await maakIntrekcode(deelnamenummer) };
    }
    if (error.code !== "23505") return { ok: false as const, reden: "opslag" as const };
  }
  return { ok: false as const, reden: "opslag" as const };
}

/* ---- Werkkopie-koppeling: één rij per deelname, gekoppeld op kolomtitel. ---- */
type G = Record<string, unknown>;
const tekst = (v: unknown) => (v === null || v === undefined ? "" : String(v));
const lijst = (v: unknown) => (Array.isArray(v) ? v.map(tekst).filter(Boolean).join("; ") : tekst(v));

async function voegToeAanNextcloud(deelnamenummer: string, data: z.output<typeof onderzoekSchema>) {
  const g = data.gegevens as G;
  const toestemming = (g["toestemming"] ?? {}) as G;
  const scan = (g["scan"] ?? {}) as G;
  const teekScan = (g["teekScan"] ?? {}) as G;
  const beetDatums = Array.isArray(g["beetDatums"]) ? (g["beetDatums"] as unknown[]) : [];
  const nationaliteit = tekst(g["nationaliteit"]) === "anders" && g["nationaliteitAnders"]
    ? `anders: ${tekst(g["nationaliteitAnders"])}`
    : tekst(g["nationaliteit"]);

  const waarden: Record<string, string> = {
    "Deelnamenummer": deelnamenummer,
    "Datum/tijd deelname (UTC)": new Date().toISOString(),
    "Taal": data.taal,
    "Consent: akkoord": toestemming["akkoord"] ? "ja" : "",
    "Consent: akkoord op (ISO)": tekst(toestemming["akkoordOp"]),
    "Consent: verklaring": tekst(toestemming["verklaring"]),
    "Consent: volledige tekst": lijst(toestemming["teksten"]),
    "Rapport huisarts (volledig)": data.rapport,
    "Teek vast (ja/nee)": tekst(g["vast"]),
    "Tekensoort": tekst(g["soort"]),
    "Uiterlijk teek": tekst(g["uiterlijk"]),
    "Hoe lang vastgezeten": tekst(g["duur"]),
    "Wanneer verwijderd": tekst(g["verwijderd"]),
    "Provincie": tekst(g["provincie"]),
    "Omgeving": lijst(g["omgeving"]),
    "Weer": lijst(g["weer"]),
    "Klachten": lijst(g["klachten"]),
    "Bijzonderheden": lijst(g["bijzonder"]),
    "Datum beet (JJJJ-MM)": tekst(g["datum"]),
    "Scan beetplek: resultaat": tekst(scan["titel"]),
    "Scan beetplek: zekerheid": tekst(scan["zekerheid"]),
    "Scan teek: resultaat": tekst(teekScan["titel"]),
    "Scan teek: zekerheid": tekst(teekScan["zekerheid"]),
    "Aantal foto's beetplek": tekst(g["aantalFotosBeetplek"]),
    "Aantal foto's teek": tekst(g["aantalFotosTeek"]),
    "Eerste tekenbeet (ja/nee/onbekend)": tekst(g["eerste"]),
    "Aantal eerdere beten": tekst(g["aantalBeten"]),
    "Leeftijd": tekst(g["leeftijd"]),
    "Geslacht": tekst(g["geslacht"]),
    "Woonplaats (type)": tekst(g["woonplaats"]),
    "Afkomst": tekst(g["afkomst"]),
    "Nationaliteit": nationaliteit,
    "Opleiding": tekst(g["opleiding"]),
    "Bewijs deelname (PDF aangemaakt)": "ja",
    "Status": "Ingediend",
  };
  beetDatums.slice(0, 10).forEach((d, i) => {
    waarden[`Datum beet ${i + 1} (JJJJ-MM)`] = tekst(d);
  });

  const { voegDeelnameToe: voegToe } = await import("@/lib/werkkopie.server");
  await voegToe(waarden);
}

/* Alleen beheerders mogen deelnemersgegevens inzien. */
export async function leesOnderzoekDeelnames(context: { supabase: any; userId: string }) {
  const { data: isAdmin } = await context.supabase.rpc("has_role", { _user_id: context.userId, _role: "admin" });
  if (!isAdmin) throw new Error("Geen toegang");
  const { data, error } = await context.supabase
    .from("onderzoek_deelnames")
    .select("id, created_at, deelnamenummer, taal, rapport, gegevens, ip_hash, status, gemeld_op")
    .order("created_at", { ascending: false })
    .limit(5000);
  if (error) throw new Error(error.message);
  return (data ?? []).map((r: Record<string, unknown>) => ({
    ...r,
    gegevens: (r["gegevens"] && typeof r["gegevens"] === "object" ? r["gegevens"] : {}) as Record<string, Json>,
  })) as OnderzoekDeelname[];
}
