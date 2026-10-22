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

  // Platform-afbeeldingen (/__l5e/assets-v1/...) bestaan alleen op de
  // Lovable-hosts. Op eigen hosting (Cloud Run) bestaat dat pad niet; stuur
  // de afbeeldingen dan door naar het eigen domein, waar het platform ze
  // gewoon levert. Alleen actief als APP_HOSTING=cloud-run is gezet.
  if (process.env["APP_HOSTING"] === "cloud-run" && url.pathname.startsWith("/__l5e/assets-v1/")) {
    if (host === "tekenbeetgids.nl" || host === "www.tekenbeetgids.nl") return next();
    const doel = new URL(`https://tekenbeetgids.nl${url.pathname}${url.search}`);
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
