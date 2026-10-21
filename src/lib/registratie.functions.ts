import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

const registratieSchema = z.object({
  overzicht: z.string().trim().min(20).max(30000),
  gegevens: z.record(z.string(), z.unknown()).refine((value) => JSON.stringify(value).length <= 60000, "Registratie is te groot"),
  taal: z.enum(["nl", "en"]),
  nummer: z.string().trim().regex(/^TRK-\d{4}-[A-Z0-9]{6}$/),
  intrekcode: z.string().trim().min(6).max(40),
});

export const slaTekenbeetRegistratieOp = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => registratieSchema.parse(input))
  .handler(async ({ data }) => {
    const { bewaarRegistratie } = await import("@/lib/registratie.server");
    return bewaarRegistratie(data);
  });

export const haalTekenbeetRegistraties = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { leesRegistraties } = await import("@/lib/registratie.server");
    return leesRegistraties(context);
  });
