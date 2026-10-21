import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type TellingOverzicht = {
  totaal: number;
  jaar: number;
  perMaand: number[];
  perSoort: { soort: string; aantal: number }[];
  perProvincie: { provincie: string; aantal: number }[];
};

const leeg = (jaar: number): TellingOverzicht => ({ totaal: 0, jaar, perMaand: Array(12).fill(0), perSoort: [], perProvincie: [] });

/**
 * Actieve tekenbeten-telling: elke scan legt datum, locatie en tekensoort vast.
 * Deze hook leest die telling (volledig gepseudonimiseerd) voor het lopende jaar.
 */
export function useTellingen(): TellingOverzicht {
  const jaar = new Date().getFullYear();
  const { data } = useQuery({
    queryKey: ["tekenbeet-tellingen", jaar],
    staleTime: 5 * 60 * 1000,
    queryFn: async (): Promise<TellingOverzicht> => {
      const { data, error } = await supabase
        .from("tekenbeet_tellingen")
        .select("maand, soort, provincie_id")
        .eq("jaar", jaar)
        .limit(5000);
      if (error || !data) return leeg(jaar);
      const uit = leeg(jaar);
      uit.totaal = data.length;
      const soorten = new Map<string, number>();
      const provincies = new Map<string, number>();
      for (const r of data) {
        const m = (r.maand ?? 1) - 1;
        if (m >= 0 && m < 12) uit.perMaand[m] = (uit.perMaand[m] ?? 0) + 1;
        if (r.soort) soorten.set(r.soort, (soorten.get(r.soort) ?? 0) + 1);
        if (r.provincie_id) provincies.set(r.provincie_id, (provincies.get(r.provincie_id) ?? 0) + 1);
      }
      uit.perSoort = [...soorten].map(([soort, aantal]) => ({ soort, aantal })).sort((a, b) => b.aantal - a.aantal).slice(0, 5);
      uit.perProvincie = [...provincies].map(([provincie, aantal]) => ({ provincie, aantal })).sort((a, b) => b.aantal - a.aantal).slice(0, 5);
      return uit;
    },
  });
  return data ?? leeg(jaar);
}
