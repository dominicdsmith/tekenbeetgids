import { Button } from "@/components/ui/button";
import { NVWA_MELD_URL, NVWA_TEKEN_URL, TEKEN_MELDINGEN, type BronType, type MeldSoort, type TekenMelding } from "@/data/tekenMeldingen";

export const meldSoorten: { id: MeldSoort; nl: string; en: string; latijn: string; kleur: string; stip: string; letter: string; varKleur: string }[] = [
  { id: "dermacentor", nl: "Vlekkenteek (Dermacentor-teek)", en: "Ornate dog tick (Dermacentor)", latijn: "Dermacentor reticulatus", kleur: "text-tick-dermacentor", stip: "bg-tick-dermacentor", letter: "D", varKleur: "var(--tick-dermacentor)" },
  { id: "hyalomma", nl: "Reuzenteek (Hyalomma-teek)", en: "Giant tick (Hyalomma)", latijn: "Hyalomma marginatum", kleur: "text-tick-hyalomma", stip: "bg-tick-hyalomma", letter: "H", varKleur: "var(--tick-hyalomma)" },
];

/** Rond icoontje met de letter van de soort: D = Vlekkenteek, H = Reuzenteek. Zelfde stijl als de stippen op de kaart. */
export function SoortIcoon({ soort, groot = 13 }: { soort: (typeof meldSoorten)[number]; groot?: number }) {
  return <span aria-hidden="true" title={`${soort.nl} (${soort.latijn})`}
    style={{ width: groot, height: groot, borderRadius: "50%", flexShrink: 0, boxSizing: "border-box", display: "inline-flex", alignItems: "center", justifyContent: "center", background: soort.varKleur, color: "#fff", fontSize: Math.max(7, Math.round(groot * 0.62)), fontWeight: 800, lineHeight: 1 }}>
    {soort.letter}
  </span>;
}


/** Label boven elke melding: meteen duidelijk of de vondst van de NVWA is of uit onderzoek komt. */
const BRON_BADGE: Record<BronType, { nl: string; en: string; cls: string }> = {
  nvwa: { nl: "Bevestigde NVWA-vondst", en: "Confirmed NVWA finding", cls: "bg-primary text-primary-foreground" },
  "nvwa-onderzoek": { nl: "Onderzoek met NVWA-CMV en RIVM", en: "Research with NVWA-CMV and RIVM", cls: "border border-primary/40 bg-primary/10 text-primary" },
  onderzoek: { nl: "Wetenschappelijk onderzoek — geen NVWA-melding", en: "Scientific research — not an NVWA report", cls: "border border-input bg-muted text-foreground" },
};

export function MeldingInhoud({ melding, en }: { melding: TekenMelding; en: boolean }) {
  const soort = meldSoorten.find((s) => s.id === melding.soort);
  const badge = BRON_BADGE[melding.bronType];
  return <div className="text-foreground text-xs leading-relaxed">
    <strong className={`inline-flex items-center gap-1.5 ${soort?.kleur}`}>{soort && <SoortIcoon soort={soort} groot={13} />}{en ? soort?.en : soort?.nl}</strong>
    <div className="mt-1">
      <span className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-bold leading-none ${badge.cls}`}>{en ? badge.en : badge.nl}</span>
    </div>
    <h3 className="text-sm font-bold mt-1">{melding.gebied} · {melding.periode}</h3>
    <p className="my-2">{en ? melding.omschrijvingEn : melding.omschrijving}</p>
    <a className="text-primary underline" href={melding.url} target="_blank" rel="noopener noreferrer">{en ? "Source" : "Bron"}: {melding.bron}</a>
  </div>;
}

export default function TekenMeldingen({ en, actief, onToggle, onMap }: { en: boolean; actief: MeldSoort[]; onToggle: (s: MeldSoort) => void; onMap: (m: TekenMelding) => void }) {
  return <section className="p-3 text-foreground">
    <h2 className="text-base font-bold">{en ? "Tick reports" : "Tekenmeldingen"}</h2>
    <p className="text-xs leading-relaxed my-2">{en ? "Published, confirmed historical findings and monitoring areas, from NVWA/RIVM with supplementary scientific research. Not a complete or live overview; a dot does not indicate disease cases or current tick density. Locations are approximate. Each report says above it whether it is an NVWA finding or comes from scientific research." : "Gepubliceerde, bevestigde historische vondsten en onderzoeksgebieden, uit NVWA/RIVM met aanvullend wetenschappelijk onderzoek. Geen volledig of live overzicht; een stip staat niet voor ziektegevallen of actuele tekendichtheid. Locaties zijn bij benadering. Bij elke melding staat erboven of het een NVWA-vondst is of uit wetenschappelijk onderzoek komt."}</p>
    <div className="space-y-2 my-3">
      {meldSoorten.map((s) => <div key={s.id} className={`border border-input rounded-md p-3 ${s.kleur}`}>
        <label className="flex items-center gap-3 cursor-pointer">
          <input type="checkbox" checked={actief.includes(s.id)} onChange={() => onToggle(s.id)} aria-label={en ? s.en : s.nl} />
          <SoortIcoon soort={s} groot={16} />
          <span className="min-w-0 text-xs"><strong className="block">{en ? s.en : s.nl}</strong><em className="text-foreground">{s.latijn}</em></span>
        </label>
        <a className="inline-block text-xs underline mt-2" href={NVWA_MELD_URL} target="_blank" rel="noopener noreferrer">
          {en ? `Report a ${s.id === "hyalomma" ? "giant tick" : "dog tick"} to the NVWA` : `${s.id === "hyalomma" ? "Reuzenteek" : "Vlekkenteek"} melden bij de NVWA`}
        </a>
      </div>)}
    </div>
    <div className="text-xs leading-relaxed my-3 border border-input rounded-md p-3">
      <h3 className="text-sm font-bold">{en ? "Why report these two tick species to the NVWA?" : "Waarom deze twee tekensoorten melden bij de NVWA?"}</h3>
      <p className="my-2">{en ? "The Centre for Monitoring Vectors (NVWA) maps where the giant tick and the ornate dog tick occur, so the health of people and animals can be protected as well as possible. The spread of ticks changes through international trade, travel and climate change. The ornate dog tick is established in the Netherlands and expanding; the giant tick is not established and usually arrives hitchhiking on migratory birds or imported animals. Reports give early insight into new locations and possible establishment." : "Het Centrum Monitoring Vectoren (NVWA) brengt in kaart waar de Reuzenteek en de Vlekkenteek voorkomen, zodat de gezondheid van mensen en dieren zo goed mogelijk beschermd kan worden. De verspreiding van teken verandert door internationale handel, reizen en klimaatverandering. De Vlekkenteek is in Nederland gevestigd en breidt zich uit; de Reuzenteek is niet gevestigd en wordt meestal meegelift op trekvogels of geïmporteerde dieren aangetroffen. Meldingen geven vroeg zicht op nieuwe plekken en op mogelijke vestiging."}</p>
    </div>
    {TEKEN_MELDINGEN.filter((m) => actief.includes(m.soort)).map((m) => <article key={m.id} className="py-3 border-b border-input">
      <MeldingInhoud melding={m} en={en} />
      {m.positie && <Button variant="outline" size="sm" className="mt-2" onClick={() => onMap(m)}>{en ? "Show on map" : "Toon op kaart"}</Button>}
    </article>)}
    {actief.length === 0 && <p className="text-xs my-3">{en ? "No species selected." : "Geen tekensoort geselecteerd."}</p>}
    <p className="text-xs leading-relaxed mt-4">{en ? "NVWA assesses reports of these species. Tekenradar records tick bites; its public figures do not provide a verifiable location list for these two species. Those bites are not shown as species-confirmed dots." : "NVWA beoordeelt meldingen van deze soorten. Tekenradar registreert tekenbeten; de openbare cijfers leveren geen verifieerbare locatielijst voor deze twee soorten. Die beten worden niet als soortbevestigde stippen getoond."}</p>
    <div className="flex gap-4 text-xs mt-3"><a href={NVWA_TEKEN_URL} target="_blank" rel="noopener noreferrer" className="text-primary underline">NVWA</a><a href="https://www.tekenradar.nl/" target="_blank" rel="noopener noreferrer" className="text-primary underline">Tekenradar</a></div>
  </section>;
}
