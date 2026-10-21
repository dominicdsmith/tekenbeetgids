import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SCANHISTORIE, type ScanItem } from "@/data/scanhistorie";

/**
 * Beveiligingsscans live uit de database. De automatische scan schrijft na
 * iedere run een nieuwe regel weg; de lijst op de website werkt dan direct bij.
 * Zolang er nog geen automatische scans zijn, tonen we de historische lijst.
 */

const MAANDEN = [
  "januari", "februari", "maart", "april", "mei", "juni",
  "juli", "augustus", "september", "oktober", "november", "december",
];

type Rij = {
  id: string;
  uitgevoerd_op: string;
  release: string | null;
  commit: string | null;
  scanners: string[] | null;
  waarschuwingen: ScanItem["waarschuwingen"] | null;
};

function naarScanItem(r: Rij): ScanItem {
  const d = new Date(r.uitgevoerd_op);
  const tijd = new Intl.DateTimeFormat("nl-NL", {
    hour: "2-digit", minute: "2-digit", timeZone: "Europe/Amsterdam",
  }).format(d);
  const lokaal = new Date(d.toLocaleString("en-US", { timeZone: "Europe/Amsterdam" }));
  return {
    datum: `${lokaal.getDate()} ${MAANDEN[lokaal.getMonth()]} ${lokaal.getFullYear()}`,
    tijd,
    release: r.release ?? "automatische scan",
    commit: r.commit ?? "auto-scan",
    scanners: r.scanners ?? [],
    waarschuwingen: (r.waarschuwingen ?? []) as ScanItem["waarschuwingen"],
  };
}

export function useBeveiligingsscans() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const naam = `beveiligingsscans-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const kanaal = supabase
      .channel(naam)
      .on("postgres_changes", { event: "*", schema: "public", table: "beveiligingsscans" }, () => {
        queryClient.invalidateQueries({ queryKey: ["beveiligingsscans"] });
      })
      .subscribe();
    return () => {
      supabase.removeChannel(kanaal);
    };
  }, [queryClient]);

  const { data } = useQuery({
    queryKey: ["beveiligingsscans"],
    staleTime: 60_000,
    refetchInterval: 5 * 60_000,
    queryFn: async (): Promise<ScanItem[]> => {
      const { data, error } = await supabase
        .from("beveiligingsscans")
        .select("id, uitgevoerd_op, release, commit, scanners, waarschuwingen")
        .order("uitgevoerd_op", { ascending: false })
        .limit(50);
      if (error || !data) return [];
      return (data as unknown as Rij[]).map(naarScanItem);
    },
  });

  const automatisch = data ?? [];
  return automatisch.length > 0 ? [...automatisch, ...SCANHISTORIE] : SCANHISTORIE;
}
