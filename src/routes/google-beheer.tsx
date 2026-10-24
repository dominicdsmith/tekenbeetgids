import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { ShieldCheck, LogIn, LogOut, Save, RefreshCw, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { User } from "firebase/auth";
import type { TaakStatus } from "@/lib/google-taakstatus";
import { startAutomatischeTaaklezing } from "@/lib/google-taakstatus-auto";
import type { IntrekStatus } from "@/lib/google-intrekstatus";

const TAAKNAMEN: Record<string, string> = {
  "backup-export-wekelijks": "Wekelijkse back-up",
  "beveiligingsscan-dagelijks": "Beveiligingsscan",
  "databroncontrole-dagelijks": "Broncontrole en melding",
  "opschonen-oude-gegevens": "Opschonen oude gegevens",
  "rivm-sync-dagelijks": "RIVM-cijfers bijwerken",
  "tbe-activiteit-sync-dagelijks": "TBE-activiteit bijwerken",
  "taakstatus-google-elk-uur": "Taakstatus naar Google",
};
const OORDEEL: Record<TaakStatus["oordeel"], string> = { ok: "Geslaagd", fout: "Fout", inactief: "Uitgeschakeld", onbekend: "Nog niet gedraaid" };
const tijd = (v: string | null) => v ? new Date(v).toLocaleString("nl-NL", { timeZone: "Europe/Amsterdam", dateStyle: "short", timeStyle: "short" }) : "—";

function Intrekkingsstatus({ user }: { user: User }) {
  const [status, setStatus] = useState<IntrekStatus | null>(null);
  const [fout, setFout] = useState("");
  useEffect(() => {
    let actief = true;
    const stop = startAutomatischeTaaklezing(async () => {
      try {
        const token = await user.getIdToken();
        if (!actief) return;
        const response = await fetch("/api/public/google-beheer", { method: "POST", cache: "no-store", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }, body: JSON.stringify({ actie: "intrekkingen" }) });
        const j = await response.json() as { ok?: boolean; intrekkingen?: IntrekStatus };
        if (!response.ok || !j.ok || !j.intrekkingen) throw new Error("Controle niet beschikbaar.");
        if (actief) { setStatus(j.intrekkingen); setFout(""); }
      } catch { if (actief) setFout("Intrekkingscontrole bij Google is tijdelijk niet beschikbaar."); }
    }, document);
    return () => { actief = false; stop(); };
  }, [user]);
  return <section className="mt-8 border-t border-border pt-6">
    <h2 className="mb-3 text-lg font-semibold">Intrekcodes en intrekkingen</h2>
    <p className="mb-4 text-sm text-muted-foreground">Google-controle van voorbereide oude codes en intrekkingsmarkers. De bestaande intrekprocedure blijft actief; Google is nog niet de enige bron.</p>
    {fout && <p role="alert" className="text-sm text-destructive">{fout}</p>}
    {status && <><dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
      <dt>Actieve Google-deelnames</dt><dd>{status.actieveDeelnames}</dd>
      <dt>Oude codes voorbereid</dt><dd>{status.oudeCodesGereed}</dd>
      <dt>Codes ontbreken</dt><dd>{status.codesOntbreken}</dd>
      <dt>Codes afwijkend</dt><dd>{status.codesAfwijkend}</dd>
      <dt>Intrekkingen vastgelegd</dt><dd>{status.intrekkingen}</dd>
      <dt>Google-verwijdering niet afgerond</dt><dd>{status.intrekkingenNietAfgerond}</dd>
      <dt>Codecontroles gelijk</dt><dd>{status.codecontroles?.gelijk ?? 0}</dd>
      <dt>Codecontroles afwijkend</dt><dd>{status.codecontroles?.afwijkend ?? 0}</dd>
      <dt>Codecontrole niet beschikbaar</dt><dd>{status.codecontroles?.nietBeschikbaar ?? 0}</dd>
    </dl><p className="mt-3 text-xs text-muted-foreground">Gecontroleerd: {tijd(status.gecontroleerd)}</p></>}
  </section>;
}

function Taakstatus({ user }: { user: User }) {
  const [taken, setTaken] = useState<TaakStatus[] | null>(null);
  const [fout, setFout] = useState("");
  const [bezig, setBezig] = useState(false);
  const actief = useRef(false);
  const lopend = useRef(false);
  const laad = useCallback(async () => {
    if (lopend.current || !actief.current) return;
    lopend.current = true;
    setBezig(true); setFout("");
    try {
      const token = await user.getIdToken();
      if (!actief.current) return;
      const r = await fetch("/api/public/google-beheer", { method: "POST", cache: "no-store", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }, body: JSON.stringify({ actie: "taken" }) });
      const j = await r.json() as { ok: boolean; taken?: TaakStatus[]; message?: string };
      if (!r.ok || !j.ok) throw new Error(j.message ?? "Taakstatus niet beschikbaar.");
      if (actief.current) setTaken(j.taken ?? []);
    } catch (e) { if (actief.current) setFout(e instanceof Error ? e.message : "Taakstatus niet beschikbaar."); }
    finally { lopend.current = false; if (actief.current) setBezig(false); }
  }, [user]);
  useEffect(() => {
    actief.current = true;
    const stop = startAutomatischeTaaklezing(laad, document);
    return () => { actief.current = false; stop(); };
  }, [laad]);
  const fouten = taken?.filter(t => t.oordeel === "fout").length ?? 0;
  return <section className="mt-8 border-t border-border pt-6">
    <div className="mb-3 flex items-center justify-between gap-3"><h2 className="text-lg font-semibold">Automatische taken</h2><Button size="sm" variant="outline" disabled={bezig} onClick={() => void laad()}><RefreshCw />Vernieuwen</Button></div>
    <p className="mb-4 text-sm text-muted-foreground">De taken draaien nog in de huidige omgeving; hun status wordt elk uur bij Google vastgelegd.</p>
    {fout && <p role="alert" className="mb-3 text-sm text-destructive">{fout}</p>}
    {taken && <p role="status" className="mb-3 text-sm">{fouten ? `${fouten} taak/taken met fouten.` : "Geen fouten gevonden."}</p>}
    {taken && <ul className="space-y-3">{taken.map(t => <li key={t.taak} className="rounded-md border border-border p-3 text-sm">
      <div className="flex justify-between gap-2"><span className="font-medium">{TAAKNAMEN[t.taak] ?? t.taak}</span><span className={t.oordeel === "fout" ? "font-semibold text-destructive" : "text-primary"}>{OORDEEL[t.oordeel]}</span></div>
      <div className="mt-1 text-muted-foreground">Laatst gestart: {tijd(t.laatsteStart)} · 7 dagen: {t.runs7d} keer, {t.mislukt7d} mislukt</div>
    </li>)}</ul>}
    {taken?.[0]?.bijgewerkt && <p className="mt-3 text-xs text-muted-foreground">Bij Google vastgelegd: {tijd(taken[0].bijgewerkt)}</p>}
  </section>;
}

function Testmail({ user }: { user: User }) {
  const [bezig, setBezig] = useState(false);
  const [uitkomst, setUitkomst] = useState("");
  async function stuur() {
    setBezig(true); setUitkomst("");
    try {
      const token = await user.getIdToken();
      const r = await fetch("/api/public/google-beheer", { method: "POST", cache: "no-store", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }, body: JSON.stringify({ actie: "testmail" }) });
      const j = await r.json() as { message?: string };
      setUitkomst(j.message ?? (r.ok ? "Verstuurd." : "Mislukt."));
    } catch { setUitkomst("Testmail mislukt."); }
    finally { setBezig(false); }
  }
  return <section className="mt-8 border-t border-border pt-6">
    <h2 className="mb-3 text-lg font-semibold">Mail via Google</h2>
    <p className="mb-4 text-sm text-muted-foreground">Stuurt één testmail als noreply naar uw beheeradres. De gewone mail van de website verandert hierdoor niet.</p>
    <Button size="sm" disabled={bezig} onClick={() => void stuur()}><Mail />Testmail versturen</Button>
    {uitkomst && <p role="status" className="mt-3 text-sm">{uitkomst}</p>}
  </section>;
}

export const Route = createFileRoute("/google-beheer")({
  component: GoogleBeheer,
  head: () => ({ meta: [
    { title: "Google-beheer — TekenbeetGids" },
    { name: "description", content: "Zelfstandige beveiligde Google-beheerlogin voor TekenbeetGids." },
    { name: "robots", content: "noindex, nofollow" },
    { property: "og:title", content: "Google-beheer — TekenbeetGids" },
    { property: "og:description", content: "Afgeschermde toegang via een afzonderlijk Google-beheeraccount." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" },
  ] }),
});

function GoogleBeheer() {
  const [user, setUser] = useState<User | null>(null);
  const [naam, setNaam] = useState("");
  const [busy, setBusy] = useState(false);
  const [fout, setFout] = useState("");
  const [melding, setMelding] = useState("");
  async function controleer(candidate: User) {
    const token = await candidate.getIdToken(true);
    const response = await fetch("/api/public/google-beheer", { method: "POST", headers: { Authorization: `Bearer ${token}` }, cache: "no-store" });
    if (!response.ok) throw new Error("Dit account heeft nog geen goedgekeurde Google-beheertoegang.");
  }
  async function login() {
    setBusy(true); setFout(""); setMelding("");
    try {
      const { googleBeheerAuth } = await import("@/lib/google-beheer-browser");
      const { GoogleAuthProvider, signInWithPopup, signOut } = await import("firebase/auth");
      const auth = await googleBeheerAuth();
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: "select_account" });
      const result = await signInWithPopup(auth, provider);
      try { await controleer(result.user); }
      catch (error) { await signOut(auth); throw error; }
      setUser(result.user); setNaam(result.user.displayName ?? "");
    } catch (error) {
      const code = (error as { code?: string }).code;
      setFout(code === "auth/operation-not-allowed" || code === "auth/unauthorized-domain"
        ? "Google-login moet nog worden geactiveerd voor deze website. Uw bestaande login blijft werken."
        : code === "auth/popup-closed-by-user" ? "Inloggen geannuleerd."
        : error instanceof Error && !code ? error.message : "Google-login niet afgerond. Probeer het later opnieuw.");
    } finally { setBusy(false); }
  }
  async function logout() {
    setUser(null); setNaam(""); setMelding(""); setFout("");
    const { googleBeheerAuth } = await import("@/lib/google-beheer-browser");
    const { signOut } = await import("firebase/auth");
    await signOut(await googleBeheerAuth());
  }
  async function save() {
    if (!user) return;
    setBusy(true); setFout(""); setMelding("");
    try {
      await controleer(user);
      const { updateProfile } = await import("firebase/auth");
      await updateProfile(user, { displayName: naam.trim() });
      setMelding("Uw profielnaam is bij Google opgeslagen.");
    } catch { setFout("Profiel niet opgeslagen; controleer uw beheertoegang."); }
    finally { setBusy(false); }
  }
  return <main className="mx-auto max-w-xl px-4 py-8 text-foreground">
    <header className="mb-6 border-b border-border pb-5"><div className="flex items-center gap-3"><ShieldCheck className="size-6 text-primary" /><h1 className="text-2xl font-semibold">Google-beheer</h1></div></header>
    {!user ? <><p className="mb-5 text-sm">Afzonderlijke beheerlogin. Uw bestaande login blijft ongewijzigd. Uw naam en profielfoto worden bij Google bewaard.</p><Button onClick={() => void login()} disabled={busy}><LogIn />Inloggen met Google</Button></>
      : <><section><h2 className="mb-4 text-lg font-semibold">Beheerprofiel</h2><label htmlFor="google-profielnaam" className="mb-2 block text-sm">Naam</label><Input id="google-profielnaam" maxLength={100} value={naam} onChange={e => setNaam(e.target.value)} /><div className="mt-4 flex flex-wrap gap-3"><Button disabled={busy || !naam.trim()} onClick={() => void save()}><Save />Profiel opslaan</Button><Button disabled={busy} variant="outline" onClick={() => void logout()}><LogOut />Uitloggen</Button></div><p className="mt-4 text-sm">Google-beheertoegang gecontroleerd. Deze aparte pagina wijzigt geen onderzoeksadministratie.</p></section><Taakstatus user={user} /><Intrekkingsstatus user={user} /><Testmail user={user} /></>}
    {busy && <p role="status" className="mt-4 text-sm">Verwerken…</p>}
    {fout && <p role="alert" className="mt-4 text-sm text-destructive">{fout}</p>}
    {melding && <p role="status" className="mt-4 text-sm">{melding}</p>}
  </main>;
}