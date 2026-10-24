import { describe, it, expect } from 'vitest';
import { herstelProef, ontsleutelBackup, valideerSnapshot, type HerstelSnapshot } from '@/lib/google-herstel';
import { versleutelGoogleExport, GOOGLE_EXPORT_COLLECTIES } from '@/lib/google-administratie';

const snapshot = (): HerstelSnapshot => ({ bron: 'Google Firestore', tabellen: Object.fromEntries(GOOGLE_EXPORT_COLLECTIES.map(c => [c, c === 'intrekkingen' ? [{ nummer: 'TRK-2026-OLD123', ingetrokken: true }] : [{ id: 'abc', bericht: 'fictief' }]])), aantallen: Object.fromEntries(GOOGLE_EXPORT_COLLECTIES.map(c => [c, 1])) });
describe('Afgeschermde Google-herstelproef', () => {
  it('ontsleutelt alle vier administraties zonder inhoudverlies', async () => {
    const s = snapshot(); const tekst = await versleutelGoogleExport(s, 'fictieve-wachtzin-test');
    expect(await ontsleutelBackup(tekst, 'fictieve-wachtzin-test')).toEqual(s);
    await expect(ontsleutelBackup(tekst, 'verkeerde-wachtzin-test')).rejects.toThrow();
  });
  it('schrijft uitsluitend unieke proefpaden, create-only, en verwijdert ze na lezen', async () => {
    const store = new Map<string, unknown>(); const writes: any[] = [];
    const result = await herstelProef(snapshot(), async (_path, init) => {
      const b = JSON.parse(String(init?.body));
      if (b.writes) { for (const w of b.writes) { writes.push(w); if (w.update) store.set(w.update.name, w.update); else store.delete(w.delete); } return {}; }
      return b.documents.map((name: string) => store.has(name) ? { found: store.get(name) } : { missing: name });
    });
    expect(result.controle.map(r => r.aantal)).toEqual([1, 1, 1, 1, 1, 1]);
    expect(result.controle.every(r => r.gelijk)).toBe(true);
    expect(writes.every(w => (w.update?.name ?? w.delete).includes('/documents/herstelproeven/'))).toBe(true);
    expect(writes.filter(w => w.update).every(w => w.currentDocument.exists === false)).toBe(true);
    expect(store.size).toBe(0);
  });
  it('weigert ingetrokken deelnames voordat iets geschreven wordt', () => {
    const s = snapshot(); s.tabellen['deelnames'] = [{ id: 'abc', deelnamenummer: 'TRK-2026-OLD123' }];
    expect(() => valideerSnapshot(s)).toThrow('ingetrokken');
  });
  it('weigert een gedeeltelijke back-up', () => {
    const s = snapshot(); delete s.tabellen['privacy_verzoeken'];
    expect(() => valideerSnapshot(s)).toThrow();
  });
  it('ruimt ook op na een mislukte lezing', async () => {
    let gewist = false;
    await expect(herstelProef(snapshot(), async (_p, init) => {
      const b = JSON.parse(String(init?.body));
      if (b.writes) { if (b.writes[0]?.delete) gewist = true; return {}; }
      return gewist ? b.documents.map((missing: string) => ({ missing })) : [];
    })).rejects.toThrow('onvolledig');
    expect(gewist).toBe(true);
  });
});