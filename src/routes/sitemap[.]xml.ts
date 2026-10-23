import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { ZIEKTEN } from "@/data/tekenData";

interface SitemapEntry {
  path: string;
  changefreq?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority?: string;
}

const JURIDISCH = [
  "/gebruiksvoorwaarden",
  "/privacyverklaring",
  "/privacyverklaring-gezondheidsgegevens",
  "/cookiebeleid",
  "/transparantieverklaring",
  "/toegankelijkheidsverklaring",
  "/verwerkingsregister",
  "/gegevensbeschermingseffectbeoordeling",
];

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        // De publieke adressen zijn de enige hosts. Het lovable.app-adres stuurt
        // naar tekenrisicokaart.nl, dus de sitemap toont nooit dat adres.
        const host = new URL(request.url).hostname;
        const tbg = /(^|\.)tekenbeetgids\.nl$/i.test(host);
        const BASE_URL = tbg ? "https://tekenbeetgids.nl" : "https://tekenrisicokaart.nl";
        const entries: SitemapEntry[] = [
          { path: "/", changefreq: "weekly", priority: "1.0" },
          ...(tbg
            ? []
            : [
                { path: "/ziekten", changefreq: "monthly" as const, priority: "0.8" },
                ...ZIEKTEN.map((z) => ({ path: `/ziekten/${z.id}`, changefreq: "monthly" as const, priority: "0.7" })),
              ]),
          ...JURIDISCH.map((path) => ({ path, changefreq: "yearly" as const, priority: "0.3" })),
        ];

        const urls = entries.map((e) =>
          [
            `  <url>`,
            `    <loc>${BASE_URL}${e.path}</loc>`,
            e.changefreq ? `    <changefreq>${e.changefreq}</changefreq>` : null,
            e.priority ? `    <priority>${e.priority}</priority>` : null,
            `  </url>`,
          ]
            .filter(Boolean)
            .join("\n"),
        );

        const xml = [
          `<?xml version="1.0" encoding="UTF-8"?>`,
          `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
          ...urls,
          `</urlset>`,
        ].join("\n");

        return new Response(xml, {
          headers: {
            "Content-Type": "application/xml",
            "Cache-Control": "public, max-age=3600",
          },
        });
      },
    },
  },
});
