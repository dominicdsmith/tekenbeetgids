import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { queryOptions, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Plus, RefreshCw, ShieldCheck, Trash2, Download, CheckCheck, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { firebaseProef } from "@/lib/firebase-proef.functions";
import type { ProefInput } from "@/lib/firebase-proef";

const options = queryOptions({ queryKey: ["firebase-proef"], queryFn: () => firebaseProef({ data: { actie: "lezen" } }), staleTime: 30000 });
export const Route = createFileRoute("/_authenticated/beheer/firebase-proef")({
  loader: ({ context }) => context.queryClient.ensureQueryData(options),
  component: FirebaseProefPagina,
  errorComponent: ({ error, reset }) => <main className="mx-auto max-w-4xl p-6 text-foreground"><h1 className="text-xl font-semibold">Firebase-proefomgeving</h1><p role="alert" className="my-4">{error instanceof Error ? error.message : "De proefomgeving kon niet worden geladen."}</p><Button onClick={reset} variant="outline"><RefreshCw />Opnieuw laden</Button></main>,
  head: () => ({ meta: [
    { title: "Firebase-proefomgeving — TekenbeetGids beheer" },
    { name: "description", content: "Afgeschermde fictieve proefadministratie van TekenbeetGids bij Google." },
    { name: "robots", content: "noindex, nofollow" },
    { property: "og:title", content: "Firebase-proefomgeving — TekenbeetGids beheer" },
    { property: "og:description", content: "Afgeschermde fictieve proefadministratie bij Google." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" },
  ] }),
});

const SOORT: Record<string, string> = { deelname: "Proefdeelname", registratie: "Proefregistratie", klacht: "Proefklacht", privacy: "Proefprivacyverzoek", taak: "Proeftaak", intrekken: "Intrekking", verwerken: "Verwerking", relaties: "Relatiecontrole", export: "Proefexport" };

function FirebaseProefPagina() {
  const { data } = useSuspenseQuery(options);
  const client = useQueryClient();
  const uitvoeren = useServerFn(firebaseProef);
  const [nummer, setNummer] = useState("");
  const [busy, setBusy] = useState(false);
  const [melding, setMelding] = useState("");
  const [fout, setFout] = useState("");
  const [pending, setPending] = useState<ProefInput | null>(null);
  const deelnemers = data.state.records.filter(r => r.soort === "deelname");
  const geselecteerd = deelnemers.some(r => r.nummer === nummer) ? nummer : "";

  async function actie(input: ProefInput) {
    setBusy(true); setFout(""); setMelding(""); setPending(input);
    try {
      const result = await uitvoeren({ data: input });
      client.setQueryData(options.queryKey, result);
      if (input.actie === "deelname") setNummer(`PROEF-${input.verzoek}`);
      if (input.actie === "intrekken") setNummer("");
      if (result.exportTekst) {
        const url = URL.createObjectURL(new Blob([result.exportTekst], { type: "application/json" }));
        const a = document.createElement("a"); a.href = url; a.download = "firebase-fictieve-proefexport.json"; a.click();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
      }
      setMelding(input.actie === "lezen" ? "Proefgegevens opnieuw gelezen bij Google." : `${SOORT[input.actie] ?? "Proefhandeling"} opgeslagen en teruggelezen bij Google; staat bovenaan de lijst.`);
      setPending(null);
    } catch (e) { setFout(e instanceof Error ? e.message : "De proefhandeling is niet gelukt."); }
    finally { setBusy(false); }
  }
  const start = (type: ProefInput["actie"]) => {
    if (type === "intrekken" && !window.confirm("Deze fictieve deelname en gekoppelde proefregistraties verwijderen?")) return;
    void actie({ actie: type, verzoek: crypto.randomUUID(), ...(geselecteerd ? { nummer: geselecteerd } : {}) });
  };
  return <main className="mx-auto max-w-5xl px-4 py-8 text-foreground">
    <header className="border-b border-border pb-5"><div className="flex items-center gap-3"><ShieldCheck className="size-6 text-primary" /><h1 className="text-2xl font-semibold">Firebase-proefomgeving</h1></div>
      <p className="mt-3 text-sm text-muted-foreground">Fictieve administratie · Google · Nederland · tekenbeetgids-proef</p>
      <p className="mt-2 text-sm">Geen echte gegevens, foto’s, e-mails of productie-updates. Beheerlogin blijft voorlopig via Lovable.</p>
    </header>
    <section className="border-b border-border py-6"><h2 className="mb-4 text-lg font-semibold">Deelnames en registraties</h2>
      <div className="flex flex-wrap items-center gap-3"><Button disabled={busy} onClick={() => start("deelname")}><Plus />Proefdeelname</Button>
        <label className="flex min-w-0 flex-col gap-1 text-sm">Proefdeelname<select aria-label="Proefdeelname" className="max-w-full rounded-md border border-input bg-background p-2 text-foreground" value={geselecteerd} onChange={e => setNummer(e.target.value)}><option value="">Kies een deelname</option>{deelnemers.map(r => <option key={r.id} value={r.nummer ?? ""}>{r.nummer}</option>)}</select></label>
        <Button disabled={busy || !geselecteerd} variant="outline" onClick={() => start("registratie")}><Plus />Proefregistratie</Button>
        <Button disabled={busy || !geselecteerd} variant="destructive" onClick={() => start("intrekken")}><Trash2 />Deelname intrekken</Button></div>
    </section>
    <section className="border-b border-border py-6"><h2 className="mb-4 text-lg font-semibold">Klachten en privacyverzoeken</h2><div className="flex flex-wrap gap-3"><Button disabled={busy} variant="outline" onClick={() => start("klacht")}><Plus />Proefklacht</Button><Button disabled={busy} variant="outline" onClick={() => start("privacy")}><Plus />Proefprivacyverzoek</Button></div></section>
    <section className="border-b border-border py-6"><h2 className="mb-2 text-lg font-semibold">Handmatige proeftaken</h2><p className="mb-4 text-sm text-muted-foreground">Geen automatische planning, broncontrole, AI, beveiligingsaudit of echte back-up.</p><div className="flex flex-wrap gap-3"><Button disabled={busy} variant="outline" onClick={() => start("verwerken")}><Play />Proefverzoeken verwerken</Button><Button disabled={busy} variant="outline" onClick={() => start("relaties")}><CheckCheck />Relaties controleren</Button><Button disabled={busy} variant="outline" onClick={() => start("export")}><Download />Fictieve proefexport</Button></div></section>
    <section className="py-6"><div className="mb-4 flex items-center justify-between gap-3"><h2 className="text-lg font-semibold">Opgeslagen proefgegevens ({data.state.records.length})</h2><Button title="Opnieuw lezen bij Google" aria-label="Opnieuw lezen bij Google" size="icon" variant="outline" disabled={busy} onClick={() => void actie({ actie: "lezen" })}><RefreshCw /></Button></div>
      {busy && <p role="status">Proefhandeling verwerken…</p>}{melding && <p role="status" className="mb-3 text-sm">{melding}</p>}{fout && <div role="alert" className="mb-4 text-sm text-destructive"><p>{fout}</p>{pending && <Button className="mt-2" variant="outline" disabled={busy} onClick={() => void actie(pending)}><RefreshCw />Hetzelfde verzoek opnieuw uitvoeren</Button>}</div>}
      <div className="divide-y divide-border">{[...data.state.records].reverse().map(r => <article key={r.id} className="py-4"><div className="flex flex-wrap gap-2 text-sm font-semibold"><span>{SOORT[r.soort] ?? r.soort}</span><span className="text-muted-foreground">{r.status}</span></div>{r.nummer && <p className="mt-1 break-all text-xs text-muted-foreground">{r.nummer}</p>}<p className="mt-2 text-sm">{r.tekst}</p><time className="mt-1 block text-xs text-muted-foreground">{new Date(r.tijd).toLocaleString("nl-NL")}</time></article>)}</div>
      {data.state.records.length === 0 && <p className="text-sm text-muted-foreground">Geen proefgegevens opgeslagen.</p>}
    </section>
  </main>;
}