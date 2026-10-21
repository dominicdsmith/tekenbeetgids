import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const optOutInvoer = z.object({
  deelnamenummer: z.string().trim().toUpperCase().regex(/^TRK-\d{4}-[A-Z0-9]{6}$/, "Ongeldig deelnamenummer"),
  intrekcode: z.string().trim().max(20).optional().default(""),
  toelichting: z.string().trim().max(500).optional().default(""),
  website: z.string().max(0).optional().default(""),
  geopendOp: z.number().int().positive(),
  somA: z.number().int().min(2).max(8),
  somB: z.number().int().min(1).max(8),
  somAntwoord: z.number().int().min(3).max(16),
});

export const trekDeelnameIn = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => optOutInvoer.parse(input))
  .handler(async ({ data }) => {
    const { verwerkOptOut } = await import("@/lib/optout.server");
    return verwerkOptOut(data);
  });
