// Cookie- en privacyvoorkeuren: opslag in de browser (localStorage) + eenvoudige abonnee-API.

export const COOKIE_KEY = "trk-cookie-keuze";
export const COOKIE_GELDIGHEID_MS = 365 * 24 * 60 * 60 * 1000; // 12 maanden

export type CookieVoorkeuren = {
  /** Altijd aan: nodig om de website en web-app te laten werken. */
  noodzakelijk: true;
  /** Onthoudt keuzes zoals taal, kaartlaag en geopend tabblad. */
  voorkeuren: boolean;
  /** Statistieken/analyse (niet in gebruik, standaard uit). */
  statistieken: boolean;
  /** Tijdstip van de keuze. */
  ts: number;
};

export const STANDAARD_VOORKEUREN: CookieVoorkeuren = {
  noodzakelijk: true,
  voorkeuren: true,
  statistieken: false,
  ts: 0,
};

export function leesVoorkeuren(): CookieVoorkeuren | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(COOKIE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw) as Partial<CookieVoorkeuren> & { ts?: number };
    if (!data?.ts || Date.now() - data.ts > COOKIE_GELDIGHEID_MS) return null;
    return {
      noodzakelijk: true,
      voorkeuren: data.voorkeuren !== false,
      statistieken: data.statistieken === true,
      ts: data.ts,
    };
  } catch {
    return null;
  }
}

export function bewaarVoorkeuren(keuze: Omit<CookieVoorkeuren, "noodzakelijk" | "ts">) {
  const volledig: CookieVoorkeuren = { noodzakelijk: true, ...keuze, ts: Date.now() };
  try {
    localStorage.setItem(COOKIE_KEY, JSON.stringify(volledig));
  } catch {
    /* lokale opslag niet beschikbaar */
  }
  return volledig;
}

/** Opent het voorkeurenscherm vanuit een willekeurige plek in de website en web-app. */
export const OPEN_EVENT = "trk-open-cookievoorkeuren";
export function openCookieVoorkeuren() {
  window.dispatchEvent(new CustomEvent(OPEN_EVENT));
}
