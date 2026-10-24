import { maakMigratieTransport, voerMigratieUit } from './firebase-migratie.server';
import { leesGoogleMomentopname, versleutelGoogleExport } from './google-administratie';
import { herstelProef, ontsleutelBackup } from './google-herstel';
import { driveHeaders, WERKKOPIE } from './werkkopie.server';

/** Dedicated upload never runs retention or modifies any existing backup. */
export async function maakBackupEnHerstelproef() {
  const wachtzin = process.env['BACKUP_WACHTZIN'];
  if (!wachtzin || wachtzin.length < 12) throw new Error('Back-upsleutel ontbreekt');
  const transport = maakMigratieTransport();
  const voor = await voerMigratieUit({ actie: 'controleren' }, transport);
  if (!voor.records?.every(r => r.gelijk)) throw new Error('Bron en Google verschillen; back-up niet gestart');
  const snapshot = await leesGoogleMomentopname(transport);
  const na = await voerMigratieUit({ actie: 'controleren' }, transport);
  if (!na.records?.every(r => r.gelijk) || voor.aantallen.some((r, i) => r.bron !== na.aantallen[i]?.bron)) throw new Error('Administratie gewijzigd; probeer opnieuw');
  const gemaakt = new Date().toISOString();
  const tekst = await versleutelGoogleExport({ ...snapshot, gemaakt_op: gemaakt }, wachtzin);
  const h = driveHeaders();
  if (!h) throw new Error('Back-upopslag niet beschikbaar');
  const naam = `herstelbackup-${gemaakt.replace(/[:.]/g, '-')}-${crypto.randomUUID()}.json.enc`;
  const grens = `tbg${crypto.randomUUID()}`;
  const meta = JSON.stringify({ name: naam, parents: [WERKKOPIE.backupMap], mimeType: 'application/octet-stream' });
  const body = `--${grens}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${meta}\r\n--${grens}\r\nContent-Type: application/octet-stream\r\n\r\n${tekst}\r\n--${grens}--`;
  const response = await fetch('https://connector-gateway.lovable.dev/google_drive/upload/drive/v3/files?uploadType=multipart&supportsAllDrives=true&fields=id', { method: 'POST', headers: { ...h, 'Content-Type': `multipart/related; boundary=${grens}` }, body });
  if (!response.ok) throw new Error(`Back-upupload niet afgerond (${response.status})`);
  const file = await response.json() as { id?: string };
  if (!file.id || !/^[a-zA-Z0-9_-]+$/.test(file.id)) throw new Error('Back-upbestand niet bevestigd');
  const download = await fetch(`https://connector-gateway.lovable.dev/google_drive/drive/v3/files/${file.id}?alt=media&supportsAllDrives=true`, { headers: h });
  if (!download.ok) throw new Error(`Back-up opgeslagen, teruglezen niet afgerond (${download.status})`);
  const terug = await download.text();
  if (terug !== tekst) throw new Error('Opgeslagen back-up wijkt af');
  const decoded = await ontsleutelBackup(terug, wachtzin);
  const resultaat = await herstelProef(decoded, transport);
  return { ...resultaat, bestand: naam, gemaakt, aantallen: snapshot.aantallen };
}