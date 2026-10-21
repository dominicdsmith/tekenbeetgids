// Kleine gedeelde status: is het startscherm nog zichtbaar?
// Zo kan de cookie- en privacymelding wachten tot de gebruiker in de app is.

let actief = false;
let klaar = false;
const luisteraars = new Set<() => void>();

/** Aanroepen zodra het startscherm getoond wordt. */
export function meldSplashActief() {
  if (!klaar) actief = true;
}

/** Is het startscherm op dit moment nog zichtbaar? */
export function splashIsActief() {
  return actief && !klaar;
}

/** Aanroepen zodra het startscherm verdwenen is. */
export function meldSplashKlaar() {
  klaar = true;
  actief = false;
  for (const fn of Array.from(luisteraars)) fn();
  luisteraars.clear();
}

/** Voert `fn` direct uit als er geen startscherm (meer) is, anders erna. */
export function bijSplashKlaar(fn: () => void) {
  if (!splashIsActief()) {
    fn();
    return () => {};
  }
  luisteraars.add(fn);
  return () => {
    luisteraars.delete(fn);
  };
}
