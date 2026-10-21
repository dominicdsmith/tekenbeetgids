import { useState, useRef, useCallback, useEffect, type ReactNode } from "react";
import { Link, useSearch } from "@tanstack/react-router";
import { Facebook, Instagram } from "lucide-react";
import xIconAsset from "@/assets/x-icon-blue.png.asset.json";
import dsaLogoAsset from "@/assets/dominic-smith-advies-logo.jpg.asset.json";

import { useServerFn } from "@tanstack/react-start";
import { verstuurContact } from "@/lib/contact.functions";
import { trekDeelnameIn } from "@/lib/optout.functions";
import InformatieAssistent from "@/components/InformatieAssistent";
import logoAsset from "@/assets/tekenrisicokaart-logo.jpg.asset.json";
import levensstadiaSchaalAsset from "@/assets/teek-levensstadia-schaal.jpg.asset.json";
import levensstadiaNagelAsset from "@/assets/teek-levensstadia-nagel.jpg.asset.json";
import TaalKnop from "@/components/TaalKnop";
import TekenbeetHulp from "@/components/TekenbeetHulp";
import { Button } from "@/components/ui/button";
import TekenMeldingenTab, { MeldingInhoud, SoortIcoon, meldSoorten } from "@/components/kaart/TekenMeldingen";
import { woordenLijstVoor } from "@/data/woordenlijst";
import { NVWA_MELD_URL, TEKEN_MELDINGEN, meldingenVoorGemeente, meldingenVoorProvincie, type MeldSoort, type TekenMelding } from "@/data/tekenMeldingen";



import { PATHS, LABEL_POS } from "@/data/nlPaths";
import { GEMEENTEN, type Gemeente } from "@/data/gemeentePaths";
import { GEMEENTE_CIJFERS, GEMEENTE_CIJFERS_BRON } from "@/data/gemeenteCijfers";
import { PLAATSEN } from "@/data/plaatsen";

const normG = (s: string) => s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, "");
function vindGemeente(naam: string, provId?: string): Gemeente | null {
  const n = normG(naam);
  return GEMEENTEN.find((g) => normG(g.naam) === n) ?? GEMEENTEN.find((g) => g.prov === provId && (normG(g.naam).startsWith(n) || n.startsWith(normG(g.naam)))) ?? null;
}
function zoekGemeenten(q: string, limit = 30): Gemeente[] {
  const n = normG(q);
  if (!n) return GEMEENTEN;
  const uit: Gemeente[] = [];
  const add = (g: Gemeente | null) => { if (g && !uit.includes(g)) uit.push(g); };
  GEMEENTEN.filter((g) => normG(g.naam).startsWith(n)).forEach(add);
  GEMEENTEN.filter((g) => normG(g.naam).includes(n)).forEach(add);
  for (const [plaats, gem, prov] of PLAATSEN) {
    if (uit.length >= limit) break;
    if (normG(plaats).startsWith(n)) add(vindGemeente(gem, prov));
  }
  return uit.slice(0, limit);
}
import {
  ICON_VERSION,
  TBH_ICON_VERSION,
  TRK_SPLASH_VERSION,
  TBH_SPLASH_VERSION,
  WEBSITE_VERSION,
  LAATSTE_UPDATE_AUTO,
  PEILDATUM_AUTO,
} from "@/data/appVersie";
import { CHANGELOG, APP_VERSIE } from "@/data/changelog";
import { useBeveiligingsscans } from "@/lib/beveiligingsscans";
import { useBackuplog } from "@/lib/backuplog";

// Het openbare changelog- en scanlogboek toont geen technische details: interne
// foutmeldingen, commit-codes, bouwstappen en werktitels worden weggefilterd.
const TECHNISCH_PATROON =
  /\b(reverted to commit|commit|work in progress|lovable update|closing brace|duplicate key|runtime error|gethost|rate limit|cache geleegd|caches geleegd|cache opgeruimd|worker|manifest|ssrhtml|react-screen|scripts\/|auto-update|autochangelog|bijgebouwd|redirect on live|fade-time|cacheversie)\b/i;

function isOpenbaarLogpunt(tekst: string): boolean {
  return !TECHNISCH_PATROON.test(tekst) && !/[0-9a-f]{16,}/i.test(tekst);
}

// Scanwaarschuwingen tonen zonder technische namen (bijv. tabel- of extensienamen achter een dubbele punt).
function openbareScanTitel(titel: string): string {
  return titel.replace(/\s*:\s*\S+\s*$/, "").trim() || titel;
}

const OPENBARE_CHANGELOG = CHANGELOG.map((c) => ({
  ...c,
  punten: c.punten.filter((p) => isOpenbaarLogpunt(p.tekst)),
})).filter((c) => c.punten.length > 0);
import { TEEK_FOTO } from "@/data/teekFotos";
import { openCookieVoorkeuren } from "@/lib/cookieVoorkeuren";
import { useDataStatus, useBronPeildata } from "@/lib/dataStatus";
import { ziekteKaartKlasse, ziekteKaartLabel } from "@/lib/ziektekaart";
import { KlasseUitleg, GEBIEDSINDICATIE_ZIN, INDICATOR_ZIN, AANWEZIGHEID_ZIN } from "@/components/kaart/KlasseUitleg";
import { useLiveCijfers, useTekenradarCijfers, useTbeHistorie, useZiekteHistorie, useTekenactiviteit, useTbeJaarcijfers, tbeCijfersZin } from "@/lib/cijfers";

import { useTaal } from "@/lib/taal";
import { vertaalTekst } from "@/lib/vertaling";
import { useQueryClient } from "@tanstack/react-query";
import {
  STZ,
  RISK,
  RISK_LBL,
  ZIEKTEN,
  PROVINCIES,
  MAANDEN,
  MAAND_COL,
  curMnd,
  TBE_MELDINGEN,
  zoekPlaatsen,
  ZIEKTE_EXTRA,
  STEDELIJK_GEBIED,
  PREVENTIE_ALGEMEEN,
  RISK_UITLEG,
  RISICO_TOELICHTING,
  CIJFER_NUANCE,
  TBE_LANDELIJK,
  TBE_BRON,
  TBE_SOORT_LBL,
  TBE_STATUS_LBL,
  TBE_CIJFERS,
  DATA_PEILDATUM,
  WIJBURG_CITATIE,

  KLASSE_METHODE,
  BRON_PEILDATA,
  TBE_CRITERIUM,
  TBE_HAARDEN_ZIN,
  WIJBURG_BRON_DOI,
  MELDINGSBIAS_KORT,
  TUINBEET_PCT,
  TUINBEET_TOELICHTING,
  TUINBEET_BRON,
  TEKENBEET_AANTAL,
  TEKENBEET_TOELICHTING,
  TEKENBEET_BRON,
  TEKENRADAR_2025,
  TEKENBEET_KLASSEN,
  tekenbeetKlasse,


  TEKENSOORTEN,
  PROV_TEKEN,
  tekenVoorZiekte,
  tekenVoorProvincie,
  STZ_BRON,
  STZ_CIJFERS,
  STZ_VERWEKKERS,
  ZIEKTESCHAAL_UITLEG,
  LV_BRON,
  LV_PUNTEN,
  LCI_BRON,
  LCI_PUNTEN,
  ZIEKTE_LCI,
  LANDELIJK_ZIEKTEN_UITLEG,

  type Provincie,
} from "@/data/tekenData";

const LOGO_SRC = logoAsset.url;
// Visueel verborgen, wel leesbaar voor schermlezers en indexeerbaar.
const srOnly: React.CSSProperties = { position: "absolute", width: 1, height: 1, padding: 0, margin: -1, overflow: "hidden", clip: "rect(0 0 0 0)", clipPath: "inset(50%)", whiteSpace: "nowrap", border: 0 };
const MAAND_NAMEN = ["Januari","Februari","Maart","April","Mei","Juni","Juli","Augustus","September","Oktober","November","December"];
/**
 * Maandactiviteit met de automatisch bijgewerkte niveaus uit de database
 * (RIVM/Tekenradar). Zolang die tabel leeg is, geldt het vaste seizoenspatroon.
 */
function useMaandActiviteit(): (typeof MAANDEN) {
  const live = useTekenactiviteit();
  return MAANDEN.map((m, i) => {
    const niveau = live[i]?.niveau;
    return typeof niveau === "number" ? { ...m, v: niveau } : m;
  });
}

/** Zin met de actuele TBE-jaarcijfers; valt terug op de vaste brontekst. */
function useTbeCijfersTekst(): string {
  const en = useTaal() === "en";
  const zin = tbeCijfersZin(useTbeJaarcijfers());
  if (!zin) return vertaalTekst(TBE_CIJFERS, en);
  const context = TBE_CIJFERS.replace(/^[\s\S]*?selectiedatum 10 maart 2026\)\.\s*/, "").trim();
  return vertaalTekst(zin, en) + " " + vertaalTekst(context, en);
}

/* Staafjeskaartje met TBE-meldingen per jaar (automatisch uit de database). */
function TbeMeldingenGrafiek() {
  const rijen = [...useTbeJaarcijfers()].slice(0, 6).reverse();
  if (!rijen.length) return null;
  const max = Math.max(...rijen.map((r) => r.meldingen), 1);
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 70, margin: "4px 0 8px" }} aria-label="TBE-meldingen per jaar">
      {rijen.map((r) => (
        <div key={r.jaar} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-end", height: "100%" }}>
          <div style={{ fontSize: 9, fontWeight: 800 }}>{r.meldingen}</div>
          <div style={{ width: "100%", maxWidth: 22, height: `${Math.max(4, (r.meldingen / max) * 46)}px`, background: "#A63428", borderRadius: "3px 3px 0 0" }} />
          <div style={{ fontSize: 8.5, opacity: 0.7, marginTop: 2 }}>{r.jaar}</div>
        </div>
      ))}
    </div>
  );
}

const HUIDIG_SEIZOEN = curMnd <= 1 || curMnd === 11 ? "Winter" : curMnd <= 4 ? "Lente" : curMnd <= 7 ? "Zomer" : "Herfst";
// Kleurklassen voor de laag "tekenbeten in de eigen tuin" (RIVM/Tekenradar).
const TUIN_KLEUR: Record<string, string> = {
  "minder dan 30%": "#CFE9F8",
  "30–40%": "#4A9FD4",
  "meer dan 40%": "#1D4E63",
};
const TUIN_KLASSEN = ["minder dan 30%", "30–40%", "meer dan 40%"] as const;
// Kleurklassen voor de laag "tekenbeten" (geschat aantal per provincie).
const BEET_KLEUR: Record<string, string> = {
  "minder dan 50.000": "#DCEDF7",
  "50.000 – 99.999": "#8FC3E0",
  "100.000 – 199.999": "#3D8CB8",
  "200.000 of meer": "#123A52",
};

const tbeCache = new Map<string, { in: (typeof TBE_MELDINGEN)[number][]; bij: (typeof TBE_MELDINGEN)[number][] }>();
function tbeVoorGemeente(g: { id: string; d: string; bb: readonly [number, number, number, number] | number[] }) {
  const hit = tbeCache.get(g.id); if (hit) return hit;
  const [x0 = 0, y0 = 0, x1 = 0, y1 = 0] = g.bb;
  const kand = TBE_MELDINGEN.filter((h) => h.cx >= x0 - 8 && h.cx <= x1 + 8 && h.cy >= y0 - 8 && h.cy <= y1 + 8);
  let binnen = kand.filter((h) => h.cx >= x0 && h.cx <= x1 && h.cy >= y0 && h.cy <= y1);
  if (typeof document !== "undefined" && typeof Path2D !== "undefined") {
    const ctx = document.createElement("canvas").getContext("2d");
    if (ctx) { const path = new Path2D(g.d); binnen = kand.filter((h) => ctx.isPointInPath(path, h.cx, h.cy)); }
  }
  const r = { in: binnen, bij: kand.filter((h) => !binnen.includes(h)) };
  if (typeof document !== "undefined") tbeCache.set(g.id, r);
  return r;
}
const TBE_STIPPEN_ZIN = "TBE-stippen tonen bekende vindplaatsen of besmettingslocaties, niet het aantal patiënten. Eén stip is niet één geval. Provinciecijfers tellen patiënten naar woonprovincie; die kan verschillen van de besmettingslocatie.";
const TBE_BRONNEN_ZIN = "Aantal gevallen: RIVM/LCI, geteld naar woonprovincie van de patiënt; de besmetting kan elders in Nederland of in het buitenland zijn opgelopen. Onderbouwing van virus en antistoffen in teken en dieren: DWHC, Erasmus MC, LabMicTA en Artemis One Health.";
const nlGetal = (n: number) => n.toLocaleString("nl-NL");




// Groen-indicatie per provincie: oppervlakte-gewogen aandeel bos en natuur van alle gemeenten, ingedeeld met dezelfde kwintielgrenzen als de gemeenten.
const GROEN_KLEUREN = ["", "#E3EEF3", "#C5E3C9", "#8CC79A", "#4E9E66", "#2D6B42"];
const GROEN_GRENZEN = (() => { const v = Object.values(GEMEENTE_CIJFERS).map((c) => c.natuur).filter((n): n is number => n != null).sort((a, b) => a - b); return [0.2, 0.4, 0.6, 0.8].map((q) => v[Math.floor(q * (v.length - 1))]); })();
const PROV_GROEN: Record<string, { natuur: number; bos: number; klasse: number }> = (() => {
  const acc: Record<string, { ha: number; n: number; b: number }> = {};
  for (const g of GEMEENTEN) { const c = GEMEENTE_CIJFERS[g.id]; if (!c?.ha || c.natuur == null) continue; const a = (acc[g.prov] ??= { ha: 0, n: 0, b: 0 }); a.ha += c.ha; a.n += c.natuur * c.ha; a.b += (c.bos ?? 0) * c.ha; }
  return Object.fromEntries(Object.entries(acc).map(([k, a]) => { const natuur = Math.round((a.n / a.ha) * 10) / 10; return [k, { natuur, bos: Math.round((a.b / a.ha) * 10) / 10, klasse: 1 + GROEN_GRENZEN.filter((t) => t != null && natuur > t).length }]; }));
})();
function DetailPanel({ p, ziekteLaag, onClose }: { p: Provincie; ziekteLaag: string | null; onClose: () => void }) {
  const taal = useTaal();
  const en = taal === "en";
  const riskBar = [0, 20, 40, 60, 80, 100][p.risk] ?? 0;
  const z = ziekteLaag ? ZIEKTEN.find((x) => x.id === ziekteLaag) : undefined;
  const risicoIdx = z ? ziekteKaartKlasse(z, p) : p.risk;
  const risicoKleur = RISK[risicoIdx] ?? STZ.rood;
  const tbeHistorie = useTbeHistorie()[p.id] ?? [];
  const tbeGevallenProv = useLiveCijfers().provincies[p.id]?.tbeGevallen ?? 0;
  const meld = meldingenVoorProvincie(p.id);
  const tbeCijfers = useTbeCijfersTekst();
  const ziekteHistorieAlles = useZiekteHistorie();
  const ziekteHistorie = z ? ziekteHistorieAlles[`${z.id}|${p.id}`] ?? [] : [];
  // bij lichte risicokleuren donkere tekst voor leesbaarheid
  const donkereTekst = risicoIdx <= 2;
  const tekstKleur = donkereTekst ? "#123A52" : "#fff";
  const vlak = donkereTekst ? "rgba(255,255,255,.35)" : "rgba(255,255,255,.07)";
  return (
    <div style={{ background: risicoKleur, color: tekstKleur, padding: "14px 13px", borderBottom: `3px solid ${STZ.terra}` }}>
      <p style={{ fontSize: 10, margin: "0 0 6px", fontWeight: 700, textDecoration: "underline", textUnderlineOffset: 2 }}>{vertaalTekst(GEBIEDSINDICATIE_ZIN, en)}</p>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 6 }}> 
        <div>
          <h2 style={{ fontSize: "clamp(15px,3vw,19px)", fontWeight: 800, lineHeight: 1.1, margin: 0 }}>{p.naam}</h2>
          <div style={{ fontSize: "clamp(9px,1.5vw,10px)", opacity: 0.7, marginTop: 2, textTransform: "uppercase", letterSpacing: ".07em" }}>
            {z ? `${z.naam} risico-indicatie` : `Tekenrisico-indicatie: ${RISK_LBL[p.risk]}`}
            {p.tbeStatus === "humaan" && " · TBE-meldingen"}
            {p.tbeStatus === "detectie" && " · TBE aangetoond"}
          </div>
        </div>
        <button onClick={onClose} aria-label="Sluiten" style={{ background: vlak, border: "none", color: tekstKleur, borderRadius: 6, padding: "4px 10px", cursor: "pointer", fontSize: 13, fontFamily: "inherit" }}>✕</button>
      </div>
      <div style={{ background: vlak, borderRadius: 7, padding: "6px 9px", marginBottom: 9 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "clamp(9.5px,1.7vw,11px)", fontWeight: 700 }}>
          <span style={{ flex: "0 0 auto", width: 11, height: 11, borderRadius: "50%", background: p.tbeStatus === "humaan" ? "#A63428" : "#fff", border: p.tbeStatus === "geen" ? "1.5px dashed #A63428" : "1.5px solid #A63428" }} />
          <span>{p.tbeStatus === "geen" ? "TBE nog niet aangetoond (uitsluiting niet mogelijk)" : TBE_STATUS_LBL[p.tbeStatus]}</span>
        </div>
        {p.tbeBron && (
          <div style={{ fontSize: "clamp(9px,1.6vw,10px)", lineHeight: 1.5, marginTop: 4, opacity: 0.85 }}>Bewijs: {p.tbeBron}</div>
        )}
        <div style={{ fontSize: "clamp(9.5px,1.7vw,11px)", fontWeight: 700, marginTop: 6 }}>{vertaalTekst("TBE-meldingen naar woonprovincie:", en)} {p.naam}: {tbeGevallenProv}</div>
        <div style={{ fontSize: "clamp(8.5px,1.5vw,9.5px)", lineHeight: 1.5, marginTop: 2, opacity: 0.8 }}>{vertaalTekst(TBE_BRONNEN_ZIN, en)}</div>
        <p className="text-[10px] leading-relaxed mt-1 mb-0">{vertaalTekst(TBE_STIPPEN_ZIN, en)}</p>
        <div style={{ fontSize: "clamp(8.5px,1.5vw,9.5px)", lineHeight: 1.5, marginTop: 4, opacity: 0.75 }}>{vertaalTekst(TBE_HAARDEN_ZIN, en)}</div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 7, marginBottom: 10 }}>
        <div style={{ background: "rgba(255,255,255,.09)", borderRadius: 7, padding: "9px 11px" }}>
          <div style={{ fontSize: 9, textTransform: "uppercase", letterSpacing: ".06em", opacity: 0.6, marginBottom: 3 }}>Teken met Borrelia</div>
          <div style={{ fontSize: "clamp(18px,4vw,24px)", fontWeight: 800, lineHeight: 1 }}>{p.lymePct}</div>
          <div style={{ fontSize: 9, opacity: 0.55, marginTop: 3 }}>landelijke broncijfers — geen provinciecijfers</div>
        </div>
        <div style={{ background: "rgba(255,255,255,.09)", borderRadius: 7, padding: "9px 11px" }}>
          <div style={{ fontSize: 9, textTransform: "uppercase", letterSpacing: ".06em", opacity: 0.6, marginBottom: 3 }}>Relatieve risico-indicatie</div>
          <div style={{ fontSize: 9, opacity: 0.75, marginBottom: 4, lineHeight: 1.35 }}>{vertaalTekst(INDICATOR_ZIN, en)}</div>
          <div style={{ height: 4, background: "rgba(255,255,255,.09)", borderRadius: 99, marginBottom: 4 }}>
            <div style={{ height: "100%", width: riskBar + "%", background: "rgba(255,255,255,.8)", borderRadius: 99 }} />
          </div>
          <div style={{ fontSize: "clamp(11px,2vw,13px)", fontWeight: 700 }}>
            {z ? vertaalTekst(ziekteKaartLabel(z, p), en) : RISK_LBL[p.risk]}
          </div>
        </div>
      </div>
      <div style={{ background: "rgba(255,255,255,.09)", borderRadius: 7, padding: "9px 11px", marginBottom: 8 }}>
        <div style={{ fontSize: 9, textTransform: "uppercase", letterSpacing: ".06em", opacity: 0.6, marginBottom: 3 }}>Bevolkingsverdeelde schatting voor {p.naam}</div>
        <div style={{ fontSize: "clamp(18px,4vw,24px)", fontWeight: 800, lineHeight: 1 }}>
          circa {nlGetal(TEKENBEET_AANTAL[p.id] ?? 0)}
        </div>
        <div style={{ fontSize: 9, opacity: 0.6, marginTop: 3 }}>omvangscategorie: {tekenbeetKlasse(TEKENBEET_AANTAL[p.id])} — geen risico-indicatie</div>
        <div style={{ fontSize: 9, opacity: 0.6, marginTop: 4, lineHeight: 1.5 }}>
          {TEKENBEET_TOELICHTING} Bron: {TEKENBEET_BRON.naam}.

        </div>
      </div>
      <div style={{ background: "rgba(255,255,255,.09)", borderRadius: 7, padding: "9px 11px", marginBottom: 8 }}>

        <div style={{ fontSize: 9, textTransform: "uppercase", letterSpacing: ".06em", opacity: 0.6, marginBottom: 3 }}>Tekenbeten in de eigen tuin</div>
        <div style={{ fontSize: "clamp(15px,3.4vw,20px)", fontWeight: 800, lineHeight: 1 }}>{TUINBEET_PCT[p.id] ?? "onbekend"}</div>
        <div style={{ fontSize: 9, opacity: 0.6, marginTop: 4, lineHeight: 1.5 }}>
          {TUINBEET_TOELICHTING} Bron: {TUINBEET_BRON.naam}.

        </div>
      </div>
      <div style={{ background: "rgba(255,255,255,.07)", borderRadius: 7, padding: "8px 10px", marginBottom: 8, fontSize: 9.5, lineHeight: 1.55, opacity: 0.85 }}>
        {vertaalTekst(RISICO_TOELICHTING, en)}
        <KlasseUitleg provincieId={p.id} />
      </div>
      <div style={{ background: "rgba(255,255,255,.07)", borderRadius: 7, padding: "8px 10px", marginBottom: 8 }}>
        <div style={{ fontSize: 9, textTransform: "uppercase", letterSpacing: ".07em", opacity: 0.55, marginBottom: 4 }}>
          TBE-meldingen per jaar (RIVM/LCI)
        </div>
        <TbeMeldingenGrafiek />
        <div style={{ fontSize: 10.5, lineHeight: 1.6, opacity: 0.88 }}>{tbeCijfers}</div>
        {tbeHistorie.length > 1 && (
          <div style={{ borderTop: "1px solid rgba(255,255,255,.15)", marginTop: 8, paddingTop: 8 }}>
            <div style={{ fontSize: 9, textTransform: "uppercase", letterSpacing: ".07em", opacity: 0.55, marginBottom: 5 }}>
              {vertaalTekst("TBE-verloop per jaar in", en)} {p.naam} (RIVM)
            </div>
            <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 46 }}>
              {tbeHistorie.map((h) => {
                const max = Math.max(1, ...tbeHistorie.map((x) => x.gevallen));
                return (
                  <div key={h.jaar} style={{ flex: 1, textAlign: "center" }}>
                    <div style={{ fontSize: 9, opacity: 0.85, marginBottom: 2 }}>{h.gevallen}</div>
                    <div
                      style={{
                        height: Math.max(2, Math.round((h.gevallen / max) * 24)),
                        background: tekstKleur,
                        opacity: 0.75,
                        borderRadius: 2,
                      }}
                    />
                    <div style={{ fontSize: 8, opacity: 0.6, marginTop: 2 }}>{String(h.jaar).slice(2)}</div>
                  </div>
                );
              })}
            </div>
            <div style={{ fontSize: 8.5, opacity: 0.6, marginTop: 4 }}>
              {vertaalTekst("Gedocumenteerde humane TBE-gevallen; automatisch bijgewerkt uit de RIVM-cijfers.", en)}
            </div>
          </div>
        )}
        <div style={{ fontSize: 9, opacity: 0.6, marginTop: 4 }}>
          {vertaalTekst("Bronnen: RIVM/LCI, DWHC, Erasmus MC, LabMicTA en Artemis One Health.", en)}
        </div>
      </div>

      <div style={{ background: "rgba(255,255,255,.07)", borderRadius: 7, padding: "8px 10px", marginBottom: 8 }}>
        <div style={{ fontSize: 9, textTransform: "uppercase", letterSpacing: ".07em", opacity: 0.55, marginBottom: 4 }}>
          {en ? "Tick reports in " : "Tekenmeldingen in "}{p.naam}
        </div>
        {(["dermacentor", "hyalomma"] as const).map((s) => {
          const lijst = meld.filter((m) => m.soort === s);
          const soortNaam = s === "dermacentor"
            ? (en ? "Ornate dog tick (Dermacentor reticulatus)" : "Vlekkenteek (Dermacentor reticulatus)")
            : (en ? "Giant tick (Hyalomma marginatum)" : "Reuzenteek (Hyalomma marginatum)");
          return (
            <div key={s} style={{ display: "flex", alignItems: "flex-start", gap: 6, fontSize: 10.5, lineHeight: 1.55, opacity: 0.88, marginBottom: 3 }}>
              <span aria-hidden="true" style={{ flexShrink: 0, width: 9, height: 9, borderRadius: "50%", background: s === "dermacentor" ? "var(--tick-dermacentor)" : "var(--tick-hyalomma)", border: "1px solid rgba(255,255,255,.7)", marginTop: 3 }} />
              <span><strong>{soortNaam}</strong>: {lijst.length ? [...new Set(lijst.map((m) => `${m.gebied} (${m.periode})`))].join(", ") : (en ? "no confirmed finding known in this province" : "geen bevestigde vondst bekend in deze provincie")}</span>
            </div>
          );
        })}
        <div style={{ fontSize: 8.5, opacity: 0.6, marginTop: 4 }}>
          {en
            ? "Coloured dots show confirmed historical findings (NVWA/RIVM and supplementary scientific research) with approximate locations; not a complete or current overview. The same D and H icons also appear in the province and municipality lists."
            : "Kleurige stippen tonen bevestigde historische vondsten (NVWA/RIVM en aanvullend wetenschappelijk onderzoek) met locaties bij benadering; geen volledig of actueel overzicht. Dezelfde icoontjes met D (Vlekkenteek) of H (Reuzenteek) staan ook in de lijsten bij Provincies en Gemeenten."}
        </div>
      </div>

      <div style={{ background: "rgba(255,255,255,.07)", borderRadius: 7, padding: "8px 10px", marginBottom: 8 }}>
        <div style={{ fontSize: 9, textTransform: "uppercase", letterSpacing: ".07em", opacity: 0.55, marginBottom: 4 }}>
          Landelijke cijfers volgens {STZ_BRON.naam}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 5 }}>
          {STZ_CIJFERS.map((c) => (
            <div key={c.label} style={{ background: "rgba(255,255,255,.07)", borderRadius: 5, padding: "5px 7px" }}>
              <div style={{ fontSize: 8.5, opacity: 0.6 }}>{c.label}</div>
              <strong style={{ fontSize: 10.5 }}>{c.waarde}</strong>
            </div>
          ))}
        </div>
        <div style={{ fontSize: 9, opacity: 0.6, marginTop: 4 }}>
          Bron: {STZ_BRON.naam},{" "}
          <a href="https://www.tekenbeetziekten.nl" target="_blank" rel="noopener noreferrer" style={{ color: "inherit", textDecoration: "underline", fontWeight: 700 }}>tekenbeetziekten.nl</a> — landelijke cijfers, geen provinciecijfers.
        </div>
      </div>
      <div style={{ background: "rgba(255,255,255,.07)", borderRadius: 7, padding: "8px 10px", marginBottom: 8 }}>
        <div style={{ fontSize: 9, textTransform: "uppercase", letterSpacing: ".07em", opacity: 0.55, marginBottom: 4 }}>
          Wat u moet weten volgens de {LV_BRON.naam}
        </div>
        {LV_PUNTEN.map((t) => (
          <div key={t} style={{ fontSize: 10.5, lineHeight: 1.55, opacity: 0.88 }}>• {t}</div>
        ))}
        <div style={{ fontSize: 9, opacity: 0.6, marginTop: 4 }}>
          Bron: {LV_BRON.naam} —{" "}
          <a href={LV_BRON.url} target="_blank" rel="noopener noreferrer" style={{ color: "inherit", textDecoration: "underline", fontWeight: 700 }}>{LV_BRON.label}</a>
        </div>
      </div>
      <div style={{ background: "rgba(255,255,255,.07)", borderRadius: 7, padding: "8px 10px", marginBottom: 8, fontSize: 11, lineHeight: 1.6, opacity: 0.9 }}>
        {z ? vertaalTekst(AANWEZIGHEID_ZIN, en) : RISK_UITLEG[p.risk]}
      </div>
      <div style={{ background: "rgba(255,255,255,.07)", borderRadius: 7, padding: "8px 10px", marginBottom: 8 }}>
        <div style={{ fontSize: 9, textTransform: "uppercase", letterSpacing: ".07em", opacity: 0.55, marginBottom: 3 }}>Situatie in deze provincie</div>
        <div style={{ fontSize: 11, lineHeight: 1.6, opacity: 0.88 }}>{p.samenvatting}</div>
      </div>
      {z && ziekteHistorie.length > 1 && (
        <div style={{ background: vlak, borderRadius: 7, padding: "8px 10px", marginBottom: 8 }}>
          <div style={{ fontSize: 9, textTransform: "uppercase", letterSpacing: ".07em", opacity: 0.55, marginBottom: 5 }}>
            {z.naam}: verloop per jaar in {p.naam}
          </div>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 46 }}>
            {ziekteHistorie.map((h) => {
              const max = Math.max(1, ...ziekteHistorie.map((x) => x.meldingen));
              return (
                <div key={h.jaar} style={{ flex: 1, textAlign: "center" }}>
                  <div style={{ fontSize: 9, opacity: 0.85, marginBottom: 2 }}>{h.meldingen}</div>
                  <div
                    style={{
                      height: Math.max(2, Math.round((h.meldingen / max) * 24)),
                      background: z.kleur,
                      opacity: 0.85,
                      borderRadius: 2,
                    }}
                  />
                  <div style={{ fontSize: 8, opacity: 0.6, marginTop: 2 }}>{String(h.jaar).slice(2)}</div>
                </div>
              );
            })}
          </div>
          <div style={{ fontSize: 8.5, opacity: 0.6, marginTop: 4 }}>
            {ziekteHistorie.some((h) => h.geschat)
              ? "Deels geschat uit de landelijke tekenbeetmeldingen en het aandeel besmette teken; automatisch bijgewerkt."
              : "Meldingen volgens RIVM; automatisch bijgewerkt."}
          </div>
        </div>
      )}
      {z && (
        <div style={{ background: "rgba(255,255,255,.07)", borderRadius: 7, padding: "9px 11px", marginBottom: 8, borderLeft: `3px solid ${z.kleur}` }}>
          <div style={{ fontSize: 9, textTransform: "uppercase", letterSpacing: ".06em", opacity: 0.6, marginBottom: 4 }}>Over {z.naam}</div>
          <div style={{ fontSize: 11, lineHeight: 1.6, opacity: 0.88, marginBottom: 5 }}>{z.tekst}</div>
          {z.pctNoot && <p className="mb-2 text-[10px] leading-relaxed">{z.pctNoot}</p>}
          <div style={{ fontSize: 9, opacity: 0.6, marginBottom: 2, textTransform: "uppercase", letterSpacing: ".05em" }}>Symptomen</div>
          <div style={{ fontSize: 10.5, opacity: 0.8 }}>{z.sympt}</div>
        </div>
      )}
      <div style={{ marginBottom: 8 }}>
        <div style={{ fontSize: 9, textTransform: "uppercase", letterSpacing: ".07em", opacity: 0.6, marginBottom: 4 }}>Ziekten in dit gebied</div>
        {p.ziekten.map((zid) => {
          const zz = ZIEKTEN.find((x) => x.id === zid);
          return zz ? (
            <div key={zid} style={{ display: "flex", alignItems: "flex-start", gap: 7, padding: "5px 0", borderBottom: "1px solid rgba(255,255,255,.08)", fontSize: 11 }}>
              <div style={{ width: 7, height: 7, borderRadius: "50%", background: zz.kleur, flexShrink: 0 }} />
              <span style={{ flex: 1 }}>{zz.naam}<span style={{ display: "block", fontSize: 9, opacity: 0.6 }}>{zz.sympt}</span></span>
              <span style={{ fontSize: 9, opacity: 0.6 }}>{zz.pct}</span>
            </div>
          ) : null;
        })}
      </div>
      <div style={{ background: "rgba(255,255,255,.07)", borderRadius: 7, padding: "8px 10px", marginBottom: 7 }}>
        <div style={{ fontSize: 9, textTransform: "uppercase", letterSpacing: ".07em", opacity: 0.55, marginBottom: 3 }}>Tekensoorten in deze provincie</div>
        {tekenVoorProvincie(p.id).map((t) => (
          <div key={t.id} style={{ fontSize: 10.5, lineHeight: 1.6, opacity: 0.88, marginBottom: 3 }}>
            • <strong>{t.naam}</strong> <em style={{ opacity: 0.7 }}>({t.latijn})</em> — {t.status}
          </div>
        ))}
      </div>
      {PROV_GROEN[p.id] && (() => { const g = PROV_GROEN[p.id]!; const lbl = (en ? ["", "Very little", "Little", "Average", "Much", "Very much"] : ["", "Zeer weinig", "Weinig", "Gemiddeld", "Veel", "Zeer veel"])[g.klasse]; const nf = (n: number) => n.toLocaleString(en ? "en-GB" : "nl-NL"); return (
        <div style={{ background: "rgba(255,255,255,.07)", borderRadius: 7, padding: "8px 10px", marginBottom: 7 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontWeight: 700, fontSize: "clamp(9.5px,1.7vw,11px)" }}>
            <span>{en ? "Green indication" : "Groen-indicatie"}:</span>
            <span style={{ fontSize: 10, fontWeight: 700, padding: "1px 7px", borderRadius: 99, background: ["", "#E3EEF3", "#C5E3C9", "#8CC79A", "#4E9E66", "#2D6B42"][g.klasse], color: g.klasse >= 4 ? "#fff" : "#123A52" }}>{lbl}</span>
          </div>
          <div style={{ fontSize: "clamp(9.5px,1.7vw,11px)", lineHeight: 1.5, opacity: 0.85, marginTop: 3 }}>{en
            ? `${nf(g.natuur)}% of the land in ${p.naam} is woods and nature (of which ${nf(g.bos)}% woods). More woods, dunes and heath usually means more ticks. This compares with all municipalities; it is not a measured tick density. Source: CBS land use ${GEMEENTE_CIJFERS_BRON.bodem}.`
            : `${nf(g.natuur)}% van het land in ${p.naam} is bos en natuur (waarvan ${nf(g.bos)}% bos). Meer bos, duin en heide betekent meestal meer teken. Dit is vergeleken met alle gemeenten; het is geen gemeten tekendichtheid. Bron: CBS bodemgebruik ${GEMEENTE_CIJFERS_BRON.bodem}.`}</div>
        </div>); })()}
      <div style={{ background: "rgba(255,255,255,.07)", borderRadius: 7, padding: "8px 10px", marginBottom: 7 }}>
        <div style={{ fontSize: 9, textTransform: "uppercase", letterSpacing: ".07em", opacity: 0.55, marginBottom: 3 }}>Habitat</div>
        <div style={{ fontSize: 11, lineHeight: 1.6, opacity: 0.85 }}>{p.habitat}</div>
      </div>
      {STEDELIJK_GEBIED[p.id] && (
        <div style={{ background: "rgba(255,255,255,.07)", borderRadius: 7, padding: "8px 10px", marginBottom: 7 }}>
          <div style={{ fontSize: 9, textTransform: "uppercase", letterSpacing: ".07em", opacity: 0.55, marginBottom: 3 }}>
            Stedelijk gebied &amp; openbaar groen
          </div>
          <div style={{ fontSize: 11, lineHeight: 1.6, opacity: 0.85 }}>{STEDELIJK_GEBIED[p.id]}</div>
          <div style={{ fontSize: 10, lineHeight: 1.6, opacity: 0.7, marginTop: 4 }}>
            Ook in parken, plantsoenen, recreatieterreinen, sportvelden, volkstuinen, campings en tuinen kunt u teken oplopen.
          </div>
        </div>
      )}

      <div style={{ background: "rgba(255,255,255,.07)", borderRadius: 7, padding: "8px 10px", marginBottom: 7 }}>
        <div style={{ fontSize: 9, textTransform: "uppercase", letterSpacing: ".07em", opacity: 0.55, marginBottom: 3 }}>Preventie</div>
        <div style={{ fontSize: 10.5, lineHeight: 1.6, opacity: 0.7, marginBottom: 5 }}>
          Algemene stappen die overal in Nederland gelden, het hele tekenseizoen door.
        </div>
        {PREVENTIE_ALGEMEEN.map((t) => (
          <div key={t} style={{ fontSize: 11, lineHeight: 1.7, opacity: 0.85, marginBottom: 2 }}>• {t}</div>
        ))}

      </div>

      <div style={{ background: STZ.terra, borderRadius: 7, padding: "8px 10px", fontSize: 11, lineHeight: 1.6 }}>
        <strong>Tip: </strong>{p.tip}
      </div>

      <div style={{ background: "rgba(255,255,255,.07)", borderRadius: 7, padding: "8px 10px", marginTop: 7 }}>
        <div style={{ fontSize: 9, textTransform: "uppercase", letterSpacing: ".07em", opacity: 0.55, marginBottom: 4 }}>Meer weten</div>
        {[
          { t: "Stichting Tekenbeetziekten", l: "www.tekenbeetziekten.nl", u: "https://www.tekenbeetziekten.nl" },
          { t: "Lymevereniging", l: "www.lymevereniging.nl", u: "https://www.lymevereniging.nl" },
        ].map((o) => (
          <div key={o.u} style={{ fontSize: 11, lineHeight: 1.7, opacity: 0.9, marginBottom: 2 }}>
            {o.t}{" "}
            <a href={o.u} target="_blank" rel="noopener noreferrer" style={{ color: "inherit", textDecoration: "underline", fontWeight: 700 }}>{o.l}</a>
          </div>
        ))}
        <div style={{ fontSize: 11, lineHeight: 1.7, opacity: 0.9, marginTop: 4 }}>
          Meldt uw tekenbeet op Tekenradar{" "}
          <a href="https://www.tekenradar.nl" target="_blank" rel="noopener noreferrer" style={{ color: "inherit", textDecoration: "underline", fontWeight: 700 }}>www.tekenradar.nl</a>
        </div>
      </div>


    </div>
  );
}

/**
 * Landelijke kerncijfers, live herberekend uit de provinciecijfers in de database
 * met de waarden uit tekenData.ts als terugval. Wordt gedeeld door het
 * Landelijk-paneel, de samenvatting op het overzicht, de vergelijkingstab en Help.
 */
function useLandelijkeCijfers() {
  const live = useLiveCijfers();
  const provRisk = (p: Provincie) => live.provincies[p.id]?.risk ?? p.risk;
  const provBeten = (p: Provincie) => live.provincies[p.id]?.tekenbeetAantal ?? TEKENBEET_AANTAL[p.id] ?? 0;
  // Landelijk risiconiveau: vastgesteld op Hoog (klasse 4). Dit is een beleidsafspraak
  // voor de nationale weergave; de onderliggende provinciecijfers blijven onveranderd.
  const gemRisk = 4;
  const totaalBeten = PROVINCIES.reduce((a, p) => a + provBeten(p), 0);
  const totaalMeldingen = Object.values(live.provincies).reduce((a, c) => a + (c.meldingen ?? 0), 0);
  const totaalTbe = Object.values(live.provincies).reduce((a, c) => a + (c.tbeGevallen ?? 0), 0);
  const totaalInwoners = Object.values(live.provincies).reduce((a, c) => a + (c.inwoners ?? 0), 0);
  const meldingenPer100k = totaalInwoners > 0 ? (totaalMeldingen / totaalInwoners) * 100000 : null;
  const hoogRisico = PROVINCIES.filter((p) => provRisk(p) >= 4).length;
  const tbeProvincies = PROVINCIES.filter((p) => p.tbeStatus !== "geen").length;
  const lymePct = PROVINCIES[0]?.lymePct ?? "~1 op 5 (RIVM)";
  return { live, provRisk, provBeten, gemRisk, totaalBeten, totaalMeldingen, totaalTbe, totaalInwoners, meldingenPer100k, hoogRisico, tbeProvincies, lymePct };
}

function LandelijkOverzicht({ actieveZiekte, onZiekteClick }: { actieveZiekte: string | null; onZiekteClick: (id: string | null) => void }) {

  const taal = useTaal();
  const en = taal === "en";
  // Landelijke cijfers worden live herberekend uit de database (provincie_cijfers),
  // met de waarden uit tekenData.ts als terugval zolang de database niet bereikbaar is.
  const live = useLiveCijfers();
  const provRisk = (p: Provincie) => live.provincies[p.id]?.risk ?? p.risk;
  const provBeten = (p: Provincie) => live.provincies[p.id]?.tekenbeetAantal ?? TEKENBEET_AANTAL[p.id] ?? 0;
  // Landelijke beleidscategorie: vaste contextweergave, los van de dynamische provincieklassen.
  const gemRisk = 4;
  const risicoKleur = RISK[gemRisk] ?? STZ.rood;
  const riskBar = [0, 20, 40, 60, 80, 100][gemRisk] ?? 0;
  const donkereTekst = gemRisk <= 2;
  const tekstKleur = donkereTekst ? "#123A52" : "#fff";
  const vlak = donkereTekst ? "rgba(255,255,255,.35)" : "rgba(255,255,255,.07)";
  const totaalBeten = PROVINCIES.reduce((a, p) => a + provBeten(p), 0);
  const totaalMeldingen = Object.values(live.provincies).reduce((a, c) => a + (c.meldingen ?? 0), 0);
  const totaalTbe = Object.values(live.provincies).reduce((a, c) => a + (c.tbeGevallen ?? 0), 0);
  const tekenNationale = [...new Set(Object.values(PROV_TEKEN).flat())]
    .map((id) => TEKENSOORTEN.find((t) => t.id === id))
    .filter(Boolean) as (typeof TEKENSOORTEN)[number][];
  const tbeCijfers = useTbeCijfersTekst();
  const lymePct = PROVINCIES[0]?.lymePct ?? "~1 op 5 (RIVM)";
  return (
    <>
      <div style={{ background: risicoKleur, color: tekstKleur, padding: "14px 13px", borderBottom: `3px solid ${STZ.terra}` }}>
        <div style={{ marginBottom: 6 }}>
          <h2 style={{ fontSize: "clamp(15px,3vw,19px)", fontWeight: 800, lineHeight: 1.1, margin: 0 }}>Nederland</h2>
          <div style={{ fontSize: "clamp(9px,1.5vw,10px)", opacity: 0.7, marginTop: 2, textTransform: "uppercase", letterSpacing: ".07em" }}>
            Landelijke contextindicatie: {RISK_LBL[gemRisk]} · vaste categorie · TBE-meldingen
          </div>
          <div style={{ fontSize: "clamp(9px,1.5vw,10px)", marginTop: 4, fontWeight: 700, lineHeight: 1.4 }}>
            {vertaalTekst(GEBIEDSINDICATIE_ZIN, en)}
          </div>
        </div>
        <div style={{ background: vlak, borderRadius: 7, padding: "6px 9px", marginBottom: 9 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "clamp(9.5px,1.7vw,11px)", fontWeight: 700 }}>
            <span style={{ flex: "0 0 auto", width: 11, height: 11, borderRadius: "50%", background: "#A63428", border: "1.5px solid #A63428" }} />
            <span>{TBE_STATUS_LBL.humaan}</span>
          </div>
          <div style={{ fontSize: "clamp(8.5px,1.5vw,9.5px)", lineHeight: 1.5, marginTop: 4, opacity: 0.75 }}>{TBE_HAARDEN_ZIN}</div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 7, marginBottom: 10 }}>
          <div style={{ background: "rgba(255,255,255,.09)", borderRadius: 7, padding: "9px 11px" }}>
            <div style={{ fontSize: 9, textTransform: "uppercase", letterSpacing: ".06em", opacity: 0.6, marginBottom: 3 }}>Teken met Borrelia</div>
            <div style={{ fontSize: "clamp(15px,3.4vw,20px)", fontWeight: 800, lineHeight: 1 }}>{lymePct}</div>
            <div style={{ fontSize: 9, opacity: 0.55, marginTop: 3 }}>landelijk cijfer (RIVM / STZ)</div>
          </div>
          <div style={{ background: "rgba(255,255,255,.09)", borderRadius: 7, padding: "9px 11px" }}>
            <div style={{ fontSize: 9, textTransform: "uppercase", letterSpacing: ".06em", opacity: 0.6, marginBottom: 3 }}>Landelijke contextindicatie</div>
            <div style={{ height: 4, background: "rgba(255,255,255,.09)", borderRadius: 99, marginBottom: 4 }}>
              <div style={{ height: "100%", width: riskBar + "%", background: "rgba(255,255,255,.8)", borderRadius: 99 }} />
            </div>
            <div style={{ fontSize: "clamp(11px,2vw,13px)", fontWeight: 700 }}>{RISK_LBL[gemRisk]}</div>
          </div>
        </div>
        <div style={{ background: "rgba(255,255,255,.09)", borderRadius: 7, padding: "9px 11px", marginBottom: 8 }}>
          <div style={{ fontSize: 9, textTransform: "uppercase", letterSpacing: ".06em", opacity: 0.6, marginBottom: 3 }}>Landelijke schatting tekenbeten per jaar</div>
          <div style={{ fontSize: "clamp(18px,4vw,24px)", fontWeight: 800, lineHeight: 1 }}>circa {nlGetal(totaalBeten)}</div>
          <div style={{ fontSize: 9, opacity: 0.6, marginTop: 3 }}>
            {vertaalTekst("Controlegetal: som van de twaalf bevolkingsverdeelde provincieschattingen; geen afzonderlijke meting.", en)}
          </div>
          <div style={{ fontSize: 9, opacity: 0.6, marginTop: 4, lineHeight: 1.5 }}>
            {TEKENBEET_TOELICHTING} Bron: {TEKENBEET_BRON.naam}.

          </div>
        </div>
        <div style={{ background: "rgba(255,255,255,.09)", borderRadius: 7, padding: "9px 11px", marginBottom: 8 }}>
          <div style={{ fontSize: 9, textTransform: "uppercase", letterSpacing: ".06em", opacity: 0.6, marginBottom: 3 }}>Tekenbeten in de eigen tuin</div>
          <div style={{ fontSize: "clamp(15px,3.4vw,20px)", fontWeight: 800, lineHeight: 1 }}>minder dan 30% tot meer dan 40%</div>
          <div style={{ fontSize: 9, opacity: 0.6, marginTop: 4, lineHeight: 1.5 }}>
            {TUINBEET_TOELICHTING} Bron: {TUINBEET_BRON.naam}.

          </div>
        </div>
        <div style={{ background: "rgba(255,255,255,.07)", borderRadius: 7, padding: "8px 10px", marginBottom: 8, fontSize: 9.5, lineHeight: 1.55, opacity: 0.85 }}>
          {RISICO_TOELICHTING}
        </div>
        <div style={{ background: "rgba(255,255,255,.07)", borderRadius: 7, padding: "8px 10px", marginBottom: 8 }}>
          <div style={{ fontSize: 9, textTransform: "uppercase", letterSpacing: ".07em", opacity: 0.55, marginBottom: 4 }}>
            TBE-meldingen per jaar (RIVM/LCI)
          </div>
          <TbeMeldingenGrafiek />
          <div style={{ fontSize: 10.5, lineHeight: 1.6, opacity: 0.88 }}>{tbeCijfers}</div>
          <div style={{ fontSize: 9, opacity: 0.6, marginTop: 4 }}>
            {vertaalTekst("Bronnen: RIVM/LCI, DWHC, Erasmus MC, LabMicTA en Artemis One Health.", en)}
          </div>
        </div>
        <div style={{ background: "rgba(255,255,255,.07)", borderRadius: 7, padding: "8px 10px", marginBottom: 8 }}>
          <div style={{ fontSize: 9, textTransform: "uppercase", letterSpacing: ".07em", opacity: 0.55, marginBottom: 4 }}>
            Meldingen op Tekenradar
          </div>
          <div style={{ fontSize: 10.5, lineHeight: 1.6, opacity: 0.88 }}>{TEKENRADAR_2025}</div>
          {totaalMeldingen > 0 && (
            <div style={{ fontSize: 10.5, lineHeight: 1.6, opacity: 0.88, marginTop: 4 }}>
              {vertaalTekst("Herberekend uit de provinciecijfers in de database:", en)}{" "}
              <strong>{nlGetal(totaalMeldingen)}</strong>{" "}
              {vertaalTekst("tekenbeetmeldingen in 2025", en)}
              {totaalTbe > 0 && <> — <strong>{totaalTbe}</strong> {vertaalTekst("TBE-gevallen", en)}</>}.
            </div>
          )}
        </div>
        <div style={{ background: "rgba(255,255,255,.07)", borderRadius: 7, padding: "8px 10px", marginBottom: 8 }}>
          <div style={{ fontSize: 9, textTransform: "uppercase", letterSpacing: ".07em", opacity: 0.55, marginBottom: 4 }}>
            Landelijke cijfers volgens {STZ_BRON.naam}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 5 }}>
            {STZ_CIJFERS.map((c) => (
              <div key={c.label} style={{ background: "rgba(255,255,255,.07)", borderRadius: 5, padding: "5px 7px" }}>
                <div style={{ fontSize: 8.5, opacity: 0.6 }}>{c.label}</div>
                <strong style={{ fontSize: 10.5 }}>{c.waarde}</strong>
              </div>
            ))}
          </div>
          <div style={{ fontSize: 9, opacity: 0.6, marginTop: 4 }}>
            Bron: {STZ_BRON.naam},{" "}
            <a href="https://www.tekenbeetziekten.nl" target="_blank" rel="noopener noreferrer" style={{ color: "inherit", textDecoration: "underline", fontWeight: 700 }}>tekenbeetziekten.nl</a> — landelijke cijfers.
          </div>
        </div>
        <div style={{ background: "rgba(255,255,255,.07)", borderRadius: 7, padding: "8px 10px", marginBottom: 8 }}>
          <div style={{ fontSize: 9, textTransform: "uppercase", letterSpacing: ".07em", opacity: 0.55, marginBottom: 4 }}>
            Wat u moet weten volgens de {LV_BRON.naam}
          </div>
          {LV_PUNTEN.map((t) => (
            <div key={t} style={{ fontSize: 10.5, lineHeight: 1.55, opacity: 0.88 }}>• {t}</div>
          ))}
          <div style={{ fontSize: 9, opacity: 0.6, marginTop: 4 }}>
            Bron: {LV_BRON.naam} —{" "}
            <a href={LV_BRON.url} target="_blank" rel="noopener noreferrer" style={{ color: "inherit", textDecoration: "underline", fontWeight: 700 }}>{LV_BRON.label}</a>
          </div>
        </div>
        <div style={{ background: "rgba(255,255,255,.07)", borderRadius: 7, padding: "8px 10px", marginBottom: 8, fontSize: 11, lineHeight: 1.6, opacity: 0.9 }}>
          {RISK_UITLEG[gemRisk]}
        </div>
        <div style={{ background: "rgba(255,255,255,.07)", borderRadius: 7, padding: "8px 10px", marginBottom: 8 }}>
          <div style={{ fontSize: 9, textTransform: "uppercase", letterSpacing: ".07em", opacity: 0.55, marginBottom: 3 }}>Situatie in Nederland</div>
          <div style={{ fontSize: 11, lineHeight: 1.6, opacity: 0.88 }}>{TBE_LANDELIJK}</div>
        </div>
        <div style={{ marginBottom: 8 }}>
          <div style={{ background: STZ.rood, color: "#fff", borderRadius: 8, padding: "10px 12px", marginBottom: 10, display: "flex", gap: 12, alignItems: "center" }}>
            <div style={{ fontSize: 26, fontWeight: 800, lineHeight: 1, flexShrink: 0 }}>{LANDELIJK_ZIEKTEN_UITLEG.aantal}</div>
            <div>
              <h2 style={{ fontSize: 12, fontWeight: 700, lineHeight: 1.2, margin: 0 }}>
                {en ? "11 Conditions associated with ticks" : "11 Aandoeningen in verband met teken"}
              </h2>
              <div style={{ fontSize: 9, opacity: 0.75, marginTop: 1 }}>
                {LANDELIJK_ZIEKTEN_UITLEG.subtitel[en ? "en" : "nl"]}
              </div>
            </div>
          </div>
          <div style={{ background: "rgba(255,255,255,.07)", borderRadius: 7, padding: "8px 10px", marginBottom: 10, fontSize: 11, lineHeight: 1.6, opacity: 0.88 }}>
            <strong>{LANDELIJK_ZIEKTEN_UITLEG.vraag[en ? "en" : "nl"]}</strong>
            <br />
            {LANDELIJK_ZIEKTEN_UITLEG.tekst[en ? "en" : "nl"]}
          </div>
          {ZIEKTEN.map((zz) => {
            const io = actieveZiekte === zz.id;
            return (
              <div
                key={zz.id}
                onClick={() => onZiekteClick(io ? null : zz.id)}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 7,
                  padding: "6px 8px",
                  borderRadius: 6,
                  border: `1px solid ${io ? zz.kleur + "55" : "rgba(255,255,255,.08)"}`,
                  borderLeft: `4px solid ${zz.kleur}`,
                  background: io ? zz.kleur + "22" : "rgba(255,255,255,.07)",
                  fontSize: 11,
                  cursor: "pointer",
                  marginBottom: 4,
                }}
              >
                <div style={{ width: 7, height: 7, borderRadius: "50%", background: zz.kleur, flexShrink: 0, marginTop: 3 }} />
                <span style={{ flex: 1 }}>
                  <span style={{ fontWeight: 700, color: zz.kleur }}>{zz.naam}</span>
                  <span style={{ display: "block", fontSize: 9, color: "#fff", opacity: 0.85 }}>{zz.sympt}</span>
                </span>
                <span style={{ fontSize: 9, color: "#fff", opacity: 0.9 }}>{zz.pct}</span>
              </div>
            );
          })}
        </div>
        <div style={{ background: "rgba(255,255,255,.07)", borderRadius: 7, padding: "8px 10px", marginBottom: 7 }}>
          <div style={{ fontSize: 9, textTransform: "uppercase", letterSpacing: ".07em", opacity: 0.55, marginBottom: 3 }}>Tekensoorten in Nederland</div>
          {tekenNationale.map((t) => (
            <div key={t.id} style={{ fontSize: 10.5, lineHeight: 1.6, opacity: 0.88, marginBottom: 3 }}>
              • <strong>{t.naam}</strong> <em style={{ opacity: 0.7 }}>({t.latijn})</em> — {t.status}
            </div>
          ))}
        </div>
        <div style={{ background: "rgba(255,255,255,.07)", borderRadius: 7, padding: "8px 10px", marginBottom: 7 }}>
          <div style={{ fontSize: 9, textTransform: "uppercase", letterSpacing: ".07em", opacity: 0.55, marginBottom: 3 }}>Habitat</div>
          <div style={{ fontSize: 11, lineHeight: 1.6, opacity: 0.85 }}>
            Teken komen in heel Nederland voor: in bossen, op de heide en in duingebieden, maar ook in stadsparken, plantsoenen, volkstuinen en gewone tuinen. Waar herten, reeën, vogels of kleine knaagdieren leven, kunnen teken zitten.
          </div>
        </div>
        <div style={{ background: "rgba(255,255,255,.07)", borderRadius: 7, padding: "8px 10px", marginBottom: 7 }}>
          <div style={{ fontSize: 9, textTransform: "uppercase", letterSpacing: ".07em", opacity: 0.55, marginBottom: 3 }}>Preventie</div>
          <div style={{ fontSize: 10.5, lineHeight: 1.6, opacity: 0.7, marginBottom: 5 }}>
            Algemene stappen die overal in Nederland gelden, het hele tekenseizoen door.
          </div>
          {PREVENTIE_ALGEMEEN.map((t) => (
            <div key={t} style={{ fontSize: 11, lineHeight: 1.7, opacity: 0.85, marginBottom: 2 }}>• {t}</div>
          ))}
        </div>
        <div style={{ background: STZ.terra, borderRadius: 7, padding: "8px 10px", fontSize: 11, lineHeight: 1.6 }}>
          <strong>Tip: </strong>In heel Nederland geldt: verwijder een teek zo snel mogelijk en doe na een bezoek aan het groen altijd een grondige tekencheck.
        </div>
        <div style={{ background: "rgba(255,255,255,.07)", borderRadius: 7, padding: "8px 10px", marginTop: 7 }}>
          <div style={{ fontSize: 9, textTransform: "uppercase", letterSpacing: ".07em", opacity: 0.55, marginBottom: 4 }}>Meer weten</div>
          {[
            { t: "Stichting Tekenbeetziekten", l: "www.tekenbeetziekten.nl", u: "https://www.tekenbeetziekten.nl" },
            { t: "Lymevereniging", l: "www.lymevereniging.nl", u: "https://www.lymevereniging.nl" },
          ].map((o) => (
            <div key={o.u} style={{ fontSize: 11, lineHeight: 1.7, opacity: 0.9, marginBottom: 2 }}>
              {o.t}{" "}
              <a href={o.u} target="_blank" rel="noopener noreferrer" style={{ color: "inherit", textDecoration: "underline", fontWeight: 700 }}>{o.l}</a>
            </div>
          ))}
          <div style={{ fontSize: 11, lineHeight: 1.7, opacity: 0.9, marginTop: 4 }}>
            Meldt uw tekenbeet op Tekenradar{" "}
            <a href="https://www.tekenradar.nl" target="_blank" rel="noopener noreferrer" style={{ color: "inherit", textDecoration: "underline", fontWeight: 700 }}>www.tekenradar.nl</a>
          </div>
        </div>
      </div>
    </>
  );
}

/** Vergelijking: onze landelijke cijfers naast de RIVM-richtlijnen en onze eigen risiconiveau-afspraken. */
function LandelijkVergelijking() {
  const taal = useTaal();
  const en = taal === "en";
  const c = useLandelijkeCijfers();
  const T = (nl: string) => vertaalTekst(nl, en);
  const rijen: { onderwerp: string; onze: string; rivm: string; noot: string }[] = [
    {
      onderwerp: T("Tekenbeten per jaar"),
      onze: `circa ${nlGetal(c.totaalBeten)}`,
      rivm: T("circa 1,5 miljoen tekenbeten per jaar (RIVM-schatting)"),
      noot: T("Onze waarde is de som van de twaalf provinciecijfers en blijft binnen de RIVM-schatting."),
    },
    {
      onderwerp: T("Meldingen op Tekenradar"),
      onze: c.totaalMeldingen > 0 ? nlGetal(c.totaalMeldingen) : "—",
      rivm: T("Tekenradar (RIVM en WUR) telt publieksmeldingen, geen volledige registratie."),
      noot: T("Meldingen zijn een deel van het werkelijke aantal tekenbeten; niet elke beet wordt gemeld."),
    },
    {
      onderwerp: T("Meldingen per 100.000 inwoners"),
      onze: c.meldingenPer100k != null ? c.meldingenPer100k.toFixed(1) : "—",
      rivm: T("RIVM rekent meldingen om naar inwonertal (CBS) om provincies vergelijkbaar te maken."),
      noot: T("Wij gebruiken dezelfde omrekening als basis voor de risicoklassen op de kaart."),
    },
    {
      onderwerp: T("TBE-gevallen"),
      onze: c.totaalTbe > 0 ? String(c.totaalTbe) : "—",
      rivm: T("TBE is meldingsplichtig (LCI-richtlijn); het RIVM publiceert de bevestigde meldingen."),
      noot: T("TBE-markeringen volgen gepubliceerde lokale aanwijzingen. Meldingen naar woonprovincie wegen niet mee in de provincieklasse en bewijzen geen lokale blootstelling."),
    },
    {
      onderwerp: T("Teken met Borrelia"),
      onze: c.lymePct,
      rivm: T(ZIEKTEN.find((z) => z.id === "lyme")?.pctNoot ?? ""),
      noot: T("29,3% is het door Stichting Tekenbeetziekten aangehaalde onderzoeksgemiddelde, geen lokaal maximum."),
    },
    {
      onderwerp: T("Landelijk risiconiveau"),
      onze: RISK_LBL[c.gemRisk] ?? "—",
      rivm: T("Het RIVM kent geen landelijk risiconiveau in klassen; dit is onze eigen indeling."),
      noot: T("Vaste landelijke contextcategorie, geen berekend gemiddelde of persoonlijke infectiekans."),
    },
  ];
  const kaart = { background: "#fff", border: `1px solid ${STZ.lijn}`, borderRadius: 8, padding: "9px 11px", marginBottom: 9 };
  return (
    <div style={{ padding: 12 }}>
      <p style={{ fontSize: 10.5, lineHeight: 1.6, color: STZ.tekst, margin: "0 0 10px" }}>
        {T("Hieronder staan de landelijke cijfers van deze kaart naast de uitgangspunten van het RIVM en de LCI-richtlijnen, met daarbij de afspraken die wij zelf gebruiken voor de risiconiveaus.")}
      </p>
      {rijen.map((r) => (
        <div key={r.onderwerp} style={kaart}>
          <div style={{ fontSize: 10, fontWeight: 800, color: STZ.rood, textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 5 }}>{r.onderwerp}</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginBottom: 5 }}>
            <div style={{ background: STZ.creme, borderRadius: 6, padding: "6px 8px" }}>
              <div style={{ fontSize: 8.5, opacity: 0.7, marginBottom: 2 }}>{T("Onze kaart")}</div>
              <strong style={{ fontSize: 12, color: STZ.tekst }}>{r.onze}</strong>
            </div>
            <div style={{ background: STZ.creme, borderRadius: 6, padding: "6px 8px" }}>
              <div style={{ fontSize: 8.5, opacity: 0.7, marginBottom: 2 }}>{T("RIVM / LCI")}</div>
              <span style={{ fontSize: 9.5, lineHeight: 1.5, color: STZ.tekst }}>{r.rivm}</span>
            </div>
          </div>
          <div style={{ fontSize: 9.5, lineHeight: 1.5, color: STZ.tekst, opacity: 0.8 }}>{r.noot}</div>
        </div>
      ))}
      <div style={{ ...kaart, background: STZ.creme }}>
        <div style={{ fontSize: 10, fontWeight: 800, color: STZ.rood, textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 5 }}>
          {T("Onze risiconiveau-afspraken")}
        </div>
        {[1, 2, 3, 4, 5].map((r) => (
          <div key={r} style={{ display: "flex", gap: 6, alignItems: "flex-start", marginBottom: 4 }}>
            <span style={{ flexShrink: 0, fontSize: 8, fontWeight: 800, color: r <= 2 ? "#123A52" : "#fff", background: RISK[r], borderRadius: 4, padding: "2px 5px", minWidth: 52, textAlign: "center" }}>{RISK_LBL[r]}</span>
            <span style={{ fontSize: 9.5, lineHeight: 1.5, color: STZ.tekst }}>{RISK_UITLEG[r]}</span>
          </div>
        ))}
        <KlasseUitleg />
        {c.live.grensLabels.length > 0 && (
          <div style={{ fontSize: 9.5, lineHeight: 1.5, color: STZ.tekst, opacity: 0.8, marginTop: 6 }}>
            {T("Automatisch berekende klassegrenzen (gewogen score):")} {c.live.grensLabels.join(" · ")}
          </div>
        )}
        <div style={{ fontSize: 9.5, lineHeight: 1.5, color: STZ.tekst, opacity: 0.8, marginTop: 6 }}>
          {T("De risicoklassen zijn een indicatie op basis van meldingen en gepubliceerd onderzoek, geen meting en geen medisch advies. Ook bij een laag risico kunt u een tekenbeet oplopen.")}
        </div>
      </div>
    </div>
  );
}

function LandelijkPanel({ actieveZiekte, onZiekteClick }: { actieveZiekte: string | null; onZiekteClick: (id: string | null) => void }) {
  const taal = useTaal();
  const en = taal === "en";
  const [sub, setSub] = useState<"overzicht" | "vergelijking">("overzicht");
  const knop = (actief: boolean) => ({
    flex: 1,
    padding: "7px 8px",
    fontSize: 10.5,
    fontFamily: "inherit",
    fontWeight: 800 as const,
    color: actief ? "#fff" : STZ.tekst,
    background: actief ? STZ.rood : "#fff",
    border: `1px solid ${actief ? STZ.rood : STZ.lijn}`,
    borderRadius: 999,
    cursor: "pointer",
  });
  return (
    <>
      <div style={{ background: "#FCE8E8", color: "#A63428", border: "1px solid #A63428", borderLeft: "4px solid #A63428", borderRadius: 8, padding: "10px 12px", margin: "0 12px 10px" }}>
        <div style={{ fontSize: 12, fontWeight: 800, lineHeight: 1.4, marginBottom: 8 }}>
          {vertaalTekst("Let op: in heel Nederland loopt u het risico op een tekenbeet!", en)}
        </div>
        <ul style={{ margin: 0, paddingLeft: 16, fontSize: 11, lineHeight: 1.5 }}>
          <li>{vertaalTekst("Blijf altijd alert en controleer uzelf altijd op teken.", en)}</li>
          <li>{vertaalTekst("Na een bezoek in het groen altijd een tekencheck doen.", en)}</li>
        </ul>
        <div style={{ marginTop: 8, fontSize: 10.5, lineHeight: 1.5 }}>
          {vertaalTekst("Uitleg over hoe u een tekencheck doet vindt u bij", en)}{" "}
          <a href="https://www.tekenbeetziekten.nl" target="_blank" rel="noopener noreferrer" style={{ color: "#A63428", textDecoration: "underline", fontWeight: 700 }}>
            {vertaalTekst("Stichting Tekenbeetziekten", en)}
          </a>
          {en ? " and " : " en "}
          <a href="https://www.lymevereniging.nl" target="_blank" rel="noopener noreferrer" style={{ color: "#A63428", textDecoration: "underline", fontWeight: 700 }}>
            {vertaalTekst("Lymevereniging", en)}
          </a>.
        </div>
      </div>
      <div style={{ display: "flex", gap: 6, margin: "0 12px 10px" }}>
        <button type="button" onClick={() => setSub("overzicht")} style={knop(sub === "overzicht")}>
          {vertaalTekst("Landelijk overzicht", en)}
        </button>
        <button type="button" onClick={() => setSub("vergelijking")} style={knop(sub === "vergelijking")}>
          {vertaalTekst("Vergelijking met RIVM", en)}
        </button>
      </div>
      {sub === "overzicht"
        ? <LandelijkOverzicht actieveZiekte={actieveZiekte} onZiekteClick={onZiekteClick} />
        : <LandelijkVergelijking />}
    </>
  );
}




function TBEPopup({ m, onClose }: { m: (typeof TBE_MELDINGEN)[number]; onClose: () => void }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.55)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }} onClick={onClose}>
      <div style={{ background: "#fff", borderRadius: 12, maxWidth: 380, width: "100%", boxShadow: "0 20px 60px rgba(0,0,0,.3)", overflow: "hidden" }} onClick={(e) => e.stopPropagation()}>
        <div style={{ background: "#A63428", padding: "13px 15px", display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,.7)", textTransform: "uppercase", letterSpacing: ".07em", marginBottom: 2 }}>{TBE_SOORT_LBL[m.soort]}</div>
            <div style={{ fontSize: 17, fontWeight: 800, color: "#fff", lineHeight: 1.2 }}>{m.naam}</div>
          </div>
          <button onClick={onClose} aria-label="Sluiten" style={{ background: "rgba(255,255,255,.2)", border: "none", color: "#fff", borderRadius: 6, padding: "4px 9px", cursor: "pointer", fontSize: 13, fontFamily: "inherit" }}>✕</button>
        </div>
        <div style={{ padding: "13px 15px" }}>
          <div style={{ fontSize: 13, color: STZ.tekst, lineHeight: 1.65, marginBottom: 6 }}>{m.info}</div>
          <div style={{ fontSize: 11, color: "#3E6A7D", lineHeight: 1.55, marginBottom: 10 }}>{TBE_BRONNEN_ZIN}</div>
          <div style={{ background: "rgba(166,52,40,.08)", borderRadius: 7, padding: "9px 11px", borderLeft: "3px solid #A63428", marginBottom: 10 }}>
            <div style={{ fontSize: 9, textTransform: "uppercase", letterSpacing: ".07em", color: STZ.tekst, fontWeight: 700, marginBottom: 3 }}>Advies Stichting Tekenbeetziekten</div>
            <div style={{ fontSize: 12, color: STZ.tekst, lineHeight: 1.6 }}>{m.advies}</div>
          </div>
          <div style={{ background: STZ.rood, color: "#fff", borderRadius: 7, padding: "9px 11px", fontSize: 12, lineHeight: 1.5 }}>
            TBE-vaccin beschikbaar via huisarts of GGD. Meldingsplichtig per 1 mrt 2025.
          </div>
          <div style={{ fontSize: 10.5, color: "#3E6A7D", lineHeight: 1.55, marginTop: 9 }}>{TBE_LANDELIJK}</div>
        </div>
      </div>
    </div>
  );
}

function MaandPopup({ m, idx, onClose }: { m: (typeof MAANDEN)[number]; idx: number; onClose: () => void }) {
  const niveaus = ["Inactief", "Laag", "Matig", "Hoog", "Piekseizoen"];
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.55)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }} onClick={onClose}>
      <div style={{ background: "#fff", borderRadius: 12, maxWidth: 340, width: "100%", boxShadow: "0 20px 60px rgba(0,0,0,.3)", overflow: "hidden" }} onClick={(e) => e.stopPropagation()}>
        <div style={{ background: MAAND_COL[m.v] ?? "#ccc", padding: "13px 15px", display: "flex", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,.75)", textTransform: "uppercase", letterSpacing: ".07em", marginBottom: 2 }}>Tekenactiviteit</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: "#fff" }}>{MAAND_NAMEN[idx]}</div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,.85)", marginTop: 1 }}>{niveaus[m.v]}</div>
          </div>
          <button onClick={onClose} aria-label="Sluiten" style={{ background: "rgba(255,255,255,.2)", border: "none", color: "#fff", borderRadius: 6, padding: "4px 9px", cursor: "pointer", fontSize: 13, fontFamily: "inherit" }}>✕</button>
        </div>
        <div style={{ padding: "13px 15px" }}>
          <div style={{ fontSize: 13, color: STZ.tekst, lineHeight: 1.65, marginBottom: 10 }}>{m.info}</div>
          {idx === curMnd && (
            <div style={{ background: STZ.rood, color: "#fff", borderRadius: 7, padding: "9px 11px", fontSize: 12, lineHeight: 1.5, marginBottom: 8 }}>
              <strong>Huidige maand.</strong> Tekenrisico is nu {(niveaus[m.v] ?? "").toLowerCase()}.
            </div>
          )}
          <div style={{ background: STZ.creme, borderRadius: 7, padding: "9px 11px", borderLeft: `3px solid ${STZ.terra}`, fontSize: 12, color: STZ.tekst, lineHeight: 1.55 }}>
            {m.v >= 3 ? "Extra waakzaam. Dagelijks controleren na buitenactiviteiten." : m.v >= 2 ? "Controleer na buitenzijn op teken, zeker in hoog gras en bos." : "Risico is beperkt, maar bij warm weer altijd alert."}
          </div>
        </div>
      </div>
    </div>
  );
}

function MeldStippen({ meld, groot = 13 }: { meld: TekenMelding[]; groot?: number }) {
  const soorten = [...new Set(meld.map((m) => m.soort))];
  return (
    <>
      {soorten.map((s) => (
        <span key={s} aria-hidden="true" title={s === "dermacentor" ? "Vlekkenteek (Dermacentor reticulatus)" : "Reuzenteek (Hyalomma marginatum)"}
          style={{ width: groot, height: groot, borderRadius: "50%", flexShrink: 0, boxSizing: "border-box", display: "inline-flex", alignItems: "center", justifyContent: "center", background: s === "dermacentor" ? "var(--tick-dermacentor)" : "var(--tick-hyalomma)", color: "#fff", fontSize: Math.max(7, Math.round(groot * 0.62)), fontWeight: 800, lineHeight: 1 }}>
          {s === "dermacentor" ? "D" : "H"}
        </span>
      ))}
    </>
  );
}

function ProvinciePopup({ p, onClose, onMeer }: { p: Provincie; onClose: () => void; onMeer: () => void }) {
  const en = useTaal() === "en";
  const meld = meldingenVoorProvincie(p.id);
  const kleur = RISK[p.risk] ?? STZ.rood;
  const licht = p.risk <= 2;
  const tk = licht ? "#123A52" : "#fff";
  const rij: React.CSSProperties = { background: STZ.creme, borderRadius: 7, padding: "8px 10px", marginBottom: 7 };
  const lbl: React.CSSProperties = { fontSize: 9, textTransform: "uppercase", letterSpacing: ".06em", color: "#3E6A7D", marginBottom: 2 };
  const waarde: React.CSSProperties = { fontSize: 17, fontWeight: 800, color: STZ.tekst, lineHeight: 1.1 };
  const bron: React.CSSProperties = { fontSize: 9, color: "#3E6A7D", lineHeight: 1.5, marginTop: 3 };
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.55)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }} onClick={onClose}>
      <div style={{ background: "#fff", borderRadius: 12, maxWidth: 360, width: "100%", maxHeight: "86vh", overflowY: "auto", boxShadow: "0 20px 60px rgba(0,0,0,.3)" }} onClick={(e) => e.stopPropagation()}>
        <div style={{ background: kleur, color: tk, padding: "13px 15px", display: "flex", alignItems: "flex-start", justifyContent: "space-between", position: "sticky", top: 0 }}>
          <div>
            <div style={{ fontSize: 10, opacity: 0.75, textTransform: "uppercase", letterSpacing: ".07em", marginBottom: 2 }}>Provincie</div>
            <div style={{ fontSize: 18, fontWeight: 800, lineHeight: 1.15 }}>{p.naam}</div>
            <div style={{ fontSize: 11, opacity: 0.85, marginTop: 2 }}>Tekenrisico-indicatie: {RISK_LBL[p.risk]}</div>
          </div>
          <button onClick={onClose} aria-label="Sluiten" style={{ background: licht ? "rgba(255,255,255,.5)" : "rgba(255,255,255,.2)", border: "none", color: tk, borderRadius: 6, padding: "4px 9px", cursor: "pointer", fontSize: 13, fontFamily: "inherit" }}>✕</button>
        </div>
        <div style={{ padding: "13px 15px" }}>
          <div style={rij}>
            <div style={lbl}>Tekenbeten in {p.naam} (per jaar)</div>
            <div style={waarde}>circa {nlGetal(TEKENBEET_AANTAL[p.id] ?? 0)}</div>
            <div style={bron}>
              {TEKENBEET_TOELICHTING} Bron: {TEKENBEET_BRON.naam}.

            </div>
          </div>
          <div style={rij}>
            <div style={lbl}>Tekenbeten in de eigen tuin</div>
            <div style={waarde}>{TUINBEET_PCT[p.id] ?? "onbekend"}</div>
            <div style={bron}>
              {TUINBEET_TOELICHTING} Bron: {TUINBEET_BRON.naam}.

            </div>
          </div>
          <div style={rij}>
            <div style={lbl}>{en ? "Tick reports in " : "Tekenmeldingen in "}{p.naam}</div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap", fontSize: 11, fontWeight: 600, color: STZ.tekst }}>
              {meld.length
                ? <><MeldStippen meld={meld} groot={15} />{[...new Set(meld.map((m) => m.soort))].map((s) => s === "dermacentor" ? (en ? "Ornate dog tick" : "Vlekkenteek") : (en ? "Giant tick" : "Reuzenteek")).join(", ")}</>
                : (en ? "none known" : "geen bekend")}
            </div>
            <div style={bron}>{en ? "Confirmed historical findings (NVWA/RIVM and scientific research), approximate locations; also shown as a D or H icon in the province list." : "Bevestigde historische vondsten (NVWA/RIVM en wetenschappelijk onderzoek), locaties bij benadering; ook zichtbaar als icoon met D of H in de provincielijst."}</div>
          </div>
          <button type="button" onClick={onMeer}
            style={{ width: "100%", marginTop: 4, background: STZ.header, color: STZ.tekst, border: "none", borderRadius: 8, padding: "11px 12px", fontSize: 13, fontWeight: 800, fontFamily: "inherit", cursor: "pointer" }}>
            Meer informatie over {p.naam} →
          </button>
        </div>
      </div>
    </div>
  );
}


function natRisico(z: (typeof ZIEKTEN)[number]) {
  return ziekteKaartKlasse(z);
}
function besmettingsgraad(pct: string) {
  const n = parseFloat(pct.replace(/^[^0-9]*/, "").replace(",", "."));
  if (isNaN(n)) return "Niet van toepassing";
  if (n >= 20) return "Zeer hoog";
  if (n >= 10) return "Hoog";
  if (n >= 3) return "Matig";
  if (n >= 1) return "Laag";
  return "Zeer laag";
}

function ZiekteKnoppen({ actief, setActief }: { actief: string | null; setActief: (v: string | null) => void }) {
  return (
    <div style={{ padding: "10px 10px 14px" }}>
      <h2 style={{ fontSize: 9, textTransform: "uppercase", letterSpacing: ".08em", color: STZ.terra, fontWeight: 700, margin: "0 0 8px" }}>
        Selecteer tekenbeetziekte — zie risico op kaart
      </h2>
      {ZIEKTEN.map((z) => {
        const io = actief === z.id;
        return (
          <div key={z.id} style={{ background: io ? z.kleur + "12" : "#fff", borderRadius: 7, marginBottom: 6, border: `1px solid ${io ? z.kleur + "55" : STZ.lijn}`, borderLeft: `4px solid ${z.kleur}`, overflow: "hidden" }}>
            <div onClick={() => setActief(io ? null : z.id)} style={{ display: "flex", alignItems: "center", gap: 7, padding: "8px 10px", cursor: "pointer", background: io ? z.kleur + "1F" : "#fff" }}>
              <div style={{ width: 20, height: 20, borderRadius: "50%", background: z.kleur, flexShrink: 0 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: io ? z.kleur : STZ.tekst, lineHeight: 1.2 }}>{z.naam}</div>
                <div style={{ fontSize: 8.5, color: "#123A52", marginTop: 1, display: "flex", alignItems: "center", gap: 5, flexWrap: "wrap" }}>
                  <span>{z.type} · {z.id === "alfagal" ? "geen verwekker in teek" : `Aantoning in teken: ${z.pct}`}</span>
                  {z.zoonose && <span style={{ fontSize: 7.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".05em", background: z.kleur, color: "#fff", borderRadius: 4, padding: "1px 5px" }}>Zoönose</span>}
                </div>
              </div>
              <span style={{ fontSize: 12, color: io ? z.kleur : STZ.terra }}>{io ? "▲" : "▼"}</span>
            </div>
            {io && (
              <div style={{ padding: "0 10px 10px", borderTop: `1px solid ${z.kleur}33` }}>
                {z.id === "cchf" && (
                  <div style={{ background: "#fff", border: `1px solid ${z.kleur}55`, borderRadius: 6, padding: "7px 9px", margin: "8px 0", fontSize: 9.5, color: STZ.tekst, lineHeight: 1.6 }}>
                    <strong style={{ color: z.kleur }}>Let op:</strong> CCHF komt in Nederland (nog) niet voor — het virus is hier nooit bij mens of teek vastgesteld. Het risico per provincie is daarom overal Geen. In Europa is de ziekte wél in opmars (o.a. Spanje, Balkan, Griekenland, Turkije, Bulgarije); door klimaatverandering en trekvogels die Hyalomma-reuzenteken meebrengen schuift het verspreidingsgebied noordwaarts (bron: ECDC).
                  </div>
                )}
                <div style={{ display: "flex", flexDirection: "column", gap: 6, margin: "8px 0" }}>
                  {([["Provinciale onderbouwing", ziekteKaartLabel(z)],
                     ["Verwekker in Nederlandse teken", z.id === "alfagal" ? "Geen verwekker — allergie na een beet" : z.pct],
                     ["Besmettingsgraad", z.id === "alfagal" ? "Niet van toepassing" : z.id === "tbe" ? `${besmettingsgraad(z.pct)} (lokale schatting)` : besmettingsgraad(z.pct)]] as const).map(([l, v]) => (
                    <div key={l} style={{ background: z.kleur + "0F", border: `1px solid ${z.kleur}40`, borderRadius: 6, padding: "7px 9px", width: "100%", boxSizing: "border-box" }}>
                      <div style={{ fontSize: 8.5, textTransform: "uppercase", letterSpacing: ".06em", color: z.kleur, fontWeight: 700, marginBottom: 2 }}>{l}</div>
                      <div style={{ fontSize: 10, color: STZ.tekst, lineHeight: 1.6 }}>{v}</div>
                    </div>
                  ))}
                </div>
                <div style={{ background: "#fff", border: `1px dashed ${z.kleur}55`, borderRadius: 6, padding: "6px 8px", marginBottom: 8, fontSize: 9, color: "#123A52", lineHeight: 1.55 }}>
                  {ZIEKTESCHAAL_UITLEG}
                </div>
                {z.pctNoot && <p className="mb-2 text-[10px] leading-relaxed text-foreground">{z.pctNoot}</p>}
                <div style={{ background: "#fff", border: `1px solid ${z.kleur}40`, borderRadius: 6, padding: "6px 8px", marginBottom: 8 }}>
                  <div style={{ fontSize: 8.5, textTransform: "uppercase", letterSpacing: ".06em", color: z.kleur, fontWeight: 700, marginBottom: 3 }}>
                    Cijfers {STZ_BRON.naam}
                  </div>
                  {STZ_VERWEKKERS[z.id] && (
                    <div style={{ fontSize: 9.5, color: STZ.tekst, lineHeight: 1.5 }}>
                      • Besmette teken met deze verwekker: <strong>{STZ_VERWEKKERS[z.id]}</strong>
                    </div>
                  )}
                  {(z.id === "lyme" ? STZ_CIJFERS : []).map((c) => (
                    <div key={c.label} style={{ fontSize: 9.5, color: STZ.tekst, lineHeight: 1.5 }}>
                      • {c.label}: <strong>{c.waarde}</strong>
                    </div>
                  ))}
                  <div style={{ fontSize: 8.5, color: "#123A52", marginTop: 3 }}>
                    Bron: {STZ_BRON.naam},{" "}
                    <a href="https://www.tekenbeetziekten.nl" target="_blank" rel="noopener noreferrer" style={{ color: STZ.rood, fontWeight: 700 }}>tekenbeetziekten.nl</a> — landelijke cijfers.
                  </div>
                </div>
                {z.id === "lyme" && (
                  <div style={{ background: "#fff", border: `1px solid ${z.kleur}40`, borderRadius: 6, padding: "6px 8px", marginBottom: 8 }}>
                    <div style={{ fontSize: 8.5, textTransform: "uppercase", letterSpacing: ".06em", color: z.kleur, fontWeight: 700, marginBottom: 3 }}>
                      Informatie {LV_BRON.naam}
                    </div>
                    {LV_PUNTEN.map((t) => (
                      <div key={t} style={{ fontSize: 9.5, color: STZ.tekst, lineHeight: 1.5 }}>• {t}</div>
                    ))}
                    <div style={{ fontSize: 8.5, color: "#123A52", marginTop: 3 }}>
                      Bron: {LV_BRON.naam} —{" "}
                      <a href={LV_BRON.url} target="_blank" rel="noopener noreferrer" style={{ color: STZ.rood, fontWeight: 700 }}>{LV_BRON.label}</a>
                    </div>
                  </div>
                )}
                <div style={{ background: z.kleur + "0F", border: `1px solid ${z.kleur}33`, borderRadius: 6, padding: "6px 8px", marginBottom: 8 }}>
                  <div style={{ fontSize: 8.5, textTransform: "uppercase", letterSpacing: ".06em", color: z.kleur, fontWeight: 700, marginBottom: 3 }}>Tekensoorten in verband gebracht met deze aandoening</div>
                  {tekenVoorZiekte(z.id).length ? tekenVoorZiekte(z.id).map((t) => (
                    <div key={t.id} style={{ fontSize: 9.5, color: STZ.tekst, lineHeight: 1.5 }}>• <strong>{t.naam}</strong> ({t.latijn})</div>
                  )) : <div style={{ fontSize: 9.5, color: STZ.tekst }}>Geen tekensoort in Nederland bewezen overbrenger.</div>}
                </div>
                <div style={{ fontSize: 8.5, textTransform: "uppercase", letterSpacing: ".06em", color: z.kleur, fontWeight: 700, marginBottom: 4 }}>Risico per provincie / gebied</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 3 }}>
                  {PROVINCIES.map((p) => {
                    const r = ziekteKaartKlasse(z, p);
                    const alpha = ["00", "14", "26", "3D", "5C", "80"][r] ?? "14";
                    return (
                      <div key={p.id} style={{ background: z.kleur + alpha, border: `1px solid ${z.kleur}55`, borderRadius: 5, padding: "4px 6px" }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 4 }}>
                          <span style={{ fontSize: 9.5, fontWeight: 700, color: STZ.tekst }}>{p.naam}</span>
                          <span style={{ fontSize: 8, fontWeight: 800, color: "#fff", background: z.kleur, borderRadius: 4, padding: "1px 4px", whiteSpace: "normal", textAlign: "right", maxWidth: "65%" }}>{ziekteKaartLabel(z, p)}</span>
                        </div>
                        <div style={{ fontSize: 8.5, color: "#123A52", lineHeight: 1.45, marginTop: 2 }}>
                          <strong style={{ color: z.kleur }}>Gebieden:</strong> {p.habitat}
                        </div>
                        {r >= 2 && STEDELIJK_GEBIED[p.id] && (
                          <div style={{ fontSize: 8.5, color: "#123A52", lineHeight: 1.45, marginTop: 2 }}>
                            <strong style={{ color: z.kleur }}>Stedelijk groen:</strong> {STEDELIJK_GEBIED[p.id]}
                          </div>
                        )}
                        <div style={{ fontSize: 8.5, color: "#123A52", lineHeight: 1.45, marginTop: 2 }}>
                          <strong style={{ color: z.kleur }}>Tekensoorten:</strong>{" "}
                          {tekenVoorProvincie(p.id).filter((t) => t.ziekten.includes(z.id)).map((t) => t.naam).join(", ") || "geen bekende overbrenger"}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}


/* Opt-out: deelname aan onderzoek intrekken met het unieke deelnamenummer.
   Zelfde beveiliging als het contactformulier (controlevraag, tijdcontrole, verborgen veld, limiet). */
function OptOutFormulier() {
  const [open, setOpen] = useState(false);
  const [nummer, setNummer] = useState("");
  const [code, setCode] = useState("");
  const [toelichting, setToelichting] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [geopendOp] = useState(() => Date.now());
  const [som, setSom] = useState(() => ({ a: 2 + Math.floor(Math.random() * 7), b: 1 + Math.floor(Math.random() * 8) }));
  const [somAntwoord, setSomAntwoord] = useState("");
  const [status, setStatus] = useState<"idle" | "bezig" | "ok" | "fout">("idle");
  const [melding, setMelding] = useState("");
  const intrekken = useServerFn(trekDeelnameIn);

  const veld = { width: "100%", boxSizing: "border-box" as const, border: `1px solid ${STZ.lijn}`, borderRadius: 6, padding: "6px 8px", fontSize: 10.5, fontFamily: "inherit", color: STZ.tekst, background: "#fff", marginBottom: 6 };
  const knop = { background: STZ.rood, color: "#fff", border: "none", borderRadius: 6, padding: "7px 12px", fontSize: 10.5, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" };

  const verstuur = async (e: React.FormEvent) => {
    e.preventDefault();
    const n = nummer.trim().toUpperCase();
    if (!/^TRK-\d{4}-[A-Z0-9]{6}$/.test(n)) {
      setStatus("fout");
      setMelding("Vult u deelnamenummer in, bijvoorbeeld TRK-2026-AB3K9M.");
      return;
    }
    if (Number(somAntwoord.trim()) !== som.a + som.b) {
      setStatus("fout");
      setMelding("Beantwoord de controlevraag correct.");
      return;
    }
    setStatus("bezig");
    setMelding("");
    try {
      const res = await intrekken({
        data: { deelnamenummer: n, intrekcode: code.trim(), toelichting: toelichting.trim(), website: honeypot, geopendOp, somA: som.a, somB: som.b, somAntwoord: Number(somAntwoord.trim()) },
      });
      if (res.ok && res.reden === "handmatig") {
        setStatus("ok");
        setMelding("Zonder geldige intrekcode kunnen we niet automatisch verwijderen. Uw verzoek is doorgestuurd en wordt handmatig gecontroleerd en afgehandeld.");
        setNummer("");
        setCode("");
        return;
      }
      if (res.ok) {
        setStatus("ok");
        setCode("");
        setMelding("Uw deelname is ingetrokken. De gegevens die bij dit deelnamenummer horen zijn definitief verwijderd uit de onderzoeksdatabase en uit het onderzoeksbestand.");
        setNummer("");
        setToelichting("");
        setSomAntwoord("");
        setSom({ a: 2 + Math.floor(Math.random() * 7), b: 1 + Math.floor(Math.random() * 8) });
        return;
      }
      setStatus("fout");
      if (res.reden === "onbekend") setMelding("Bij dit deelnamenummer zijn geen gegevens (meer) gevonden. Controleer het nummer uit uw bevestiging.");
      else if (res.reden === "limiet") setMelding(`Te veel pogingen. Probeer het over ongeveer ${"minuten" in res ? res.minuten : 60} minuten opnieuw.`);
      else if (res.reden === "tempo") setMelding("Het formulier werd te snel verstuurd. Ververs de pagina en probeer het opnieuw.");
      else if (res.reden === "controle") setMelding("De controlevraag is niet juist beantwoord.");
      else setMelding("Het intrekken is niet gelukt. Probeer het later opnieuw of gebruik het contactformulier.");
    } catch {
      setStatus("fout");
      setMelding("Het intrekken is niet gelukt. Probeer het later opnieuw of gebruik het contactformulier.");
    }
  };

  return (
    <div style={{ marginTop: 9, borderTop: `1px solid ${STZ.lijn}`, paddingTop: 8 }}>
      <div style={{ fontSize: 10, fontWeight: 700, color: STZ.rood }}>Deelname intrekken (opt-out)</div>
      <div style={{ fontSize: 9.5, lineHeight: 1.5, color: STZ.tekst, marginBottom: 6 }}>
        U kunt u deelname op elk moment intrekken. Vul hieronder uw unieke deelnamenummer en uw persoonlijke intrekcode in; met een geldige intrekcode worden de gegevens die bij dat nummer horen definitief verwijderd. Heeft u de intrekcode niet bij de hand, dan wordt uw verzoek handmatig gecontroleerd en afgehandeld. Er zijn geen naam- of contactgegevens nodig.
      </div>
      {!open ? (
        <button type="button" onClick={() => setOpen(true)} style={knop}>Deelname intrekken</button>
      ) : (
        <form onSubmit={(e) => void verstuur(e)}>
          <input
            value={nummer}
            onChange={(e) => setNummer(e.target.value)}
            placeholder="Deelnamenummer (TRK-2026-XXXXXX)"
            style={veld}
            autoComplete="off"
            aria-label="Deelnamenummer"
          />
          <input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Intrekcode (uit uw bevestiging)"
            style={veld}
            autoComplete="off"
            aria-label="Intrekcode"
          />
          <textarea
            value={toelichting}
            onChange={(e) => setToelichting(e.target.value)}
            placeholder="Toelichting (optioneel)"
            rows={2}
            style={veld}
            aria-label="Toelichting"
          />
          <input
            value={honeypot}
            onChange={(e) => setHoneypot(e.target.value)}
            tabIndex={-1}
            autoComplete="off"
            aria-hidden="true"
            style={{ position: "absolute", left: -9999, width: 1, height: 1, opacity: 0 }}
          />
          <input
            value={somAntwoord}
            onChange={(e) => setSomAntwoord(e.target.value)}
            placeholder={`Controlevraag: hoeveel is ${som.a} + ${som.b}?`}
            inputMode="numeric"
            style={veld}
            aria-label={`Controlevraag: hoeveel is ${som.a} plus ${som.b}?`}
          />
          <button type="submit" disabled={status === "bezig"} style={{ ...knop, opacity: status === "bezig" ? 0.6 : 1 }}>
            {status === "bezig" ? "Bezig…" : "Definitief intrekken"}
          </button>
        </form>
      )}
      {melding && (
        <p style={{ fontSize: 9.5, lineHeight: 1.45, fontWeight: 700, margin: "6px 0 0", color: status === "ok" ? STZ.terra : STZ.rood }}>{melding}</p>
      )}
    </div>
  );
}

const CONTACT_ONDERWERPEN = [
  { sleutel: "algemeen", nl: "Algemene vraag", en: "General question" },
  { sleutel: "data", nl: "Vraag over gebruikte data of bronnen", en: "Question about data or sources used" },
  { sleutel: "correctie", nl: "Correctie doorgeven", en: "Report a correction" },
  { sleutel: "privacyverzoek", nl: "Privacyverzoek (inzage, correctie of verwijdering van gegevens)", en: "Privacy request (access, correction or deletion of data)" },
  { sleutel: "privacyklacht", nl: "Klacht over privacy of gegevens", en: "Complaint about privacy or data" },
  { sleutel: "overig", nl: "Overig", en: "Other" },
] as const;

type ContactOnderwerpSleutel = (typeof CONTACT_ONDERWERPEN)[number]["sleutel"];

function ContactBlok() {
  const taal = useTaal();
  const en = taal === "en";
  const [openForm, setOpenForm] = useState(false);
  const [naam, setNaam] = useState("");
  const [afzender, setAfzender] = useState("");
  const [onderwerpSleutel, setOnderwerpSleutel] = useState<ContactOnderwerpSleutel>("algemeen");
  const [bericht, setBericht] = useState("");
  const [status, setStatus] = useState<"idle" | "bezig" | "ok" | "fout" | "ongeldig">("idle");
  const [foutUitleg, setFoutUitleg] = useState("");
  const [referentie, setReferentie] = useState("");
  const [verzoeknummer, setVerzoeknummer] = useState("");
  const [bevestigingGemaild, setBevestigingGemaild] = useState(false);
  // Bewaaroptie: privacyklachten en bezwaarverzoeken komen dan in een apart register.
  const [bewaren, setBewaren] = useState(true);
  const [honeypot, setHoneypot] = useState("");
  const [geopendOp] = useState(() => Date.now());
  const [som, setSom] = useState(() => ({ a: 2 + Math.floor(Math.random() * 7), b: 1 + Math.floor(Math.random() * 8) }));
  const [somAntwoord, setSomAntwoord] = useState("");
  const [fouten, setFouten] = useState<Record<string, string>>({});
  const verzendServer = useServerFn(verstuurContact);

  const kop = { fontSize: 10, fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: ".07em", color: STZ.terra, margin: "0 0 5px" };
  const kaart = { background: STZ.creme, border: `1px solid ${STZ.lijn}`, borderRadius: 8, padding: "9px 11px", marginBottom: 10 };
  const tekst = { fontSize: 10.5, lineHeight: 1.55, color: STZ.tekst, margin: 0 };
  const veld = { width: "100%", boxSizing: "border-box" as const, border: `1px solid ${STZ.lijn}`, borderRadius: 6, padding: "6px 8px", fontSize: 10.5, fontFamily: "inherit", color: STZ.tekst, background: "#fff", marginBottom: 6 };

  // Mailadres opgesplitst zodat het niet als platte tekst in de pagina staat.

  const veldStijl = (key: string) => ({
    ...veld,
    marginBottom: fouten[key] ? 2 : 6,
    borderColor: fouten[key] ? STZ.rood : STZ.lijn,
  });

  const wijzig = (key: string, setter: (v: string) => void, waarde: string) => {
    setter(waarde);
    if (fouten[key]) {
      setFouten((f) => {
        const n = { ...f };
        delete n[key];
        return n;
      });
    }
    if (status !== "idle") setStatus("idle");
  };

  const Fout = ({ tekst }: { tekst?: string | undefined }) =>
    tekst ? (
      <p style={{ fontSize: 9, lineHeight: 1.4, color: STZ.rood, margin: "0 0 6px", fontWeight: 700 }}>{tekst}</p>
    ) : null;

  const valideer = () => {
    const f: Record<string, string> = {};
    const n = naam.trim();
    const e = afzender.trim();
    const b = bericht.trim();

    if (n.length < 2) f['naam'] = en ? "Enter your name (at least 2 characters)." : "Vul uw naam in (minimaal 2 tekens).";
    else if (n.length > 100) f['naam'] = en ? "Name may contain at most 100 characters." : "Naam mag maximaal 100 tekens bevatten.";
    else if (!/^[\p{L}\p{M}'’\-. ]+$/u.test(n)) f['naam'] = en ? "Name may only contain letters, spaces, hyphens and apostrophes." : "Naam mag alleen letters, spaties, koppelteken en apostrof bevatten.";

    if (!e) f['afzender'] = en ? "Enter your e-mail address." : "Vult u e-mailadres in.";
    else if (e.length > 255) f['afzender'] = en ? "E-mail address may contain at most 255 characters." : "E-mailadres mag maximaal 255 tekens bevatten.";
    else if (!/^[^\s@,;:<>()[\]\\"]+@[^\s@.,;:<>()[\]\\"]+(\.[^\s@.,;:<>()[\]\\"]+)+$/.test(e))
      f['afzender'] = en ? "Enter a valid e-mail address, for example name@example.com." : "Vul een geldig e-mailadres in, bijvoorbeeld naam@voorbeeld.nl.";

    if (b.length < 10) f['bericht'] = en ? "Your message must be at least 10 characters." : "Uw bericht moet minimaal 10 tekens bevatten.";
    else if (b.length > 2000) f['bericht'] = en ? "Your message may contain at most 2000 characters." : "Uw bericht mag maximaal 2000 tekens bevatten.";

    // Weiger regeleinden in kopvelden (header-injectie).
    if (/[\r\n]/.test(afzender)) f['afzender'] = en ? "Invalid characters in e-mail address." : "Ongeldige tekens in e-mailadres.";

    // Eenvoudige controlevraag tegen geautomatiseerde inzendingen.
    if (Number(somAntwoord.trim()) !== som.a + som.b) f['som'] = en ? "Answer the check question correctly." : "Beantwoord de controlevraag correct.";

    return f;
  };

  const verstuur = (e: React.FormEvent) => {
    e.preventDefault();
    const f = valideer();
    setFouten(f);
    if (Object.keys(f).length > 0) {
      setStatus("ongeldig");
      return;
    }
    void doeVerzending();
  };

  const doeVerzending = async () => {
    setStatus("bezig");
    setFoutUitleg("");
    setReferentie("");
    setVerzoeknummer("");
    setBevestigingGemaild(false);
    const keuze = CONTACT_ONDERWERPEN.find((o) => o.sleutel === onderwerpSleutel) ?? CONTACT_ONDERWERPEN[0];
    const isPrivacy = onderwerpSleutel === "privacyklacht" || onderwerpSleutel === "privacyverzoek";
    const onderwerpTekst = `Contactformulier: ${keuze.nl}${en ? ` / ${keuze.en}` : ""}`;
    try {
      const res = await verzendServer({
        data: {
          naam: naam.trim(),
          email: afzender.trim(),
          onderwerp: onderwerpTekst.slice(0, 150),
          bericht: bericht.trim(),
          website: honeypot,
          geopendOp,
          somA: som.a,
          somB: som.b,
          somAntwoord: Number(somAntwoord.trim()),
          soort: onderwerpSleutel,
          bewaren: isPrivacy && bewaren,
          taal: en ? "en" : "nl",
        },
      });
      if (res.ok) {
        setReferentie("referentie" in res && res.referentie ? res.referentie : "");
        setVerzoeknummer("verzoeknummer" in res && res.verzoeknummer ? res.verzoeknummer : "");
        setBevestigingGemaild("gemaild" in res && res.gemaild === true);
        setStatus("ok");
        setNaam("");
        setAfzender("");
        setOnderwerpSleutel("algemeen");
        setBericht("");
        setSom({ a: 2 + Math.floor(Math.random() * 7), b: 1 + Math.floor(Math.random() * 8) });
        setSomAntwoord("");
        return;
      }
      if (res.reden === "limiet") {
        setFoutUitleg(
          en
            ? `You have sent several messages in quick succession. Please try again in about ${"minuten" in res ? res.minuten : 60} minutes.`
            : `U hebt kort achter elkaar meerdere berichten verstuurd. Probeer het over ongeveer ${"minuten" in res ? res.minuten : 60} minuten opnieuw.`,
        );
      } else if (res.reden === "tempo") {
        setFoutUitleg(en ? "The form was submitted too quickly (or far too late). Refresh the page and fill in the form again." : "Het formulier werd te snel (of veel te laat) verstuurd. Ververs de pagina en vul het formulier opnieuw in.");
      } else if (res.reden === "controle") {
        setFoutUitleg(en ? "The check question was not answered correctly. Please enter the answer again." : "De controlevraag is niet juist beantwoord. Vul het antwoord opnieuw in.");
      } else if (res.reden === "spam_inhoud") {
        setFoutUitleg(
          en
            ? "Your message was rejected by the spam filter (for example because of links or HTML). Send your message as plain text without links."
            : "Uw bericht is door het spamfilter geweigerd (bijvoorbeeld door links of HTML). Verstuur uw bericht als gewone tekst zonder links.",
        );
      } else if (res.reden === "dubbel") {
        setFoutUitleg(en ? "This message has just been received. Wait a moment before sending the same message again." : "Dit bericht is zojuist al ontvangen. Wacht even voordat u hetzelfde bericht opnieuw verstuurt.");
      } else {
        setFoutUitleg(en ? "Something went wrong while saving your message. Please try again." : "Er ging iets mis bij het opslaan van uw bericht. Probeer het opnieuw.");
      }
      setStatus("fout");
    } catch {
      setFoutUitleg(en ? "The message could not be sent. Check your internet connection and try again." : "Het bericht kon niet worden verstuurd. Controleer uw internetverbinding en probeer het opnieuw.");
      setStatus("fout");
    }
  };

  return (
    <div style={kaart}>
      <h4 id="help-contact" style={kop}>{en ? "Contact" : "Contact"}</h4>
      <p style={{ ...tekst, marginBottom: 8 }}>
        {en
          ? "For more information, general questions, questions about privacy or the data used, requests regarding your data, a privacy complaint, or to report a correction."
          : "Voor meer informatie, algemene vragen, vragen over privacy of de gebruikte data, verzoeken over uw gegevens, een klacht over privacy, en/of voor het melden van een correctie."}
      </p>
      <p style={{ ...tekst, marginBottom: 8, color: "#3E6A7D" }}>
        {en
          ? "Your name and e-mail address are only used to e-mail you a confirmation with an incident number; they are not stored anywhere. Only the choices 'Complaint about privacy or data' and 'Privacy request' are registered — solely under the incident number and the message text, without your name or e-mail address. All other subjects are not registered; you only receive a confirmation with an incident number."
          : "Uw naam en e-mailadres worden alleen gebruikt om u een bevestiging met een incidentnummer te mailen; ze worden nergens opgeslagen. Alleen bij de keuzes 'Klacht over privacy of gegevens' en 'Privacyverzoek' wordt uw melding geregistreerd — uitsluitend onder het incidentnummer en de meldingstekst, zonder naam en e-mailadres. Bij alle andere onderwerpen wordt niets geregistreerd; u ontvangt alleen een bevestiging met incidentnummer."}
      </p>
      <button
        type="button"
        onClick={() => setOpenForm((v) => !v)}
        style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", minHeight: 44, padding: "11px 18px", border: "none", borderRadius: 8, background: STZ.rood, color: STZ.wit, fontSize: 14, fontWeight: 800, fontFamily: "inherit", cursor: "pointer" }}
      >
        {en ? (openForm ? "Close contact form" : "Open contact form") : (openForm ? "Contactformulier sluiten" : "Contactformulier openen")}
      </button>

      {openForm && (
        <form onSubmit={verstuur} noValidate style={{ marginTop: 9 }}>
          {/* Honeypot: onzichtbaar voor mensen, bots vullen dit in. */}
          <div style={{ position: "absolute", left: "-9999px", width: 1, height: 1, overflow: "hidden" }} aria-hidden="true">
            <label htmlFor="trk-website">Website (niet invullen)</label>
            <input id="trk-website" name="website" tabIndex={-1} autoComplete="off" value={honeypot} onChange={(e) => setHoneypot(e.target.value)} />
          </div>
          <input style={veldStijl("naam")} value={naam} maxLength={100} placeholder={en ? "Your name" : "Uw naam"} onChange={(e) => wijzig("naam", setNaam, e.target.value)} aria-label={en ? "Your name" : "Uw naam"} aria-invalid={!!fouten["naam"]} disabled={status === "bezig"} />
          <Fout tekst={fouten["naam"]} />
          <input style={veldStijl("afzender")} type="email" value={afzender} maxLength={255} placeholder={en ? "Your e-mail address" : "Uw e-mailadres"} onChange={(e) => wijzig("afzender", setAfzender, e.target.value)} aria-label={en ? "Your e-mail address" : "Uw e-mailadres"} aria-invalid={!!fouten["afzender"]} disabled={status === "bezig"} />
          <Fout tekst={fouten["afzender"]} />
          <label htmlFor="trk-onderwerp" style={{ display: "block", fontSize: 9.5, color: "#3E6A7D", fontWeight: 700, margin: "0 0 4px" }}>
            {en ? "Subject" : "Onderwerp"}
          </label>
          <select
            id="trk-onderwerp"
            style={veldStijl("onderwerp")}
            value={onderwerpSleutel}
            onChange={(e) => { setOnderwerpSleutel(e.target.value as ContactOnderwerpSleutel); if (status !== "idle") setStatus("idle"); }}
            aria-label={en ? "Subject" : "Onderwerp"}
            disabled={status === "bezig"}
          >
            {CONTACT_ONDERWERPEN.map((o) => (
              <option key={o.sleutel} value={o.sleutel}>{en ? o.en : o.nl}</option>
            ))}
          </select>
          {(onderwerpSleutel === "privacyklacht" || onderwerpSleutel === "privacyverzoek") && (
            <p style={{ fontSize: 9.5, lineHeight: 1.5, color: "#3E6A7D", background: "#E6F1F8", border: `1px solid #BBD7E6`, borderRadius: 6, padding: "6px 8px", margin: "0 0 6px" }}>
              {en
                ? "We handle privacy requests and complaints as quickly as possible, and within 4 weeks at the latest. You also have the right to lodge a complaint with the Dutch Data Protection Authority (Autoriteit Persoonsgegevens) or the data protection authority in your own country."
                : "We behandelen privacyverzoeken en -klachten zo snel mogelijk, uiterlijk binnen 4 weken. U hebt ook het recht een klacht in te dienen bij de Autoriteit Persoonsgegevens (autoriteitpersoonsgegevens.nl) of bij de privacytoezichthouder in uw eigen land."}
            </p>
          )}
          {(onderwerpSleutel === "privacyklacht" || onderwerpSleutel === "privacyverzoek") && (
            <label style={{ display: "flex", gap: 7, alignItems: "flex-start", fontSize: 9.5, lineHeight: 1.5, color: "#3E6A7D", margin: "0 0 8px" }}>
              <input
                type="checkbox"
                checked={bewaren}
                onChange={(e) => { setBewaren(e.target.checked); if (status !== "idle") setStatus("idle"); }}
                disabled={status === "bezig"}
                style={{ marginTop: 2 }}
              />
              <span>
                {en
                  ? "Store my complaint or objection in the separate privacy register. Your request is then kept in a separate, protected file under its own request number — just like research submissions — so that its handling can be traced. Only the authorised administrator can read it; the register is automatically cleared after three years. Without this option your message is only handled as a regular contact message."
                  : "Bewaar mijn klacht of bezwaar in het aparte privacyregister. Uw verzoek staat dan in een apart, afgeschermd bestand met een eigen verzoeknummer — net als de onderzoeksinzendingen — zodat de afhandeling te volgen is. Alleen de bevoegde beheerder kan dit teruglezen; het register wordt na drie jaar automatisch opgeschoond. Zonder deze optie wordt uw bericht alleen als gewoon contactbericht afgehandeld."}
              </span>
            </label>
          )}
          <p id="trk-medische-gegevens" className="text-foreground" style={{ fontSize: 10.5, lineHeight: 1.55, margin: "0 0 8px" }}>
            <strong>{en ? "Do not send medical information." : "Stuur geen medische gegevens mee."}</strong>{" "}
            {en
              ? "Do not include symptoms, diagnoses, medication details or research files in your message. This form is for general questions, corrections and privacy matters. Your message is forwarded by e-mail via Gmail."
              : "Vermeld geen klachten of symptomen, diagnoses of medicatie en stuur geen onderzoeksbestanden mee. Dit formulier is bedoeld voor algemene vragen, correcties en privacyzaken. Uw bericht wordt via Gmail per e-mail doorgestuurd."}
          </p>
          <textarea style={{ ...veldStijl("bericht"), minHeight: 80, resize: "vertical" as const }} value={bericht} maxLength={2000} placeholder={en ? "Your message or correction (no medical information)" : "Uw bericht of correctie (geen medische gegevens)"} onChange={(e) => wijzig("bericht", setBericht, e.target.value)} aria-label={en ? "Your message" : "Uw bericht"} aria-describedby="trk-medische-gegevens" aria-invalid={!!fouten["bericht"]} disabled={status === "bezig"} />
          <Fout tekst={fouten["bericht"]} />
          <p style={{ fontSize: 9, color: "#5A8299", margin: "0 0 6px", textAlign: "right" as const }}>{bericht.trim().length}/2000</p>
          <label htmlFor="trk-som" style={{ display: "block", fontSize: 9.5, color: "#3E6A7D", fontWeight: 700, margin: "0 0 4px" }}>
            {en ? `Anti-spam check: how much is ${som.a} + ${som.b}?` : `Controlevraag tegen spam: hoeveel is ${som.a} + ${som.b}?`}
          </label>
          <input
            id="trk-som"
            style={{ ...veldStijl("som"), maxWidth: 90 }}
            inputMode="numeric"
            value={somAntwoord}
            maxLength={3}
            placeholder={en ? "Answer" : "Antwoord"}
            onChange={(e) => wijzig("som", setSomAntwoord, e.target.value.replace(/[^0-9]/g, ""))}
            aria-label={en ? "Anti-spam check" : "Controlevraag tegen spam"}
            aria-invalid={!!fouten["som"]}
            disabled={status === "bezig"}
          />
          <Fout tekst={fouten["som"]} />
          <button
            type="submit"
            disabled={status === "bezig"}
            aria-busy={status === "bezig"}
            style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "7px 12px", border: "none", borderRadius: 7, background: status === "bezig" ? "#5A8299" : STZ.rood, color: "#fff", fontSize: 10.5, fontWeight: 800, fontFamily: "inherit", cursor: status === "bezig" ? "not-allowed" : "pointer", opacity: status === "bezig" ? 0.85 : 1 }}
          >
            {status === "bezig" && (
              <span
                aria-hidden="true"
                style={{ width: 11, height: 11, borderRadius: "50%", border: "2px solid rgba(255,255,255,.45)", borderTopColor: "#fff", display: "inline-block", animation: "trk-spin .7s linear infinite" }}
              />
            )}
            {status === "bezig" ? (en ? "Sending…" : "Bezig met versturen…") : en ? "Send message" : "Bericht versturen"}
          </button>
          <style>{`@keyframes trk-spin{to{transform:rotate(360deg)}}`}</style>
          {status !== "idle" && (
            <div
              role="status"
              aria-live="polite"
              style={{
                marginTop: 8,
                padding: "7px 9px",
                borderRadius: 7,
                border: `1px solid ${status === "ok" || status === "bezig" ? "#BBD7E6" : STZ.rood}`,
                background: status === "ok" || status === "bezig" ? "#E6F1F8" : "#fff",
                color: status === "ok" || status === "bezig" ? "#123A52" : STZ.rood,
                fontSize: 10,
                lineHeight: 1.5,
                fontWeight: 700,
              }}
            >
              {status === "bezig" ? (
                en ? "Sending — please wait a moment…" : "Bezig met versturen — een moment geduld…"
              ) : status === "ok" ? (
                <>
                  <span style={{ display: "block" }}>
                    {en
                      ? "✓ Message received — your message has been sent and processed securely. We will contact you as soon as possible."
                      : "✓ Bericht ontvangen — uw bericht is veilig verstuurd en verwerkt. We nemen zo snel mogelijk contact met u op."}
                  </span>
                  {referentie && (
                    <span style={{ display: "block", fontWeight: 400, marginTop: 4 }}>
                      {en ? "Incident number:" : "Incidentnummer:"}{" "}
                      <strong style={{ fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace", letterSpacing: ".03em" }}>
                        {referentie}
                      </strong>
                      <br />
                      {bevestigingGemaild
                        ? en
                          ? "Note your incident number for any further contact. A confirmation with this number has been sent to your e-mail address."
                          : "Noteer uw incidentnummer voor eventueel verder contact. Een bevestiging met dit nummer is naar uw e-mailadres gestuurd."
                        : en
                          ? "Note your incident number for any further contact. The e-mail confirmation could not be sent; please keep this number yourself."
                          : "Noteer uw incidentnummer voor eventueel verder contact. De e-mailbevestiging kon niet worden verstuurd; bewaar dit nummer daarom zelf."}
                    </span>
                  )}
                  {verzoeknummer && (
                    <span style={{ display: "block", fontWeight: 400, marginTop: 4 }}>
                      {en ? "Privacy register number:" : "Privacyregister-nummer:"}{" "}
                      <strong style={{ fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace", letterSpacing: ".03em" }}>
                        {verzoeknummer}
                      </strong>
                      <br />
                      {en
                        ? "Your complaint or objection has been stored in the separate privacy register. Quote this number in any follow-up."
                        : "U klacht of bezwaar is bewaard in het aparte privacyregister. Vermeld dit nummer bij vervolgcontact."}
                    </span>
                  )}
                </>
              ) : status === "ongeldig" ? (
                "✕ Nog niet verstuurd — controleer de rood gemarkeerde velden hierboven."
              ) : (
                <>
                  <span style={{ display: "block" }}>✕ Versturen is niet gelukt</span>
                  <span style={{ display: "block", fontWeight: 400, marginTop: 3 }}>
                    {foutUitleg || "Uw bericht kon niet worden opgeslagen. Controleer uw internetverbinding en probeer het opnieuw."}
                  </span>
                  <button
                    type="button"
                    onClick={() => void doeVerzending()}
                    style={{ marginTop: 7, padding: "6px 11px", border: `1px solid ${STZ.rood}`, borderRadius: 7, background: "#fff", color: STZ.rood, fontSize: 10, fontWeight: 800, fontFamily: "inherit", cursor: "pointer" }}
                  >
                    ↻ Opnieuw proberen
                  </button>
                </>
              )}
            </div>
          )}
          <p style={{ fontSize: 9, lineHeight: 1.5, color: "#5A8299", margin: "7px 0 0" }}>
            Uw bericht wordt beveiligd verwerkt en opgeslagen voor TekenRisicoKaart. Door het ontbreken van een verzenddomein wordt geen bevestigingsmail verstuurd; bewaar daarom uw bevestigings-ID.
          </p>
        </form>
      )}
    </div>
  );
}

const VOORBEELD_ZOEKTERMEN: string[] = ["Lyme", "TBE", "preventie", "seizoen", "bronnen", "tekencheck", "risiconiveau", "contact"];

function HelpTab({ setTab }: { setTab: (t: string) => void }) {
  const taal = useTaal();
  const en = taal === "en";
  const T = (nl: string) => vertaalTekst(nl, en);
  const { peildatum } = useDataStatus();
  const laatstBijgewerkt = PEILDATUM_AUTO;
  /* TBE-meldingen per jaar: automatisch bijgewerkt uit RIVM/LCI. */
  const tbeCijfers = useTbeCijfersTekst();
  const bronPeildata = useBronPeildata();
  /* Landelijke kerncijfers, live herberekend uit de provinciecijfers. */
  const land = useLandelijkeCijfers();


  const [open, setOpen] = useState<number | null>(null);
  const [woordenlijstOpen, setWoordenlijstOpen] = useState(false);
  // Changelog: standaard de nieuwste (huidige) datum; bladeren met de blauwe pijltjes.
  const [logIndex, setLogIndex] = useState(0);
  // Beveiligingsscans: nieuwste scan eerst, bladeren met dezelfde pijltjes.
  const [scanIndex, setScanIndex] = useState(0);
  const scans = useBeveiligingsscans();
  // Back-uplog: nieuwste run eerst, bladeren met dezelfde pijltjes.
  const [backupIndex, setBackupIndex] = useState(0);
  const backups = useBackuplog();
  const inhoudRef = useRef<HTMLDivElement>(null);
  const [zoek, setZoek] = useState("");
  const [resultaten, setResultaten] = useState<{ id: string; titel: string; sectie: string }[]>([]);
  const [actiefId, setActiefId] = useState<string | null>(null);


  useEffect(() => {
    const root = inhoudRef.current;
    if (!root) return;
    const q = zoek.trim().toLowerCase();
    const kids = Array.from(root.children) as HTMLElement[];
    if (!q) { setResultaten([]); return; }

    const gevonden: { id: string; titel: string; sectie: string }[] = [];
    let huidigeSectie = "";
    kids.forEach((k, i) => {
      if (k.tagName === "H3") { huidigeSectie = (k.textContent ?? "").trim(); return; }
      /* Begrippenlijst: één blok met vele begrippen — laat het zoekresultaat op het juiste begrip springen. */
      const rijen = Array.from(k.querySelectorAll("dt")) as HTMLElement[];
      if (rijen.length > 1) {
        let raak = 0;
        rijen.forEach((dt, j) => {
          const term = (dt.textContent ?? "").trim();
          const uitleg = (dt.nextElementSibling?.textContent ?? "").trim();
          if (!`${term} ${uitleg}`.toLowerCase().includes(q)) return;
          raak++;
          const id = `help-blok-${i}-${j}`;
          (dt.parentElement as HTMLElement).id = id;
          gevonden.push({ id, titel: term.length > 70 ? term.slice(0, 70) + "…" : term, sectie: huidigeSectie });
        });
        if (raak > 0) { setWoordenlijstOpen(true); return; }
      }
      if (!(k.textContent ?? "").toLowerCase().includes(q)) return;
      const id = `help-blok-${i}`;
      k.id = id;
      const eerste = (k.firstElementChild?.textContent ?? k.textContent ?? "").trim();
      const titel = (eerste.length > 70 ? eerste.slice(0, 70) + "…" : eerste) || huidigeSectie || "Onderwerp";
      gevonden.push({ id, titel, sectie: huidigeSectie });
    });
    setResultaten(gevonden);
  }, [zoek, open]);

  // markeer het blok dat nu in beeld is
  useEffect(() => {
    if (resultaten.length === 0) { setActiefId(null); return; }
    const els = resultaten.map((r) => document.getElementById(r.id)).filter(Boolean) as HTMLElement[];
    if (els.length === 0) return;
    const bepaal = () => {
      let best: { id: string; d: number } | null = null;
      for (const el of els) {
        const r = el.getBoundingClientRect();
        if (r.bottom < 0 || r.top > window.innerHeight) continue;
        const d = Math.abs(r.top + r.height / 2 - window.innerHeight / 2);
        if (!best || d < best.d) best = { id: el.id, d };
      }
      setActiefId(best?.id ?? null);
    };
    bepaal();
    const io = new IntersectionObserver(bepaal, { threshold: [0, 0.25, 0.6, 1] });
    els.forEach((el) => io.observe(el));
    window.addEventListener("scroll", bepaal, true);
    return () => { io.disconnect(); window.removeEventListener("scroll", bepaal, true); };
  }, [resultaten]);

  // visuele markering van het actieve blok
  useEffect(() => {
    const els = resultaten.map((r) => document.getElementById(r.id)).filter(Boolean) as HTMLElement[];
    els.forEach((el) => {
      const actief = el.id === actiefId;
      el.style.transition = "outline-color .2s, box-shadow .2s";
      el.style.outline = actief ? `2px solid ${STZ.rood}` : "";
      el.style.outlineOffset = actief ? "1px" : "";
      el.style.boxShadow = actief ? "0 1px 5px rgba(29,78,99,.16)" : "";
    });
    return () => {
      els.forEach((el) => { el.style.outline = ""; el.style.outlineOffset = ""; el.style.boxShadow = ""; });
    };
  }, [actiefId, resultaten]);

  const gaNaar = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    setActiefId(id);
    el.scrollIntoView({ behavior: "smooth", block: "center" });
  };




  const kop = { fontSize: 10, fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: ".07em", color: STZ.rood, margin: "0 0 5px" };
  const kaart = { background: STZ.creme, border: `1px solid ${STZ.lijn}`, borderRadius: 8, padding: "9px 11px", marginBottom: 10 };
  const sectie = { fontSize: 11, fontWeight: 800 as const, color: STZ.rood, margin: "16px 0 7px" };
  const tekst = { fontSize: 10.5, lineHeight: 1.55, color: STZ.tekst, margin: 0 };


  const stappen: [string, string][] = [
    ["Landelijk", "Open het tabblad Landelijk voor een overzicht van heel Nederland. U ziet het landelijke risiconiveau, het geschatte aantal tekenbeten per jaar, de meldingen op Tekenradar, de TBE-jaarcijfers, alle tekenbeetziekten, de tekensoorten, habitat en preventie. Onder het tabblad Vergelijking met RIVM staan onze cijfers naast de RIVM/LCI-uitgangspunten."],
    ["Provincies", "Klik op de kaart of op een provincie in de lijst voor risiconiveau, risicogebieden, stedelijk groen en preventie."],
    ["Risico's per tekenbeetziekte", "Kies een ziekte om het landelijke risico, het percentage besmette teken, de besmettingsgraad en het risico per provincie en gebied te zien. De kaart kleurt mee."],
    ["Seizoen", "Bekijk de tekenactiviteit per maand, per seizoen en de factoren die de activiteit bepalen."],
    ["Tekenbeetziekten", "Achtergrondinformatie per ziekte: verwekker, klachten, incubatietijd, overdracht, behandeling en wanneer u naar de huisarts gaat."],
    ["Tekenmeldingen", "Zet de gewenste tekensoorten aan om bevestigde, historische vondsten op de kaart te zien: de Vlekkenteek (paarse stippen) en de Reuzenteek (blauwe stippen), uit NVWA/RIVM-publicaties met aanvullend wetenschappelijk onderzoek. Een stip staat niet voor ziektegevallen of actuele tekendichtheid en locaties zijn bij benadering. Ziet u zo'n teek? Meld hem bij de NVWA via de meldlink bij de tekensoort."],
    ["TBE-meldingen", "Zet deze knop aan om provincies met bekende TBE-meldingen op de kaart te markeren."],
    ["Assistent", "Klik rechtsonder in beeld op het knopje met het spraakballonnetje voor uitleg over de websites en web-apps. U kiest een onderwerp met bijbehorende vragen of typt zelf een vraag. De assistent geeft gecontroleerde website-informatie en geen medische beoordeling; het gesprek wordt niet bewaard."],

    ["Zoekbalk", "U kunt zoeken op willekeurige plaatsnamen, dorpen en buurtschappen uit heel Nederland, maar ook op gemeenten en provincies. Typ u een willekeurige plaatsnaam, dan koppelt de website en web-app daar automatisch de juiste gemeente én provincie aan en opent het bijbehorende provinciepaneel met risico, gebieden en preventie."],
    ["Kaart in- en uitklappen", "De kaart is inklapbaar, zodat u meer ruimte hebt voor de lijsten en teksten. Met de knop Kaart in de knoppenbalk klap u de kaart uit of weer in. Staat de kaart open, dan kunt u hem ook sluiten met het blauwe pijltje rechtsboven op de kaart. Uw keuze geldt op elk scherm: telefoon, tablet en desktop."],
    ["Legenda in- en uitklappen", "Onder de kaart staat de balk 'Risicokaart · meldingen per 100.000 inwoners, gewogen'. Klik of tik op die balk (of op het pijltje rechts ervan) om de legenda uit te klappen. Klik nogmaals om hem weer in te klappen; de balk zelf blijft altijd onderin het scherm zichtbaar."],
    ["Legenda: Risicokaart", MELDINGSBIAS_KORT],
    ["Wat de classificatie op de kaart betekent", GEBIEDSINDICATIE_ZIN],
    ["Legenda: TBE-meldingen", "Drie symbolen: een dichte rode stip (humane TBE-melding vastgesteld), een wit rondje met rode rand (TBE alleen aangetoond in teken of dieren) en een stippellijn-rondje (TBE nog niet aangetoond; uitsluiting is niet mogelijk)."],
    ["TBE-stippen en provinciecijfers", TBE_STIPPEN_ZIN],
    ["Legenda: Tekenbeten", TEKENBEET_TOELICHTING],
    ["Legenda: Tekenbeten in de eigen tuin", "Gekleurde blokjes met het percentage van de gemelde tekenbeten dat in de eigen tuin is opgelopen (RIVM/Tekenradar). Schakel boven de kaart tussen 'Alle tekenbeten' en 'Tekenbeten in de eigen tuin' om deze laag te tonen."],
  ];

  const faq: [string, ReactNode][] = [
    ["Moet ik mij registreren?", "Nee. U hoeft geen account aan te maken en niet in te loggen. De website en web-app is vrij te gebruiken: open hem en u kunt meteen zoeken, provincies bekijken en de risico's per tekenbeetziekte raadplegen. Ook als u de web-app op uw startscherm zet, blijft registreren onnodig."],
    ["Hoe zit het met mijn privacy?", "De website en web-app vraagt geen persoonsgegevens en gebruikt geen locatiebepaling. Wat u in de zoekbalk typt, wordt alleen in uw eigen toestel gebruikt om de juiste gemeente en provincie te tonen en wordt niet opgeslagen of gedeeld. Er worden geen medische gegevens gevraagd of bewaard."],
    ["Waarop kan ik zoeken?", "Op willekeurige plaatsnamen uit heel Nederland (ook kleine dorpen en buurtschappen), op gemeenten en op provincies. Bij een plaatsnaam zoekt de website en web-app zelf de bijbehorende gemeente en provincie erbij, zodat u meteen het risico voor uw omgeving ziet."],
    ["Wat betekenen de risiconiveaus?", MELDINGSBIAS_KORT],





    ["Kan ik in de stad een teek oplopen?", "Ja. Ongeveer een groot deel van de tekenbeten wordt opgelopen in tuinen, parken, openbaar groen, recreatieterreinen, sportvelden en volkstuinen."],
    ["Wanneer zijn teken actief?", "Teken zijn het hele jaar actief en worden actiever bij temperaturen boven ongeveer 5–7 °C, met een piek in het voorjaar en de nazomer."],
    ["Ik heb een tekenbeet, wat nu?", <>
      <p style={{ margin: "0 0 6px" }}>
        {T("Verwijder de teek zo snel mogelijk met een tekenpincet, noteer de datum en houd de plek 3 maanden in de gaten. Bij een rode ring, koorts of griepachtige klachten: neem contact op met de huisarts. Twijfelt u? Neem ook dan contact op met de huisarts.")}
      </p>
      <p style={{ margin: "0 0 4px" }}>{T("Bezoek voor meer informatie over wat te doen bij een tekenbeet:")}</p>
      {([
        ["Stichting Tekenbeetziekten", "www.tekenbeetziekten.nl", "https://www.tekenbeetziekten.nl"],
        ["Lymevereniging", "www.lymevereniging.nl", "https://www.lymevereniging.nl"],
        ["RIVM", "www.rivm.nl", "https://www.rivm.nl"],
        ["GGD", "www.ggd.nl", "https://www.ggd.nl"],
      ] as const).map(([n, l, u]) => (
        <div key={u} style={{ fontSize: 10, lineHeight: 1.7 }}>
          {n}{" "}
          <a href={u} target="_blank" rel="noopener noreferrer" style={{ color: STZ.rood, fontWeight: 700, textDecoration: "underline" }}>{l}</a>
        </div>
      ))}
      <p style={{ margin: "6px 0 0" }}>
        {T("Meldt uw tekenbeet op Tekenradar:")}{" "}
        <a href="https://www.tekenradar.nl" target="_blank" rel="noopener noreferrer" style={{ color: STZ.rood, fontWeight: 700, textDecoration: "underline" }}>www.tekenradar.nl</a>.
      </p>
    </>],

    ["Vervangt deze website en web-app medisch advies?", "Nee. De website en web-app geeft voorlichting. Bij klachten of twijfel raadpleeg altijd een arts."],
    ["Waar komen de gegevens vandaan (bronnen)?", <>
      {T("De inhoud van de website en web-app is gebaseerd op de volgende bronnen:")}
      {([
        ["Stichting Tekenbeetziekten", <>{T("Hoofdbron voor de beschrijvingen van de tekenbeetziekten, de tekensoorten, klachten, preventie en de tekencheck. Website:")}{" "}
          <a href="https://www.tekenbeetziekten.nl" target="_blank" rel="noopener noreferrer" style={{ color: STZ.rood, fontWeight: 700, textDecoration: "underline" }}>www.tekenbeetziekten.nl</a>.</>],
        ["Lymevereniging", <>{T("Patiëntenvereniging voor mensen met de ziekte van Lyme en andere tekenbeetziekten: voorlichting over klachten, diagnostiek, behandeling, chronische Lyme en ervaringen van patiënten. Website:")}{" "}
          <a href="https://www.lymevereniging.nl" target="_blank" rel="noopener noreferrer" style={{ color: STZ.rood, fontWeight: 700, textDecoration: "underline" }}>www.lymevereniging.nl</a>.</>],
        ["RIVM", <>{T("Landelijke cijfers over tekenbeten, ziekte van Lyme, erythema migrans-meldingen via huisartsenpeilstations en de meldingsplichtige TBE-meldingen. Website:")}{" "}
          <a href="https://www.rivm.nl/tekenbeten-en-lyme" target="_blank" rel="noopener noreferrer" style={{ color: STZ.rood, fontWeight: 700, textDecoration: "underline" }}>www.rivm.nl/tekenbeten-en-lyme</a>.</>],
        ["LCI-richtlijnen (RIVM)", <>{T("De professionele richtlijnen van de Landelijke Coördinatie Infectieziektebestrijding voor artsen en GGD'en: verwekker, incubatietijd, diagnostiek, behandeling, meldingsplicht en maatregelen per tekenbeetziekte. Website:")}{" "}
          <a href="https://lci.rivm.nl/richtlijnen" target="_blank" rel="noopener noreferrer" style={{ color: STZ.rood, fontWeight: 700, textDecoration: "underline" }}>lci.rivm.nl/richtlijnen</a>.</>],

        ["GGD'en en provinciale/regionale publicaties", <>{T("Regionale meldingen, natuurgebieden met verhoogd risico en lokale voorlichting. Website:")}{" "}
          <a href="https://www.ggd.nl" target="_blank" rel="noopener noreferrer" style={{ color: STZ.rood, fontWeight: 700, textDecoration: "underline" }}>www.ggd.nl</a>.</>],
        ["GGD GHOR Nederland", <>{T("De landelijke vereniging van de GGD'en en GHOR: kennisnetwerk voor infectieziektebestrijding, regionale signalering en afstemming tussen de GGD-regio's. Website:")}{" "}
          <a href="https://www.ggdghorkennisnet.nl/" target="_blank" rel="noopener noreferrer" style={{ color: STZ.rood, fontWeight: 700, textDecoration: "underline" }}>www.ggdghorkennisnet.nl</a>.</>],
        ["Tekenradar.nl (RIVM en Wageningen University & Research)", <>{T("Publieksmeldingen van tekenbeten, tekenactiviteit per week en onderzoek naar de besmettingsgraad van teken. Website:")}{" "}
          <a href="https://www.tekenradar.nl" target="_blank" rel="noopener noreferrer" style={{ color: STZ.rood, fontWeight: 700, textDecoration: "underline" }}>www.tekenradar.nl</a>.</>],
        ["Nederlands Kennisnetwerk / Wageningen University & Research", <>{T("Veldonderzoek naar tekendichtheid en besmettingspercentages met Borrelia en andere ziekteverwekkers per gebiedstype. Website:")}{" "}
          <a href="https://www.wur.nl/nl/onderzoek-resultaten/onderzoeksinstituten/environmental-research/teken-en-tekenbeetziekten.htm" target="_blank" rel="noopener noreferrer" style={{ color: STZ.rood, fontWeight: 700, textDecoration: "underline" }}>www.wur.nl</a>.</>],
        ["CBS (Centraal Bureau voor de Statistiek)", <>{T("Officiële bevolkingscijfers per provincie. Deze inwonertallen worden gebruikt om meldingen om te rekenen naar cijfers per 100.000 inwoners en om landelijke schattingen (zoals het aantal tekenbeten per jaar) naar rato van inwonertal over de twaalf provincies te verdelen. Website:")}{" "}
          <a href="https://www.cbs.nl/nl-nl/visualisaties/dashboard-bevolking/regionaal" target="_blank" rel="noopener noreferrer" style={{ color: STZ.rood, fontWeight: 700, textDecoration: "underline" }}>www.cbs.nl</a>.</>],
        ["NVWA (Centrum Monitoring Vectoren)", <>{T("De Nederlandse Voedsel- en Warenautoriteit monitort inheemse en exotische tekensoorten (zoals Hyalomma en de bruine hondenteek) en verzorgt de soortdeterminatie. Deze gegevens onderbouwen de informatie over tekensoorten en de referentiedatabase voor de AI-scan. Website:")}{" "}
          <a href="https://www.nvwa.nl" target="_blank" rel="noopener noreferrer" style={{ color: STZ.rood, fontWeight: 700, textDecoration: "underline" }}>www.nvwa.nl</a>.</>],
        ["Wijburg et al. (2026), Eurosurveillance", <>{T("Een studie die een R0-habitatgeschiktheidsmodel voor TBEV combineert met gerichte monitoring van teken en wild; de monitoringresultaten kwamen overeen met de door het model voorspelde risicogebieden en bevestigden verdere verspreiding van het virus. Geen meldingentelling. Deze studie onderbouwt de TBE-markering, niet de risicoklassen op de kaart. Euro Surveill. 2026;31(20):2500767, CC BY 4.0. DOI:")}{" "}
          <a href={WIJBURG_BRON_DOI} target="_blank" rel="noopener noreferrer" style={{ color: STZ.rood, fontWeight: 700, textDecoration: "underline" }}>10.2807/1560-7917.ES.2026.31.20.2500767</a>.</>],
        ["Universiteit Utrecht — proefschrift Wijburg (2026)", <>{T("Proefschrift over het verbeteren van de nationale surveillance van teken en wild, inclusief ruimtelijke risicoanalyses en monitoring van teken en tekenoverdraagbare ziekteverwekkers in Nederland. Website:")}{" "}
          <a href="https://dspace.library.uu.nl/items/3c53a0e1-848b-4ab4-aa5d-d38bbff85b4a" target="_blank" rel="noopener noreferrer" style={{ color: STZ.rood, fontWeight: 700, textDecoration: "underline" }}>dspace.library.uu.nl</a>.</>],
        ["Universiteit Utrecht, faculteit Diergeneeskunde — dossier Zoönosen", <>{T("Achtergronddossier van de faculteit Diergeneeskunde over zoönosen, waaronder teken en tekenbeetziekten. Website:")}{" "}
          <a href="https://www.uu.nl/organisatie/faculteit-diergeneeskunde/nieuws-agenda/achtergrond/dossiers/zoonosen" target="_blank" rel="noopener noreferrer" style={{ color: STZ.rood, fontWeight: 700, textDecoration: "underline" }}>www.uu.nl</a>.</>],
        ["ECDC", <>{T("Europees Centrum voor ziektepreventie en -bestrijding: verspreiding van TBE en CCHF in Europa en de opmars van de Hyalomma-reuzenteek. Website:")}{" "}
          <a href="https://www.ecdc.europa.eu/en/disease-vectors/facts/tick-factsheets" target="_blank" rel="noopener noreferrer" style={{ color: STZ.rood, fontWeight: 700, textDecoration: "underline" }}>www.ecdc.europa.eu</a>.</>],
        ["DWHC (Dutch Wildlife Health Centre)", <>{T("Nationale reeënsurveillance en de overzichtskaart van het TBE-virus in Nederland; onderbouwt de TBE-markering en de TBE-meldingen. Website:")}{" "}
          <a href="https://dwhc.nl/ziekten/teken-encefalitis/" target="_blank" rel="noopener noreferrer" style={{ color: STZ.rood, fontWeight: 700, textDecoration: "underline" }}>dwhc.nl</a>.</>],
        ["Erasmus MC (Viroscience)", <>{T("Referentiediagnostiek en onderzoek naar het TBE-virus bij mens en teek. Website:")}{" "}
          <a href="https://www.erasmusmc.nl/nl-nl/research/departments/viroscience" target="_blank" rel="noopener noreferrer" style={{ color: STZ.rood, fontWeight: 700, textDecoration: "underline" }}>www.erasmusmc.nl</a>.</>],
        ["LabMicTA", <>{T("Regionaal laboratorium voor medische microbiologie: diagnostiek van TBE en andere tekenbeetziekten in Oost-Nederland. Website:")}{" "}
          <a href="https://www.labmicta.nl" target="_blank" rel="noopener noreferrer" style={{ color: STZ.rood, fontWeight: 700, textDecoration: "underline" }}>www.labmicta.nl</a>.</>],
        ["Artemis One Health", <>{T("Onderzoek naar zoönotische en tekenoverdraagbare virussen, waaronder TBE, bij mens, dier en teek. Website:")}{" "}
          <a href="https://www.artemisonehealth.com" target="_blank" rel="noopener noreferrer" style={{ color: STZ.rood, fontWeight: 700, textDecoration: "underline" }}>www.artemisonehealth.com</a>.</>],
      ] as const).map(([l, w], i, arr) => (
        <div key={l} style={{ display: "flex", flexWrap: "wrap", gap: 4, padding: "5px 0", borderBottom: i === arr.length - 1 ? "none" : `1px solid ${STZ.lijn}` }}>
          <div style={{ flex: "1 1 130px", fontSize: 10, fontWeight: 800, color: STZ.rood }}>{T(l)}</div>
          <div style={{ flex: "2 1 180px", fontSize: 10, lineHeight: 1.5, color: STZ.tekst }}>{w}</div>
        </div>
      ))}
      <p style={{ marginTop: 8, marginBottom: 0, color: STZ.tekst, fontSize: 9.5, lineHeight: 1.5 }}>
        {T("Openbare cijfers en meldingen zijn per provincie en gebiedstype (bos, duin, heide, stedelijk groen, parken, recreatieterreinen, sportvelden) samengevat en vertaald naar risicocategorieën van zeer laag tot zeer hoog. Cijfers verschillen per jaar, seizoen en gebied en niet elke tekenbeet of ziektegeval wordt gemeld. De weergave is een indicatie en geen medische diagnose of exacte meting.")}
      </p>
    </>],
    ["Wat betekenen de landelijke cijfers (Landelijk) en waar komen ze vandaan?", <>
      <p style={{ margin: "0 0 6px" }}>
        Het tabblad <strong>Landelijk</strong> en het landelijke overzicht bovenaan de provinciepagina tonen de cijfers voor
        heel Nederland. Ze worden live herberekend uit de twaalf provinciecijfers in onze database; als een provincie geen
        actueel cijfer heeft, geldt de laatst gepubliceerde waarde.
      </p>
      <ul style={{ margin: "0 0 6px", paddingLeft: 16 }}>
        <li><strong>Waarschuwingsbanner:</strong> in élke provincie kunt u een tekenbeet oplopen. De banner staat er
          bewust altijd, ook bij een laag risiconiveau, omdat een lage klasse geen veilige plek betekent. Doe na ieder
          bezoek in het groen een tekencheck.</li>
        <li><strong>Risiconiveau ({RISK_LBL[land.gemRisk] ?? "—"}):</strong> een vaste landelijke contextcategorie, geen gemiddelde van de twaalf provincieklassen.
          De provincieklassen volgen automatisch uit het aantal meldingen per 100.000 inwoners (CBS-inwonertal), aangevuld
          met habitatgegevens. TBE-meldingen wegen niet mee. Het is een indicatie op basis van meldingen en onderzoek, geen meting.</li>
        <li><strong>Tekenbeten per jaar (± {nlGetal(land.totaalBeten)}):</strong> de som van de provinciecijfers. Het RIVM
          schat het landelijke aantal op ongeveer 1,5 miljoen tekenbeten per jaar.</li>
        <li><strong>Meldingen op Tekenradar{land.totaalMeldingen > 0 ? ` (${nlGetal(land.totaalMeldingen)})` : ""}:</strong>{" "}
          publieksmeldingen via Tekenradar (RIVM en Wageningen University &amp; Research). Niet elke tekenbeet wordt gemeld,
          dus dit is een ondergrens.</li>
        <li><strong>TBE-jaarcijfers{land.totaalTbe > 0 ? ` (${land.totaalTbe} gevallen)` : ""}:</strong> tekenencefalitis is
          meldingsplichtig; het RIVM en de LCI publiceren de bevestigde meldingen per jaar. TBE bepaalt de markering op de
          kaart op basis van gepubliceerde lokale aanwijzingen; meldingen naar woonprovincie wegen niet mee in de provincieklasse.</li>
      </ul>
      <p style={{ margin: "0 0 6px" }}>
        In het tabblad <strong>Landelijk</strong> vindt u onder <strong>Vergelijking met RIVM</strong> onze cijfers naast de
        uitgangspunten van het RIVM en de LCI, plus de omschrijving van elk risiconiveau en de automatisch berekende
        klassegrenzen.
      </p>
      <p style={{ margin: 0 }}>
        Bronnen: RIVM, LCI-richtlijnen, Tekenradar, CBS (inwonertal), Wijburg et al. (2026, Eurosurveillance),
        Universiteit Utrecht (proefschrift Wijburg 2026 en dossier Zoönosen), Stichting Tekenbeetziekten en de Lymevereniging.
      </p>
    </>],
    ["Verantwoordelijkheid: waarvoor is de website en web-app wel en niet bedoeld?", <>

      De TekenRisicoKaart is ontwikkeld als informatieve toepassing voor het in kaart brengen en visualiseren van het
      risico op tekenbeten. De informatie in de website en web-app is bedoeld als ondersteuning en vervangt geen medisch advies,
      diagnose of behandeling door een arts of andere gekwalificeerde zorgprofessional.
      <br /><br />
      De gebruiker blijft zelf verantwoordelijk voor de wijze waarop de informatie uit de website en web-app wordt gebruikt. Bij
      gezondheidsklachten of vragen over een tekenbeet wordt geadviseerd contact op te nemen met een huisarts of
      andere bevoegde zorgprofessional.
    </>],
  ];

  return (
    <div style={{ padding: 12 }}>

      <div style={{ marginBottom: 10 }}>
        <div style={{ position: "relative" }}>
          <input
            type="search"
            value={zoek}
            onChange={(e) => setZoek(e.target.value)}
            placeholder={T("Zoek in Help op ziekte, thema of trefwoord")}
            aria-label={T("Zoek in Help op ziekte, thema of trefwoord")}
            style={{ width: "100%", boxSizing: "border-box", padding: "8px 30px 8px 10px", fontSize: 11, fontFamily: "inherit", color: STZ.tekst, background: "#fff", border: `1px solid ${STZ.lijn}`, borderRadius: 8, outlineColor: STZ.terra }}
          />
          <span style={{ position: "absolute", right: 9, top: "50%", transform: "translateY(-50%)", fontSize: 13, color: STZ.rood, pointerEvents: "none" }}>⌕</span>
        </div>

        {zoek.trim() !== "" && (resultaten.length > 0 ? (
          <div aria-live="polite" style={{ marginTop: 6, background: STZ.creme, border: `1px solid ${STZ.lijn}`, borderRadius: 8, padding: "8px 10px" }}>
            <div style={{ fontSize: 9.5, fontWeight: 800, color: STZ.rood, marginBottom: 5 }}>
              <span>{T("Gevonden onderwerpen — klik om er naartoe te gaan")}</span> <span>({resultaten.length})</span>
            </div>

            <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
              {resultaten.map((r) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => gaNaar(r.id)}
                  title={r.sectie}
                  aria-current={r.id === actiefId ? "true" : undefined}
                  style={{ fontSize: 9.5, fontFamily: "inherit", textAlign: "left", color: r.id === actiefId ? "#fff" : STZ.tekst, background: r.id === actiefId ? STZ.rood : "#fff", border: `1px solid ${r.id === actiefId ? STZ.rood : STZ.lijn}`, fontWeight: r.id === actiefId ? 800 : 400, borderRadius: 999, padding: "4px 9px", cursor: "pointer" }}
                >
                  {r.titel}
                </button>
              ))}
            </div>
          </div>

        ) : (
          <div
            aria-live="polite"
            style={{ marginTop: 6, background: STZ.creme, border: `1px solid ${STZ.rood}`, borderRadius: 8, padding: "9px 11px" }}
          >
            <div style={{ fontSize: 10.5, fontWeight: 800, color: STZ.rood, marginBottom: 3 }}>
              {T("Geen Help-onderwerpen gevonden")}
            </div>
            <p style={{ fontSize: 10, lineHeight: 1.55, color: STZ.tekst, margin: "0 0 6px" }}>
              {T("Er zijn geen Help-secties die overeenkomen met uw zoekterm. Probeer een ander of korter trefwoord.")}
            </p>
            <div style={{ fontSize: 9.5, fontWeight: 800, color: STZ.tekst, marginBottom: 4 }}>
              {T("Voorbeeldzoektermen:")}
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
              {VOORBEELD_ZOEKTERMEN.map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setZoek(v)}
                  style={{ fontSize: 9.5, fontFamily: "inherit", color: STZ.tekst, background: "#fff", border: `1px solid ${STZ.lijn}`, borderRadius: 999, padding: "3px 8px", cursor: "pointer" }}
                >
                  {T(v)}
                </button>
              ))}
            </div>
          </div>


        ))}

      </div>

      <div ref={inhoudRef}>


      <div style={kaart}>
        <h4 style={kop}>{T("Medische disclaimer")}</h4>
        <p style={tekst}>
          {T("Deze website en web-app geeft algemene voorlichting op basis van openbare cijfers en data van de hieronder vermelde partijen. Het is geen medisch advies en geen persoonlijke risicobeoordeling. Heeft u een rode ring of vlek, koorts of andere klachten na een tekenbeet? Neem contact op met uw huisarts.")}
        </p>
      </div>

      <div style={kaart}>
        <h4 style={kop}>{T("Over deze website en web-app")}</h4>
        <p style={tekst}>
          {T("De TekenRisicoKaart laat zien waar en wanneer in Nederland het risico op teken en tekenbeetziekten het grootst is.")}
        </p>
        <p style={{ ...tekst, marginTop: 6 }}>
          {T("Doel: mensen bewust maken van het tekenrisico in hun eigen omgeving, uitleggen welke tekenbeetziekten er zijn en helpen om een tekenbeet te voorkomen en op tijd te herkennen.")}
        </p>
        <p style={{ ...tekst, marginTop: 6 }}>
          {T("De website en web-app is volledig dynamisch: het ontwerp past zich automatisch aan het scherm aan en werkt op alle schermformaten — smartphone, tablet, laptop en groot beeldscherm. Kaart, knoppen en tekst schalen mee, zodat alles altijd leesbaar en bedienbaar blijft, zowel staand als liggend.")}
        </p>
        <p style={{ ...tekst, marginTop: 6 }}>
          {T("U kunt u scherm ook kantelen: draai uw telefoon of tablet een kwartslag naar liggend (landschap) en de website past de indeling automatisch aan. In liggende stand is de kaart breder en ziet u meer van Nederland in één oogopslag; in staande stand leest u de lijsten, panelen en teksten prettiger. Alle functies — zoeken, provincies aanklikken, TBE-meldingen en de risicolagen per tekenbeetziekte — blijven in beide standen volledig werken. Staat het beeld niet mee te draaien, controleer dan of de schermrotatie-vergrendeling van uw toestel uit staat.")}
        </p>

      </div>

      <div style={kaart}>
        <h4 style={kop}>{T("Compatibiliteit")}</h4>
        <p style={tekst}>
          {T("De TekenRisicoKaart is ontworpen voor vrijwel elk gangbaar apparaat, besturingssysteem en browser. U hoeft niets te installeren: de website en web-app werkt direct in uw browser.")}
        </p>
        <p style={{ ...tekst, marginTop: 6 }}>
          <strong>{T("Besturingssystemen:")}</strong> {T("iOS (iPhone / iPad), Android, Windows, macOS en ChromeOS. De web-app past zich aan de mogelijkheden van uw systeem aan en gebruikt alleen standaard webtechnieken.")}
        </p>
        <p style={{ ...tekst, marginTop: 6 }}>
          <strong>{T("Browsers:")}</strong> {T("moderne versies van Safari, Chrome, Microsoft Edge, Firefox, Samsung Internet en Brave. Gebruikt u een oudere browser of een browser met strikte blokkeerinstellingen, dan kan het uiterlijk of een enkele functie afwijken.")}
        </p>
        <p style={{ ...tekst, marginTop: 6 }}>
          <strong>{T("Schermformaten en devices:")}</strong> {T("smartphone, tablet, laptop, desktop en groot beeldscherm. Op een klein scherm ziet u de informatie in een gestapelde weergave, op een groter scherm naast elkaar. Kaart, panelen, knoppen en teksten schalen automatisch mee.")}
        </p>
        <p style={{ ...tekst, marginTop: 6 }}>
          <strong>{T("Staand en liggend:")}</strong> {T("draai uw telefoon of tablet en de indeling verandert mee. In liggende stand is de kaart breder, in staande stand leest u lijsten en teksten prettiger.")}
        </p>
        <p style={{ ...tekst, marginTop: 6 }}>
          <strong>{T("Opmerking:")}</strong> {T("sommige oudere toestellen of verouderde browsers kunnen delen van de web-app trager weergeven. Voor de beste ervaring houdt u uw besturingssysteem en browser up-to-date.")}
        </p>
      </div>

      <div style={kaart}>
        <h4 style={kop}>{T("Web-app op uw startscherm zetten")}</h4>
        <p style={{ ...tekst, marginBottom: 8 }}>
          {T("Voor een snellere ervaring op uw mobiel kunt u de TekenRisicoKaart aan uw startscherm toevoegen. Het werkt net als een standaard-app en kost maar een paar stappen.")}
        </p>
        {([["iOS (iPhone / iPad)", ["Open Safari en ga naar tekenrisicokaart.nl.", "Tik op het deelpictogram.", "Tik op 'Zet op beginscherm' (Toevoegen aan startscherm).", "Start de TekenRisicoKaart vanaf uw startscherm en geniet ervan."]],
           ["Android", ["Open Chrome en ga naar tekenrisicokaart.nl.", "Tik op het menu met de drie puntjes.", "Tik op 'Toevoegen aan startscherm'.", "Start de TekenRisicoKaart vanaf uw startscherm en geniet ervan."]]] as const).map(([titel, stapjes]) => (
          <div key={titel} style={{ marginBottom: 8 }}>
            <div style={{ fontSize: 10.5, fontWeight: 800, color: STZ.rood, marginBottom: 4 }}>{titel}</div>
            {stapjes.map((s, i) => (
              <div key={s} style={{ display: "flex", gap: 7, marginBottom: 4 }}>
                <span style={{ flexShrink: 0, width: 15, height: 15, borderRadius: "50%", background: STZ.terra, color: "#fff", fontSize: 8.5, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center" }}>{i + 1}</span>
                <div style={{ fontSize: 10, lineHeight: 1.5, color: STZ.tekst }}>{T(s)}</div>
              </div>
            ))}
          </div>
        ))}
        <p style={{ fontSize: 9.5, lineHeight: 1.5, color: STZ.tekst }}>
          {T("Gebruik het webadres waarop u de website en web-app nu bekijkt. De website en web-app opent daarna in een eigen venster, zonder adresbalk.")}
        </p>
      </div>

      <div style={kaart}>
        <h4 style={kop}>{T("Zo werkt het")}</h4>
        {stappen.map(([t, d], i) => (
          <div key={t} style={{ display: "flex", gap: 7, marginBottom: i === stappen.length - 1 ? 0 : 7 }}>
            <span style={{ flexShrink: 0, width: 15, height: 15, borderRadius: "50%", background: STZ.terra, color: "#fff", fontSize: 8.5, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center" }}>{i + 1}</span>
            <div>
              <div style={{ fontSize: 10.5, fontWeight: 700, color: STZ.rood }}>{T(t)}</div>
              <div style={{ fontSize: 10, lineHeight: 1.5, color: STZ.tekst }}>{T(d)}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={kaart}>
        <h4 id="help-assistent" style={kop}>{T("Assistent")}</h4>
        <p style={{ ...tekst, marginBottom: 7, color: STZ.tekst, fontSize: 10 }}>
          {T("De assistent is een wegwijzer binnen de websites en web-apps. Hij geeft uitleg over de kaart, de cijfers, de bronnen, de privacyregels, TekenbeetGids en het intrekformulier. De assistent beoordeelt uw persoonlijke situatie niet en is geen medisch advies.")}
        </p>
        {[
          ["Waar vindt u de assistent?", "Het knopje met een spraakballonnetje zweeft rechtsonder in beeld. Zowel op TekenRisicoKaart als in TekenbeetGids opent u daarmee hetzelfde venster."],
          ["Twee manieren van vragen", "Kiest u 'Onderwerpen', dan opent u eerst een onderwerp en daarna een van de bijbehorende vragen; het gecontroleerde antwoord staat klaar met een koppeling naar de relevante pagina. Kiest u 'Vraag stellen', dan typt u zelf een vraag."],
          ["Gecontroleerde website-informatie", "De assistent antwoordt uitsluitend met vooraf gecontroleerde informatie over deze websites. Hij zoekt niet op internet, voegt geen informatie uit andere bronnen toe en schrijft geen eigen medische teksten."],
          ["Geen medische beoordeling", "De assistent beoordeelt geen klachten, foto's, infectiekansen of behandelingen en stelt geen diagnose. Medische vragen krijgen een vast antwoord waarin de assistent aangeeft dat hij die niet kan beantwoorden."],
          ["Vrije vraag: eerst toestemming", "Voordat u een eigen vraag typt, verschijnt een toelichting met de knop 'Akkoord en vraag stellen'. Pas na uw akkoord opent het vraagveld. De tekst van het gesprek wordt dan extern verwerkt via Google AI Studio / Gemini API om een gecontroleerd website-antwoord te kiezen."],
          ["Geen gespreksopslag", "De app bewaart het gesprek niet. Sluit u de assistent, dan is het gesprek weg. Externe bewaartermijnen van de AI-leverancier zijn niet bevestigd."],
          ["Geen persoonlijke of medische gegevens", "Typ geen naam, adres, deelnemercodes, klachten, diagnoses of medicatie in de vraag. De assistent heeft ook geen toegang tot uw ingevulde gidsantwoorden, foto's of onderzoeksgegevens."],
          ["Geen antwoord is geen gok", "Staat er geen gecontroleerd antwoord op uw vraag, dan zegt de assistent dat. Hij vult niets aan uit eigen kennis of van internet."],
          ["Links openen apart", "Een koppeling in een antwoord opent in een apart tabblad, zodat het gesprek intact blijft."],
          ["Taal", "De assistent volgt de taalkeuze van de website of web-app: Nederlands of Engels."],
        ].map(([t, d], i, a) => (
          <div key={t} style={{ marginBottom: i === a.length - 1 ? 0 : 6 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: STZ.rood }}>{T(t ?? "")}</div>
            <div style={{ fontSize: 9.5, lineHeight: 1.5, color: STZ.tekst }}>{T(d ?? "")}</div>
          </div>
        ))}
        <p style={{ ...tekst, marginTop: 8, color: STZ.tekst, fontSize: 9.5 }}>
          {T("Onder in het venster staat: gecontroleerde website-informatie · geen medische beoordeling · geen gespreksopslag.")}
        </p>
      </div>

      <div style={kaart}>
        <h4 style={kop}>{T("Landelijk")}</h4>

        <p style={{ ...tekst, marginBottom: 7, color: STZ.tekst, fontSize: 10 }}>
          {T("In het tabblad Landelijk ziet u de situatie voor heel Nederland in één oogopslag. De cijfers worden herberekend uit de twaalf provinciecijfers, met de RIVM-schatting als landelijke referentie.")}
        </p>
        {[
          ["Risiconiveau", "Het landelijke risiconiveau is Hoog. Dit is de nationale weergave; individuele provincies kunnen een lager of hoger niveau hebben."],
          ["Waarschuwing", "In élke provincie loopt u het risico op een tekenbeet. Blijf altijd alert en controleer uzelf na een bezoek in het groen altijd op teken."],
          ["Tekenbeten per jaar", "Het geschatte aantal tekenbeten in heel Nederland, opgebouwd uit de provinciecijfers. Het RIVM schat landelijk ongeveer 1,5 miljoen tekenbeten per jaar."],
          ["Tekenradar-meldingen", "Het totaal aantal publieksmeldingen via Tekenradar (RIVM en Wageningen University & Research). Dit is een ondergrens: niet elke tekenbeet wordt gemeld."],
          ["TBE-jaarcijfers", "Het aantal gemelde TBE-meldingen naar woonprovincie: Nederland. TBE is meldingsplichtig; het RIVM en de LCI publiceren de bevestigde gevallen per jaar."],
          ["Tekenbeetziekten", "Alle 11 tekenbeetziekten worden onder elkaar getoond met de ziektekleur, korte symptoomomschrijving en het landelijke risico."],
          ["Tekensoorten en habitat", "Welke tekensoorten in Nederland voorkomen, waar ze leven (bos, duin, heide, park, tuin) en wanneer ze actief zijn."],
          ["Preventie", "Algemene adviezen om tekenbeten te voorkomen, zoals laarzen, lichte kleding, controle na het groen en het juist verwijderen van een teek."],
          ["Vergelijking met RIVM", "In het tweede tabblad binnen Landelijk staan onze cijfers naast de RIVM/LCI-uitgangspunten, inclusief de uitleg van elk risiconiveau."],
          ["Bronnen", "RIVM, LCI-richtlijnen, Tekenradar, CBS (inwonertal), Wijburg et al. (2026, Eurosurveillance), Universiteit Utrecht (proefschrift Wijburg 2026 en dossier Zoönosen), Stichting Tekenbeetziekten en de Lymevereniging."],
        ].map(([t, d], i, a) => (
          <div key={t} style={{ marginBottom: i === a.length - 1 ? 0 : 6 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: STZ.rood }}>{T(t ?? "")}</div>
            <div style={{ fontSize: 9.5, lineHeight: 1.5, color: STZ.tekst }}>{T(d ?? "")}</div>
          </div>
        ))}
      </div>

      <div style={kaart}>
        <h4 style={kop}>{T("Provincies")}</h4>
        <p style={{ ...tekst, marginBottom: 7, color: STZ.tekst, fontSize: 10 }}>
          {T("In de tab Provincies kiest u een provincie in de lijst, klikt u hem aan op de kaart of zoekt u een plaatsnaam — de website en web-app koppelt daar zelf de gemeente en provincie aan. Het provinciepaneel toont:")}
        </p>
        {[
          ["Risiconiveau", "Het algemene risico in die provincie, van Zeer laag tot Zeer hoog, met korte toelichting."],
          ["Groen-indicatie", "Hoeveel bos en natuur de provincie heeft in vergelijking met alle gemeenten, van Zeer weinig tot Zeer veel. De kleuren lopen van licht naar donkergroen: hoe donkergroener, hoe meer bos en natuur. Berekend uit de CBS-bodemgebruikcijfers van alle gemeenten in de provincie; het is geen gemeten tekendichtheid."],
          ["Risicogebieden", "De typische gebieden waar u in die provincie teken tegenkomt: bos, duinen, heide, beekdalen, landgoederen."],
          ["Stedelijk gebied", "Openbaar groen, parken, tuinen, recreatieterreinen, sportvelden en volkstuinen in die provincie."],
          ["Tekenbeetziekten", "Welke tekenbeetziekten in de provincie voorkomen en welke tekensoorten er leven."],
          ["TBE-meldingen", "Het aantal gemelde TBE-gevallen per jaar en het verloop in die provincie zelf, met de stippen van bekende vindplaatsen op de kaart. Gevallen worden geteld naar woonprovincie; de besmetting kan elders in Nederland of in het buitenland zijn opgelopen."],
          ["Tekenmeldingen", "Of er in die provincie bevestigde meldingen van Vlekkenteek of Reuzenteek bekend zijn, met icoontjes met D (Vlekkenteek) of H (Reuzenteek) in de lijst en het paneel."],
          ["Preventie algemeen", "De algemene stappen om een tekenbeet te voorkomen en op tijd te herkennen."],
          ["Meer weten", "Doorverwijzing naar Stichting Tekenbeetziekten, de Lymevereniging en Tekenradar.nl."],
        ].map(([t, d], i, a) => (
          <div key={t} style={{ marginBottom: i === a.length - 1 ? 0 : 6 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: STZ.rood }}>{T(t ?? "")}</div>
            <div style={{ fontSize: 9.5, lineHeight: 1.5, color: STZ.tekst }}>{T(d ?? "")}</div>
            {t === "Groen-indicatie" && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 4, margin: "4px 0 3px" }}>
                {[1, 2, 3, 4, 5].map((k) => (
                  <span key={k} style={{ fontSize: 9, fontWeight: 700, padding: "1px 7px", borderRadius: 99, background: GROEN_KLEUREN[k], color: k >= 4 ? "#fff" : "#123A52" }}>{(en ? ["", "Very little", "Little", "Average", "Much", "Very much"] : ["", "Zeer weinig", "Weinig", "Gemiddeld", "Veel", "Zeer veel"])[k]}</span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      <div style={kaart}>
        <h4 style={kop}>{T("Gemeenten")}</h4>
        <p style={{ ...tekst, marginBottom: 7, color: STZ.tekst, fontSize: 10 }}>
          {T("In de tab Gemeenten zoekt u een gemeente of plaats op naam. Typ een naam in het zoekvak en kies uit de suggesties; u kunt ook op een gemeentegrens op de kaart tikken. De kaart toont alle 342 gemeentegrenzen (CBS 2025) en springt naar de gekozen gemeente. Het gemeentepaneel toont:")}
        </p>
        {[
          ["Cijfers van deze gemeente", "Inwoners en landoppervlakte (CBS 2024), het aandeel bos en natuur en de parken, sport- en recreatieterreinen (CBS 2022)."],
          ["Groen-indicatie", "Hoe de gemeente scoort op bos en natuur in vergelijking met alle andere gemeenten, van Zeer weinig tot Zeer veel. De kleuren lopen van licht naar donkergroen: hoe donkergroener, hoe meer bos en natuur. Meer groen betekent doorgaans meer teken."],
          ["TBE-meldingen", "Bekende TBE-vindplaatsen in deze gemeente of net erbuiten, met een rood TBE-label in de lijst en stippen op de kaart. Eén stip is niet één geval: TBE-gevallen worden niet per gemeente gepubliceerd, want het RIVM telt patiënten naar woonprovincie."],
          ["Tekenmeldingen", "Of er in of bij de gemeente bevestigde meldingen van Vlekkenteek of Reuzenteek bekend zijn, met icoontjes met D (Vlekkenteek) of H (Reuzenteek) in de lijst en het paneel."],
          ["Provinciegegevens", "De ziektecijfers (Lyme en andere tekenbeetziekten) blijven per provincie, omdat het RIVM die niet per gemeente bekendmaakt. Via de knop gaat u naar het volledige provinciepaneel."],
        ].map(([t, d], i, a) => (
          <div key={t} style={{ marginBottom: i === a.length - 1 ? 0 : 6 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: STZ.rood }}>{T(t ?? "")}</div>
            <div style={{ fontSize: 9.5, lineHeight: 1.5, color: STZ.tekst }}>{T(d ?? "")}</div>
            {t === "Groen-indicatie" && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 4, margin: "4px 0 3px" }}>
                {[1, 2, 3, 4, 5].map((k) => (
                  <span key={k} style={{ fontSize: 9, fontWeight: 700, padding: "1px 7px", borderRadius: 99, background: GROEN_KLEUREN[k], color: k >= 4 ? "#fff" : "#123A52" }}>{(en ? ["", "Very little", "Little", "Average", "Much", "Very much"] : ["", "Zeer weinig", "Weinig", "Gemiddeld", "Veel", "Zeer veel"])[k]}</span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      <div style={kaart}>
        <h4 style={kop}>{T("Tekenmeldingen")}</h4>
        <p style={{ ...tekst, marginBottom: 7, color: STZ.tekst, fontSize: 10 }}>
          {T("In de tab Tekenmeldingen toont u bevestigde, historische vondsten van twee bijzondere tekensoorten: de Vlekkenteek (Dermacentor reticulatus, paarse stippen) en de Reuzenteek (Hyalomma marginatum, blauwe stippen). De vondsten komen uit NVWA/RIVM-publicaties met aanvullend wetenschappelijk onderzoek. Het is geen volledig of live overzicht: een stip staat niet voor ziektegevallen of actuele tekendichtheid en locaties zijn bij benadering.")}
        </p>
        <div style={{ marginBottom: 6 }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: STZ.rood }}>{T("Wat betekenen de stippen op de kaart?")}</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "4px 10px", margin: "4px 0 5px" }}>
            {([
              ["D", "var(--tick-dermacentor)", en ? "Ornate dog tick (D)" : "Vlekkenteek (D)"],
              ["H", "var(--tick-hyalomma)", en ? "Giant tick (H)" : "Reuzenteek (H)"],
            ] as const).map(([letter, bg, naam]) => (
              <span key={letter} style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 9.5, color: STZ.tekst }}>
                <span aria-hidden="true" style={{ width: 14, height: 14, borderRadius: "50%", background: bg, border: "1px solid rgba(255,255,255,.7)", color: "#fff", fontSize: 8, fontWeight: 800, display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{letter}</span>
                {naam}
              </span>
            ))}
            <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 9.5, color: STZ.tekst }}>
              <span aria-hidden="true" style={{ width: 14, height: 14, borderRadius: "50%", background: "#A63428", border: "1px solid rgba(255,255,255,.7)", flexShrink: 0 }} />
              {T("Bekende TBE-vindplaats")}
            </span>
          </div>
          <ul style={{ margin: "2px 0 0", paddingLeft: 13, listStyleType: "disc" }}>
            {[
              "Een paarse stip met D is een Vlekkenteek en een blauwe stip met H is een Reuzenteek.",
              "Eén stip is één bevestigde, historische vondst op die plek: geen aantal teken, geen ziektegeval en geen maat voor hoeveel teken er nu lopen.",
              "De positie is bij benadering, vaak op gemeenteniveau, en vindplaatsen binnen dezelfde gemeente zijn samengevoegd tot één stip.",
              "Tik op een stip voor de melding met bronlabel en bronlink; de vinkjes bij de tekensoorten bepalen welke stippen u ziet.",
              "Een icoontje met D (Vlekkenteek) of H (Reuzenteek) in de lijsten bij Provincies en Gemeenten betekent dat daar een bekende melding is.",
              "Een melding zonder stip, zoals de zuidwestelijke kustgebieden, noemt geen losse vindplaatsen en is daarom niet als stip getoond.",
              "Rode TBE-stippen zijn iets anders: die tonen bekende TBE-vindplaatsen en geen meldingen van deze twee soorten.",
            ].map((s) => <li key={s} style={{ fontSize: 9.5, lineHeight: 1.5, color: STZ.tekst, marginBottom: 3 }}>{T(s)}</li>)}
          </ul>
        </div>
        {[
          ["Waarom melden bij de NVWA?", "Het Centrum Monitoring Vectoren van de NVWA brengt in kaart waar deze twee soorten voorkomen, zodat de gezondheid van mensen en dieren zo goed mogelijk beschermd kan worden. De verspreiding van teken verandert door internationale handel, reizen en klimaatverandering. De Vlekkenteek is in Nederland gevestigd en breidt zich uit; de Reuzenteek is niet gevestigd en wordt meestal meegelift op trekvogels of geïmporteerde dieren aangetroffen. Meldingen geven vroeg zicht op nieuwe plekken en op mogelijke vestiging."],
          ["Zelf zo'n teek gevonden?", "Ziet u een teek die lijkt op een Vlekkenteek of Reuzenteek? Meld hem bij de NVWA via het meldformulier vectoren; in de tab Tekenmeldingen staat bij elke tekensoort de meldlink."],
        ].map(([t, d], i, a) => (
          <div key={t} style={{ marginBottom: i === a.length - 1 ? 0 : 6 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: STZ.rood }}>{T(t ?? "")}</div>
            <div style={{ fontSize: 9.5, lineHeight: 1.5, color: STZ.tekst }}>{T(d ?? "")}</div>
          </div>
        ))}
        <p style={{ fontSize: 9.5, lineHeight: 1.5, color: STZ.tekst, marginTop: 6 }}>
          {T("Meld een reuzenteek of vlekkenteek bij de NVWA:")}{" "}
          <a href={NVWA_MELD_URL} target="_blank" rel="noopener noreferrer" style={{ color: STZ.rood, fontWeight: 700, textDecoration: "underline" }}>{T("meldformulier vectoren")}</a>
        </p>
      </div>

      <div style={kaart}>
        <h4 style={kop}>{T("Risico's per tekenbeetziekte op de kaart tonen")}</h4>
        {[
          "Tik in de knoppenbalk op Risico's per Tekenbeetziekte.",
          "Kies bovenin een tekenbeetziekte, bijvoorbeeld Lyme, Anaplasmose of TBE.",
          "De kaart kleurt direct mee: elke provincie krijgt de kleur van het risiconiveau voor díe ziekte.",
          "De legenda onder de kaart laat zien welke kleur bij welk risiconiveau hoort (Zeer laag tot Zeer hoog).",
          "Klik op een provincie op de kaart voor het risico, de risicogebieden, het stedelijk groen en de tekensoorten.",
          "Tik de gekozen ziekte nogmaals aan om terug te gaan naar de algemene risicokaart.",
        ].map((d, i, a) => (
          <div key={i} style={{ display: "flex", gap: 7, marginBottom: i === a.length - 1 ? 0 : 6 }}>
            <span style={{ flexShrink: 0, width: 15, height: 15, borderRadius: "50%", background: STZ.rood, color: "#fff", fontSize: 8.5, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center" }}>{i + 1}</span>
            <div style={{ fontSize: 10, lineHeight: 1.5, color: STZ.tekst }}>{T(d)}</div>
          </div>
        ))}
      </div>


      
      <div style={kaart}>
        <h4 id="help-kaartkleuren" style={kop}>{T("Risicoaanduidingen en categorieën")}</h4>
        <p style={{ ...tekst, marginBottom: 7, color: STZ.terra, fontSize: 10, fontWeight: 700 }}>{T(GEBIEDSINDICATIE_ZIN)}</p>
        <p style={{ ...tekst, marginBottom: 7, color: STZ.tekst, fontSize: 10 }}>
          {T("Elke provincie en aandoening krijgt een relatieve risico-indicatie: Zeer laag, Laag, Matig, Hoog of Zeer hoog. De categorie Geen wordt alleen gebruikt voor CCHF, omdat die ziekte in Nederland niet is aangetoond. De provincieklasse vergelijkt genormaliseerde meldingen, habitat; zij meet geen tekendichtheid of individuele infectiekans en is geen medische diagnose.")}
        </p>
        {[0, 1, 2, 3, 4, 5].map((r) => (
          <div key={r} style={{ display: "flex", gap: 7, alignItems: "flex-start", marginBottom: r === 5 ? 0 : 6 }}>
            <span style={{ flexShrink: 0, fontSize: 8, fontWeight: 800, color: "#fff", background: RISK[r], borderRadius: 4, padding: "2px 5px", minWidth: 52, textAlign: "center" }}>{T(RISK_LBL[r] ?? "")}</span>
            <span style={{ fontSize: 9.5, lineHeight: 1.5, color: STZ.tekst }}>{T(RISK_UITLEG[r] ?? "")}</span>
          </div>
        ))}

        <div style={{ marginTop: 8, fontSize: 9.5, lineHeight: 1.5, color: STZ.tekst }}>
          <strong style={{ color: STZ.rood }}>{T("Besmettingsgraad")}</strong> {T("geeft aan welk deel van de teken de verwekker bij zich draagt: Zeer laag (<1%), Laag (1–3%), Matig (3–10%), Hoog (10–20%) en Zeer hoog (>20%).")}
        </div>
        <div style={{ marginTop: 8, fontSize: 9.5, lineHeight: 1.5, color: STZ.tekst }}>
          <strong style={{ color: STZ.rood }}>{T("Hoe de klassen tot stand komen")}</strong><br />
          {T(RISICO_TOELICHTING)}
        </div>

        <div style={{ marginTop: 10, fontSize: 9.5, lineHeight: 1.5, color: STZ.tekst }}>
          <strong style={{ color: STZ.rood }}>{T("Databron, rekeneenheid en klassengrenzen")}</strong>
          <ul style={{ margin: "5px 0 0", paddingLeft: 15 }}>
            {KLASSE_METHODE.map((t) => (<li key={t} style={{ marginBottom: 4 }}>{T(t)}</li>))}
          </ul>
          <KlasseUitleg />
          <div style={{ marginTop: 6 }}>{T("Bronnen automatisch gecontroleerd")}: {peildatum} · {T("Website-inhoud bijgewerkt")}: {laatstBijgewerkt} · {T("Peildatum")} {DATA_PEILDATUM}. {T("Bronnen worden dagelijks automatisch gecontroleerd. De websitebijwerkdatum is geen nieuwe onderzoeksdatum; elke bron behoudt haar eigen meetperiode.")}</div>
        </div>


        <div style={{ marginTop: 10, fontSize: 9.5, lineHeight: 1.5, color: STZ.tekst, border: `1px solid ${STZ.lijn}`, borderRadius: 8, padding: "7px 8px" }}>
          <div>
            <strong style={{ color: STZ.rood }}>{T("Let op meldingsbias:")}</strong> {T("de klasse gebruikt meldingen per 100.000 inwoners, habitat, niet gemeten tekendichtheid. Ook provincies met een lage klasse kunnen lokale hotspots hebben.")}
          </div>
          <div style={{ marginTop: 5 }}>
            {T("Relatieve provincieklasse: Tekenradar-meldingen per 100.000 inwoners, gewogen met habitat. Geen meting of individuele infectiekans; voorlichting, geen medisch advies.")}
          </div>
          <div style={{ marginTop: 5 }}>
            {T("Bronnen automatisch gecontroleerd")}: {peildatum} • {T("Website-inhoud bijgewerkt")}: {laatstBijgewerkt} • {T("Peildatum")} {DATA_PEILDATUM} • {T("Bronnen")}: RIVM/LCI,
            Tekenradar.nl, {T("Staat van Infectieziekten 2024 (RIVM)")}, {WIJBURG_CITATIE}
          </div>

        </div>

      </div>

      <div style={kaart}>
        <h4 style={kop}>{T("Risico's per Tekenbeetziekte")}</h4>
        <p style={{ ...tekst, marginBottom: 7, color: STZ.tekst, fontSize: 10 }}>
          {T("Deze tab draait alleen om risico. Kies een tekenbeetziekte en u ziet achter de naam meteen een risicolabel (Zeer laag, Laag, Matig, Hoog of Zeer hoog; alleen bij CCHF Geen). In het paneel staan:")}
        </p>
        {[
          ["Risico in Nederland", "Het landelijke risiconiveau voor die ziekte."],
          ["% teken", "Het aandeel teken dat de verwekker bij zich draagt."],
          ["Besmettingsgraad", "Wat dat percentage betekent: van Zeer laag (<1%) tot Zeer hoog (>20%)."],
          ["Risico per provincie en gebied", "Per provincie het risiconiveau, de risicogebieden en het stedelijk groen (parken, openbaar groen, recreatieterreinen, sportvelden)."],
          ["Tekensoorten", "Welke teken deze ziekte kunnen overbrengen."],
        ].map(([t, d], i, a) => (
          <div key={t} style={{ marginBottom: i === a.length - 1 ? 0 : 6 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: STZ.rood }}>{T(t ?? "")}</div>
            <div style={{ fontSize: 9.5, lineHeight: 1.5, color: STZ.tekst }}>{T(d ?? "")}</div>
          </div>
        ))}
        <p style={{ ...tekst, marginTop: 7, color: STZ.tekst, fontSize: 9.5 }}>
          {T("De kaart kleurt mee met de gekozen ziekte, zodat u in één oogopslag ziet waar het risico het hoogst is.")}
        </p>
        <p style={{ ...tekst, marginBottom: 0, color: STZ.tekst, fontSize: 9.5 }}>{T("Risicoaanduidingen zijn gebaseerd op meldingen en wetenschappelijke schattingen. Geen medisch advies.")}</p>
      </div>

      <div style={kaart}>
        <h4 style={kop}>{T("TBE-meldingen op de kaart zetten")}</h4>
        {[
          "Tik in de bovenste knoppenbalk op de knop TBE-meldingen.",
          "De knop kleurt aan/uit: staat hij aan, dan verschijnen paarse TBE-markeringen op de kaart bij de provincies met bekende meldingen.",
          "Tik op zo'n paarse markering voor details over de melding.",
          "In de legenda onder de kaart ziet u dan ook het bolletje TBE-melding staan.",
          "Nogmaals op de knop TBE-meldingen tikken zet de markeringen weer uit.",
        ].map((d, i, a) => (
          <div key={i} style={{ display: "flex", gap: 7, marginBottom: i === a.length - 1 ? 0 : 6 }}>
            <span style={{ flexShrink: 0, width: 15, height: 15, borderRadius: "50%", background: "#A63428", color: "#fff", fontSize: 8.5, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center" }}>{i + 1}</span>
            <div style={{ fontSize: 10, lineHeight: 1.5, color: STZ.tekst }}>{T(d)}</div>
          </div>
        ))}
      </div>

      <div style={kaart}>
        <h4 style={kop}>{T("TBE op de kaart")}</h4>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 6 }}>
          <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 9.5, color: STZ.tekst, fontWeight: 700 }}>
            <span style={{ width: 11, height: 11, borderRadius: "50%", background: "#A63428" }} />
            {T(TBE_STATUS_LBL.humaan)}
          </span>
          <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 9.5, color: STZ.tekst, fontWeight: 700 }}>
            <span style={{ width: 11, height: 11, borderRadius: "50%", background: "#fff", border: "1.5px solid #A63428" }} />
            {T(TBE_STATUS_LBL.detectie)}
          </span>
          <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 9.5, color: STZ.tekst, fontWeight: 700 }}>
            <span style={{ width: 11, height: 11, borderRadius: "50%", background: "#fff", border: "1.5px dashed #A63428" }} />
            {T(TBE_STATUS_LBL.geen)}
          </span>
        </div>
        <p style={{ ...tekst, color: STZ.tekst, fontWeight: 600 }}>{T(TBE_CRITERIUM)}</p>
        <p style={{ ...tekst, color: STZ.tekst }}>{T(TBE_LANDELIJK)}</p>
        <p style={{ ...tekst, color: STZ.tekst }}>{T(TBE_HAARDEN_ZIN)}</p>
        <p style={{ ...tekst, color: STZ.tekst }}>{tbeCijfers}</p>
        <p style={{ ...tekst, color: STZ.tekst, fontSize: 9.5 }}>{T(TBE_BRON)}</p>

      </div>


      <div style={kaart}>
        <h4 style={kop}>{T("Tekenbeetziekten")}</h4>
        <p style={{ ...tekst, marginBottom: 7, color: STZ.tekst, fontSize: 10 }}>
          {T("In de tab Tekenbeetziekten staat de achtergrondinformatie per ziekte: de verwekker, de klachten, de incubatietijd, de manier van overdracht, de behandeling en wanneer u naar de huisarts gaat. Elke ziekte heeft een eigen kleur, die u ook terugziet op de kaart en bij de risico's. CCHF komt in Nederland (nog) niet voor, maar is in Europa in opmars en is daarom toegevoegd.")}
        </p>
        {ZIEKTEN.map((z) => (
          <div key={z.id} style={{ display: "flex", gap: 7, alignItems: "center", marginBottom: 5 }}>
            <span style={{ flexShrink: 0, width: 10, height: 10, borderRadius: "50%", background: z.kleur }} />
            <span style={{ fontSize: 10, fontWeight: 700, color: STZ.rood }}>{z.naam}</span>
          </div>
        ))}
      </div>

      <div style={kaart}>
        <h4 style={kop}>{T("Tekensoorten")}</h4>
        <p style={{ ...tekst, marginBottom: 7, color: STZ.tekst, fontSize: 10 }}>
          {T("In de tab Tekensoorten vindt u een overzicht van de tekensoorten die in Nederland voorkomen. U ziet per soort de herkenningskenmerken, het leefgebied, de status (inheems, invasief of incidenteel) en welke tekenbeetziekten ze kunnen overbrengen.")}
        </p>
        <p style={{ ...tekst, marginBottom: 7, color: STZ.tekst, fontSize: 10 }}>
          {T("Bovenaan de pagina kunt u het uitklapbare blok Levensstadia van de teek openen. Daarin staat uitleg over de vier levensstadia: ei, larve, nimf en volwassen teek (imago). Per stadium ziet u hoe groot de teek is en hoe u hem kunt herkennen.")}
        </p>
        <div style={{ marginBottom: 7 }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: STZ.rood, marginBottom: 4 }}>{T("Overzicht van de soorten")}</div>
          {TEKENSOORTEN.map((t) => (
            <div key={t.id} style={{ marginBottom: 5 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2 }}>
                <span style={{ flexShrink: 0, width: 10, height: 10, borderRadius: "50%", background: t.kleur }} />
                <span style={{ fontSize: 10, fontWeight: 700, color: STZ.rood }}>{t.naam}</span>
                <em style={{ fontSize: 9.5, color: STZ.tekst, opacity: 0.8 }}>({t.latijn})</em>
              </div>
              <div style={{ fontSize: 9.5, lineHeight: 1.5, color: STZ.tekst, paddingLeft: 16 }}>
                {T(t.status)} · {T(t.herkenning)} · {T("Leefgebied")}: {T(t.voorkomen)} · {T("Ziekten")}: {t.ziekten.map((zid) => ZIEKTEN.find((z) => z.id === zid)?.naam).filter(Boolean).join(", ") || T("geen bekende overbrenger")}
                {t.extraZiekten && t.extraZiekten.length > 0 && ` · ${T("ook")}: ${t.extraZiekten.join(", ")}`}
              </div>
            </div>
          ))}
        </div>
        <p style={{ ...tekst, marginBottom: 0, color: STZ.tekst, fontSize: 9.5 }}>
          {T("Klik op een soort in de tab voor meer details, foto's en bronvermelding.")}
        </p>
      </div>

      <div style={kaart}>
        <h4 style={kop}>Tekenbeten</h4>
        <p style={{ ...tekst, marginBottom: 7, color: STZ.tekst, fontSize: 10 }}>
          In de knoppenbalk kunt u de laag <strong>Tekenbeten</strong> aanzetten. De kaart toont dan per provincie een indicatie van het aantal tekenbeten per jaar of het aandeel dat in de eigen tuin is opgelopen.
        </p>
        {[
          ["Alle tekenbeten", TEKENBEET_TOELICHTING],
          ["Tekenbeten in de eigen tuin", "Het percentage van de gemelde tekenbeten dat in de eigen tuin is opgelopen (RIVM/Tekenradar, 2026). In Drenthe, Groningen en Zeeland ligt dit aandeel boven de 40%; in Noord-Holland, Utrecht en Noord-Brabant onder de 30%."],
          ["Bron en nuance", "Beweeg over een provincie of tik erop voor het exacte cijfer en de bronvermelding. De cijfers geven een indicatie; het werkelijke aantal kan per gebied afwijken doordat tekendichtheid en buitenactiviteit verschillen."],
        ].map(([t, d], i, a) => (
          <div key={t} style={{ marginBottom: i === a.length - 1 ? 0 : 6 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: STZ.rood }}>{vertaalTekst(t ?? "", taal === "en")}</div>
            <div style={{ fontSize: 9.5, lineHeight: 1.5, color: STZ.tekst }}>{vertaalTekst(d ?? "", taal === "en")}</div>
          </div>
        ))}
        <p style={{ ...tekst, marginTop: 7, color: STZ.tekst, fontSize: 9.5 }}>
          Bron: {" "}
          <a href={TEKENBEET_BRON.url} target="_blank" rel="noopener noreferrer" style={{ color: STZ.rood, fontWeight: 700 }}>{TEKENBEET_BRON.label}</a>
          {" "}·{" "}
          <a href={TUINBEET_BRON.url} target="_blank" rel="noopener noreferrer" style={{ color: STZ.rood, fontWeight: 700 }}>{TUINBEET_BRON.label}</a>
        </p>
      </div>

      <div style={kaart}>
        <h4 style={kop}>De seizoenen</h4>
        <p style={{ ...tekst, marginBottom: 7, color: STZ.tekst, fontSize: 10 }}>
          Teken zijn het hele jaar actief en worden actiever boven ongeveer 5–7 °C. In de tab <strong>Seizoen</strong> ziet u de activiteit per maand; hieronder de hoofdlijn per seizoen.
        </p>
        {([["Lente (mrt–mei)", "Activiteit loopt snel op; mei is samen met juni de grootste piek. Nimfen zijn klein en vaak onopgemerkt."],
           ["Zomer (jun–aug)", "Hoge activiteit, in droge, hete perioden tijdelijk wat lager. Veel buitenrecreatie: dagelijks tekencheck."],
           ["Herfst (sep–nov)", "Tweede piek in september, daarna afname. Volwassen teken blijven actief bij zacht weer."],
           ["Winter (dec–feb)", "Laagste activiteit, maar niet nul: op zachte dagen kunnen teken bijten."]] as const).map(([s, d]) => (
          <div key={s} style={{ marginBottom: 6 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: STZ.rood }}>{s}</div>
            <div style={{ fontSize: 9.5, lineHeight: 1.5, color: STZ.tekst }}>{vertaalTekst(d, taal === "en")}</div>
          </div>
        ))}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginTop: 4 }}>
          {([["#E8F3FA", "Inactief"], ["#A9DDF5", "Laag"], ["#4A9FD4", "Matig"], ["#2E7BA0", "Hoog"], ["#1D4E63", "Piekseizoen"]] as const).map(([c, l]) => (
            <div key={l} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 9, color: STZ.tekst }}>
              <div style={{ width: 9, height: 9, borderRadius: 2, background: c }} />{l}
            </div>
          ))}
        </div>
      </div>

      
      <div style={kaart}>
        <h4 id="help-tekenbeetgids" style={kop}>TekenbeetGids</h4>
        <p style={{ ...tekst, marginBottom: 7, color: STZ.tekst, fontSize: 10 }}>
          {T("Met de knop")} <strong>{T("TekenbeetGids")}</strong>
          {T(" opent u een gids na een tekenbeet: een educatieve vragenlijst met een persoonlijk overzicht. U legt gegevens over de teek, de beetplek, huidreactie, plaats, omgeving en eventuele klachten vast en bekijkt daarna een overzicht dat u kunt kopiëren, opslaan als PDF of meenemen naar een gesprek met een arts. Uw antwoorden blijven op uw eigen toestel; ze worden alleen na uw toestemming voor deelname aan onderzoek beveiligd verwerkt en opgeslagen onder een uniek deelnemernummer. Een kopie van uw antwoorden wordt bewaard in een afgeschermde werkomgeving bij Google (verwerker, met verwerkersovereenkomst), zonder naam, e-mailadres of foto's. TekenbeetGids beoordeelt uw situatie niet, bepaalt geen urgentie en geeft geen diagnose of behandeling.")}
        </p>
        {[
          ["Zit de teek nog vast?", "De eerste vraag bepaalt of u eerst de teek moet verwijderen. Antwoordt u 'ja' of 'weet ik niet', dan volgt een verwijderstap met zeven stappen en blauwe voorbeeldbeelden: gebruik een tekenpincet of tekenkaart, pak de teek zo dicht mogelijk bij de huid, trek of draai rustig en zonder knijpen, desinfecteer de huid, noteer datum en tijd, zet met een pen een kring rond de beetplek en bewaar de teek (of maak er een foto van). Bij 'nee' gaat u meteen door naar de volgende vraag."],
          
          ["Vergelijk de beetplek (AI)", "Maak of upload een foto van de beetplek. De AI beschrijft zichtbare kenmerken en vergelijkt die met neutrale referentiepatronen. U krijgt een beschrijving, waargenomen kenmerken en een onzekerheidsindicatie. De vergelijking stelt geen aandoening of urgentie vast en geeft geen medisch advies. De foto wordt eenmalig verwerkt en niet opgeslagen."],
          ["Hoe vol zat de teek?", "Kies 'klein en plat', 'bol en volgezogen' of 'ik weet het niet, de teek is weggegooid'. Een volgezogen teek wijst op een langere hechtingsduur en dus op meer kans op overdracht. Kiest u dat de teek weg is, dan slaat de wegwijzer de tekenscan over en gaat u verder met de vraag over de hechtingsduur."],
          ["Vergelijk de teek (AI)", "Maak of upload een foto van de verwijderde teek. De AI vergelijkt zichtbare kenmerken met zes referentiesoorten die in Nederland mensen kunnen bijten. U krijgt een indicatieve soortvergelijking, kenmerken en een onzekerheidsindicatie. Dit is geen medische beoordeling."],
          ["Hoe lang zat de teek vast?", "Borrelia kan via een besmette teek worden overgedragen. De kans op Lyme hangt onder meer af van de aanhechtingsduur en de teek. Snel verwijderen verkleint het risico, maar 24 uur is geen harde veilige grens. Verwijder een teek altijd zo snel mogelijk."],
          ["Wanneer is de teek verwijderd?", "De datum en tijd van verwijderen bepalen of het 72-uursvenster voor preventieve behandeling nog open staat en vanaf wanneer u de beetplek vier weken in de gaten houdt."],
          ["Waar bent u gebeten?", "Kies de provincie om de plaats van de beet in uw persoonlijke overzicht vast te leggen. De kaartinformatie is algemene context en geen persoonlijke risicobeoordeling."],
          ["Waar op het lichaam zit de beet?", "Geef aan waar op het lichaam de beetplek zit, zoals been, arm, romp, hoofd of liezen. De plaats helpt de huisarts bij de beoordeling en is waardevol voor onderzoek; sommige plekken (zoals hoofdhuid bij kinderen) vragen extra aandacht."],
          ["Over het verwijderen", "De wegwijzer vraagt wie de teek heeft verwijderd (uzelf, iemand anders, een arts of nog niet verwijderd), hoe dat is gebeurd (pincet, tekenkaart, tang, vingers of anders) en of er mogelijk een deel van de teek is achtergebleven. Verwijderen met olie, alcohol of vuur is afgeraden: dat kan de teek prikkelen en het risico op overdracht juist vergroten. Bij achtergebleven monddelen krijgt u het advies om de huid rustig te houden en bij ontsteking de huisarts te raadplegen. Ook wordt gevraagd wat er met de teek is gebeurd (bewaard, op de foto of weggegooid); een bewaarde of gefotografeerde teek kan later nog worden beoordeeld."],
          ["Omgeving en weer", "Vink aan waar de beet plaatsvond: stedelijk gebied, tuin, park, sportveld, recreatieterrein, natuur, bos of duinen, met straat- en plaatsnaam en waar van toepassing de naam van het gebied. Ook het weertype kunt u aangeven; het seizoen wordt automatisch bepaald uit de datum."],
          ["Klachten en bijzonderheden", "Leg eventuele klachten, de duur ervan en bijzonderheden vast. Deze gegevens worden geordend in uw persoonlijke overzicht, maar TekenbeetGids bepaalt niet wat de oorzaak is of welke zorg passend is."],
          ["Tussentijdse informatie", "Na de eerste vragen ziet u de ingevoerde informatie en algemene aandachtspunten. Met 'Ga door met de volgende vragen' kunt u het overzicht aanvullen. De toepassing geeft geen individuele triage-uitkomst."],
          ["Was dit uw eerste tekenbeet?", "Geef aan of dit uw eerste tekenbeet is, of dat u eerder bent gebeten. Bij 'nee' kunt u aangeven hoe vaak u eerder bent gebeten en wanneer dat was (maand en jaar). Deze informatie helpt bij onderzoek naar het voorkomen van tekenbeten in Nederland."],
          ["Waar is de eerdere tekenbeet opgelopen?", "Per eerdere tekenbeet wordt gevraagd of u toen in Nederland bent gebeten. Bij 'ja' selecteert u de provincie en vult u de plaatsnaam in. Bij 'nee' geeft u het land en de plaatsnaam op. Kiest u 'weet ik niet', dan gaat u direct door. Deze locatiegegevens helpen onderzoekers om te zien waar eerdere beten zijn opgelopen."],
          ["Eerdere tekenbeten: getest?", "Per eerdere tekenbeet vraagt de wegwijzer of u toen bent getest (ja, nee of weet ik niet). Bij 'ja' volgen vervolgvragen: waarop u bent getest (een of meer van de tien tekenbeetziekten, of 'weet ik niet'), wat er is getest (bloed, liquor of anders), hoe lang na de beet de test is gedaan, wie de test heeft aangevraagd (huisarts, specialist in het ziekenhuis, andere arts of arts in het buitenland) en in welk land de test is uitgevoerd."],
          ["Uitslag en herhaaltest", "Per geteste tekenbeetziekte geeft u de uitslag aan: positief of negatief. Ook wordt gevraagd of de test later nog eens is herhaald; een negatieve test kort na de beet kan later alsnog positief worden, dus een herhaaltest is soms zinvol."],
          ["Behandeling", "Bij een negatieve uitslag worden de behandelvragen overgeslagen. Bij een positieve uitslag volgt per ziekte de vraag of u bent behandeld (ja, nee of weet ik niet). Bij 'ja' geeft u aan met welke antibiotica (uit een lijst), in welk jaar, hoe lang elke behandeling duurde (aantal dagen, weken of maanden), of u naast antibiotica nog met andere medicijnen bent behandeld en of de klachten na de behandeling zijn verdwenen (ja, gedeeltelijk, nee of weet ik niet)."],
          ["Behandeling bij TBE", "Voor TBE zijn er geen antibioticavragen: antibiotica werken niet tegen een virus. De wegwijzer vraagt in plaats daarvan of u bent behandeld voor TBE (ja, nee of weet ik niet). Bij 'ja' volgt of dit een behandeling voor de symptomen was, met welk medicijn (bij meerdere medicijnen kunt u dit herhalen), of u bent behandeld met een experimenteel medicijn (bijvoorbeeld een antiviraal middel) en zo ja met welk medicijn."],
          ["Antibiotica in de tussenliggende periode", "Na de vragen over eerdere tekenbeten vraagt de wegwijzer of u in de tussenliggende periode daarna nog met antibiotica bent behandeld (ja, nee of weet ik niet). Bij 'ja' selecteert u het type antibiotica uit een lijst, vult u in voor welke aandoening u ze kreeg, in welk jaar en hoe lang de kuur duurde (dagen, weken of maanden). Daarna volgt de vraag of u nog een antibioticabehandeling hebt gehad; bij 'ja' herhaalt dit hele blok zich, zodat uw meerdere kuren kunt doorgeven."],
          ["TBE-vaccinatie en risicoberoep", "De gids kan vastleggen of u bent gevaccineerd tegen TBE en of u een beroep hebt met meer blootstelling aan teken. Deze gegevens worden gebruikt om relevante algemene informatie te selecteren, niet om een medische beslissing te nemen."],
          ["Leeftijd, geslacht, woonplaats, afkomst, nationaliteit en opleiding", "Deze demografische vragen zijn optioneel en bedoeld voor wetenschappelijk onderzoek naar tekenbeten en tekenziekten. Ze helpen om patronen in het voorkomen van tekenbeten te begrijpen. U bent niet verplicht ze in te vullen."],
          ["Persoonlijk overzicht, PDF en deelnemen aan onderzoek", "U ziet de vastgelegde informatie en algemene aandachtspunten, inclusief de uitkomsten van de visuele vergelijkingen en uw foto's. U kunt het overzicht kopiëren, opslaan als PDF of printen; na het genereren van het tussentijdse en het eindrapport worden de foto's direct uit de app verwijderd en nergens bewaard. De rapportage wordt alleen beveiligd verwerkt en opgeslagen als uw toestemming geeft voor deelname aan onderzoek, en dan onder uw unieke deelnemernummer."],
           ["Privacy, leeftijd en bewaartermijn", "Vanaf 16 jaar kunt u TekenbeetGids zelfstandig invullen en toestemming geven voor onderzoek. Bent u jonger, doe dit dan samen met een ouder of verzorger. Onderzoeksgegevens worden maximaal vijf jaar bewaard en daarna automatisch verwijderd. Gebruikers uit het buitenland die in Nederland zijn gebeten, hebben dezelfde privacyrechten onder de AVG."],
          ["Meldt uw tekenbeet en waar u verder terechtkunt", "Onder het persoonlijke overzicht staan een knop naar Tekenradar.nl en verwijzingen naar betrouwbare informatiebronnen. Een melding bij Tekenradar staat los van een medische beoordeling."],
          ["Over de AI-vergelijkingen", "De AI vergelijkt foto's met vaste visuele referenties en beschrijft zichtbare kenmerken. De uitkomst is indicatief, stelt geen aandoening of urgentie vast en geeft geen behandeladvies. Foto's worden eenmalig verwerkt en niet opgeslagen of aan onderzoeksgegevens toegevoegd. Alleen de uitkomst, zonder foto, wordt anoniem vastgelegd in de werkomgeving bij Google (verwerker, met verwerkersovereenkomst): datum, uitkomst, zichtbare kenmerken en taal."],
        ].map(([t, d], i, a) => (
          <div key={t} style={{ marginBottom: i === a.length - 1 ? 0 : 6 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: STZ.rood }}>{vertaalTekst(t ?? "", taal === "en")}</div>
            <div style={{ fontSize: 9.5, lineHeight: 1.5, color: STZ.tekst }}>{vertaalTekst(d ?? "", taal === "en")}</div>
          </div>
        ))}
        <div style={{ marginTop: 10, padding: "8px 10px", background: "rgba(29,78,99,.06)", borderRadius: 7, borderLeft: `3px solid ${STZ.rood}` }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: STZ.rood, marginBottom: 4 }}>Extra uitleg</div>
          <div style={{ fontSize: 9.5, lineHeight: 1.55, color: STZ.tekst }}>
            <strong>TekenbeetGids</strong> ordent de gegevens die u zelf invult en selecteert daarbij algemene aandachtspunten. De toepassing geeft geen persoonlijk risiconiveau, diagnose, urgentie of behandeladvies en bepaalt niet of u kunt afwachten of medische hulp nodig hebt.
          </div>
          <div style={{ fontSize: 9.5, lineHeight: 1.55, color: STZ.tekst, marginTop: 5 }}>
            Het persoonlijke overzicht en de PDF zijn bedoeld voor uw eigen registratie en kunnen worden gebruikt om feitelijke informatie met een arts te bespreken. Bespreek zorgen of klachten met uw huisarts. Bel 112 bij een levensbedreigende situatie.
          </div>
          <div style={{ fontSize: 9.5, lineHeight: 1.55, color: STZ.tekst, marginTop: 5 }}>
            De foto blijft tijdelijk in het browsergeheugen voor beide rapporten en herhaalde pdf-export tot u de wizard reset of de pagina sluit. Dominic Smith Advies slaat de foto niet duurzaam op en stuurt deze niet naar het onderzoeksbestand. Alleen na uw keuze voor AI-vergelijking wordt de foto via een beveiligde verbinding verwerkt via de Google AI Studio / Gemini API. Ook als u gepseudonimiseerd deelneemt aan onderzoek, worden de foto's niet meegestuurd. Uw antwoorden worden pas beveiligd opgeslagen nadat uw toestemming hebt gegeven voor deelname aan onderzoek, onder uw unieke deelnemernummer. Zie ook de <Link to="/privacyverklaring-gezondheidsgegevens" style={{ color: STZ.rood, fontWeight: 700, textDecoration: "underline" }}>Privacyverklaring Gezondheidsgegevens</Link> en de <Link to="/toegankelijkheidsverklaring" style={{ color: STZ.rood, fontWeight: 700, textDecoration: "underline" }}>Toegankelijkheidsverklaring</Link>.
          </div>
        </div>

        <p style={{ ...tekst, marginTop: 10, color: STZ.tekst, fontSize: 9.5 }}>
          Voor algemene achtergrondinformatie verwijst de gids naar openbare bronnen, waaronder {" "}
          <a href="https://www.tekenbeetziekten.nl/" target="_blank" rel="noopener noreferrer" style={{ color: STZ.rood, fontWeight: 700 }}>Stichting Tekenbeetziekten — tekenbeetziekten.nl</a>, RIVM, de Lymevereniging en het Centrum Monitoring Vectoren (NVWA).
        </p>

      </div>

      <div style={kaart}>
        <h4 id="help-onderzoek" style={kop}>Deelnemen aan onderzoek</h4>
        <p style={{ ...tekst, marginBottom: 7, color: STZ.tekst, fontSize: 10 }}>
          Onderaan uw persoonlijke overzicht in <strong>TekenbeetGids</strong> kunt u de ingevulde gegevens en het overzicht beschikbaar stellen voor wetenschappelijk onderzoek naar tekenbeten en tekenziekten in Nederland. Zonder die toestemming wordt er niets opgeslagen: uw antwoorden blijven dan alleen op uw eigen toestel.
        </p>
        {[
          ["Gepseudonimiseerd", "De gegevens worden gepseudonimiseerd opgeslagen, zonder naam, adres, e-mail of telefoonnummer. Locatie, datum en klachten kunnen samen toch herkenbaar zijn; dit zijn geen volledig anonieme gegevens."],
          ["Alleen na toestemming", "Er wordt pas iets opgeslagen nadat u het toestemmingsformulier hebt geaccepteerd. Rond u de vragen af zonder toestemming, dan verlaten uw antwoorden uw toestel niet."],
          ["Foto's worden nooit bewaard", "Foto's van de beetplek of de teek worden nooit opgeslagen en nooit meegestuurd naar het onderzoek. Direct nadat het tussentijdse rapport en het eindrapport zijn gemaakt, worden de foto's uit de app verwijderd; ze staan alleen nog in het rapport dat u zelf opslaat of print."],
          ["Vrijwillig", "Deelname is vrijwillig. U kunt het overzicht en de PDF gewoon gebruiken zonder mee te doen aan onderzoek."],
          ["Uniek deelnemernummer", "Als uw akkoord gaat, wordt er een uniek nummer gegenereerd (bijvoorbeeld TRK-2026-AB3K9M) en krijgt u een persoonlijke intrekcode. Bewaar beide: samen zijn ze de sleutel naar uw gegevens en u hebt ze nodig om uw deelname later in te trekken."],
          ["Toestemming", "Door op 'Akkoord' te drukken geeft u toestemming. Er wordt een kopie van dit toestemmingsformulier opgeslagen bij uw gegevens, zodat vaststaat dat u hebt ingestemd."],
          ["Beveiligd opgeslagen", "De gegevens komen in een afgeschermde database waar geen enkele bezoeker bij kan; uitsluitend de beheerder kan ze na inloggen teruglezen. Een gepseudonimiseerde kopie wordt bewaard in een afgesloten onderzoeksbestand voor de statistische verwerking."],
          ["Bewaartermijn", "Onderzoeksgegevens worden maximaal vijf jaar bewaard en daarna automatisch verwijderd. Technische controlelogs worden maximaal 30 dagen bewaard en tijdelijke gegevens voor misbruikpreventie maximaal één dag."],
          ["Dienstverleners", "Voor beveiligde hosting, de vrijwillige AI-fotovergelijking en de gepseudonimiseerde onderzoeksadministratie worden zorgvuldig gekozen dienstverleners gebruikt. Gmail wordt gebruikt voor e-mailmeldingen en een afgeschermde werkomgeving bij Google (verwerker, met verwerkersovereenkomst) voor een afgeschermde onderzoekskopie. Zij mogen gegevens alleen volgens onze instructies verwerken."],
          ["Leeftijd en buitenlandse bezoekers", "Vanaf 16 jaar kunt u zelfstandig deelnemen. Bent u jonger, dan is toestemming van een ouder of verzorger nodig. Toeristen, studenten en werknemers uit het buitenland die in Nederland zijn gebeten, hebben dezelfde rechten onder de AVG; medische informatie gaat uit van de Nederlandse zorgsituatie."],
          ["Waarom meedoen?", "De gepseudonimiseerde gegevens helpen onderzoekers om te begrijpen waar en wanneer teken actief zijn, hoe vaak mensen worden gebeten en hoe tekenbeten het beste kunnen worden voorkomen."],
        ].map(([t, d], i, a) => (
          <div key={t} style={{ marginBottom: i === a.length - 1 ? 0 : 6 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: STZ.rood }}>{vertaalTekst(t ?? "", taal === "en")}</div>
            <div style={{ fontSize: 9.5, lineHeight: 1.5, color: STZ.tekst }}>{vertaalTekst(d ?? "", taal === "en")}</div>
          </div>
        ))}
        <p style={{ ...tekst, marginTop: 7, color: STZ.tekst, fontSize: 9.5 }}>
          Meer over de verwerking van gezondheidsgegevens leest u in de{" "}
          <Link to="/privacyverklaring-gezondheidsgegevens" style={{ color: STZ.rood, fontWeight: 700, textDecoration: "underline" }}>Privacyverklaring Gezondheidsgegevens</Link>{" "}
          en in het privacybeleid en de cookieverklaring. Voor privacyvragen of verzoeken tot inzage, verwijdering of intrekking kunt u met uw deelnemernummer het contactformulier onder Help gebruiken. De bevoegde beheerder van Dominic Smith Advies behandelt deze verzoeken; dit is geen externe persoon of extern bedrijf.
        </p>
        <OptOutFormulier />
      </div>


      <div style={kaart}>
        <h4 style={kop}>De landelijke cijfers</h4>
        <p style={tekst}>
          {T("In Nederland worden jaarlijks naar schatting 1,5 miljoen tekenbeten opgelopen (RIVM-schatting).")}
          {" "}{T("Circa 27.000 Lyme-diagnoses per jaar is de RIVM-schatting voor 2017 uit huisartsenonderzoek: ongeveer 25.500 met erythema migrans en 1.500 met andere verschijnselen van verspreide Lyme. Het is geen actuele jaarlijkse EM-registratie.")}
          {" "}{T("RIVM: circa 20% (ongeveer 1 op 5), een afgerond voorlichtingscijfer uit tekenonderzoek. Stichting Tekenbeetziekten vermeldt gemiddeld 29,3% op basis van Hofhuis et al. (2016): PCR-onderzoek van 314 bij mensen verwijderde teken, verzameld via huisartsen in 2007–2008; 92 waren Borrelia-positief. Dit is een onderzoekssteekproef, geen lokaal maximum en geen actuele, representatieve landelijke meting. Bron en methode verschillen; geen van beide percentages is een infectiekans per beet.")}
        </p>
        <p style={{ ...tekst, marginTop: 6 }}>
          Snel verwijderen halveert het risico. Een teek die binnen enkele uren wordt verwijderd geeft ongeveer de
          helft minder kans op besmetting; een teek die zich volledig heeft volgezogen ongeveer twee keer zoveel.
          Controleer daarom na elk bezoek aan groen gebied uw hele lichaam, ook in liezen, knieholtes, oksels,
          achter de oren en op de hoofdhuid.
        </p>
        <p style={{ ...tekst, marginTop: 6, color: STZ.tekst }}>
          Bron: RIVM (<a href="https://www.rivm.nl/ziekte-van-lyme" target="_blank" rel="noopener noreferrer" style={{ color: STZ.rood, fontWeight: 700 }}>rivm.nl/ziekte-van-lyme</a>) en Tekenradar.nl
          (<a href="https://www.tekenradar.nl/informatie/hoeveel-teken-zijn-besmet" target="_blank" rel="noopener noreferrer" style={{ color: STZ.rood, fontWeight: 700 }}>hoeveel teken zijn besmet</a>).
        </p>
      </div>

      <div style={kaart}>
        <h4 style={kop}>{CIJFER_NUANCE.vraag}</h4>
        <ul style={{ ...tekst, margin: 0, paddingLeft: 16 }}>
          {CIJFER_NUANCE.punten.map((t) => (<li key={t} style={{ marginBottom: 4 }}>{t}</li>))}
        </ul>
        <p style={{ ...tekst, marginTop: 6, color: STZ.tekst }}>{CIJFER_NUANCE.slot}</p>
      </div>

      <div style={kaart}>
        <h4 style={kop}>De cijfers van Stichting Tekenbeetziekten</h4>
        <p style={{ ...tekst, color: STZ.tekst, marginBottom: 6 }}>
          Bron: Stichting Tekenbeetziekten,{" "}
          <a href="https://www.tekenbeetziekten.nl" target="_blank" rel="noopener noreferrer" style={{ color: STZ.rood, fontWeight: 700 }}>tekenbeetziekten.nl</a>. Deze cijfers wijken af van de RIVM-cijfers hierboven; ze worden hier
          naast elkaar getoond.
        </p>
        <ul style={{ ...tekst, margin: 0, paddingLeft: 16 }}>
          <li><strong>~1 op de 3 teken (29,3%)</strong> draagt Borrelia bij zich <em>(STZ: gemiddelde in Hofhuis et al., 2016; PCR van 314 bij mensen verwijderde teken uit 2007–2008, geen lokaal maximum)</em></li>
          <li><strong>ongeveer de helft van de teken</strong> draagt één of meer onderzochte micro-organismen bij zich</li>
          <li><strong>minstens 1 op de 20 beten (&gt;5%)</strong> leidt tot de ziekte van Lyme</li>
          <li><strong>1,5 miljoen tekenbeten</strong> per jaar in Nederland</li>
          <li><strong>meer dan 80.000 lymepatiënten</strong> per jaar</li>
        </ul>
        <p style={{ ...tekst, marginTop: 6 }}>{T("RIVM: circa 20% (ongeveer 1 op 5), een afgerond voorlichtingscijfer uit tekenonderzoek. Stichting Tekenbeetziekten vermeldt gemiddeld 29,3% op basis van Hofhuis et al. (2016): PCR-onderzoek van 314 bij mensen verwijderde teken, verzameld via huisartsen in 2007–2008; 92 waren Borrelia-positief. Dit is een onderzoekssteekproef, geen lokaal maximum en geen actuele, representatieve landelijke meting. Bron en methode verschillen; geen van beide percentages is een infectiekans per beet.")}</p>
        <a href="https://doi.org/10.1371/journal.pntd.0005042" target="_blank" rel="noopener noreferrer" style={{ ...tekst, display: "inline-block", marginTop: 4, color: STZ.rood, fontWeight: 700, textDecoration: "underline" }}>Hofhuis et al. (2016) · PCR · 314 {en ? "ticks" : "teken"}</a>
        <p style={{ ...tekst, marginTop: 6 }}>Percentages besmette teken per verwekker:</p>
        <ul style={{ ...tekst, margin: 0, paddingLeft: 16 }}>
          <li><em>Borrelia burgdorferi</em> (Lyme) — 29,3%</li>
          <li><em>Rickettsia helvetica/monacensis</em> (rickettsiose) — 22,5%</li>
          <li><em>Neoehrlichia mikurensis</em> — 5,4%</li>
          <li><em>Babesia</em>-soorten (babesiose) — 3,5%</li>
          <li><em>Borrelia miyamotoi</em> — 2,3%</li>
          <li><em>Anaplasma phagocytophilum</em> (anaplasmose) — 1%</li>
          <li>TBE-virus (FSME) — &lt; 0,1%</li>
        </ul>
        <p style={{ ...tekst, marginTop: 6, color: STZ.tekst }}>
          Ruim een derde van de teken met Borrelia draagt ook minstens één ander micro-organisme bij zich; de
          besmettingsgraad verschilt sterk per gebied.
        </p>
      </div>

      <div style={kaart}>
        <h4 style={kop}>Gegevens van de {LV_BRON.naam}</h4>
        {LV_PUNTEN.map((t) => (
          <div key={t} style={{ fontSize: 10, lineHeight: 1.55, color: STZ.tekst, marginBottom: 4 }}>• {t}</div>
        ))}
        <div style={{ fontSize: 9.5, color: STZ.tekst, marginTop: 4 }}>
          Bron: {LV_BRON.naam} —{" "}
          <a href={LV_BRON.url} target="_blank" rel="noopener noreferrer" style={{ color: STZ.rood, fontWeight: 700 }}>{LV_BRON.label}</a>
        </div>
      </div>

      <div style={kaart}>
        <h4 style={kop}>Gegevens van de LCI</h4>
        {LCI_PUNTEN.map((t) => (
          <div key={t} style={{ fontSize: 10, lineHeight: 1.55, color: STZ.tekst, marginBottom: 4 }}>• {t}</div>
        ))}
        <div style={{ fontSize: 9.5, color: STZ.tekst, marginTop: 4 }}>
          Bron: {LCI_BRON.naam} —{" "}
          <a href={LCI_BRON.url} target="_blank" rel="noopener noreferrer" style={{ color: STZ.rood, fontWeight: 700 }}>{LCI_BRON.label}</a>
        </div>
      </div>



      <div style={kaart}>
        <h4 style={kop}>Verantwoording, peildatum en correctiebeleid</h4>
        <p style={tekst}>
          {T(MELDINGSBIAS_KORT)}
        </p>
        <p style={{ ...tekst, marginTop: 6 }}>
          Meldingen weerspiegelen niet alleen het aantal teken, maar ook hoeveel mensen in een provincie de natuur
          in gaan en hoe vaak zij een beet melden. Een provincie met actieve voorlichting kan hoger scoren zonder
          dat er meer teken zitten. Gebruik de kaart als grove indicatie, niet als individuele risicoberekening.
        </p>
        <p style={{ ...tekst, marginTop: 6 }}>
          <strong>Bronnen automatisch gecontroleerd:</strong> {peildatum}. <strong>Website-inhoud bijgewerkt:</strong> {laatstBijgewerkt}.{" "}
          <strong>Peildatum brongegevens:</strong> {DATA_PEILDATUM}.

        </p>
        <div style={{ ...tekst, marginTop: 10 }}>
          <strong style={{ color: STZ.rood }}>Peildata per brongegeven</strong>
          <div style={{ marginTop: 4 }}>
            Iedere bron heeft een eigen peildatum. Hieronder staat per bron op welke periode de gebruikte gegevens betrekking hebben. De automatische controle draait dagelijks en werkt deze peildata per bron realtime bij zodra een bron wijzigt.
          </div>
          <ul style={{ margin: "5px 0 0", paddingLeft: 15 }}>
            {BRON_PEILDATA.map((b) => {
              const live = b.sleutel ? bronPeildata[b.sleutel] : undefined;
              const gecontroleerd = live?.laatstGecontroleerd
                ? new Date(live.laatstGecontroleerd).toLocaleDateString("nl-NL", { day: "numeric", month: "long", year: "numeric" })
                : null;
              return (
                <li key={b.bron} style={{ marginBottom: 4 }}>
                  {b.url ? (
                    <a href={b.url} target="_blank" rel="noopener noreferrer" style={{ color: STZ.rood, fontWeight: 700, textDecoration: "underline" }}>
                      {b.bron}
                    </a>
                  ) : (
                    <strong>{b.bron}</strong>
                  )}{" "}
                  — peildatum: {live?.peildatum || b.peildatum}. {b.toelichting}
                  {gecontroleerd ? <> Laatst automatisch gecontroleerd: {gecontroleerd}.</> : null}
                </li>
              );
            })}
          </ul>
        </div>
        <p style={{ ...tekst, marginTop: 6 }}>
          Meld een tekenbeet zelf ook op{" "}
          <a href="https://www.tekenradar.nl" target="_blank" rel="noopener noreferrer" style={{ color: STZ.rood, fontWeight: 700 }}>www.tekenradar.nl</a> —
          daarmee worden de gegevens waar deze kaart op leunt beter.
        </p>
        <p style={{ ...tekst, marginTop: 6 }}>
          Voor informatie over teken en tekenbeetziekten gebruikt deze website en web-app gegevens en voorlichting van
          Stichting Tekenbeetziekten:{" "}
          <a href="https://www.tekenbeetziekten.nl" target="_blank" rel="noopener noreferrer" style={{ color: STZ.rood, fontWeight: 700 }}>www.tekenbeetziekten.nl</a>.
        </p>
        <p style={{ ...tekst, marginTop: 6 }}>
          Voor informatie en ervaringen van patiënten over de ziekte van Lyme en andere tekenbeetziekten gebruikt
          deze website en web-app ook gegevens en voorlichting van de Lymevereniging:{" "}
          <a href="https://www.lymevereniging.nl" target="_blank" rel="noopener noreferrer" style={{ color: STZ.rood, fontWeight: 700 }}>www.lymevereniging.nl</a>.
        </p>
        <p style={{ ...tekst, marginTop: 6 }}>
          <strong>Correctiebeleid:</strong> ziet u een fout of een verouderd cijfer? Meld het bij Dominic Smith Advies.
          Gemelde fouten worden gecontroleerd aan de hand van de openbare bronnen en, als de melding klopt, zo
          snel mogelijk aangepast; bij een inhoudelijke correctie wordt de datum hierboven bijgewerkt.
        </p>
      </div>


      
      <h4 style={kop}>{T("Veelgestelde vragen")}</h4>

      {faq.map(([v, a], i) => (
        <div key={v} style={{ border: `1px solid ${STZ.lijn}`, borderRadius: 8, marginBottom: 5, overflow: "hidden", background: "#fff" }}>
          <button onClick={() => setOpen(open === i ? null : i)}
            style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 6, padding: "8px 10px", border: "none", background: open === i ? "#E6F1F8" : "transparent", cursor: "pointer", fontFamily: "inherit", textAlign: "left" }}>
            <span style={{ fontSize: 10.5, fontWeight: 700, color: open === i ? STZ.rood : STZ.tekst }}>{T(v)}</span>
            <span style={{ fontSize: 12, fontWeight: 800, color: STZ.terra, flexShrink: 0 }}>{open === i ? "−" : "+"}</span>
          </button>
          {open === i && <div style={{ padding: "0 10px 9px", fontSize: 10, lineHeight: 1.55, color: STZ.tekst }}>{typeof a === "string" ? T(a) : a}</div>}
        </div>
      ))}

      <div style={{ border: `1px solid ${STZ.lijn}`, borderRadius: 8, marginBottom: 5, overflow: "hidden", background: "#fff" }}>
        <button onClick={() => setWoordenlijstOpen(!woordenlijstOpen)}
          style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 6, padding: "8px 10px", border: "none", background: woordenlijstOpen ? "#E6F1F8" : "transparent", cursor: "pointer", fontFamily: "inherit", textAlign: "left" }}>
          <span style={{ fontSize: 10.5, fontWeight: 700, color: woordenlijstOpen ? STZ.rood : STZ.tekst }}>{T("Verklarende woordenlijst")}</span>
          <span style={{ fontSize: 12, fontWeight: 800, color: STZ.terra, flexShrink: 0 }}>{woordenlijstOpen ? "−" : "+"}</span>
        </button>
        <div style={{ display: woordenlijstOpen ? "block" : "none", padding: "0 10px 9px", fontSize: 10, lineHeight: 1.55, color: STZ.tekst }}>
          <p style={{ margin: "0 0 7px" }}>
            {T("De termen die op deze website en web-app voorkomen, in alfabetische volgorde. Een uitleg is kort en beschrijvend: het is geen medisch advies en vervangt niet de eigen kaart van een ziekte of provincie.")}
          </p>
          <dl style={{ margin: 0 }}>
            {woordenLijstVoor(en).map((w) => (
              <div key={w.nl} style={{ display: "flex", flexWrap: "wrap", gap: "0 8px", padding: "5px 0", borderBottom: `1px solid ${STZ.lijn}` }}>
                <dt style={{ flex: "0 0 138px", fontSize: 10, fontWeight: 800, color: STZ.rood }}>{en ? w.en : w.nl}</dt>
                <dd style={{ flex: "1 1 190px", margin: 0, fontSize: 10, lineHeight: 1.55, color: STZ.tekst }}>{en ? w.uitlegEn : w.uitleg}</dd>
              </div>
            ))}
          </dl>
          <p style={{ marginTop: 7, fontSize: 9.5 }}>
            {T("Klopt een uitleg niet of mis u een term? Meld het via het contactformulier.")}
          </p>
        </div>
      </div>

      <div style={kaart}>
        <h4 style={kop}>{T("Meer informatie")}</h4>
        <p style={{ fontSize: 11, lineHeight: 1.6, margin: "0 0 8px" }}>
          {T("Bij deze organisaties vindt u betrouwbare informatie over teken en tekenbeetziekten, preventie en tekenverwijdering, medische richtlijnen en de mogelijkheid om een tekenbeet te melden.")}
        </p>
        {([
          ["Stichting Tekenbeetziekten", "www.tekenbeetziekten.nl", "https://www.tekenbeetziekten.nl"],
          ["Lymevereniging", "www.lymevereniging.nl", "https://www.lymevereniging.nl"],
          ["RIVM", "www.rivm.nl", "https://www.rivm.nl"],
          ["LCI-richtlijnen (RIVM)", "lci.rivm.nl/richtlijnen", "https://lci.rivm.nl/richtlijnen"],

          ["GGD", "www.ggd.nl", "https://www.ggd.nl"],
          ["Tekenradar.nl (RIVM en Wageningen University & Research)", "www.tekenradar.nl", "https://www.tekenradar.nl"],
        ] as const).map(([n, l, u]) => (
          <div key={u} style={{ display: "flex", flexWrap: "wrap", gap: 4, padding: "4px 0", borderBottom: `1px solid ${STZ.lijn}` }}>
            <div style={{ flex: "1 1 130px", fontSize: 10, fontWeight: 800, color: STZ.rood }}>{n}</div>
            <div style={{ flex: "1 1 130px", fontSize: 10, lineHeight: 1.5 }}>
              <a href={u} target="_blank" rel="noopener noreferrer" style={{ color: STZ.tekst, textDecoration: "underline" }}>{l}</a>
            </div>
          </div>
        ))}
      </div>

      
      <div style={kaart}>
        <h4 style={kop}>Imprint — TekenRisicoKaart / TekenbeetGids</h4>
        {([
          ["Websiteversie", `TekenRisicoKaart / TekenbeetGids — ${APP_VERSIE} · Update ${LAATSTE_UPDATE_AUTO} · Build ${WEBSITE_VERSION}`],
          ["Iconen", `TekenRisicoKaart ${ICON_VERSION} · TekenbeetGids ${TBH_ICON_VERSION}`],
          ["Startschermen", `TekenRisicoKaart ${TRK_SPLASH_VERSION} · TekenbeetGids ${TBH_SPLASH_VERSION}`],
          ["Bronnen automatisch gecontroleerd", peildatum],
          ["Website-inhoud bijgewerkt", laatstBijgewerkt],
          ["Uitgever & verantwoordelijke", `Dominic Smith Advies — onafhankelijke uitgave. Deze website en web-app wordt niet uitgegeven door of namens Stichting Tekenbeetziekten, Lymevereniging, RIVM, LCI-richtlijnen (RIVM), GGD, GGD GHOR Nederland, Tekenradar.nl (RIVM en Wageningen University & Research), Nederlands Kennisnetwerk / Wageningen University & Research, ECDC, CBS (Centraal Bureau voor de Statistiek), NVWA (Nederlandse Voedsel- en Warenautoriteit, Centrum Monitoring Vectoren), DWHC (Dutch Wildlife Health Centre), Erasmus MC (Viroscience), LabMicTA of Artemis One Health; hun gegevens worden met bronvermelding gebruikt.\n\nVoor de inhoudelijke en wetenschappelijke verantwoording van de getoonde gegevens wordt in het bijzonder verwezen naar:\n• Wijburg et al. (2026), Eurosurveillance;\n• Universiteit Utrecht - proefschrift Wijburg (2026);\n• Universiteit Utrecht, faculteit Diergeneeskunde - dossier Zoönosen.`],
          ["Legitimiteit & veiligheid", "TekenRisicoKaart en TekenbeetGids zijn publieke voorlichtingswebsites. Geen marketing- of trackingcookies; gezondheidsgegevens worden alleen met uw afzonderlijke uitdrukkelijke toestemming voor onderzoeksdoeleinden opgeslagen. Onderzoekstoestemming is geen toestemming voor AI-verwerking en een AI-scan is geen toestemming voor onderzoeksdeelname. Foto’s en de foto’s in uw samenvatting en PDF blijven lokaal op uw apparaat; alleen als u expliciet kiest voor een AI-scan wordt de foto via onze server doorgestuurd naar een externe AI-dienst voor verwerking. Die foto wordt niet door ons opgeslagen, niet toegevoegd aan het onderzoeksbestand en door ons niet gebruikt voor het trainen van AI-modellen. Alleen de uitkomst van een AI-vergelijking — zonder foto en zonder persoonsgegevens — wordt anoniem vastgelegd. Wij vragen niet om betaling of inloggegevens. De officiële domeinen zijn tekenrisicokaart.nl en tekenbeetgids.nl. Vragen kunt u indienen via het contactformulier onder Help."],
          ["Idee & concept", "Dominic Smith Advies"],
          ["Design & ontwikkeling", "Dominic Smith Advies"],
          ["Software & technische realisatie", "Dominic Smith Advies"],
          ["KvK-nummer", "01170115"],

          ["Gebruikte data", "zie Waar komen de gegevens vandaan (bronnen)?"],

        ] as const).map(([l, w]) => (
          <div key={l} style={{ display: "flex", flexWrap: "wrap", gap: 4, padding: "4px 0", borderBottom: `1px solid ${STZ.lijn}` }}>
            <div style={{ flex: "1 1 110px", fontSize: 10, fontWeight: 800, color: STZ.rood }}>{l}</div>
            <div style={{ flex: "1 1 140px", fontSize: 10, lineHeight: 1.5, color: STZ.tekst }}>{w}</div>
          </div>
        ))}
        <div style={{ height: 8 }} />

        <div style={{ marginTop: 12, fontSize: 10, lineHeight: 1.5, color: STZ.tekst }}>
          <span style={{ fontWeight: 800, color: STZ.rood }}>Intellectuele eigendom</span>
        </div>
        <div style={{ marginTop: 6, display: "flex", alignItems: "flex-end", gap: 8, flexWrap: "wrap" }}>
          <img
            src={dsaLogoAsset.url}
            alt="Logo van Dominic Smith Advies"
            width={20}
            height={20}
            style={{ width: 20, height: 20, objectFit: "contain", flexShrink: 0, display: "block", marginBottom: 3 }}
          />
          <span style={{ fontSize: 10, lineHeight: 1.5, color: STZ.tekst }}>
            © 2026 Dominic Smith Advies. Alle rechten voorbehouden.
          </span>
        </div>
        <p style={{ ...tekst, marginTop: 10, marginBottom: 10 }}>
          Het auteursrecht en overige intellectuele eigendomsrechten met betrekking tot de applicatie, waaronder de namen
          TekenRisicoKaart en TekenbeetGids, de domeinnamen tekenrisicokaart.nl en tekenbeetgids.nl, het ontwerp, de software, de
          technische realisatie, de structuur, de functionaliteiten en de door Dominic Smith Advies ontwikkelde
          onderdelen, berusten bij Dominic Smith Advies, tenzij uitdrukkelijk anders vermeld.
        </p>
        <p style={{ ...tekst, marginBottom: 0 }}>
          De auteursrecht op de gebruikte data en gegevens berust bij de betreffende partijen, die eigenaar zijn van de
          data en gegevens.
        </p>

      </div>

      <div style={kaart}>
        <h4 style={kop}>Changelog — wat is er gewijzigd</h4>
        {(() => {
          const c = OPENBARE_CHANGELOG[logIndex] ?? OPENBARE_CHANGELOG[0];
          if (!c) return null;
          const pijl: React.CSSProperties = {
            background: "transparent", border: "none", padding: 4, cursor: "pointer",
            fontFamily: "inherit", fontSize: 12, lineHeight: 1, color: STZ.terra,
          };
          return (
            <>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                <div style={{ fontSize: 10, fontWeight: 800, color: STZ.rood }}>
                  Update {c.update} — {c.datum}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <button type="button" onClick={() => setLogIndex((i) => Math.max(0, i - 1))}
                    disabled={logIndex === 0} aria-label="Nieuwere wijzigingen" title="Nieuwere wijzigingen"
                    style={{ ...pijl, opacity: logIndex === 0 ? 0.3 : 1, cursor: logIndex === 0 ? "default" : "pointer" }}>
                    <span aria-hidden>▲</span>
                  </button>
                  <button type="button" onClick={() => setLogIndex((i) => Math.min(OPENBARE_CHANGELOG.length - 1, i + 1))}
                    disabled={logIndex >= OPENBARE_CHANGELOG.length - 1} aria-label="Oudere wijzigingen" title="Oudere wijzigingen"
                    style={{ ...pijl, opacity: logIndex >= OPENBARE_CHANGELOG.length - 1 ? 0.3 : 1, cursor: logIndex >= OPENBARE_CHANGELOG.length - 1 ? "default" : "pointer" }}>
                    <span aria-hidden>▼</span>
                  </button>
                </div>
              </div>
              <ul style={{ margin: "4px 0 0", paddingLeft: 14 }}>
                {c.punten.map((p) => (
                  <li key={p.tijd + p.tekst} style={{ fontSize: 10, lineHeight: 1.5, color: STZ.tekst }}>
                    <span style={{ fontWeight: 800, color: STZ.rood }}>{p.tijd}</span> — {p.tekst}
                  </li>
                ))}
              </ul>
              <div style={{ marginTop: 6, fontSize: 9, color: STZ.tekst }}>
                {`Dag ${logIndex + 1} van ${OPENBARE_CHANGELOG.length} — blader met de blauwe pijltjes door oudere wijzigingen.`}
              </div>
            </>
          );
        })()}
      </div>

      <div style={kaart}>
        <h4 style={kop}>{T("Back-uplog — wekelijkse back-ups")}</h4>
        {(() => {
          const b = backups[backupIndex] ?? backups[0];
          if (!b) return <p style={{ ...tekst, margin: 0 }}>{T("Nog geen back-ups vastgelegd.")}</p>;
          const pijl: React.CSSProperties = {
            background: "transparent", border: "none", padding: 4, cursor: "pointer",
            fontFamily: "inherit", fontSize: 12, lineHeight: 1, color: STZ.terra,
          };
          const laatste = backups.length - 1;
          return (
            <>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                <div style={{ fontSize: 10, fontWeight: 800, color: STZ.rood }}>
                  {b.datum} — {b.tijd} · {b.geslaagd ? T("geslaagd") : T("mislukt")}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <button type="button" onClick={() => setBackupIndex((i) => Math.max(0, i - 1))}
                    disabled={backupIndex === 0} aria-label="Nieuwere back-up" title="Nieuwere back-up"
                    style={{ ...pijl, opacity: backupIndex === 0 ? 0.3 : 1, cursor: backupIndex === 0 ? "default" : "pointer" }}>
                    <span aria-hidden>▲</span>
                  </button>
                  <button type="button" onClick={() => setBackupIndex((i) => Math.min(laatste, i + 1))}
                    disabled={backupIndex >= laatste} aria-label="Oudere back-up" title="Oudere back-up"
                    style={{ ...pijl, opacity: backupIndex >= laatste ? 0.3 : 1, cursor: backupIndex >= laatste ? "default" : "pointer" }}>
                    <span aria-hidden>▼</span>
                  </button>
                </div>
              </div>
              <ul style={{ margin: "4px 0 0", paddingLeft: 14 }}>
                {b.toelichting && (
                  <li style={{ fontSize: 10, lineHeight: 1.5, color: STZ.tekst }}>
                    <span style={{ fontWeight: 800, color: STZ.rood }}>{T("Status")}</span> — {T(b.toelichting)}
                  </li>
                )}
                {b.bestand && (
                  <li style={{ fontSize: 10, lineHeight: 1.5, color: STZ.tekst }}>
                    <span style={{ fontWeight: 800, color: STZ.rood }}>{T("Bestand")}</span> — {b.bestand}
                  </li>
                )}
                {b.aantal !== null && (
                  <li style={{ fontSize: 10, lineHeight: 1.5, color: STZ.tekst }}>
                    <span style={{ fontWeight: 800, color: STZ.rood }}>{T("Records")}</span> — {b.aantal}
                  </li>
                )}
              </ul>
              <div style={{ marginTop: 6, fontSize: 9, color: STZ.tekst }}>
                {`${T("Back-up")} ${backupIndex + 1} ${T("van")} ${backups.length} — ${T("versleuteld in de werkomgeving bij Google; blader met de blauwe pijltjes door eerdere back-ups.")}`}
              </div>
            </>
          );
        })()}
      </div>

      <div style={kaart}>
        <h4 style={kop}>Beveiligingsscans — historisch overzicht</h4>
        {(() => {
          const s = scans[scanIndex] ?? scans[0];
          if (!s) return null;
          const pijl: React.CSSProperties = {
            background: "transparent", border: "none", padding: 4, cursor: "pointer",
            fontFamily: "inherit", fontSize: 12, lineHeight: 1, color: STZ.terra,
          };
          return (
            <>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                <div style={{ fontSize: 10, fontWeight: 800, color: STZ.rood }}>
                  {s.datum} — {s.tijd} · {s.release}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <button type="button" onClick={() => setScanIndex((i) => Math.max(0, i - 1))}
                    disabled={scanIndex === 0} aria-label="Nieuwere scan" title="Nieuwere scan"
                    style={{ ...pijl, opacity: scanIndex === 0 ? 0.3 : 1, cursor: scanIndex === 0 ? "default" : "pointer" }}>
                    <span aria-hidden>▲</span>
                  </button>
                  <button type="button" onClick={() => setScanIndex((i) => Math.min(scans.length - 1, i + 1))}
                    disabled={scanIndex >= scans.length - 1} aria-label="Oudere scan" title="Oudere scan"
                    style={{ ...pijl, opacity: scanIndex >= scans.length - 1 ? 0.3 : 1, cursor: scanIndex >= scans.length - 1 ? "default" : "pointer" }}>
                    <span aria-hidden>▼</span>
                  </button>
                </div>
              </div>
              {s.waarschuwingen.length === 0 ? (
                <p style={{ ...tekst, margin: "6px 0 0" }}>Geen waarschuwingen bij deze scan.</p>
              ) : (
                <ul style={{ margin: "4px 0 0", paddingLeft: 14 }}>
                  {s.waarschuwingen.map((w) => (
                    <li key={w.titel} style={{ fontSize: 10, lineHeight: 1.5, color: STZ.tekst }}>
                      <span style={{ fontWeight: 800, color: STZ.rood }}>{w.niveau}</span> — {openbareScanTitel(w.titel)}{" "}
                      <span style={{ fontWeight: 700 }}>({w.status})</span>: {w.toelichting}
                    </li>
                  ))}
                </ul>
              )}
              <div style={{ marginTop: 6, fontSize: 9, color: STZ.tekst }}>
                {`Scan ${scanIndex + 1} van ${scans.length} — blader met de blauwe pijltjes door eerdere scans.`}
              </div>
            </>
          );
        })()}
      </div>






      <div style={kaart}>
        <h4 style={kop}>Voorwaarden, privacy en cookies</h4>
        <p style={{ ...tekst, marginBottom: 8 }}>
          TekenRisicoKaart - TekenbeetGids verwerkt zo min mogelijk gegevens: geen account, geen marketing- of trackingcookies en geen gegevensdeling met advertentienetwerken of sociale media. Gezondheidsgegevens worden alleen met uw afzonderlijke uitdrukkelijke toestemming voor onderzoeksdoeleinden opgeslagen. Onderzoekstoestemming is geen toestemming voor AI-verwerking en een AI-scan is geen toestemming voor onderzoeksdeelname. Foto’s en de foto’s in uw samenvatting en PDF blijven lokaal op uw apparaat, tenzij u expliciet kiest voor een AI-scan; bij een AI-scan wordt de foto via onze server doorgestuurd naar een externe AI-dienst voor verwerking. Die foto wordt niet door ons opgeslagen, niet toegevoegd aan het onderzoeksbestand en door ons niet gebruikt voor het trainen van AI-modellen. Hoe wij omgaan met (technische) gegevens en lokale opslag leest u in de privacyverklaring en het cookiebeleid, opgesteld volgens de AVG (GDPR) en de Nederlandse Telecommunicatiewet.
        </p>
        <p style={{ ...tekst, marginBottom: 8 }}>
          {T("Alle verwerkingen staan beschreven in het verwerkingsregister (art. 30 AVG). Voor de onderzoeksinzendingen is een gegevensbeschermingseffectbeoordeling (DPIA, art. 35 AVG) uitgevoerd; beide zijn opgezet met het oog op de Europese ruimte voor gezondheidsgegevens (EHDS) en een toekomstige Nederlandse toegangsinstantie voor gezondheidsgegevens (HDAB). Oude gegevens worden automatisch opgeruimd: inzendingen en registraties na vijf jaar, technische logs na 30 dagen en bewaarde privacyklachten en bezwaarverzoeken na drie jaar.")}
        </p>
        <p style={{ ...tekst, marginBottom: 8 }}>
          {T("Dien u via het contactformulier een privacyklacht of privacyverzoek in, dan kunt u met de bewaaroptie u klacht of bezwaar laten vastleggen in een apart, afgeschermd privacyregister met een eigen verzoeknummer, net als de onderzoeksinzendingen onder een deelnemernummer. Alleen de bevoegde beheerder kan dit teruglezen.")}
        </p>
        <p style={{ ...tekst, marginBottom: 8 }}>
          {T("De beoogde functie van TekenRisicoKaart - TekenbeetGids is informatief: de diensten bieden informatie, begeleiding en inzicht. De privacydocumenten beschrijven de beoogde inrichting met het oog op de AVG (GDPR), AI-transparantie en toekomstige aansluiting op de EHDS en HDAB. Dit vormt geen verklaring of garantie van volledige wettelijke naleving.")}
        </p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          <Link to="/gebruiksvoorwaarden" style={{ fontSize: 10, fontWeight: 800, color: STZ.terra, textDecoration: "underline" }}>Gebruiksvoorwaarden →</Link>
          <Link to="/disclaimer" style={{ fontSize: 10, fontWeight: 800, color: STZ.terra, textDecoration: "underline" }}>Disclaimer →</Link>
          <Link to="/privacyverklaring" style={{ fontSize: 10, fontWeight: 800, color: STZ.terra, textDecoration: "underline" }}>Privacyverklaring →</Link>
          <Link to="/privacyverklaring-gezondheidsgegevens" style={{ fontSize: 10, fontWeight: 800, color: STZ.terra, textDecoration: "underline" }}>Privacyverklaring Gezondheidsgegevens →</Link>
          <Link to="/cookiebeleid" style={{ fontSize: 10, fontWeight: 800, color: STZ.terra, textDecoration: "underline" }}>Cookiebeleid →</Link>
          <Link to="/transparantieverklaring" style={{ fontSize: 10, fontWeight: 800, color: STZ.terra, textDecoration: "underline" }}>{T("Transparantieverklaring")} →</Link>
          <Link to="/toegankelijkheidsverklaring" style={{ fontSize: 10, fontWeight: 800, color: STZ.terra, textDecoration: "underline" }}>Toegankelijkheidsverklaring →</Link>
          <Link to="/verwerkingsregister" style={{ fontSize: 10, fontWeight: 800, color: STZ.terra, textDecoration: "underline" }}>{T("Verwerkingsregister")} →</Link>
          <Link to="/gegevensbeschermingseffectbeoordeling" style={{ fontSize: 10, fontWeight: 800, color: STZ.terra, textDecoration: "underline" }}>{T("Gegevensbeschermingseffectbeoordeling (DPIA)")} →</Link>
          <button
            type="button"
            onClick={() => openCookieVoorkeuren()}
            style={{ fontSize: 10, fontWeight: 800, color: STZ.terra, textDecoration: "underline", background: "none", border: "none", padding: 0, cursor: "pointer", fontFamily: "inherit" }}
          >
            Cookievoorkeuren aanpassen →
          </button>
        </div>
      </div>

      <ContactBlok />

      <div style={{ display: "flex", justifyContent: "center", gap: 14, marginTop: 18, paddingTop: 16, borderTop: `1px solid ${STZ.lijn}` }}>
        <a href="https://www.facebook.com/tekenrisicokaart" target="_blank" rel="noopener noreferrer" aria-label="Facebook" style={{ color: STZ.tekst, lineHeight: 0 }}>
          <Facebook size={20} fill={STZ.tekst} />
        </a>
        <a href="https://www.instagram.com/tekenrisicokaart" target="_blank" rel="noopener noreferrer" aria-label="Instagram" style={{ color: STZ.tekst, lineHeight: 0 }}>
          <Instagram size={20} />
        </a>
        <a href="https://www.x.com/tekenrisico" target="_blank" rel="noopener noreferrer" aria-label="X" style={{ color: STZ.tekst, lineHeight: 0 }}>
          <img src={xIconAsset.url} alt="X" width={20} height={20} style={{ display: "block" }} />
        </a>
      </div>
      </div>

    </div>

  );
}

function SeizoenTab({ onMaandClick }: { onMaandClick: (m: (typeof MAANDEN)[number], i: number) => void }) {
  /* Tekenradar-jaarcijfers als dataset uit de database (automatisch bijgewerkt). */
  const tekenradar = useTekenradarCijfers();
  /* Tekenactiviteit per maand komt automatisch uit RIVM/Tekenradar-cijfers. */
  const maanden = useMaandActiviteit();
  const laatsteJaar = tekenradar[0];
  const vorigJaar = tekenradar[1];
  const groei = laatsteJaar?.veranderingPct
    ?? (laatsteJaar && vorigJaar && vorigJaar.meldingen > 0
      ? Math.round(((laatsteJaar.meldingen - vorigJaar.meldingen) / vorigJaar.meldingen) * 100)
      : null);
  

  return (
    <div style={{ padding: 12 }}>
      <h2 style={{ fontSize: 13, fontWeight: 800, color: STZ.rood, margin: "0 0 8px" }}>Seizoen en tekenactiviteit</h2>
      <h3 style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".07em", color: STZ.terra, margin: "0 0 5px" }}>Tekenactiviteit per maand</h3>
      <div style={{ fontSize: 9, color: "#5A8299", marginBottom: 9 }}>Klik op een maand voor meer informatie</div>
      <div style={{ background: STZ.creme, border: `1px solid ${STZ.terra}40`, borderRadius: 6, padding: "7px 9px", fontSize: 9.5, color: STZ.tekst, lineHeight: 1.55, marginBottom: 9 }}>
        {laatsteJaar
          ? `Tekenradar.nl ontving in ${laatsteJaar.jaar} ${nlGetal(laatsteJaar.meldingen)} doorgegeven tekenbeten${groei != null ? `: ${groei > 0 ? `${groei}% meer` : `${Math.abs(groei)}% minder`} dan in ${laatsteJaar.jaar - 1}` : ""}. Meer meldingen betekent niet automatisch meer teken; het weerspiegelt ook meer aandacht voor tekenbeten. Bron: ${laatsteJaar.bron ?? "Tekenradar.nl"} — dit cijfer wordt automatisch bijgewerkt.`
          : TEKENRADAR_2025}
      </div>
      <div style={{ display: "flex", gap: 3, alignItems: "flex-end", height: 68, marginBottom: 9 }}>
        {maanden.map((m, i) => {
          const hoogte = 6 + m.v * 12;
          return (
            <div key={m.k} role="button" tabIndex={0} aria-label={`Tekenactiviteit ${m.k}`} onClick={() => onMaandClick(m, i)}
              onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onMaandClick(m, i); } }} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 3, cursor: "pointer" }}>
              <div style={{ width: "100%", height: hoogte, background: MAAND_COL[m.v] ?? "#ccc", borderRadius: 3, outline: i === curMnd ? `2px solid ${STZ.terra}` : "none", opacity: m.v === 0 ? 0.3 : 1 }} />
              <div style={{ fontSize: "clamp(6px,1.2vw,7.5px)", color: i === curMnd ? STZ.terra : STZ.tekst, fontWeight: i === curMnd ? 800 : 400 }}>{m.k}</div>
            </div>
          );
        })}
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 10 }}>
        {([["#E8F3FA", "Inactief"], ["#A9DDF5", "Laag"], ["#4A9FD4", "Matig"], ["#2E7BA0", "Hoog"], ["#1D4E63", "Piekseizoen"]] as const).map(([c, l]) => (
          <div key={l} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 9, color: STZ.tekst }}>
            <div style={{ width: 9, height: 9, borderRadius: 2, background: c }} />{l}
          </div>
        ))}
      </div>
      {(() => {
        const m = maanden[curMnd];
        const niveaus = ["Inactief", "Laag", "Matig", "Hoog", "Piekseizoen"];
        return m ? (
          <div style={{ background: STZ.rood, color: "#fff", borderRadius: 8, padding: "10px 12px", marginBottom: 10 }}>
            <div style={{ fontSize: 9, textTransform: "uppercase", letterSpacing: ".07em", opacity: .8 }}>Nu — {MAAND_NAMEN[curMnd]}</div>
            <div style={{ fontSize: 13, fontWeight: 800, margin: "2px 0 3px" }}>Tekenactiviteit: {niveaus[m.v]}</div>
            <div style={{ fontSize: 10, lineHeight: 1.55, opacity: .9 }}>{m.info}</div>
          </div>
        ) : null;
      })()}

      <div style={{ fontSize: 9, textTransform: "uppercase", letterSpacing: ".07em", color: STZ.terra, fontWeight: 700, marginBottom: 6 }}>Het tekenjaar per seizoen</div>
      {([["Lente (mrt–mei)", "#4A9FD4", "Activiteit stijgt snel zodra de bodem opwarmt. Nimfen komen massaal tevoorschijn — juist die kleine nimfen (1–2 mm) veroorzaken de meeste besmettingen omdat ze vaak onopgemerkt blijven."],
        ["Zomer (jun–aug)", "#1D4E63", "Juni is de drukste maand. Bij hitte en droogte trekken teken zich terug in schaduw, bosranden en vochtig struikgewas. Vakanties, kamperen en spelen in hoog gras zorgen voor veel beten bij kinderen."],
        ["Herfst (sep–nov)", "#2E7BA0", "Tweede piek in september: een nieuwe generatie volwassen teken wordt actief. Paddenstoelen zoeken, bladeren harken en boswandelingen zijn risicomomenten tot ver in oktober."],
        ["Winter (dec–feb)", "#A9DDF5", "Teken sterven niet af; ze overwinteren in de strooisellaag. Boven 5–7 °C kunnen ze weer actief worden, dus ook op zachte winterdagen is een tekencheck zinvol."]] as const).map(([h, c, t]) => (
        <div key={h} style={{ background: "#fff", border: `1px solid ${STZ.lijn}`, borderLeft: `4px solid ${c}`, borderRadius: 7, padding: "9px 11px", marginBottom: 6 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: STZ.rood, marginBottom: 2 }}>{h}</div>
          <div style={{ fontSize: 10, color: "#3E6A7D", lineHeight: 1.6 }}>{t}</div>
        </div>
      ))}

      <div style={{ fontSize: 9, textTransform: "uppercase", letterSpacing: ".07em", color: STZ.terra, fontWeight: 700, margin: "10px 0 6px" }}>Wat bepaalt de activiteit?</div>
      {([["Temperatuur", "Vanaf ongeveer 5–7 °C worden teken actief; bij 15–25 °C zijn ze het meest op zoek naar een gastheer."],
        ["Vochtigheid", "Teken drogen snel uit. Bij een luchtvochtigheid boven 80% — ochtenddauw, na regen, in de schaduw — zijn ze het actiefst."],
        ["Begroeiing", "Ze wachten op grashalmen en struiken tot ongeveer 1,5 meter hoogte langs paden, bosranden en in ruig gras."],
        ["Levensstadium", "Larve (voorjaar), nimf (piek mei–juli) en volwassen teek (voorjaar en najaar) volgen elk hun eigen seizoen."]] as const).map(([h, t]) => (
        <div key={h} style={{ background: STZ.creme, borderRadius: 7, padding: "8px 11px", borderLeft: `3px solid ${STZ.terra}`, marginBottom: 6 }}>
          <div style={{ fontSize: 10.5, fontWeight: 700, color: STZ.rood, marginBottom: 2 }}>{h}</div>
          <div style={{ fontSize: 10, color: "#3E6A7D", lineHeight: 1.55 }}>{t}</div>
        </div>
      ))}

      <div style={{ fontSize: 9, textTransform: "uppercase", letterSpacing: ".07em", color: STZ.terra, fontWeight: 700, margin: "10px 0 6px" }}>Goed om te weten</div>
      {([["Hele jaar actief", "Teken zijn het hele jaar aanwezig en worden actiever boven ongeveer 5–7 °C. Ook op een zonnige winterdag kunnen ze bijten."],
        ["Twee pieken", "Mei–juni en september zijn de gevaarlijkste maanden."],
        ["Tuin onderschat", "Meer dan 40% van de beten wordt opgelopen in de eigen tuin."],
        ["Snel verwijderen", "Borrelia kan via een besmette teek worden overgedragen. De kans op Lyme hangt onder meer af van de aanhechtingsduur en de teek. Snel verwijderen verkleint het risico, maar 24 uur is geen harde veilige grens. Verwijder een teek altijd zo snel mogelijk."],
        ["Hele jaar checken", "Naar schatting 1,5 miljoen tekenbeten per jaar in Nederland (RIVM-schatting) — verspreid over alle maanden, niet alleen de zomer."]] as const).map(([h, t]) => (
        <div key={h} style={{ background: STZ.creme, borderRadius: 7, padding: "9px 11px", borderLeft: `3px solid ${STZ.terra}`, marginBottom: 7 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: STZ.rood, marginBottom: 2 }}>{h}</div>
          <div style={{ fontSize: 10, color: "#3E6A7D", lineHeight: 1.55 }}>{t}</div>
        </div>
      ))}
    </div>
  );
}


function ZiektenInfoTab() {
  const en = useTaal() === "en";
  const [open, setOpen] = useState<string | null>(null);
  return (
    <div style={{ padding: "10px 10px 14px" }}>
      <div style={{ background: STZ.rood, color: "#fff", borderRadius: 8, padding: "10px 12px", marginBottom: 10, display: "flex", gap: 12, alignItems: "center" }}>
        <div style={{ fontSize: 26, fontWeight: 800, lineHeight: 1, flexShrink: 0 }}>{LANDELIJK_ZIEKTEN_UITLEG.aantal}</div>
        <div>
          <h2 style={{ fontSize: 12, fontWeight: 700, lineHeight: 1.2, margin: 0 }}>11 Aandoeningen in verband met teken</h2>
          <div style={{ fontSize: 9, opacity: 0.75, marginTop: 1 }}>~50% van de teken draagt één of meer ziekteverwekkers</div>
        </div>
      </div>
      <div style={{ background: "#fff", border: `1px solid ${STZ.lijn}`, borderRadius: 7, padding: "9px 11px", marginBottom: 10, fontSize: 10, color: STZ.tekst, lineHeight: 1.6 }}>
        <strong>Wat staat er in de lijst — en waarom?</strong><br />
        {LANDELIJK_ZIEKTEN_UITLEG.tekst[en ? "en" : "nl"]}
      </div>
      {ZIEKTEN.map((z) => {
        const io = open === z.id;
        return (
          <div key={z.id} style={{ background: io ? z.kleur + "12" : "#fff", borderRadius: 7, marginBottom: 6, border: `1px solid ${io ? z.kleur + "55" : STZ.lijn}`, borderLeft: `4px solid ${z.kleur}`, overflow: "hidden" }}>
            <div onClick={() => setOpen(io ? null : z.id)} style={{ display: "flex", alignItems: "center", gap: 7, padding: "8px 10px", cursor: "pointer", background: io ? z.kleur + "1F" : "#fff" }}>
              <div style={{ width: 20, height: 20, borderRadius: "50%", background: z.kleur, flexShrink: 0 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: io ? z.kleur : STZ.tekst, lineHeight: 1.2 }}>{z.naam}</div>
                <div style={{ fontSize: 8.5, color: "#123A52", marginTop: 1, display: "flex", alignItems: "center", gap: 5, flexWrap: "wrap" }}>
                  <span>{z.type} · {z.id === "alfagal" ? "geen verwekker in teek" : `Aantoning in teken: ${z.pct}`}</span>
                  {z.zoonose && <span style={{ fontSize: 7.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".05em", background: z.kleur, color: "#fff", borderRadius: 4, padding: "1px 5px" }}>Zoönose</span>}
                </div>
              </div>
              <span style={{ fontSize: 12, color: io ? z.kleur : STZ.terra }}>{io ? "▲" : "▼"}</span>
            </div>
            {io && (
              <div style={{ padding: "0 10px 10px", borderTop: `1px solid ${z.kleur}33` }}>
                <div style={{ fontSize: 10.5, color: STZ.tekst, lineHeight: 1.65, marginTop: 8, marginBottom: 6 }}>{z.tekst}</div>
                {z.pctNoot && <p className="mb-2 text-[10px] leading-relaxed text-foreground">{z.pctNoot}</p>}
                {z.zoonose && (
                  <div style={{ background: z.kleur + "0F", border: `1px solid ${z.kleur}33`, borderRadius: 6, padding: "7px 9px", marginBottom: 6 }}>
                    <div style={{ fontSize: 8.5, textTransform: "uppercase", letterSpacing: ".06em", color: z.kleur, fontWeight: 700, marginBottom: 2 }}>Zoönose</div>
                    <div style={{ fontSize: 10, color: STZ.tekst, lineHeight: 1.6 }}>Dit is een zoönose: een ziekte die van dier op mens kan overgaan.</div>
                  </div>
                )}
                {([["Symptomen", z.sympt],
                   ["Incubatietijd", ZIEKTE_EXTRA[z.id]?.incubatie],
                   [z.id === "alfagal" ? "Verband met tekenbeten" : "Overdracht", ZIEKTE_EXTRA[z.id]?.overdracht],
                   ["Behandeling", ZIEKTE_EXTRA[z.id]?.behandeling],
                   ["Wanneer naar de huisarts", ZIEKTE_EXTRA[z.id]?.arts]] as const).map(([lbl, val]) => val ? (
                  <div key={lbl} style={{ background: z.kleur + "0F", border: `1px solid ${z.kleur}33`, borderRadius: 6, padding: "7px 9px", marginBottom: 6 }}>
                    <div style={{ fontSize: 8.5, textTransform: "uppercase", letterSpacing: ".06em", color: z.kleur, fontWeight: 700, marginBottom: 2 }}>{lbl}</div>
                    <div style={{ fontSize: 10, color: STZ.tekst, lineHeight: 1.6 }}>{val}</div>
                  </div>
                ) : null)}
                <div style={{ background: z.kleur + "0F", border: `1px solid ${z.kleur}33`, borderRadius: 6, padding: "7px 9px", marginBottom: 6 }}>
                  <div style={{ fontSize: 8.5, textTransform: "uppercase", letterSpacing: ".06em", color: z.kleur, fontWeight: 700, marginBottom: 2 }}>Tekensoorten in verband gebracht met deze aandoening</div>
                  {tekenVoorZiekte(z.id).length ? tekenVoorZiekte(z.id).map((t) => (
                    <div key={t.id} style={{ fontSize: 10, color: STZ.tekst, lineHeight: 1.6 }}>• <strong>{t.naam}</strong> <em style={{ color: "#123A52" }}>({t.latijn})</em></div>
                  )) : <div style={{ fontSize: 10, color: STZ.tekst, lineHeight: 1.6 }}>In Nederland is geen tekensoort als bewezen overbrenger vastgesteld.</div>}
                </div>
                {ZIEKTE_EXTRA[z.id]?.weetje && (
                  <div style={{ background: z.kleur, color: "#fff", borderRadius: 6, padding: "7px 9px", fontSize: 10, lineHeight: 1.6 }}>
                    <strong>Goed om te weten: </strong>{ZIEKTE_EXTRA[z.id]?.weetje}
                  </div>
                )}
                {ZIEKTE_LCI[z.id] && (
                  <div style={{ background: z.kleur + "0F", border: `1px solid ${z.kleur}33`, borderRadius: 6, padding: "7px 9px", marginTop: 6 }}>
                    <div style={{ fontSize: 8.5, textTransform: "uppercase", letterSpacing: ".06em", color: z.kleur, fontWeight: 700, marginBottom: 2 }}>LCI-richtlijn (RIVM)</div>
                    <div style={{ fontSize: 10, color: STZ.tekst, lineHeight: 1.6 }}>
                      {ZIEKTE_LCI[z.id]!.omschrijving}{" "}
                      <a href={ZIEKTE_LCI[z.id]!.url} target="_blank" rel="noopener noreferrer" style={{ color: z.kleur, textDecoration: "underline", fontWeight: 700 }}>{ZIEKTE_LCI[z.id]!.label}</a>
                    </div>
                  </div>
                )}
                <div style={{ background: z.kleur + "0F", border: `1px solid ${z.kleur}33`, borderRadius: 6, padding: "7px 9px", marginTop: 6 }}>
                  <div style={{ fontSize: 8.5, textTransform: "uppercase", letterSpacing: ".06em", color: z.kleur, fontWeight: 700, marginBottom: 2 }}>Meer weten</div>
                  <div style={{ fontSize: 10, color: STZ.tekst, lineHeight: 1.6 }}>
                    Stichting Tekenbeetziekten{" "}
                    <a href="https://www.tekenbeetziekten.nl" target="_blank" rel="noopener noreferrer" style={{ color: z.kleur, textDecoration: "underline", fontWeight: 700 }}>www.tekenbeetziekten.nl</a>
                  </div>
                </div>




              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

const LEVENSSTADIA: { naam: string; latijn: string; grootte: string; tekst: string }[] = [
  { naam: "Larve", latijn: "larva", grootte: "± 0,5–1 mm", tekst: "De larve is net uit het ei gekropen, is zo groot als een speldenkop en heeft maar zes poten. Larven bijten zelden mensen; ze zuigen vooral bloed bij kleine dieren zoals muizen en vogels. Daarna vervellen ze tot nimf." },
  { naam: "Nimf", latijn: "nympha", grootte: "± 1–2 mm", tekst: "De nimf heeft acht poten en is zo groot als een maanzaadje of speldeknop — moeilijk te zien op de huid. Juist nimfen veroorzaken veel tekenbeten bij mensen en kunnen al ziekteverwekkers zoals de Lyme-bacterie overbrengen." },
  { naam: "Volwassen mannetje", latijn: "imago ♂", grootte: "± 2–3 mm", tekst: "Het volwassen mannetje is donkerbruin en blijft klein; hij zuipt zich niet vol met bloed. Mannetjes bijten zelden en spelen vooral een rol bij de voortplanting." },
  { naam: "Volwassen vrouwtje", latijn: "imago ♀", grootte: "± 3–4 mm (tot ± 1 cm volgezogen)", tekst: "Het volwassen vrouwtje heeft een roodbruin achterlijf en een donker rugschild. Ze zuigt zich in enkele dagen vol met bloed en kan daarbij flink uitzetten. Daarna legt ze honderden eitjes, waaruit weer larven kruipen." },
];

function LevensstadiaBlok({ open, onToggle }: { open: boolean; onToggle: () => void }) {
  return (
    <div style={{ background: open ? "#144D6B12" : "#fff", borderRadius: 7, marginBottom: 6, border: `1px solid ${open ? "#144D6B55" : STZ.lijn}`, borderLeft: "4px solid #144D6B", overflow: "hidden" }}>
      <div onClick={onToggle} style={{ display: "flex", alignItems: "center", gap: 7, padding: "8px 10px", cursor: "pointer", background: open ? "#144D6B1F" : "#fff" }}>
        <div style={{ width: 20, height: 20, borderRadius: "50%", background: "#144D6B", flexShrink: 0 }} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: open ? "#144D6B" : STZ.tekst, lineHeight: 1.2 }}>Levensstadia van de teek</div>
          <div style={{ fontSize: 8.5, color: "#123A52", marginTop: 1 }}>Van ei en larve tot nimf en volwassen teek</div>
        </div>
        <span style={{ fontSize: 12, color: open ? "#144D6B" : STZ.terra }}>{open ? "▲" : "▼"}</span>
      </div>
      {open && (
        <div style={{ padding: "0 10px 10px", borderTop: "1px solid #144D6B33" }}>
          <div style={{ fontSize: 10.5, color: STZ.tekst, lineHeight: 1.65, marginTop: 8, marginBottom: 6 }}>
            Een teek doorloopt vier levensstadia: ei, larve, nimf en volwassen teek (imago). In elk stadium na de larve
            heeft de teek één bloedmaaltijd nodig om door te groeien. Bij de schapenteek (Ixodes ricinus), veruit de
            meest voorkomende teek in Nederland, zien de stadia er als volgt uit.
          </div>
          <figure style={{ margin: "0 0 6px", borderRadius: 6, overflow: "hidden", border: "1px solid #144D6B33" }}>
            <img src={levensstadiaSchaalAsset.url} alt="Levensstadia van de schapenteek op een millimeterschaal: volwassen vrouwtje, volwassen mannetje, nimf en larve" loading="lazy" style={{ width: "100%", display: "block" }} />
            <figcaption style={{ fontSize: 8.5, color: "#3E6A7D", lineHeight: 1.5, padding: "5px 8px", background: "#fff" }}>
              Van links naar rechts: volwassen vrouwtje, volwassen mannetje, nimf en larve van de schapenteek, op ware grootte (mm-schaal).
            </figcaption>
          </figure>
          {LEVENSSTADIA.map((s) => (
            <div key={s.naam} style={{ background: "#144D6B0F", border: "1px solid #144D6B33", borderRadius: 6, padding: "7px 9px", marginBottom: 6 }}>
              <div style={{ fontSize: 8.5, textTransform: "uppercase", letterSpacing: ".06em", color: "#144D6B", fontWeight: 700, marginBottom: 2 }}>
                {s.naam} <span style={{ fontWeight: 400, textTransform: "none" }}>(<em>{s.latijn}</em>) — {s.grootte}</span>
              </div>
              <div style={{ fontSize: 10, color: STZ.tekst, lineHeight: 1.6 }}>{s.tekst}</div>
            </div>
          ))}
          <figure style={{ margin: "0 0 6px", borderRadius: 6, overflow: "hidden", border: "1px solid #144D6B33" }}>
            <img src={levensstadiaNagelAsset.url} alt="Verschillende levensstadia van de teek op een vingernagel ter vergelijking van de grootte" loading="lazy" style={{ width: "100%", display: "block" }} />
            <figcaption style={{ fontSize: 8.5, color: "#3E6A7D", lineHeight: 1.5, padding: "5px 8px", background: "#fff" }}>
              Ter vergelijking: volwassen teken, een nimf en een larve op een vingernagel. Vooral nimfen en larven zijn zo klein dat ze gemakkelijk over het hoofd worden gezien.
            </figcaption>
          </figure>
        </div>
      )}
    </div>
  );
}

function TekensoortenTab() {
  const [open, setOpen] = useState<string | null>(null);
  const ziekteNaam = (id: string) => ZIEKTEN.find((z) => z.id === id)?.naam ?? id;
  return (
    <div style={{ padding: "10px 10px 14px" }}>
      <div style={{ background: STZ.rood, color: "#fff", borderRadius: 8, padding: "10px 12px", marginBottom: 10, display: "flex", gap: 12, alignItems: "center" }}>
        <div style={{ fontSize: 26, fontWeight: 800, lineHeight: 1, flexShrink: 0 }}>{TEKENSOORTEN.length}</div>
        <div>
          <h2 style={{ fontSize: 12, fontWeight: 700, lineHeight: 1.2, margin: 0 }}>Tekensoorten in Nederland</h2>
          <div style={{ fontSize: 9, opacity: 0.75, marginTop: 1 }}>De soorten die er voor mens en huisdier toe doen</div>
        </div>
      </div>
      <div style={{ fontSize: 10, color: "#3E6A7D", lineHeight: 1.6, marginBottom: 10 }}>
        In Nederland komen ongeveer 15 tekensoorten voor. Hieronder de soorten die mensen kunnen bijten, met herkenning,
        leefgebied en de tekenbeetziekten die ze bij zich kunnen dragen en via een beet kunnen overbrengen.
        Bron: Stichting Tekenbeetziekten, RIVM en Centrum Monitoring Vectoren (NVWA).
      </div>
      <LevensstadiaBlok open={open === "levensstadia"} onToggle={() => setOpen(open === "levensstadia" ? null : "levensstadia")} />
      {TEKENSOORTEN.map((t) => {
        const io = open === t.id;
        const fotos = TEEK_FOTO[t.id] ?? [];
        const provs = PROVINCIES.filter((p) => (PROV_TEKEN[p.id] ?? []).includes(t.id));
        const ziekten = [...t.ziekten.map(ziekteNaam), ...(t.extraZiekten ?? [])];
        return (
          <div key={t.id} style={{ background: io ? t.kleur + "12" : "#fff", borderRadius: 7, marginBottom: 6, border: `1px solid ${io ? t.kleur + "55" : STZ.lijn}`, borderLeft: `4px solid ${t.kleur}`, overflow: "hidden" }}>
            <div onClick={() => setOpen(io ? null : t.id)} style={{ display: "flex", alignItems: "center", gap: 7, padding: "8px 10px", cursor: "pointer", background: io ? t.kleur + "1F" : "#fff" }}>
              <div style={{ width: 20, height: 20, borderRadius: "50%", background: t.kleur, flexShrink: 0 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: io ? t.kleur : STZ.tekst, lineHeight: 1.2 }}>{t.naam}</div>
                <div style={{ fontSize: 8.5, color: "#123A52", marginTop: 1 }}><em>{t.latijn}</em></div>
              </div>
              <span style={{ fontSize: 12, color: io ? t.kleur : STZ.terra }}>{io ? "▲" : "▼"}</span>
            </div>
            {io && (
              <div style={{ padding: "0 10px 10px", borderTop: `1px solid ${t.kleur}33` }}>
                <div style={{ fontSize: 10.5, color: STZ.tekst, lineHeight: 1.65, marginTop: 8, marginBottom: 6 }}>{t.tekst}</div>
                {([["Voorkomen", t.status], ["Herkenning", t.herkenning], ["Leefgebied", t.voorkomen]] as const).map(([lbl, val]) => (
                  <div key={lbl} style={{ background: t.kleur + "0F", border: `1px solid ${t.kleur}33`, borderRadius: 6, padding: "7px 9px", marginBottom: 6 }}>
                    <div style={{ fontSize: 8.5, textTransform: "uppercase", letterSpacing: ".06em", color: t.kleur, fontWeight: 700, marginBottom: 2 }}>{lbl}</div>
                    <div style={{ fontSize: 10, color: STZ.tekst, lineHeight: 1.6 }}>{val}</div>
                  </div>
                ))}
                <div style={{ background: t.kleur + "0F", border: `1px solid ${t.kleur}33`, borderRadius: 6, padding: "7px 9px", marginBottom: 6 }}>
                  <div style={{ fontSize: 8.5, textTransform: "uppercase", letterSpacing: ".06em", color: t.kleur, fontWeight: 700, marginBottom: 2 }}>Tekenbeetziekten die deze teek kan overbrengen</div>
                  <div style={{ fontSize: 10, color: STZ.tekst, lineHeight: 1.6 }}>
                    {ziekten.length ? ziekten.map((z) => (
                      <div key={z}>• <strong>{z}</strong></div>
                    )) : "In Nederland is geen ziekteoverdracht op de mens aangetoond."}
                  </div>
                </div>
                {provs.length > 0 && (
                  <div style={{ background: t.kleur + "0F", border: `1px solid ${t.kleur}33`, borderRadius: 6, padding: "7px 9px", marginBottom: 6 }}>
                    <div style={{ fontSize: 8.5, textTransform: "uppercase", letterSpacing: ".06em", color: t.kleur, fontWeight: 700, marginBottom: 2 }}>Speelt een rol in</div>
                    <div style={{ fontSize: 10, color: STZ.tekst, lineHeight: 1.6 }}>{provs.map((p) => p.naam).join(", ")}</div>
                  </div>
                )}
                {fotos.map((f) => (
                  <figure key={f.src} style={{ margin: "0 0 6px", borderRadius: 6, overflow: "hidden", border: `1px solid ${t.kleur}33` }}>
                    <img src={f.src} alt={f.bijschrift} loading="lazy" style={{ width: "100%", display: "block" }} />
                    <figcaption style={{ fontSize: 8.5, color: "#3E6A7D", lineHeight: 1.5, padding: "5px 8px", background: "#fff" }}>
                      {f.bijschrift} Bron:{" "}
                      <a href={f.bronUrl} target="_blank" rel="noopener noreferrer" style={{ color: t.kleur, textDecoration: "underline", fontWeight: 700 }}>{f.bron}</a>
                    </figcaption>
                  </figure>
                ))}
              </div>
            )}
          </div>
        );
      })}
      <div style={{ fontSize: 9.5, color: "#5A8299", lineHeight: 1.55, marginTop: 8 }}>
        Controleer na een verblijf in het groen altijd uw lichaam op teken en verwijder een teek zo snel mogelijk.
        Dit is voorlichting en geen medisch advies.
      </div>
    </div>
  );
}

type Tip = { x: number; y: number; content: Provincie | { _tbe: true; naam: string; info: string } };

export default function Tekenkaart() {
  const { peildatum } = useDataStatus();
  const laatstBijgewerkt = PEILDATUM_AUTO;
  /* Automatisch bijgewerkte cijfers: TBE per jaar en tekenactiviteit per maand. */
  const tbeCijfers = useTbeCijfersTekst();
  const maandActiviteit = useMaandActiviteit();
  /* Taalwissel: alle gegevens opnieuw ophalen en de kaart opnieuw opbouwen (niet uit cache). */
  const taal = useTaal();
  const en = taal === "en";
  const queryClient = useQueryClient();
  const eersteTaal = useRef(true);
  useEffect(() => {
    if (eersteTaal.current) { eersteTaal.current = false; return; }
    void queryClient.invalidateQueries();
  }, [taal, queryClient]);
  /* Live cijfers uit de database: percentages en risicoklassen komen niet meer uit de broncode. */
  const liveCijfers = useLiveCijfers();
  const kaartKey = `kaart-${taal}-${liveCijfers.stempel}`;
  const [sel, setSel] = useState<Provincie | null>(null);
  const [tab, setTab] = useState("prov");
  const [tbeOn, setTbeOn] = useState(false);
  const [meldSoortenAan, setMeldSoortenAan] = useState<MeldSoort[]>(["dermacentor", "hyalomma"]);
  const [tekenMeldingenOn, setTekenMeldingenOn] = useState(false);
  const [tekenMeldingPop, setTekenMeldingPop] = useState<TekenMelding | null>(null);
  const [tuinOn, setTuinOn] = useState(false);
  const [beetOn, setBeetOn] = useState(false);


  const [ziekteLaag, setZiekteLaag] = useState<string | null>(null);
  const [tbePop, setTbePop] = useState<(typeof TBE_MELDINGEN)[number] | null>(null);
  const [maandPop, setMaandPop] = useState<{ m: (typeof MAANDEN)[number]; i: number } | null>(null);
  const [provPop, setProvPop] = useState<Provincie | null>(null);
  const [tt, setTt] = useState<Tip | null>(null);
  const [searchQ, setSearchQ] = useState("");
  const [showDrop, setShowDrop] = useState(false);
  const [mobile, setMobile] = useState(false);
  const [tabletStaand, setTabletStaand] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [legendaOpen, setLegendaOpen] = useState(true);
  const [gemSel, setGemSel] = useState<Gemeente | null>(null);
  const [gemQ, setGemQ] = useState("");
  const kiesGemeente = useCallback((g: Gemeente) => {
    setGemSel(g); setTab("gem"); setSel(null);
    if (window.innerWidth >= 680) setShowMap(true);
    setTimeout(() => listRef.current?.scrollTo({ top: 0 }), 60);
  }, []);
  const gemBox = tab === "gem" && gemSel ? (() => {
    const [x0, y0, x1, y1] = gemSel.bb;
    let w = Math.max(x1 - x0, 45) * 2, h = Math.max(y1 - y0, 45) * 2;
    if (w / h > 500 / 580) h = w * 580 / 500; else w = h * 500 / 580;
    const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2;
    return { x: cx - w / 2, y: cy - h / 2, w, h };
  })() : null;
  const gemZoom = gemBox ? 500 / gemBox.w : 1;
  const gemViewBox = gemBox ? `${gemBox.x.toFixed(1)} ${gemBox.y.toFixed(1)} ${gemBox.w.toFixed(1)} ${gemBox.h.toFixed(1)}` : "0 0 500 580";
  const mapRef = useRef<HTMLElement | null>(null);
  const detailRef = useRef<HTMLDivElement | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const check = () => {
      const w = window.innerWidth, h = window.innerHeight;
      setMobile(w < 680);
      setTabletStaand(w >= 680 && w < 1024 && h > w);
    };
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  /* Deeplink: ?tab=help#help-tekenbeetgids opent Help en scrollt naar de gevraagde kop.
     Werkt ook bij client-side navigatie (bijv. vanuit TekenbeetGids). */
  const search = useSearch({ strict: false }) as { tab?: string };
  useEffect(() => {
    if (search.tab && search.tab !== tab) goTab(search.tab);
  }, [search.tab, tab]);

  useEffect(() => {
    if (window.location.hash) {
      const id = window.location.hash.slice(1);
      const scroll = () => document.getElementById(id)?.scrollIntoView({ block: "start" });
      setTimeout(scroll, 150);
      setTimeout(scroll, 500);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search.tab]);



  const hits = zoekPlaatsen(searchQ, 10);

  const selectProv = useCallback((p: Provincie) => {
    setSel(p); setTab("prov"); setSearchQ(""); setShowDrop(false);
    if (mobile) setShowMap(false);
    // Alleen het inhoudspaneel scrollen. scrollIntoView verplaatst op mobiel
    // soms de complete interface en daarmee ook de vaste legendabalk.
    setTimeout(() => listRef.current?.scrollTo({ top: 0 }), 60);
  }, [mobile]);

  const goTab = useCallback((id: string) => {
    setTab((prev) => {
      if (prev !== id) { setSel(null); setZiekteLaag(null); if (id !== "tekenmeldingen") { setTekenMeldingenOn(false); setTekenMeldingPop(null); } }
      return id;
    });
    if (mobile) setShowMap(false);
    setTimeout(() => { if (listRef.current) listRef.current.scrollTop = 0; }, 0);
  }, [mobile]);

  const onMove = useCallback((e: React.MouseEvent, content: Tip["content"]) => {
    if (!mapRef.current || mobile) return;
    const r = mapRef.current.getBoundingClientRect();
    setTt({ x: e.clientX - r.left, y: e.clientY - r.top, content });
  }, [mobile]);

  const getFill = useCallback((pid: string) => {
    if (beetOn && tuinOn) return TUIN_KLEUR[TUINBEET_PCT[pid] ?? ""] ?? "#C9D5DB";
    if (beetOn && !tuinOn) return BEET_KLEUR[tekenbeetKlasse(TEKENBEET_AANTAL[pid])] ?? "#C9D5DB";

    if (ziekteLaag) {
      const z = ZIEKTEN.find((x) => x.id === ziekteLaag);
      if (!z) return "#C9D5DB";
      if (z.id === "cchf") return RISK[0];
      // In het Landelijk-overzicht tonen we de ziekte als één landelijke kleur,
      // niet per provincie.
      if (tab === "landelijk") {
        const r = natRisico(z);
        const alpha = [0, 0.15, 0.3, 0.5, 0.7, 0.9][r] ?? 0.3;
        return z.kleur + Math.round(alpha * 255).toString(16).padStart(2, "0");
      }
      const r = ziekteKaartKlasse(z, PROVINCIES.find((p) => p.id === pid));
      const alpha = [0, 0.15, 0.3, 0.5, 0.7, 0.9][r] ?? 0.3;
      return z.kleur + Math.round(alpha * 255).toString(16).padStart(2, "0");
    }
    const p = PROVINCIES.find((x) => x.id === pid);
    return RISK[p?.risk || 1];
  }, [ziekteLaag, tuinOn, beetOn, tab]);


  const kaartProvincies = PROVINCIES.filter((p) => PATHS[p.id]);
  const sorted = [...PROVINCIES].sort((a, b) => b.risk - a.risk);

  const [standalone, setStandalone] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(display-mode: standalone)");
    const upd = () => setStandalone(mq.matches || (window.navigator as any).standalone === true);
    upd();
    mq.addEventListener?.("change", upd);
    return () => mq.removeEventListener?.("change", upd);
  }, []);

  // Werkelijke zichtbare hoogte. Alleen bij echte formaatwijzigingen bijwerken:
  // een visualViewport-scroll tijdens het lezen mag de legendabalk niet verplaatsen.
  const [appH, setAppH] = useState<number | null>(null);
  useEffect(() => {
    const upd = () => {
      const vv = window.visualViewport;
      setAppH(Math.round(vv ? vv.height : window.innerHeight));
    };
    upd();
    window.addEventListener("resize", upd);
    window.addEventListener("orientationchange", upd);
    window.visualViewport?.addEventListener("resize", upd);
    return () => {
      window.removeEventListener("resize", upd);
      window.removeEventListener("orientationchange", upd);
      window.visualViewport?.removeEventListener("resize", upd);
    };
  }, []);



  // iPadOS kan in standalone 0px rapporteren terwijl de statusbalk nog zichtbaar
  // is. Houd de inhoud onder die balk; ook Safari gebruikt de echte safe-area.
  const padX = standalone ? (mobile ? "clamp(10px,3vw,16px)" : "clamp(14px,1.6vw,22px)") : (mobile ? "12px" : "16px");
  const padY = standalone ? (mobile ? "clamp(6px,1vh,11px)" : "clamp(8px,1.1vh,14px)") : (mobile ? "7px" : "9px");
  const footPadY = standalone ? padY : "9px";
  const footPadX = standalone ? padX : "12px";
  const safeTop = `calc(${padY} + max(env(safe-area-inset-top, 0px), ${standalone ? "44px" : "0px"}))`;
  const safeBottom = standalone ? `calc(${footPadY} + env(safe-area-inset-bottom,0px))` : footPadY;
  const safeLeft = `calc(${padX} + env(safe-area-inset-left, 0px))`;
  const safeRight = `calc(${padX} + env(safe-area-inset-right, 0px))`;

  const navBtnStyle = (active: boolean): React.CSSProperties => ({
    flex: "1 1 auto",
    padding: mobile ? "6px 8px" : "9px 10px",
    fontSize: mobile ? "clamp(7.5px,2.4vw,9.5px)" : "clamp(8.5px,1.5vw,10.5px)",
    fontWeight: 700,
    border: "none",
    background: active ? STZ.terra : "transparent",
    color: "#fff",
    cursor: "pointer",
    fontFamily: "inherit",
    borderBottom: active ? "3px solid rgba(255,255,255,.4)" : "3px solid transparent",
    whiteSpace: "normal",
    lineHeight: 1.15,
    textAlign: "center",
    boxSizing: "border-box",
    minWidth: 0,
  });

  return (
    <div style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", position: "fixed", inset: 0, width: "100%", height: appH ? `${appH}px` : "100dvh", maxHeight: appH ? `${appH}px` : "100dvh", display: "flex", flexDirection: "column", overflow: "hidden", background: STZ.header, color: STZ.tekst }}>
      {tbePop && <TBEPopup m={tbePop} onClose={() => setTbePop(null)} />}
      {maandPop && <MaandPopup m={maandPop.m} idx={maandPop.i} onClose={() => setMaandPop(null)} />}
      {provPop && <ProvinciePopup p={provPop} onClose={() => setProvPop(null)} onMeer={() => { const q = provPop; setProvPop(null); selectProv(q); }} />}

      <header className="kaart-header" style={{ background: STZ.header, paddingTop: safeTop, paddingBottom: padY, paddingLeft: safeLeft, paddingRight: safeRight, display: "flex", alignItems: "center", gap: 10, flexShrink: 0, borderBottom: `1px solid ${STZ.lijn}` }}>
        <h1 style={{ margin: 0, lineHeight: 0 }}>
          <img src={LOGO_SRC} alt="" aria-hidden="true" style={{ height: mobile ? 26 : 34, width: "auto", objectFit: "contain" }} />
          <span suppressHydrationWarning style={{ position: "absolute", width: 1, height: 1, padding: 0, margin: -1, overflow: "hidden", clip: "rect(0 0 0 0)", whiteSpace: "nowrap", border: 0 }}>
            TekenRisicoKaart — interactieve kaart voor tekenbeetrisico en tekenbeetziekten in Nederland
          </span>
        </h1>

        <TaalKnop kleur={STZ.rood} scheiding={STZ.lijn} />



        {!mobile && (
          <div style={{ marginLeft: "auto", display: "flex", flexWrap: "wrap", gap: 5, alignItems: "center" }}>
            {([["1,5 mln", "tekenbeten/jr"], ["~27.000", "Lyme-diagnoses/jr (RIVM-schatting 2017)"], ["~1 op 5", "teken met Borrelia"]] as const).map(([v, l]) => (
              <div key={l} suppressHydrationWarning title={l.startsWith("Lyme") ? vertaalTekst("Circa 27.000 Lyme-diagnoses per jaar is de RIVM-schatting voor 2017 uit huisartsenonderzoek: ongeveer 25.500 met erythema migrans en 1.500 met andere verschijnselen van verspreide Lyme. Het is geen actuele jaarlijkse EM-registratie.", en) : undefined} style={{ background: STZ.rood, color: "#fff", borderRadius: 5, padding: "3px 9px", fontSize: 9.5, display: "flex", alignItems: "center", gap: 3 }}>
                <strong suppressHydrationWarning style={{ fontSize: 11 }}>{v}</strong>{vertaalTekst(l, en)}
              </div>
            ))}
            {mounted && (
              <div style={{ background: STZ.terra, color: "#fff", borderRadius: 5, padding: "3px 9px", fontSize: 9.5, display: "flex", alignItems: "center", gap: 3 }}>
                <strong style={{ fontSize: 11 }}>{HUIDIG_SEIZOEN}</strong>{MAAND_NAMEN[curMnd]}
              </div>
            )}
          </div>
        )}
      </header>

      <div style={{ background: STZ.rood, flexShrink: 0 }}>
        <div style={{ paddingTop: padY, paddingBottom: padY, paddingLeft: safeLeft, paddingRight: safeRight, position: "relative" }}>
          <div style={{ position: "relative" }}>
            <input value={searchQ}
              onChange={(e) => { setSearchQ(e.target.value); setShowDrop(true); }}
              onFocus={() => setShowDrop(true)}
              onKeyDown={(e) => { if (e.key === "Enter" && hits[0]) selectProv(hits[0].prov); if (e.key === "Escape") setShowDrop(false); }}
              placeholder="Zoek plaatsnaam, gemeente of provincie…"
              aria-label="Zoek plaats of provincie"
              style={{ width: "100%", padding: "8px 34px 8px 11px", border: "none", borderRadius: 5, fontSize: "clamp(11px,2vw,13px)", fontFamily: "inherit", background: "rgba(255,255,255,.14)", color: "#fff", outline: "none", boxSizing: "border-box" }} />
            <span style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", fontSize: 13, color: "rgba(255,255,255,.6)", pointerEvents: "none" }}>⌕</span>
          </div>
          {showDrop && hits.length > 0 && (
            <ul style={{ position: "absolute", zIndex: 500, top: "calc(100% - 1px)", left: 12, right: 12, background: "#fff", border: `1px solid ${STZ.lijn}`, borderRadius: 5, boxShadow: "0 8px 24px rgba(0,0,0,.2)", maxHeight: 220, overflowY: "auto", listStyle: "none", margin: 0, padding: 0 }}>
              {hits.map((h, i) => (
                <li key={h.type + h.lbl + i} onClick={() => { const g = h.type === "Provincie" ? null : vindGemeente(h.gemeente ?? h.lbl, h.prov.id); if (g) { kiesGemeente(g); setSearchQ(""); setShowDrop(false); goTab("gem"); setTimeout(() => kiesGemeente(g), 0); } else selectProv(h.prov); }}
                  style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 11px", fontSize: "clamp(11px,2vw,12.5px)", cursor: "pointer", borderBottom: `1px solid ${STZ.lijn}`, color: STZ.tekst }}>
                  <div style={{ width: 7, height: 7, borderRadius: "50%", background: RISK[h.prov.risk], flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0 }}><strong>{h.lbl}</strong><span style={{ color: "#5A8299", fontSize: 9.5, marginLeft: 5 }}>{h.type === "Plaats" ? `gem. ${h.gemeente} · ${h.prov.naam}` : h.type === "Gemeente" ? `in ${h.prov.naam}` : "provincie"}</span></div>
                  <span style={{ fontSize: 9, color: "#5A8299" }}>{h.type}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
        <nav style={{ display: "flex", flexWrap: "wrap", borderTop: "1px solid rgba(255,255,255,.1)" }}>
          {([["landelijk", "Landelijk"], ["prov", "Provincies"], ["gem", "Gemeenten"], ["ziektelaag", "Risico's per tekenbeetziekte"]] as const).map(([id, lbl]) => (
            <button key={id} onClick={() => goTab(id)} style={navBtnStyle(tab === id)}>
              {vertaalTekst(lbl, taal === "en")}
            </button>
          ))}
          <button onClick={() => { setTbeOn((v) => !v); if (mobile) setShowMap(true); }}
            aria-pressed={tbeOn}
            style={{ ...navBtnStyle(tbeOn), background: tbeOn ? "#A63428" : "transparent" }}>
            {vertaalTekst("TBE-meldingen", taal === "en")}
          </button>
          {([["ziekteninfo", "Tekenbeetziekten"], ["tekensoorten", "Tekensoorten"]] as const).map(([id, lbl]) => (
            <button key={id} onClick={() => goTab(id)} style={navBtnStyle(tab === id)}>
              {vertaalTekst(lbl, taal === "en")}
            </button>
          ))}
          <Button variant="ghost" onClick={() => { goTab("tekenmeldingen"); setTekenMeldingenOn(true); setShowMap(!mobile); }} aria-pressed={tab === "tekenmeldingen"} style={navBtnStyle(tab === "tekenmeldingen")}>
            {taal === "en" ? "Tick reports" : "Tekenmeldingen"}
          </Button>
          <button onClick={() => { setBeetOn((v) => { const n = !v; if (n) setTuinOn(false); return n; }); setShowMap(true); }}
            aria-pressed={beetOn} title="Toon per provincie tekenbeten: geschat aantal per jaar of aandeel in de eigen tuin"
            style={navBtnStyle(beetOn)}>
            {vertaalTekst("Tekenbeten", taal === "en")}
          </button>

          {([["seizoen", "Seizoen"]] as const).map(([id, lbl]) => (
            <button key={id} onClick={() => goTab(id)} style={navBtnStyle(tab === id)}>
              {vertaalTekst(lbl, taal === "en")}
            </button>
          ))}

          <button onClick={() => setShowMap((v) => !v)} aria-label={vertaalTekst("Kaart tonen", taal === "en")} aria-pressed={showMap}
            style={navBtnStyle(showMap)}>
            {vertaalTekst("Kaart", taal === "en")}
          </button>
          <button onClick={() => goTab("tekenbeethulp")}
            style={navBtnStyle(tab === "tekenbeethulp")}>
            {vertaalTekst("TekenbeetGids", taal === "en")}
          </button>
          <button onClick={() => goTab("help")}
            style={navBtnStyle(tab === "help")}>
            {vertaalTekst("Help", taal === "en")}
          </button>
        </nav>

      </div>

      <p data-geen-vertaling className="m-0 border-b border-border bg-card px-3 py-1 text-[10px] font-semibold leading-relaxed text-card-foreground">{vertaalTekst(GEBIEDSINDICATIE_ZIN, en)}</p>
      <div style={{ display: "flex", flex: 1, minHeight: 0, overflow: "hidden", background: STZ.creme, flexDirection: mobile ? "column" : tabletStaand ? "column-reverse" : "row" }}>
        {(!mobile || !showMap) && (
          <aside style={{ width: mobile || tabletStaand || !showMap ? "100%" : "clamp(320px, 34vw, 420px)", flexShrink: 0, position: "relative", display: "flex", flexDirection: "column", background: "#fff", borderRight: mobile || tabletStaand || !showMap ? "none" : `1px solid ${STZ.lijn}`, borderTop: tabletStaand ? `1px solid ${STZ.lijn}` : "none", overflow: "hidden", flex: mobile || tabletStaand || !showMap ? 1 : "none", minHeight: 0 }}>
            <div ref={listRef} style={{ position: "absolute", inset: 0, paddingBottom: legendaOpen ? (appH ? `${Math.round(appH * 0.55)}px` : "55dvh") : "56px", overflowY: "auto", boxSizing: "border-box" }} onClick={() => setShowDrop(false)}>
              {tab === "gem" && (() => {
                const en = taal === "en";
                const gp = gemSel ? PROVINCIES.find((x) => x.id === gemSel.prov) : null;
                const lijst = gemQ.trim() ? zoekGemeenten(gemQ, 30) : GEMEENTEN;
                return (
                  <div style={{ padding: "12px" }}>
                    <h2 style={{ fontSize: 15, fontWeight: 800, color: STZ.rood, margin: "0 0 6px" }}>{en ? "Municipalities" : "Gemeenten"}</h2>
                    <p style={{ fontSize: 11, lineHeight: 1.5, color: STZ.tekst, margin: "0 0 8px" }}>
                      {en ? "Search a municipality or town, or tap a municipality on the map. The map zooms in and shows its boundary." : "Zoek een gemeente of plaats, of tik een gemeente aan op de kaart. De kaart zoomt in en toont de gemeentegrens."}
                    </p>
                    <div style={{ position: "relative", marginBottom: 10 }}>
                      <input type="search" value={gemQ} onChange={(e) => setGemQ(e.target.value)}
                        placeholder={en ? "Municipality or town…" : "Gemeente of plaats…"} aria-label={en ? "Search municipality" : "Zoek gemeente"}
                        style={{ width: "100%", boxSizing: "border-box", padding: "9px 30px 9px 10px", borderRadius: 8, border: `1px solid ${STZ.lijn}`, fontSize: 14, fontFamily: "inherit", background: "#fff", color: STZ.tekst }} />
                      <span aria-hidden="true" style={{ position: "absolute", right: 9, top: "50%", transform: "translateY(-50%)", fontSize: 13, color: STZ.rood, pointerEvents: "none" }}>⌕</span>

                    </div>

                    {gemSel && gp && (
                      <div style={{ border: `1px solid ${STZ.lijn}`, borderLeft: `4px solid ${STZ.terra}`, borderRadius: 8, padding: "10px 12px", marginBottom: 10, background: "#F5FAFD" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                          <strong style={{ fontSize: 14, color: STZ.rood }}>{en ? "Municipality" : "Gemeente"} {gemSel.naam}</strong>
                          <button type="button" onClick={() => setGemSel(null)} aria-label={en ? "Close" : "Sluiten"} style={{ border: "none", background: "none", cursor: "pointer", fontSize: 16, color: STZ.tekst }}>×</button>
                        </div>
                        {(() => {
                          const c = GEMEENTE_CIJFERS[gemSel.id] ?? {};
                          const [x0, y0, x1, y1] = gemSel.bb;
                          void x0; void y0; void x1; void y1;
                          const tbeG = tbeVoorGemeente(gemSel);
                          const tbeStip = (h: (typeof TBE_MELDINGEN)[number]) => <span key={h.naam} style={{ display: "inline-flex", alignItems: "center", gap: 4 }}><span aria-hidden="true" style={{ width: 9, height: 9, borderRadius: "50%", background: h.soort === "humaan" ? "#A63428" : "#fff", border: "1.5px solid #A63428", flexShrink: 0 }} />{h.naam}</span>;
                          const meld = meldingenVoorGemeente(gemSel.id);
                          const groenLbl = en ? ["", "Very little", "Little", "Average", "Much", "Very much"] : ["", "Zeer weinig", "Weinig", "Gemiddeld", "Veel", "Zeer veel"];
                          const nf = (n: number) => n.toLocaleString(en ? "en-GB" : "nl-NL");
                          const rij = (k: string, v: ReactNode) => (
                            <div style={{ display: "flex", justifyContent: "space-between", gap: 8, padding: "3px 0", borderBottom: `1px dashed ${STZ.lijn}` }}>
                              <span>{k}</span><strong style={{ textAlign: "right" }}>{v}</strong>
                            </div>
                          );
                          return (
                            <div style={{ fontSize: 11.5, color: STZ.tekst, marginTop: 8, background: "#fff", border: `1px solid ${STZ.lijn}`, borderRadius: 6, padding: "6px 9px" }}>
                              <div style={{ fontSize: 11, fontWeight: 800, color: STZ.rood, marginBottom: 3 }}>{en ? "Figures for this municipality" : "Cijfers van deze gemeente"}</div>
                              {c.inw != null && rij(en ? "Inhabitants" : "Inwoners", nf(c.inw))}
                              {c.ha != null && rij(en ? "Land area" : "Landoppervlakte", `${nf(Math.round(c.ha / 100))} km²`)}
                              {c.natuur != null && rij(en ? "Woods and nature (of land)" : "Bos en natuur (van land)", `${nf(c.natuur)}%`)}
                              {c.bos != null && rij(en ? "of which woods" : "waarvan bos", `${nf(c.bos)}%`)}
                              {c.groen != null && rij(en ? "Parks, sports and recreation areas" : "Parken, sport- en recreatieterrein", `${nf(c.groen)}%`)}
                              {c.klasse != null && rij(en ? "Green indication" : "Groen-indicatie", <span style={{ fontSize: 10, fontWeight: 700, padding: "1px 7px", borderRadius: 99, background: ["", "#E3EEF3", "#C5E3C9", "#8CC79A", "#4E9E66", "#2D6B42"][c.klasse], color: c.klasse >= 4 ? "#fff" : "#123A52" }}>{groenLbl[c.klasse]}</span>)}
                              {rij(en ? "Known TBE location in this municipality" : "Bekende TBE-vindplaats in deze gemeente", tbeG.in.length ? <span style={{ display: "inline-flex", flexWrap: "wrap", gap: 6, justifyContent: "flex-end" }}>{tbeG.in.map(tbeStip)}</span> : (en ? "none known" : "geen bekend"))}
                              {tbeG.bij.length > 0 && rij(en ? "Known TBE location nearby" : "Bekende TBE-vindplaats in de buurt", <span style={{ display: "inline-flex", flexWrap: "wrap", gap: 6, justifyContent: "flex-end" }}>{tbeG.bij.map(tbeStip)}</span>)}
                              <p style={{ fontSize: 10, color: "#5A8299", lineHeight: 1.5, margin: "4px 0 2px" }}>{vertaalTekst(TBE_STIPPEN_ZIN, en)} {en ? "TBE cases are not published per municipality." : "TBE-gevallen worden niet per gemeente gepubliceerd."}</p>
                              {rij(en ? "Tick reports in this municipality" : "Tekenmeldingen in deze gemeente",
                                meld.length
                                  ? <span style={{ display: "inline-flex", alignItems: "center", gap: 5, justifyContent: "flex-end" }}><MeldStippen meld={meld} />{[...new Set(meld.map((m) => m.soort))].map((s) => s === "dermacentor" ? (en ? "Ornate dog tick" : "Vlekkenteek") : (en ? "Giant tick" : "Reuzenteek")).join(", ")}</span>
                                  : (en ? "none known" : "geen bekend"))}
                              <p style={{ fontSize: 10, color: "#5A8299", lineHeight: 1.5, margin: "5px 0 0" }}>
                                {en
                                  ? `More woods, dunes, heath and green space usually means more ticks. The green indication compares the share of woods and nature with all 342 municipalities; it is not a measured tick density. Sources: CBS inhabitants ${GEMEENTE_CIJFERS_BRON.inwoners}, CBS land use ${GEMEENTE_CIJFERS_BRON.bodem}; TBE: RIVM/LCI; tick reports: NVWA/RIVM and scientific research.`
                                  : `Meer bos, duin, heide en groen betekent meestal meer teken. De groen-indicatie vergelijkt het aandeel bos en natuur met alle 342 gemeenten; het is geen gemeten tekendichtheid. Bronnen: CBS inwoners ${GEMEENTE_CIJFERS_BRON.inwoners}, CBS bodemgebruik ${GEMEENTE_CIJFERS_BRON.bodem}; TBE: RIVM/LCI; tekenmeldingen: NVWA/RIVM en wetenschappelijk onderzoek.`}
                              </p>
                            </div>
                          );
                        })()}
                        <div style={{ fontSize: 11.5, color: STZ.tekst, lineHeight: 1.6, marginTop: 4 }}>
                          {en ? "Province" : "Provincie"}: <strong>{gp.naam}</strong><br />
                          {en ? "Risk indication (province level)" : "Risico-indicatie (provincieniveau)"}:{" "}
                          <span style={{ fontSize: 10, fontWeight: 700, padding: "1px 7px", borderRadius: 99, background: RISK[gp.risk], color: gp.risk <= 2 ? "#123A52" : "#fff" }}>{RISK_LBL[gp.risk]}</span><br />
                          TBE: {gp.tbeStatus === "geen" ? (en ? "not yet detected in this province (cannot be ruled out)" : "in deze provincie nog niet aangetoond (uitsluiting niet mogelijk)") : TBE_STATUS_LBL[gp.tbeStatus]}
                        </div>
                        <p style={{ fontSize: 10.5, fontWeight: 700, color: STZ.terra, lineHeight: 1.5, margin: "6px 0 0" }}>{vertaalTekst(GEBIEDSINDICATIE_ZIN, en)}</p>
                        <p style={{ fontSize: 10.5, color: "#5A8299", lineHeight: 1.5, margin: "6px 0 8px" }}>
                          {en ? "RIVM publishes disease notifications per province only, not per municipality. Within a municipality, risk varies strongly between town centre, parks, dunes and woods." : "Het RIVM publiceert ziektemeldingen alleen per provincie, niet per gemeente. Binnen een gemeente verschilt het risico sterk tussen centrum, parken, duinen en bos."}
                        </p>
                        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                          <button type="button" onClick={() => selectProv(gp)} style={{ padding: "6px 10px", borderRadius: 6, border: "none", background: STZ.terra, color: "#fff", fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
                            {en ? `View province ${gp.naam}` : `Bekijk provincie ${gp.naam}`}
                          </button>
                          {mobile && (
                            <button type="button" onClick={() => setShowMap(true)} style={{ padding: "6px 10px", borderRadius: 6, border: `1px solid ${STZ.terra}`, background: "#fff", color: STZ.terra, fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
                              {en ? "Show on map" : "Toon op kaart"}
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                    <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
                      {lijst.map((g) => {
                        const p = PROVINCIES.find((x) => x.id === g.prov);
                        return (
                          <li key={g.id} onClick={() => kiesGemeente(g)}
                            style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 6px", borderBottom: `1px solid ${STZ.lijn}`, cursor: "pointer", background: gemSel?.id === g.id ? "#E6F1F8" : "transparent" }}>
                            <div style={{ width: 8, height: 8, borderRadius: "50%", background: RISK[p?.risk || 1], flexShrink: 0 }} />
                            <span style={{ fontSize: 12, fontWeight: 600, flex: 1, color: STZ.tekst }}>{g.naam}</span>
                            {tbeVoorGemeente(g).in.length > 0 && <span title={en ? "Known TBE location" : "Bekende TBE-vindplaats"} style={{ fontSize: 8.5, fontWeight: 800, color: "#fff", background: "#A63428", borderRadius: 99, padding: "1px 5px" }}>TBE<span style={srOnly}>{en ? " known location" : " bekende vindplaats"}</span></span>}
                            {(() => { const meld = meldingenVoorGemeente(g.id); return <><MeldStippen meld={meld} />{meld.length > 0 && <span style={srOnly}>{en ? "Known tick report: " : "Bekende tekenmelding: "}{[...new Set(meld.map((m) => m.soort))].map((s) => s === "dermacentor" ? (en ? "ornate dog tick" : "Vlekkenteek") : (en ? "giant tick" : "Reuzenteek")).join(", ")}</span>}</>; })()}
                            <span style={{ fontSize: 9.5, color: "#5A8299" }}>{p?.naam}</span>
                          </li>
                        );
                      })}
                      {lijst.length === 0 && <li style={{ fontSize: 11.5, color: "#5A8299", padding: 8 }}>{en ? "No municipality found." : "Geen gemeente gevonden."}</li>}
                    </ul>
                  </div>
                );
              })()}
              {tab === "prov" && (
                <>
                  <div style={{ background: "#FCE8E8", color: "#A63428", border: "1px solid #A63428", borderLeft: "4px solid #A63428", borderRadius: 8, padding: "10px 12px", margin: "0 12px 10px" }}>
                    <div style={{ fontSize: 12, fontWeight: 800, lineHeight: 1.4, marginBottom: 8 }}>
                      {vertaalTekst("Let op: in iedere provincie loopt u het risico op een tekenbeet!", taal === "en")}
                    </div>
                    <ul style={{ margin: 0, paddingLeft: 16, fontSize: 11, lineHeight: 1.5 }}>
                      <li>{vertaalTekst("Blijf altijd alert en controleer uzelf altijd op teken.", taal === "en")}</li>
                      <li>{vertaalTekst("Na een bezoek in het groen altijd een tekencheck doen.", taal === "en")}</li>
                    </ul>
                    <div style={{ marginTop: 8, fontSize: 10.5, lineHeight: 1.5 }}>
                      {vertaalTekst("Uitleg over hoe u een tekencheck doet vindt u bij", taal === "en")}{" "}
                      <a href="https://www.tekenbeetziekten.nl" target="_blank" rel="noopener noreferrer" style={{ color: "#A63428", textDecoration: "underline", fontWeight: 700 }}>
                        {vertaalTekst("Stichting Tekenbeetziekten", taal === "en")}
                      </a>
                      {taal === "en" ? " and " : " en "}
                      <a href="https://www.lymevereniging.nl" target="_blank" rel="noopener noreferrer" style={{ color: "#A63428", textDecoration: "underline", fontWeight: 700 }}>
                        {vertaalTekst("Lymevereniging", taal === "en")}
                      </a>.
                    </div>
                  </div>
                  {sel && <div ref={detailRef}><DetailPanel p={sel} ziekteLaag={ziekteLaag} onClose={() => setSel(null)} /></div>}
                  <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
                    {sorted.map((p) => (
                      <li key={p.id} onClick={() => selectProv(p)}
                        style={{ display: "flex", alignItems: "center", gap: 8, padding: "9px 12px", borderBottom: `1px solid ${STZ.lijn}`, cursor: "pointer", background: sel?.id === p.id ? "#E6F1F8" : "transparent", borderLeft: sel?.id === p.id ? `4px solid ${STZ.terra}` : "4px solid transparent" }}>
                        <div style={{ width: 9, height: 9, borderRadius: "50%", background: RISK[p.risk], flexShrink: 0 }} />
                        <span style={{ fontSize: "clamp(11px,2vw,12px)", fontWeight: 600, flex: 1, color: sel?.id === p.id ? STZ.rood : STZ.tekst }}>{p.naam}</span>
                        <span style={{ fontSize: 8.5, fontWeight: 700, padding: "1px 6px", borderRadius: 99, background: RISK[p.risk], color: p.risk <= 2 ? "#123A52" : "#fff" }}>{RISK_LBL[p.risk]}</span>
                        
                        {p.tbeStatus !== "geen" ? (
                          <span title={p.tbeStatus === "humaan" ? TBE_SOORT_LBL.humaan : TBE_SOORT_LBL.detectie}
                            style={{ fontSize: 7.5, padding: "1px 5px", borderRadius: 99, background: p.tbeStatus === "humaan" ? "#A63428" : "transparent", border: "1px solid #A63428", color: p.tbeStatus === "humaan" ? "#fff" : "#A63428", fontWeight: 700 }}>
                            {"TBE"}
                            <span style={srOnly}>{" — " + TBE_STATUS_LBL[p.tbeStatus]}</span>
                          </span>
                        ) : (
                          <span style={srOnly}>{"TBE nog niet aangetoond — uitsluiting niet mogelijk"}</span>
                        )}
                        {(() => { const meld = meldingenVoorProvincie(p.id); return <><MeldStippen meld={meld} />{meld.length > 0 && <span style={srOnly}>{taal === "en" ? "Known tick report: " : "Bekende tekenmelding: "}{[...new Set(meld.map((m) => m.soort))].map((s) => s === "dermacentor" ? (taal === "en" ? "ornate dog tick" : "Vlekkenteek") : (taal === "en" ? "giant tick" : "Reuzenteek")).join(", ")}</span>}</>; })()}
                      </li>
                    ))}
                  </ul>
                </>
              )}
              {tab === "landelijk" && <LandelijkPanel actieveZiekte={ziekteLaag} onZiekteClick={setZiekteLaag} />}
              {tab === "ziektelaag" && <ZiekteKnoppen actief={ziekteLaag} setActief={setZiekteLaag} />}
              {tab === "seizoen" && <SeizoenTab onMaandClick={(m, i) => setMaandPop({ m, i })} />}
              {tab === "ziekteninfo" && <ZiektenInfoTab />}
              {tab === "tekensoorten" && <TekensoortenTab />}
              {tab === "tekenmeldingen" && <TekenMeldingenTab en={en} actief={meldSoortenAan} onToggle={(s) => setMeldSoortenAan((v) => v.includes(s) ? v.filter((id) => id !== s) : [...v, s])} onMap={(m) => { setTekenMeldingenOn(true); setShowMap(true); setTekenMeldingPop(m); }} />}
              
              {tab === "tekenbeethulp" && <TekenbeetHulp />}
              {tab === "help" && <HelpTab setTab={setTab} />}
            </div>

            <div className="onderbalk kaartlegenda" style={{ position: mobile ? "fixed" : "absolute", zIndex: 30, left: 0, right: mobile ? 0 : undefined, width: mobile ? "100%" : "100%", bottom: 0, paddingTop: padY, paddingBottom: safeBottom, paddingLeft: safeLeft, paddingRight: safeRight, borderTop: `1px solid ${STZ.lijn}`, background: STZ.creme, maxHeight: legendaOpen ? (appH ? `${Math.round(appH * 0.55)}px` : "55dvh") : undefined, overflowY: legendaOpen ? "auto" : "visible", boxSizing: "border-box", transition: "max-height .25s ease" }}>
              <button type="button" onClick={() => setLegendaOpen((v) => !v)} aria-expanded={legendaOpen}
                style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", background: "transparent", border: "none", padding: 0, marginBottom: legendaOpen ? 5 : 0, cursor: "pointer", fontFamily: "inherit", fontSize: 8.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".07em", color: STZ.terra }}>
                <span>{beetOn && tuinOn ? "Tekenbeten · in de eigen tuin · aandeel van de gemelde beten" : beetOn && !tuinOn ? "Tekenbeten · bevolkingsverdeelde landelijke schatting — geen gemeten provinciecijfers" : ziekteLaag ? `${tab === "landelijk" ? "Landelijk risico" : "Risico"}: ${ZIEKTEN.find((z) => z.id === ziekteLaag)?.naam}` : "Risicokaart · meldingen per 100.000 inwoners, gewogen"}</span>
                <span aria-hidden style={{ fontSize: 10, transform: legendaOpen ? "rotate(180deg)" : "none", transition: "transform .2s" }}>▲</span>
              </button>
              <p style={{ margin: `0 0 ${legendaOpen ? 5 : 3}px`, fontSize: 8.5, lineHeight: 1.35, fontWeight: 700, color: STZ.terra }}>{vertaalTekst(GEBIEDSINDICATIE_ZIN, en)}</p>
              {beetOn && (
                <div style={{ display: "flex", gap: 6, marginBottom: legendaOpen ? 8 : 4, marginTop: 4 }}>
                  <button type="button" onClick={() => setTuinOn(false)}
                    aria-pressed={!tuinOn}
                    style={{ flex: 1, padding: "5px 8px", borderRadius: 5, border: `1px solid ${!tuinOn ? STZ.terra : STZ.lijn}`, background: !tuinOn ? STZ.terra : "#fff", color: !tuinOn ? "#fff" : STZ.tekst, fontSize: 9, fontWeight: 700, fontFamily: "inherit", cursor: "pointer" }}>
                    Alle tekenbeten
                  </button>
                  <button type="button" onClick={() => setTuinOn(true)}
                    aria-pressed={tuinOn}
                    style={{ flex: 1, padding: "5px 8px", borderRadius: 5, border: `1px solid ${tuinOn ? STZ.terra : STZ.lijn}`, background: tuinOn ? STZ.terra : "#fff", color: tuinOn ? "#fff" : STZ.tekst, fontSize: 9, fontWeight: 700, fontFamily: "inherit", cursor: "pointer" }}>
                    Tekenbeten in de eigen tuin
                  </button>
                </div>
              )}
              {legendaOpen && (<>
              <div style={{ display: "flex", flexDirection: beetOn || ziekteLaag ? "row" : "column", flexWrap: "wrap", gap: beetOn || ziekteLaag ? "3px 10px" : 6 }}>
                {beetOn && tuinOn
                  ? TUIN_KLASSEN.map((lbl) => (
                      <div key={lbl} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 9, color: "#3E6A7D" }}>
                        <div style={{ width: 10, height: 10, borderRadius: 2, background: TUIN_KLEUR[lbl] }} />{lbl}
                      </div>
                    ))
                  : beetOn && !tuinOn
                  ? TEKENBEET_KLASSEN.map((k) => (
                      <div key={k.label} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 9, color: "#3E6A7D" }}>
                        <div style={{ width: 10, height: 10, borderRadius: 2, background: BEET_KLEUR[k.label] }} />{k.label}
                      </div>
                    ))
                  : ziekteLaag

                  ? (() => {
                      const z = ZIEKTEN.find((x) => x.id === ziekteLaag);
                      if (!z) return null;
                      return <div className="text-foreground text-[10px] leading-relaxed">
                        <p>{vertaalTekst(ziekteKaartLabel(z), en)}</p>
                        <p>{vertaalTekst(AANWEZIGHEID_ZIN, en)}</p>
                        {z.id === "tbe" && <p>{vertaalTekst("Kleurintensiteit onderscheidt geen bevestiging, virus/antistoffen in teken of wild, en humane infectie/waarschijnlijke besmettingsplaats; het is geen prevalentieschaal.", en)}</p>}
                      </div>;
                    })()
                  : (<>
                    <div>
                      <div style={{ fontSize: 9, fontWeight: 700, color: STZ.tekst, marginBottom: 3 }}>Risicokaart</div>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "3px 10px" }}>
                        {(["Geen", "Zeer laag", "Laag", "Matig", "Hoog", "Zeer hoog"] as const).map((lbl) => {
                          const kleuren: Record<string, string> = { "Geen": "#C9D5DB", "Zeer laag": "#CFE9F8", "Laag": "#A9DDF5", "Matig": "#4A9FD4", "Hoog": "#2E7BA0", "Zeer hoog": "#1D4E63" };
                          return (
                            <div key={lbl} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 9, color: "#3E6A7D" }}>
                              <div style={{ flexShrink: 0, boxSizing: "border-box", width: 10, height: 10, borderRadius: 2, background: kleuren[lbl] }} />{lbl}
                            </div>
                          );
                        })}
                      </div>
                      <KlasseUitleg />
                      {liveCijfers.grensLabels.length > 0 && (
                        <div style={{ fontSize: 8, color: "#5C7E8C", marginTop: 3, lineHeight: 1.3 }}>
                          {taal === "en"
                            ? "Class limits (weighted score): reports per 100,000 inhabitants × habitat: "
                            : "Klassegrenzen (gewogen score): meldingen per 100.000 inwoners × habitat: "}
                          {liveCijfers.grensLabels.join(" · ")}
                        </div>
                      )}
                    </div>
                    <div>
                      <div style={{ fontSize: 9, fontWeight: 700, color: STZ.tekst, marginBottom: 3 }}>TBE-meldingen</div>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "3px 10px" }}>
                        {(["humaan", "detectie", "geen"] as const).map((status) => {
                          const stip = status === "humaan"
                            ? { width: 10, height: 10, borderRadius: 5, background: "#A63428", border: "1.5px solid #A63428" }
                            : status === "detectie"
                            ? { width: 10, height: 10, borderRadius: 5, background: "#fff", border: "1.5px solid #A63428" }
                            : { width: 10, height: 10, borderRadius: 5, background: "#fff", border: "1.5px dashed #A63428" };
                          return (
                            <div key={status} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 9, color: "#3E6A7D" }}>
                              <div style={{ flexShrink: 0, boxSizing: "border-box", ...stip }} />{TBE_STATUS_LBL[status]}
                            </div>
                          );
                        })}
                      </div>
                      <div style={{ fontSize: 8, opacity: 0.6, marginTop: 3, color: "#3E6A7D" }}>
                        {vertaalTekst("Bronnen: RIVM/LCI, DWHC, Erasmus MC, LabMicTA en Artemis One Health.", taal === "en")}
                      </div>
                      <p className="text-[10px] leading-relaxed mt-1 mb-0">{vertaalTekst(TBE_STIPPEN_ZIN, taal === "en")}</p>
                    </div>
                    <div>
                      <div style={{ fontSize: 9, fontWeight: 700, color: STZ.tekst, marginBottom: 3 }}>Tekenbeten (geschat naar inwonertal)</div>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "3px 10px" }}>
                        {TEKENBEET_KLASSEN.map((k) => (
                          <div key={k.label} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 9, color: "#3E6A7D" }}>
                            <div style={{ flexShrink: 0, boxSizing: "border-box", width: 10, height: 10, borderRadius: 2, background: BEET_KLEUR[k.label] }} />{k.label}
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: 9, fontWeight: 700, color: STZ.tekst, marginBottom: 3 }}>Tekenbeten in de eigen tuin</div>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "3px 10px" }}>
                        {TUIN_KLASSEN.map((lbl) => (
                          <div key={lbl} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 9, color: "#3E6A7D" }}>
                            <div style={{ flexShrink: 0, boxSizing: "border-box", width: 10, height: 10, borderRadius: 2, background: TUIN_KLEUR[lbl] }} />{lbl}
                          </div>
                        ))}
                      </div>
                    </div>
                  </>)}

              </div>
              <div style={{ width: "100%", fontSize: 8.5, lineHeight: 1.4, color: "#5A8299", marginTop: 4 }}>
                {TEKENBEET_TOELICHTING} Bron: {TEKENBEET_BRON.naam}.
              </div>
              {beetOn && tuinOn && (
                <div style={{ fontSize: 8.5, lineHeight: 1.5, color: "#123A52", marginTop: 6, background: "#fff", border: `1px solid ${STZ.lijn}`, borderRadius: 6, padding: "6px 8px" }}>
                  {TUINBEET_TOELICHTING}{" "}Bron: {TUINBEET_BRON.naam}.

                </div>
              )}
              {beetOn && !tuinOn && (
                <div style={{ fontSize: 8.5, lineHeight: 1.5, color: "#123A52", marginTop: 6, background: "#fff", border: `1px solid ${STZ.lijn}`, borderRadius: 6, padding: "6px 8px" }}>
                  {TEKENBEET_TOELICHTING}{" "}Bron: {TEKENBEET_BRON.naam}.

                </div>
              )}


              <div style={{ fontSize: 8.5, lineHeight: 1.5, color: "#123A52", marginTop: 6, background: "#fff", border: `1px solid ${STZ.lijn}`, borderRadius: 6, padding: "6px 8px", fontWeight: 600 }}>
                {MELDINGSBIAS_KORT}
              </div>
              <div style={{ fontSize: 8.5, lineHeight: 1.5, color: "#5A8299", marginTop: 5 }}>
                Relatieve provincieklasse: Tekenradar-meldingen per 100.000 inwoners, gewogen met habitat. Geen meting of individuele infectiekans; voorlichting, geen medisch advies.
              </div>
              <div style={{ fontSize: 8.5, lineHeight: 1.5, color: "#5A8299", marginTop: 3 }}>
                Bronnen automatisch gecontroleerd: {peildatum} · Website-inhoud bijgewerkt: {laatstBijgewerkt} · Peildatum {DATA_PEILDATUM} · Bronnen: RIVM/LCI, Tekenradar.nl, Staat van Infectieziekten 2024 (RIVM), {WIJBURG_CITATIE}
              </div>
              </>)}
            </div>
          </aside>
        )}

        {showMap && (
          <main key={kaartKey} ref={mapRef} style={{ flex: tabletStaand ? "0 0 44vh" : 1, minHeight: 0, position: "relative", overflow: "hidden", background: STZ.header }}
            onMouseLeave={() => setTt(null)} onClick={() => setShowDrop(false)}>
            <button type="button" onClick={(e) => { e.stopPropagation(); setShowMap(false); }}
              aria-label="Kaart inklappen" title="Kaart inklappen"
              style={{ position: "absolute", top: 8, right: 10, zIndex: 20, background: "transparent", border: "none", padding: 4, cursor: "pointer", fontFamily: "inherit", fontSize: 10, lineHeight: 1, color: STZ.terra }}>
              <span aria-hidden>▲</span>
            </button>
            {beetOn && (
              <div style={{ position: "absolute", top: mobile ? 34 : 8, left: 10, zIndex: 20, display: "flex", gap: 6, background: "rgba(255,255,255,.94)", backdropFilter: "blur(4px)", padding: 5, borderRadius: 7, boxShadow: "0 2px 8px rgba(0,0,0,.12)", border: `1px solid ${STZ.lijn}` }}>
                <button type="button" onClick={(e) => { e.stopPropagation(); setTuinOn(false); }}
                  aria-pressed={!tuinOn}
                  style={{ padding: "5px 9px", borderRadius: 5, border: `1px solid ${!tuinOn ? STZ.terra : STZ.lijn}`, background: !tuinOn ? STZ.terra : "#fff", color: !tuinOn ? "#fff" : STZ.tekst, fontSize: 9, fontWeight: 700, fontFamily: "inherit", cursor: "pointer" }}>
                  Alle tekenbeten
                </button>
                <button type="button" onClick={(e) => { e.stopPropagation(); setTuinOn(true); }}
                  aria-pressed={tuinOn}
                  style={{ padding: "5px 9px", borderRadius: 5, border: `1px solid ${tuinOn ? STZ.terra : STZ.lijn}`, background: tuinOn ? STZ.terra : "#fff", color: tuinOn ? "#fff" : STZ.tekst, fontSize: 9, fontWeight: 700, fontFamily: "inherit", cursor: "pointer" }}>
                  Tekenbeten in de eigen tuin
                </button>
              </div>
            )}
            <div data-geen-vertaling className="absolute bottom-2 left-2 right-2 z-20 rounded-md border border-border bg-card px-2 py-1 text-[10px] font-semibold leading-relaxed text-card-foreground pointer-events-none">{vertaalTekst(GEBIEDSINDICATIE_ZIN, en)}</div>
            {tekenMeldingenOn && <div className="absolute left-2 right-10 top-2 z-20 bg-card text-card-foreground rounded-md p-2 text-xs">
              <div className="flex flex-wrap gap-3">{meldSoorten.map((s) => <label key={s.id} className={`flex items-center gap-1 ${s.kleur}`}><input type="checkbox" checked={meldSoortenAan.includes(s.id)} onChange={() => setMeldSoortenAan((v) => meldSoortenAan.includes(s.id) ? v.filter((id) => id !== s.id) : [...v, s.id])} /><SoortIcoon soort={s} groot={12} /><span>{s.id === "dermacentor" ? "Dermacentor" : "Hyalomma"}</span></label>)}</div>
              <p className="m-0 mt-1 text-[10px]">{en ? "Historical findings · approximate locations" : "Historische vondsten · locaties bij benadering"}</p>
            </div>}
            {mobile && (
              <p className="onderbalk" style={{ position: "absolute", left: 0, right: 0, bottom: 0, margin: 0, zIndex: 20, paddingTop: 5, paddingBottom: "calc(7px + env(safe-area-inset-bottom,0px))", paddingLeft: safeLeft, paddingRight: safeRight, background: STZ.creme, borderTop: `1px solid ${STZ.lijn}`, fontSize: 8.5, lineHeight: 1.35, fontWeight: 700, color: STZ.terra, textAlign: "center", boxSizing: "border-box" }}>
                {vertaalTekst(GEBIEDSINDICATIE_ZIN, en)}
              </p>
            )}
            <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", padding: mobile ? "38px 6px 48px" : "42px 12px 50px" }}>

              <svg viewBox={gemViewBox} role="img" aria-label={en ? "Tick risk map of the Netherlands by province. The classification is a population- and area-level indication, not an individual medical risk assessment." : "Tekenrisicokaart van Nederland per provincie. Deze classificatie is een populatie-/gebiedsindicatie en geen individuele medische risicobeoordeling."}
                style={{ height: "100%", maxHeight: "100%", width: "auto", maxWidth: mobile ? 290 : tabletStaand ? 340 : 420, filter: "drop-shadow(0 6px 20px rgba(80,30,10,.18))" }}>
                {kaartProvincies.map((p) => (
                  <path key={p.id} d={PATHS[p.id]} role="button" tabIndex={0} aria-label={en ? `Province ${p.naam} — tick risk indication ${vertaalTekst(RISK_LBL[p.risk] ?? "", true)} — ${p.tbeStatus === "geen" ? "TBE not yet demonstrated, exclusion not possible" : vertaalTekst(TBE_STATUS_LBL[p.tbeStatus] ?? "", true)}` : `Provincie ${p.naam} — tekenrisico-indicatie ${RISK_LBL[p.risk]} — ${p.tbeStatus === "geen" ? "TBE nog niet aangetoond, uitsluiting niet mogelijk" : TBE_STATUS_LBL[p.tbeStatus]}`}
                    onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); beetOn ? setProvPop(p) : selectProv(p); } }}
                    fill={getFill(p.id)}
                    stroke="#fff" strokeWidth={sel?.id === p.id ? 3 : 1.2} vectorEffect="non-scaling-stroke"
                    style={{ cursor: "pointer", filter: sel?.id === p.id ? "brightness(1.1)" : "none", transition: "fill .3s,stroke-width .15s", pointerEvents: tab === "gem" ? "none" : undefined }}
                    onMouseEnter={(e) => onMove(e, p)}
                    onMouseMove={(e) => onMove(e, p)}
                    onMouseLeave={() => setTt(null)}
                    onClick={() => beetOn ? setProvPop(p) : selectProv(p)} />
                ))}

                {tab === "gem" && GEMEENTEN.map((g) => (
                  <path key={g.id} d={g.d} role="button" tabIndex={0} aria-label={`Gemeente ${g.naam}`}
                    fill={gemSel?.id === g.id ? "rgba(18,58,82,.28)" : "rgba(255,255,255,0.001)"}
                    stroke={gemSel?.id === g.id ? "#123A52" : "rgba(255,255,255,.85)"}
                    strokeWidth={gemSel?.id === g.id ? 2.4 : 0.6} vectorEffect="non-scaling-stroke"
                    style={{ cursor: "pointer" }}
                    onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); kiesGemeente(g); } }}
                    onClick={() => kiesGemeente(g)}>
                    <title>{g.naam}</title>
                  </path>
                ))}
                {tab === "gem" && gemSel && (
                  <text x={gemSel.c[0]} y={gemSel.c[1]} textAnchor="middle"
                    style={{ fontFamily: "inherit", fontSize: 11 / gemZoom, fontWeight: 800, fill: "#fff", paintOrder: "stroke", stroke: "rgba(18,58,82,.8)", strokeWidth: 2.5 / gemZoom, pointerEvents: "none" }}>
                    {gemSel.naam}
                  </text>
                )}

                {gemZoom === 1 && kaartProvincies.map((p) => {
                  const pos = LABEL_POS[p.id];
                  if (!pos) return null;
                  const tuin = TUINBEET_PCT[p.id];
                  return (
                    <g key={p.id} style={{ pointerEvents: "none" }}>
                      <text x={pos[0]} y={pos[1]} textAnchor="middle"
                        style={{ fontFamily: "inherit", fontSize: mobile ? 8 : 9.5, fontWeight: 700, fill: "rgba(255,255,255,.92)", paintOrder: "stroke", stroke: "rgba(60,10,10,.35)", strokeWidth: 2, pointerEvents: "none", userSelect: "none" }}>
                        {p.naam}
                      </text>
                      {beetOn && tuinOn && tuin && (
                        <text x={pos[0]} y={pos[1] + (mobile ? 8.5 : 10)} textAnchor="middle"
                          style={{ fontFamily: "inherit", fontSize: mobile ? 7 : 8.5, fontWeight: 800, fill: "#fff", paintOrder: "stroke", stroke: "rgba(18,58,82,.55)", strokeWidth: 2, pointerEvents: "none", userSelect: "none" }}>
                          {tuin}
                        </text>
                      )}
                      {beetOn && !tuinOn && TEKENBEET_AANTAL[p.id] != null && (
                        <text x={pos[0]} y={pos[1] + (mobile ? 8.5 : 10)} textAnchor="middle"
                          style={{ fontFamily: "inherit", fontSize: mobile ? 7 : 8.5, fontWeight: 800, fill: "#fff", paintOrder: "stroke", stroke: "rgba(18,58,82,.55)", strokeWidth: 2, pointerEvents: "none", userSelect: "none" }}>
                          ± {nlGetal(TEKENBEET_AANTAL[p.id] ?? 0)}
                        </text>
                      )}

                    </g>
                  );
                })}


                {tbeOn && kaartProvincies.filter((p) => p.tbeStatus === "geen").map((p) => (
                  <path key={`tbe-geen-${p.id}`} d={PATHS[p.id]} fill="none" stroke="#A63428" strokeWidth={1.6} strokeDasharray="3 2.4" style={{ pointerEvents: "none", opacity: .85 }} />
                ))}


                {(tbeOn || tab === "gem") && TBE_MELDINGEN.map((h) => (
                  <g key={h.naam} role="button" tabIndex={0} aria-label={`TBE-melding ${h.naam}`}
                    onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setTbePop(h); } }}
                    style={{ cursor: "pointer" }}
                    onMouseEnter={(e) => onMove(e, { _tbe: true, naam: h.naam, info: h.info })}
                    onMouseMove={(e) => onMove(e, { _tbe: true, naam: h.naam, info: h.info })}
                    onMouseLeave={() => setTt(null)}
                    onClick={(e) => { e.stopPropagation(); setTbePop(h); }}>
                    <circle cx={h.cx} cy={h.cy} r={16 / gemZoom} fill="rgba(166,52,40,.15)" />
                    <circle cx={h.cx} cy={h.cy} r={9 / gemZoom} fill={h.soort === "humaan" ? "#A63428" : "#fff"} stroke={h.soort === "humaan" ? "#fff" : "#A63428"} strokeWidth={1.8 / gemZoom} />
                    <text x={h.cx} y={h.cy + 3.5 / gemZoom} textAnchor="middle" style={{ fontSize: 6.5 / gemZoom, fontWeight: 800, fill: h.soort === "humaan" ? "#fff" : "#A63428", pointerEvents: "none", fontFamily: "inherit" }}>{"TBE"}</text>
                  </g>
                ))}
                {tekenMeldingenOn && TEKEN_MELDINGEN.filter((m) => m.positie && meldSoortenAan.includes(m.soort)).map((m) => {
                  if (!m.positie) return null;
                  const [cx, cy] = m.positie;
                  return <g key={m.id} role="button" tabIndex={0} aria-label={`${m.soort} ${m.gebied} ${m.periode}`} className="cursor-pointer" onClick={(e) => { e.stopPropagation(); setTekenMeldingPop(m); }} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setTekenMeldingPop(m); } }}>
                    <title>{m.gebied} · {m.periode}</title>
                    <circle cx={cx} cy={cy} r={18 / gemZoom} fill="transparent" />
                    <circle cx={cx} cy={cy} r={10 / gemZoom} className={m.soort === "dermacentor" ? "fill-tick-dermacentor stroke-card" : "fill-tick-hyalomma stroke-card"} strokeWidth={2 / gemZoom} />
                    <text x={cx} y={cy + 3 / gemZoom} textAnchor="middle" fontSize={8 / gemZoom} className="fill-primary-foreground font-bold pointer-events-none">{m.soort === "dermacentor" ? "D" : "H"}</text>
                  </g>;
                })}
              </svg>
            </div>

            {tekenMeldingPop && tekenMeldingenOn && <div className="absolute bottom-14 left-3 right-3 z-30 bg-card text-card-foreground border border-input rounded-md p-3 max-h-[45%] overflow-y-auto">
              <div className="flex justify-end"><Button variant="ghost" size="icon" aria-label={en ? "Close report" : "Melding sluiten"} onClick={() => setTekenMeldingPop(null)}>×</Button></div>
              <MeldingInhoud melding={tekenMeldingPop} en={en} />
            </div>}
            {tbeOn && (
              <div style={{ background: "#fff", border: `1px solid ${STZ.lijn}`, borderRadius: 8, margin: "8px 10px", padding: "8px 10px" }}>
                <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 5 }}>
                  <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 9.5, color: STZ.tekst, fontWeight: 700 }}>
                    <span style={{ width: 11, height: 11, borderRadius: "50%", background: "#A63428", border: "1.5px solid #fff", boxShadow: "0 0 0 1px #A63428" }} />
                    {TBE_STATUS_LBL.humaan}
                  </span>
                  <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 9.5, color: STZ.tekst, fontWeight: 700 }}>
                    <span style={{ width: 11, height: 11, borderRadius: "50%", background: "#fff", border: "1.5px solid #A63428" }} />
                    {TBE_STATUS_LBL.detectie}
                  </span>
                  <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 9.5, color: STZ.tekst, fontWeight: 700 }}>
                    <span style={{ width: 11, height: 11, borderRadius: "50%", background: "#fff", border: "1.5px dashed #A63428" }} />
                    {TBE_STATUS_LBL.geen}
                  </span>
                </div>
                <div style={{ fontSize: 9.5, lineHeight: 1.55, color: "#123A52", fontWeight: 600 }}>{TBE_CRITERIUM}</div>
                <div style={{ fontSize: 9.5, lineHeight: 1.55, color: "#3E6A7D", marginTop: 4 }}>{TBE_LANDELIJK}</div>
                <div style={{ fontSize: 9.5, lineHeight: 1.55, color: "#3E6A7D", marginTop: 4 }}>{TBE_HAARDEN_ZIN}</div>
                <div style={{ fontSize: 9.5, lineHeight: 1.55, color: "#3E6A7D", marginTop: 4 }}>{tbeCijfers}</div>
                <div style={{ fontSize: 8.5, lineHeight: 1.5, color: "#5A8299", marginTop: 4 }}>{TBE_BRON}</div>

              </div>
            )}



            {!mobile && (
              <div style={{ position: "absolute", bottom: 34, left: 10, background: "rgba(123,16,16,.85)", backdropFilter: "blur(8px)", borderRadius: 7, padding: "7px 10px", color: "#fff", zIndex: 50 }}>
                <div style={{ fontSize: 7.5, textTransform: "uppercase", letterSpacing: ".07em", opacity: 0.6, marginBottom: 4 }}>Maandactiviteit — tik op een maand voor uitleg</div>
                <div style={{ display: "flex", gap: 2, alignItems: "flex-end", height: 22 }}>
                  {maandActiviteit.map((m, i) => (
                    <div key={m.k} role="button" tabIndex={0} aria-label={`Tekenactiviteit ${m.k}`} onClick={() => setMaandPop({ m, i })}
                      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setMaandPop({ m, i }); } }} title={m.k}
                      style={{ width: 12, height: 4 + m.v * 4, borderRadius: 2, background: MAAND_COL[m.v] ?? "#ccc", opacity: m.v === 0 ? 0.3 : 0.85, outline: i === curMnd ? "2px solid rgba(255,255,255,.9)" : "none", flexShrink: 0, cursor: "pointer" }} />
                  ))}
                </div>
              </div>
            )}




            {tt && !mobile && (
              <div style={{ position: "absolute", left: tt.x, top: tt.y, transform: "translate(-50%,-115%)", background: STZ.rood, color: "#fff", borderRadius: 7, padding: "9px 12px", maxWidth: 210, minWidth: 150, boxShadow: "0 6px 20px rgba(0,0,0,.28)", pointerEvents: "none", zIndex: 200 }}>
                {"_tbe" in tt.content ? (
                  <>
                    <div style={{ fontWeight: 800, marginBottom: 3, fontSize: 12, color: "#9FD3EE" }}>{tt.content.naam}</div>
                    <div style={{ fontSize: 10.5, opacity: 0.85, lineHeight: 1.5 }}>{tt.content.info}</div>
                    <div style={{ fontSize: 8.5, opacity: 0.5, marginTop: 3 }}>Klik voor info →</div>
                  </>
                ) : (
                  <>
                    <div style={{ fontWeight: 800, marginBottom: 4, fontSize: 13 }}>{tt.content.naam}</div>
                    {ziekteLaag && (() => {
                      const z = ZIEKTEN.find((x) => x.id === ziekteLaag);
                      if (!z) return null;
                      const provincie = tab === "landelijk" ? undefined : tt.content as Provincie;
                      const label = tab === "landelijk" ? "Landelijk" : z.naam;
                      return (
                        <div style={{ display: "flex", justifyContent: "space-between", gap: 8, fontSize: 10.5, opacity: 0.85, padding: "2px 0" }}>
                          <span>{label}</span><strong style={{ color: z.kleur }}>{ziekteKaartLabel(z, provincie)}</strong>
                        </div>
                      );
                    })()}
                    <div style={{ display: "flex", justifyContent: "space-between", gap: 8, fontSize: 10.5, opacity: 0.8, padding: "2px 0" }}>
                      <span>Teken met Borrelia</span><strong>{(tt.content as Provincie).lymePct}</strong>
                    </div>
                    <div style={{ fontSize: 10, color: "#9FD3EE", marginTop: 3, fontWeight: 700 }}>{(tt.content as Provincie).tbeStatus === "humaan" ? "TBE-melding bij mensen" : (tt.content as Provincie).tbeStatus === "detectie" ? "TBE aangetoond in teken/dieren" : "TBE nog niet aangetoond — uitsluiting niet mogelijk"}</div>
                    {(tt.content as Provincie).tbeBron && <div style={{ fontSize: 9, color: "rgba(255,255,255,.75)", marginTop: 2, lineHeight: 1.45, whiteSpace: "normal", maxWidth: 240 }}>{(tt.content as Provincie).tbeBron}</div>}
                    <div style={{ fontSize: 8.5, opacity: 0.45, marginTop: 3 }}>Klik voor details →</div>
                  </>
                )}
              </div>
            )}
          </main>
        )}
      </div>

      {/* Assistent zweeft rechtsonder, buiten de balken boven en onder. */}
      {tab !== "tekenbeethulp" && <InformatieAssistent context="kaart" />}
    </div>
  );
}
