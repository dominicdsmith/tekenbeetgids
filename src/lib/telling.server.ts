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

  const rij = {
    datum: geldig.toISOString().slice(0, 10),
    maand: geldig.getUTCMonth() + 1,
    jaar: geldig.getUTCFullYear(),
    provincie_id: invoer.provincieId?.trim() || null,
    plaats: invoer.plaats?.trim().slice(0, 80) || null,
    soort: invoer.soort?.trim().slice(0, 60) || null,
    bron: invoer.bron?.trim().slice(0, 30) || "scan",
  };
  const { data: opgeslagen, error } = await supabaseAdmin.from("tekenbeet_tellingen").insert(rij).select("id, created_at").single();
  if (error) return { ok: false };
  /* Live-spiegel naar Google (fase B deel 2); mislukken blokkeert de telling niet. */
  try {
    const { spiegelOpslaan } = await import("@/lib/firebase-spiegel.server");
    await spiegelOpslaan("tekenbeet_tellingen", { ...opgeslagen, ...rij });
  } catch (e) {
    console.error("Spiegel-koppeling mislukt:", e);
  }
  return { ok: true };
}
