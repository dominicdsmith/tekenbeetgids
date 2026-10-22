import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { bewaarDeelname, leesOnderzoekDeelnames, markeerTekenbeetGemeld, meldingSchema, onderzoekSchema } from "@/lib/onderzoek.server";
export type { OnderzoekInvoer, OnderzoekDeelname } from "@/lib/onderzoek.server";

export const meldAanVoorOnderzoek = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => onderzoekSchema.parse(input))
  .handler(async ({ data }) => {
    const { runCloudAction } = await import("./cloudBridge.server");
    return runCloudAction("deelname", data, () => bewaarDeelname(data));
  });

export const haalOnderzoekDeelnames = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(({ context }) => leesOnderzoekDeelnames(context));

export const meldTekenbeetGemeld = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => meldingSchema.parse(input))
  .handler(async ({ data }) => {
    const { runCloudAction } = await import("./cloudBridge.server");
    return runCloudAction("melding", data, () => markeerTekenbeetGemeld(data));
  });
