import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { haalPrivacyVerzoeken } from "@/lib/contact.functions";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/beheer/privacyregister")({
  component: PrivacyRegister,
  head: () => ({
    meta: [
      { title: "Privacyregister — TekenRisicoKaart beheer" },
      { name: "description", content: "Apart register van privacyklachten en bezwaar-/privacyverzoeken van TekenRisicoKaart." },
      { name: "robots", content: "noindex, nofollow" },
      { property: "og:title", content: "Privacyregister — TekenRisicoKaart beheer" },
      { property: "og:description", content: "Apart register van privacyklachten en bezwaarverzoeken." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
});

const BLAUW = "#123A52";
const LIJN = "#BBD7E6";

type Verzoek = {
  id: string;
  verzoeknummer: string;
  soort: string;
  naam: string;
  email: string;
  bericht: string;
  taal: string;
  status: string;
  afgehandeld_op: string | null;
  contact_referentie: string | null;
  created_at: string;
};

const csvVeld = (v: unknown) => {
  const t = String(v ?? "");
  return `"${(/^[=+\-@\t\r]/.test(t) ? "'" + t : t).replace(/"/g, '""')}"`;
};

function PrivacyRegister() {
  const laad = useServerFn(haalPrivacyVerzoeken);
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["privacy-verzoeken"],
    queryFn: () => laad({ data: undefined }) as Promise<Verzoek[]>,
  });

  const exporteer = () => {
    const rijen = data ?? [];
    const csv = [
      ["verzoeknummer", "datum", "soort", "status", "naam", "email", "taal", "contact-id", "bericht"].join(";"),
      ...rijen.map((r) =>
        [
          r.verzoeknummer,
          new Date(r.created_at).toLocaleString("nl-NL"),
          r.soort,
          r.status,
          r.naam,
          r.email,
          r.taal,
          r.contact_referentie,
          r.bericht,
        ]
          .map(csvVeld)
          .join(";"),
      ),
    ].join("\r\n");
    const url = URL.createObjectURL(new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `privacyregister-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <main style={{ maxWidth: 980, margin: "32px auto", padding: "0 16px", fontFamily: "system-ui, sans-serif", color: BLAUW }}>
      <h1 style={{ fontSize: 20, marginBottom: 4 }}>Privacyregister</h1>
      <p style={{ fontSize: 12.5, color: "#3E6A7D", marginTop: 0 }}>
        Apart bestand met privacyklachten en bezwaar-/privacyverzoeken die bewaard mochten worden. Alleen zichtbaar voor
        beheerders. Verzoeken worden na drie jaar automatisch verwijderd.
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
          Kon het register niet laden. Mogelijk heeft dit account geen beheerdersrechten.
        </p>
      )}
      {data && data.length === 0 && <p style={{ fontSize: 13 }}>Nog geen privacyklachten of -verzoeken vastgelegd.</p>}

      {data && data.length > 0 && (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
            <thead>
              <tr>
                {["Verzoeknummer", "Datum", "Soort", "Status", "Naam", "E-mail", "Bericht"].map((h) => (
                  <th key={h} style={{ textAlign: "left", borderBottom: `1px solid ${LIJN}`, padding: "6px 8px" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((r) => (
                <tr key={r.id}>
                  <td style={{ ...cel, fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace", whiteSpace: "nowrap" }}>
                    {r.verzoeknummer}
                  </td>
                  <td style={cel}>{new Date(r.created_at).toLocaleString("nl-NL")}</td>
                  <td style={cel}>{r.soort}</td>
                  <td style={cel}>{r.status}</td>
                  <td style={cel}>{r.naam}</td>
                  <td style={cel}>{r.email}</td>
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
