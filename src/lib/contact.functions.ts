import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { contactSchema, leesContactBerichten, leesPrivacyVerzoeken, verwerkContact } from "@/lib/contact.server";
export type { ContactInvoer } from "@/lib/contact.server";

export const verstuurContact = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => contactSchema.parse(input))
  .handler(({ data }) => verwerkContact(data));

export const haalContactBerichten = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(({ context }) => leesContactBerichten(context));

export const haalPrivacyVerzoeken = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(({ context }) => leesPrivacyVerzoeken(context));
