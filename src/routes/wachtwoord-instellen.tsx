import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/wachtwoord-instellen")({
  component: WachtwoordInstellen,
  head: () => ({
    meta: [
      { title: "Wachtwoord instellen — TekenRisicoKaart beheer" },
      { name: "description", content: "Stel het wachtwoord in voor uw beheerdersaccount van TekenRisicoKaart." },
      { name: "robots", content: "noindex, nofollow" },
      { property: "og:title", content: "Wachtwoord instellen — TekenRisicoKaart beheer" },
      { property: "og:description", content: "Stel het wachtwoord in voor uw beheerdersaccount van TekenRisicoKaart." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
});

const BLAUW = "#123A52";
const LIJN = "#BBD7E6";
const veld = { width: "100%", boxSizing: "border-box" as const, padding: "9px 10px", border: `1px solid ${LIJN}`, borderRadius: 7, marginBottom: 8, fontSize: 13 };

function WachtwoordInstellen() {
  const navigate = useNavigate();
  const [klaar, setKlaar] = useState(false);
  const [heeftSessie, setHeeftSessie] = useState(false);
  const [w1, setW1] = useState("");
  const [w2, setW2] = useState("");
  const [bezig, setBezig] = useState(false);
  const [fout, setFout] = useState("");

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_e, sessie) => {
      if (sessie) setHeeftSessie(true);
    });
    void supabase.auth.getSession().then(({ data }) => {
      setHeeftSessie(!!data.session);
      setKlaar(true);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const opslaan = async (e: React.FormEvent) => {
    e.preventDefault();
    setFout("");
    if (w1.length < 10) return setFout("Kies een wachtwoord van minimaal 10 tekens.");
    if (w1 !== w2) return setFout("De twee wachtwoorden zijn niet gelijk.");
    setBezig(true);
    const { error } = await supabase.auth.updateUser({ password: w1 });
    setBezig(false);
    if (error) return setFout("Opslaan is niet gelukt. Kies een ander (sterker) wachtwoord of vraag een nieuwe link aan.");
    void navigate({ to: "/beheer/firebase-proef" });
  };

  return (
    <main style={{ maxWidth: 380, margin: "48px auto", padding: "0 16px", fontFamily: "system-ui, sans-serif", color: BLAUW }}>
      <h1 style={{ fontSize: 20, marginBottom: 4 }}>Beheer — wachtwoord instellen</h1>
      {!klaar ? (
        <p style={{ fontSize: 12.5 }}>Even geduld…</p>
      ) : !heeftSessie ? (
        <p style={{ fontSize: 12.5 }}>
          Deze link is verlopen of al gebruikt. Vraag via “Wachtwoord vergeten?” op het inlogscherm een nieuwe link aan.
        </p>
      ) : (
        <form onSubmit={opslaan}>
          <p style={{ fontSize: 12.5, color: "#3E6A7D", marginTop: 0 }}>Kies een nieuw wachtwoord van minimaal 10 tekens.</p>
          <input type="password" value={w1} onChange={(e) => setW1(e.target.value)} placeholder="Nieuw wachtwoord" aria-label="Nieuw wachtwoord" autoComplete="new-password" required style={veld} />
          <input type="password" value={w2} onChange={(e) => setW2(e.target.value)} placeholder="Herhaal wachtwoord" aria-label="Herhaal wachtwoord" autoComplete="new-password" required style={{ ...veld, marginBottom: 10 }} />
          <button type="submit" disabled={bezig} style={{ padding: "9px 14px", border: "none", borderRadius: 7, background: bezig ? "#5A8299" : BLAUW, color: "#fff", fontWeight: 700, fontSize: 13, cursor: bezig ? "not-allowed" : "pointer" }}>
            {bezig ? "Bezig…" : "Wachtwoord opslaan"}
          </button>
        </form>
      )}
      {fout && <p style={{ color: "#A63428", fontSize: 12, fontWeight: 700 }}>{fout}</p>}
    </main>
  );
}
