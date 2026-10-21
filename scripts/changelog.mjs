// Voegt automatisch een changelog-punt toe met de huidige Nederlandse datum en tijd.
//
//   bun run scripts/changelog.mjs "Tekst van de wijziging"
//
// Bestaat er nog geen blok voor vandaag, dan wordt dat blok automatisch
// aangemaakt (met updatecode ddmmjjjj) bovenaan de changelog gezet.
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const tekst = process.argv.slice(2).join(" ").trim();
if (!tekst) {
  console.error('Gebruik: bun run scripts/changelog.mjs "Wat er is gewijzigd"');
  process.exit(1);
}

const NU = new Date();
const nl = (opts) => new Intl.DateTimeFormat("nl-NL", { timeZone: "Europe/Amsterdam", ...opts }).format(NU);
const dd = nl({ day: "2-digit" });
const mm = nl({ month: "2-digit" });
const jjjj = nl({ year: "numeric" });
const tijd = nl({ hour: "2-digit", minute: "2-digit", hour12: false });
const update = `${dd}${mm}${jjjj}`;
const datum = nl({ day: "numeric", month: "long", year: "numeric" });

const pad = join(process.cwd(), "src/data/changelog.ts");
let src = readFileSync(pad, "utf8");

const esc = (s) => s.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
const punt = `      { tijd: "${tijd}", tekst: "${esc(tekst)}" },`;

if (src.includes(`update: "${update}"`)) {
  // Punt bovenaan het bestaande blok van vandaag zetten.
  const i = src.indexOf(`update: "${update}"`);
  const j = src.indexOf("punten: [", i);
  const k = src.indexOf("\n", j);
  src = `${src.slice(0, k + 1)}${punt}\n${src.slice(k + 1)}`;
} else {
  // Nieuw blok voor vandaag bovenaan de lijst.
  const versie = Number(src.match(/versie:\s*(\d+)/)?.[1] ?? 1);
  const blok = `  {\n    versie: ${versie},\n    update: "${update}",\n    datum: "${datum}",\n    punten: [\n${punt}\n    ],\n  },\n`;
  src = src.replace("export const CHANGELOG: ChangelogItem[] = [\n", `export const CHANGELOG: ChangelogItem[] = [\n${blok}`);
}

writeFileSync(pad, src);
console.log(`changelog: ${datum} ${tijd} — ${tekst}`);
