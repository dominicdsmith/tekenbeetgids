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
      const tekst = await request.text().catch(() => "");
      if (tekst.length > 200) return Response.json({ ok: false }, { status: 413, headers });
      let actie = "";
      try { actie = tekst ? String((JSON.parse(tekst) as { actie?: unknown }).actie ?? "") : ""; } catch { actie = ""; }
      const backend = process.env["CLOUD_BACKEND_URL"];
      if (actie && backend) {
        // Cloud Run: stuur door naar de Lovable-omgeving, die het Google-token zelf opnieuw controleert.
        const doel = new URL("/api/public/google-beheer", new URL(backend).origin);
        if (doel.origin === new URL(request.url).origin) return Response.json({ ok: false }, { status: 508, headers });
        const r = await fetch(doel, { method: "POST", redirect: "error", headers: { Authorization: request.headers.get("Authorization") ?? "", "Content-Type": "application/json" }, body: JSON.stringify({ actie }) });
        return new Response(await r.text(), { status: r.status, headers: { ...headers, "Content-Type": "application/json" } });
      }
      try {
        const { verifieerGoogleBeheer } = await import("@/lib/google-beheer-auth.server");
        await verifieerGoogleBeheer(request);
        if (actie === "intrekkingen") {
          try {
            const { leesGoogleIntrekStatus } = await import("@/lib/google-intrekstatus.server");
            return Response.json({ ok: true, intrekkingen: await leesGoogleIntrekStatus() }, { headers });
          } catch {
            return Response.json({ ok: false, message: "Intrekkingscontrole bij Google is tijdelijk niet beschikbaar." }, { status: 502, headers });
          }
        }
        if (actie === "taken" || actie === "taken-vernieuwen") {
          const m = await import("@/lib/google-taakstatus.server");
          try {
            const taken = actie === "taken-vernieuwen" ? await m.synchroniseerTaakstatus() : await m.leesTaakstatusGoogle();
            return Response.json({ ok: true, taken }, { headers });
          } catch (e) {
            console.error("[google-beheer] taakstatus:", e instanceof Error ? e.message : e);
            return Response.json({ ok: false, message: "Taakstatus bij Google is tijdelijk niet beschikbaar." }, { status: 502, headers });
          }
        }
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