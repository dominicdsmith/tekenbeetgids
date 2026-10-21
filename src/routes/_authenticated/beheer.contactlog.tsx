import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { haalContactBerichten } from "@/lib/contact.functions";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/beheer/contactlog")({
  component: ContactLog,
  head: () => ({
    meta: [
      { title: "Contactlog — TekenRisicoKaart beheer" },
      { name: "description", content: "Overzicht en export van ingediende contactberichten van TekenRisicoKaart." },
      { name: "robots", content: "noindex, nofollow" },
      { property: "og:title", content: "Contactlog — TekenRisicoKaart beheer" },
      { property: "og:description", content: "Overzicht en export van ingediende contactberichten." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
});

const BLAUW = "#123A52";
const LIJN = "#BBD7E6";

import { maakReferentie } from "@/lib/contact-ref";

type Bericht = { id: string; naam: string; email: string; onderwerp: string; bericht: string; created_at: string };

function csvVeld(v: string) {
  const t = String(v);
  return `"${(/^[=+\-@\t\r]/.test(t) ? "'" + t : t).replace(/"/g, '""')}"`;
}

function ContactLog() {
  const laad = useServerFn(haalContactBerichten);
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["contact-berichten"],
    queryFn: () => laad({ data: undefined }) as Promise<Bericht[]>,
  });

  const exporteer = () => {
    const rijen = data ?? [];
    const csv = [
      ["bevestigings-id", "datum", "naam", "email", "onderwerp", "bericht"].join(";"),
      ...rijen.map((r) =>
        [
          maakReferentie(r.id, r.created_at),
          new Date(r.created_at).toLocaleString("nl-NL"),
          r.naam,
          r.email,
          r.onderwerp,
          r.bericht,
        ]
          .map(csvVeld)
          .join(";"),
      ),
    ].join("\r\n");
    const url = URL.createObjectURL(new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `contactberichten-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <main style={{ maxWidth: 900, margin: "32px auto", padding: "0 16px", fontFamily: "system-ui, sans-serif", color: BLAUW }}>
      <h1 style={{ fontSize: 20, marginBottom: 4 }}>Contactlog</h1>
      <p style={{ fontSize: 12.5, color: "#3E6A7D", marginTop: 0 }}>
        Alle via het contactformulier ingediende berichten. Alleen zichtbaar voor beheerders.
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
          Kon de berichten niet laden. Mogelijk heeft dit account geen beheerdersrechten.
        </p>
      )}
      {data && data.length === 0 && <p style={{ fontSize: 13 }}>Nog geen berichten ontvangen.</p>}

      {data && data.length > 0 && (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
            <thead>
              <tr>
                {["Bevestigings-ID", "Datum", "Naam", "E-mail", "Onderwerp", "Bericht"].map((h) => (
                  <th key={h} style={{ textAlign: "left", borderBottom: `1px solid ${LIJN}`, padding: "6px 8px" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((r) => (
                <tr key={r.id}>
                  <td style={{ ...cel, fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace", whiteSpace: "nowrap" }}>
                    {maakReferentie(r.id, r.created_at)}
                  </td>
                  <td style={cel}>{new Date(r.created_at).toLocaleString("nl-NL")}</td>
                  <td style={cel}>{r.naam}</td>
                  <td style={cel}>{r.email}</td>
                  <td style={cel}>{r.onderwerp}</td>
                  <td style={{ ...cel, whiteSpace: "pre-wrap" }}>{r.bericht}</td>
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
