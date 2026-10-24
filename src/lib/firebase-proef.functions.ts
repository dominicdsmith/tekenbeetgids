import { createServerFn } from "@tanstack/react-start";
import { setResponseHeader } from "@tanstack/react-start/server";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { controleerProefBeheer, proefInput } from "./firebase-proef";

export const firebaseProef = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => proefInput.parse(input))
  .handler(async ({ context, data }) => {
    const { data: isAdmin, error } = await context.supabase.rpc("has_role", { _user_id: context.userId, _role: "admin" });
    controleerProefBeheer(isAdmin, error);
    setResponseHeader("Cache-Control", "no-store");
    const { maakProefTransport, voerProefUit } = await import("./firebase-proef.server");
    return voerProefUit(data, maakProefTransport());
  });