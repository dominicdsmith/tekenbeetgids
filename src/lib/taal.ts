import { useEffect, useState } from "react";

export type Taal = "nl" | "en";

const KEY = "trk-taal";
export const TAAL_EVENT = "trk-taal-change";

export function leesTaal(): Taal {
  if (typeof window === "undefined") return "nl";
  try {
    return window.localStorage.getItem(KEY) === "en" ? "en" : "nl";
  } catch {
    return "nl";
  }
}

export function zetTaal(taal: Taal) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, taal);
  } catch {
    /* opslag geblokkeerd — taal geldt dan alleen voor deze sessie */
  }
  document.documentElement.lang = taal;
  window.dispatchEvent(new CustomEvent(TAAL_EVENT, { detail: taal }));
}

/** Reactieve taalkeuze: componenten hertekenen zodra de taal wisselt. */
export function useTaal(): Taal {
  const [taal, setTaal] = useState<Taal>("nl");
  useEffect(() => {
    setTaal(leesTaal());
    const on = () => setTaal(leesTaal());
    window.addEventListener(TAAL_EVENT, on);
    return () => window.removeEventListener(TAAL_EVENT, on);
  }, []);
  return taal;
}
