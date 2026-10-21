import { createFileRoute } from "@tanstack/react-router";

/**
 * Automatische koppeling met de RIVM- en LCI-bronnen voor:
 *  1. de humane TBE-meldingen per jaar (tabel `tbe_jaarcijfers`), en
 *  2. de tekenactiviteit per maand (tabel `tekenactiviteit_maand`).
 *
 * De endpoint leest de openbare RIVM/LCI/Tekenradar-pagina's, haalt daar de
 * jaarcijfers en de tekenbeetmeldingen per maand uit en schrijft die naar de
 * database. De site leest die tabellen, zodat niemand deze cijfers nog met de
 * hand hoeft op te zoeken of in te typen. Bedoeld voor een periodieke
 * (dagelijkse) aanroep via pg_cron.
 */

const BRONNEN = [
  "https://www.rivm.nl/tbe",
  "https://lci.rivm.nl/richtlijnen/tekenencefalitis",
  "https://www.rivm.nl/tekenencefalitis-tbe",
  "https://www.rivm.nl/meldingsplicht-infectieziekten/meldingen",
  "https://www.rivm.nl/tekenbeten",
  "https://www.rivm.nl/tekenbeten-en-lyme",
  "https://www.tekenradar.nl",
  "https://www.tekenradar.nl/artikel/tekenbeten-per-maand",
];

const MAAND_WOORDEN = [
  "januari", "februari", "maart", "april", "mei", "juni",
  "juli", "augustus", "september", "oktober", "november", "december",
];

function tekstUitHtml(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ");
}

function nlGetalNaar(n: string): number {
  return Number(n.replace(/\./g, "").replace(",", "."));
}

/**
 * Humane TBE-meldingen per jaar uit de RIVM/LCI-tekst.
 * Herkent onder meer "in 2025 waren er 25 meldingen", "25 TBE-meldingen in
 * 2025" en opsommingen als "2025: 25". Onwaarschijnlijke waarden worden
 * genegeerd, zodat een verkeerd gelezen getal de site niet vervuilt.
 */
export function tbeJaarcijfersUitTekst(tekst: string): Record<number, number> {
  const uit: Record<number, number> = {};
  const nu = new Date().getFullYear();
  const bewaar = (jaar: number, aantal: number) => {
    if (jaar < 2015 || jaar > nu) return;
    if (!Number.isFinite(aantal) || aantal < 0 || aantal > 1000) return;
    uit[jaar] = aantal;
  };

  const patronen: RegExp[] = [
    /(?:in|van)\s*(20\d{2})[^.]{0,80}?(\d{1,4})\s*(?:humane\s*)?(?:TBE-?)?(?:meldingen|patiënten|patienten|gevallen)/gi,
    /(\d{1,4})\s*(?:humane\s*)?(?:TBE-?)?(?:meldingen|patiënten|patienten|gevallen)[^.]{0,60}?(?:in|over|van)\s*(20\d{2})/gi,
    /(20\d{2})\s*[:–-]\s*(\d{1,4})\b/g,
  ];

  for (const [i, re] of patronen.entries()) {
    for (const m of tekst.matchAll(re)) {
      const rondom = tekst.slice(Math.max(0, (m.index ?? 0) - 200), (m.index ?? 0) + 200);
      if (!/TBE|tekenencefalitis|FSME/i.test(rondom)) continue;
      const a = nlGetalNaar(m[1] ?? "");
      const b = nlGetalNaar(m[2] ?? "");
      if (i === 1) bewaar(b, a);
      else bewaar(a, b);
    }
  }
  return uit;
}

/**
 * Tekenbeetmeldingen per maand uit de bron. Levert een array van 12 getallen
 * (of `null` als de bron er niets bruikbaars over zegt).
 */
export function maandcijfersUitTekst(tekst: string): number[] | null {
  const perMaand: (number | null)[] = Array(12).fill(null);
  let gevonden = 0;
  /** Jaartallen (2015–2030) zijn geen aantallen; die horen bij een datum. */
  const bruikbaar = (n: number) => Number.isFinite(n) && n >= 0 && n <= 500000 && !(n >= 1990 && n <= 2100);

  for (const [i, maand] of MAAND_WOORDEN.entries()) {
    const patronen = [
      new RegExp(`${maand}[^.\\d]{0,25}([\\d.]{1,7})\\s*(?:tekenbeten|tekenbeetmeldingen|meldingen)`, "i"),
      new RegExp(`([\\d.]{1,7})\\s*(?:tekenbeten|tekenbeetmeldingen|meldingen)[^.]{0,30}?${maand}`, "i"),
    ];
    for (const re of patronen) {
      const m = tekst.match(re);
      if (!m?.[1]) continue;
      const n = nlGetalNaar(m[1]);
      if (!bruikbaar(n)) continue;
      perMaand[i] = n;
      gevonden++;
      break;
    }
  }

  if (gevonden < 10) return null;
  const waarden = perMaand.map((n) => n ?? 0);
  const max = Math.max(...waarden);
  const totaal = waarden.reduce((a, b) => a + b, 0);
  // Plausibiliteit: er moet echt een seizoenspatroon in zitten (zomer duidelijk
  // hoger dan winter), anders is er waarschijnlijk iets anders uitgelezen.
  const zomer = (waarden[4] ?? 0) + (waarden[5] ?? 0);
  const winter = (waarden[0] ?? 0) + (waarden[11] ?? 0);
  if (max <= 0 || totaal <= 0 || zomer <= winter) return null;
  return waarden;
}

/** Zet meldingen per maand om in een activiteitsniveau van 0 (inactief) t/m 4 (piek). */
export function niveausUitMaandcijfers(perMaand: number[]): number[] {
  const max = Math.max(...perMaand);
  if (!Number.isFinite(max) || max <= 0) return [];
  return perMaand.map((n) => {
    const deel = n / max;
    if (deel >= 0.8) return 4;
    if (deel >= 0.55) return 3;
    if (deel >= 0.3) return 2;
    if (deel >= 0.1) return 1;
    return 0;
  });
}

export const Route = createFileRoute("/api/public/tbe-activiteit-sync")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { isGeldigeCronAanroep } = await import("@/lib/beveiliging.server");
        if (!(await isGeldigeCronAanroep(request))) {
          return Response.json({ error: "Niet geautoriseerd" }, { status: 401 });
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
      const res = await fetch(url, {
        headers: { "user-agent": "TekenRisicoKaart/1.0 (+https://tekenrisicokaart.nl)" },
      });
      if (!res.ok) continue;
      tekst += " " + tekstUitHtml(await res.text());
      gelezen.push(url);
    } catch {
      /* bron tijdelijk niet bereikbaar — verder met wat wél binnenkwam */
    }
  }

  if (!gelezen.length) {
    await supabaseAdmin.from("datacontrole_log").insert({
      bron_sleutel: "lci_tbe",
      resultaat: "mislukt",
      detail: { reden: "geen enkele RIVM/LCI-bron bereikbaar" },
    });
    return Response.json({ ok: false, reden: "RIVM/LCI-bronnen niet bereikbaar" }, { status: 502 });
  }

  const nu = new Date().toISOString();
  const bijgewerkt: Record<string, string | number | number[]> = {};

  // 1. TBE-meldingen per jaar.
  const jaarcijfers = tbeJaarcijfersUitTekst(tekst);
  const jaren = Object.keys(jaarcijfers).map(Number).sort((a, b) => b - a);
  for (const jaar of jaren) {
    await supabaseAdmin.from("tbe_jaarcijfers").upsert({
      jaar,
      meldingen: jaarcijfers[jaar] ?? 0,
      bron: "RIVM/LCI (automatisch overgenomen)",
      periode: `jaarcijfer ${jaar}`,
      bijgewerkt_op: nu,
    });
  }
  if (jaren.length) bijgewerkt["tbe_jaren"] = jaren;

  // Peildatumtekst van de TBE-bron volgt automatisch uit de gevonden jaren.
  const { data: alleJaren } = await supabaseAdmin
    .from("tbe_jaarcijfers")
    .select("jaar, meldingen")
    .order("jaar", { ascending: false })
    .limit(3);
  if (alleJaren?.length) {
    const zin = alleJaren
      .map((r, i) => (i === 0 ? `${r.meldingen} meldingen in ${r.jaar}` : `${r.meldingen} in ${r.jaar}`))
      .join(alleJaren.length > 2 ? ", " : " en ");
    await supabaseAdmin
      .from("databronnen")
      .update({
        peildatum: `jaarcijfers: ${zin} (automatisch overgenomen uit RIVM/LCI op ${nu.slice(0, 10)})`,
        laatst_gecontroleerd: nu,
      })
      .eq("sleutel", "lci_tbe");
    bijgewerkt["tbe_peildatum"] = zin;
  }

  // 2. Tekenactiviteit per maand.
  const perMaand = maandcijfersUitTekst(tekst);
  const jaarNu = new Date().getMonth() < 2 ? new Date().getFullYear() - 1 : new Date().getFullYear();
  if (perMaand) {
    const niveaus = niveausUitMaandcijfers(perMaand);
    const totaal = perMaand.reduce((a, b) => a + b, 0);
    if (niveaus.length === 12 && totaal > 0) {
      for (let maand = 0; maand < 12; maand++) {
        await supabaseAdmin.from("tekenactiviteit_maand").upsert({
          maand,
          niveau: niveaus[maand] ?? 0,
          aandeel_pct: Math.round(((perMaand[maand] ?? 0) / totaal) * 1000) / 10,
          meldingen: perMaand[maand] ?? 0,
          jaar: jaarNu,
          bron: "RIVM/Tekenradar (automatisch overgenomen)",
          bijgewerkt_op: nu,
        });
      }
      await supabaseAdmin
        .from("tekenradar_cijfers")
        .update({ per_maand: perMaand, bijgewerkt_op: nu })
        .eq("jaar", jaarNu);
      bijgewerkt["tekenactiviteit_maanden"] = 12;
      bijgewerkt["tekenactiviteit_jaar"] = jaarNu;
    }
  }

  const iets = Object.keys(bijgewerkt).length > 0;
  await supabaseAdmin.from("datacontrole_log").insert({
    bron_sleutel: "lci_tbe",
    resultaat: iets ? "bijgewerkt" : "geen wijziging",
    detail: { bronnen: gelezen, bijgewerkt, maandcijfers_gevonden: perMaand != null },
  });

  return Response.json({ ok: true, bronnen: gelezen, bijgewerkt, maandcijfers_gevonden: perMaand != null });
}
