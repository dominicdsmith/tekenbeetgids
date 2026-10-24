import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";

/**
 * Wekelijkse back-up: exporteert de bronadministratie uit Lovable Cloud als
 * versleuteld JSON-bestand naar de map Back-up in de afgeschermde werkomgeving bij Google (verwerker).
 * Aangeroepen door de geplande taak (pg_cron). Bewaart de laatste 12 exports.
 */

const TABELLEN = [
  "onderzoek_deelnames",
  "tekenbeet_registraties",
  "tekenbeet_tellingen",
  "contact_berichten",
  "privacy_verzoeken",
] as const;
const BEWAAR = 12;
const PAGINA = 1000;
const MAX_RIJEN = 200_000;

export const Route = createFileRoute("/api/public/hooks/backup-export")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { isGeldigeCronAanroep } = await import("@/lib/beveiliging.server");
        if (!(await isGeldigeCronAanroep(request))) {
          return Response.json({ error: "Niet geautoriseerd" }, { status: 401 });
        }
        const supabase = createClient(process.env["SUPABASE_URL"]!, process.env["SUPABASE_SERVICE_ROLE_KEY"]!, {
          auth: { persistSession: false, autoRefreshToken: false },
        });
        // Back-uplog: één regel per run (geslaagd of mislukt); regels ouder dan een jaar vervallen.
        const log = async (geslaagd: boolean, toelichting: string, bestand?: string, aantal?: number) => {
          try {
            const rij = { geslaagd, toelichting, bestand: bestand ?? null, aantal_records: aantal ?? null };
            const { data: opgeslagen } = await supabase.from("backup_log").insert(rij).select("id, uitgevoerd_op").single();
            await supabase.from("backup_log").delete().lt("uitgevoerd_op", new Date(Date.now() - 365 * 864e5).toISOString());
            /* Live-spiegel naar Google (fase B deel 2); mislukken blokkeert de back-up niet. */
            if (opgeslagen) {
              try {
                const { spiegelOpslaan } = await import("@/lib/firebase-spiegel.server");
                await spiegelOpslaan("backup_log", { ...opgeslagen, ...rij });
              } catch (e) { console.error("Spiegel-koppeling mislukt:", e); }
            }
          } catch (e) { console.error("Back-uplog schrijven mislukt:", e); }
        };
        const wachtzin = process.env["BACKUP_WACHTZIN"];
        if (!wachtzin || wachtzin.length < 12) {
          // Nooit onversleuteld uploaden.
          await log(false, "Back-upsleutel niet ingesteld; niets geüpload");
          return Response.json({ error: "Back-upsleutel niet ingesteld" }, { status: 500 });
        }
        if (!process.env["GOOGLE_DRIVE_API_KEY"] || !process.env["LOVABLE_API_KEY"]) {
          await log(false, "Opslagkoppeling niet ingesteld");
          return Response.json({ error: "Opslag niet ingesteld" }, { status: 500 });
        }

        const nu = new Date();
        const inhoud: Record<string, unknown[]> = {};
        const aantallen: Record<string, number> = {};
        for (const tabel of TABELLEN) {
          const rijen: unknown[] = [];
          for (let van = 0; van < MAX_RIJEN; van += PAGINA) {
            const { data, error } = await supabase.from(tabel).select("*").range(van, van + PAGINA - 1);
            if (error) {
              console.error(`Back-up ${tabel} mislukt:`, error.message);
              await log(false, "Lezen van de brongegevens mislukt");
              return Response.json({ error: `Lezen ${tabel} mislukt` }, { status: 500 });
            }
            rijen.push(...(data ?? []));
            if (!data || data.length < PAGINA) break;
          }
          inhoud[tabel] = rijen;
          aantallen[tabel] = rijen.length;
        }


        const naam = `backup-${nu.toISOString().slice(0, 16).replace(/[:T]/g, "-")}.json.enc`;
        const platte = new TextEncoder().encode(
          JSON.stringify({ gemaakt_op: nu.toISOString(), bron: "Lovable Cloud", aantallen, tabellen: inhoud }),
        );
        const zout = crypto.getRandomValues(new Uint8Array(16));
        const iv = crypto.getRandomValues(new Uint8Array(12));
        // De serveromgeving faalt bij meer dan 100.000 herhalingen; dat is hier de bovenste limiet.
        const ITER = 100_000;
        let geheim: Uint8Array;
        try {
          const basis = await crypto.subtle.importKey("raw", new TextEncoder().encode(wachtzin), "PBKDF2", false, ["deriveKey"]);
          const sleutel = await crypto.subtle.deriveKey(
            { name: "PBKDF2", salt: zout, iterations: ITER, hash: "SHA-256" },
            basis, { name: "AES-GCM", length: 256 }, false, ["encrypt"],
          );
          geheim = new Uint8Array(await crypto.subtle.encrypt({ name: "AES-GCM", iv }, sleutel, platte));
        } catch (e) {
          // Nooit onversleuteld uploaden: bij een fout in de sleutelafleiding blijft de export hier.
          console.error("Back-up versleutelen mislukt:", e);
          await log(false, "Versleutelen mislukt; niets geüpload");
          const { verstuurBeheerMelding } = await import("@/lib/contact-mail.server");
          await verstuurBeheerMelding("Back-up MISLUKT", ["De wekelijkse back-up kon niet worden versleuteld; er is niets geüpload."]);
          return Response.json({ error: "Versleutelen mislukt" }, { status: 500 });
        }
        const b64 = (u: Uint8Array) => { let t = ""; for (let i = 0; i < u.length; i += 0x8000) t += String.fromCharCode(...u.subarray(i, i + 0x8000)); return btoa(t); };
        const bestand = JSON.stringify({
          formaat: "TekenbeetGids-backup-v1", alg: "AES-256-GCM", kdf: "PBKDF2-SHA256", iteraties: ITER,
          zout: b64(zout), iv: b64(iv), data: b64(geheim),
        });
        try {
          const { uploadBackup } = await import("@/lib/werkkopie.server");
          await uploadBackup(naam, bestand, BEWAAR);
        } catch (e) {
          console.error("Back-up uploaden mislukt:", e);
          await log(false, "Uploaden naar de afgeschermde werkomgeving bij Google mislukt");
          const { verstuurBeheerMelding } = await import("@/lib/contact-mail.server");
          await verstuurBeheerMelding("Back-up MISLUKT", ["De wekelijkse back-up kon niet naar de afgeschermde werkomgeving bij Google worden geüpload."]);
          return Response.json({ error: "Uploaden mislukt" }, { status: 502 });
        }

        {
          const { verstuurBeheerMelding } = await import("@/lib/contact-mail.server");
          await verstuurBeheerMelding("Back-up geslaagd", [
            `De versleutelde back-up is opgeslagen in de afgeschermde werkomgeving bij Google (map Back-up): ${naam}`,
            ``,
            ...Object.entries(aantallen).map(([k, v]) => `${k}: ${v}`),
          ]);
        }
        await log(true, "Versleuteld opgeslagen in de afgeschermde werkomgeving bij Google", naam, Object.values(aantallen).reduce((a, b) => a + b, 0));
        return Response.json({ ok: true, bestand: naam, aantallen });
      },
    },
  },
});
