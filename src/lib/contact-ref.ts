/** Menselijk leesbaar incidentnummer, bijv. TRK-20260820-4F2A9C. */
export function maakReferentie(id: string, createdAt: string) {
  const d = new Date(createdAt);
  const datum = `${d.getUTCFullYear()}${String(d.getUTCMonth() + 1).padStart(2, "0")}${String(d.getUTCDate()).padStart(2, "0")}`;
  const kort = id.replace(/-/g, "").slice(0, 6).toUpperCase();
  return `TRK-${datum}-${kort}`;
}

/** Uniek nummer voor het aparte privacyregister, bijv. AVG-20260923-7C1B4E. */
export function maakVerzoeknummer(createdAt: string) {
  const d = new Date(createdAt);
  const datum = `${d.getUTCFullYear()}${String(d.getUTCMonth() + 1).padStart(2, "0")}${String(d.getUTCDate()).padStart(2, "0")}`;
  const bytes = crypto.getRandomValues(new Uint8Array(3));
  const kort = Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("").toUpperCase();
  return `AVG-${datum}-${kort}`;
}
