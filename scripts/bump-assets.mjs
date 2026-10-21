// Genereert automatisch afzonderlijke versies voor website, iconen en startschermen.
// Elk versienummer is een korte hash van de inhoud van de bijbehorende bestanden:
// wijzigt een bestand, dan wijzigt het versienummer vanzelf.
//
//   bun run scripts/bump-assets.mjs
//
import { createHash } from "node:crypto";
import { readFileSync, writeFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { join, relative } from "node:path";

const ROOT = process.cwd();
const PUBLIC = join(ROOT, "public");

const ICON_FILES = [
  "favicon.ico",
  "favicon.png",
  "favicon-32.png",
  "apple-touch-icon.png",
  "apple-touch-icon-120.png",
  "apple-touch-icon-152.png",
  "apple-touch-icon-167.png",
  "apple-touch-icon-180.png",
  "icon-192.png",
  "icon-512.png",
  "icon-512-maskable.png",
];

const TBH_ICON_FILES = [
  "tekenbeethulp-favicon.ico",
  "tekenbeethulp-favicon-16.png",
  "tekenbeethulp-favicon-32.png",
  "tekenbeethulp-favicon-48.png",
  "tekenbeethulp-apple-touch-icon-180.png",
  "tekenbeethulp-icon-192.png",
  "tekenbeethulp-icon-512.png",
  "tekenbeethulp-icon-512-maskable.png",
];

function hashOf(paths) {
  const h = createHash("sha256");
  for (const p of paths.sort()) {
    if (!existsSync(p)) continue;
    h.update(relative(ROOT, p));
    h.update(readFileSync(p));
  }
  return h.digest("hex").slice(0, 8);
}

function filesIn(dir, exclude = () => false) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    if (exclude(path)) return [];
    return entry.isDirectory() ? filesIn(path, exclude) : [path];
  });
}

const iconPaths = ICON_FILES.map((f) => join(PUBLIC, f));
const tbhIconPaths = TBH_ICON_FILES.map((f) => join(PUBLIC, f));
const splashDir = join(PUBLIC, "splash");
const splashPaths = existsSync(splashDir)
  ? readdirSync(splashDir).filter((f) => statSync(join(splashDir, f)).isFile()).map((f) => join(splashDir, f))
  : [];
const splashTbhDir = join(PUBLIC, "splash-tbh");
const splashTbhPaths = existsSync(splashTbhDir)
  ? readdirSync(splashTbhDir).filter((f) => statSync(join(splashTbhDir, f)).isFile()).map((f) => join(splashTbhDir, f))
  : [];

const verwijderDir = join(PUBLIC, "verwijderen");
const verwijderPaths = existsSync(verwijderDir)
  ? readdirSync(verwijderDir).filter((f) => statSync(join(verwijderDir, f)).isFile()).map((f) => join(verwijderDir, f))
  : [];

const iconVersion = hashOf(iconPaths);
const verwijderVersion = hashOf(verwijderPaths);
const websitePaths = [
  ...filesIn(join(ROOT, "src"), (path) =>
    path.endsWith(join("src", "data", "appVersie.ts")) ||
    path.endsWith(join("src", "data", "changelog.ts")) ||
    path.endsWith(".asset.json"),
  ),
  join(ROOT, "package.json"),
  join(ROOT, "vite.config.ts"),
];

const websiteVersion = hashOf(websitePaths);
const tbhIconVersion = hashOf(tbhIconPaths);
const trkSplashVersion = hashOf([
  ...splashPaths,
  join(ROOT, "src/assets/splash-staand3.jpg.asset.json"),
  join(ROOT, "src/assets/splash-liggend6.jpg.asset.json"),
]);
const tbhSplashVersion = hashOf([
  ...splashTbhPaths,
  join(ROOT, "src/assets/tbg-splash-staand-2026c.jpeg.asset.json"),
  join(ROOT, "src/assets/tbg-splash-liggend-2026c.jpeg.asset.json"),
]);

// src/data/appVersie.ts schrijven
const out = `// AUTOGEGENEREERD door scripts/bump-assets.mjs — niet handmatig aanpassen.
// Draai \`bun run scripts/bump-assets.mjs\` na het vervangen van iconen, startschermen of stap-afbeeldingen.
export const ICON_VERSION = "${iconVersion}";
export const TBH_ICON_VERSION = "${tbhIconVersion}";
export const TRK_SPLASH_VERSION = "${trkSplashVersion}";
export const TBH_SPLASH_VERSION = "${tbhSplashVersion}";
export const SPLASH_VERSION = TRK_SPLASH_VERSION;
export const WEBSITE_VERSION = "${websiteVersion}";
export const VERWIJDER_VERSION = "${verwijderVersion}";
export const ASSET_VERSION = ICON_VERSION;
`;
// Peildatum en updatecode: alleen vernieuwen als er daadwerkelijk iets wijzigt.
const vorigBestand = existsSync(join(ROOT, "src/data/appVersie.ts")) ? readFileSync(join(ROOT, "src/data/appVersie.ts"), "utf8") : "";
const vorigeVersie = (vorigBestand.match(/WEBSITE_VERSION = "([^"]+)"/) || [])[1];
const vorigeDatum = (vorigBestand.match(/PEILDATUM_AUTO = "([^"]+)"/) || [])[1];
const vorigeUpdateCode = (vorigBestand.match(/LAATSTE_UPDATE_AUTO = "([^"]+)"/) || [])[1];
const vorigeLogboekTop = (vorigBestand.match(/CHANGELOG_TOP_AUTO = "([^"]+)"/) || [])[1];

const nu = new Date();
const nl = (opties) => new Intl.DateTimeFormat("nl-NL", { timeZone: "Europe/Amsterdam", ...opties }).format(nu);
const vandaag = nl({ day: "numeric", month: "long", year: "numeric" });
const codeVanVandaag = `${nl({ day: "2-digit" })}${nl({ month: "2-digit" })}${nl({ year: "numeric" })}`;
// DDMMYYYY is niet als tekst te vergelijken (de dag staat vooraan); deze
// sleutel zet een updatecode om naar JJJJMMDD zodat ouder/jonger klopt.
const dagSleutel = (code) => (/^\d{8}$/.test(code ?? "") ? `${code.slice(4)}${code.slice(2, 4)}${code.slice(0, 2)}` : "");

// Nieuwste dagblok van het openbare logboek: een nieuw logboekblok is ook een
// bijwerking, zelfs als de websitebestanden zelf niet zijn veranderd.
const changelogPad = join(ROOT, "src/data/changelog.ts");
const logboekTop = existsSync(changelogPad)
  ? (readFileSync(changelogPad, "utf8").match(/update:\s*"(\d{8})"/) || [])[1] ?? ""
  : "";

const websiteGewijzigd = vorigeVersie !== websiteVersion;
const logboekGewijzigd = vorigeLogboekTop !== logboekTop;
const logboekNieuwer = dagSleutel(logboekTop) > dagSleutel(vorigeUpdateCode);
const peildatum = vorigeDatum && !websiteGewijzigd ? vorigeDatum : vandaag;
// De updatecode in het Imprint loopt daarmee nooit achter op de websitebouw,
// het logboek of de peildatum van de gegevens.
const updateCode =
  vorigeUpdateCode && !websiteGewijzigd && !logboekGewijzigd && !logboekNieuwer ? vorigeUpdateCode : codeVanVandaag;

writeFileSync(
  join(ROOT, "src/data/appVersie.ts"),
  `${out}export const PEILDATUM_AUTO = "${peildatum}";\n` +
    `export const LAATSTE_UPDATE_AUTO = "${updateCode}";\n` +
    `export const CHANGELOG_TOP_AUTO = "${logboekTop}";\n`,
);

// Alle browser- en Apple-iconen met unieke bestandsnaam wegschrijven.
// Safari cachet ook apple-touch-icon-URL's hardnekkig; een querystring alleen
// is daarvoor niet altijd voldoende. Google gebruikt bij voorkeur 48×48.
{
  const { copyFileSync, unlinkSync } = await import("node:fs");
  for (const f of readdirSync(PUBLIC)) {
    if (/^(favicon(?:-32|-48|-512)?|apple-touch-icon(?:-120|-152|-167|-180)?|icon-(?:192|512|512-maskable))-[a-f0-9]{8}\.(?:png|ico)$/.test(f)) {
      unlinkSync(join(PUBLIC, f));
    }
  }
  copyFileSync(join(PUBLIC, "favicon.ico"), join(PUBLIC, `favicon-${iconVersion}.ico`));
  copyFileSync(join(PUBLIC, "favicon-32.png"), join(PUBLIC, `favicon-32-${iconVersion}.png`));
  copyFileSync(join(PUBLIC, "favicon-48.png"), join(PUBLIC, `favicon-48-${iconVersion}.png`));
  copyFileSync(join(PUBLIC, "favicon.png"), join(PUBLIC, `favicon-512-${iconVersion}.png`));
  for (const size of [120, 152, 167, 180]) {
    copyFileSync(join(PUBLIC, `apple-touch-icon-${size}.png`), join(PUBLIC, `apple-touch-icon-${size}-${iconVersion}.png`));
  }
  copyFileSync(join(PUBLIC, "apple-touch-icon.png"), join(PUBLIC, `apple-touch-icon-${iconVersion}.png`));
  copyFileSync(join(PUBLIC, "icon-192.png"), join(PUBLIC, `icon-192-${iconVersion}.png`));
  copyFileSync(join(PUBLIC, "icon-512.png"), join(PUBLIC, `icon-512-${iconVersion}.png`));
  copyFileSync(join(PUBLIC, "icon-512-maskable.png"), join(PUBLIC, `icon-512-maskable-${iconVersion}.png`));
}


// manifest.webmanifest bijwerken met fysiek unieke paden.
const manifestPath = join(PUBLIC, "manifest.webmanifest");
const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
manifest.icons = manifest.icons.map((icon) => ({
  ...icon,
  src: icon.src
    .replace(/-[a-f0-9]{8}(?=\.png$)/, "")
    .replace(/\.png(?:\?v=[A-Za-z0-9]+)?$/, `-${iconVersion}.png`),
}));
writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);

// Het TekenbeetGids-manifest gebruikt queryversies omdat deze iconen hun vaste
// bestandsnaam behouden. De nieuwe manifest-URL én deze queryversies verversen
// de geïnstalleerde web-app automatisch.
const tbhManifestPath = join(PUBLIC, "manifest-tekenbeethulp.webmanifest");
const tbhManifest = JSON.parse(readFileSync(tbhManifestPath, "utf8"));
tbhManifest.icons = tbhManifest.icons.map((icon) => ({
  ...icon,
  src: icon.src
    .replace(/\?v=[A-Za-z0-9]+$/, "")
    .concat(`?v=${tbhIconVersion}`),
}));
writeFileSync(tbhManifestPath, `${JSON.stringify(tbhManifest, null, 2)}\n`);

console.log(`website v=${websiteVersion} • TRK-iconen v=${iconVersion} • TBG-iconen v=${tbhIconVersion} • TRK-startschermen v=${trkSplashVersion} • TBG-startschermen v=${tbhSplashVersion}`);

