import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import CookieMelding from "../components/CookieMelding";
import TaalVertaler from "../components/TaalVertaler";
import { ICON_VERSION, TBH_ICON_VERSION } from "../data/appVersie";
import { readRequestHost } from "../lib/domein.functions";
import { clearAppCache } from "../lib/cacheLeegmaken";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: import("@tanstack/react-router").ErrorComponentProps) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  beforeLoad: async () => {
    // In de browser is de zichtbare host altijd leidend. Een serverfunctie-call
    // kan bij een custom domain via de interne deploymenthost lopen; daardoor
    // kon de geïnstalleerde TekenbeetGids-app na hydratatie alsnog omschakelen
    // naar het TekenRisicoKaart-startscherm.
    if (typeof window !== "undefined") {
      return {
        isTekenbeetHulpHost: /(^|\.)tekenbeetgids\.nl$/i.test(window.location.hostname),
      };
    }

    // Tijdens SSR gebruiken we de host van het oorspronkelijke paginaverzoek.
    const host = await readRequestHost();
    return { isTekenbeetHulpHost: /(^|\.)tekenbeetgids\.nl$/i.test(host), requestHost: host };
  },
  head: ({ match }) => {
    const ctx = (match?.context as { isTekenbeetHulpHost?: boolean; requestHost?: string } | undefined) ?? {};
    const tbh = Boolean(ctx.isTekenbeetHulpHost);
    // Google Search Console accepteert per domein één verificatiecode; de router
    // houdt van gelijknamige meta-tags alleen de laatste over, dus kiezen we per host.
    const host = (ctx.requestHost ?? "").toLowerCase();
    const googleVerification = tbh
      ? "oQVm0txWjEsM558xCtI-WwZFnFGI7j4L5dir4KLBqa8"
      : host.endsWith("lovable.app")
        ? "dekXp1TX11zEM14tkjnEWhB3b130oa0-rSKVFS1s6CY"
        : "wNoVyAmR6b4Immrx6KZmO7D6ZiKdejqD67qIPJntzvQ";
    const appNaam = tbh ? "TekenbeetGids" : "TekenRisicoKaart";
    return {
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1, viewport-fit=cover" },
      { name: "author", content: "Dominic Smith Advies" },
      { name: "publisher", content: "Dominic Smith Advies" },
      {
        name: "copyright",
        content:
          "© Dominic Smith Advies — onafhankelijke uitgave; niet uitgegeven door of namens Stichting Tekenbeetziekten, Lymevereniging, RIVM of Tekenradar.nl.",
      },

      { name: "google-site-verification", content: googleVerification },

      /* Legitimiteitsverklaring voor reputatie- en beveiligingsdiensten
         (Total WebShield, Google Safe Browsing, Norton, McAfee, VirusTotal e.d.).
         Deze site is een publieke voorlichtingssite over teken en tekenbeetziekten:
         geen betalingen, geen inloggegevens, geen tracking- of marketingcookies. */
      { name: "robots", content: "index, follow, max-image-preview:large, max-snippet:-1" },
      { name: "rating", content: "general" },
      { name: "owner", content: "Dominic Smith Advies (KvK 01170115), Nederland" },
      { name: "category", content: "health, public information" },
      { name: "coverage", content: "Netherlands" },
      { name: "distribution", content: "global" },
      { name: "referrer", content: "strict-origin-when-cross-origin" },
      { property: "og:site_name", content: appNaam },
      { property: "og:locale", content: "nl_NL" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "theme-color", content: "#F5FAFE" },
      { name: "color-scheme", content: "light" },
      { name: "mobile-web-app-capable", content: "yes" },
      { name: "apple-mobile-web-app-capable", content: "yes" },
      { name: "apple-mobile-web-app-status-bar-style", content: "default" },
      { name: "apple-mobile-web-app-title", content: appNaam },
      { name: "application-name", content: appNaam },
      // Voorkom dat browsers (vooral iOS/Safari) de pagina uit een oude cache tonen.
      { httpEquiv: "Cache-Control", content: "no-cache, no-store, must-revalidate" },
      { httpEquiv: "Pragma", content: "no-cache" },
      { httpEquiv: "Expires", content: "0" },
    ],

    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
      // Google/Safari zoekresultaten lezen de .ico het makkelijkst uit; zet deze eerst.
      {
        rel: "shortcut icon",
        type: "image/x-icon",
        sizes: "16x16 24x24 32x32 48x48 64x64 128x128 256x256",
        href: tbh ? `/tekenbeethulp-favicon.ico?v=${TBH_ICON_VERSION}` : `/favicon-${ICON_VERSION}.ico`,
      },
      { rel: "icon", type: "image/x-icon", sizes: "16x16 24x24 32x32 48x48 64x64 128x128 256x256", href: tbh ? `/tekenbeethulp-favicon.ico?v=${TBH_ICON_VERSION}` : `/favicon-${ICON_VERSION}.ico` },
      { rel: "icon", type: "image/png", sizes: "48x48", href: tbh ? `/tekenbeethulp-favicon-48.png?v=${TBH_ICON_VERSION}` : `/favicon-48-${ICON_VERSION}.png` },
      { rel: "icon", type: "image/png", sizes: "32x32", href: tbh ? `/tekenbeethulp-favicon-32.png?v=${TBH_ICON_VERSION}` : `/favicon-32-${ICON_VERSION}.png` },
      { rel: "icon", type: "image/png", sizes: "512x512", href: tbh ? `/tekenbeethulp-icon-512.png?v=${TBH_ICON_VERSION}` : `/favicon-512-${ICON_VERSION}.png` },
      { rel: "apple-touch-icon", sizes: "180x180", href: tbh ? `/tekenbeethulp-apple-touch-icon-180.png?v=${TBH_ICON_VERSION}` : `/apple-touch-icon-180-${ICON_VERSION}.png` },
      { rel: "apple-touch-icon", sizes: "167x167", href: tbh ? `/tekenbeethulp-apple-touch-icon-180.png?v=${TBH_ICON_VERSION}` : `/apple-touch-icon-167-${ICON_VERSION}.png` },
      { rel: "apple-touch-icon", sizes: "152x152", href: tbh ? `/tekenbeethulp-apple-touch-icon-180.png?v=${TBH_ICON_VERSION}` : `/apple-touch-icon-152-${ICON_VERSION}.png` },
      { rel: "apple-touch-icon", sizes: "120x120", href: tbh ? `/tekenbeethulp-apple-touch-icon-180.png?v=${TBH_ICON_VERSION}` : `/apple-touch-icon-120-${ICON_VERSION}.png` },
      { rel: "apple-touch-icon", href: tbh ? `/tekenbeethulp-apple-touch-icon-180.png?v=${TBH_ICON_VERSION}` : `/apple-touch-icon-${ICON_VERSION}.png` },
      { rel: "author", href: "/humans.txt" },
      { rel: "license", href: "/gebruiksvoorwaarden" },
      { rel: "privacy-policy", href: "/privacy" },
      { rel: "terms-of-service", href: "/gebruiksvoorwaarden" },
    ],

    /* Machineleesbare legitimiteitsverklaring: identificeert de uitgever,
       de officiële domeinen en het niet-commerciële voorlichtingskarakter. */
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Organization",
          name: "Dominic Smith Consultancy",
          legalName: "Dominic Smith Advies",
          identifier: "KvK 01170115",
          url: "https://tekenrisicokaart.nl",
          address: { "@type": "PostalAddress", addressCountry: "NL" },
          sameAs: [
            "https://tekenrisicokaart.nl",
            "https://www.tekenrisicokaart.nl",
            "https://tekenbeetgids.nl",
            "https://www.tekenbeetgids.nl",
          ],
          description:
            "Uitgever van de publieke voorlichtingssites TekenRisicoKaart en TekenbeetGids over teken en tekenbeetziekten in Nederland. Geen marketing- of trackingcookies. Gezondheidsgegevens voor onderzoek worden alleen met uitdrukkelijke toestemming gepseudonimiseerd opgeslagen; een foto gaat alleen bij een expliciete keuze voor een AI-scan via onze server naar een externe AI-dienst en wordt niet door ons opgeslagen of voor modeltraining gebruikt.",
          contactPoint: [
            {
              "@type": "ContactPoint",
              contactType: "customer support",
              url: "https://tekenrisicokaart.nl",
              availableLanguage: ["nl", "en"],
            },
            {
              "@type": "ContactPoint",
              contactType: "security",
              url: "https://tekenrisicokaart.nl",
              availableLanguage: ["nl", "en"],
            },
          ],
        }),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: appNaam,
          url: tbh ? "https://tekenbeetgids.nl" : "https://tekenrisicokaart.nl",
          inLanguage: ["nl", "en"],
          isAccessibleForFree: true,
          isFamilyFriendly: true,
          publisher: { "@type": "Organization", name: "Dominic Smith Consultancy", identifier: "KvK 01170115" },
          publishingPrinciples: "https://tekenrisicokaart.nl/gebruiksvoorwaarden",
          about: "Teken, tekenbeten en tekenbeetziekten in Nederland",
          description:
            "Legitieme, niet-commerciële voorlichtingswebsite over tekenbeetrisico's. Er worden geen betalingen, inloggegevens of creditcardgegevens gevraagd; er zijn geen marketing- of trackingcookies. Gezondheidsgegevens voor onderzoek worden alleen met uitdrukkelijke toestemming gepseudonimiseerd opgeslagen; een foto gaat alleen bij een expliciete keuze voor een AI-scan via onze server naar een externe AI-dienst en wordt niet door ons opgeslagen of voor modeltraining gebruikt. Bronnen: RIVM/LCI, GGD, CBS, NVWA, Tekenradar, Wageningen University & Research, Universiteit Utrecht en ECDC.",
        }),
      },
    ],
    };
  },


  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="nl">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

/* Op het domein tekenbeetgids.nl krijgt de site de TekenbeetGids-favicon,
   app-naam en een eigen web-app-manifest (beginscherm-installatie). */
function useTekenbeetHulpHuisstijl() {
  useEffect(() => {
    if (!/(^|\.)tekenbeetgids\.nl$/.test(window.location.hostname)) return;

    document.querySelectorAll<HTMLLinkElement>('link[rel="manifest"]').forEach((el) => {
      el.href = `/manifest-tekenbeethulp.webmanifest?v=${TBH_ICON_VERSION}`;
    });
    document
      .querySelectorAll<HTMLLinkElement>('link[rel="shortcut icon"], link[rel="icon"]')
      .forEach((el) => {
        const sizes = el.getAttribute("sizes") ?? "";
        el.removeAttribute("type");
        if (sizes.includes("48")) el.href = `/tekenbeethulp-favicon-48.png?v=${TBH_ICON_VERSION}`;
        else if (sizes.includes("512")) el.href = `/tekenbeethulp-icon-512.png?v=${TBH_ICON_VERSION}`;
        else if (sizes.includes("32")) el.href = `/tekenbeethulp-favicon-32.png?v=${TBH_ICON_VERSION}`;
        else if (sizes.includes("16")) el.href = `/tekenbeethulp-favicon-16.png?v=${TBH_ICON_VERSION}`;
        else el.href = `/tekenbeethulp-favicon.ico?v=${TBH_ICON_VERSION}`;
      });
    document
      .querySelectorAll<HTMLLinkElement>('link[rel="apple-touch-icon"]')
      .forEach((el) => {
        el.href = `/tekenbeethulp-apple-touch-icon-180.png?v=${TBH_ICON_VERSION}`;
      });
    document
      .querySelectorAll<HTMLMetaElement>(
        'meta[name="apple-mobile-web-app-title"], meta[name="application-name"]',
      )
      .forEach((el) => {
        el.content = "TekenbeetGids";
      });
    document
      .querySelector<HTMLMetaElement>('meta[name="theme-color"]')
      ?.setAttribute("content", "#F5FAFE");
  }, []);
}

/** Ruimt een eventueel achtergebleven app-cache op zonder de pagina te herladen. */
function useCleanupServiceWorker() {
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;

    // Registreer hier geen nieuwe worker: diens activate-handler kon tijdens
    // het startscherm navigeren en zo de splash opnieuw starten. De lokale
    // opruiming schrijft bestaande app-workers uit en wist hun app-caches.
    clearAppCache();
  }, []);
}


function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  useTekenbeetHulpHuisstijl();
  useCleanupServiceWorker();

  useEffect(() => {
    // Houd Safari's boven- en onderbalk licht; iOS kan anders een oude of uit
    // de pagina afgeleide donkerblauwe tint blijven gebruiken.
    document.documentElement.style.backgroundColor = "#F5FAFE";
    document.body.style.backgroundColor = "#F5FAFE";
    document
      .querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]')
      .forEach((meta) => meta.setAttribute("content", "#F5FAFE"));
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
      <Outlet />
      <CookieMelding />
      <TaalVertaler />
    </QueryClientProvider>
  );
}
