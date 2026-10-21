/**
 * Cache-leegmaaklogica voor de PWA/web-app.
 * Verwijdert service workers en alle Cache Storage-caches, zodat
 * wijzigingen in app-naam, manifest en startscherm direct worden geladen.
 */

export const CACHE_CLEARED_KEY = "trk-cache-cleared-v";
export const CACHE_VERSION = "26";

function shouldRunClear() {
  if (typeof window === "undefined") return false;
  try {
    const previous = window.localStorage.getItem(CACHE_CLEARED_KEY);
    return previous !== CACHE_VERSION;
  } catch {
    return true;
  }
}

function markCacheCleared() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(CACHE_CLEARED_KEY, CACHE_VERSION);
  } catch {
    // ignore
  }
}

async function clearAllCaches() {
  if (typeof window === "undefined") return;

  // 1. Service workers uitschrijven en hun caches verwijderen.
  if ("serviceWorker" in navigator) {
    try {
      const registrations = await navigator.serviceWorker.getRegistrations();
      await Promise.allSettled(
        registrations.map((registration) => registration.unregister()),
      );
    } catch {
      // ignore
    }
  }

  // 2. Alleen oude app-shellcaches verwijderen. Andere workers, zoals een
  // eventuele notificatieworker, houden hun eigen caches.
  if ("caches" in window) {
    try {
      const cacheNames = await window.caches.keys();
      const appCacheNames = cacheNames.filter((name) =>
        /(^|-)precache-v\d+-|(^|-)runtime-|(^|-)googleAnalytics-/.test(name),
      );
      await Promise.allSettled(
        appCacheNames.map((name) => window.caches.delete(name)),
      );
    } catch {
      // ignore
    }
  }

  markCacheCleared();
}

export function clearAppCache() {
  if (!shouldRunClear()) return;
  clearAllCaches().catch(() => {
    // Failsafe: niets doen bij fout.
  });
}

export async function forceClearAppCacheAndReload() {
  await clearAllCaches();
  if (typeof window !== "undefined") {
    window.location.reload();
  }
}

/** Geeft aan of er voor de huidige versie al een cache-opruiming heeft plaatsgevonden. */
export function isAppCacheAlreadyCleared() {
  return !shouldRunClear();
}
