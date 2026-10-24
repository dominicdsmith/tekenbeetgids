import { createServerOnlyFn } from "@tanstack/react-start";
import { legeProef, PROEF_DATABASE, PROEF_DOCUMENT, verwerkProef, type ProefInput, type ProefWerkruimte } from "./firebase-proef";

type Transport = (path: string, init?: RequestInit) => Promise<unknown>;
type FirestoreDoc = { name?: string; updateTime?: string; fields?: { inhoud?: { stringValue?: string } } };

export const maakProefTransport = createServerOnlyFn((): Transport => {
  const key = process.env["GOOGLE_CLOUD_PLATFORM_API_KEY"];
  const lovableKey = process.env["LOVABLE_API_KEY"];
  if (!key || !lovableKey) throw new Error("De Google-koppeling voor de proefomgeving is niet beschikbaar");
  return async (path, init = {}) => {
    const response = await fetch(`https://connector-gateway.lovable.dev/google_cloud_platform/firestore/v1/${path}`, {
      ...init,
      headers: { "Authorization": `Bearer ${lovableKey}`, "X-Connection-Api-Key": key, "Content-Type": "application/json" },
    });
    if (response.status === 404 && (init.method ?? "GET") === "GET") return null;
    if (!response.ok) {
      console.error("Firebase proef request failed", response.status);
      if (response.status === 409 || response.status === 412) throw new Error("De proefgegevens zijn tegelijk gewijzigd; ververs voordat u verdergaat.");
      throw new Error("Google kon de proefhandeling niet afronden; er is geen alternatieve opslag gebruikt.");
    }
    return response.json();
  };
});

export async function voerProefUit(input: ProefInput, transport: Transport) {
  const doc = await transport(PROEF_DOCUMENT) as FirestoreDoc | null;
  const raw = doc?.fields?.inhoud?.stringValue;
  const state = raw ? JSON.parse(raw) as ProefWerkruimte : legeProef();
  if (state.versie !== 1 || state.fictief !== true || !Array.isArray(state.records) || !Array.isArray(state.verzoeken) || !Array.isArray(state.ingetrokken)) throw new Error("Onbekende proefgegevens; geen verwerking uitgevoerd");
  const next = verwerkProef(state, input, new Date().toISOString());
  if (next !== state) {
    await transport(`${PROEF_DATABASE}/documents:commit`, {
      method: "POST",
      body: JSON.stringify({ writes: [{
        update: { name: PROEF_DOCUMENT, fields: { inhoud: { stringValue: JSON.stringify(next) }, fictief: { booleanValue: true } } },
        currentDocument: doc?.updateTime ? { updateTime: doc.updateTime } : { exists: false },
      }] }),
    });
  }
  const saved = next !== state ? await transport(PROEF_DOCUMENT) as FirestoreDoc | null : doc;
  const opgeslagen = saved?.fields?.inhoud?.stringValue;
  const result = opgeslagen ? JSON.parse(opgeslagen) as ProefWerkruimte : next;
  return { state: result, exportTekst: input.actie === "export" ? JSON.stringify({ fictief: true, database: "tekenbeetgids-proef", records: result.records }, null, 2) : null };
}