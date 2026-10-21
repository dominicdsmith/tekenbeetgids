import { useEffect, useState } from "react";

// Zwevende knoppen onder in beeld mogen niet over een balk plakken die tegen de
// onderkant van het scherm staat, zoals de legendabalk van de kaart. Een balk
// meldt zich met de class "onderbalk"; de knop schuift dan op boven die balk.
const KNOP_HOOGTE = 48;
const RUIMTE_BOVEN_BALK = 10;

function isOnderbalk(knoop: Node): boolean {
  if (!(knoop instanceof Element)) return false;
  return knoop.matches(".onderbalk") || !!knoop.querySelector(".onderbalk");
}

/** Ruimte (in px) die een zwevende knop vrijhoudt voor de balk onder in beeld. */
export function useRuimteOnder(kant: "links" | "rechts") {
  const [onder, setOnder] = useState(0);

  useEffect(() => {
    const meet = () => {
      const h = window.innerHeight;
      const w = window.innerWidth;
      let hoogte = 0;
      for (const balk of document.querySelectorAll<HTMLElement>(".onderbalk")) {
        const r = balk.getBoundingClientRect();
        if (r.width <= 0 || r.height <= 0) continue;
        if (r.bottom < h - 2 || r.top > h - 8) continue;
        // Telt deze balk voor de gekozen kant van het scherm?
        if (kant === "rechts" ? r.x + r.width < w - KNOP_HOOGTE - 24 : r.x > KNOP_HOOGTE + 24) {
          continue;
        }
        hoogte = Math.max(hoogte, r.height);
      }
      setOnder(hoogte ? Math.round(hoogte + RUIMTE_BOVEN_BALK) : 0);
    };

    let ro: ResizeObserver | null = null;
    const koppel = () => {
      ro?.disconnect();
      ro = new ResizeObserver(meet);
      document.querySelectorAll(".onderbalk").forEach((balk) => ro!.observe(balk));
    };

    meet();
    koppel();

    // De kaartbalk kan later in beeld komen (ander tabblad, in-/uitklappen),
    // dus opnieuw koppelen zodra zo'n balk wordt toegevoegd of verwijderd.
    const mo = new MutationObserver((meldingen) => {
      let raak = false;
      for (const m of meldingen) {
        for (const n of m.addedNodes) if (isOnderbalk(n)) raak = true;
        for (const n of m.removedNodes) if (isOnderbalk(n)) raak = true;
      }
      if (raak) {
        koppel();
        meet();
      }
    });
    mo.observe(document.body, { childList: true, subtree: true });

    window.addEventListener("resize", meet);
    window.addEventListener("orientationchange", meet);
    return () => {
      mo.disconnect();
      ro?.disconnect();
      window.removeEventListener("resize", meet);
      window.removeEventListener("orientationchange", meet);
    };
  }, [kant]);

  return onder;
}
