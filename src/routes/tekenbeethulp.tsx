import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useState } from "react";
import TekenbeetHulp from "@/components/TekenbeetHulp";
import SplashTekenbeetHulp from "@/components/SplashTekenbeetHulp";
import { meldSplashActief, meldSplashKlaar } from "@/lib/splashStatus";
import { TBH_ICON_VERSION } from "@/data/appVersie";

const title = "Tekenbeet vastleggen en huidreactie volgen — TekenbeetGids-wizard";
const description =
  "Doorloop stap voor stap vragen over uw tekenbeet, de teek en de huidreactie, en bewaar een overzicht voor uzelf of uw huisarts.";

export const Route = createFileRoute("/tekenbeethulp")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { name: "author", content: "Dominic Smith Advies" },
      { name: "apple-mobile-web-app-title", content: "TekenbeetGids" },
      { name: "application-name", content: "TekenbeetGids" },
      { name: "theme-color", content: "#F5FAFE" },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://tekenbeetgids.nl/tekenbeethulp" },
      { property: "og:site_name", content: "TekenbeetGids" },
      { property: "og:image", content: "https://tekenbeetgids.nl/og-image-tekenbeetgids.jpg?v=1" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:image", content: "https://tekenbeetgids.nl/og-image-tekenbeetgids.jpg?v=1" },
      { name: "robots", content: "noindex, follow" },
    ],
    links: [
      { rel: "canonical", href: "https://tekenbeetgids.nl/" },
      {
        rel: "manifest",
        href: `/manifest-tekenbeethulp.webmanifest?v=${TBH_ICON_VERSION}`,
      },
    ],
  }),
  component: TekenbeetHulpPagina,
});

function TekenbeetHulpPagina() {
  // Zelfde aanpak als het algemene startscherm: volledig dekkend startscherm
  // vanaf server-render, zodat de pagina nooit kort oplicht.
  const [toonSplash, setToonSplash] = useState(() => {
    meldSplashActief();
    return true;
  });
  const sluitSplash = useCallback(() => {
    meldSplashKlaar();
    setToonSplash(false);
  }, []);

  // Browser toont de app-laag; de geïnstalleerde iOS-web-app alleen Apple's laag.

  return (
    <>
      <TekenbeetHulp />
      {toonSplash && <SplashTekenbeetHulp onDone={sluitSplash} />}
    </>
  );
}
