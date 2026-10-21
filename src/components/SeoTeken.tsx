import { TEKENSOORTEN, ZIEKTEN, PROV_TEKEN, PROVINCIES } from "@/data/tekenData";
import { useTaal } from "@/lib/taal";
import { vertaalTekst } from "@/lib/vertaling";

/**
 * Statische, server-gerenderde beschrijving van het tabblad "Teken".
 * Staat altijd in de HTML (ook zonder JavaScript), zodat zoekmachines en
 * schermlezers de tekensoorten kunnen lezen.
 * Visueel verborgen (niet display:none).
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

const ziekteNaam = (id: string) => ZIEKTEN.find((z) => z.id === id)?.naam ?? id;

export default function SeoTeken() {
  const en = useTaal() === "en";
  const T = (tekst: string) => vertaalTekst(tekst, en);
  if (en) {
    return (
      <section style={verborgen} aria-label="Tick species in the Netherlands — text description">
        <h2>Tick species in the Netherlands</h2>
        <p>About 15 tick species occur in the Netherlands. This overview lists species relevant to humans and pets, their identification, habitat and associated tick-borne diseases.</p>
        <ul>{TEKENSOORTEN.map((t) => <li key={t.id}><strong>{T(t.naam)}</strong> ({t.latijn})</li>)}</ul>
        <p>Always check your body for ticks after spending time outdoors and remove a tick as soon as possible.</p>
      </section>
    );
  }
  return (
    <section style={verborgen} aria-label={T("Tekensoorten in Nederland — tekstuele beschrijving")}>
      <h2>{T("Tekensoorten in Nederland")}</h2>
      <p>
        {en ? `About 15 tick species occur in the Netherlands. Below are the ${TEKENSOORTEN.length} species relevant to humans and pets, with identification, habitat and the tick-borne diseases they can carry and transmit through a bite.` : `In Nederland komen ongeveer 15 tekensoorten voor. Hieronder de ${TEKENSOORTEN.length} soorten die er voor mens en huisdier toe doen, met herkenning, leefgebied en de tekenbeetziekten die zij bij zich kunnen dragen en via een beet kunnen overbrengen.`}
      </p>
      {TEKENSOORTEN.map((t) => {
        const ziekten = t.ziekten.map(ziekteNaam);
        const extra = t.extraZiekten ?? [];
        const provs = PROVINCIES.filter((p) => (PROV_TEKEN[p.id] ?? []).includes(t.id)).map((p) => p.naam);
        return (
          <article key={t.id}>
            <h3>
              {T(t.naam)} ({t.latijn})
            </h3>
            <p>{en ? "Occurrence" : "Voorkomen"}: {T(t.status)}</p>
            <p>{en ? "Identification" : "Herkenning"}: {T(t.herkenning)}</p>
            <p>{en ? "Habitat" : "Leefgebied"}: {T(t.voorkomen)}</p>
            <p>
              {en ? "Tick-borne diseases this tick can transmit" : "Tekenbeetziekten die deze teek kan overbrengen"}:{" "}
              {ziekten.length || extra.length
                ? [...ziekten, ...extra].map(T).join(", ")
                : (en ? "no transmission to humans has been demonstrated in the Netherlands" : "in Nederland is geen ziekteoverdracht op de mens aangetoond")}
              .
            </p>
            {provs.length > 0 && <p>{en ? "Relevant in" : "Speelt een rol in"}: {provs.join(", ")}.</p>}
            <p>{T(t.tekst)}</p>
          </article>
        );
      })}
      <p>
        {en ? "Always check your body for ticks after spending time outdoors and remove a tick as soon as possible. This is general information, not medical advice." : "Controleer na een verblijf in het groen altijd uw lichaam op teken en verwijder een teek zo snel mogelijk. Dit is voorlichting en geen medisch advies."}
      </p>
    </section>
  );
}
