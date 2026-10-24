import { MIGRATIE_DATABASE } from "./firebase-migratie";
import { maakSpiegelTransport } from "./firebase-spiegel.server";
import { beoordeelTaak, leesTaakDocument, taakDocument, type TaakRij, type TaakStatus } from "./google-taakstatus";

/** Leest de taakstatus uit de huidige planner en legt die vast bij Google. Taken zelf blijven ongewijzigd. */
export async function synchroniseerTaakstatus(): Promise<TaakStatus[]> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await supabaseAdmin.rpc("taakstatus_overzicht");
  if (error) throw new Error("Taakstatus niet leesbaar");
  const nu = new Date().toISOString();
  const taken = ((data ?? []) as TaakRij[]).map(r => beoordeelTaak(r, nu));
  const transport = maakSpiegelTransport();
  if (!transport) throw new Error("Google-verbinding ontbreekt");
  await transport(`${MIGRATIE_DATABASE}/documents:commit`, {
    method: "POST",
    body: JSON.stringify({ writes: taken.map(t => ({ update: taakDocument(t) })) }),
  });
  return taken;
}

/** Leest de bij Google vastgelegde taakstatus. */
export async function leesTaakstatusGoogle(): Promise<TaakStatus[]> {
  const transport = maakSpiegelTransport();
  if (!transport) throw new Error("Google-verbinding ontbreekt");
  const page = await transport(`${MIGRATIE_DATABASE}/documents/taakstatus?pageSize=100`) as {
    documents?: { fields: Record<string, never> }[];
  };
  return (page.documents ?? []).map(d => leesTaakDocument(d.fields)).sort((a, b) => a.taak.localeCompare(b.taak));
}
