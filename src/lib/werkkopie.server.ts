/**
 * Werkkopie in de afgeschermde werkomgeving bij Google (verwerker, met verwerkersovereenkomst).
 * Lovable Cloud blijft de bronadministratie. Mislukken blokkeert nooit een deelname, melding of scan.
 * Databases: Deelname onderzoek, Klachten- en privacyregister, Beetplekken (tab AI-scans), Tekensoorten (tab AI-scans).
 */

const SHEETS = "https://connector-gateway.lovable.dev/google_sheets/v4";
const DRIVE = "https://connector-gateway.lovable.dev/google_drive";

export const WERKKOPIE = {
  deelnames: { id: "11Gw5Dj4suC6aLNXVFhv0k4a_d17F0hVXlLntDTKBzNo", tab: "Deelnames" },
  register: { id: "1Y7i9X4takgKcs8V5L8oqtSEQrXPZNWk660CvLqjXLlI", klachten: "Klachtenregister", verzoeken: "Privacyverzoeken (AVG)" },
  beetplek: { id: "17IGXzMeth9XJUS82clElhiLilgOTZ24Kyy08jNeEcj8", tab: "AI-scans" },
  teek: { id: "1Zxj0RDERQzDzUFWYJDdXgIIxEGqy_tMaiPXAr5mnAs4", tab: "AI-scans" },
  backupMap: "1pvqFUH6ZCfT3uPfFyODcagcNsFrGYZ9r",
} as const;

function sheetHeaders(): Record<string, string> | null {
  const lov = process.env["LOVABLE_API_KEY"];
  const key = process.env["GOOGLE_SHEETS_API_KEY"];
  if (!lov || !key) return null;
  return { Authorization: `Bearer ${lov}`, "X-Connection-Api-Key": key, "Content-Type": "application/json" };
}
export function driveHeaders(): Record<string, string> | null {
  const lov = process.env["LOVABLE_API_KEY"];
  const key = process.env["GOOGLE_DRIVE_API_KEY"];
  if (!lov || !key) return null;
  return { Authorization: `Bearer ${lov}`, "X-Connection-Api-Key": key };
}

const bereik = (tab: string, cellen: string) => `'${tab.replace(/'/g, "''")}'!${cellen}`;
const pad = (r: string) => encodeURIComponent(r).replace(/%21/g, "!").replace(/%3A/g, ":");

async function verzoek(url: string, init: RequestInit, wat: string) {
  const res = await fetch(url, init);
  if (!res.ok) throw new Error(`${wat} mislukt [${res.status}]: ${await res.text()}`);
  return res.json() as Promise<any>;
}

async function leesKoppen(h: Record<string, string>, id: string, tab: string): Promise<string[]> {
  const d = await verzoek(`${SHEETS}/spreadsheets/${id}/values/${pad(bereik(tab, "1:1"))}`, { headers: h }, "Koppen lezen");
  return ((d.values?.[0] ?? []) as string[]).map((k) => String(k).replace(/\s+/g, " ").trim());
}

async function tabIds(h: Record<string, string>, id: string): Promise<Record<string, number>> {
  const d = await verzoek(`${SHEETS}/spreadsheets/${id}?fields=sheets.properties(sheetId,title)`, { headers: h }, "Tabbladen lezen");
  return Object.fromEntries((d.sheets ?? []).map((s: any) => [s.properties.title, s.properties.sheetId]));
}

/* Maakt het tabblad aan (als het ontbreekt) en vult ontbrekende koppen aan het eind aan. */
async function zorgKoppen(h: Record<string, string>, id: string, tab: string, nodig: string[]): Promise<string[]> {
  const tabs = await tabIds(h, id);
  if (!(tab in tabs)) {
    await verzoek(`${SHEETS}/spreadsheets/${id}:batchUpdate`, { method: "POST", headers: h, body: JSON.stringify({ requests: [{ addSheet: { properties: { title: tab, gridProperties: { frozenRowCount: 1 } } } }] }) }, "Tabblad aanmaken");
  }
  const koppen = await leesKoppen(h, id, tab);
  const extra = nodig.filter((k) => !koppen.includes(k));
  if (extra.length) {
    const alle = [...koppen, ...extra];
    await verzoek(`${SHEETS}/spreadsheets/${id}/values/${pad(bereik(tab, "A1"))}?valueInputOption=RAW`, { method: "PUT", headers: h, body: JSON.stringify({ values: [alle] }) }, "Koppen bijwerken");
    return alle;
  }
  return koppen;
}

async function voegRijToe(h: Record<string, string>, id: string, tab: string, waarden: Record<string, string | number>) {
  const koppen = await zorgKoppen(h, id, tab, Object.keys(waarden));
  const rij = koppen.map((k) => (waarden[k] ?? "") as string | number);
  await verzoek(`${SHEETS}/spreadsheets/${id}/values/${pad(bereik(tab, "A1"))}:append?valueInputOption=RAW&insertDataOption=INSERT_ROWS`, { method: "POST", headers: h, body: JSON.stringify({ values: [rij] }) }, "Rij toevoegen");
}

/* Rijnummer (1-gebaseerd) van een deelnamenummer in kolom A; null als niet gevonden. */
async function vindRij(h: Record<string, string>, deelnamenummer: string): Promise<number | null> {
  const { id, tab } = WERKKOPIE.deelnames;
  const d = await verzoek(`${SHEETS}/spreadsheets/${id}/values/${pad(bereik(tab, "A:A"))}`, { headers: h }, "Deelnamenummers lezen");
  const i = ((d.values ?? []) as string[][]).findIndex((r, n) => n > 0 && r[0] === deelnamenummer);
  return i < 0 ? null : i + 1;
}

const dag = (d: Date) => d.toISOString().slice(0, 10);
const tijd = (d: Date) => `${dag(d)} ${d.toISOString().slice(11, 19)}`;

/** Eén rij per deelname, gekoppeld op kolomtitel. */
export async function voegDeelnameToe(waarden: Record<string, string | number>) {
  const h = sheetHeaders();
  if (!h) return;
  const schoon = Object.fromEntries(Object.entries(waarden).filter(([, v]) => v !== "" && v != null));
  if (typeof schoon["Datum/tijd deelname (UTC)"] === "string") schoon["Datum/tijd deelname (UTC)"] = tijd(new Date(schoon["Datum/tijd deelname (UTC)"] as string));
  await voegRijToe(h, WERKKOPIE.deelnames.id, WERKKOPIE.deelnames.tab, schoon);
}

/** Opt-out: verwijdert de rij van dit deelnamenummer. */
export async function wisDeelname(deelnamenummer: string) {
  const h = sheetHeaders();
  if (!h) return;
  const rij = await vindRij(h, deelnamenummer);
  if (rij === null) return;
  const sheetId = (await tabIds(h, WERKKOPIE.deelnames.id))[WERKKOPIE.deelnames.tab];
  await verzoek(`${SHEETS}/spreadsheets/${WERKKOPIE.deelnames.id}:batchUpdate`, { method: "POST", headers: h, body: JSON.stringify({ requests: [{ deleteDimension: { range: { sheetId, dimension: "ROWS", startIndex: rij - 1, endIndex: rij } } }] }) }, "Rij wissen");
}

/** Zet status en melddatum bij de rij van dit deelnamenummer. */
export async function werkDeelnameStatusBij(deelnamenummer: string, gemeldOp: string) {
  const h = sheetHeaders();
  if (!h) return;
  const { id, tab } = WERKKOPIE.deelnames;
  const rij = await vindRij(h, deelnamenummer);
  if (rij === null) return;
  const koppen = await zorgKoppen(h, id, tab, ["Status", "Gemeld op"]);
  const kol = (k: string) => { let n = koppen.indexOf(k) + 1, s = ""; while (n > 0) { const m = (n - 1) % 26; s = String.fromCharCode(65 + m) + s; n = Math.floor((n - 1) / 26); } return s; };
  await verzoek(`${SHEETS}/spreadsheets/${id}/values:batchUpdate`, { method: "POST", headers: h, body: JSON.stringify({ valueInputOption: "RAW", data: [
    { range: bereik(tab, `${kol("Status")}${rij}`), values: [["Tekenbeet gemeld"]] },
    { range: bereik(tab, `${kol("Gemeld op")}${rij}`), values: [[gemeldOp.slice(0, 16).replace("T", " ")]] },
  ] }) }, "Status bijwerken");
}

/* Klachten en privacyverzoeken: anoniem — nooit naam of contactgegevens. */
export async function voegMeldingToe(m: { referentie: string; soort: "privacyklacht" | "privacyverzoek"; onderwerp: string; bericht: string; taal: string; verzoeknummer?: string | undefined }) {
  const h = sheetHeaders();
  if (!h) return;
  const nu = new Date();
  const omschrijving = `${m.onderwerp} — ${m.bericht}`.slice(0, 2000);
  const opm = `Incidentnummer ${m.referentie}${m.verzoeknummer ? ` · verzoeknummer ${m.verzoeknummer}` : ""} · taal ${m.taal} · via contactformulier`;
  const r = WERKKOPIE.register;
  if (m.soort === "privacyklacht") {
    await voegRijToe(h, r.id, r.klachten, { "Nr.": m.referentie, "Datum ontvangst": dag(nu), "Type klacht": "Privacyklacht", "Omschrijving klacht": omschrijving, "Status": "Ontvangen", "Opmerkingen": opm });
  } else {
    const verval = new Date(nu);
    verval.setMonth(verval.getMonth() + 1); // art. 12 lid 3 AVG
    await voegRijToe(h, r.id, r.verzoeken, { "Nr.": m.verzoeknummer ?? m.referentie, "Datum ontvangst": dag(nu), "Type verzoek": "Privacyverzoek", "Omschrijving verzoek": omschrijving, "Identiteit geverifieerd?": "Nee", "Wettelijke vervaldatum": dag(verval), "Termijn verlengd?": "Nee", "Status": "Ontvangen", "Opmerkingen": opm });
  }
}

/* AI-fotoscans: één rij per scan; nooit de foto zelf. */
export async function voegScanToe(soort: "beetplek" | "teek", scan: { uitkomst: string; kenmerken: string[]; taal: string }) {
  const h = sheetHeaders();
  if (!h) return;
  const doel = soort === "beetplek" ? WERKKOPIE.beetplek : WERKKOPIE.teek;
  await voegRijToe(h, doel.id, doel.tab, { Datum: tijd(new Date()).slice(0, 16), Uitkomst: scan.uitkomst, Kenmerken: scan.kenmerken.join("; ").slice(0, 2000), Taal: scan.taal });
}

/** Uploadt een (al versleuteld) back-upbestand naar de map Back-up en houdt de laatste `bewaar` bestanden. */
export async function uploadBackup(naam: string, inhoud: string, bewaar: number) {
  const h = driveHeaders();
  if (!h) throw new Error("Opslagkoppeling niet ingesteld");
  const grens = "tbg" + crypto.randomUUID();
  const meta = JSON.stringify({ name: naam, parents: [WERKKOPIE.backupMap], mimeType: "application/octet-stream" });
  const body = `--${grens}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${meta}\r\n--${grens}\r\nContent-Type: application/octet-stream\r\n\r\n${inhoud}\r\n--${grens}--`;
  await verzoek(`${DRIVE}/upload/drive/v3/files?uploadType=multipart&supportsAllDrives=true`, { method: "POST", headers: { ...h, "Content-Type": `multipart/related; boundary=${grens}` }, body }, "Back-up uploaden");
  try {
    const q = encodeURIComponent(`'${WERKKOPIE.backupMap}' in parents and trashed=false and name contains 'backup-'`);
    const d = await verzoek(`${DRIVE}/drive/v3/files?q=${q}&supportsAllDrives=true&includeItemsFromAllDrives=true&orderBy=name&fields=files(id,name)&pageSize=200`, { headers: h }, "Back-ups lijsten");
    const bestanden = ((d.files ?? []) as { id: string; name: string }[]).filter((f) => /^backup-[\d-]+\.json\.enc$/.test(f.name)).sort((a, b) => a.name.localeCompare(b.name));
    for (const oud of bestanden.slice(0, Math.max(0, bestanden.length - bewaar))) {
      await fetch(`${DRIVE}/drive/v3/files/${oud.id}?supportsAllDrives=true`, { method: "DELETE", headers: h });
    }
  } catch (e) {
    console.error("Opruimen oude back-ups mislukt:", e);
  }
}
