import { createFileRoute, Link } from "@tanstack/react-router";
import { JuridischPagina, P } from "@/components/JuridischPagina";
import { ZIEKTEN, LAATST_BIJGEWERKT, STZ } from "@/data/tekenData";
import { useTaal } from "@/lib/taal";
import { vertaalTekst } from "@/lib/vertaling";

const title = "Teken en tekenbeten — overzicht van 11 aandoeningen";
const description =
  "Overzicht van 11 aandoeningen die met teken en tekenbeten samenhangen, met per aandoening de bewijsstatus, symptomen, overdracht en behandeling.";
const url = "https://tekenrisicokaart.nl/ziekten";

export const Route = createFileRoute("/ziekten/")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { property: "og:url", content: url },
      { name: "twitter:card", content: "summary" },
    ],
    links: [{ rel: "canonical", href: url }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "MedicalWebPage",
          name: title,
          description,
          url,
          inLanguage: "nl-NL",
          mainEntity: {
            "@type": "ItemList",
            numberOfItems: ZIEKTEN.length,
            itemListElement: ZIEKTEN.map((z, i) => ({
              "@type": "ListItem",
              position: i + 1,
              url: `${url}/${z.id}`,
              item: {
                "@type": "MedicalCondition",
                name: z.naam,
                url: `${url}/${z.id}`,
                signOrSymptom: { "@type": "MedicalSignOrSymptom", name: z.sympt },
              },
            })),
          },
        }),
      },
    ],
  }),
  component: ZiektenOverzicht,
});

function ZiektenOverzicht() {
  const en = useTaal() === "en";
  const T = (t: string) => vertaalTekst(t, en);
  return (
    <JuridischPagina titel="Tekenbeetziekten in Nederland" bijgewerkt={LAATST_BIJGEWERKT}>
      <P>
        {en
          ? "Below are 11 conditions associated with ticks and tick bites in the Netherlands. Choose a disease for symptoms, incubation period, transmission and treatment. This is general information, not medical advice."
          : "Hieronder staan 11 aandoeningen die in Nederland met teken en tekenbeten in verband worden gebracht. Kies een ziekte voor symptomen, incubatietijd, overdracht en behandeling. Dit is voorlichting en geen medisch advies."}
      </P>
      <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: 8 }}>
        {ZIEKTEN.map((z) => (
          <li key={z.id} style={{ borderLeft: `4px solid ${z.kleur}`, paddingLeft: 10 }}>
            <Link to="/ziekten/$id" params={{ id: z.id }} style={{ color: STZ.terra, fontWeight: 700 }}>
              {T(z.naam)}
            </Link>
            {z.id === "cchf" && <div>{en ? "International context — no established circulation in the Netherlands" : "Internationale context — geen aangetoonde circulatie in Nederland"}</div>}
            {z.zoonose && <span className="text-xs font-semibold text-primary">{en ? "Zoonosis" : "Zoönose"}</span>}
            <div style={{ fontSize: 12 }}>{T(z.sympt)}</div>
          </li>
        ))}
      </ul>
    </JuridischPagina>
  );
}
