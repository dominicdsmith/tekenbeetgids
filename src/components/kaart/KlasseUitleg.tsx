import { PROVINCIES } from "@/data/tekenData";
import { useLiveCijfers } from "@/lib/cijfers";
import { useTaal } from "@/lib/taal";
import { vertaalTekst } from "@/lib/vertaling";
import type { CSSProperties } from "react";

/**
 * Gedeelde kernzin boven álle risicoklassen (kaart, legenda, provincie- en
 * gemeentepanelen, ziektepagina's). Zo staat vóór de methodologische nuance
 * dat een klasse een gebiedsindicatie is en geen oordeel over één persoon.
 */
export const GEBIEDSINDICATIE_ZIN =
  "Deze kaart geeft gebiedsgebonden informatie en geen individuele medische risico-inschatting.";
export const GEBIEDSINDICATIE_KORT =
  "Gebiedsgebonden informatie; geen individuele medische risico-inschatting.";
export const INDICATOR_ZIN =
  "De relatieve risico-indicatie is een statistische gebiedsindicator op basis van meldingsgegevens en aanvullende wegingsfactoren. Het is geen medische risicoscore en voorspelt niet de kans dat een individuele persoon besmet raakt.";
export const AANWEZIGHEID_ZIN =
  "Alleen de TBE-laag onderscheidt gepubliceerde lokale aanwijzingen. Voor de overige aandoeningen ontbreken vergelijkbare provinciale onderzoeksgegevens; landelijke percentages onderbouwen geen provinciale rangorde. Alfa-gal is een allergische aandoening, geen verwekker. Geen van deze gegevens is een infectiekans per beet of per persoon.";

/** Zin in eigen stijl, voor donkere of lichte vlakken. */
export function Gebiedsindicatie({ en, style, className }: { en: boolean; style?: CSSProperties; className?: string }) {
  return <p className={className} style={style}>{vertaalTekst(GEBIEDSINDICATIE_ZIN, en)}</p>;
}

export function KlasseUitleg({ provincieId }: { provincieId?: string }) {
  const live = useLiveCijfers();
  const en = useTaal() === "en";
  const T = (s: string) => vertaalTekst(s, en);
  const format = (n: number) => n.toLocaleString(en ? "en-GB" : "nl-NL", { maximumFractionDigits: 2 });
  const rijen = PROVINCIES.filter((p) => !provincieId || p.id === provincieId).flatMap((p) => {
    const c = live.provincies[p.id];
    return c?.score != null && c.meldingenPer100k != null ? [{ p, c }] : [];
  });
  return (
    <section className="mt-2 text-[9px] leading-relaxed" aria-label={en ? "Provincial class calculation" : "Berekening provincieklasse"}>
      <p className="font-semibold">{T(GEBIEDSINDICATIE_ZIN)}</p>
      <p className="mt-1">{T(INDICATOR_ZIN)}</p>
      <p className="mt-1">{en
        ? "This is the website’s own weighted classification, not a Tekenradar class. Score = reports per 100,000 inhabitants × habitat factor. TBE notifications do not contribute: province of residence does not establish where an infection was acquired. Published local TBE evidence is shown separately."
        : "Dit is de eigen gewogen indeling van deze website, geen Tekenradar-klasse. Score = meldingen per 100.000 inwoners × habitatfactor. TBE-meldingen wegen niet mee: de woonprovincie bewijst niet waar een infectie is opgelopen. Gepubliceerde lokale TBE-aanwijzingen staan afzonderlijk op de kaart."}</p>
      <p className="mt-1">{en
        ? "The range from the lowest to highest provincial score is divided into five equal intervals. Boundaries belong to the lower class; the displayed numbers are rounded. These are score limits, not fixed limits for reports per 100,000 inhabitants, and not medically validated thresholds."
        : "De spreiding tussen de laagste en hoogste provinciescore wordt in vijf gelijke stappen verdeeld. Een grenswaarde hoort bij de lagere klasse; de getoonde cijfers zijn afgerond. Dit zijn scoregrenzen, geen vaste drempels voor meldingen per 100.000 inwoners en geen medisch gevalideerde grenzen."}</p>
      {live.grensLabels.length > 0 && <p className="mt-1 font-semibold">{live.grensLabels.map(T).join(" · ")}</p>}
      {rijen.length > 0 ? <dl className="mt-2 space-y-1">
        {rijen.map(({ p, c }) => <div key={p.id}>
          <dt className="font-semibold">{p.naam} · {T(["Geen", "Zeer laag", "Laag", "Matig", "Hoog", "Zeer hoog"][c.risk ?? p.risk] ?? "Onbekend")}</dt>
          <dd>{format(c.meldingenPer100k ?? 0)} {en ? "reports per 100,000 inhabitants" : "meldingen per 100.000 inwoners"} × {format(c.habitatFactor && c.habitatFactor > 0 ? c.habitatFactor : 1)} ≈ {format(c.score ?? 0)} score{c.periode ? ` · ${c.periode}` : ""}</dd>
        </div>)}
      </dl> : <p className="mt-1">{en ? "Current calculation data is unavailable; a previously published class is shown. No current thresholds can be verified." : "Actuele rekengegevens zijn niet beschikbaar; een eerder gepubliceerde klasse wordt getoond. Actuele drempels zijn dan niet te verifiëren."}</p>}
    </section>
  );
}
