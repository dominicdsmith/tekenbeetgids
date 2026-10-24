import { createFileRoute } from "@tanstack/react-router";

/** Elk uur: legt de status van alle automatische taken vast bij Google. */
export const Route = createFileRoute("/api/public/hooks/taakstatus-google")({
  server: { handlers: {
    POST: async ({ request }) => {
      const { isGeldigeCronAanroep } = await import("@/lib/beveiliging.server");
      if (!(await isGeldigeCronAanroep(request))) return Response.json({ error: "Niet geautoriseerd" }, { status: 401 });
      try {
        const { synchroniseerTaakstatus } = await import("@/lib/google-taakstatus.server");
        const taken = await synchroniseerTaakstatus();
        return Response.json({ ok: true, aantal: taken.length });
      } catch (e) {
        console.error("Taakstatus naar Google mislukt:", e instanceof Error ? e.message : e);
        return Response.json({ ok: false }, { status: 502 });
      }
    },
  } },
});
