import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const schema = z.object({
  datum: z.string().max(10).optional().nullable(),
  provincieId: z.string().max(40).optional().nullable(),
  plaats: z.string().max(80).optional().nullable(),
  soort: z.string().max(60).optional().nullable(),
  bron: z.string().max(30).optional().nullable(),
});

export const registreerTellingFn = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => schema.parse(data))
  .handler(async ({ data }) => {
    const { runCloudAction } = await import("./cloudBridge.server");
    return runCloudAction("telling", data, async () => {
      const { registreerTelling } = await import("./telling.server");
      return registreerTelling(data);
    });
  });
