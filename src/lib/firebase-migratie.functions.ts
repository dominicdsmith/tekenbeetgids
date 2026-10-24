import { createServerFn } from "@tanstack/react-start";
import { setResponseHeader } from "@tanstack/react-start/server";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { controleerMigratieBeheer, migratieInput, spiegelLogInput } from "./firebase-migratie";

async function controleerBeheer(context: { supabase: any; userId: string }) {
  const { data: isAdmin, error } = await context.supabase.rpc("has_role", { _user_id: context.userId, _role: "admin" });
  controleerMigratieBeheer(isAdmin, error);
  setResponseHeader("Cache-Control", "no-store");
}

export const firebaseMigratie = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => migratieInput.parse(input))
  .handler(async ({ context, data }) => {
    await controleerBeheer(context);
    const { maakMigratieTransport, voerMigratieUit } = await import("./firebase-migratie.server");
    return voerMigratieUit(data, maakMigratieTransport());
  });

export const firebaseSpiegelLog = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => spiegelLogInput.parse(input))
  .handler(async ({ context }) => {
    await controleerBeheer(context);
    const { leesSpiegelLog, maakMigratieTransport } = await import("./firebase-migratie.server");
    return leesSpiegelLog(maakMigratieTransport());
  });
