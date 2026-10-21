import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";

/**
 * Maandelijkse controle van alle gebruikte databronnen.
 *
 * Wordt elk uur aangeroepen door de geplande taak (pg_cron).
 * De route haalt iedere bron op, vergelijkt een vingerafdruk van de inhoud met
 * de vorige controle en werkt daarna automatisch de peildatum bij. Alleen als
 * er echt iets is gewijzigd, schuift ook "laatst bijgewerkt" mee.
 */

const MAANDEN = [
  "januari", "februari", "maart", "april", "mei", "juni",
  "juli", "augustus", "september", "oktober", "november", "december",
];

/** Maximaal aantal bronnen per run (harde begrenzing). */
const MAX_BRONNEN = 20;
/** Hoe lang het slot geldt, zodat twee runs nooit tegelijk lopen. */
const LOCK_MINUTEN = 10;

function nlDatum(d: Date) {
  return `${d.getUTCDate()} ${MAANDEN[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}

async function vingerafdruk(tekst: string) {
  const genormaliseerd = tekst
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(genormaliseerd));
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export const Route = createFileRoute("/api/public/hooks/data-controle")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { isGeldigeCronAanroep } = await import("@/lib/beveiliging.server");
        if (!(await isGeldigeCronAanroep(request))) {
          return Response.json({ error: "Niet geautoriseerd" }, { status: 401 });
        }

        const supabase = createClient(
          process.env["SUPABASE_URL"]!,
          process.env["SUPABASE_SERVICE_ROLE_KEY"]!,
          { auth: { persistSession: false, autoRefreshToken: false } },
        );

        const nu = new Date();

        // Single-flight: alleen doorgaan als het slot vrij (of verlopen) is.
        const lockTot = new Date(nu.getTime() + LOCK_MINUTEN * 60_000).toISOString();
        const { data: slot } = await supabase
          .from("datastatus")
          .update({ lock_tot: lockTot })
          .eq("id", 1)
          .or(`lock_tot.is.null,lock_tot.lt.${nu.toISOString()}`)
          .select("id");

        if (!slot || slot.length === 0) {
          return Response.json({ overgeslagen: true, reden: "controle loopt al" });
        }

        const { data: bronnen, error: bronFout } = await supabase
          .from("databronnen")
          .select("sleutel, naam, url, vingerafdruk, peildatum")
          .order("volgorde", { ascending: true })
          .limit(MAX_BRONNEN);

        if (bronFout) {
          await supabase.from("datastatus").update({ lock_tot: null }).eq("id", 1);
          return Response.json({ error: bronFout.message }, { status: 500 });
        }

        let gewijzigd = 0;
        const gewijzigdeBronnen: { sleutel: string; naam?: string | null; url?: string | null }[] = [];
        const resultaten: { bron: string; resultaat: string }[] = [];

        for (const bron of bronnen ?? []) {
          let resultaat = "ongewijzigd";
          let detail: Record<string, unknown> = {};
          try {
            const res = await fetch(bron.url, {
              headers: { "user-agent": "TekenRisicoKaart-databroncontrole" },
              signal: AbortSignal.timeout(20_000),
            });
            if (!res.ok) {
              resultaat = "onbereikbaar";
              detail = { status: res.status };
            } else {
              const hash = await vingerafdruk(await res.text());
              if (!bron.vingerafdruk) {
                resultaat = "eerste meting";
              } else if (hash !== bron.vingerafdruk) {
                resultaat = "gewijzigd";
                gewijzigd += 1;
                gewijzigdeBronnen.push({ sleutel: bron.sleutel, naam: bron.naam, url: bron.url });
              }
              await supabase
                .from("databronnen")
                .update({
                  vingerafdruk: hash,
                  status: resultaat,
                  laatst_gecontroleerd: nu.toISOString(),
                  ...(resultaat === "gewijzigd"
                    ? { laatst_gewijzigd: nu.toISOString(), peildatum: `bron gewijzigd op ${nlDatum(nu)}` }
                    : {}),
                })
                .eq("sleutel", bron.sleutel);
            }
          } catch (e) {
            resultaat = "fout";
            detail = { melding: e instanceof Error ? e.message : String(e) };
          }

          if (resultaat === "onbereikbaar" || resultaat === "fout") {
            await supabase
              .from("databronnen")
              .update({ status: resultaat, laatst_gecontroleerd: nu.toISOString() })
              .eq("sleutel", bron.sleutel);
          }

          resultaten.push({ bron: bron.sleutel, resultaat });
          await supabase.from("datacontrole_log").insert({
            bron_sleutel: bron.sleutel,
            resultaat,
            detail: { url: bron.url, ...detail },
          });
        }

        const datum = nlDatum(nu);
        await supabase
          .from("datastatus")
          .update({
            peildatum: datum,
            ...(gewijzigd > 0 ? { laatst_bijgewerkt: datum } : {}),
            wijziging_gevonden: gewijzigd > 0,
            laatste_controle: nu.toISOString(),
            lock_tot: null,
            updated_at: nu.toISOString(),
          })
          .eq("id", 1);

        // Melding per e-mail na iedere controle: met wijzigingen én zonder.
        const { verstuurDataMelding } = await import("@/lib/data-melding.server");
        await verstuurDataMelding({
          peildatum: datum,
          laatstBijgewerkt: datum,
          gewijzigd: gewijzigdeBronnen,
          resultaten,
        });


        return Response.json({ gecontroleerd: resultaten.length, gewijzigd, peildatum: datum, resultaten });
      },
    },
  },
});
