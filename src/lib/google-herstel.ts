import { MIGRATIE_DATABASE } from './firebase-migratie';
import { GOOGLE_EXPORT_COLLECTIES } from './google-administratie';
import { vergelijkRecords } from './firebase-migratie-controle';
import type { SpiegelTransport } from './firebase-spiegel-transactie';

export type HerstelSnapshot = { bron: string; tabellen: Record<string, Record<string, unknown>[]>; aantallen: Record<string, number> };
const bytes = (s: string) => Uint8Array.from(atob(s), c => c.charCodeAt(0));

export async function ontsleutelBackup(tekst: string, wachtzin: string): Promise<HerstelSnapshot> {
  const e = JSON.parse(tekst);
  if (e.formaat !== 'TekenbeetGids-backup-v1' || e.alg !== 'AES-256-GCM' || e.kdf !== 'PBKDF2-SHA256' || e.iteraties !== 100_000 || wachtzin.length < 12) throw new Error('Ongeldige back-up');
  const basis = await crypto.subtle.importKey('raw', new TextEncoder().encode(wachtzin), 'PBKDF2', false, ['deriveKey']);
  const key = await crypto.subtle.deriveKey({ name: 'PBKDF2', salt: bytes(e.zout), iterations: 100_000, hash: 'SHA-256' }, basis, { name: 'AES-GCM', length: 256 }, false, ['decrypt']);
  const data = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: bytes(e.iv) }, key, bytes(e.data));
  const snapshot = JSON.parse(new TextDecoder().decode(data)) as HerstelSnapshot;
  valideerSnapshot(snapshot);
  return snapshot;
}

export function valideerSnapshot(s: HerstelSnapshot) {
  if (s.bron !== 'Google Firestore' || !s.tabellen || !s.aantallen || Object.keys(s.tabellen).length !== GOOGLE_EXPORT_COLLECTIES.length) throw new Error('Onvolledige back-up');
  let totaal = 0;
  for (const c of GOOGLE_EXPORT_COLLECTIES) {
    const rows = s.tabellen[c];
    if (!Array.isArray(rows) || rows.length !== s.aantallen[c]) throw new Error('Onvolledige back-up');
    const ids = new Set<string>();
    for (const row of rows) {
      const id = c === 'intrekkingen' ? row['nummer'] : row['id'];
      if (typeof id !== 'string' || !/^[a-zA-Z0-9-]{1,80}$/.test(id) || ids.has(id)) throw new Error('Ongeldig herstelrecord');
      ids.add(id);
    }
    totaal += rows.length;
  }
  if (totaal > 450) throw new Error('Herstelproefgrens bereikt; geen gedeeltelijk herstel');
  const ingetrokken = new Set(s.tabellen['intrekkingen']?.filter(r => r['ingetrokken'] === true).map(r => r['nummer']));
  for (const c of ['deelnames', 'registraties']) for (const r of s.tabellen[c] ?? []) {
    if (ingetrokken.has(r['deelnamenummer']) || ingetrokken.has(r['registratienummer'])) throw new Error('Back-up bevat ingetrokken gegevens');
  }
}

/** Unique nested paths, create-only atomic commit; always erase copied records after verification. */
export async function herstelProef(s: HerstelSnapshot, transport: SpiegelTransport) {
  valideerSnapshot(s);
  const root = `${MIGRATIE_DATABASE}/documents/herstelproeven/${crypto.randomUUID()}`;
  const docs = GOOGLE_EXPORT_COLLECTIES.flatMap(c => (s.tabellen[c] ?? []).map(r => ({
    name: `${root}/${c}/${String(c === 'intrekkingen' ? r['nummer'] : r['id'])}`,
    fields: { gegevens: { stringValue: JSON.stringify(r) } },
  })));
  const namen = docs.map(d => d.name);
  const controle = [];
  let gestart = false;
  try {
    gestart = true;
    if (docs.length) await transport(`${MIGRATIE_DATABASE}/documents:commit`, { method: 'POST', body: JSON.stringify({ writes: docs.map(update => ({ update, currentDocument: { exists: false } })) }) });
    for (const c of GOOGLE_EXPORT_COLLECTIES) {
      const namenCollectie = namen.filter(n => n.startsWith(`${root}/${c}/`));
      const gelezen = namenCollectie.length ? await transport(`${MIGRATIE_DATABASE}/documents:batchGet`, { method: 'POST', body: JSON.stringify({ documents: namenCollectie }) }) as { found?: { name: string; fields?: { gegevens?: { stringValue?: string } } } }[] : [];
      if (!Array.isArray(gelezen) || gelezen.length !== namenCollectie.length) throw new Error('Herstellezing onvolledig');
      const rows = gelezen.map(d => {
        if (!d.found || !namenCollectie.includes(d.found.name) || !d.found.fields?.gegevens?.stringValue) throw new Error('Herstelrecord ontbreekt');
        return JSON.parse(d.found.fields.gegevens.stringValue) as Record<string, unknown>;
      });
      const normaliseer = (rs: Record<string, unknown>[]) => rs.map(r => c === 'intrekkingen' ? { ...r, id: r['nummer'] } : r);
      const result = vergelijkRecords(c, normaliseer(s.tabellen[c] ?? []), normaliseer(rows));
      if (!result.gelijk) throw new Error('Herstelinhoud wijkt af');
      controle.push({ ...result, aantal: rows.length });
    }
  } finally {
    if (gestart && namen.length) {
      await transport(`${MIGRATIE_DATABASE}/documents:commit`, { method: 'POST', body: JSON.stringify({ writes: namen.map(n => ({ delete: n })) }) });
      const check = await transport(`${MIGRATIE_DATABASE}/documents:batchGet`, { method: 'POST', body: JSON.stringify({ documents: namen }) }) as { missing?: string }[];
      if (!Array.isArray(check) || check.length !== namen.length || check.some(d => !d.missing || !namen.includes(d.missing))) throw new Error('Opruimen herstelproef niet bevestigd');
    }
  }
  return { controle, opgeruimd: true, productieGewijzigd: false };
}