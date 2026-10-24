import { createServerFn } from "@tanstack/react-start";
import { setResponseHeader } from "@tanstack/react-start/server";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { controleerMigratieBeheer } from "./firebase-migratie";
type JsonWaarde = string | number | boolean | null | JsonWaarde[] | { [key: string]: JsonWaarde };

export const leesGoogleBeheer = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data: admin, error } = await context.supabase.rpc("has_role", { _user_id: context.userId, _role: "admin" });
    controleerMigratieBeheer(admin, error);
    setResponseHeader("Cache-Control", "no-store");
    const { maakMigratieTransport } = await import("./firebase-migratie.server");
    const { leesGoogleMomentopname } = await import("./google-administratie");
    const snapshot = await leesGoogleMomentopname(maakMigratieTransport());
    return { aantallen: snapshot.aantallen, tabellen: Object.fromEntries(Object.entries(snapshot.tabellen)
      .filter(([naam]) => ["deelnames", "registraties", "contact_berichten", "privacy_verzoeken"].includes(naam))
      .map(([naam, rijen]) => [naam, rijen.map(({ ip_hash: _ip, ...rij }) => JSON.parse(JSON.stringify(rij)) as Record<string, JsonWaarde>)])) };
  });