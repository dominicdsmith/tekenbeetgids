// Verstuurt een e-mailmelding zodra de maandelijkse databroncontrole een
// wijziging vindt en de peildatum automatisch is bijgewerkt.

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

export async function verstuurDataMelding(melding: {
  peildatum: string;
  laatstBijgewerkt: string;
  gewijzigd: { sleutel: string; naam?: string | null; url?: string | null }[];
  resultaten: { bron: string; resultaat: string }[];
}) {
  const lovableKey = process.env["LOVABLE_API_KEY"];
  const gmailKey = process.env["GOOGLE_MAIL_API_KEY"];
  if (!lovableKey || !gmailKey) {
    console.error("data-melding: Gmail-koppeling ontbreekt");
    return false;
  }

  const heeftWijziging = melding.gewijzigd.length > 0;

  const nvwaGewijzigd = melding.gewijzigd.some((b) => b.sleutel === "nvwa");

  const body = [
    heeftWijziging
      ? `De automatische databroncontrole van TekenRisicoKaart heeft wijzigingen gevonden.`
      : `De automatische databroncontrole van TekenRisicoKaart is uitgevoerd. Er zijn geen wijzigingen gevonden.`,
    ...(nvwaGewijzigd
      ? [``, `LET OP: de NVWA-pagina over reuzenteek en vlekkenteek is gewijzigd. Controleer of er nieuwe vondsten zijn en voeg ze toe aan Tekenmeldingen op de kaart.`]
      : []),
    ``,
    `Peildatum: ${melding.peildatum}`,
    `Laatst bijgewerkt: ${melding.laatstBijgewerkt}`,
    ``,
    `Gewijzigde bronnen (${melding.gewijzigd.length}):`,
    ...(heeftWijziging
      ? melding.gewijzigd.map((b) => `- ${b.naam ?? b.sleutel}${b.url ? ` — ${b.url}` : ""}`)
      : [`- geen`]),
    ``,
    `Volledig resultaat:`,
    ...melding.resultaten.map((r) => `- ${r.bron}: ${r.resultaat}`),
    ``,
    `— Automatisch verstuurd door tekenrisicokaart.nl`,
  ].join("\r\n");

  const onderwerp = heeftWijziging
    ? `[TRK] Bronwijziging gevonden — peildatum ${melding.peildatum}`
    : `[TRK] Databroncontrole uitgevoerd — geen wijzigingen (${melding.peildatum})`;

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
      console.error(`data-melding mislukt [${res.status}]: ${await res.text()}`);
      return false;
    }
    return true;
  } catch (e) {
    console.error("data-melding netwerkfout", e);
    return false;
  }
}
