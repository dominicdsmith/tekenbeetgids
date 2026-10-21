import { useCallback, useEffect, useRef } from "react";
import { useSplashThema } from "@/lib/splashThema";
import { TBH_SPLASH_VERSION } from "@/data/appVersie";
import splashStaand from "@/assets/tbg-splash-staand-2026c.jpeg.asset.json";
import splashLiggend from "@/assets/tbg-splash-liggend-2026c.jpeg.asset.json";

/** Duur van tonen (5000ms) + uitfaden (600ms) uit styles.css — gelijk aan TekenRisicoKaart. */
const TOTALE_DUUR = 5600;

/** Dezelfde lichte kleur als header en footer; Safari-balken gaan hiermee samen. */
const SPLASH_KLEUR = "#F5FAFE";

export default function SplashTekenbeetHulp({ onDone }: { onDone: () => void }) {
  const staandSrc = `${splashStaand.url}?v=${TBH_SPLASH_VERSION}`;
  const liggendSrc = `${splashLiggend.url}?v=${TBH_SPLASH_VERSION}`;

  // Browserbalken tinten mee met de foto in plaats van fel te contrasteren.
  useSplashThema(SPLASH_KLEUR);

  // Zorg dat onDone precies één keer wordt uitgevoerd (klik, animatie-einde
  // of noodtimer kunnen elkaar anders overlappen).
  const afgerond = useRef(false);
  const rond = useCallback(() => {
    if (afgerond.current) return;
    afgerond.current = true;
    onDone();
  }, [onDone]);

  // Dit app-gestuurde startscherm bepaalt in browser én geïnstalleerde web-app
  // exact dezelfde timing: vijf seconden + 600 ms uitfaden.
  useEffect(() => {
    const t = window.setTimeout(rond, TOTALE_DUUR + 500);
    return () => window.clearTimeout(t);
  }, [rond]);

  return (
    <div
      className="browser-splash browser-splash--tekenbeethulp"
      onClick={rond}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") rond();
      }}
      onAnimationEnd={(event) => {
        if (event.target === event.currentTarget && event.animationName.includes("splash")) rond();
      }}
      role="button"
      tabIndex={0}
      aria-label="Doorgaan naar TekenbeetGids"
    >
      <picture className="browser-splash__picture">
        <source media="(orientation: landscape)" srcSet={liggendSrc} />
        <img
          className="browser-splash__image"
          src={staandSrc}
          alt="TekenbeetGids — welkom"
          fetchPriority="high"
          decoding="sync"
        />
      </picture>
    </div>
  );
}
