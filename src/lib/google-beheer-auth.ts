export const GOOGLE_BEHEER_PROJECT = "tekenbeetgids-vertex-ai";

export class GoogleBeheerWeigering extends Error {
  constructor(public reden: string) { super("Geen Google-beheertoegang."); }
}

/** Roles never come from editable profile data; an explicitly provisioned UID is mandatory. */
export function controleerGoogleBeheerClaims(claims: Record<string, unknown>, adminUid: string | undefined) {
  const firebase = claims["firebase"] as { sign_in_provider?: unknown } | undefined;
  const uid = adminUid?.trim();
  if (!uid) throw new GoogleBeheerWeigering("uid-niet-ingesteld");
  if (claims["sub"] !== uid) throw new GoogleBeheerWeigering("uid-wijkt-af");
  if (claims["email_verified"] !== true) throw new GoogleBeheerWeigering("email-niet-geverifieerd");
  if (claims["email"] !== "ddsmith@dominicsmith.nl") throw new GoogleBeheerWeigering("email-wijkt-af");
  if (firebase?.sign_in_provider !== "google.com") throw new GoogleBeheerWeigering("provider-wijkt-af");
  return uid;
}
