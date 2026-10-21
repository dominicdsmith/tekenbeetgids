import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useState } from "react";
import Tekenkaart from "@/components/kaart/Tekenkaart";
import Splash from "@/components/Splash";
import TekenbeetHulp from "@/components/TekenbeetHulp";
import SplashTekenbeetHulp from "@/components/SplashTekenbeetHulp";
import SeoZiekten from "@/components/SeoZiekten";

import { meldSplashActief, meldSplashKlaar } from "@/lib/splashStatus";
import { ZIEKTEN, ZIEKTE_EXTRA } from "@/data/tekenData";
import { ICON_VERSION, TBH_ICON_VERSION } from "@/data/appVersie";

const title = "TekenRisicoKaart — tekenrisico en tekenbeetziekten in Nederland";
const description =
  "Interactieve kaart met risico-indicaties per provincie, 11 met teken geassocieerde aandoeningen, TBE-meldingen en tekenactiviteit in Nederland.";

export const Route = createFileRoute("/")({
  head: ({ match }) => {
    const tbh = Boolean(
      (match?.context as { isTekenbeetHulpHost?: boolean } | undefined)?.isTekenbeetHulpHost,
    );
    if (tbh) {
      const tbhTitel = "TekenbeetGids — informatie en inzicht na een tekenbeet";
      const tbhOms =
        "Leg feitelijke informatie over uw tekenbeet en huidreactie vast en bewaar een persoonlijk overzicht; zonder diagnose, triage of behandeladvies.";
      return {
        meta: [
          { title: tbhTitel },
          { name: "description", content: tbhOms },
          { name: "apple-mobile-web-app-title", content: "TekenbeetGids" },
          { name: "application-name", content: "TekenbeetGids" },
          { name: "author", content: "Dominic Smith Advies" },
          { name: "keywords", content: "tekenbeet, teek verwijderen, rode ring, erythema migrans, ziekte van Lyme, TBE, tekenbeet registreren, TekenbeetGids" },
          { property: "og:site_name", content: "TekenbeetGids" },
          { property: "og:locale", content: "nl_NL" },
          { property: "og:title", content: tbhTitel },
          { property: "og:description", content: tbhOms },
          { property: "og:type", content: "website" },
          { property: "og:url", content: "https://tekenbeetgids.nl/" },
          { property: "og:image", content: "https://tekenbeetgids.nl/og-image-tekenbeetgids.jpg?v=1" },
          { name: "twitter:card", content: "summary_large_image" },
          { name: "twitter:image", content: "https://tekenbeetgids.nl/og-image-tekenbeetgids.jpg?v=1" },
          { name: "twitter:title", content: tbhTitel },
          { name: "twitter:description", content: tbhOms },
        ],
        links: [
          { rel: "canonical", href: "https://tekenbeetgids.nl/" },
          { rel: "manifest", href: `/manifest-tekenbeethulp.webmanifest?v=${TBH_ICON_VERSION}` },
        ],
        scripts: [
          {
            type: "application/ld+json",
            children: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              name: "TekenbeetGids",
              url: "https://tekenbeetgids.nl/",
              description: tbhOms,
              applicationCategory: "HealthApplication",
              operatingSystem: "Web",
              inLanguage: ["nl", "en"],
              isAccessibleForFree: true,
              author: { "@type": "Organization", name: "Dominic Smith Advies" },
            }),
          },
        ],
      };
    }
    return {
    meta: [
      { title },
      { name: "description", content: description },
      { name: "author", content: "Dominic Smith Advies" },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://tekenrisicokaart.nl/" },
      { property: "og:image", content: "https://tekenrisicokaart.nl/og-image.jpg?v=6" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:image", content: "https://tekenrisicokaart.nl/og-image.jpg?v=6" },
    ],
    links: [
      { rel: "canonical", href: "https://tekenrisicokaart.nl/" },
      { rel: "manifest", href: `/manifest.webmanifest?v=${ICON_VERSION}` },
    ],

    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "ItemList",
          name: "Tekenbeetziekten in Nederland",
          itemListElement: ZIEKTEN.map((z, i) => ({
            "@type": "ListItem",
            position: i + 1,
            item: {
              "@type": "MedicalCondition",
              name: z.naam,
              description: z.tekst,
              signOrSymptom: z.sympt.split(",").map((s) => ({ "@type": "MedicalSignOrSymptom", name: s.trim() })),
              ...(ZIEKTE_EXTRA[z.id]
                ? {
                    possibleTreatment: { "@type": "MedicalTherapy", name: ZIEKTE_EXTRA[z.id]!.behandeling },
                    epidemiology: ZIEKTE_EXTRA[z.id]!.overdracht,
                  }
                : {}),
            },
          })),
        }),
      },
    ],
    };
  },

  component: Index,
});

function Index() {
  const { isTekenbeetHulpHost } = Route.useRouteContext();

  if (isTekenbeetHulpHost) return <TekenbeetHulpStart />;

  return <TekenRisicoKaartStart />;
}

function TekenRisicoKaartStart() {
  // Begin op server en in de browser met exact dezelfde, volledig dekkende
  // splash. Zo kan de kaart nooit vóór of tijdens hydratatie kort oplichten.
  const [toonSplash, setToonSplash] = useState(() => {
    // Meteen (vóór kindcomponenten) melden dat het startscherm actief is,
    // zodat de cookiemelding pas erna verschijnt.
    meldSplashActief();
    return true;
  });
  const sluitSplash = useCallback(() => {
    meldSplashKlaar();
    setToonSplash(false);
  }, []);

  // Browser: één app-gestuurd startscherm. Geïnstalleerde iOS-web-app:
  // uitsluitend het ene native Apple-startscherm.

  return (
    <>
      <Tekenkaart />
      <SeoZiekten />

      {toonSplash && <Splash onDone={sluitSplash} />}
    </>
  );
}

function TekenbeetHulpStart() {
  const [toonSplash, setToonSplash] = useState(() => {
    meldSplashActief();
    return true;
  });
  const sluitSplash = useCallback(() => {
    meldSplashKlaar();
    setToonSplash(false);
  }, []);

  // Zelfde scheiding als TekenRisicoKaart: browserlaag óf native Apple-laag.

  return (
    <>
      <TekenbeetHulp />
      {toonSplash && <SplashTekenbeetHulp onDone={sluitSplash} />}
    </>
  );
}

