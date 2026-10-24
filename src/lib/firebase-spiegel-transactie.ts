import { MIGRATIE_DATABASE } from "./firebase-migratie";

export type SpiegelTransport = (path: string, init?: RequestInit) => Promise<unknown>;

export function intrekkingDocument(nummer: string): string {
  const basis = /^TRK-\d{4}-[A-Z0-9]{6}(?:-[A-Z0-9]+)?$/.exec(nummer);
  if (!basis) throw new Error("Ongeldig deelnamenummer voor intrekkingsbeveiliging");
  return `${MIGRATIE_DATABASE}/documents/intrekkingen/${nummer.slice(0, 15)}`;
}

/** Reading the tombstone inside the transaction conflicts with concurrent withdrawal. */
export async function schrijfZonderIntrekking(transport: SpiegelTransport, nummer: string, writes: unknown[]): Promise<boolean> {
  const started = await transport(`${MIGRATIE_DATABASE}/documents:beginTransaction`, {
    method: "POST", body: JSON.stringify({ options: { readWrite: {} } }),
  }) as { transaction?: string };
  if (!started.transaction) throw new Error("Google-transactie niet beschikbaar");
  const transaction = started.transaction;
  let klaar = false;
  try {
    const rows = await transport(`${MIGRATIE_DATABASE}/documents:batchGet`, {
      method: "POST", body: JSON.stringify({ documents: [intrekkingDocument(nummer)], transaction }),
    }) as { found?: { name?: string }; missing?: string }[];
    if (!Array.isArray(rows) || rows.length !== 1 || (!rows[0]?.found && !rows[0]?.missing)) {
      throw new Error("Intrekkingscontrole niet beschikbaar");
    }
    if (rows[0]?.found) return false;
    await transport(`${MIGRATIE_DATABASE}/documents:commit`, {
      method: "POST", body: JSON.stringify({ transaction, writes }),
    });
    klaar = true;
    return true;
  } finally {
    if (!klaar) await transport(`${MIGRATIE_DATABASE}/documents:rollback`, {
      method: "POST", body: JSON.stringify({ transaction }),
    }).catch(() => undefined);
  }
}

/** Durable Google marker is written before removing copies; never contains report data. */
export async function markeerIntrekking(transport: SpiegelTransport, nummer: string): Promise<void> {
  await transport(`${MIGRATIE_DATABASE}/documents:commit`, {
    method: "POST", body: JSON.stringify({ writes: [{ update: {
      name: intrekkingDocument(nummer), fields: { ingetrokken: { booleanValue: true }, google_verwijdering: { stringValue: "in-behandeling" }, bijgewerkt: { timestampValue: new Date().toISOString() } },
    } }] }),
  });
}