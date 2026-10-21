import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { JuridischPagina, H2, P } from "@/components/JuridischPagina";
import { ZIEKTEN, ZIEKTE_EXTRA, PROVINCIES, LAATST_BIJGEWERKT, STZ, TBE_CIJFERS } from "@/data/tekenData";
import { useTaal } from "@/lib/taal";
import { vertaalTekst } from "@/lib/vertaling";
import { ziekteKaartLabel } from "@/lib/ziektekaart";
import { GEBIEDSINDICATIE_ZIN, AANWEZIGHEID_ZIN } from "@/components/kaart/KlasseUitleg";

export const Route = createFileRoute("/ziekten/$id")({
  loader: ({ params }) => {
    const ziekte = ZIEKTEN.find((z) => z.id === params.id);
    if (!ziekte) throw notFound();
    return { id: ziekte.id };
  },
  head: ({ params }) => {
    const z = ZIEKTEN.find((x) => x.id === params.id);
    if (!z) return { meta: [{ title: "Ziekte niet gevonden — TekenRisicoKaart" }] };
    const url = `https://tekenrisicokaart.nl/ziekten/${z.id}`;
    const title = `${z.naam} na een tekenbeet — symptomen en behandeling`;
    const description = `${z.naam}: ${z.tekst} Symptomen: ${z.sympt}.`.slice(0, 158);
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "article" },
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
            url,
            about: { "@type": "MedicalCondition", name: z.naam, description: z.tekst },
          }),
        },
      ],
    };
  },
  notFoundComponent: () => (
    <JuridischPagina titel="Ziekte niet gevonden" bijgewerkt={LAATST_BIJGEWERKT}>
      <P>
        <Link to="/ziekten">Bekijk alle tekenbeetziekten</Link>
      </P>
    </JuridischPagina>
  ),
  component: ZiektePagina,
});


function ZiektePagina() {
  const { id } = Route.useLoaderData();
  const z = ZIEKTEN.find((x) => x.id === id);
  const extra = z ? ZIEKTE_EXTRA[z.id] : undefined;
  const en = useTaal() === "en";
  const T = (t: string) => vertaalTekst(t, en);
  if (!z) return null;


  return (
    <JuridischPagina titel={z.naam} bijgewerkt={LAATST_BIJGEWERKT}>
      <P>{T(z.tekst)}</P>
      {z.id === "cchf" && <P>{en ? "International context: this profile does not indicate established circulation in the Netherlands." : "Internationale context: dit profiel duidt niet op aangetoonde circulatie in Nederland."}</P>}
      <P>
        {z.id === "alfagal" ? (en ? "Nature of condition" : "Aard van aandoening") : (en ? "Type of pathogen" : "Type verwekker")}: {T(z.type)}. {z.id !== "alfagal" && <>{en ? "Detection in ticks (NL)" : "Aantoning in teken (NL)"}: {T(z.pct)}.</>}
      </P>
      {z.pctNoot && <P>{T(z.pctNoot)}</P>}
      {(z.id === "rickettsia" || z.id === "babesia") && <P><a href="https://doi.org/10.3389/fcimb.2013.00036" target="_blank" rel="noopener noreferrer">Coipan et al. (2013) · {en ? "questing ticks · PCR/reverse line blot" : "zoekende teken · PCR/reverse line blot"}</a></P>}
      {(["lyme", "rickettsia", "babesia", "miyamotoi", "neoehrlichia", "anaplasma"].includes(z.id)) && <P><a href="https://doi.org/10.1371/journal.pntd.0005042" target="_blank" rel="noopener noreferrer">Jahfari et al. (2016) · PCR · 314 {en ? "ticks" : "teken"}</a>{" · "}<a href="https://www.tekenbeetziekten.nl/de-teek-en-tekenbeetziekten/andere-tekenbeetziekten/algemeen/" target="_blank" rel="noopener noreferrer">Stichting Tekenbeetziekten</a></P>}
      {z.id === "tbe" && <P><a href="https://www.rivm.nl/weblog/IB/teek-away-van-terschelling-IB0325" target="_blank" rel="noopener noreferrer">RIVM · {en ? "Terschelling: several people in 2023" : "Terschelling: een aantal personen in 2023"}</a>{" · "}<a href="https://lci.rivm.nl/richtlijnen/tekenencefalitis" target="_blank" rel="noopener noreferrer">{en ? "RIVM/LCI — published TBE locations" : "RIVM/LCI — gepubliceerde TBE-locaties"}</a></P>}
      {z.id === "tbe" && <><H2>{en ? "Annual notifications: domestic and imported" : "Jaarmeldingen: binnenlands en geïmporteerd"}</H2><P>{T(TBE_CIJFERS)}</P></>}
      <H2>{en ? "Symptoms" : "Symptomen"}</H2>
      <P>{T(z.sympt)}</P>
      {extra && (
        <>
          <H2>{en ? "Incubation period" : "Incubatietijd"}</H2>
          <P>{T(extra.incubatie)}</P>
          <H2>{z.id === "alfagal" ? (en ? "Association with tick bites" : "Verband met tekenbeten") : (en ? "Transmission" : "Overdracht")}</H2>
          <P>{T(extra.overdracht)}</P>
          {z.id === "lyme" && <P>{en
            ? "A small red spot appearing within 24 hours of a tick bite and then fading is usually a local irritation or hypersensitivity reaction. Timing alone does not determine the cause. An expanding or persistent patch needs assessment by a doctor; this page cannot diagnose erythema migrans."
            : "Een kleine rode vlek die binnen 24 uur na de beet ontstaat en daarna afneemt, is meestal een lokale irritatie- of overgevoeligheidsreactie. Alleen het tijdstip bepaalt de oorzaak niet. Een groter wordende of aanhoudende vlek vraagt beoordeling door een arts; deze pagina stelt geen EM-diagnose."}</P>}
          {(z.id === "tbe" || z.id === "lyme") && <P><a href={z.id === "tbe" ? "https://lci.rivm.nl/richtlijnen/tekenencefalitis" : "https://lci.rivm.nl/richtlijnen/lymeziekte"} target="_blank" rel="noopener noreferrer">{en ? "Source: RIVM/LCI guideline" : "Bron: RIVM/LCI-richtlijn"}</a></P>}
          <H2>{en ? "Treatment" : "Behandeling"}</H2>
          <P>{T(extra.behandeling)}</P>
          {z.id === "lyme" && <P><a href="https://richtlijnen.nhg.org/standaarden/tekenbeet-en-erythema-migrans" target="_blank" rel="noopener noreferrer">{en ? "Source: NHG guideline — tick bite and erythema migrans" : "Bron: NHG-Standaard Tekenbeet en erythema migrans"}</a></P>}
          <P>{en ? "General information from sources, not an individual prescription. A doctor determines treatment, medicines and duration. Independent medical review of these profiles remains necessary." : "Algemene broninformatie, geen individueel voorschrift. Een arts bepaalt behandeling, middelen en duur. Onafhankelijke medische controle van deze profielen blijft nodig."}</P>
          <H2>{en ? "Information for a discussion with a doctor" : "Informatie voor een gesprek met een arts"}</H2>
          <P>{T(extra.arts)}</P>
          <P>{T(extra.weetje)}</P>
        </>
      )}
      <H2>{en ? "Risk indication by province" : "Risico-indicatie per provincie"}</H2>
      <P>{T(GEBIEDSINDICATIE_ZIN)}</P>
      <P>{T(AANWEZIGHEID_ZIN)}</P>
      <P>{T(ziekteKaartLabel(z))}</P>
      {z.id === "tbe" && <ul>{PROVINCIES.map((p) => <li key={p.id}>{p.naam}: {T(ziekteKaartLabel(z, p))}. {T(p.tbeBron ?? "")}</li>)}</ul>}
      <P>
        {en ? "This is general information, not medical advice." : "Dit is voorlichting en geen medisch advies."}{" "}
        <Link to="/ziekten" style={{ color: STZ.terra, fontWeight: 700 }}>
          {en ? "All tick-borne diseases" : "Alle tekenbeetziekten"}
        </Link>
      </P>
    </JuridischPagina>
  );
}
