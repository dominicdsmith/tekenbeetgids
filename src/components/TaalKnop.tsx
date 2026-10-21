import { useEffect, useState } from "react";
import { TAAL_EVENT, leesTaal, zetTaal, type Taal } from "@/lib/taal";

export default function TaalKnop({ kleur = "#A63428", scheiding, marginLinks = 8 }: { kleur?: string; scheiding: string; marginLinks?: number }) {
  void kleur;
  void scheiding;


  const [taal, setTaalState] = useState<Taal>("nl");

  useEffect(() => {
    setTaalState(leesTaal());
    const on = () => setTaalState(leesTaal());
    window.addEventListener(TAAL_EVENT, on);
    return () => window.removeEventListener(TAAL_EVENT, on);
  }, []);

  return (
    <span
      data-geen-vertaling
      style={{ display: "inline-flex", alignItems: "center", gap: 7, marginLeft: marginLinks }}
    >
      <span aria-hidden="true" style={{ color: "#7FB2CC", fontSize: 13, lineHeight: 1 }}>
        |
      </span>
      <button
        type="button"
        onClick={() => zetTaal(taal === "en" ? "nl" : "en")}
        aria-label={taal === "en" ? "Schakel naar Nederlands" : "Switch to English"}
        style={{
          background: "none",
          border: "none",
          padding: 0,
          cursor: "pointer",
          color: "#A63428",
          fontFamily: "inherit",
          fontSize: 9,
          fontWeight: 400,

          letterSpacing: ".02em",
          textDecoration: "none",

        }}
      >
        {taal === "en" ? "Nederlands" : "English"}
      </button>
    </span>
  );
}
