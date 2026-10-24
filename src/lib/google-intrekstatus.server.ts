import { MIGRATIE_DATABASE } from "./firebase-migratie";
import { maakSpiegelTransport } from "./firebase-spiegel.server";
import { beoordeelIntrekStatus } from "./google-intrekstatus";

type Doc = { name: string; fields?: Record<string, { stringValue?: string }> };
/** Consistent server-only metadata check; no submitted codes and no changes to records. */
export async function leesGoogleIntrekStatus() {
  const transport = maakSpiegelTransport();
  if (!transport) throw new Error("Google-verbinding ontbreekt");
  const begin = await transport(`${MIGRATIE_DATABASE}/documents:beginTransaction`, { method: "POST", body: JSON.stringify({ options: { readOnly: {} } }) }) as { transaction?: string };
  if (!begin.transaction) throw new Error("Intrekkingscontrole niet beschikbaar");
  const transaction = begin.transaction;
  try {
    const collecties: Record<string, Doc[]> = {};
    for (const collectie of ["deelnames", "registraties", "intrekcodes", "intrekkingen", "intrekcontrole"]) {
      const docs: Doc[] = []; let laatste: string | undefined;
      while (true) {
        const velden = collectie === "intrekcodes" ? ["deelname_id", "fingerprint", "versie"] : collectie === "intrekcontrole" ? ["uitkomst"] : ["nummer"];
        const rows = await transport(`${MIGRATIE_DATABASE}/documents:runQuery`, { method: "POST", body: JSON.stringify({ transaction, structuredQuery: {
          from: [{ collectionId: collectie }], select: { fields: velden.map(fieldPath => ({ fieldPath })) },
          orderBy: [{ field: { fieldPath: "__name__" }, direction: "ASCENDING" }], limit: 500,
          ...(laatste ? { startAt: { values: [{ referenceValue: laatste }], before: false } } : {}),
        } }) }) as { document?: Doc }[];
        if (!Array.isArray(rows)) throw new Error("Intrekkingscontrole onvolledig");
        const page = rows.flatMap(r => r.document ? [r.document] : []);
        for (const doc of page) {
          if (!doc.name.startsWith(`${MIGRATIE_DATABASE}/documents/${collectie}/`) || docs.some(d => d.name === doc.name)) throw new Error("Intrekkingscontrole onvolledig");
          docs.push(doc);
        }
        if (docs.length > 200_000) throw new Error("Controlegrens bereikt");
        if (page.length < 500) break;
        laatste = page.at(-1)?.name;
      }
      collecties[collectie] = docs;
    }
    const rijen = (collectie: string) => (collecties[collectie] ?? []).map(d => ({ id: d.name.split("/").pop() ?? "", nummer: d.fields?.["nummer"]?.stringValue ?? "" }));
    const status = beoordeelIntrekStatus(rijen("deelnames"), rijen("registraties"), (collecties["intrekcodes"] ?? []).map(d => ({
      nummer: d.name.split("/").pop() ?? "", deelnameId: d.fields?.["deelname_id"]?.stringValue ?? "",
      fingerprint: d.fields?.["fingerprint"]?.stringValue ?? "", versie: d.fields?.["versie"]?.stringValue ?? "",
    })), (collecties["intrekkingen"] ?? []).map(d => d.name.split("/").pop() ?? ""), new Date().toISOString());
    const controles = (collecties["intrekcontrole"] ?? []).map(d => d.fields?.["uitkomst"]?.stringValue);
    return { ...status, codecontroles: {
      gelijk: controles.filter(v => v === "gelijk").length,
      afwijkend: controles.filter(v => v === "afwijkend").length,
      nietBeschikbaar: controles.filter(v => v === "niet-beschikbaar").length,
    } };
  } finally {
    await transport(`${MIGRATIE_DATABASE}/documents:rollback`, { method: "POST", body: JSON.stringify({ transaction }) }).catch(() => undefined);
  }
}