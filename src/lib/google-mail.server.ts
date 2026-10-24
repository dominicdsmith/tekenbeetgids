// Mail via Workspace-delegatie: alleen bruikbaar op Cloud Run (runtime-account mag het mailaccount gebruiken).
const MAIL_SA = "tekenbeetgids-mail@tekenbeetgids-vertex-ai.iam.gserviceaccount.com";
const AFZENDER = "noreply@tekenbeetgids.nl";

function b64(s: string) {
  return btoa(Array.from(new TextEncoder().encode(s), (b) => String.fromCharCode(b)).join(""));
}
const hdr = (v: string) => (/^[\x20-\x7E]*$/.test(v) ? v : `=?UTF-8?B?${b64(v)}?=`);

async function mailToken(): Promise<string> {
  const meta = await fetch("http://metadata.google.internal/computeMetadata/v1/instance/service-accounts/default/token", { headers: { "Metadata-Flavor": "Google" } });
  if (!meta.ok) throw new Error(`metadata ${meta.status}`);
  const { access_token } = (await meta.json()) as { access_token: string };
  const nu = Math.floor(Date.now() / 1000);
  const payload = JSON.stringify({ iss: MAIL_SA, sub: AFZENDER, scope: "https://www.googleapis.com/auth/gmail.send", aud: "https://oauth2.googleapis.com/token", iat: nu, exp: nu + 600 });
  const sign = await fetch(`https://iamcredentials.googleapis.com/v1/projects/-/serviceAccounts/${MAIL_SA}:signJwt`, {
    method: "POST", headers: { Authorization: `Bearer ${access_token}`, "Content-Type": "application/json" }, body: JSON.stringify({ payload }),
  });
  if (!sign.ok) throw new Error(`signJwt ${sign.status}: ${(await sign.text()).slice(0, 300)}`);
  const { signedJwt } = (await sign.json()) as { signedJwt: string };
  const tok = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer", assertion: signedJwt }),
  });
  if (!tok.ok) throw new Error(`token ${tok.status}: ${(await tok.text()).slice(0, 300)}`);
  return ((await tok.json()) as { access_token: string }).access_token;
}

export async function verstuurViaGoogle(aan: string, onderwerp: string, tekst: string) {
  if (process.env["APP_HOSTING"] !== "cloud-run") throw new Error("alleen-op-google");
  const token = await mailToken();
  const raw = [`From: TekenbeetGids <${AFZENDER}>`, `To: ${aan}`, `Subject: ${hdr(onderwerp)}`, "MIME-Version: 1.0", 'Content-Type: text/plain; charset="UTF-8"', "Content-Transfer-Encoding: base64", "", b64(tekst)].join("\r\n");
  const r = await fetch("https://gmail.googleapis.com/gmail/v1/users/me/messages/send", {
    method: "POST", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ raw: b64(raw).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "") }),
  });
  if (!r.ok) throw new Error(`gmail ${r.status}: ${(await r.text()).slice(0, 300)}`);
}
