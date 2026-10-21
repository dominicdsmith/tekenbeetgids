import { supabaseAdmin } from "@/integrations/supabase/client.server";

export type TellingInvoer = {
  datum?: string | null | undefined;
  provincieId?: string | null | undefined;
  plaats?: string | null | undefined;
  soort?: string | null | undefined;
  bron?: string | null | undefined;
};

/**
 * Legt één tekenbeet vast in de actieve telling: datum, locatie en tekensoort.
 * Er worden geen persoonsgegevens opgeslagen.
 */
export async function registreerTelling(invoer: TellingInvoer): Promise<{ ok: boolean }> {
  const nu = new Date();
  const ruw = (invoer.datum ?? "").trim();
  const datum = /^\d{4}-\d{2}-\d{2}$/.test(ruw) ? new Date(`${ruw}T12:00:00Z`) : nu;
  const geldig = !Number.isNaN(datum.getTime()) && datum.getUTCFullYear() >= 2000 && datum <= nu ? datum : nu;

  const { error } = await supabaseAdmin.from("tekenbeet_tellingen").insert({
    datum: geldig.toISOString().slice(0, 10),
    maand: geldig.getUTCMonth() + 1,
    jaar: geldig.getUTCFullYear(),
    provincie_id: invoer.provincieId?.trim() || null,
    plaats: invoer.plaats?.trim().slice(0, 80) || null,
    soort: invoer.soort?.trim().slice(0, 60) || null,
    bron: invoer.bron?.trim().slice(0, 30) || "scan",
  });
  if (error) return { ok: false };
  return { ok: true };
}
