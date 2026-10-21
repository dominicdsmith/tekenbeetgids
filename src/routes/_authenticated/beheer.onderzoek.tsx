import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { haalOnderzoekDeelnames } from "@/lib/onderzoek.functions";
import { supabase } from "@/integrations/supabase/client";
import type { OnderzoekDeelname } from "@/lib/onderzoek.server";
import type { Json } from "@/integrations/supabase/types";

export const Route = createFileRoute("/_authenticated/beheer/onderzoek")({
  component: OnderzoekBeheer,
  head: () => ({
    meta: [
      { title: "Onderzoek — TekenRisicoKaart beheer" },
      { name: "description", content: "Overzicht en export van onderzoeksdeelnames van TekenRisicoKaart." },
      { name: "robots", content: "noindex, nofollow" },
      { property: "og:title", content: "Onderzoek — TekenRisicoKaart beheer" },
      { property: "og:description", content: "Overzicht en export van onderzoeksdeelnames." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
});

const BLAUW = "#123A52";
const LIJN = "#BBD7E6";

function csvVeld(v: string | number | boolean | null | undefined) {
  let t = String(v ?? "");
  if (/^[=+\-@\t\r]/.test(t)) t = `'${t}`;
  return `"${t.replace(/"/g, '""')}"`;
}

function jsonWaarde(v: Json | undefined): string {
  if (v === undefined || v === null) return "";
  if (typeof v === "string") return v;
  if (typeof v === "number" || typeof v === "boolean") return String(v);
  return JSON.stringify(v);
}

const VELDKOLOMMEN = [
  "eerste",
  "aantalBeten",
  "beetDatums",
  "beetLocaties",
  "testen",
  "leeftijd",
  "geslacht",
  "woonplaats",
  "afkomst",
  "nationaliteitAnders",
  "opleiding",
  "provincie",
  "duur",
  "verwijderd",
  "soort",
  "uiterlijk",
  "vast",
  "datum",
  "scan",
  "teekScan",
  "aantalFotosBeetplek",
  "aantalFotosTeek",
  "abTussen",
  "abTussenSoort",
  "abTussenSoortAnders",
  "abTussenAandoening",
];

function OnderzoekBeheer() {
  const laad = useServerFn(haalOnderzoekDeelnames);
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["onderzoek-deelnames"],
    queryFn: () => laad({ data: undefined }) as Promise<OnderzoekDeelname[]>,
  });

  const exporteer = () => {
    const rijen = data ?? [];
    const kop = [
      "deelnamenummer",
      "datum",
      "taal",
      "status",
      "gemeld_op",
      ...VELDKOLOMMEN,
      "gegevens_json",
    ];
    const csv = [
      kop.join(";"),
      ...rijen.map((r) => {
        const g = r.gegevens ?? {};
        const velden = VELDKOLOMMEN.map((k) => {
          const waarde = g[k];
          if (Array.isArray(waarde)) return csvVeld(waarde.join(" | "));
          if (waarde && typeof waarde === "object") return csvVeld(jsonWaarde(waarde));
          return csvVeld(waarde as string | number | boolean | null);
        });
        return [
          r.deelnamenummer,
          new Date(r.created_at).toLocaleString("nl-NL"),
          r.taal,
          csvVeld(r.status),
          csvVeld(r.gemeld_op ? new Date(r.gemeld_op).toLocaleString("nl-NL") : ""),
          ...velden,
          csvVeld(jsonWaarde(g)),
        ].join(";");
      }),
    ].join("\r\n");
    const url = URL.createObjectURL(new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `tekenrisicokaart-onderzoek-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <main style={{ maxWidth: 1100, margin: "32px auto", padding: "0 16px", fontFamily: "system-ui, sans-serif", color: BLAUW }}>
      <h1 style={{ fontSize: 20, marginBottom: 4 }}>Onderzoek — deelnemers</h1>
      <p style={{ fontSize: 12.5, color: "#3E6A7D", marginTop: 0 }}>
        Alle gepseudonimiseerde onderzoeksdeelnames. Alleen zichtbaar voor beheerders.
      </p>
      <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
        <button onClick={() => void refetch()} style={knop}>↻ Vernieuwen</button>
        <button onClick={exporteer} disabled={!data?.length} style={knop}>⤓ Exporteren (CSV)</button>
        <button onClick={() => void supabase.auth.signOut().then(() => (window.location.href = "/auth"))} style={knop}>
          Uitloggen
        </button>
      </div>

      {isLoading && <p style={{ fontSize: 13 }}>Bezig met laden…</p>}
      {error && (
        <p style={{ fontSize: 13, color: "#A63428", fontWeight: 700 }}>
          Kon de deelnames niet laden. Mogelijk heeft dit account geen beheerdersrechten.
        </p>
      )}
      {data && data.length === 0 && <p style={{ fontSize: 13 }}>Nog geen deelnames ontvangen.</p>}

      {data && data.length > 0 && (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
            <thead>
              <tr>
                {["Deelnamenummer", "Datum", "Taal", "Status", "Gegevens"].map((h) => (
                  <th key={h} style={{ textAlign: "left", borderBottom: `1px solid ${LIJN}`, padding: "6px 8px" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((r) => (
                <tr key={r.id}>
                  <td style={{ ...cel, fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace", whiteSpace: "nowrap" }}>
                    {r.deelnamenummer}
                  </td>
                  <td style={cel}>{new Date(r.created_at).toLocaleString("nl-NL")}</td>
                  <td style={cel}>{r.taal}</td>
                  <td style={{ ...cel, whiteSpace: "nowrap", fontWeight: r.status === "Tekenbeet gemeld" ? 700 : 400 }}>
                    {r.status}
                    {r.gemeld_op && (
                      <div style={{ fontSize: 10.5, color: "#3E6A7D" }}>{new Date(r.gemeld_op).toLocaleString("nl-NL")}</div>
                    )}
                  </td>
                  <td style={{ ...cel, whiteSpace: "pre-wrap" }}>
                    <details style={{ maxWidth: 400 }}>
                      <summary style={{ cursor: "pointer" }}>Bekijk gegevens</summary>
                      <pre style={{ whiteSpace: "pre-wrap", wordBreak: "break-word", fontSize: 11, marginTop: 6 }}>
                        {JSON.stringify(r.gegevens, null, 2)}
                      </pre>
                    </details>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}

const knop = {
  padding: "7px 12px",
  border: `1px solid ${LIJN}`,
  borderRadius: 7,
  background: "#fff",
  color: BLAUW,
  fontSize: 12,
  fontWeight: 700,
  cursor: "pointer",
} as const;

const cel = { borderBottom: `1px solid ${LIJN}`, padding: "6px 8px", verticalAlign: "top" as const };
