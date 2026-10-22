import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/public/backend-status")({
  server: { handlers: { GET: async ({ request }) => {
    try {
      const { forwardCloudRequest } = await import("@/lib/cloudBridge.server");
      const response = await forwardCloudRequest("status", "{}", request);
      if (!response) return Response.json({ ok: false }, { status: 503 });
      return new Response(response.body, { status: response.status, headers: { "Content-Type": "application/json", "Cache-Control": "no-store" } });
    } catch {
      return Response.json({ ok: false }, { status: 503, headers: { "Cache-Control": "no-store" } });
    }
  } } },
});
