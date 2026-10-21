import { useEffect } from "react";
import { vertaalVrij } from "@/lib/vertaalMotor";
import { TAAL_EVENT, leesTaal, type Taal } from "@/lib/taal";

/**
 * Vertaalt de gerenderde tekst van de website naar het Engels zodra de
 * taalschakelaar op "en" staat. De Nederlandse bron blijft leidend; per
 * tekstfragment wordt een Engelse vertaling opgezocht in VERTALINGEN.
 */

const ATTRIBUTEN = ["placeholder", "aria-label", "title", "alt"] as const;
const SKIP_TAGS = new Set(["SCRIPT", "STYLE", "NOSCRIPT", "TEXTAREA", "CODE"]);

function zoek(waarde: string): string | null {
  return vertaalVrij(waarde);
}

function overslaan(el: Element | null): boolean {
  let n: Element | null = el;
  while (n) {
    if (SKIP_TAGS.has(n.tagName)) return true;
    if (n.hasAttribute("data-geen-vertaling")) return true;
    n = n.parentElement;
  }
  return false;
}

type Origineel = { node: Node; attr: string | null; waarde: string };

export default function TaalVertaler() {
  useEffect(() => {
    let taal: Taal = leesTaal();
    document.documentElement.lang = taal;

    const originelen: Origineel[] = [];
    const gezien = new WeakSet<Node>();
    let bezig = false;
    let gepland = 0;

    const vertaalTekstnode = (node: Text, force = false) => {
      if (!force && gezien.has(node)) return;
      if (overslaan(node.parentElement)) return;
      const huidig = node.nodeValue ?? "";
      const nieuw = zoek(huidig);
      if (!nieuw) return;
      // Bestaand origineel overschrijven bij hergebruik van hetzelfde textnode.
      const idx = originelen.findIndex((o) => o.node === node && o.attr === null);
      if (idx >= 0) originelen.splice(idx, 1);
      originelen.push({ node, attr: null, waarde: huidig });
      gezien.add(node);
      node.nodeValue = nieuw;
    };

    const vertaalAttributen = (el: Element) => {
      if (overslaan(el)) return;
      for (const attr of ATTRIBUTEN) {
        const waarde = el.getAttribute(attr);
        if (!waarde) continue;
        const nieuw = zoek(waarde);
        if (!nieuw) continue;
        originelen.push({ node: el, attr, waarde });
        el.setAttribute(attr, nieuw);
      }
    };

    const loop = (root: Node) => {
      if (root.nodeType === Node.TEXT_NODE) {
        vertaalTekstnode(root as Text);
        return;
      }
      if (root.nodeType !== Node.ELEMENT_NODE) return;
      const el = root as Element;
      if (overslaan(el)) return;
      vertaalAttributen(el);
      el.querySelectorAll("*").forEach((kind) => vertaalAttributen(kind));
      const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
      const nodes: Text[] = [];
      let n = walker.nextNode();
      while (n) {
        nodes.push(n as Text);
        n = walker.nextNode();
      }
      nodes.forEach((n) => vertaalTekstnode(n));
    };

    const vertaalAlles = () => {
      bezig = true;
      loop(document.body);
      bezig = false;
    };

    const herstel = () => {
      bezig = true;
      for (let i = originelen.length - 1; i >= 0; i--) {
        const o = originelen[i];
        if (!o) continue;
        if (o.attr) (o.node as Element).setAttribute(o.attr, o.waarde);
        else o.node.nodeValue = o.waarde;
      }
      originelen.length = 0;
      bezig = false;
    };

    const observer = new MutationObserver((mutaties) => {
      if (taal !== "en" || bezig) return;
      if (gepland) return;
      gepland = window.requestAnimationFrame(() => {
        gepland = 0;
        bezig = true;
        for (const m of mutaties) {
          if (m.type === "characterData") vertaalTekstnode(m.target as Text, true);
          else m.addedNodes.forEach((node) => loop(node));
        }
        // Nagekomen wijzigingen buiten deze batch alsnog meenemen.
        loop(document.body);
        bezig = false;
      });
    });

    const start = () => {
      observer.observe(document.body, {
        childList: true,
        subtree: true,
        characterData: true,
      });
    };

    // Wait until descendant route hydration has completed before mutating
    // server-rendered text. React-owned legal translations opt out entirely.
    const initialisatie = window.setTimeout(() => {
      if (taal === "en") {
        vertaalAlles();
        start();
      }
    }, 300);

    const onWissel = (e: Event) => {
      const nieuw = ((e as CustomEvent).detail as Taal) ?? leesTaal();
      if (nieuw === taal) return;
      taal = nieuw;
      if (taal === "en") {
        vertaalAlles();
        start();
      } else {
        observer.disconnect();
        herstel();
      }
    };

    window.addEventListener(TAAL_EVENT, onWissel);
    return () => {
      window.clearTimeout(initialisatie);
      window.removeEventListener(TAAL_EVENT, onWissel);
      observer.disconnect();
      if (gepland) cancelAnimationFrame(gepland);
    };
  }, []);

  return null;
}
