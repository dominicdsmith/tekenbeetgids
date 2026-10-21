// Tijdelijke opruim-worker: verwijdert oude app-caches en schrijft zichzelf daarna uit.
// Deze worker wordt opnieuw geregistreerd bij elke asset-versie, zodat oude
// app-caches (TekenRisicoKaart én TekenbeetGids) betrouwbaar worden geleegd.
// Versie: 2026-09-02-022

self.addEventListener("install", () => self.skipWaiting());

function isAppCache(name) {
  const hasAppCacheBucket = /(^|-)precache-v\d+-|(^|-)runtime-|(^|-)googleAnalytics-/.test(name);
  return hasAppCacheBucket && name.endsWith(self.registration.scope);
}

self.addEventListener("activate", (event) =>
  event.waitUntil(
    (async () => {
      let deletedAny = false;
      try {
        const cacheNames = await caches.keys();
        const appCacheNames = cacheNames.filter(isAppCache);
        const results = await Promise.allSettled(
          appCacheNames.map((name) => caches.delete(name)),
        );
        deletedAny = results.some((r) => r.status === "fulfilled" && r.value);
        await self.clients.claim();
        // Alleen herladen als er daadwerkelijk iets is opgeruimd; zo voorkomen
        // we een eindeloze herlaadlus bij herhaalde registratie.
        if (deletedAny) {
          const windowClients = await self.clients.matchAll({ type: "window" });
          await Promise.allSettled(
            windowClients.map((client) => client.navigate(client.url)),
          );
        }
      } finally {
        await self.registration.unregister();
      }
    })(),
  ),
);
