import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ShieldCheck, LogIn, LogOut, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { User } from "firebase/auth";

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
      : <section><h2 className="mb-4 text-lg font-semibold">Beheerprofiel</h2><label htmlFor="google-profielnaam" className="mb-2 block text-sm">Naam</label><Input id="google-profielnaam" maxLength={100} value={naam} onChange={e => setNaam(e.target.value)} /><div className="mt-4 flex flex-wrap gap-3"><Button disabled={busy || !naam.trim()} onClick={() => void save()}><Save />Profiel opslaan</Button><Button disabled={busy} variant="outline" onClick={() => void logout()}><LogOut />Uitloggen</Button></div><p className="mt-4 text-sm">Google-beheertoegang gecontroleerd. Deze aparte pagina wijzigt geen onderzoeksadministratie.</p></section>}
    {busy && <p role="status" className="mt-4 text-sm">Verwerken…</p>}
    {fout && <p role="alert" className="mt-4 text-sm text-destructive">{fout}</p>}
    {melding && <p role="status" className="mt-4 text-sm">{melding}</p>}
  </main>;
}