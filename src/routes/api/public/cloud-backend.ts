import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/public/cloud-backend")({
  server: { handlers: { POST: async ({ request }) => {
    try {
      return await (await import("@/lib/cloudBridge.server")).acceptCloudRequest(request);
    } catch {
      return Response.json({ ok: false }, { status: 503, headers: { "Cache-Control": "no-store" } });
    }
  } } },
});
