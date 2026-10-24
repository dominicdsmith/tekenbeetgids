import { MIGRATIE_DATABASE } from "./firebase-migratie";
import { intrekkingDocument, type SpiegelTransport } from "./firebase-spiegel-transactie";

export function codeDocument(nummer: string) {
  if (!/^TRK-\d{4}-[A-Z0-9]{6}$/.test(nummer)) throw new Error("Ongeldig deelnamenummer");
  return `${MIGRATIE_DATABASE}/documents/intrekcodes/${nummer}`;
}

export async function codeVingerafdruk(nummer: string, code: string) {
  codeDocument(nummer);
  const schoon = code.trim().toUpperCase().replace(/[^A-Z0-9]/g, "");
  if (!/^[A-Z0-9]{10}$/.test(schoon)) throw new Error("Ongeldige intrekcode");
  const hash = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(`trk-code-v1:${nummer}:${schoon}`));
  return Array.from(new Uint8Array(hash), b => b.toString(16).padStart(2, "0")).join("");
}

type Document = { name: string; fields?: Record<string, { stringValue?: string }> };

/** Derive old codes only within the old server; transfer fingerprints, never the key or code. */
export async function migreerCode(transport: SpiegelTransport, nummer: string, id: string, code: string): Promise<void> {
  const naam = codeDocument(nummer);
  if (!/^[a-f0-9-]{36}$/.test(id)) throw new Error("Ongeldig deelname-id");
  const fingerprint = await codeVingerafdruk(nummer, code);
  const start = await transport(`${MIGRATIE_DATABASE}/documents:beginTransaction`, { method: "POST", body: JSON.stringify({ options: { readWrite: {} } }) }) as { transaction?: string };
  if (!start.transaction) throw new Error("Code-overzet niet beschikbaar");
  const transaction = start.transaction;
  let klaar = false;
  try {
    const deelname = `${MIGRATIE_DATABASE}/documents/deelnames/${id}`;
    const marker = intrekkingDocument(nummer);
    const rows = await transport(`${MIGRATIE_DATABASE}/documents:batchGet`, { method: "POST", body: JSON.stringify({ documents: [deelname, marker, naam], transaction }) }) as { found?: Document; missing?: string }[];
    if (!Array.isArray(rows) || rows.length !== 3) throw new Error("Codecontrole onvolledig");
    const participant = rows.find(r => r.found?.name === deelname)?.found;
    if (participant?.fields?.["nummer"]?.stringValue !== nummer || !rows.some(r => r.missing === marker)) throw new Error("Deelname ontbreekt of is ingetrokken");
    const existing = rows.find(r => r.found?.name === naam)?.found;
    if (existing && (existing.fields?.["fingerprint"]?.stringValue !== fingerprint || existing.fields?.["deelname_id"]?.stringValue !== id)) throw new Error("Bestaande code wijkt af; niets overschreven");
    if (!existing && !rows.some(r => r.missing === naam)) throw new Error("Codecontrole onvolledig");
    await transport(`${MIGRATIE_DATABASE}/documents:commit`, { method: "POST", body: JSON.stringify({ transaction, writes: [{ update: { name: naam, fields: {
      fingerprint: { stringValue: fingerprint }, deelname_id: { stringValue: id }, versie: { stringValue: "legacy-sha256-v1" },
    } } }] }) });
    klaar = true;
  } finally {
    if (!klaar) await transport(`${MIGRATIE_DATABASE}/documents:rollback`, { method: "POST", body: JSON.stringify({ transaction }) }).catch(() => undefined);
  }
}

/** Google-only verification: missing record, deleted participant or marker means rejection. */
export async function verifieerGoogleCode(transport: SpiegelTransport, nummer: string, code: string): Promise<boolean> {
  let fingerprint: string;
  try { fingerprint = await codeVingerafdruk(nummer, code); } catch { return false; }
  const naam = codeDocument(nummer);
  const rows = await transport(`${MIGRATIE_DATABASE}/documents:batchGet`, { method: "POST", body: JSON.stringify({ documents: [naam, intrekkingDocument(nummer)] }) }) as { found?: Document; missing?: string }[];
  if (!Array.isArray(rows) || rows.length !== 2 || !rows.some(r => r.missing === intrekkingDocument(nummer))) return false;
  const record = rows.find(r => r.found?.name === naam)?.found;
  const id = record?.fields?.["deelname_id"]?.stringValue;
  const verwacht = record?.fields?.["fingerprint"]?.stringValue ?? "";
  if (!id || !/^[a-f0-9-]{36}$/.test(id) || verwacht.length !== fingerprint.length) return false;
  let diff = 0;
  for (let i = 0; i < fingerprint.length; i++) diff |= fingerprint.charCodeAt(i) ^ verwacht.charCodeAt(i);
  if (diff !== 0) return false;
  const participant = `${MIGRATIE_DATABASE}/documents/deelnames/${id}`;
  const result = await transport(`${MIGRATIE_DATABASE}/documents:batchGet`, { method: "POST", body: JSON.stringify({ documents: [participant] }) }) as { found?: Document }[];
  return Array.isArray(result) && result.length === 1 && result[0]?.found?.name === participant && result[0]?.found?.fields?.["nummer"]?.stringValue === nummer;
}