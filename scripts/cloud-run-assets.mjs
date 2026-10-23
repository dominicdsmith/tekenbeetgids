// Kopieert alle platform-afbeeldingen (.asset.json) in de Cloud Run-build,
// zodat de eigen hosting ze zelf levert en niet van een domein afhangt.
import { readdirSync, readFileSync, mkdirSync, writeFileSync, statSync } from "node:fs";
import { join, dirname } from "node:path";

const BRON = "https://tekenrisicokaart.lovable.app";
const DOEL = "public"; // vóór de build, zodat de server ze in zijn bestandslijst opneemt

function zoek(map, uit = []) {
  for (const naam of readdirSync(map)) {
    const pad = join(map, naam);
    if (statSync(pad).isDirectory()) zoek(pad, uit);
    else if (naam.endsWith(".asset.json")) uit.push(pad);
  }
  return uit;
}

const pointers = [...zoek("src"), ...zoek("public")];
let fouten = 0;
for (const p of pointers) {
  const { url, size } = JSON.parse(readFileSync(p, "utf8"));
  const res = await fetch(BRON + url, { redirect: "follow" });
  const buf = Buffer.from(await res.arrayBuffer());
  if (!res.ok || (size && buf.length !== size)) {
    console.error(`Mislukt: ${url} (${res.status}, ${buf.length}/${size})`);
    fouten++;
    continue;
  }
  const bestand = join(DOEL, url);
  mkdirSync(dirname(bestand), { recursive: true });
  writeFileSync(bestand, buf);
}
console.log(`${pointers.length - fouten}/${pointers.length} afbeeldingen meegeleverd`);
if (fouten) process.exit(1);
