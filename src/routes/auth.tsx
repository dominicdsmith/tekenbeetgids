import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/auth")({
  component: AuthPagina,
  head: () => ({
    meta: [
      { title: "Inloggen — TekenRisicoKaart beheer" },
      { name: "description", content: "Beveiligde toegang tot het beheerdersgedeelte van TekenRisicoKaart." },
      { name: "robots", content: "noindex, nofollow" },
      { property: "og:title", content: "Inloggen — TekenRisicoKaart beheer" },
      { property: "og:description", content: "Beveiligde toegang tot het beheerdersgedeelte van TekenRisicoKaart." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
});

const BLAUW = "#123A52";
const LIJN = "#BBD7E6";

function AuthPagina() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [wachtwoord, setWachtwoord] = useState("");
  const [bezig, setBezig] = useState(false);
  const [fout, setFout] = useState("");

  const inloggen = async (e: React.FormEvent) => {
    e.preventDefault();
    setBezig(true);
    setFout("");
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password: wachtwoord });
    setBezig(false);
    if (error) {
      setFout("Inloggen is niet gelukt. Controleer uw e-mailadres en wachtwoord.");
      return;
    }
    void navigate({ to: "/beheer/contactlog" });
  };

  return (
    <main style={{ maxWidth: 380, margin: "48px auto", padding: "0 16px", fontFamily: "system-ui, sans-serif", color: BLAUW }}>
      <h1 style={{ fontSize: 20, marginBottom: 4 }}>Beheer — inloggen</h1>
      <p style={{ fontSize: 12.5, color: "#3E6A7D", marginTop: 0 }}>
        Alleen voor beheerders van TekenRisicoKaart.
      </p>
      <form onSubmit={inloggen}>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="E-mailadres"
          aria-label="E-mailadres"
          required
          style={{ width: "100%", boxSizing: "border-box", padding: "9px 10px", border: `1px solid ${LIJN}`, borderRadius: 7, marginBottom: 8, fontSize: 13 }}
        />
        <input
          type="password"
          value={wachtwoord}
          onChange={(e) => setWachtwoord(e.target.value)}
          placeholder="Wachtwoord"
          aria-label="Wachtwoord"
          required
          style={{ width: "100%", boxSizing: "border-box", padding: "9px 10px", border: `1px solid ${LIJN}`, borderRadius: 7, marginBottom: 10, fontSize: 13 }}
        />
        <button
          type="submit"
          disabled={bezig}
          style={{ padding: "9px 14px", border: "none", borderRadius: 7, background: bezig ? "#5A8299" : BLAUW, color: "#fff", fontWeight: 700, fontSize: 13, cursor: bezig ? "not-allowed" : "pointer" }}
        >
          {bezig ? "Bezig…" : "Inloggen"}
        </button>
      </form>
      {fout && <p style={{ color: "#A63428", fontSize: 12, fontWeight: 700 }}>{fout}</p>}
    </main>
  );
}
