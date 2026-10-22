import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/public/assistent")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const origin = request.headers.get("origin");
          if (!origin || new URL(origin).origin !== new URL(request.url).origin) return new Response(null, { status: 403 });
          const { forwardCloudRequest } = await import("@/lib/cloudBridge.server");
          if (process.env["APP_HOSTING"] === "cloud-run" || process.env["CLOUD_BACKEND_URL"]) {
            if (Number(request.headers.get("content-length") ?? 0) > 40000) return new Response(null, { status: 413 });
            const body = await request.text();
            if (body.length > 40000) return new Response(null, { status: 413 });
            const response = await forwardCloudRequest("assistent", body, request);
            if (!response) return new Response(null, { status: 503 });
            return new Response(response.body, { status: response.status, headers: response.headers });
          }
          const { handleAssistent } = await import("@/lib/assistent-ai.server");
          return await handleAssistent(request);
        } catch (error) {
          if (request.signal.aborted || (error instanceof Error && error.name === "AbortError"))
            return new Response(null, { status: 499 });
          return Response.json(
            {
              message:
                "De assistent is tijdelijk niet beschikbaar. / The assistant is temporarily unavailable.",
            },
            { status: 500 },
          );
        }
      },
    },
  },
});
