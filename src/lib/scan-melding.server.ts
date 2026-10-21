// Verstuurt een e-mailmelding na iedere automatische beveiligingsscan.

const GATEWAY = "https://connector-gateway.lovable.dev/google_mail/gmail/v1";
const ONTVANGER = "noreply@tekenbeetgids.nl";

function base64url(bytes: Uint8Array) {
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function b64(tekst: string) {
  return base64url(new TextEncoder().encode(tekst)).replace(/-/g, "+").replace(/_/g, "/");
}

export async function verstuurScanMelding(melding: {
  uitgevoerdOp: string;
  samenvatting: string;
  kritiek: number;
  scanners: string[];
  waarschuwingen: { titel: string; niveau: string; status: string; toelichting: string }[];
}) {
  const lovableKey = process.env["LOVABLE_API_KEY"];
  const gmailKey = process.env["GOOGLE_MAIL_API_KEY"];
  if (!lovableKey || !gmailKey) {
    console.error("scan-melding: Gmail-koppeling ontbreekt");
    return false;
  }

  const body = [
    `De automatische beveiligingsscan van TekenRisicoKaart is uitgevoerd.`,
    ``,
    `Tijdstip: ${melding.uitgevoerdOp}`,
    `Samenvatting: ${melding.samenvatting}`,
    `Kritieke bevindingen: ${melding.kritiek}`,
    ``,
    `Uitgevoerde controles:`,
    ...melding.scanners.map((s) => `- ${s}`),
    ``,
    melding.waarschuwingen.length > 0
      ? `Meldingen (${melding.waarschuwingen.length}):`
      : `Geen meldingen gevonden.`,
    ...melding.waarschuwingen.map(
      (w) => `- [${w.niveau} / ${w.status}] ${w.titel} — ${w.toelichting}`,
    ),
    ``,
    `— Automatisch verstuurd door tekenrisicokaart.nl`,
  ].join("\r\n");

  const onderwerp =
    melding.kritiek > 0
      ? `[TRK] Beveiligingsscan — ${melding.kritiek} kritieke bevinding(en)`
      : `[TRK] Beveiligingsscan uitgevoerd — geen kritieke bevindingen`;

  const raw = [
    `To: ${ONTVANGER}`,
    `Subject: =?UTF-8?B?${b64(onderwerp)}?=`,
    `MIME-Version: 1.0`,
    `Content-Type: text/plain; charset="UTF-8"`,
    `Content-Transfer-Encoding: base64`,
    ``,
    b64(body),
  ].join("\r\n");

  try {
    const res = await fetch(`${GATEWAY}/users/me/messages/send`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${lovableKey}`,
        "X-Connection-Api-Key": gmailKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ raw: base64url(new TextEncoder().encode(raw)) }),
    });
    if (!res.ok) {
      console.error(`scan-melding mislukt [${res.status}]: ${await res.text()}`);
      return false;
    }
    return true;
  } catch (e) {
    console.error("scan-melding netwerkfout", e);
    return false;
  }
}
