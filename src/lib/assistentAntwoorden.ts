import { ASSISTENT_ONDERWERPEN } from "@/data/informatieAssistent";

export const ASSISTENT_ANTWOORDEN = ASSISTENT_ONDERWERPEN.flatMap((onderwerp) =>
  onderwerp.vragen.map((vraag, index) => ({ id: `${onderwerp.id}:${index}`, onderwerp, ...vraag })),
);
export function medischeVraag(tekst: string): boolean {
  return /\b(diagnos\w*|sympto\w*|antibioti\w*|medic(?:ijn|atie)\w*|dosis|dosering|behandel\w*|treat\w*|medication|dosage|emergency|urgent|spoed|huisarts|doctor|infect(?:ie|ion)|besmet|koorts|fever|pijn|pain|rash|uitslag|rode vlek|red (?:spot|patch)|allerg\w*)\b/i.test(
    tekst,
  );
}
export function gecontroleerdAntwoord(selectie: unknown, taal: "nl" | "en") {
  if (!selectie || typeof selectie !== "object") return { tekst: onbekend(taal) };
  const keuze = selectie as { status?: unknown; antwoordId?: unknown };
  if (keuze.status === "medical") return { tekst: medisch(taal) };
  if (keuze.status !== "answer" || typeof keuze.antwoordId !== "string")
    return { tekst: onbekend(taal) };
  const antwoord = ASSISTENT_ANTWOORDEN.find((item) => item.id === keuze.antwoordId);
  if (!antwoord) return { tekst: onbekend(taal) };
  return { tekst: antwoord.antwoord[taal], onderwerp: antwoord.onderwerp };
}
export function medisch(taal: "nl" | "en") {
  return taal === "en"
    ? "I cannot answer medical questions or assess symptoms, photos, infection risk, treatment or the need for medical care. I can provide information about the websites, their sources, privacy and the guide."
    : "Ik kan geen medische vragen beantwoorden of klachten, foto’s, infectiekansen, behandelingen of de noodzaak van medische hulp beoordelen. Ik kan wel informatie geven over de websites, bronnen, privacy en de gids.";
}
export function onbekend(taal: "nl" | "en") {
  return taal === "en"
    ? "There is no reviewed answer to this question in the website information available to me. I do not search the internet or add information from other sources."
    : "Voor deze vraag staat geen gecontroleerd antwoord in de website-informatie die ik kan gebruiken. Ik zoek niet op internet en vul geen informatie aan uit andere bronnen.";
}
