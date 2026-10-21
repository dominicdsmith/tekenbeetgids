import { VERTALINGEN } from "@/data/vertalingen";
import { FRAGMENTEN } from "@/data/vertaalFragmenten";

/**
 * Vertaalmotor: probeert een Nederlandse tekst zo volledig mogelijk naar het
 * Engels om te zetten. De volgorde is: exacte treffer → getalsjabloon →
 * datumnotatie → zin voor zin → fragmentvervanging. Zo worden ook dynamisch
 * samengestelde zinnen (met cijfers en datums) vertaald.
 */

const MAANDEN: Record<string, string> = {
  januari: "January",
  februari: "February",
  maart: "March",
  april: "April",
  mei: "May",
  juni: "June",
  juli: "July",
  augustus: "August",
  september: "September",
  oktober: "October",
  november: "November",
  december: "December",
};

export const norm = (s: string) => s.replace(/\s+/g, " ").trim();

const GETAL = /\d[\d.,]*/g;

function exact(s: string): string | null {
  return VERTALINGEN[s] ?? null;
}

/** Vertaalt een zin waarin cijfers voorkomen via een sjabloon met "#". */
function sjabloon(s: string): string | null {
  if (!GETAL.test(s)) {
    GETAL.lastIndex = 0;
    return null;
  }
  GETAL.lastIndex = 0;
  const getallen = s.match(GETAL) ?? [];
  const sleutel = s.replace(GETAL, "#");
  const en = VERTALINGEN[sleutel];
  if (!en) return null;
  let i = 0;
  return en.replace(/#/g, () => getallen[i++] ?? "#");
}

/** Zet Nederlandse datums en maandnamen om naar Engelse notatie. */
function datums(s: string): string {
  return s.replace(
    /\b(januari|februari|maart|april|mei|juni|juli|augustus|september|oktober|november|december)\b/gi,
    (m) => MAANDEN[m.toLowerCase()] ?? m,
  );
}

let gesorteerd: [string, string][] = [];
function fragmenten(): [string, string][] {
  if (gesorteerd.length === 0) {
    gesorteerd = (Object.entries(FRAGMENTEN) as [string, string][]).sort((a, b) => b[0].length - a[0].length);
  }
  return gesorteerd;
}

const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/** Vervangt bekende Nederlandse woordgroepen binnen een langere zin. */
function fragmentPass(s: string): string {
  let uit = s;
  for (const [nl, en] of fragmenten()) {
    if (!uit.includes(nl)) continue;
    const links = /^[\p{L}]/u.test(nl) ? "(?<![\\p{L}])" : "";
    const rechts = /[\p{L}]$/u.test(nl) ? "(?![\\p{L}])" : "";
    uit = uit.replace(new RegExp(links + esc(nl) + rechts, "gu"), en);
  }
  return uit;
}

function zin(s: string): string {
  const kern = norm(s);
  if (!kern) return s;
  const direct = exact(kern) ?? sjabloon(kern);
  if (direct) return direct;
  const metDatum = datums(kern);
  if (metDatum !== kern) {
    const via = exact(metDatum) ?? sjabloon(metDatum);
    if (via) return via;
  }
  return fragmentPass(metDatum);
}

/**
 * Vertaalt een tekstfragment. Geeft `null` terug wanneer er niets te vertalen
 * valt, zodat de Nederlandse bron ongewijzigd blijft staan.
 */
export function vertaalVrij(waarde: string): string | null {
  const kern = norm(waarde);
  if (kern.length < 2) return null;

  const direct = exact(kern) ?? sjabloon(kern);
  let en: string;
  if (direct) {
    en = direct;
  } else {
    // Zin voor zin: elke zin krijgt zijn eigen kans op een exacte treffer.
    const delen = kern.split(/(?<=[.!?…])\s+/);
    en = delen.length > 1 ? delen.map(zin).join(" ") : zin(kern);
  }

  if (!en || en === kern) return null;
  const voor = waarde.match(/^\s*/)?.[0] ?? "";
  const na = waarde.match(/\s*$/)?.[0] ?? "";
  return voor + en + na;
}
