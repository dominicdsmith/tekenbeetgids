import { useEffect } from "react";

/** Standaard lichte themakleur van de site (na het startscherm). */
export const SITE_THEMA_KLEUR = "#F5FAFE";

/**
 * Tint Safari's boven- en onderbalk tijdens het startscherm mee met de
 * randkleur van de startschermafbeelding, zodat er geen contrasterende
 * (donker)blauwe balken zichtbaar zijn. Bij het verdwijnen van het
 * startscherm wordt de lichte site-kleur hersteld.
 */
export function useSplashThema(kleur: string) {
  useEffect(() => {
    const metas = Array.from(
      document.querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]'),
    );
    const vorigeMeta = metas.map((m) => m.content);
    const vorigeHtml = document.documentElement.style.backgroundColor;
    const vorigeBody = document.body.style.backgroundColor;

    metas.forEach((m) => m.setAttribute("content", kleur));
    document.documentElement.style.backgroundColor = kleur;
    document.body.style.backgroundColor = kleur;

    return () => {
      metas.forEach((m, i) => m.setAttribute("content", vorigeMeta[i] ?? SITE_THEMA_KLEUR));
      document.documentElement.style.backgroundColor = vorigeHtml || SITE_THEMA_KLEUR;
      document.body.style.backgroundColor = vorigeBody || SITE_THEMA_KLEUR;
    };
  }, [kleur]);
}
