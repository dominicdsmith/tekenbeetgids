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

  // Op Cloud Run worden platform-afbeeldingen (/__l5e/assets-v1/...) tijdens
  // de build meegeleverd (scripts/cloud-run-assets.mjs) en als statisch
  // bestand geserveerd. Ontbreekt er toch één, stuur dan door naar de
  // Lovable-host — nooit naar een eigen domein, dat na verhuizing zelf op
  // Cloud Run draait en een lus zou geven.
  if (process.env["APP_HOSTING"] === "cloud-run" && url.pathname.startsWith("/__l5e/assets-v1/")) {
    const doel = new URL(`https://tekenrisicokaart.lovable.app${url.pathname}${url.search}`);
    return new Response(null, {
      status: 302,
      headers: { Location: doel.toString(), "Cache-Control": "public, max-age=86400" },
    });
  }

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
