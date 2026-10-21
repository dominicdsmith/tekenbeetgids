import { Button } from "@/components/ui/button";
import privacySchildWit from "@/assets/privacy-schild-wit.png.asset.json";
import { useRuimteOnder } from "@/hooks/useRuimteOnder";
import { openCookieVoorkeuren } from "@/lib/cookieVoorkeuren";
import { useTaal } from "@/lib/taal";

// Knop linksonder, in dezelfde stijl als het ASSISTENTknopje rechtsonder.
// Handig als uw cookiekeuze al is opgeslagen: zo blijft het voorkeurenscherm
// altijd bereikbaar. De knop opent alleen het eigen voorkeurenscherm.
export default function CookieSchild() {
  const taal = useTaal();
  const en = taal === "en";
  const onder = useRuimteOnder("links");
  return (
    <Button
      type="button"
      size="icon"
      className="schild-zwevend"
      data-geen-vertaling
      style={onder ? { bottom: `${onder}px` } : undefined}
      onClick={() => openCookieVoorkeuren()}
      aria-label={en ? "Open cookie and privacy preferences" : "Cookie- en privacyvoorkeuren openen"}
      title={en ? "Cookie and privacy preferences" : "Cookie- en privacyvoorkeuren"}
    >
      <img
        src={privacySchildWit.url}
        alt=""
        aria-hidden="true"
        width={22}
        height={22}
        style={{ width: 22, height: 22, objectFit: "contain", display: "block" }}
      />
    </Button>
  );
}
