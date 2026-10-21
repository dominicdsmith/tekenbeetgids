import { useState } from "react";
import { Check, ChevronDown, ChevronUp, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ANTIBIOTICA } from "@/data/antibiotica";
import { useTaal } from "@/lib/taal";

export default function AntibioticaKeuze({ waarden, kies, meervoud = false }: {
  waarden: string[];
  kies: (id: string) => void;
  meervoud?: boolean;
}) {
  const en = useTaal() === "en";
  const overige = ANTIBIOTICA.slice(5).filter((m) => m.id !== "atovaquon");
  const [open, setOpen] = useState(() => overige.some((m) => waarden.includes(m.id)));
  const optie = (id: string, label: string) => (
    <Button key={id} type="button" variant="outline" aria-pressed={waarden.includes(id)} onClick={() => kies(id)}
      className={`h-auto min-h-11 w-full justify-start whitespace-normal text-left text-xs ${waarden.includes(id) ? "border-primary bg-accent" : ""}`}>
      {meervoud && (waarden.includes(id) ? <Check aria-hidden /> : <Square aria-hidden />)}
      <span className="min-w-0 break-words">{label}</span>
    </Button>
  );
  return (
    <div className="mt-3 grid gap-2">
      <p className="text-xs leading-relaxed text-muted-foreground">{en
        ? "Record the medicine prescribed by your doctor. This list is not a treatment recommendation; not every medicine is suitable for every tick-borne disease. Never change your treatment without consulting your prescriber."
        : "Leg het middel vast dat uw arts heeft voorgeschreven. Deze lijst is geen behandeladvies; niet elk middel is geschikt voor elke tekenbeetziekte. Verander uw behandeling niet zonder overleg met uw voorschrijver."}</p>
      {ANTIBIOTICA.slice(0, 5).map((m) => optie(m.id, en ? m.en : m.label))}
      <Button type="button" variant="ghost" aria-expanded={open} onClick={() => setOpen(!open)} className="justify-between text-xs text-primary">
        {en ? "Other antibiotics" : "Overige antibiotica"}{open ? <ChevronUp aria-hidden /> : <ChevronDown aria-hidden />}
      </Button>
      {open && overige.map((m) => optie(m.id, en ? m.en : m.label))}
      {optie("anders", en ? "Other, namely:" : "Anders, namelijk:")}
      {optie("onbekend", en ? "Don't know" : "Weet ik niet")}
    </div>
  );
}