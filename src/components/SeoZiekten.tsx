import { Link } from "@tanstack/react-router";
import { ZIEKTEN, ZIEKTE_EXTRA, RISK_LBL, PROVINCIES, TBE_STATUS_LBL, TBE_HAARDEN_ZIN, TBE_CRITERIUM, MELDINGSBIAS_KORT, TUINBEET_PCT, TUINBEET_TOELICHTING, TUINBEET_BRON, TEKENBEET_AANTAL, TEKENBEET_TOELICHTING, TEKENBEET_BRON, TEKENRADAR_2025, PEILDATUM, LAATST_BIJGEWERKT, DATA_PEILDATUM, ZIEKTESCHAAL_UITLEG, TBE_CIJFERS } from "@/data/tekenData";
import { ziekteKaartLabel } from "@/lib/ziektekaart";
import { useTaal } from "@/lib/taal";
import { vertaalTekst } from "@/lib/vertaling";

/**
 * Statische, server-gerenderde beschrijving van alle tekenbeetziekten.
 * Deze inhoud staat altijd in de HTML (ook zonder JavaScript of zonder dat de
 * gebruiker het tabblad "Tekenbeetziekten" opent), zodat zoekmachines en
 * schermlezers de volledige informatie kunnen lezen.
 * Visueel verborgen (niet display:none) omdat de kaart-interface zelf al
 * dezelfde informatie interactief toont.
 */
const verborgen: React.CSSProperties = {
  position: "absolute",
  width: 1,
  height: 1,
  padding: 0,
  margin: -1,
  overflow: "hidden",
  clip: "rect(0 0 0 0)",
  clipPath: "inset(50%)",
  whiteSpace: "nowrap",
  border: 0,
};
export default function SeoZiekten() {
  const en = useTaal() === "en";
  const T = (tekst: string) => vertaalTekst(tekst, en);
  if (en) {
    return (
      <section style={verborgen} aria-label="Tick-borne diseases in the Netherlands — text description">
        <h2>Tick-borne diseases in the Netherlands</h2>
        <p>Overview of {ZIEKTEN.length} conditions associated with ticks and tick bites. Evidence differs by condition: the human disease role of R. helvetica is uncertain, alpha-gal is an allergy, Bartonella has no proven tick-borne route and CCHF is included only as international travel context. This is general information, not medical advice.</p>
        <ul>{ZIEKTEN.map((z) => <li key={z.id}><strong>{T(z.naam)}</strong>: {T(z.tekst)} Symptoms: {T(z.sympt)}</li>)}</ul>
        <h2>Tick risk and TBE status by province</h2>
        <p>Province classes are relative indications based on reports per 100,000 inhabitants, habitat only; TBE notifications do not contribute, not measured tick density. TBE occurs in small local clusters; detection in a province does not mean it occurs throughout that province, and lack of detection does not rule out risk.</p>
        <ul>{PROVINCIES.map((p) => <li key={p.id}>{p.naam}: relative risk indication {T(RISK_LBL[p.risk] ?? "unknown")}.</li>)}</ul>
        <p>Record skin changes or symptoms after a tick bite and discuss questions with a doctor. This page does not assess an individual situation.</p>
      </section>
    );
  }
  return (
    <section style={verborgen} aria-label={T("Tekenbeetziekten in Nederland — tekstuele beschrijving")}>
      <h2>{T("Tekenbeetziekten in Nederland")}</h2>
      <p>
        {`Overzicht van ${ZIEKTEN.length} aandoeningen die met teken en tekenbeten in verband worden gebracht. De bewijsstatus verschilt per aandoening: de ziekterol van R. helvetica is onzeker, alfa-gal is een allergie, Bartonella heeft geen bewezen tekenroute en CCHF staat alleen als internationale reizigerscontext in het overzicht. Dit is voorlichting en geen medisch advies.`}
      </p>
      <p>{T(ZIEKTESCHAAL_UITLEG)}</p>
      {ZIEKTEN.map((z) => {
        const extra = ZIEKTE_EXTRA[z.id];
        return (
          <article key={z.id}>
            <h3><Link to="/ziekten/$id" params={{ id: z.id }}>{T(z.naam)}</Link></h3>
            <p>
              {z.id === "alfagal" ? (en ? "Nature of condition" : "Aard van aandoening") : (en ? "Type of pathogen" : "Type verwekker")}: {T(z.type)}. {z.id !== "alfagal" && <>Aantoning in teken (NL): {T(z.pct)}.</>} {T(ziekteKaartLabel(z))}.
              {z.zoonose && (en ? " This is a zoonosis: a disease that can pass from animals to humans." : " Dit is een zoönose: een ziekte die van dier op mens kan overgaan.")}
            </p>
            {z.pctNoot && <p>{en ? "Notes on this figure" : "Toelichting bij dit cijfer"}: {T(z.pctNoot)}</p>}
            <p>{T(z.tekst)}</p>
            <p>{en ? "Symptoms" : "Symptomen"}: {T(z.sympt)}</p>
            {extra && (
              <>
                <p>{en ? "Incubation period" : "Incubatietijd"}: {T(extra.incubatie)}</p>
                <p>{en ? "Transmission" : "Overdracht"}: {T(extra.overdracht)}</p>
                <p>{en ? "Treatment" : "Behandeling"}: {T(extra.behandeling)}</p>
                <p>{en ? "When to contact your GP" : "Naar de huisarts"}: {T(extra.arts)}</p>
                <p>{T(extra.weetje)}</p>
              </>
            )}
          </article>
        );
      })}
      <h2>{en ? "Tick risk and TBE status by province" : "Tekenrisico en TBE-status per provincie"}</h2>
      <p>{T(MELDINGSBIAS_KORT)}</p>
      <p>{T(TBE_CRITERIUM)}</p>
      <p>{T(TBE_HAARDEN_ZIN)}</p>
      <p>{T(TBE_CIJFERS)}</p>
      <p>{T(TUINBEET_TOELICHTING)} {en ? "Source" : "Bron"}: {T(TUINBEET_BRON.naam)} — <a href={TUINBEET_BRON.url} target="_blank" rel="noopener noreferrer">{TUINBEET_BRON.label}</a>.</p>
      <p>{T(TEKENBEET_TOELICHTING)} {en ? "Source" : "Bron"}: {T(TEKENBEET_BRON.naam)} — <a href={TEKENBEET_BRON.url} target="_blank" rel="noopener noreferrer">{TEKENBEET_BRON.label}</a>.</p>
      <ul>
        {PROVINCIES.map((p) => (
          <li key={p.id}>
            {p.naam}: {en ? "relative risk indication" : "relatieve risico-indicatie"} {T(RISK_LBL[p.risk] ?? "")}.{" "}
            {p.tbeStatus === "geen"
              ? T("TBE nog niet aangetoond — uitsluiting niet mogelijk.")
              : `TBE: ${T(TBE_STATUS_LBL[p.tbeStatus])}.`}{" "}
            {p.tbeBron ? `${en ? "Evidence" : "Bewijs"}: ${T(p.tbeBron)}` : ""} {en ? "Estimated number of tick bites per year" : "Geschat aantal tekenbeten per jaar"}: {en ? "approximately" : "circa"} {(TEKENBEET_AANTAL[p.id] ?? 0).toLocaleString(en ? "en-GB" : "nl-NL")} ({en ? "source" : "bron"}: {T(TEKENBEET_BRON.naam)}). {en ? "Tick bites in one's own garden" : "Tekenbeten in de eigen tuin"}: {T(TUINBEET_PCT[p.id] ?? "onbekend")} ({en ? "source" : "bron"}: {T(TUINBEET_BRON.naam)}). {T(p.samenvatting)}

          </li>
        ))}
      </ul>
      <p>{T(TEKENRADAR_2025)}</p>
      <p>
        {en ? "Sources automatically checked" : "Bronnen automatisch gecontroleerd"}: {T(PEILDATUM)}. {en ? "Website content updated" : "Website-inhoud bijgewerkt"}: {T(LAATST_BIJGEWERKT)}. {en ? "Reference date" : "Peildatum"} {T(DATA_PEILDATUM)}.
      </p>
      <p>
        {en ? "Record an expanding red or bluish-red patch or ring, or other new symptoms after a tick bite, and discuss them with a doctor. This page does not assess an individual situation." : "Leg een groter wordende rode of blauwrode vlek of ring, of andere nieuwe klachten na een tekenbeet, vast en bespreek deze met een arts. Deze pagina beoordeelt geen individuele situatie."}
      </p>
    </section>
  );
}
