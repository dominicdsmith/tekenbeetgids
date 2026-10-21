import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ZIEKTEN, PROVINCIES, TEKENBEET_AANTAL } from "@/data/tekenData";
import { berekenProvincieKaart } from "@/lib/provincieklassen";

/**
 * Live cijfers uit de database.
 *
 * De percentages per tekenbeetziekte, de risicoklassen per provincie en het
 * geschatte aantal tekenbeten worden niet meer met de hand in de broncode
 * gezet, maar komen uit de tabellen `ziekte_cijfers` en `provincie_cijfers`.
 * Die worden automatisch bijgewerkt door de RIVM-synchronisatie
 * (`/api/public/rivm-sync`). De waarden in `tekenData.ts` blijven bestaan als
 * terugvaloptie zolang de database niet bereikbaar is.
 */

export type ProvincieCijfer = {
  provincieId: string;
  meldingen: number | null;
  tekenbeetAantal: number | null;
  risk: number | null;
  bron: string | null;
  periode: string | null;
  inwoners?: number | null;
  tbeGevallen?: number | null;
  meldingenPer100k?: number | null;
  tbePer100k?: number | null;
  habitatFactor?: number | null;
  score?: number | null;
  tbeMultiplier?: number | null;
};

export type LiveCijfers = {
  stempel: string;
  provincies: Record<string, ProvincieCijfer>;
  bijgewerktOp: string | null;
  /** Automatisch berekende klassegrenzen (gewogen score). */
  grensLabels: string[];
};

const leeg: LiveCijfers = { stempel: "bron", provincies: {}, bijgewerktOp: null, grensLabels: [] };

async function haalCijfers(): Promise<LiveCijfers> {
  const [z, p] = await Promise.all([
    supabase
      .from("ziekte_cijfers")
      .select("ziekte_id, naam, pct, pct_noot, risk, volgorde, actief, bijgewerkt_op")
      .order("volgorde", { ascending: true }),
    supabase
      .from("provincie_cijfers")
      .select(
        "provincie_id, meldingen, tekenbeet_aantal, risk, bron, periode, bijgewerkt_op, inwoners, tbe_gevallen, meldingen_per_100k, tbe_per_100k, habitat_factor",
      ),
  ]);
  if (z.error || p.error) return leeg;

  let laatste: string | null = null;
  const bij = (d: string | null) => { if (d && (!laatste || d > laatste)) laatste = d; };

  // Lijst en percentages komen uit de databron: volgorde, zichtbaarheid, naam
  // en percentage worden overgenomen zoals ze in `ziekte_cijfers` staan.
  const volgordeVan = new Map<string, number>();
  const zichtbaar = new Set<string>();
  for (const rij of z.data ?? []) {
    const ziekte = ZIEKTEN.find((x) => x.id === rij.ziekte_id);
    if (!ziekte) continue;
    const reviewed = ["tbe", "lyme", "rickettsia", "babesia", "miyamotoi", "neoehrlichia", "anaplasma", "bartonella"].includes(ziekte.id);
    if (rij.naam && !reviewed) ziekte.naam = rij.naam;
    if (rij.pct && !reviewed) ziekte.pct = rij.pct;
    if (rij.pct_noot && !reviewed) ziekte.pctNoot = rij.pct_noot;
    const risk = rij.risk as Record<string, number> | null;
    if (!reviewed && risk && typeof risk === "object") {
      for (const [prov, waarde] of Object.entries(risk)) {
        if (typeof waarde === "number") ziekte.risk[prov] = waarde;
      }
    }
    volgordeVan.set(rij.ziekte_id, rij.volgorde ?? 100);
    if (rij.actief !== false) zichtbaar.add(rij.ziekte_id);
    bij(rij.bijgewerkt_op);
  }

  if (volgordeVan.size) {
    const nieuw = ZIEKTEN.filter((x) => !volgordeVan.has(x.id) || zichtbaar.has(x.id)).sort(
      (a, b) => (volgordeVan.get(a.id) ?? 100) - (volgordeVan.get(b.id) ?? 100),
    );
    ZIEKTEN.splice(0, ZIEKTEN.length, ...nieuw);
  }


  const provincies: Record<string, ProvincieCijfer> = {};
  for (const rij of p.data ?? []) {
    provincies[rij.provincie_id] = {
      provincieId: rij.provincie_id,
      meldingen: rij.meldingen,
      tekenbeetAantal: rij.tekenbeet_aantal,
      risk: rij.risk,
      bron: rij.bron,
      periode: rij.periode,
      inwoners: rij.inwoners,
      tbeGevallen: rij.tbe_gevallen,
      meldingenPer100k: rij.meldingen_per_100k == null ? null : Number(rij.meldingen_per_100k),
      tbePer100k: rij.tbe_per_100k == null ? null : Number(rij.tbe_per_100k),
      habitatFactor: rij.habitat_factor == null ? null : Number(rij.habitat_factor),
    };
    if (rij.tekenbeet_aantal != null) TEKENBEET_AANTAL[rij.provincie_id] = rij.tekenbeet_aantal;
    bij(rij.bijgewerkt_op);
  }

  // Provinciekaart opnieuw genereren uit TBE-cijfers en CBS-inwonertal: zowel de
  // klasse per provincie als de klassegrenzen volgen automatisch uit de cijfers.
  const berekening = berekenProvincieKaart(
    Object.values(provincies).map((c) => ({
      provincieId: c.provincieId,
      meldingen: c.meldingen,
      inwoners: c.inwoners ?? null,
      tbeGevallen: c.tbeGevallen ?? null,
      habitatFactor: c.habitatFactor ?? null,
    })),
  );
  for (const b of berekening.provincies) {
    const cijfer = provincies[b.provincieId];
    if (cijfer) {
      cijfer.risk = b.klasse;
      cijfer.meldingenPer100k = b.meldingenPer100k;
      cijfer.tbePer100k = b.tbePer100k;
      cijfer.score = b.score;
      cijfer.tbeMultiplier = b.tbeMultiplier;
    }
    const prov = PROVINCIES.find((x) => x.id === b.provincieId);
    if (prov) prov.risk = b.klasse;
  }
  // Provincies zonder berekening houden de opgeslagen klasse uit de database.
  for (const cijfer of Object.values(provincies)) {
    const prov = PROVINCIES.find((x) => x.id === cijfer.provincieId);
    if (prov && !berekening.provincies.some((b) => b.provincieId === cijfer.provincieId) && cijfer.risk != null) {
      prov.risk = cijfer.risk;
    }
  }

  return {
    stempel: `db-${laatste ?? "onbekend"}-${berekening.grenzen.join("|")}`,
    provincies,
    grensLabels: berekening.grensLabels,
    bijgewerktOp: laatste,
  };
}

export function useLiveCijfers(): LiveCijfers {
  const { data } = useQuery({
    queryKey: ["live-cijfers"],
    staleTime: 30 * 60 * 1000,
    queryFn: haalCijfers,
  });
  return data ?? leeg;
}

export type TekenradarJaar = {
  jaar: number;
  meldingen: number;
  perMaand: number[];
  veranderingPct: number | null;
  bron: string | null;
  periode: string | null;
};

/**
 * Tekenradar-jaarcijfers als echte dataset: het aantal doorgegeven tekenbeten
 * per jaar (en waar beschikbaar per maand). Wordt automatisch bijgewerkt door
 * de RIVM-synchronisatie; de seizoenskaart rekent hiermee.
 */
export function useTekenradarCijfers(): TekenradarJaar[] {
  const { data } = useQuery({
    queryKey: ["tekenradar-cijfers"],
    staleTime: 30 * 60 * 1000,
    queryFn: async (): Promise<TekenradarJaar[]> => {
      const { data, error } = await supabase
        .from("tekenradar_cijfers")
        .select("jaar, meldingen, per_maand, verandering_pct, bron, periode")
        .order("jaar", { ascending: false });
      if (error || !data) return [];
      return data.map((r) => ({
        jaar: r.jaar,
        meldingen: r.meldingen,
        perMaand: Array.isArray(r.per_maand) ? (r.per_maand as unknown[]).map((n) => Number(n) || 0) : [],
        veranderingPct: r.verandering_pct == null ? null : Number(r.verandering_pct),
        bron: r.bron,
        periode: r.periode,
      }));
    },
  });
  return data ?? [];
}

export type TbeHistorieJaar = { jaar: number; gevallen: number };

/**
 * Historische humane TBE-gevallen per provincie (RIVM), zodat het verloop over
 * de jaren zichtbaar is. Wordt bijgehouden door de RIVM-synchronisatie.
 */
export function useTbeHistorie(): Record<string, TbeHistorieJaar[]> {
  const { data } = useQuery({
    queryKey: ["tbe-historie"],
    staleTime: 30 * 60 * 1000,
    queryFn: async (): Promise<Record<string, TbeHistorieJaar[]>> => {
      const { data, error } = await supabase
        .from("tbe_provincie_historie")
        .select("jaar, provincie_id, tbe_gevallen")
        .order("jaar", { ascending: true });
      if (error || !data) return {};
      const uit: Record<string, TbeHistorieJaar[]> = {};
      for (const r of data) {
        (uit[r.provincie_id] ??= []).push({ jaar: r.jaar, gevallen: r.tbe_gevallen });
      }
      return uit;
    },
  });
  return data ?? {};
}

export type ZiekteHistorieJaar = { jaar: number; meldingen: number; geschat: boolean };

/**
 * Historische meldingen per tekenbeetziekte per provincie, zodat het verloop
 * van elke ziekte per provincie in kaart wordt gebracht. Sleutel:
 * `${ziekteId}|${provincieId}`.
 */
export function useZiekteHistorie(): Record<string, ZiekteHistorieJaar[]> {
  const { data } = useQuery({
    queryKey: ["ziekte-provincie-historie"],
    staleTime: 30 * 60 * 1000,
    queryFn: async (): Promise<Record<string, ZiekteHistorieJaar[]>> => {
      const { data, error } = await supabase
        .from("ziekte_provincie_meldingen")
        .select("ziekte_id, provincie_id, jaar, meldingen, geschat")
        .order("jaar", { ascending: true })
        .limit(5000);
      if (error || !data) return {};
      const uit: Record<string, ZiekteHistorieJaar[]> = {};
      for (const r of data) {
        if (r.jaar == null) continue;
        (uit[`${r.ziekte_id}|${r.provincie_id}`] ??= []).push({
          jaar: r.jaar,
          meldingen: r.meldingen ?? 0,
          geschat: !!r.geschat,
        });
      }
      return uit;
    },
  });
  return data ?? {};
}

export type TbeJaarcijfer = { jaar: number; meldingen: number; bron: string | null };

/**
 * Humane TBE-meldingen per jaar (RIVM/LCI). Wordt automatisch bijgewerkt door
 * `/api/public/tbe-activiteit-sync`, zodat deze cijfers niet meer met de hand
 * worden opgezocht of ingetypt.
 */
export function useTbeJaarcijfers(): TbeJaarcijfer[] {
  const { data } = useQuery({
    queryKey: ["tbe-jaarcijfers"],
    staleTime: 30 * 60 * 1000,
    queryFn: async (): Promise<TbeJaarcijfer[]> => {
      const { data, error } = await supabase
        .from("tbe_jaarcijfers")
        .select("jaar, meldingen, bron")
        .order("jaar", { ascending: false });
      if (error || !data) return [];
      return data.map((r) => ({ jaar: r.jaar, meldingen: r.meldingen, bron: r.bron }));
    },
  });
  return data ?? [];
}

/** Zin met de laatste drie TBE-jaarcijfers, of `null` als de bron nog leeg is. */
export function tbeCijfersZin(cijfers: TbeJaarcijfer[]): string | null {
  const laatste = cijfers.slice(0, 3);
  if (!laatste.length) return null;
  const delen = laatste.map((r, i) => (i === 0 ? `${r.meldingen} TBE-meldingen in ${r.jaar}` : `${r.meldingen} in ${r.jaar}`));
  const zin = delen.length > 1 ? `${delen.slice(0, -1).join(", ")} en ${delen[delen.length - 1]}` : delen[0];
  const selectie2025 = laatste.some((r) => r.jaar === 2025 && r.meldingen === 25 && laatste.every((x) => x.jaar <= 2025));
  const periode = selectie2025 ? " Gebruikte Osiris-AIZ-selectie (10 maart 2026), nog niet onafhankelijk geverifieerd." : " Jaarcijfers kunnen na aanvulling wijzigen.";
  const seizoen = laatste.every((r) => r.jaar < 2026) ? " Het seizoen 2026 is niet inbegrepen." : "";
  return `Gebruikte meldingscijfers (opgegeven bron: RIVM/LCI; bronselectie niet onafhankelijk geverifieerd): ${zin}. Meldingen omvatten zowel in Nederland als in het buitenland opgelopen infecties; dit is geen telling van uitsluitend binnenlandse infecties.${periode}${seizoen}`;
}

export type MaandActiviteit = { maand: number; niveau: number; aandeelPct: number | null; bron: string | null };

/**
 * Tekenactiviteit per maand uit de database. De niveaus (0 = inactief t/m
 * 4 = piekseizoen) worden automatisch afgeleid uit de tekenbeetmeldingen per
 * maand van RIVM/Tekenradar. Is de tabel leeg, dan valt de site terug op het
 * vaste seizoenspatroon in `tekenData.ts`.
 */
export function useTekenactiviteit(): Record<number, MaandActiviteit> {
  const { data } = useQuery({
    queryKey: ["tekenactiviteit-maand"],
    staleTime: 30 * 60 * 1000,
    queryFn: async (): Promise<Record<number, MaandActiviteit>> => {
      const { data, error } = await supabase
        .from("tekenactiviteit_maand")
        .select("maand, niveau, aandeel_pct, bron")
        .order("maand", { ascending: true });
      if (error || !data) return {};
      const uit: Record<number, MaandActiviteit> = {};
      for (const r of data) {
        uit[r.maand] = {
          maand: r.maand,
          niveau: r.niveau,
          aandeelPct: r.aandeel_pct == null ? null : Number(r.aandeel_pct),
          bron: r.bron,
        };
      }
      return uit;
    },
  });
  return data ?? {};
}
