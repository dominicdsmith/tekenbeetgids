export type IntrekStatus = {
  actieveDeelnames: number; oudeCodesGereed: number; codesOntbreken: number;
  codesAfwijkend: number; intrekkingen: number; intrekkingenNietAfgerond: number; gecontroleerd: string;
  codecontroles?: { gelijk: number; afwijkend: number; nietBeschikbaar: number };
};
export type IntrekControleRij = { id: string; nummer: string };
export type IntrekCodeRij = { nummer: string; deelnameId: string; fingerprint: string; versie: string };

/** Only aggregate statuses cross the administration boundary, never codes, fingerprints or record numbers. */
export function beoordeelIntrekStatus(deelnames: IntrekControleRij[], registraties: IntrekControleRij[], codes: IntrekCodeRij[], markers: string[], gecontroleerd: string): IntrekStatus {
  const ingetrokken = new Set(markers);
  const actief = deelnames.filter(r => !ingetrokken.has(r.nummer));
  let gereed = 0, ontbreekt = 0, afwijkend = 0;
  for (const rij of actief) {
    const gevonden = codes.filter(c => c.nummer === rij.nummer);
    if (!gevonden.length) { ontbreekt++; continue; }
    const code = gevonden[0];
    if (gevonden.length === 1 && code?.deelnameId === rij.id && code.versie === "legacy-sha256-v1" && /^[a-f0-9]{64}$/.test(code.fingerprint)) gereed++;
    else afwijkend++;
  }
  const nietAfgerond = [...ingetrokken].filter(nummer => deelnames.some(r => r.nummer === nummer) || registraties.some(r => r.nummer === nummer || r.nummer.startsWith(`${nummer}-`))).length;
  return { actieveDeelnames: actief.length, oudeCodesGereed: gereed, codesOntbreken: ontbreekt, codesAfwijkend: afwijkend, intrekkingen: ingetrokken.size, intrekkingenNietAfgerond: nietAfgerond, gecontroleerd };
}