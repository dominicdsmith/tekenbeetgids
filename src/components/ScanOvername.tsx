import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { bevestigdeScan } from "@/lib/scanOvername";

export default function ScanOvername<T>({ resultaat, label, en, overnemen, zelfInvullen }: {
  resultaat: T; label: string; en: boolean;
  overnemen: (resultaat: T) => void; zelfInvullen: () => void;
}) {
  const [open, setOpen] = useState(false);
  return <>
    <div className="mt-3 flex flex-col gap-2">
      <Button type="button" className="h-auto min-h-10 whitespace-normal" onClick={() => setOpen(true)}>
        {en ? "Adopt scan result…" : "Scanuitkomst overnemen…"}
      </Button>
      <Button type="button" variant="outline" className="h-auto min-h-10 whitespace-normal" onClick={zelfInvullen}>
        {en ? "Do not adopt — enter my own answer" : "Niet overnemen — zelf invullen"}
      </Button>
    </div>
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="w-[calc(100%-2rem)] max-h-[85dvh] overflow-y-auto rounded-lg">
        <DialogTitle className="pr-6 leading-snug">{en ? "Confirm adoption in the guide" : "Overname in de gids bevestigen"}</DialogTitle>
        <DialogDescription className="leading-relaxed">
          {en ? "Would you like to adopt this photo comparison in your guide?" : "Wilt u deze fotovergelijking overnemen in uw gids?"}
        </DialogDescription>
        <p className="text-sm font-semibold text-primary">{label}</p>
        <p className="text-sm leading-relaxed text-muted-foreground">{en
          ? "This remains an AI comparison, not a confirmed identification or medical assessment."
          : "Dit blijft een AI-vergelijking, geen bevestigde identificatie of medische beoordeling."}</p>
        <div className="flex flex-col gap-2">
          <Button type="button" className="h-auto min-h-10 whitespace-normal" onClick={() => {
            const bevestigd = bevestigdeScan(resultaat, true);
            if (bevestigd === null) return;
            setOpen(false); overnemen(bevestigd);
          }}>{en ? "Confirm — adopt and continue" : "Bevestigen — overnemen en verder"}</Button>
          <Button type="button" variant="outline" onClick={() => setOpen(false)}>{en ? "Cancel" : "Annuleren"}</Button>
        </div>
      </DialogContent>
    </Dialog>
  </>;
}