import { z } from "zod";

export const PROEF_DATABASE = "projects/tekenbeetgids-vertex-ai/databases/tekenbeetgids-proef";
export const PROEF_DOCUMENT = `${PROEF_DATABASE}/documents/proef_runs/werkruimte`;
export const proefActies = ["deelname", "registratie", "klacht", "privacy", "intrekken", "verwerken", "relaties", "export"] as const;
export const proefInput = z.object({
  actie: z.enum(["lezen", ...proefActies]),
  verzoek: z.string().uuid().optional(),
  nummer: z.string().regex(/^PROEF-[a-f0-9-]{36}$/).optional(),
}).strict();
export type ProefInput = z.infer<typeof proefInput>;
export type ProefRecord = { id: string; nummer: string | null; soort: string; status: string; tekst: string; tijd: string };
export type ProefWerkruimte = { versie: 1; fictief: true; records: ProefRecord[]; verzoeken: string[]; ingetrokken: string[] };
export function legeProef(): ProefWerkruimte {
  return { versie: 1, fictief: true, records: [], verzoeken: [], ingetrokken: [] };
}
export function controleerProefBeheer(isAdmin: unknown, error: unknown) {
  if (error || isAdmin !== true) throw new Error("Geen toegang tot de proefomgeving");
}
export function verwerkProef(origineel: ProefWerkruimte, input: ProefInput, tijd: string): ProefWerkruimte {
  const data = proefInput.parse(input);
  if (data.actie === "lezen") return origineel;
  if (!data.verzoek) throw new Error("Proefverzoek ontbreekt");
  if (origineel.verzoeken.includes(data.verzoek)) return origineel;
  if (origineel.verzoeken.length >= 100) throw new Error("Deze proefruimte heeft 100 acties bereikt; geen verdere opslag.");
  const state: ProefWerkruimte = structuredClone(origineel);
  const id = data.verzoek;
  const nummer = data.nummer ?? null;
  const add = (soort: string, tekst: string, gekoppeld: string | null = nummer) => state.records.push({ id, nummer: gekoppeld, soort, status: "Open", tekst, tijd });
  switch (data.actie) {
    case "deelname": add("deelname", "Fictieve onderzoekstoestemming; geen persoon of medische inhoud.", `PROEF-${id}`); break;
    case "registratie":
      if (!nummer || !state.records.some(r => r.soort === "deelname" && r.nummer === nummer)) throw new Error("Kies een bestaande proefdeelname");
      if (state.records.filter(r => r.soort === "registratie" && r.nummer === nummer).length >= 3) throw new Error("Maximaal drie proefregistraties per deelname");
      add("registratie", "Fictief persoonlijk overzicht; geen foto's of medische antwoorden."); break;
    case "klacht": add("klacht", "Fictieve klacht over een ontbrekende knop.", null); break;
    case "privacy": add("privacy", "Fictief verzoek om toelichting op gegevensverwerking.", null); break;
    case "intrekken":
      if (!nummer || !state.records.some(r => r.soort === "deelname" && r.nummer === nummer)) throw new Error("Kies een bestaande proefdeelname");
      state.records = state.records.filter(r => r.nummer !== nummer);
      state.ingetrokken.push(nummer); break;
    case "verwerken": {
      const count = state.records.filter(r => r.soort === "klacht" || r.soort === "privacy").length;
      state.records.forEach(r => { if (r.soort === "klacht" || r.soort === "privacy") r.status = "Proef afgehandeld"; });
      add("taak", `${count} fictieve verzoeken verwerkt; geen e-mail of werkkopie.`, null); break;
    }
    case "relaties": {
      if (state.records.some(r => r.soort === "registratie" && !state.records.some(d => d.soort === "deelname" && d.nummer === r.nummer))) throw new Error("Proefrelatie ongeldig");
      add("taak", "Proefrelaties gecontroleerd; geen productiecontrole.", null); break;
    }
    case "export": add("taak", "Fictieve proefexport voorbereid; geen versleutelde productieback-up of hersteltest.", null); break;
  }
  state.verzoeken.push(id);
  return state;
}