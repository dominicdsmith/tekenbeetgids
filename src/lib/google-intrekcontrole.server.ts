import { MIGRATIE_DATABASE } from "./firebase-migratie";
import { maakSpiegelTransport } from "./firebase-spiegel.server";
import { controleerGoogleNaastOudeCode } from "./google-intrekcontrole";

/** No code, fingerprint, participant number, IP or explanation is written to this log. */
export async function registreerGoogleCodecontrole(nummer: string, code: string) {
  const transport = maakSpiegelTransport();
  const uitkomst = await controleerGoogleNaastOudeCode(transport, nummer, code);
  if (transport) {
    try {
      await transport(`${MIGRATIE_DATABASE}/documents:commit`, { method: "POST", body: JSON.stringify({ writes: [{ update: {
        name: `${MIGRATIE_DATABASE}/documents/intrekcontrole/${crypto.randomUUID()}`,
        fields: { uitkomst: { stringValue: uitkomst }, gecontroleerd: { timestampValue: new Date().toISOString() }, modus: { stringValue: "schaduw-oude-verifier-leidend" } },
      } }] }) });
    } catch { console.warn("Google-codecontrole niet vastgelegd"); }
  }
}