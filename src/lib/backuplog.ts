import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

/** Openbaar back-uplog: alleen datum, status, bestandsnaam en totaal aantal records — nooit inhoud. */

const MAANDEN = [
  "januari", "februari", "maart", "april", "mei", "juni",
  "juli", "augustus", "september", "oktober", "november", "december",
];

export type BackupItem = {
  datum: string;
  tijd: string;
  geslaagd: boolean;
  bestand: string | null;
  aantal: number | null;
  toelichting: string | null;
};

type Rij = {
  uitgevoerd_op: string;
  geslaagd: boolean;
  bestand: string | null;
  aantal_records: number | null;
  toelichting: string | null;
};

function naarItem(r: Rij): BackupItem {
  const d = new Date(r.uitgevoerd_op);
  const tijd = new Intl.DateTimeFormat("nl-NL", { hour: "2-digit", minute: "2-digit", timeZone: "Europe/Amsterdam" }).format(d);
  const lokaal = new Date(d.toLocaleString("en-US", { timeZone: "Europe/Amsterdam" }));
  return {
    datum: `${lokaal.getDate()} ${MAANDEN[lokaal.getMonth()]} ${lokaal.getFullYear()}`,
    tijd,
    geslaagd: r.geslaagd,
    bestand: r.bestand,
    aantal: r.aantal_records,
    toelichting: r.toelichting,
  };
}

export function useBackuplog(): BackupItem[] {
  const { data } = useQuery({
    queryKey: ["backuplog"],
    staleTime: 60_000,
    refetchInterval: 5 * 60_000,
    queryFn: async () => {
      const { data, error } = await supabase.rpc("publieke_backuplog");
      if (error || !data) return [];
      return (data as unknown as Rij[]).map(naarItem);
    },
  });
  return data ?? [];
}
