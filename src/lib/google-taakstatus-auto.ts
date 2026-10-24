/** Read-only refresh while the approved administration page is visible. */
export function startAutomatischeTaaklezing(
  lees: () => Promise<void>,
  pagina: Pick<Document, "visibilityState" | "addEventListener" | "removeEventListener">,
  klok: Pick<typeof globalThis, "setInterval" | "clearInterval"> = globalThis,
) {
  let gestopt = false;
  let bezig = false;
  const ververs = async () => {
    if (gestopt || bezig || pagina.visibilityState !== "visible") return;
    bezig = true;
    try { await lees(); } finally { bezig = false; }
  };
  const zichtbaar = () => { void ververs(); };
  void ververs();
  const timer = klok.setInterval(zichtbaar, 60_000);
  pagina.addEventListener("visibilitychange", zichtbaar);
  return () => {
    gestopt = true;
    klok.clearInterval(timer);
    pagina.removeEventListener("visibilitychange", zichtbaar);
  };
}