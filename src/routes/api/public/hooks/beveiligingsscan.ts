import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";

/**
 * Automatische beveiligingsscan.
 *
 * Wordt dagelijks aangeroepen door de geplande taak (pg_cron). De route laat de
 * database zichzelf controleren (toegangsregels, rechten, functies, extensies),
 * controleert de openbare eindpunten en slaat het resultaat op als nieuwe scan.
 * De lijst op de website werkt daarna automatisch bij.
 */

type Waarschuwing = {
  titel: string;
  niveau: "kritiek" | "waarschuwing" | "info";
  status: "open" | "opgelost" | "gemitigeerd" | "geaccepteerd";
  toelichting: string;
};

/**
 * Bekende, eerder beoordeelde meldingen krijgen automatisch de juiste status.
 * Platform-extensies (zoals pg_net) worden volledig weggelaten: dat is een
 * instelling van de databaseomgeving, niet iets dat de website kan oplossen.
 */
/**
 * Technische namen (tabellen, functies, extensies) horen niet in het openbare
 * logboek: ze worden hier al bij het opslaan weggehaald, zodat er nooit
 * technische details gepubliceerd worden.
 */
function openbareTitel(titel: string): string {
  return titel.replace(/\s*:\s*\S+\s*$/, "").trim() || titel;
}

function normaliseer(w: Waarschuwing): Waarschuwing | null {
  if (w.titel.includes("has_role")) {
    return {
      ...w,
      titel: openbareTitel(w.titel),
      status: "gemitigeerd",
      toelichting:
        "De functie is nodig voor de toegangsregels. Ingelogde gebruikers kunnen er alleen hun eigen rol mee opvragen; vragen over andere accounts geven altijd 'nee'.",
    };
  }
  if (w.titel.startsWith("Extensie in openbaar schema")) {
    return null;
  }
  return { ...w, titel: openbareTitel(w.titel) };
}

export const Route = createFileRoute("/api/public/hooks/beveiligingsscan")({
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

        const waarschuwingen: Waarschuwing[] = [];
        const scanners: string[] = [];

        // 1. Databasecontrole (toegangsregels, rechten, functies, extensies)
        const { data: bevindingen, error: dbFout } = await supabase.rpc("beveiligingscontrole");
        if (dbFout) {
          waarschuwingen.push({
            titel: "Databasecontrole kon niet worden uitgevoerd",
            niveau: "waarschuwing",
            status: "open",
            toelichting: "De automatische controle van de toegangsregels is deze keer niet gelukt.",
          });
        } else {
          scanners.push("Database (RLS/policies)", "Rechten en functies", "Extensies");
          for (const b of (bevindingen as Waarschuwing[] | null) ?? []) {
            const genormaliseerd = normaliseer(b);
            if (genormaliseerd) waarschuwingen.push(genormaliseerd);
          }
        }

        // 2. Controle op openbaar leesbare gevoelige gegevens (met publieke sleutel)
        const publiek = createClient(
          process.env["SUPABASE_URL"]!,
          (process.env["SUPABASE_PUBLISHABLE_KEY"] ?? process.env["SUPABASE_ANON_KEY"])!,
          { auth: { persistSession: false, autoRefreshToken: false } },
        );
        scanners.push("Openbare toegang (gevoelige gegevens)");
        for (const tabel of ["onderzoek_deelnames", "contact_berichten", "user_roles"]) {
          const { data, error } = await publiek.from(tabel).select("*").limit(1);
          if (!error && data && data.length > 0) {
            waarschuwingen.push({
              titel: "Gevoelige gegevens openbaar leesbaar",
              niveau: "kritiek",
              status: "open",
              toelichting: "Deze gegevens zijn zonder inloggen op te vragen. Dit moet worden afgeschermd.",
            });
          }
        }

        const nu = new Date();
        const kritiek = waarschuwingen.filter((w) => w.niveau === "kritiek" && w.status === "open").length;
        const open = waarschuwingen.filter((w) => w.status === "open").length;
        const samenvatting =
          kritiek > 0
            ? `${kritiek} kritieke bevinding(en) die aandacht vragen.`
            : open > 0
              ? `${open} openstaande waarschuwing(en), geen kritieke bevindingen.`
              : "Geen openstaande bevindingen; alle meldingen zijn opgelost, gemitigeerd of bewust geaccepteerd.";

        const { error: insertFout } = await supabase.from("beveiligingsscans").insert({
          uitgevoerd_op: nu.toISOString(),
          release: "automatische scan",
          commit: "auto-scan",
          scanners,
          waarschuwingen,
          samenvatting,
        });
        if (insertFout) {
          return Response.json({ error: insertFout.message }, { status: 500 });
        }

        // Melding per e-mail na iedere scan.
        const { verstuurScanMelding } = await import("@/lib/scan-melding.server");
        await verstuurScanMelding({
          uitgevoerdOp: new Intl.DateTimeFormat("nl-NL", {
            dateStyle: "full",
            timeStyle: "short",
            timeZone: "Europe/Amsterdam",
          }).format(nu),
          samenvatting,
          kritiek,
          scanners,
          waarschuwingen,
        });


        // Historie beperkt houden: bewaar de laatste 50 scans.
        const { data: oud } = await supabase
          .from("beveiligingsscans")
          .select("id")
          .order("uitgevoerd_op", { ascending: false })
          .range(50, 200);
        if (oud && oud.length > 0) {
          await supabase
            .from("beveiligingsscans")
            .delete()
            .in("id", oud.map((o) => o.id));
        }

        return Response.json({ bevindingen: waarschuwingen.length, kritiek, samenvatting });
      },
    },
  },
});
