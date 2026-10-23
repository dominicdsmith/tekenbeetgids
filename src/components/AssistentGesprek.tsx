import { useEffect, useMemo, useRef, useState } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import { Message, MessageContent, MessageResponse } from "@/components/ai-elements/message";
import {
  PromptInput,
  PromptInputTextarea,
  PromptInputFooter,
  PromptInputSubmit,
} from "@/components/ai-elements/prompt-input";
import { Shimmer } from "@/components/ai-elements/shimmer";
import { Button } from "@/components/ui/button";

export default function AssistentGesprek({
  taal,
  gidsHost,
  onderwerp,
  vervolg = [],
  alleVragen = [],
}: {
  alleVragen?: { titel: string; tekst: string }[];
  taal: "nl" | "en";
  gidsHost: boolean;
  onderwerp?: string | undefined;
  vervolg?: string[];
}) {
  const en = taal === "en";
  const [tekst, setTekst] = useState("");
  const invoer = useRef<HTMLTextAreaElement>(null);
  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/public/assistent",
        body: { taal, gidsHost },
        fetch: async (url, init) => {
          const response = await fetch(url, init);
          if (!response.ok) {
            const data = (await response.json().catch(() => null)) as { message?: string } | null;
            throw new Error(
              data?.message ??
                (en ? "The assistant is unavailable." : "De assistent is niet beschikbaar."),
            );
          }
          return response;
        },
      }),
    [taal, gidsHost, en],
  );
  const { messages, sendMessage, status, error, stop } = useChat({ transport });
  const bezig = status === "submitted" || status === "streaming";
  const gesteld = messages.flatMap((m) =>
    m.role === "user" ? m.parts.flatMap((p) => (p.type === "text" ? [p.text] : [])) : [],
  );
  const laatste = gesteld[gesteld.length - 1] ?? "";
  const woorden = (t: unknown) =>
    new Set(String(t ?? "").toLowerCase().normalize("NFD").replace(/[^a-z0-9 ]/g, " ").split(/\s+/).filter((w) => w.length > 3));
  const passend = (() => {
    const basis = woorden(laatste);
    if (!basis.size) return vervolg;
    const telOverlap = (tekst: string) =>
      [...woorden(tekst)].filter((w) => [...basis].some((b) => b.startsWith(w.slice(0, 5)) || w.startsWith(b.slice(0, 5)))).length;
    // Met een gekozen onderwerp: alleen vervolgvragen binnen dat onderwerp.
    if (onderwerp) {
      return vervolg
        .map((v, i) => ({ v, n: telOverlap(v), i }))
        .sort((a, b) => b.n - a.n || a.i - b.i)
        .map((x) => x.v);
    }
    const scores = alleVragen
      .filter((x): x is { titel: string; tekst: string } => typeof x === "object" && x !== null && typeof x.titel === "string")
      .map(({ titel, tekst }) => ({ v: titel, n: telOverlap(`${titel} ${tekst}`) }))
      .filter((x) => x.n > 0)
      .sort((a, b) => b.n - a.n)
      .map((x) => x.v);
    return [...new Set([...scores, ...vervolg])];
  })()
    .filter((v) => !gesteld.includes(v))
    .slice(0, 5);
  useEffect(() => {
    if (!bezig) invoer.current?.focus();
  }, [bezig]);
  useEffect(
    () => () => {
      void stop();
    },
    [stop],
  );
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <Conversation className="min-h-32 flex-1" aria-label={en ? "Conversation" : "Gesprek"}>
        <ConversationContent className="gap-4 px-4 py-3">
          {onderwerp && messages.length === 0 && (
            <p className="text-sm text-muted-foreground">
              {en
                ? `Topic: ${onderwerp}. Type your question below.`
                : `Onderwerp: ${onderwerp}. Typ hieronder uw vraag.`}
            </p>
          )}
          {messages.map((message) => (
            <Message key={message.id} from={message.role}>
              <MessageContent
                className={message.role === "user" ? "bg-primary text-primary-foreground" : ""}
              >
                {message.parts.map((part, i) =>
                  part.type === "text" ? (
                    message.role === "assistant" ? (
                      <MessageResponse
                        key={i}
                        components={{
                          a: (props) => (
                            <a
                              {...props}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary underline"
                            />
                          ),
                        }}
                      >
                        {part.text}
                      </MessageResponse>
                    ) : (
                      <p key={i} className="whitespace-pre-wrap break-words">
                        {part.text}
                      </p>
                    )
                  ) : null,
                )}
              </MessageContent>
            </Message>
          ))}
          {!bezig && passend.length > 0 && (
            <div className="flex flex-wrap justify-end gap-2" aria-label={en ? "Related topics" : "Bijbehorende onderwerpen"}>
              <p className="w-full text-right text-xs text-muted-foreground">
                {onderwerp
                  ? en
                    ? `More about ${onderwerp}:`
                    : `Meer over ${onderwerp}:`
                  : en
                    ? "Related topics:"
                    : "Bijbehorende onderwerpen:"}
              </p>
              {passend.map((v) => (
                  <Button
                    key={v}
                    variant="secondary"
                    className="h-auto min-h-9 whitespace-normal rounded-xl px-3 py-1.5 text-left text-sm font-semibold"
                    onClick={() => void sendMessage({ text: v })}
                  >
                    {v}
                  </Button>
                ))}
            </div>
          )}
          {bezig && (
            <Shimmer className="text-sm">
              {en ? "Finding reviewed information…" : "Gecontroleerde informatie zoeken…"}
            </Shimmer>
          )}
          {error && (
            <p role="alert" className="text-sm text-destructive">
              {error.message}
            </p>
          )}
        </ConversationContent>
        <ConversationScrollButton aria-label={en ? "Latest answer" : "Nieuwste antwoord"} />
      </Conversation>
      <div className="shrink-0 border-t border-input p-3">
        <p id="assistent-privacy" className="mb-2 text-xs text-muted-foreground">
          {en
            ? "Google (processor) · no personal or medical data"
            : "Google (verwerker) · geen persoonlijke of medische gegevens"}
        </p>
        <PromptInput
          maxFiles={0}
          onSubmit={async () => {
            if (!tekst.trim() || bezig) return;
            const vraag = tekst.trim();
            setTekst("");
            await sendMessage({ text: vraag });
            invoer.current?.focus();
          }}
        >
          <PromptInputTextarea
            ref={invoer}
            value={tekst}
            onChange={(event) => setTekst(event.target.value)}
            maxLength={1000}
            aria-describedby="assistent-privacy"
            aria-label={en ? "Your question" : "Uw vraag"}
            placeholder={en ? "Your question about the websites…" : "Uw vraag over de websites…"}
            className="min-h-20 text-sm"
          />
          <PromptInputFooter className="justify-end">
            <PromptInputSubmit
              status={status}
              onStop={() => void stop()}
              disabled={!bezig && !tekst.trim()}
              aria-label={
                bezig ? (en ? "Stop" : "Stoppen") : en ? "Send question" : "Vraag versturen"
              }
              title={bezig ? (en ? "Stop" : "Stoppen") : en ? "Send question" : "Vraag versturen"}
            />
          </PromptInputFooter>
        </PromptInput>
      </div>
    </div>
  );
}
