import { lazy, Suspense, useEffect, useRef, useState } from "react";
import type { CSSProperties, ReactNode } from "react";
import { ArrowLeft, ArrowUpRight, MessageCircle, X } from "lucide-react";
import { STZ } from "@/data/tekenData";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  assistentLink,
  assistentOnderwerpen,
  type AssistentContext,
} from "@/data/informatieAssistent";
import { useRuimteOnder } from "@/hooks/useRuimteOnder";
import { useTaal } from "@/lib/taal";

const AssistentGesprek = lazy(() => import("./AssistentGesprek"));

export default function InformatieAssistent({
  context,
  gidsHost = false,
}: {
  context: AssistentContext;
  gidsHost?: boolean;
}) {
  const taal = useTaal();
  const en = taal === "en";
  const [open, setOpen] = useState(false);
  const [gesprek, setGesprek] = useState(false);
  const [gestart, setGestart] = useState(false);
  const [onderwerpId, setOnderwerpId] = useState<string | null>(null);
  const [vraagIndex, setVraagIndex] = useState<number | null>(null);
  const onder = useRuimteOnder("rechts");
  const kop = useRef<HTMLElement>(null);
  const eind = useRef<HTMLDivElement>(null);
  useEffect(() => {
    eind.current?.scrollIntoView({ block: "end", behavior: "smooth" });
  }, [onderwerpId, vraagIndex]);
  const onderwerpen = assistentOnderwerpen(context);
  const onderwerp = onderwerpen.find((item) => item.id === onderwerpId);
  const vraag = vraagIndex === null ? undefined : onderwerp?.vragen[vraagIndex];
  useEffect(() => {
    if (open && !gesprek) kop.current?.focus();
  }, [open, gesprek, gestart]);


  const sluit = (volgende: boolean) => {
    setOpen(volgende);
    if (!volgende) {
      setOnderwerpId(null);
      setVraagIndex(null);
      setGesprek(false);
      setGestart(false);
    }
  };
  return (
    <Popover open={open} onOpenChange={sluit} modal>
      <PopoverTrigger asChild>
        <Button
          size="icon"
          className={`assistent-knop assistent-zwevend ${open ? "pointer-events-none opacity-0" : ""}`}
          data-geen-vertaling
          style={onder ? { bottom: `${onder}px` } : undefined}
          aria-label={en ? "Open assistant" : "Assistent openen"}
          title={en ? "Assistant" : "Assistent"}
        >
          <MessageCircle aria-hidden="true" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        side="top"
        sideOffset={8}
        collisionPadding={12}
        className="assistent-paneel flex flex-col overflow-hidden p-0 font-sans"
        data-geen-vertaling
        style={onder ? ({ "--assistent-onder": `${onder}px` } as CSSProperties) : undefined}
        aria-labelledby="assistent-titel"
      >
        <header className="flex shrink-0 items-center gap-3 border-b border-input bg-muted px-4 py-3">
          <MessageCircle className="size-5 shrink-0 text-primary" aria-hidden="true" />
          <div className="min-w-0 flex-1">
            <h2 id="assistent-titel" className="text-sm font-semibold">
              {en ? "Assistant" : "Assistent"}
            </h2>
            <p className="text-xs text-muted-foreground">TekenRisicoKaart · TekenbeetGids</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => sluit(false)}
            aria-label={en ? "Close assistant" : "Assistent sluiten"}
            title={en ? "Close" : "Sluiten"}
          >
            <X />
          </Button>
        </header>
        {!gestart ? (
          <div className="flex min-h-0 flex-1 flex-col items-center overflow-y-auto px-6 py-8 text-center">
            <span className="mb-6 flex size-24 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <MessageCircle className="size-12" aria-hidden="true" />
            </span>
            <p className="text-sm text-muted-foreground">{en ? "Your digital assistant" : "Uw digitale assistent"}</p>
            <h3 ref={kop as never} tabIndex={-1} className="mt-1 text-2xl font-bold outline-none">
              {en ? "Assistant" : "Assistent"}
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              {en
                ? "Finds reviewed information on TekenRisicoKaart and TekenbeetGids."
                : "Wijst u de weg naar gecontroleerde informatie op TekenRisicoKaart en TekenbeetGids."}
            </p>
            <p className="mt-5 text-xs leading-relaxed text-muted-foreground">
              {en
                ? "Your typed questions and this conversation are processed externally through Google AI Studio / Gemini API to select reviewed website information. The app does not save the conversation; closing clears it. External retention periods and Gemini contractual coverage have not been confirmed; an EU processing region is not guaranteed."
                : "Uw getypte vragen en dit gesprek worden extern via Google AI Studio / Gemini API verwerkt om gecontroleerde website-informatie te kiezen. De app bewaart het gesprek niet; sluiten wist het gesprek. Externe bewaartermijnen en Gemini-contractdekking zijn niet bevestigd; een EU-verwerkingsregio is niet gegarandeerd."}
            </p>
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
              {en
                ? "Please do not include personal or medical data, symptoms, diagnoses, medication or participant codes. No medical assessment or internet search."
                : "Stuur geen persoonlijke of medische gegevens, klachten, diagnoses, medicatie of deelnemercodes mee. Geen medische beoordeling of internetzoekfunctie."}
            </p>
            <button
              type="button"
              onClick={() => setGestart(true)}
              style={{
                marginTop: 24,
                padding: "8px 14px",
                borderRadius: 7,
                fontSize: 10.5,
                fontWeight: 800,
                cursor: "pointer",
                fontFamily: "inherit",
                border: "none",
                background: STZ.rood,
                color: "#fff",
              }}
            >
              {en ? "Agree and start" : "Akkoord en beginnen"}
            </button>
          </div>
        ) : gesprek && open ? (
          <>
            <div className="shrink-0 border-b border-input px-3 py-2">
              <Button variant="ghost" size="sm" className="px-1 text-primary" onClick={() => { setGesprek(false); setOnderwerpId(null); }}>
                <ArrowLeft />
                {en ? "Back to topics" : "Terug naar onderwerpen"}
              </Button>
            </div>
            <Suspense fallback={<p className="p-4 text-sm">{en ? "Loading…" : "Laden…"}</p>}>
              <AssistentGesprek key={`${taal}-${onderwerpId ?? ""}`} taal={taal} gidsHost={gidsHost} onderwerp={onderwerp?.titel[taal]} alleVragen={onderwerpen.map((o) => ({ titel: o.titel[taal], tekst: o.vragen.map((v) => `${v.vraag[taal]} ${v.antwoord[taal]}`).join(" ") }))} vervolg={onderwerp ? onderwerp.vragen.map((v) => v.vraag[taal]) : onderwerpen.slice(0, 6).map((o) => o.titel[taal])} />
            </Suspense>
          </>
        ) : (
          <div className="min-h-0 flex-1 space-y-3 overflow-y-auto overscroll-contain bg-muted/50 px-3 py-4">
            <div ref={kop as never} tabIndex={-1} className="max-w-[90%] rounded-2xl rounded-tl-sm bg-background p-3 text-sm leading-relaxed shadow-sm outline-none">
              <p>
                {en
                  ? "Hello! I am the assistant of TekenRisicoKaart and TekenbeetGids. I show reviewed website information and links."
                  : "Hallo! Ik ben de assistent van TekenRisicoKaart en TekenbeetGids. Ik toon gecontroleerde website-informatie en links."}
              </p>
              <p className="mt-2">
                {en
                  ? "I give no medical assessment. In acute, serious or life-threatening situations, call 112."
                  : "Ik geef geen medische beoordeling. Bel bij acute, ernstige of levensbedreigende situaties 112."}
              </p>
              <p className="mt-2 font-medium">{en ? "Choose the topic of your question:" : "Kies het onderwerp van uw vraag:"}</p>
            </div>
            <Keuzes
              items={onderwerpen.map((item) => ({ id: item.id, label: item.titel[taal], actief: item.id === onderwerpId }))}
              extra={{ label: en ? "Other question" : "Andere vraag", onClick: () => { setOnderwerpId(null); setGesprek(true); } }}
              onKies={(id) => { setOnderwerpId(id); setVraagIndex(null); setGesprek(true); }}
            />
            {onderwerp && (
              <>
                <Bel eigen>{onderwerp.titel[taal]}</Bel>
                <Bel>{en ? "What would you like to know?" : "Wat wilt u weten?"}</Bel>
                <Keuzes
                  items={onderwerp.vragen.map((item, i) => ({ id: String(i), label: item.vraag[taal], actief: i === vraagIndex }))}
                  onKies={(id) => setVraagIndex(Number(id))}
                />
              </>
            )}
            {onderwerp && vraag && (
              <>
                <Bel eigen>{vraag.vraag[taal]}</Bel>
                <Bel>
                  <p>{vraag.antwoord[taal]}</p>
                  <a
                    href={assistentLink(onderwerp, gidsHost)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-flex items-center gap-1 font-medium text-primary underline"
                  >
                    {onderwerp.link.titel[taal]}
                    <ArrowUpRight className="size-4" />
                    <span className="sr-only">{en ? "(opens in a new tab)" : "(opent in een nieuw tabblad)"}</span>
                  </a>
                </Bel>
              </>
            )}
            <div ref={eind} />
          </div>
        )}
        <footer hidden={gesprek} className="shrink-0 border-t border-input px-4 py-3 text-xs leading-relaxed text-muted-foreground">
          {en
            ? "Reviewed website information · no medical assessment · no conversation storage"
            : "Gecontroleerde website-informatie · geen medische beoordeling · geen gespreksopslag"}
        </footer>
      </PopoverContent>
    </Popover>
  );
}

function Bel({ eigen, children }: { eigen?: boolean; children: ReactNode }) {
  return (
    <div
      className={
        eigen
          ? "ml-auto w-fit max-w-[85%] rounded-2xl rounded-tr-sm bg-primary px-3 py-2 text-sm text-primary-foreground"
          : "max-w-[90%] rounded-2xl rounded-tl-sm bg-background p-3 text-sm leading-relaxed shadow-sm"
      }
    >
      {children}
    </div>
  );
}

function Keuzes({
  items,
  extra,
  onKies,
}: {
  items: { id: string; label: string; actief: boolean }[];
  extra?: { label: string; onClick: () => void };
  onKies: (id: string) => void;
}) {
  const stijl = "h-auto min-h-9 whitespace-normal rounded-xl px-3 py-1.5 text-left text-sm font-semibold";
  return (
    <div className="flex flex-wrap justify-end gap-2">
      {items.map((item) => (
        <Button
          key={item.id}
          variant={item.actief ? "default" : "secondary"}
          className={`${stijl} ${item.actief ? "ring-2 ring-ring ring-offset-1" : ""}`}
          aria-pressed={item.actief}
          onClick={() => onKies(item.id)}
        >
          {item.label}
        </Button>
      ))}
      {extra && (
        <Button variant="secondary" className={stijl} onClick={extra.onClick}>
          {extra.label}
        </Button>
      )}
    </div>
  );
}
