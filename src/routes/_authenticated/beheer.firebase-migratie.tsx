import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { queryOptions, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { RefreshCw, ShieldCheck, CheckCheck, ScrollText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { firebaseMigratie, firebaseSpiegelLog } from "@/lib/firebase-migratie.functions";
import type { MigratieInput, SpiegelLogRegel } from "@/lib/firebase-migratie";
import { leesGoogleBeheer } from "@/lib/google-administratie.functions";
import { zetOudeIntrekcodesOver } from "@/lib/google-intrekcodes.functions";
import { backupEnHerstel } from "@/lib/google-herstel.functions";

const options = queryOptions({ queryKey: ["firebase-migratie"], queryFn: () => firebaseMigratie({ data: { actie: "tellen" } }), staleTime: 30000 });
export const Route = createFileRoute("/_authenticated/beheer/firebase-migratie")({
  loader: ({ context }) => context.queryClient.ensureQueryData(options),
  component: FirebaseMigratiePagina,
  errorComponent: ({ error, reset }) => <main className="mx-auto max-w-4xl p-6 text-foreground"><h1 className="text-xl font-semibold">Migratie naar Google</h1><p role="alert" className="my-4">{error instanceof Error ? error.message : "De migratieomgeving kon niet worden geladen."}</p><Button onClick={reset} variant="outline"><RefreshCw />Opnieuw laden</Button></main>,
  head: () => ({ meta: [
    { title: "Migratie naar Google — TekenbeetGids beheer" },
    { name: "description", content: "Afgeschermde overzet van de TekenbeetGids-administratie naar Google." },
    { name: "robots", content: "noindex, nofollow" },
    { property: "og:title", content: "Migratie naar Google — TekenbeetGids beheer" },
    { property: "og:description", content: "Afgeschermde overzet van de administratie naar Google." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" },
  ] }),
});

const LABEL: Record<string, string> = {
  onderzoek_deelnames: "Deelnames onderzoek",
  tekenbeet_registraties: "Registraties",
  contact_berichten: "Klachten en contactberichten",
  privacy_verzoeken: "Privacyverzoeken",
};

function FirebaseMigratiePagina() {
  const { data } = useSuspenseQuery(options);
  const client = useQueryClient();
  const uitvoeren = useServerFn(firebaseMigratie);
  const [busy, setBusy] = useState(false);
  const [melding, setMelding] = useState("");
  const [fout, setFout] = useState("");
  const [alleenVerschillen, setAlleenVerschillen] = useState(false);
  const [spiegellog, setSpiegellog] = useState<SpiegelLogRegel[] | null>(null);
  const [google, setGoogle] = useState<Awaited<ReturnType<typeof leesGoogleBeheer>> | null>(null);
  const lezenGoogle = useServerFn(leesGoogleBeheer);
  const codeOverzet = useServerFn(zetOudeIntrekcodesOver);
  const herstelUitvoeren = useServerFn(backupEnHerstel);
  const [herstel, setHerstel] = useState<Awaited<ReturnType<typeof backupEnHerstel>> | null>(null);
  async function testHerstel() {
    if (!window.confirm("Een versleutelde back-up van de met Google vergeleken administratie opslaan in uw bestaande afgeschermde Google-back-upmap? Daarna worden maximaal 450 records tijdelijk hersteld in afzonderlijke herstelproefpaden binnen tekenbeetgids-prod, teruggelezen en gewist. Bestaande administratie en back-ups blijven ongewijzigd. Geen foto's, geheime codes of sleutels gaan mee.")) return;
    if (!window.confirm("Deze proef kopieert echte gegevens tijdelijk binnen dezelfde afgeschermde Google-database. Google rekent opslag, lezen en schrijven volgens uw tarieven; uw €2-budget stopt kosten niet. Het back-upbestand blijft bewaard, ook na intrekking. De proefgegevens worden na controle verwijderd. Akkoord met deze verwerking en kosten?")) return;
    setBusy(true); setFout(""); setMelding(""); setHerstel(null);
    try { const result = await herstelUitvoeren({ data: { bevestigd: true, kostenBevestigd: true } }); setHerstel(result); setMelding("Versleutelde back-up teruggelezen; herstelproef geslaagd en proefgegevens verwijderd. Niet omgeschakeld."); }
    catch (e) { setFout(e instanceof Error ? e.message : "Back-up of herstelproef niet afgerond; huidige administratie niet gewijzigd."); }
    finally { setBusy(false); }
  }
  async function zetCodesOver() {
    if (!window.confirm("Intrekcodecontroles van bestaande deelnemers bij Google opslaan? Alleen vingerafdrukken worden bewaard; de huidige controle blijft werken. Dit schakelt de administratie niet om.")) return;
    setBusy(true); setFout(""); setMelding("");
    try { const resultaat = await codeOverzet({ data: { bevestigd: true } }); setMelding(`${resultaat.gecontroleerd} oude intrekcodes bij Google gecontroleerd. Nog niet omgeschakeld.`); }
    catch { setFout("Code-overzet niet afgerond. De huidige intrekcodes blijven via de bestaande controle werken."); }
    finally { setBusy(false); }
  }
  async function toonGoogle() {
    setBusy(true); setFout("");
    try { setGoogle(await lezenGoogle()); }
    catch { setFout("Google-gegevens konden niet veilig worden geladen."); }
    finally { setBusy(false); }
  }

  const ophalenLog = useServerFn(firebaseSpiegelLog);
  async function toonSpiegellog() {
    setBusy(true); setFout("");
    try {
      setSpiegellog(await ophalenLog({ data: { actie: "spiegellog" } }));
    } catch (e) { setFout(e instanceof Error ? e.message : "Het spiegellog kon niet worden geladen."); }
    finally { setBusy(false); }
  }

  async function actie(input: MigratieInput) {
    setBusy(true); setFout(""); setMelding("");
    try {
      const result = await uitvoeren({ data: input });
      client.setQueryData(options.queryKey, result);
      setMelding(input.actie === "overzetten"
        ? `${result.overgezet} records overgezet naar Google en aantallen opnieuw geteld. De bronadministratie is niet gewijzigd.`
        : input.actie === "controleren" ? "Records en inhoud vergeleken; dit is een momentopname, geen toestemming om om te schakelen." : "Aantallen opnieuw vergeleken tussen bron en Google.");
    } catch (e) { setFout(e instanceof Error ? e.message : "De migratiehandeling is niet gelukt."); }
    finally { setBusy(false); }
  }

  const allesGelijk = data.aantallen.every(a => a.gelijk);
  return <main className="mx-auto max-w-4xl px-4 py-8 text-foreground">
    <header className="border-b border-border pb-5"><div className="flex items-center gap-3"><ShieldCheck className="size-6 text-primary" /><h1 className="text-2xl font-semibold">Migratie naar Google</h1></div>
      <p className="mt-3 text-sm text-muted-foreground">Echte administratie · Google · Nederland · tekenbeetgids-prod</p>
      <p className="mt-2 text-sm">De huidige administratie blijft leidend. Opnieuw kopiëren is geblokkeerd zolang de live-spiegel actief is, om ingetrokken gegevens niet terug te plaatsen.</p>
    </header>
    <section className="border-b border-border py-6"><h2 className="mb-4 text-lg font-semibold">Aantallen per onderdeel</h2>
      <table className="w-full text-sm"><thead><tr className="border-b border-border text-left"><th className="py-2">Onderdeel</th><th className="py-2">Huidige administratie</th><th className="py-2">Bij Google</th><th className="py-2">Gelijk</th></tr></thead>
        <tbody>{data.aantallen.map(a => <tr key={a.tabel} className="border-b border-border"><td className="py-2">{LABEL[a.tabel] ?? a.tabel}</td><td className="py-2">{a.bron}</td><td className="py-2">{a.google}</td><td className="py-2">{a.gelijk ? "Ja" : "Nee"}</td></tr>)}</tbody></table>
      {allesGelijk ? <p className="mt-3 text-sm">Alle aantallen zijn gelijk; controleer ook records en inhoud vóór omschakeling.</p> : <p className="mt-3 text-sm">De aantallen lopen nog uiteen; de omschakeling is nog niet mogelijk.</p>}
      {data.records && <><h3 className="mt-5 mb-2 font-semibold">Records en inhoud</h3><table className="w-full text-sm"><thead><tr className="border-b border-border text-left"><th>Onderdeel</th><th>Ontbreekt</th><th>Extra</th><th>Afwijkend</th></tr></thead><tbody>{data.records.map(r => <tr key={r.tabel} className="border-b border-border"><td className="py-2">{LABEL[r.tabel]}</td><td>{r.ontbreekt}</td><td>{r.extra}</td><td>{r.afwijkend}</td></tr>)}</tbody></table><p className="mt-3 text-sm">Momentopname tijdens actieve verwerking; voor de definitieve vergelijking is een schrijfpauze nodig.</p></>}
    </section>
    {data.details && <section className="border-b border-border py-6">
      <h2 className="mb-3 text-lg font-semibold">Vergelijking per record</h2>
      <p className="mb-3 text-sm">Controle gestart: {data.tijd.replace("T", " ").slice(0, 19)} UTC. Alleen lezen; geen omschakeling. Een gelijke vergelijking bewijst niet dat accounts, intrekcodes en taken zijn overgezet.</p>
      <div className="mb-4 flex flex-wrap gap-2" role="group" aria-label="Records tonen">
        <Button size="sm" variant={alleenVerschillen ? "outline" : "default"} aria-pressed={!alleenVerschillen} onClick={() => setAlleenVerschillen(false)}>Alle records</Button>
        <Button size="sm" variant={alleenVerschillen ? "default" : "outline"} aria-pressed={alleenVerschillen} onClick={() => setAlleenVerschillen(true)}>Alleen verschillen</Button>
      </div>
      <p className="mb-4 text-sm text-muted-foreground">Inhoud en geheime waarden blijven afgeschermd; per veld ziet u aanwezigheid en gelijkheid.</p>
      {data.details.map(onderdeel => {
        const rijen = onderdeel.rijen.filter(r => !alleenVerschillen || r.status !== "gelijk");
        return <div key={onderdeel.tabel} className="mb-5">
          <h3 className="mb-2 font-semibold">{LABEL[onderdeel.tabel]} · {onderdeel.rijen.length} records</h3>
          {rijen.length === 0 && <p className="text-sm">{onderdeel.rijen.length === 0 ? "Geen records in beide administraties." : "Geen verschillen gevonden."}</p>}
          {rijen.map(rij => <details key={rij.id} className="border-b border-border py-3">
            <summary className="cursor-pointer text-sm"><span className="break-all font-mono">{rij.id}</span><span className="ml-2 font-semibold">{({ gelijk: "Gelijk", ontbreekt: "Ontbreekt bij Google", extra: "Alleen bij Google", afwijkend: "Inhoud wijkt af" })[rij.status]}</span></summary>
            <div className="mt-3 overflow-x-auto"><table className="w-full min-w-[480px] text-sm"><thead><tr className="border-b border-border text-left"><th className="p-2">Veld</th><th className="p-2">Huidige administratie</th><th className="p-2">Google</th><th className="p-2">Vergelijking</th></tr></thead><tbody>
              {rij.velden.map((veld, index) => <tr key={index} className="border-b border-border"><td className="break-all p-2">{veld.veld}</td><td className="p-2">{veld.bronAanwezig ? "Aanwezig" : "Ontbreekt"}</td><td className="p-2">{veld.googleAanwezig ? "Aanwezig" : "Ontbreekt"}</td><td className="p-2 font-semibold">{veld.gelijk ? "Gelijk" : "Verschilt"}</td></tr>)}
            </tbody></table></div>
          </details>)}
        </div>;
      })}
    </section>}
    <section className="py-6"><h2 className="mb-4 text-lg font-semibold">Handelingen</h2>
      <div className="flex flex-wrap gap-3">
        <Button disabled={busy} variant="outline" onClick={() => void actie({ actie: "controleren" })}><CheckCheck />Records en inhoud controleren</Button>
        <Button disabled={busy} variant="outline" onClick={() => void actie({ actie: "tellen" })}><RefreshCw />Opnieuw tellen</Button>
        <Button disabled={busy} variant="outline" onClick={() => void toonSpiegellog()}><ScrollText />Spiegellog bekijken</Button>
        <Button disabled={busy} variant="outline" onClick={() => void toonGoogle()}><ShieldCheck />Google-gegevens bekijken</Button>
        <Button disabled={busy} variant="outline" onClick={() => void zetCodesOver()}><ShieldCheck />Oude intrekcodes overzetten</Button>
        <Button disabled={busy} variant="outline" onClick={() => void testHerstel()}><ShieldCheck />Back-up en herstelproef</Button>
      </div>
      {busy && <p role="status" className="mt-4">Migratiehandeling verwerken…</p>}
      {melding && <p role="status" className="mt-4 text-sm">{melding}</p>}
      {fout && <p role="alert" className="mt-4 text-sm text-destructive">{fout}</p>}
    </section>
    {herstel && <section className="border-t border-border py-6"><h2 className="mb-4 text-lg font-semibold">Herstelcontrole</h2><p className="break-all text-sm">{herstel.bestand}</p><div className="overflow-x-auto"><table className="mt-4 w-full text-sm"><thead><tr className="border-b border-border text-left"><th>Onderdeel</th><th>Gelezen</th><th>Ontbreekt</th><th>Extra</th><th>Afwijkend</th></tr></thead><tbody>{herstel.controle.map(r => <tr key={r.tabel} className="border-b border-border"><td className="py-2">{({ deelnames: "Deelnames onderzoek", registraties: "Registraties", contact_berichten: "Klachten en contactberichten", privacy_verzoeken: "Privacyverzoeken", tellingen: "Tellingen", intrekkingen: "Intrekkingen" } as Record<string, string>)[r.tabel]}</td><td>{r.aantal}</td><td>{r.ontbreekt}</td><td>{r.extra}</td><td>{r.afwijkend}</td></tr>)}</tbody></table></div><p className="mt-3 text-sm">Proefgegevens verwijderd; huidige administratie ongewijzigd. Dit is een gegevensherstelproef, geen volledige hersteltest van accounts, taken of geheime intrekcodecontroles.</p></section>}
    {google && <section className="border-t border-border py-6"><h2 className="mb-4 text-lg font-semibold">Gegevens bij Google</h2>
      {Object.entries(google.tabellen).map(([naam, rijen]) => <div key={naam} className="mb-5"><h3 className="font-semibold">{naam} · {rijen.length}</h3>
        {rijen.map((rij, index) => <details key={String(rij["id"] ?? index)} className="border-b border-border py-3"><summary className="cursor-pointer">{String(rij["deelnamenummer"] ?? rij["registratienummer"] ?? rij["verzoeknummer"] ?? `Record ${index + 1}`)}</summary><pre className="mt-2 whitespace-pre-wrap break-words text-xs">{JSON.stringify(rij, null, 2)}</pre></details>)}
      </div>)}
    </section>}
    <section className="border-t border-border py-6"><h2 className="mb-2 text-lg font-semibold">Live-spiegel</h2>
      <p className="mb-4 text-sm text-muted-foreground">Nieuwe deelnames, registraties, meldingen, tellingen en back-upregels worden vanaf nu ook direct bij Google opgeslagen. De huidige administratie blijft leidend; een mislukte spiegel blokkeert een schrijfactie nooit en verschijnt hier in het log.</p>
      {spiegellog === null ? <p className="text-sm text-muted-foreground">Open het spiegellog om de laatste spiegelacties te zien.</p>
        : spiegellog.length === 0 ? <p className="text-sm">Geen spiegelacties geregistreerd.</p>
        : <table className="w-full text-sm"><thead><tr className="border-b border-border text-left"><th className="py-2">Tijd (UTC)</th><th className="py-2">Actie</th><th className="py-2">Onderdeel</th><th className="py-2">Geslaagd</th></tr></thead>
          <tbody>{spiegellog.map((r, i) => <tr key={i} className="border-b border-border"><td className="py-2">{r.tijd.replace("T", " ").slice(0, 19)}</td><td className="py-2">{r.actie}</td><td className="py-2">{r.tabel}</td><td className="py-2">{r.ok ? "Ja" : "Nee"}</td></tr>)}</tbody></table>}
    </section>
  </main>;
}
