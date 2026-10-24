const GATEWAY = "https://connector-gateway.lovable.dev/google_mail/gmail/v1";
const ONTVANGER = "noreply@tekenbeetgids.nl";

// Op Google (Cloud Run) eerst via Workspace-delegatie; mislukt dat, dan de bestaande koppeling.
async function verstuurRuw(raw: string, lovableKey?: string, gmailKey?: string): Promise<{ ok: boolean; status: number; text: () => Promise<string> }> {
  const g = await import("./google-mail.server");
  if (g.googleMailBeschikbaar()) {
    try { await g.verstuurRuwViaGoogle(raw); return { ok: true, status: 200, text: async () => "" }; }
    catch (e) { console.error("google-mail mislukt, val terug:", e instanceof Error ? e.message.slice(0, 120) : e); }
  }
  if (!lovableKey || !gmailKey) return { ok: false, status: 0, text: async () => "Gmail-koppeling ontbreekt" };
  return fetch(`${GATEWAY}/users/me/messages/send`, {
    method: "POST",
    headers: { Authorization: `Bearer ${lovableKey}`, "X-Connection-Api-Key": gmailKey, "Content-Type": "application/json" },
    body: JSON.stringify({ raw: base64url(new TextEncoder().encode(raw)) }),
  });
}


function base64url(bytes: Uint8Array) {
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

// RFC 2047 voor niet-ASCII in headers (accenten in naam/onderwerp).
function header(waarde: string) {
  const schoon = waarde.replace(/[\r\n]+/g, " ").trim();
  if (/^[\x20-\x7E]*$/.test(schoon)) return schoon;
  return `=?UTF-8?B?${base64url(new TextEncoder().encode(schoon)).replace(/-/g, "+").replace(/_/g, "/")}?=`;
}

export async function verstuurContactMail(bericht: {
  naam: string;
  email: string;
  onderwerp: string;
  bericht: string;
  referentie: string;
  taal: "nl" | "en";
  verzoeknummer?: string;
  bevestiging?: boolean;
}) {
  const lovableKey = process.env["LOVABLE_API_KEY"];
  const gmailKey = process.env["GOOGLE_MAIL_API_KEY"];

  const beheerBody = [
    `Nieuw bericht via het contactformulier van TekenRisicoKaart.`,
    ``,
    `Incidentnummer: ${bericht.referentie}`,
    ...(bericht.verzoeknummer ? [`Privacyregister-nummer: ${bericht.verzoeknummer} (apart bewaard, art. 30 AVG)`] : []),
    `Naam: ${bericht.naam}`,
    `E-mail: ${bericht.email}`,
    `Onderwerp: ${bericht.onderwerp}`,
    ``,
    `Bericht:`,
    bericht.bericht,
    ``,
    `— Automatisch doorgestuurd door tekenrisicokaart.nl`,
  ].join("\r\n");

  const beheerRaw = [
    `To: ${ONTVANGER}`,
    `Reply-To: ${header(bericht.naam)} <${bericht.email}>`,
    `Subject: ${header(`[TRK] ${bericht.onderwerp} — incident ${bericht.referentie}`)}`,
    `MIME-Version: 1.0`,
    `Content-Type: text/plain; charset="UTF-8"`,
    `Content-Transfer-Encoding: base64`,
    ``,
    base64url(new TextEncoder().encode(beheerBody)).replace(/-/g, "+").replace(/_/g, "/"),
  ].join("\r\n");

  const engels = bericht.taal === "en";
  const bevestigingBody = engels
    ? [
        `Dear ${bericht.naam},`,
        ``,
        `We have received your message through the contact form.`,
        ``,
        `Incident number: ${bericht.referentie}`,
        `Please note this incident number for any further contact.`,
        ...(bericht.verzoeknummer ? [`Privacy register number: ${bericht.verzoeknummer}`] : []),
        ``,
        `Subject: ${bericht.onderwerp}`,
        ``,
        `We will contact you as soon as possible.`,
        ``,
        `Kind regards,`,
        `TickRiskMap / TickBiteGuide`,
      ].join("\r\n")
    : [
        `Beste ${bericht.naam},`,
        ``,
        `We hebben uw bericht via het contactformulier ontvangen.`,
        ``,
        `Incidentnummer: ${bericht.referentie}`,
        `Noteer uw incidentnummer voor eventueel verder contact.`,
        ...(bericht.verzoeknummer ? [`Privacyregister-nummer: ${bericht.verzoeknummer}`] : []),
        ``,
        `Onderwerp: ${bericht.onderwerp}`,
        ``,
        `We nemen zo snel mogelijk contact met u op.`,
        ``,
        `Met vriendelijke groet,`,
        `TekenRisicoKaart / TekenbeetGids`,
      ].join("\r\n");

  const bevestigingRaw = [
    `To: ${bericht.email}`,
    `Reply-To: ${ONTVANGER}`,
    `Subject: ${header(`${engels ? "Contact form confirmation" : "Bevestiging contactformulier"} — ${engels ? "incident" : "incident"} ${bericht.referentie}`)}`,
    `MIME-Version: 1.0`,
    `Content-Type: text/plain; charset="UTF-8"`,
    `Content-Transfer-Encoding: base64`,
    ``,
    base64url(new TextEncoder().encode(bevestigingBody)).replace(/-/g, "+").replace(/_/g, "/"),
  ].join("\r\n");

  const verstuur = (raw: string) => verstuurRuw(raw, lovableKey, gmailKey);

  try {
    const beheerRes = await verstuur(beheerRaw);
    if (!beheerRes.ok) {
      console.error(`contact-mail beheer mislukt [${beheerRes.status}]: ${await beheerRes.text()}`);
      return false;
    }
    if (bericht.bevestiging !== false) {
      const bevestigingRes = await verstuur(bevestigingRaw);
      if (!bevestigingRes.ok) {
        console.error(`contact-mail bevestiging mislukt [${bevestigingRes.status}]: ${await bevestigingRes.text()}`);
        return false;
      }
    }
    return true;
  } catch (e) {
    console.error("contact-mail netwerkfout", e);
    return false;
  }
}

// Korte beheermelding (zonder persoonsgegevens) aan de beheerder.
export async function verstuurBeheerMelding(onderwerp: string, regels: string[]) {
  const lovableKey = process.env["LOVABLE_API_KEY"];
  const gmailKey = process.env["GOOGLE_MAIL_API_KEY"];
  const body = [...regels, ``, `— Automatische melding van tekenrisicokaart.nl`].join("\r\n");
  const raw = [
    `To: ${ONTVANGER}`,
    `Subject: ${header(`[TRK] ${onderwerp}`)}`,
    `MIME-Version: 1.0`,
    `Content-Type: text/plain; charset="UTF-8"`,
    `Content-Transfer-Encoding: base64`,
    ``,
    base64url(new TextEncoder().encode(body)).replace(/-/g, "+").replace(/_/g, "/"),
  ].join("\r\n");
  try {
    const res = await verstuurRuw(raw, lovableKey, gmailKey);
    if (!res.ok) console.error(`beheermelding mislukt [${res.status}]`);
    return res.ok;
  } catch (e) {
    console.error("beheermelding mislukt", e);
    return false;
  }
}
