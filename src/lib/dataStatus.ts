import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PEILDATUM, LAATST_BIJGEWERKT } from "@/data/tekenData";

/**
 * Live meeluisteren op wijzigingen in de peildata. Zodra de automatische
 * databroncontrole de tabellen `datastatus` of `databronnen` bijwerkt, worden
 * de bijbehorende gegevens direct opnieuw opgehaald — zonder herladen.
 */
function useRealtimePeildata(channelName: string, queryKey: string, table: string) {
  const queryClient = useQueryClient();
  useEffect(() => {
    // Uniek kanaal per effect-run om botsingen te voorkomen in React StrictMode,
    // waarbij het opruimen van een vorig kanaal soms niet synchroon gebeurt.
    const uniqueName = `${channelName}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const kanaal = supabase
      .channel(uniqueName)
      .on("postgres_changes", { event: "*", schema: "public", table }, () => {
        queryClient.invalidateQueries({ queryKey: [queryKey] });
      })
      .subscribe();
    return () => {
      supabase.removeChannel(kanaal);
    };
  }, [queryClient, channelName, queryKey, table]);
}

export type DataStatus = {
  peildatum: string;
  laatstBijgewerkt: string;
  wijzigingGevonden: boolean;
};

const standaard: DataStatus = {
  peildatum: PEILDATUM,
  laatstBijgewerkt: LAATST_BIJGEWERKT,
  wijzigingGevonden: false,
};

/**
 * Leest de peildatum en de datum "laatst bijgewerkt" uit de database. Die
 * worden elk uur automatisch bijgewerkt door de
 * databroncontrole. Zolang die niet beschikbaar is, gelden de vaste waarden
 * uit de broncode als terugvaloptie.
 */
export function useDataStatus(): DataStatus {
  useRealtimePeildata("datastatus-live", "datastatus", "datastatus");
  const { data } = useQuery({
    queryKey: ["datastatus"],
    staleTime: 60 * 1000,
    refetchOnWindowFocus: true,
    refetchInterval: 5 * 60 * 1000,
    queryFn: async (): Promise<DataStatus> => {
      const { data, error } = await supabase
        .from("datastatus")
        .select("peildatum, laatst_bijgewerkt, wijziging_gevonden")
        .eq("id", 1)
        .maybeSingle();
      if (error || !data) return standaard;
      return {
        peildatum: data.peildatum ?? standaard.peildatum,
        laatstBijgewerkt: data.laatst_bijgewerkt ?? standaard.laatstBijgewerkt,
        wijzigingGevonden: Boolean(data.wijziging_gevonden),
      };
    },
  });
  return data ?? standaard;
}

export type BronStatus = { sleutel: string; peildatum: string | null; laatstGecontroleerd: string | null };

/**
 * Leest per databron de eigen peildatum en de datum van de laatste controle.
 * Die worden elk uur door de databroncontrole automatisch bijgewerkt.
 */
export function useBronPeildata(): Record<string, BronStatus> {
  useRealtimePeildata("databronnen-live", "databronnen-peildata", "databronnen");
  const { data } = useQuery({
    queryKey: ["databronnen-peildata"],
    staleTime: 60 * 1000,
    refetchOnWindowFocus: true,
    refetchInterval: 5 * 60 * 1000,
    queryFn: async (): Promise<Record<string, BronStatus>> => {
      const { data, error } = await supabase
        .from("databronnen")
        .select("sleutel, peildatum, laatst_gecontroleerd");
      if (error || !data) return {};
      const uit: Record<string, BronStatus> = {};
      for (const r of data) {
        uit[r.sleutel] = {
          sleutel: r.sleutel,
          peildatum: (r as { peildatum?: string | null }).peildatum ?? null,
          laatstGecontroleerd: r.laatst_gecontroleerd ?? null,
        };
      }
      return uit;
    },
  });
  return data ?? {};
}
