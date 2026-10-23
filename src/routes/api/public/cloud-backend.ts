import { createFileRoute } from "@tanstack/react-router";
import { publicBridgeError } from "@/lib/cloudBridgeErrors";

export const Route = createFileRoute("/api/public/cloud-backend")({
  server: { handlers: { POST: async ({ request }) => {
    try {
      return await (await import("@/lib/cloudBridge.server")).acceptCloudRequest(request);
    } catch (e) {
      console.error("cloud-backend failed", e instanceof Error ? e.message : String(e));
      const failure = publicBridgeError(request.headers.get("x-bridge-action"), e);
      return Response.json(failure.body, { status: failure.status, headers: { "Cache-Control": "no-store" } });
    }
  } } },
});