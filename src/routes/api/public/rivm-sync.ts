import { createFileRoute } from "@tanstack/react-router";
import { berekenProvincieKaart } from "@/lib/provincieklassen";

/**
 * Automatische koppeling met de RIVM/Tekenradar-cijfers.
 *
 * Deze publieke endpoint haalt de actuele RIVM-cijferpagina op, leest daar het
 * landelijke aantal tekenbeetmeldingen en het aandeel met Borrelia besmette
 * teken uit, en werkt daarmee de tabellen `ziekte_cijfers` en
 * `provincie_cijfers` bij. De site leest die tabellen, zodat de percentages op
 * de ziekte- en provinciekaarten niet meer met de hand worden ingevoerd.
 *
 * Bedoeld om periodiek (bijv. maandelijks via pg_cron) te worden aangeroepen.
 */

const BRONNEN = [
  "https://www.rivm.nl/tekenbeten-en-lyme",
  "https://www.rivm.nl/tekenbeten",
  "https://www.rivm.nl/tekenbeten/actueel",
  "https://www.rivm.nl/tekenbeten/ziek",
  "https://www.rivm.nl/tekenbeten/soorten-teken",
  "https://www.rivm.nl/tekenbeten/informatie-voor-professionals",
  "https://www.rivm.nl/ziekte-van-lyme",
];

/**
 * Overzichtsbron per tekenbeetziekte: welke woorden in de RIVM-tekst horen bij
 * welke ziekte. Het percentage besmette teken wordt uit de zin rond die woorden
 * gehaald, zodat de lijst en de percentages automatisch bijwerken.
 */
const ZIEKTE_TREFWOORDEN: { id: string; woorden: string[] }[] = [
  { id: "lyme", woorden: ["Borrelia burgdorferi", "Borrelia\\b(?!\\s*miyamotoi)", "lyme"] },
  { id: "rickettsia", woorden: ["Rickettsia", "rickettsio"] },
  { id: "neoehrlichia", woorden: ["Neoehrlichia", "Candidatus Neoehrlichia"] },
  { id: "babesia", woorden: ["Babesia", "babesio"] },
  { id: "miyamotoi", woorden: ["Borrelia miyamotoi", "miyamotoi"] },
  { id: "anaplasma", woorden: ["Anaplasma", "anaplasmo"] },
  { id: "bartonella", woorden: ["Bartonella"] },
  { id: "tularemie", woorden: ["Francisella", "tularemie"] },
  { id: "cchf", woorden: ["Krim-Congo", "CCHF"] },
];

/**
 * Ziekteverwekkers die (nog) niet in de database staan, maar wel in Nederland
 * of in de RIVM-teksten kunnen opduiken. Noemt de bron er één, dan wordt de
 * ziekte automatisch aan de lijst en de kaart toegevoegd.
 */
const NIEUWE_ZIEKTEN: { id: string; naam: string; woorden: string[] }[] = [
  { id: "tbe", naam: "Tekenencefalitis (TBE)", woorden: ["tekenencefalitis", "\\bTBE\\b", "FSME"] },
  { id: "ehrlichia", naam: "Ehrlichiose", woorden: ["Ehrlichia(?! chaffeensis-achtig)", "ehrlichiose"] },
  { id: "spiroplasma", naam: "Spiroplasma", woorden: ["Spiroplasma"] },
  { id: "coxiella", naam: "Q-koorts (Coxiella burnetii)", woorden: ["Coxiella"] },
  { id: "louping", naam: "Louping ill-virus", woorden: ["Louping ill"] },
  { id: "alongshan", naam: "Alongshan-virus", woorden: ["Alongshan"] },
  { id: "borrelia_lusitaniae", naam: "Borrelia lusitaniae", woorden: ["Borrelia lusitaniae"] },
];

/** Provincies zoals ze in de RIVM-teksten en in de database voorkomen. */
const PROVINCIE_NAMEN: { id: string; woorden: string[] }[] = [
  { id: "groningen", woorden: ["Groningen"] },
  { id: "friesland", woorden: ["Friesland", "Frysl[aâ]n"] },
  { id: "drenthe", woorden: ["Drenthe"] },
  { id: "overijssel", woorden: ["Overijssel"] },
  { id: "flevoland", woorden: ["Flevoland"] },
  { id: "gelderland", woorden: ["Gelderland", "Veluwe"] },
  { id: "utrecht", woorden: ["Utrecht"] },
  { id: "noordholland", woorden: ["Noord-Holland"] },
  { id: "zuidholland", woorden: ["Zuid-Holland"] },
  { id: "zeeland", woorden: ["Zeeland"] },
  { id: "noordbrabant", woorden: ["Noord-Brabant", "Brabant"] },
  { id: "limburg", woorden: ["Limburg"] },
];

/**
 * Zoekt in de RIVM-tekst hoe vaak een provincie in dezelfde zin als een ziekte
 * wordt genoemd, met een eventueel aantal patiënten/meldingen erbij.
 * Levert `null` als de bron er niets over zegt.
 */
function meldingenVoorProvincie(tekst: string, ziekteWoorden: string[], provWoorden: string[]): number | null {
  for (const zw of ziekteWoorden) {
    for (const pw of provWoorden) {
      const re = new RegExp(
        `(?:${zw}[^.]{0,160}?${pw}|${pw}[^.]{0,160}?${zw})[^.]{0,60}?(\\d{1,4})\\s*(?:patiënten|patienten|meldingen|gevallen|besmettingen)`,
        "i",
      );
      const m = tekst.match(re);
      const n = m?.[1] ? Number(m[1]) : NaN;
      if (Number.isFinite(n) && n >= 0 && n < 100000) return n;
    }
  }
  return null;
}

/**
 * Zoekt het percentage besmette teken in de zin rond een ziektetrefwoord.
 * Alleen zinnen die echt over besmette teken gaan tellen mee; percentages over
 * bijv. melders of tuintekenbeten worden bewust genegeerd.
 */
function pctVoorZiekte(tekst: string, woorden: string[]): number | null {
  for (const woord of woorden) {
    const re = new RegExp(
      `${woord}[^.]{0,120}?(\\d{1,2}(?:,\\d)?)\\s*(?:procent|%)|(\\d{1,2}(?:,\\d)?)\\s*(?:procent|%)[^.]{0,120}?${woord}`,
      "i",
    );
    const m = tekst.match(re);
    const ruw = m?.[1] ?? m?.[2];
    if (!ruw || !gaatOverBesmetteTeken(m?.[0] ?? "")) continue;
    const n = nlGetalNaar(ruw);
    if (Number.isFinite(n) && n > 0 && n <= 60) return n;
  }
  return null;
}

/** Controleert of een gevonden zinsdeel over besmette teken gaat. */
function gaatOverBesmetteTeken(fragment: string): boolean {
  return /besmet|draagt|dragen|geïnfecteerd|geinfecteerd|infectiegraad|van de teken/i.test(fragment);
}

function tekstUitHtml(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ");
}

function nlGetalNaar(n: string): number {
  return Number(n.replace(/\./g, "").replace(",", "."));
}

export const Route = createFileRoute("/api/public/rivm-sync")({
  server: {
    handlers: {
      GET: async () => new Response("Method not allowed", { status: 405 }),
      POST: async ({ request }) => {
        const { isGeldigeCronAanroep } = await import("@/lib/beveiliging.server");
        if (!(await isGeldigeCronAanroep(request))) {
          return new Response("Unauthorized", { status: 401 });
        }
        return handle();
      },
    },
  },
});

async function handle(): Promise<Response> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

  let tekst = "";
  const gelezen: string[] = [];
  for (const url of BRONNEN) {
    try {
      const res = await fetch(url, { headers: { "user-agent": "TekenRisicoKaart/1.0 (+https://tekenrisicokaart.nl)" } });
      if (!res.ok) continue;
      tekst += " " + tekstUitHtml(await res.text());
      gelezen.push(url);
    } catch {
      /* bron tijdelijk niet bereikbaar — we gaan door met wat we wel hebben */
    }
  }

  if (!gelezen.length) {
    await supabaseAdmin.from("datacontrole_log").insert({
      bron_sleutel: "rivm_meldingen",
      resultaat: "mislukt",
      detail: { reden: "geen enkele RIVM-bron bereikbaar" },
    });
    return Response.json({ ok: false, reden: "RIVM-bronnen niet bereikbaar" }, { status: 502 });
  }

  // Landelijk aantal tekenbeetmeldingen (Tekenradar), bijv. "10.795 tekenbeten".
  const meldingen = (() => {
    const m = tekst.match(/([\d.]{4,9})\s*(?:tekenbeten|tekenbeetmeldingen|meldingen van tekenbeten)/i);
    const n = m?.[1] ? nlGetalNaar(m[1]) : NaN;
    return Number.isFinite(n) && n > 1000 && n < 5_000_000 ? n : null;
  })();

  // Aandeel met Borrelia besmette teken, bijv. "ongeveer 20% van de teken".
  const borreliaPct = (() => {
    const m = tekst.match(/(\d{1,2}(?:,\d)?)\s*(?:procent|%)[^.]{0,60}?(?:van de teken[^.]{0,40}?besmet|besmette teken)/i)
      ?? tekst.match(/teken[^.]{0,60}?besmet[^.]{0,40}?(\d{1,2}(?:,\d)?)\s*(?:procent|%)/i);
    const n = m?.[1] ? nlGetalNaar(m[1]) : NaN;
    return Number.isFinite(n) && n > 1 && n < 60 ? n : null;
  })();

  const nu = new Date().toISOString();
  const bijgewerkt: Record<string, number> = {};

  // Percentages besmette teken per ziekte, automatisch uit de RIVM-overzichtsbron.
  const periode = `RIVM-overzicht, opgehaald ${nu.slice(0, 10)}`;
  const nietGevonden: string[] = [];
  const nieuweZiekten: string[] = [];

  // De ziektenlijst zelf komt ook uit de bron: staat een ziekteverwekker wél in
  // de RIVM-tekst maar nog niet in de database, dan wordt die automatisch
  // toegevoegd en verschijnt hij direct op de kaart.
  const { data: bestaande } = await supabaseAdmin
    .from("ziekte_cijfers")
    .select("ziekte_id, volgorde");
  const bekend = new Set((bestaande ?? []).map((r) => r.ziekte_id));
  let volgendeVolgorde = Math.max(0, ...(bestaande ?? []).map((r) => r.volgorde ?? 0)) + 1;

  const kandidaten: { id: string; woorden: string[]; naam?: string }[] = [
    ...ZIEKTE_TREFWOORDEN,
    ...NIEUWE_ZIEKTEN.filter((k) => !ZIEKTE_TREFWOORDEN.some((z) => z.id === k.id)),
  ];

  for (const kandidaat of kandidaten) {
    const { id, woorden, naam } = kandidaat;
    const pct = id === "lyme" ? (pctVoorZiekte(tekst, woorden) ?? borreliaPct) : pctVoorZiekte(tekst, woorden);
    const genoemd = woorden.some((w) => new RegExp(w, "i").test(tekst));

    if (!bekend.has(id)) {
      // Onbekende ziekteverwekker: alleen toevoegen als de bron hem noemt.
      if (!genoemd || !naam) continue;
      const { error } = await supabaseAdmin.from("ziekte_cijfers").insert({
        ziekte_id: id,
        naam,
        pct: pct == null ? "onbekend" : `${String(pct).replace(".", ",")}%`,
        pct_noot: "Automatisch toegevoegd op basis van de RIVM-overzichtsbron.",
        risk: {},
        bron: "RIVM (automatisch overgenomen)",
        periode,
        volgorde: volgendeVolgorde++,
        actief: true,
        bijgewerkt_op: nu,
      });
      if (!error) {
        bekend.add(id);
        nieuweZiekten.push(id);
      }
      continue;
    }

    if (pct == null) {
      // Bron publiceert (nu) geen percentage voor deze ziekte: bestaande waarde blijft staan.
      nietGevonden.push(id);
      continue;
    }
    const tekstPct = `${id === "lyme" ? "~" : ""}${String(pct).replace(".", ",")}%`;
    const { error } = await supabaseAdmin
      .from("ziekte_cijfers")
      .update({
        pct: tekstPct,
        bron: "RIVM (automatisch overgenomen)",
        periode,
        bijgewerkt_op: nu,
      })
      .eq("ziekte_id", id);
    if (!error) bijgewerkt[`${id}_pct`] = pct;
  }




  if (meldingen != null) {
    const { data: rijen } = await supabaseAdmin
      .from("provincie_cijfers")
      .select("provincie_id, tekenbeet_aantal");
    const totaal = (rijen ?? []).reduce((s, r) => s + (r.tekenbeet_aantal ?? 0), 0);
    if (totaal > 0) {
      for (const r of rijen ?? []) {
        const aandeel = (r.tekenbeet_aantal ?? 0) / totaal;
        await supabaseAdmin
          .from("provincie_cijfers")
          .update({
            meldingen: Math.round(meldingen * aandeel),
            bron: "Tekenradar.nl / RIVM (automatisch overgenomen)",
            bijgewerkt_op: nu,
          })
          .eq("provincie_id", r.provincie_id);
      }
      bijgewerkt["meldingen_landelijk"] = meldingen;
    }

    /* Tekenradar-jaarcijfers als eigen dataset bijhouden; de seizoenskaart rekent hiermee. */
    const jaar = new Date().getMonth() < 3 ? new Date().getFullYear() - 1 : new Date().getFullYear();
    const { data: vorige } = await supabaseAdmin
      .from("tekenradar_cijfers")
      .select("meldingen")
      .eq("jaar", jaar - 1)
      .maybeSingle();
    const verandering = vorige?.meldingen
      ? Math.round(((meldingen - vorige.meldingen) / vorige.meldingen) * 100)
      : null;
    await supabaseAdmin.from("tekenradar_cijfers").upsert({
      jaar,
      meldingen,
      verandering_pct: verandering,
      bron: "Tekenradar.nl (automatisch overgenomen)",
      periode: `jaarcijfers ${jaar}`,
      bijgewerkt_op: nu,
    });
    bijgewerkt["tekenradar_jaar"] = jaar;
  }

  // Provinciekaart opnieuw genereren uit de TBE-cijfers en het CBS-inwonertal:
  // percentages per 100.000 en de klassegrenzen volgen automatisch uit de data.
  {
    const { data: rijen } = await supabaseAdmin
      .from("provincie_cijfers")
      .select("provincie_id, meldingen, inwoners, tbe_gevallen, habitat_factor");
    const berekening = berekenProvincieKaart(
      (rijen ?? []).map((r) => ({
        provincieId: r.provincie_id,
        meldingen: r.meldingen,
        inwoners: r.inwoners,
        tbeGevallen: r.tbe_gevallen,
        habitatFactor: r.habitat_factor == null ? null : Number(r.habitat_factor),
      })),
    );
    for (const b of berekening.provincies) {
      await supabaseAdmin
        .from("provincie_cijfers")
        .update({
          risk: b.klasse,
          meldingen_per_100k: b.meldingenPer100k,
          tbe_per_100k: b.tbePer100k,
          klasse_bron: `Automatisch berekend uit meldingen per 100.000 inwoners (CBS) en humane TBE-gevallen — ${berekening.grensLabels.join("; ")}`,
          bijgewerkt_op: nu,
        })
        .eq("provincie_id", b.provincieId);
    }
    if (berekening.provincies.length) {
      bijgewerkt["provincieklassen"] = berekening.provincies.length;
    }
  }

  // Historische TBE-cijfers per provincie: het lopende jaar wordt bijgewerkt en
  // bewaard, zodat het verloop per provincie over de jaren zichtbaar blijft.
  const jaarNu = new Date().getMonth() < 3 ? new Date().getFullYear() - 1 : new Date().getFullYear();
  {
    const { data: provRijen } = await supabaseAdmin
      .from("provincie_cijfers")
      .select("provincie_id, meldingen, tbe_gevallen");
    const tbeWoorden = ["tekenencefalitis", "\\bTBE\\b", "FSME"];
    let gevonden = 0;
    for (const prov of PROVINCIE_NAMEN) {
      const uitBron = meldingenVoorProvincie(tekst, tbeWoorden, prov.woorden);
      const huidig = provRijen?.find((r) => r.provincie_id === prov.id);
      const aantal = uitBron ?? huidig?.tbe_gevallen ?? 0;
      if (uitBron != null) gevonden++;
      await supabaseAdmin.from("tbe_provincie_historie").upsert({
        jaar: jaarNu,
        provincie_id: prov.id,
        tbe_gevallen: aantal,
        meldingen: huidig?.meldingen ?? null,
        bron: uitBron != null ? "RIVM (automatisch overgenomen)" : "RIVM (laatst bekende stand)",
        bijgewerkt_op: nu,
      });
      if (uitBron != null) {
        await supabaseAdmin
          .from("provincie_cijfers")
          .update({ tbe_gevallen: uitBron, bijgewerkt_op: nu })
          .eq("provincie_id", prov.id);
      }
    }
    bijgewerkt["tbe_historie_jaar"] = jaarNu;
    if (gevonden) bijgewerkt["tbe_per_provincie"] = gevonden;
  }

  // Meldingen per ziekte per provincie. Staat het aantal in de RIVM-tekst, dan
  // wordt dat overgenomen; anders wordt het geschat uit de tekenbeetmeldingen
  // per provincie en het aandeel besmette teken van die ziekte.
  {
    const { data: ziekten } = await supabaseAdmin
      .from("ziekte_cijfers")
      .select("ziekte_id, pct, actief");
    const { data: provRijen } = await supabaseAdmin
      .from("provincie_cijfers")
      .select("provincie_id, meldingen, inwoners, tbe_gevallen, habitat_factor");
    let rijen = 0;

    for (const z of ziekten ?? []) {
      if (z.actief === false) continue;
      const woorden =
        kandidaten.find((k) => k.id === z.ziekte_id)?.woorden ?? [z.ziekte_id];
      const pctZiekte = Number(String(z.pct ?? "").replace("~", "").replace("%", "").replace(",", ".")) || 0;

      const invoer = (provRijen ?? []).map((r) => {
        const uitBron = meldingenVoorProvincie(tekst, woorden, PROVINCIE_NAMEN.find((p) => p.id === r.provincie_id)?.woorden ?? []);
        const geschat = uitBron == null;
        const aantal =
          z.ziekte_id === "tbe"
            ? (r.tbe_gevallen ?? 0)
            : uitBron ?? Math.round(((r.meldingen ?? 0) * pctZiekte) / 100);
        return { rij: r, aantal, geschat };
      });

      for (const { rij, aantal, geschat } of invoer) {
        await supabaseAdmin.from("ziekte_provincie_meldingen").upsert({
          ziekte_id: z.ziekte_id,
          provincie_id: rij.provincie_id,
          meldingen: aantal,
          jaar: jaarNu,
          geschat,
          bron: geschat
            ? "Afgeleid van RIVM-percentage en tekenbeetmeldingen per provincie"
            : "RIVM (automatisch overgenomen)",
          bijgewerkt_op: nu,
        });
        rijen++;
      }

      // Risicoklassen per ziekte volgen automatisch uit die meldingen.
      const berekend = berekenProvincieKaart(
        invoer.map(({ rij, aantal }) => ({
          provincieId: rij.provincie_id,
          meldingen: aantal,
          inwoners: rij.inwoners,
          tbeGevallen: z.ziekte_id === "tbe" ? rij.tbe_gevallen : 0,
          habitatFactor: rij.habitat_factor == null ? null : Number(rij.habitat_factor),
        })),
      );
      if (berekend.provincies.length) {
        const risk: Record<string, number> = {};
        for (const b of berekend.provincies) risk[b.provincieId] = b.klasse;
        await supabaseAdmin
          .from("ziekte_cijfers")
          .update({ risk, bijgewerkt_op: nu })
          .eq("ziekte_id", z.ziekte_id);
      }
    }
    if (rijen) bijgewerkt["ziekte_provincie_rijen"] = rijen;
  }



  const iets = Object.keys(bijgewerkt).length > 0;
  await supabaseAdmin.from("datacontrole_log").insert({
    bron_sleutel: "rivm_meldingen",
    resultaat: iets ? "bijgewerkt" : "geen wijziging",
    detail: { bronnen: gelezen, bijgewerkt, zonder_percentage: nietGevonden, nieuwe_ziekten: nieuweZiekten },
  });

  return Response.json({ ok: true, bronnen: gelezen, bijgewerkt, zonder_percentage: nietGevonden, nieuwe_ziekten: nieuweZiekten });
}
