import { createRemoteJWKSet, jwtVerify } from "jose";
import { controleerGoogleBeheerClaims, GOOGLE_BEHEER_PROJECT } from "./google-beheer-auth";

let jwks: ReturnType<typeof createRemoteJWKSet> | undefined;

export async function verifieerGoogleBeheer(request: Request) {
  const header = request.headers.get("Authorization");
  if (!header?.startsWith("Bearer ")) throw new Error("Niet aangemeld.");
  const token = header.slice(7);
  if (token.length > 16000) throw new Error("Ongeldige sessie.");
  jwks ??= createRemoteJWKSet(new URL("https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com"));
  const { payload } = await jwtVerify(token, jwks, {
    algorithms: ["RS256"], audience: GOOGLE_BEHEER_PROJECT,
    issuer: `https://securetoken.google.com/${GOOGLE_BEHEER_PROJECT}`,
    requiredClaims: ["exp", "iat", "auth_time", "sub"], maxTokenAge: "1h",
  });
  const uid = controleerGoogleBeheerClaims(payload, process.env["FIREBASE_ADMIN_UID"]);
  return { uid };
}