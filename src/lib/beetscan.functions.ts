import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const schema = z.object({
  afbeelding: z.string().startsWith("data:image/").max(8_000_000),
  taal: z.enum(["nl", "en"]).default("nl"),
});

export const scanBeetplekFn = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => schema.parse(data))
  .handler(async ({ data }) => {
    const { runCloudAction } = await import("./cloudBridge.server");
    return runCloudAction("beetscan", data, async () => {
    const { fotoscanToegestaan, fotoscanHash, fotoscanCacheOphalen, fotoscanCacheOpslaan, zelfdeHerkomst } = await import("./beveiliging.server");
    if (!zelfdeHerkomst()) {
      throw new Error(data.taal === "en" ? "This scan is only available from the website itself." : "Deze scan is alleen beschikbaar vanaf de website zelf.");
    }
    const hash = await fotoscanHash(data.afbeelding);
    const cached = await fotoscanCacheOphalen(hash, "beetplek-gemini-v6", data.taal);
    if (cached) return cached;
    if (!(await fotoscanToegestaan("beetplek"))) {
      throw new Error(data.taal === "en" ? "Too many scans. Please try again later." : "Te veel scans. Probeer het later opnieuw.");
    }
    const { scanBeetplek } = await import("./beetscan.server");
    const resultaat = await scanBeetplek(data.afbeelding, data.taal);
    await fotoscanCacheOpslaan(hash, "beetplek-gemini-v6", data.taal, resultaat);
    const { voegScanToe: voegScanToeAanNextcloud } = await import("./werkkopie.server");
    voegScanToeAanNextcloud("beetplek", { uitkomst: resultaat.categorie, kenmerken: resultaat.kenmerken, taal: data.taal })
      .catch((e) => console.error("Werkkopie-synchronisatie beetplekscan mislukt:", e));
    return resultaat;
    });
  });
