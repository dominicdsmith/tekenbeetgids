import { PEILDATUM_AUTO } from "@/data/appVersie";

const maanden: Record<string, string> = {
  januari: "January", februari: "February", maart: "March", april: "April",
  mei: "May", juni: "June", juli: "July", augustus: "August",
  september: "September", oktober: "October", november: "November", december: "December",
};

export default function InhoudsDatum({ en, gids = false }: { en: boolean; gids?: boolean }) {
  const datum = en
    ? PEILDATUM_AUTO.replace(/[a-z]+/g, (maand) => maanden[maand] ?? maand)
    : PEILDATUM_AUTO;
  return <>{en ? "Information last updated" : "Informatie laatst bijgewerkt"}: {datum}.{gids
    ? ` ${en ? "Based on general public guidance (including RIVM). This is an informative guide, not medical advice." : "Gebaseerd op algemene publieksinformatie (o.a. RIVM). Dit is een informatieve gids, geen medisch advies."}`
    : ""}</>;
}