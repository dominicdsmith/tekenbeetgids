import { createFileRoute } from "@tanstack/react-router";

const headers = { "Cache-Control": "no-store" };
export const Route = createFileRoute("/api/public/google-beheer")({
  server: { handlers: {
    GET: async () => Response.json({
      projectId: "tekenbeetgids-vertex-ai",
      authDomain: "tekenbeetgids-vertex-ai.firebaseapp.com",
      apiKey: "AIzaSyAHb_D2g1Z06pkw_1tAIAqUs10cvPO-dvM",
    }, { headers }),
    POST: async ({ request }) => {
      try {
        const { verifieerGoogleBeheer } = await import("@/lib/google-beheer-auth.server");
        await verifieerGoogleBeheer(request);
        return Response.json({ ok: true }, { headers });
      } catch (error) {
        // Log only the failing check category, never the token or claims.
        const reden = (error as { reden?: string; code?: string })?.reden
          ?? (error as { code?: string })?.code ?? (error as Error)?.name ?? "onbekend";
        console.warn("[google-beheer] geweigerd:", reden);
        return Response.json({ ok: false, message: "Geen Google-beheertoegang. Uw bestaande login blijft beschikbaar." }, { status: 401, headers });
      }
    },
  } },
});