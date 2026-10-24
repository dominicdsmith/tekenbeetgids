import { describe, expect, it, vi } from "vitest";
import { startAutomatischeTaaklezing } from "../src/lib/google-taakstatus-auto";

function pagina() {
  let listener: (() => void) | undefined;
  return {
    visibilityState: "visible" as DocumentVisibilityState,
    addEventListener: vi.fn((_naam: string, cb: EventListenerOrEventListenerObject) => { listener = cb as () => void; }),
    removeEventListener: vi.fn(() => { listener = undefined; }),
    verander(status: DocumentVisibilityState) { this.visibilityState = status; listener?.(); },
  };
}
function klok() {
  let callback: (() => void) | undefined;
  return {
    setInterval: vi.fn((cb: () => void, ms: number) => { expect(ms).toBe(60_000); callback = cb; return 1; }),
    clearInterval: vi.fn(() => { callback = undefined; }),
    tik() { callback?.(); },
  };
}
describe("automatische taakstatuslezing", () => {
  it("leest direct en daarna zonder handmatig vernieuwen", async () => {
    const p = pagina(); const k = klok(); const lees = vi.fn(async () => {});
    const stop = startAutomatischeTaaklezing(lees, p, k);
    await Promise.resolve(); k.tik();
    expect(lees).toHaveBeenCalledTimes(2); stop();
  });
  it("leest niet op de achtergrond en leest bij terugkeer", async () => {
    const p = pagina(); const k = klok(); const lees = vi.fn(async () => {});
    const stop = startAutomatischeTaaklezing(lees, p, k);
    await Promise.resolve(); p.verander("hidden");
    k.tik(); k.tik(); expect(lees).toHaveBeenCalledTimes(1);
    p.verander("visible"); expect(lees).toHaveBeenCalledTimes(2); stop();
  });
  it("stopt bij verlaten of uitloggen", async () => {
    const p = pagina(); const k = klok(); const lees = vi.fn(async () => {});
    const stop = startAutomatischeTaaklezing(lees, p, k); stop();
    await Promise.resolve(); k.tik(); k.tik(); p.verander("visible");
    expect(lees).toHaveBeenCalledTimes(1);
  });
  it("voorkomt overlappende lezingen", async () => {
    const p = pagina(); const k = klok();
    let klaar: (() => void) | undefined;
    const lees = vi.fn(() => new Promise<void>(resolve => { klaar = resolve; }));
    const stop = startAutomatischeTaaklezing(lees, p, k);
    k.tik(); k.tik(); expect(lees).toHaveBeenCalledTimes(1);
    klaar?.(); await Promise.resolve(); k.tik();
    expect(lees).toHaveBeenCalledTimes(2); klaar?.(); stop();
  });
});