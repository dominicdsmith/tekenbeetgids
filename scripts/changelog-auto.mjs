// Werkt de changelog automatisch bij bij iedere build.
//
// Het script kijkt welke wijzigingen er sinds de vorige keer zijn geweest en
// zet die als nieuwe punten bovenaan de changelog. Datum, tijd, updatecode en
// versie worden zelf bepaald (Nederlandse tijd). Er is dus geen handwerk nodig.
//
// Handmatig een eigen punt toevoegen kan nog steeds met:
//   bun run scripts/changelog.mjs "Tekst van de wijziging"
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { execSync } from "node:child_process";
import { join } from "node:path";

const CHANGELOG = join(process.cwd(), "src/data/changelog.ts");
const STATE = join(process.cwd(), ".changelog-state.json");

const nlFmt = (d, opts) => new Intl.DateTimeFormat("nl-NL", { timeZone: "Europe/Amsterdam", ...opts }).format(d);

/** Netjes leesbare regel maken van een commit- of wijzigingsomschrijving. */
function nette(tekst) {
  const t = tekst.trim().replace(/\s+/g, " ");
  if (!t) return "";
  return t.charAt(0).toUpperCase() + t.slice(1);
}

/** Nietszeggende of technische committeksten overslaan. */
const GENERIEK = /^(merge|wip|fixup|revert|changes?|update|edits?|fix|tweak|misc|lovable|snapshot|checkpoint|\.+)\s*$|^(merge|lovable snapshot)\b/i;
/**
 * Technische details horen niet in het openbare logboek: commit-codes,
 * foutmeldingen, bouwstappen en werktitels worden nooit gepubliceerd.
 * Houd dit gelijk aan TECHNISCH_PATROON in src/components/kaart/Tekenkaart.tsx.
 */
const TECHNISCH =
  /\b(reverted to commit|commit|work in progress|lovable update|closing brace|duplicate key|runtime error|gethost|rate limit|cache geleegd|caches geleegd|cache opgeruimd|worker|manifest|ssrhtml|react-screen|scripts\/|auto-update|autochangelog|bijgebouwd|redirect on live|fade-time|cacheversie)\b/i;
const isOpenbaar = (tekst) => !TECHNISCH.test(tekst) && !/[0-9a-f]{16,}/i.test(tekst);
/** Maximaal aantal automatische punten per build. */
const MAX_PUNTEN = 20;

function git(cmd) {
  try {
    return execSync(`git ${cmd}`, { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim();
  } catch {
    return "";
  }
}

/** Nieuwe wijzigingen ophalen: nieuwste eerst. */
function nieuweWijzigingen(state) {
  const log = git("log --pretty=%H%x09%cI%x09%s -n 1000");
  if (!log) return { punten: [], laatste: state.laatsteCommit ?? null };
  const regels = log.split("\n").map((r) => r.split("\t"));
  // Staat het opgeslagen startpunt niet (meer) in de geschiedenis, dan is er
  // geen betrouwbaar verschil te bepalen: niets toevoegen, alleen het
  // startpunt verversen. Zo voorkomen we dat oude punten opnieuw verschijnen.
  // Staat het startpunt niet meer in de geschiedenis, dan vallen we terug op
  // de nieuwste logboekdag: alle openbare wijzigingen ná die dag komen erbij.
  let naDag = null;
  if (state.laatsteCommit && !regels.some(([hash]) => hash === state.laatsteCommit)) {
    const top = (readFileSync(CHANGELOG, "utf8").match(/update:\s*"(\d{8})"/) || [])[1];
    if (!top) return { punten: [], laatste: regels[0]?.[0] ?? state.laatsteCommit };
    naDag = top.slice(4) + top.slice(2, 4) + top.slice(0, 2);
  }
  const nieuw = [];
  for (const [hash, iso, subject] of regels) {
    if (hash === state.laatsteCommit) break;
    if (naDag) {
      const d = new Date(iso);
      const sleutel = nlFmt(d, { year: "numeric" }) + nlFmt(d, { month: "2-digit" }) + nlFmt(d, { day: "2-digit" });
      if (sleutel <= naDag) break;
    }
    if (GENERIEK.test(subject) || !isOpenbaar(subject)) continue;
    nieuw.push({ tijd: nlFmt(new Date(iso), { hour: "2-digit", minute: "2-digit", hour12: false }), datum: new Date(iso), tekst: nette(subject) });
  }
  const gezien = new Set();
  const uniek = nieuw.filter((p) => !gezien.has(p.tekst) && gezien.add(p.tekst));
  return { punten: uniek.slice(0, MAX_PUNTEN), laatste: regels[0]?.[0] ?? state.laatsteCommit ?? null };
}

// Bij iedere run de hele changelog opschonen: technische regels eruit en
// dagen zonder zichtbare punten weglaten, zodat er nooit technische details
// gepubliceerd worden — ook niet uit oudere of handmatig toegevoegde regels.
function opschonen(bron) {
  const regels = bron.split("\n").filter((r) => {
    const m = r.match(/tekst:\s*"((?:[^"\\]|\\.)*)"/);
    if (!m) return true;
    return isOpenbaar(m[1]);
  });
  let uit = regels.join("\n");
  // Lege dagen (punten: [] direct gevolgd door sluiting) verwijderen.
  uit = uit.replace(/  \{\n    versie: \d+,\n    update: "\d+",\n    datum: "[^"]*",\n    punten: \[\n    \],\n  \},\n/g, "");
  return uit;
}

const state = existsSync(STATE) ? JSON.parse(readFileSync(STATE, "utf8")) : {};
const eersteKeer = !state.laatsteCommit;
const { punten, laatste } = nieuweWijzigingen(state);

if (eersteKeer) {
  // Eerste keer alleen het startpunt vastleggen; bestaande changelog blijft zoals hij is.
  writeFileSync(STATE, JSON.stringify({ laatsteCommit: laatste }, null, 2));
  console.log("changelog: startpunt vastgelegd");
  process.exit(0);
}

if (punten.length === 0) {
  // Geen nieuwe punten, maar wel altijd opschonen zodat het openbare logboek schoon blijft.
  const bestaand = readFileSync(CHANGELOG, "utf8");
  const schoon = opschonen(bestaand);
  if (schoon !== bestaand) {
    writeFileSync(CHANGELOG, schoon);
    console.log("changelog: opgeschoond (geen nieuwe wijzigingen)");
  } else {
    console.log("changelog: geen nieuwe wijzigingen");
  }
  writeFileSync(STATE, JSON.stringify({ ...state, laatsteCommit: laatste }, null, 2));
  process.exit(0);
}

let src = readFileSync(CHANGELOG, "utf8");
const esc = (s) => s.replace(/\\/g, "\\\\").replace(/"/g, '\\"');

// Punten groeperen per dag, nieuwste dag eerst.
const perDag = new Map();
for (const p of punten) {
  const dd = nlFmt(p.datum, { day: "2-digit" });
  const mm = nlFmt(p.datum, { month: "2-digit" });
  const jjjj = nlFmt(p.datum, { year: "numeric" });
  const code = `${dd}${mm}${jjjj}`;
  if (!perDag.has(code)) perDag.set(code, { datum: nlFmt(p.datum, { day: "numeric", month: "long", year: "numeric" }), punten: [] });
  perDag.get(code).punten.push(p);
}

const versie = Number(src.match(/versie:\s*(\d+)/)?.[1] ?? 1);

for (const [code, dag] of [...perDag.entries()].reverse()) {
  const regels = dag.punten.map((p) => `      { tijd: "${p.tijd}", tekst: "${esc(p.tekst)}" },`).join("\n");
  if (src.includes(`update: "${code}"`)) {
    const i = src.indexOf(`update: "${code}"`);
    const j = src.indexOf("punten: [", i);
    const k = src.indexOf("\n", j);
    src = `${src.slice(0, k + 1)}${regels}\n${src.slice(k + 1)}`;
  } else {
    const blok = `  {\n    versie: ${versie},\n    update: "${code}",\n    datum: "${dag.datum}",\n    punten: [\n${regels}\n    ],\n  },\n`;
    src = src.replace("export const CHANGELOG: ChangelogItem[] = [\n", `export const CHANGELOG: ChangelogItem[] = [\n${blok}`);
  }
}

src = opschonen(src);

writeFileSync(CHANGELOG, src);
writeFileSync(STATE, JSON.stringify({ laatsteCommit: laatste }, null, 2));
console.log(`changelog: ${punten.length} nieuwe regel(s) toegevoegd`);
