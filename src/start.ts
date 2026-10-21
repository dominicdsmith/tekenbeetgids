import { createStart, createCsrfMiddleware, createMiddleware } from "@tanstack/react-start";

import { renderErrorPage } from "./lib/error-page";
import { attachSupabaseAuth } from "@/integrations/supabase/auth-attacher";

const errorMiddleware = createMiddleware().server(async ({ next }) => {
  try {
    return await next();
  } catch (error) {
    if (error != null && typeof error === "object" && "statusCode" in error) {
      throw error;
    }
    console.error(error);
    return new Response(renderErrorPage(), {
      status: 500,
      headers: { "content-type": "text/html; charset=utf-8" },
    });
  }
});

// Start installs this automatically when src/start.ts is absent; defining the
// file opts out, so re-add it explicitly to keep server functions protected
// from cross-site requests.
const csrfMiddleware = createCsrfMiddleware({
  filter: (ctx) => ctx.handlerType === "serverFn",
});

// Bezoekers die het project via het lovable.app-adres openen worden direct naar
// tekenrisicokaart.nl gestuurd. De preview- en dev-hosts blijven gewoon werken.
const lovableRedirectMiddleware = createMiddleware().server(async ({ request, next }) => {
  const method = request.method.toUpperCase();
  if (method !== "GET" && method !== "HEAD") return next();

  const url = new URL(request.url);
  const forwardedHost = request.headers.get("x-forwarded-host");
  const rawHost = (typeof forwardedHost === "string" && forwardedHost) || url.hostname;
  const host = rawHost.split(",")[0]!.trim().split(":")[0]!.toLowerCase();

  if (host === "tekenrisicokaart.lovable.app" || host === "www.tekenrisicokaart.lovable.app") {
    const target = new URL(request.url);
    target.protocol = "https:";
    target.hostname = "tekenrisicokaart.nl";
    target.port = "";
    return new Response(null, {
      status: 308,
      headers: { Location: target.toString() },
    });
  }

  return next();
});

export const startInstance = createStart(() => ({
  functionMiddleware: [attachSupabaseAuth],
  requestMiddleware: [lovableRedirectMiddleware, errorMiddleware, csrfMiddleware],
}));
