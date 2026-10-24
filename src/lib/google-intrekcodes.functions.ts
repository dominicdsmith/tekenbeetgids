import { createServerFn } from "@tanstack/react-start";
import { setResponseHeader } from "@tanstack/react-start/server";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { controleerMigratieBeheer } from "./firebase-migratie";

export const zetOudeIntrekcodesOver = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ bevestigd: z.literal(true) }).strict().parse(input))
  .handler(async ({ context }) => {
    const { data: admin, error } = await context.supabase.rpc("has_role", { _user_id: context.userId, _role: "admin" });
    controleerMigratieBeheer(admin, error);
    setResponseHeader("Cache-Control", "no-store");
    const { maakMigratieTransport } = await import("./firebase-migratie.server");
    const { maakIntrekcode } = await import("./beveiliging.server");
    const { migreerCode, verifieerGoogleCode } = await import("./google-intrekcodes");
    const transport = maakMigratieTransport();
    const { count, error: telFout } = await context.supabase.from("onderzoek_deelnames").select("id", { count: "exact", head: true });
    if (telFout || count === null) throw new Error("Brontelling niet beschikbaar");
    let gecontroleerd = 0;
    for (let vanaf = 0; vanaf < count; vanaf += 100) {
      const { data: records, error: leesFout } = await context.supabase.from("onderzoek_deelnames").select("id, deelnamenummer").order("id", { ascending: true }).range(vanaf, Math.min(vanaf + 99, count - 1));
      if (leesFout || records?.length !== Math.min(100, count - vanaf)) throw new Error("Bron gewijzigd; code-overzet niet afgerond");
      for (const rij of records) {
        const code = await maakIntrekcode(rij.deelnamenummer);
        await migreerCode(transport, rij.deelnamenummer, rij.id, code);
        if (!(await verifieerGoogleCode(transport, rij.deelnamenummer, code))) throw new Error("Google-codecontrole niet geslaagd");
        gecontroleerd++;
      }
    }
    const { count: na, error: naFout } = await context.supabase.from("onderzoek_deelnames").select("id", { count: "exact", head: true });
    if (naFout || na !== count) throw new Error("Bron gewijzigd tijdens overzet; eindcontrole opnieuw uitvoeren");
    return { gecontroleerd, omgeschakeld: false };
  });