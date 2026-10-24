import { afterEach, describe, expect, it, vi } from "vitest";
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
afterEach(() => vi.useRealTimers());
describe("automatische taakstatuslezing", () => {
  it("leest direct en daarna zonder handmatig vernieuwen", async () => {
    vi.useFakeTimers(); const p = pagina(); const lees = vi.fn(async () => {});
    const stop = startAutomatischeTaaklezing(lees, p);
    await vi.advanceTimersByTimeAsync(60_000);
    expect(lees).toHaveBeenCalledTimes(2); stop();
  });
  it("leest niet op de achtergrond en leest bij terugkeer", async () => {
    vi.useFakeTimers(); const p = pagina(); const lees = vi.fn(async () => {});
    const stop = startAutomatischeTaaklezing(lees, p);
    await vi.advanceTimersByTimeAsync(0); p.verander("hidden");
    await vi.advanceTimersByTimeAsync(120_000); expect(lees).toHaveBeenCalledTimes(1);
    p.verander("visible"); expect(lees).toHaveBeenCalledTimes(2); stop();
  });
  it("stopt bij verlaten of uitloggen", async () => {
    vi.useFakeTimers(); const p = pagina(); const lees = vi.fn(async () => {});
    const stop = startAutomatischeTaaklezing(lees, p); stop();
    await vi.advanceTimersByTimeAsync(120_000); p.verander("visible");
    expect(lees).toHaveBeenCalledTimes(1);
  });
  it("voorkomt overlappende lezingen", async () => {
    vi.useFakeTimers(); const p = pagina();
    let klaar: (() => void) | undefined;
    const lees = vi.fn(() => new Promise<void>(resolve => { klaar = resolve; }));
    const stop = startAutomatischeTaaklezing(lees, p);
    await vi.advanceTimersByTimeAsync(120_000); expect(lees).toHaveBeenCalledTimes(1);
    klaar?.(); await vi.advanceTimersByTimeAsync(60_000);
    expect(lees).toHaveBeenCalledTimes(2); klaar?.(); stop();
  });
});