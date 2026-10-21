import { VERTALINGEN } from "@/data/vertalingen";
import { vertaalVrij } from "@/lib/vertaalMotor";

const norm = (s: string) => s.replace(/\s+/g, " ").trim();

/**
 * Zoekt een Nederlandse tekst op in de vertaaldatabase. Zonder treffer blijft
 * de Nederlandse bron staan, zodat er nooit lege tekst ontstaat.
 */
export function vertaalTekst(nl: string, en = true): string {
  if (!en) return nl;
  const kern = norm(nl);
  if (!kern) return nl;
  const direct = VERTALINGEN[kern];
  if (direct) {
    const voor = nl.match(/^\s*/)?.[0] ?? "";
    const na = nl.match(/\s*$/)?.[0] ?? "";
    return voor + direct + na;
  }
  // "Label: waarde" — vertaal het label als de hele regel niet in de database staat.
  const i = kern.indexOf(": ");
  if (i > 0) {
    const label = VERTALINGEN[kern.slice(0, i)];
    if (label) return `${label}: ${kern.slice(i + 2)}`;
  }
  return vertaalVrij(nl) ?? nl;
}

/** Kiest de gekozen taal en valt terug op de vertaaldatabase. */
export function tekst(nl: string, en: boolean, engels?: string): string {
  if (!en) return nl;
  return engels ?? vertaalTekst(nl, true);
}
