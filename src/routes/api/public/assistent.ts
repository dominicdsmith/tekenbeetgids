import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/public/assistent")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { handleAssistent } = await import("@/lib/assistent-ai.server");
        try {
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
