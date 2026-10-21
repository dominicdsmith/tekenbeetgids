import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { haalTekenbeetRegistraties } from "@/lib/registratie.functions";
import type { Json } from "@/integrations/supabase/types";

type TekenbeetRegistratie = {
  id: string;
  created_at: string;
  registratienummer: string;
  taal: string;
  overzicht: string;
  gegevens: Record<string, Json>;
};

export const Route = createFileRoute("/_authenticated/beheer/registraties")({
  component: RegistratieBeheer,
  head: () => ({ meta: [
    { title: "Tekenbeetregistraties — beheer" },
    { name: "description", content: "Afgeschermd beheeroverzicht van TekenbeetGids-registraties." },
    { name: "robots", content: "noindex, nofollow" },
    { property: "og:title", content: "Tekenbeetregistraties — beheer" },
    { property: "og:description", content: "Afgeschermd beheeroverzicht van TekenbeetGids-registraties." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] }),
});

const BLAUW = "#123A52";
const LIJN = "#BBD7E6";

function RegistratieBeheer() {
  const laden = useServerFn(haalTekenbeetRegistraties);
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["tekenbeet-registraties"],
    queryFn: () => laden({ data: undefined }) as Promise<TekenbeetRegistratie[]>,
  });

  return <main style={{ maxWidth: 1040, margin: "32px auto", padding: "0 16px 48px", fontFamily: "system-ui, sans-serif", color: BLAUW }}>
    <h1 style={{ fontSize: 22 }}>TekenbeetGids-registraties</h1>
    <p style={{ fontSize: 12.5 }}>Alleen zichtbaar voor de bevoegde beheerder. Foto&apos;s worden niet opgeslagen.</p>
    {isLoading && <p role="status">Registraties laden…</p>}
    {error && <div role="alert"><p>Laden is niet gelukt.</p><button type="button" onClick={() => void refetch()}>Opnieuw proberen</button></div>}
    <div style={{ display: "grid", gap: 12 }}>
      {(data ?? []).map((registratie) => <article key={registratie.id} style={{ border: `1px solid ${LIJN}`, borderRadius: 7, padding: 14, background: "#fff" }}>
        <h2 style={{ fontSize: 15, margin: 0 }}>{registratie.registratienummer}</h2>
        <p style={{ fontSize: 11, margin: "4px 0 10px" }}>{new Date(registratie.created_at).toLocaleString("nl-NL")} · {registratie.taal.toUpperCase()}</p>
        <details>
          <summary style={{ cursor: "pointer", fontWeight: 700 }}>Persoonlijk overzicht</summary>
          <pre style={{ whiteSpace: "pre-wrap", overflowWrap: "anywhere", fontFamily: "inherit", fontSize: 12 }}>{registratie.overzicht}</pre>
        </details>
        <details style={{ marginTop: 8 }}>
          <summary style={{ cursor: "pointer", fontWeight: 700 }}>Ingevulde gegevens</summary>
          <pre style={{ whiteSpace: "pre-wrap", overflowWrap: "anywhere", fontSize: 11 }}>{JSON.stringify(registratie.gegevens, null, 2)}</pre>
        </details>
      </article>)}
    </div>
  </main>;
}