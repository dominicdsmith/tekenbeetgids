/* Maakt van een printbaar HTML-rapport een echt pdf-bestand (A4), volledig in de browser.
   Werkt op iPhone/iPad, Android en computers; er wordt niets naar een server gestuurd.

   Toegankelijkheid: de pdf bevat echte, selecteerbare tekst (geen schermafbeelding),
   met documenttaal, titel en een leesvolgorde die de volgorde van het document volgt.
   Daarvoor loopt een eigen renderer door de DOM en zet hij koppen, alinea's, lijsten,
   kaders en foto's om naar pdf-tekst en -afbeeldingen. Volledige PDF/UA-tags ondersteunt
   jsPDF niet; het tekstoverzicht op de website blijft daarom naast de pdf beschikbaar. */

const PAGINA_B = 210; // A4 breedte in mm
const PAGINA_H = 297; // A4 hoogte in mm
const MARGE_X = 14;
const MARGE_TOP = 16;
const MARGE_ONDER = 16;
const INHOUD_B = PAGINA_B - 2 * MARGE_X;
const PX_MM = 25.4 / 96;
const PX_PT = 0.75;
const A4_BREEDTE_PX = 794; // 210 mm bij 96 dpi (alleen voor het parse-frame)

export function isIOS(): boolean {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent;
  return /iPad|iPhone|iPod/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1);
}

export function isMobiel(): boolean {
  if (typeof navigator === "undefined") return false;
  return isIOS() || /Android|Mobi/i.test(navigator.userAgent);
}

/* De ingebouwde pdf-lettertypen kennen alleen WinAnsi-tekens. Tekens daarbuiten
   worden vervangen door een leesbare benadering, zodat er geen vuiltekens ontstaan. */
const TEKEN_VERVANGINGEN: Record<string, string> = {
  "→": "->", "←": "<-", "↔": "<->", "✓": "v", "✔": "v", "✗": "x", "✘": "x",
  "⚠": "!", "☐": "[ ]", "☑": "[v]", "▪": "-", "▸": ">", "‣": ">", "○": "o",
  "●": "o", "×": "x", "÷": "/", "≥": ">=", "≤": "<=", "≈": "~", "−": "-",
  "‑": "-", "…": "...",
};

export function zuiverTekstVoorPdf(tekst: string): string {
  let uit = tekst;
  for (const [van, naar] of Object.entries(TEKEN_VERVANGINGEN)) uit = uit.split(van).join(naar);
  // Verwijder overige tekens buiten Latin-1 en de WinAnsi-toevoegingen.
  return uit.replace(/[^\x00-\xFF€‚ƒ„†‡ˆ‰Š‹ŒŽ‘’“”•–—˜™š›œžŸ]/g, "");
}

function parseKleur(css: string | null): [number, number, number] | null {
  if (!css) return null;
  const m = css.match(/rgba?\(\s*(\d+)[,\s]+(\d+)[,\s]+(\d+)(?:[,\s/]+([\d.]+))?\s*\)/);
  if (!m) return null;
  if (m[4] !== undefined && parseFloat(m[4]) === 0) return null; // volledig transparant
  return [Number(m[1]), Number(m[2]), Number(m[3])];
}

async function wachtOpAfbeeldingen(doc: Document) {
  const imgs = Array.from(doc.images);
  await Promise.all(
    imgs.map((img) =>
      img.complete
        ? Promise.resolve()
        : new Promise<void>((r) => {
            img.onload = () => r();
            img.onerror = () => r();
          }),
    ),
  );
}

/* ============ DOM-naar-tekst-renderer ============ */

type Kleur = [number, number, number];

type ErfStijl = { bold: boolean; italic: boolean; kleur: Kleur; link?: string | undefined };

type Run = ErfStijl & { tekst: string; breek?: boolean };

type Ctx = {
  pdf: import("jspdf").jsPDF;
  win: Window;
  y: number;
  /* Foto's worden naast elkaar gezet zolang ze passen; fotoX is de vrije x-positie
     en fotoRijH de hoogte van de lopende fotoreeks. */
  fotoX: number | null;
  fotoRijH: number;
};

const BLOK_TAGS = new Set(["H1", "H2", "H3", "H4", "P", "LI", "FOOTER", "BLOCKQUOTE"]);

function lettertypeVan(r: { bold: boolean; italic: boolean }): string {
  return r.bold ? (r.italic ? "bolditalic" : "bold") : r.italic ? "italic" : "normal";
}

/* Verzamelt de tekst van een blokelement als opeenvolgende runs met opmaak (vet, cursief, kleur, link). */
function verzamelRuns(el: Element, win: Window, erf: ErfStijl): Run[] {
  const runs: Run[] = [];
  const loop = (node: Node, st: ErfStijl) => {
    if (node.nodeType === 3) {
      const t = zuiverTekstVoorPdf((node.textContent || "").replace(/\s+/g, " "));
      if (t) runs.push({ tekst: t, ...st });
      return;
    }
    if (node.nodeType !== 1) return;
    const e = node as Element;
    const tag = e.tagName;
    if (tag === "BR") {
      runs.push({ tekst: "", ...st, breek: true });
      return;
    }
    if (tag === "SCRIPT" || tag === "STYLE" || tag === "IMG") return;
    const cs = win.getComputedStyle(e);
    if (cs.display === "none" || cs.visibility === "hidden") return;
    const gewicht = parseInt(cs.fontWeight, 10);
    const nieuw: ErfStijl = {
      bold: st.bold || tag === "STRONG" || tag === "B" || (!Number.isNaN(gewicht) && gewicht >= 600),
      italic: st.italic || cs.fontStyle === "italic",
      kleur: parseKleur(cs.color) ?? st.kleur,
      link: tag === "A" ? e.getAttribute("href") || st.link : st.link,
    };
    for (const kind of Array.from(e.childNodes)) loop(kind, nieuw);
  };
  for (const kind of Array.from(el.childNodes)) loop(kind, erf);
  return runs;
}

/* Breekt runs in regels die binnen maxB (mm) passen; iedere run wordt met zijn eigen lettertype gemeten. */
function breekRegels(pdf: import("jspdf").jsPDF, runs: Run[], fontPt: number, maxB: number): Run[][] {
  pdf.setFontSize(fontPt);
  const meet = (r: Run, t: string) => {
    pdf.setFont("helvetica", lettertypeVan(r));
    return pdf.getTextWidth(t);
  };
  const regels: Run[][] = [[]];
  let x = 0;
  for (const run of runs) {
    if (run.breek) {
      regels.push([]);
      x = 0;
      continue;
    }
    for (const deel of run.tekst.split(/(\s+)/).filter((d) => d.length > 0)) {
      const isSpatie = /^\s+$/.test(deel);
      if (isSpatie && x === 0) continue;
      const w = meet(run, deel);
      if (!isSpatie && x > 0 && x + w > maxB) {
        regels.push([]);
        x = 0;
      }
      regels[regels.length - 1]!.push({ ...run, tekst: deel });
      x += w;
    }
  }
  return regels.filter((r) => r.length > 0);
}

function tekenRegel(pdf: import("jspdf").jsPDF, regel: Run[], x0: number, yBasis: number, fontPt: number) {
  let x = x0;
  for (const r of regel) {
    pdf.setFont("helvetica", lettertypeVan(r));
    pdf.setFontSize(fontPt);
    pdf.setTextColor(r.kleur[0], r.kleur[1], r.kleur[2]);
    if (r.link && /^https?:\/\//.test(r.link)) pdf.textWithLink(r.tekst, x, yBasis, { url: r.link });
    else pdf.text(r.tekst, x, yBasis);
    x += pdf.getTextWidth(r.tekst);
  }
}

function nieuwePagina(ctx: Ctx) {
  ctx.pdf.addPage();
  ctx.y = MARGE_TOP;
  ctx.fotoX = null;
  ctx.fotoRijH = 0;
}

/* Zet één tekstblok (kop, alinea, lijstregel, kader) in de pdf. */
function renderTekstBlok(el: Element, cs: CSSStyleDeclaration, ctx: Ctx) {
  const { pdf, win } = ctx;
  const fontPt = Math.max(6, parseFloat(cs.fontSize) * PX_PT);
  const tag = el.tagName;
  const isKop = /^H[1-4]$/.test(tag);
  const gewicht = parseInt(cs.fontWeight, 10);
  const erf: ErfStijl = {
    bold: !Number.isNaN(gewicht) && gewicht >= 600,
    italic: cs.fontStyle === "italic",
    kleur: parseKleur(cs.color) ?? [38, 74, 97],
  };
  let runs = verzamelRuns(el, win, erf);
  if (cs.textTransform === "uppercase") runs = runs.map((r) => ({ ...r, tekst: r.tekst.toUpperCase() }));
  if (!runs.some((r) => r.tekst.trim())) return;

  const bg = parseKleur(cs.backgroundColor);
  const heeftBg = bg !== null && bg.join() !== "255,255,255";
  const pad = heeftBg ? 3 : 0;
  const isLi = tag === "LI";
  const inspring = isLi ? 5 : 0;
  if (isLi) runs = [{ tekst: "• ", ...erf }, ...runs];

  const regels = breekRegels(pdf, runs, fontPt, INHOUD_B - inspring - pad * 2);
  const lhPx = parseFloat(cs.lineHeight);
  const regelH = (Number.isNaN(lhPx) ? (fontPt / PX_PT) * 1.4 : lhPx) * PX_MM;
  const margeT = (parseFloat(cs.marginTop) || 0) * PX_MM;
  const margeB = (parseFloat(cs.marginBottom) || 0) * PX_MM;
  const blokH = regels.length * regelH + pad * 2;

  /* Koppen niet als laatste regel van een pagina: neem dan een nieuwe pagina. */
  const nodig = isKop ? margeT + blokH + regelH * 1.5 : margeT + Math.min(blokH, regelH * 2 + pad * 2);
  if (ctx.y + nodig > PAGINA_H - MARGE_ONDER) nieuwePagina(ctx);
  ctx.y += margeT;
  ctx.fotoX = null;

  const yStart = ctx.y;
  if (heeftBg && bg) {
    pdf.setFillColor(bg[0], bg[1], bg[2]);
    pdf.roundedRect(MARGE_X, yStart, INHOUD_B, blokH, 1.5, 1.5, "F");
    const randB = parseFloat(cs.borderLeftWidth) || 0;
    const randKleur = parseKleur(cs.borderLeftColor);
    if (randB > 0 && randKleur) {
      pdf.setFillColor(randKleur[0], randKleur[1], randKleur[2]);
      pdf.rect(MARGE_X, yStart, Math.max(0.8, randB * PX_MM), blokH, "F");
    }
    const kaderB = parseFloat(cs.borderTopWidth) || 0;
    const kaderKleur = parseKleur(cs.borderTopColor);
    if (kaderB > 0 && kaderKleur) {
      pdf.setDrawColor(kaderKleur[0], kaderKleur[1], kaderKleur[2]);
      pdf.setLineWidth(Math.max(0.3, kaderB * PX_MM));
      pdf.roundedRect(MARGE_X, yStart, INHOUD_B, blokH, 1.5, 1.5, "S");
    }
  } else {
    const randB = parseFloat(cs.borderTopWidth) || 0;
    const randKleur = parseKleur(cs.borderTopColor);
    if (randB > 0 && randKleur) {
      pdf.setDrawColor(randKleur[0], randKleur[1], randKleur[2]);
      pdf.setLineWidth(Math.max(0.3, randB * PX_MM));
      pdf.line(MARGE_X, yStart + 0.5, MARGE_X + INHOUD_B, yStart + 0.5);
    }
  }

  const spatie = parseFloat(cs.letterSpacing);
  if (!Number.isNaN(spatie) && spatie > 0) pdf.setCharSpace(spatie * PX_MM);

  let yBasis = yStart + pad + regelH * 0.78;
  for (const regel of regels) {
    if (yBasis > PAGINA_H - MARGE_ONDER) {
      nieuwePagina(ctx);
      yBasis = ctx.y + regelH * 0.78;
    }
    tekenRegel(pdf, regel, MARGE_X + inspring + pad, yBasis, fontPt);
    yBasis += regelH;
  }
  pdf.setCharSpace(0);

  ctx.y = yStart + blokH;

  /* Lijn onder een kop met border-bottom (bijv. h3 in het rapport). */
  const onderB = parseFloat(cs.borderBottomWidth) || 0;
  const onderKleur = parseKleur(cs.borderBottomColor);
  if (onderB > 0 && onderKleur) {
    pdf.setDrawColor(onderKleur[0], onderKleur[1], onderKleur[2]);
    pdf.setLineWidth(Math.max(0.2, onderB * PX_MM));
    pdf.line(MARGE_X, ctx.y + 0.6, MARGE_X + INHOUD_B, ctx.y + 0.6);
    ctx.y += 1.2;
  }
  ctx.y += margeB;
}

/* Sluit een lopende fotoreeks af: de rijhoogte telt vanaf dan mee in de pagina. */
function sluitFotoRij(ctx: Ctx) {
  if (ctx.fotoX !== null) {
    ctx.y += ctx.fotoRijH;
    ctx.fotoRijH = 0;
    ctx.fotoX = null;
  }
}

/* Zet een foto in de pdf; opeenvolgende foto's komen naast elkaar zolang ze passen. */
function renderAfbeelding(img: HTMLImageElement, ctx: Ctx) {
  const src = img.currentSrc || img.src;
  if (!src || !/^(data:|blob:|https?:)/.test(src)) return;
  const nw = img.naturalWidth || 1;
  const nh = img.naturalHeight || 1;
  let w = 55;
  let h = (nh / nw) * 55;
  if (h > 55) {
    h = 55;
    w = (nw / nh) * 55;
  }
  let x = MARGE_X + 2;
  if (ctx.fotoX !== null && ctx.fotoX + 3 + w <= MARGE_X + INHOUD_B) {
    x = ctx.fotoX + 3;
  } else {
    sluitFotoRij(ctx);
    if (ctx.y + h > PAGINA_H - MARGE_ONDER) nieuwePagina(ctx);
  }
  try {
    const formaat = src.startsWith("data:image/png") ? "PNG" : "JPEG";
    ctx.pdf.addImage(src, formaat, x, ctx.y, w, h);
    ctx.pdf.setDrawColor(187, 215, 230);
    ctx.pdf.setLineWidth(0.3);
    ctx.pdf.rect(x, ctx.y, w, h);
  } catch {
    return; // Onleesbare afbeelding overslaan; de bijschrifttekst blijft wel staan.
  }
  ctx.fotoX = x + w;
  ctx.fotoRijH = Math.max(ctx.fotoRijH, h + 3);
}

/* Loopt de DOM in documentvolgorde af: dat wordt de leesvolgorde van de pdf. */
function loopBlokken(el: Element, ctx: Ctx) {
  const { win } = ctx;
  for (const kind of Array.from(el.children)) {
    const cs = win.getComputedStyle(kind);
    if (cs.display === "none" || cs.visibility === "hidden") continue;
    if (kind.getAttribute("aria-hidden") === "true") continue;
    const tag = kind.tagName;
    if (tag === "SCRIPT" || tag === "STYLE" || tag === "IFRAME" || tag === "TEMPLATE") continue;
    /* Zwevende/decoratieve lagen (watermerk, tijdbalk-markeringen) horen niet in de tekstlaag;
       de disclaimer is in de bron fixed gepositioneerd maar hoort wél in de pdf. */
    if ((cs.position === "absolute" || cs.position === "fixed") && !kind.classList.contains("disclaimer")) continue;
    if (kind.classList.contains("watermerk") || kind.classList.contains("tijdbalk")) continue;
    if (tag === "IMG") {
      renderAfbeelding(kind as HTMLImageElement, ctx);
      continue;
    }
    const isBlok = BLOK_TAGS.has(tag) || kind.classList.contains("eyebrow") || kind.classList.contains("fotokop");
    const heeftEigenTekst = Array.from(kind.childNodes).some((n) => n.nodeType === 3 && (n.textContent || "").trim());
    if (isBlok || heeftEigenTekst) {
      /* Een open fotoreeks eerst afsluiten, zodat de tekst eronder komt. */
      sluitFotoRij(ctx);
      renderTekstBlok(kind, cs, ctx);
    } else {
      loopBlokken(kind, ctx);
    }
  }
}

export async function maakPdf(html: string, opties: { watermerk?: boolean } = {}): Promise<Blob> {
  const { jsPDF } = await import("jspdf");

  const frame = document.createElement("iframe");
  frame.setAttribute("aria-hidden", "true");
  frame.style.cssText = `position:fixed;left:-20000px;top:0;width:${A4_BREEDTE_PX}px;height:1200px;border:0;background:#fff;`;
  document.body.appendChild(frame);
  try {
    const doc = frame.contentDocument;
    if (!doc) throw new Error("geen document");
    doc.open();
    doc.write(html);
    doc.close();
    await new Promise<void>((r) => {
      if (doc.readyState === "complete") r();
      else frame.onload = () => r();
      window.setTimeout(r, 1500);
    });
    await wachtOpAfbeeldingen(doc);
    const win = frame.contentWindow;
    if (!win) throw new Error("geen venster");

    const pdf = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait", compress: true });
    const titel = doc.title?.trim();
    if (titel) pdf.setProperties({ title: titel, creator: "TekenRisicoKaart - TekenbeetGids" });
    const taal = doc.documentElement.lang;
    if (taal && typeof (pdf as unknown as { setLanguage?: (l: string) => void }).setLanguage === "function") {
      (pdf as unknown as { setLanguage: (l: string) => void }).setLanguage(taal);
    }

    const ctx: Ctx = { pdf, win, y: MARGE_TOP, fotoX: null, fotoRijH: 0 };
    loopBlokken(doc.body, ctx);

    const totaal = pdf.getNumberOfPages();
    for (let i = 1; i <= totaal; i++) {
      pdf.setPage(i);
      if (opties.watermerk !== false) tekenWatermerk(pdf);
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(8);
      pdf.setTextColor(120);
      pdf.text(`${i} / ${totaal}`, PAGINA_B - 10, PAGINA_H - 5, { align: "right" });
    }
    return pdf.output("blob");
  } finally {
    frame.remove();
  }
}

/* Watermerk per pagina: schuine, lichte tekst (zelfde als in het printbare rapport). */
function tekenWatermerk(pdf: import("jspdf").jsPDF) {
  const p = pdf as unknown as { GState: new (o: { opacity: number }) => unknown; setGState: (g: unknown) => void };
  p.setGState(new p.GState({ opacity: 0.1 }));
  pdf.setTextColor(46, 123, 160);
  for (let y = 40; y < 297; y += 85) {
    for (let x = 20; x < 230; x += 120) {
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(22);
      pdf.text("TekenbeetGids", x, y, { angle: 32 });
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(10);
      pdf.text("www.tekenbeetgids.nl", x + 6, y + 6, { angle: 32 });
    }
  }
  p.setGState(new p.GState({ opacity: 1 }));
}

/* Bewaart of deelt het pdf-bestand. Mobiel: deelmenu (Bewaar in Bestanden, Afdrukken, AirDrop...).
   Computer: direct downloaden. Geeft false terug als de gebruiker annuleert. */
export async function deelOfDownloadPdf(blob: Blob, naam: string, voorkeurDelen: boolean): Promise<boolean> {
  const file = new File([blob], naam, { type: "application/pdf" });
  const nav = navigator as Navigator & { canShare?: (d: ShareData) => boolean };
  if (voorkeurDelen && nav.share && nav.canShare?.({ files: [file] })) {
    try {
      await nav.share({ files: [file], title: naam });
      return true;
    } catch (e) {
      if ((e as Error)?.name === "AbortError") return false;
    }
  }
  downloadBlob(blob, naam);
  return true;
}

export function downloadBlob(blob: Blob, naam: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = naam;
  a.rel = "noopener";
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 60000);
}

/* Opent de pdf in de ingebouwde pdf-weergave (met Afdrukken/Delen). */
export function openPdf(blob: Blob): boolean {
  const url = URL.createObjectURL(blob);
  const w = window.open(url, "_blank");
  window.setTimeout(() => URL.revokeObjectURL(url), 120000);
  return !!w;
}
