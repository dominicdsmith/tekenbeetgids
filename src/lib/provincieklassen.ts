/**
 * Automatische herberekening van de provinciekaart.
 *
 * De risicoklasse per provincie wordt niet meer met de hand vastgelegd, maar
 * afgeleid uit de cijfers in de database:
 *  - tekenbeetmeldingen per 100.000 inwoners (CBS-inwonertal), gewogen met habitat, en
 * TBE-meldingen blijven afzonderlijk: woonprovincie bewijst geen lokale blootstelling.
 *
 * Ook de klassegrenzen worden berekend (vijf gelijke stappen over de werkelijke
 * spreiding), zodat de kaart en de legenda automatisch meebewegen als de
 * cijfers veranderen.
 */

export type ProvincieInvoer = {
  provincieId: string;
  meldingen: number | null;
  inwoners: number | null;
  tbeGevallen: number | null;
  /** Aandeel bos-, heide- en duinhabitat t.o.v. het landelijk gemiddelde (1,0). */
  habitatFactor?: number | null;
};

export type ProvincieBerekening = {
  provincieId: string;
  meldingenPer100k: number;
  tbePer100k: number;
  tbeMultiplier: number;
  score: number;
  klasse: number; // 1 t/m 5, sluit aan op RISK/RISK_LBL
};

export type KaartBerekening = {
  provincies: ProvincieBerekening[];
  /** Vier bovengrenzen (score) tussen de vijf klassen, oplopend. */
  grenzen: number[];
  /** Leesbare omschrijving van de klassegrenzen, in gewogen score-eenheden. */
  grensLabels: string[];
};

const per100k = (aantal: number | null, inwoners: number | null) =>
  aantal != null && inwoners != null && inwoners > 0 ? (aantal / inwoners) * 100000 : 0;

const rond = (n: number, d = 1) => Math.round(n * 10 ** d) / 10 ** d;

export function berekenProvincieKaart(rijen: ProvincieInvoer[]): KaartBerekening {
  const bruikbaar = rijen.filter((r) => (r.inwoners ?? 0) > 0 && (r.meldingen ?? 0) > 0);
  if (!bruikbaar.length) return { provincies: [], grenzen: [], grensLabels: [] };

  // Score: meldingen per 100.000 inwoners (CBS), gewogen met het aandeel
  // tekenhabitat. TBE-tellingen zijn geen lokale blootstellingsmaat en wegen niet mee.
  const basis = bruikbaar.map((r) => {
    const m = per100k(r.meldingen, r.inwoners);
    const t = per100k(r.tbeGevallen ?? 0, r.inwoners);
    const habitat = r.habitatFactor && r.habitatFactor > 0 ? r.habitatFactor : 1;
    return { provincieId: r.provincieId, meldingenPer100k: m, tbePer100k: t, tbeMultiplier: 1, score: m * habitat };
  });

  // Klassegrenzen volgen de werkelijke spreiding: vijf even brede stappen
  // tussen de laagste en de hoogste score. Veranderen de cijfers, dan
  // verschuiven de grenzen automatisch mee.
  const scores = basis.map((b) => b.score);
  const min = Math.min(...scores);
  const max = Math.max(...scores);
  const stap = (max - min) / 5 || 1;
  const grenzen = [1, 2, 3, 4].map((i) => min + stap * i);

  const klasseVan = (score: number) => {
    let k = 1;
    for (const g of grenzen) if (score > g) k += 1;
    return Math.min(5, k);
  };

  const provincies = basis
    .map((b) => ({
      provincieId: b.provincieId,
      meldingenPer100k: rond(b.meldingenPer100k),
      tbePer100k: rond(b.tbePer100k, 2),
      tbeMultiplier: b.tbeMultiplier,
      score: rond(b.score),
      klasse: klasseVan(b.score),
    }))
    .sort((a, b) => b.score - a.score);

  const g = grenzen.map((x) => rond(x));
  const grensLabels = [
    `Zeer laag: ≤ ${g[0]}`,
    `Laag: > ${g[0]} en ≤ ${g[1]}`,
    `Matig: > ${g[1]} en ≤ ${g[2]}`,
    `Hoog: > ${g[2]} en ≤ ${g[3]}`,
    `Zeer hoog: > ${g[3]}`,
  ];

  return { provincies, grenzen, grensLabels };
}
