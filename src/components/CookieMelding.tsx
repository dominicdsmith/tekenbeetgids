import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { STZ } from "@/data/tekenData";
import TaalKnop from "@/components/TaalKnop";
import CookieSchild from "@/components/CookieSchild";
import InhoudsDatum from "@/components/InhoudsDatum";
import { bijSplashKlaar } from "@/lib/splashStatus";
import { useTaal } from "@/lib/taal";
import { vertaalTekst } from "@/lib/vertaling";
import dsaLogoAsset from "@/assets/dominic-smith-advies-logo.jpg.asset.json";
import privacySchild from "@/assets/privacy-schild.png.asset.json";
import {
  OPEN_EVENT,
  bewaarVoorkeuren,
  leesVoorkeuren,
  STANDAARD_VOORKEUREN,
} from "@/lib/cookieVoorkeuren";

type Modus = "gesloten" | "melding" | "voorkeuren";

const FOCUSBAAR =
  'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])';

export default function CookieMelding() {
  const [modus, setModus] = useState<Modus>("gesloten");
  const [voorkeuren, setVoorkeuren] = useState(STANDAARD_VOORKEUREN.voorkeuren);
  const [statistieken, setStatistieken] = useState(STANDAARD_VOORKEUREN.statistieken);
  const [schildKlaar, setSchildKlaar] = useState(false);
  const paneelRef = useRef<HTMLDivElement | null>(null);
  const vorigeFocus = useRef<HTMLElement | null>(null);
  const taal = useTaal();
  const T = (nl: string) => vertaalTekst(nl, taal === "en");

  // Melding pas tonen zodra het startscherm weg is en er nog geen geldige keuze is.
  useEffect(() => {
    let gedaan = false;
    const toon = () => {
      if (gedaan) return;
      gedaan = true;
      const opgeslagen = leesVoorkeuren();
      if (opgeslagen) {
        setVoorkeuren(opgeslagen.voorkeuren);
        setStatistieken(opgeslagen.statistieken);
      }
      // Cookiescherm altijd eerst tonen; het schild verschijnt pas na wegklikken.
      setModus("melding");
    };
    // Tonen zodra het startscherm helemaal klaar is (na het uitfaden).
    // Omdat de route-pagina soms later hydratteert dan deze melding,
    // kijken we ook rechtstreeks naar het startscherm in de DOM.
    let na: number | undefined;
    let retry: number | undefined;
    const probeer = () => {
      if (gedaan) return;
      if (document.querySelector(".browser-splash")) {
        retry = window.setTimeout(probeer, 250);
        return;
      }
      // Direct tonen zodra het startscherm volledig is uitgefadet en verwijderd.
      na = window.setTimeout(toon, 0);
    };
    const stop = bijSplashKlaar(probeer);
    // Veiligheidsnet mocht de startscherm-melding worden gemist.
    const timer = window.setTimeout(toon, 10000);

    return () => {
      stop();
      window.clearTimeout(timer);
      if (na) window.clearTimeout(na);
      if (retry) window.clearTimeout(retry);
    };
  }, []);

  // Voorkeurenscherm openen vanuit Help/footer.
  useEffect(() => {
    const open = () => {
      const opgeslagen = leesVoorkeuren();
      setVoorkeuren(opgeslagen ? opgeslagen.voorkeuren : STANDAARD_VOORKEUREN.voorkeuren);
      setStatistieken(opgeslagen ? opgeslagen.statistieken : STANDAARD_VOORKEUREN.statistieken);
      setModus("voorkeuren");
    };
    window.addEventListener(OPEN_EVENT, open);
    return () => window.removeEventListener(OPEN_EVENT, open);
  }, []);

  const sluit = useCallback(() => {
    setModus("gesloten");
    setSchildKlaar(true);
    vorigeFocus.current?.focus?.();
  }, []);

  // Focus verplaatsen naar het venster, focus vasthouden en Escape afhandelen.
  useEffect(() => {
    if (modus === "gesloten") return;
    vorigeFocus.current = (document.activeElement as HTMLElement) ?? null;
    const paneel = paneelRef.current;
    paneel?.focus({ preventScroll: true });

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        sluit();
        return;
      }
      if (e.key !== "Tab" || !paneel) return;
      const items = Array.from(paneel.querySelectorAll<HTMLElement>(FOCUSBAAR)).filter(
        (el) => el.offsetParent !== null || el === document.activeElement,
      );
      if (items.length === 0) return;
      const eersteItem = items[0]!;
      const laatsteItem = items[items.length - 1]!;
      if (e.shiftKey && document.activeElement === eersteItem) {
        e.preventDefault();
        laatsteItem.focus();
      } else if (!e.shiftKey && document.activeElement === laatsteItem) {
        e.preventDefault();
        eersteItem.focus();
      }
    };
    document.addEventListener("keydown", onKey, true);
    return () => document.removeEventListener("keydown", onKey, true);
  }, [modus, sluit]);

  if (modus === "gesloten") return schildKlaar ? <CookieSchild /> : null;

  const opslaan = (keuze: { voorkeuren: boolean; statistieken: boolean }) => {
    bewaarVoorkeuren(keuze);
    setVoorkeuren(keuze.voorkeuren);
    setStatistieken(keuze.statistieken);
    sluit();
  };

  // Opstartscherm en voorkeurenscherm zijn gelijk: altijd met keuzeopties.
  const isVoorkeurenScherm = true;
  const titelId = "trk-cookie-titel";
  const tekstId = "trk-cookie-tekst";

  const knopBasis: React.CSSProperties = {
    padding: "8px 14px",
    borderRadius: 7,
    fontSize: 10.5,
    fontWeight: 800,
    cursor: "pointer",
    fontFamily: "inherit",
  };

  return (
    <>
      {isVoorkeurenScherm && (
        <div
          onClick={sluit}
          aria-hidden="true"
          style={{ position: "fixed", inset: 0, background: "rgba(11,41,54,.45)", zIndex: 9998 }}
        />
      )}
      <div
        ref={paneelRef}
        role="dialog"
        aria-modal={isVoorkeurenScherm ? true : undefined}
        aria-labelledby={titelId}
        aria-describedby={tekstId}
        tabIndex={-1}
        style={{
          position: "fixed",
          left: 8,
          right: 8,
          bottom: isVoorkeurenScherm ? "auto" : "calc(env(safe-area-inset-bottom, 0px) + 56px)",
          top: isVoorkeurenScherm ? "50%" : "auto",
          transform: isVoorkeurenScherm ? "translateY(-50%)" : undefined,
          zIndex: 9999,
          maxWidth: 520,
          maxHeight: "86vh",
          overflowY: "auto",
          margin: "0 auto",
          background: "#fff",
          border: `1px solid ${STZ.lijn}`,
          borderRadius: 10,
          boxShadow: "0 8px 28px rgba(0,0,0,.22)",
          padding: "12px 13px",
          outline: "none",
          fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
          <img
            src={privacySchild.url}
            alt=""
            aria-hidden="true"
            width={18}
            height={18}
            style={{
              width: 18,
              height: 18,
              objectFit: "contain",
              flexShrink: 0,
              display: "block",
            }}
          />
          <h2 id={titelId} style={{ fontSize: 11.5, fontWeight: 800, color: STZ.rood, margin: 0 }}>
            {"Cookievoorkeuren & Privacy"}
          </h2>
          <TaalKnop scheiding="#7FB2CC" />
          <button
            type="button"
            onClick={sluit}
            aria-label="Sluiten"
            title="Sluiten"
            style={{
              marginLeft: "auto",
              width: 26,
              height: 26,
              lineHeight: 1,
              border: `1px solid ${STZ.terra}`,
              borderRadius: 6,
              background: "#fff",
              color: STZ.rood,
              fontSize: 13,
              fontWeight: 800,
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            ×
          </button>
        </div>

        <p className="mb-2 text-[10.5px] leading-[1.55] text-muted-foreground">
          <InhoudsDatum en={taal === "en"} />
        </p>
        <p style={{ fontSize: 10.5, lineHeight: 1.55, color: "#3E6A7D", margin: "0 0 9px" }}>
          {T(
            "Deze website en web app wordt onderhouden door Dominic Smith Advies, dat als enige verantwoordelijk is voor de inhoud. De inhoud van de website en web app is bestemd voor bezoekers uit Nederland. Door op onze website en web app te surfen, verklaart u zich akkoord met onze ",
          )}
          <Link
            to="/gebruiksvoorwaarden"
            style={{ fontSize: 10.5, fontWeight: 700, color: STZ.terra, textDecoration: "underline" }}
          >
            {T("Gebruiksvoorwaarden")}
          </Link>
          {T(", onze ")}
          <Link
            to="/privacyverklaring"
            style={{ fontSize: 10.5, fontWeight: 700, color: STZ.terra, textDecoration: "underline" }}
          >
            {T("Privacyverklaring")}
          </Link>
          {T(" en ons ")}
          <Link
            to="/cookiebeleid"
            style={{ fontSize: 10.5, fontWeight: 700, color: STZ.terra, textDecoration: "underline" }}
          >
            {T("Cookiebeleid")}
          </Link>
          .
        </p>
        <p id={tekstId} style={{ fontSize: 10.5, lineHeight: 1.55, color: "#3E6A7D", margin: "0 0 9px" }}>
          TekenRisicoKaart - TekenbeetGids gebruiken geen marketing- of trackingcookies. Gezondheidsgegevens worden alleen met uw afzonderlijke uitdrukkelijke toestemming voor onderzoeksdoeleinden opgeslagen. Onderzoekstoestemming is geen toestemming voor AI-verwerking en een AI-scan is geen toestemming voor onderzoeksdeelname. Foto’s en de foto’s in uw samenvatting en PDF blijven lokaal op uw apparaat, tenzij u expliciet kiest voor een AI-scan. Bij een AI-scan wordt de foto via onze server doorgestuurd naar een externe AI-dienst voor verwerking. De foto wordt niet door ons opgeslagen, niet toegevoegd aan het onderzoeksbestand en wordt door ons niet gebruikt voor het trainen van AI-modellen. Meer informatie over de verwerking door externe dienstverleners en lokale opslag vindt u in de privacyverklaring en het cookiebeleid.
        </p>

        {isVoorkeurenScherm && (
          <fieldset style={{ border: "none", padding: 0, margin: "0 0 10px" }}>
            <legend style={{ fontSize: 10.5, fontWeight: 800, color: STZ.rood, marginBottom: 6 }}>
              Kies wat u wilt toestaan
            </legend>
            <Optie
              id="trk-c-noodzakelijk"
              titel="Strikt noodzakelijk (altijd aan)"
              uitleg="Nodig om de kaart, taalkeuze en beveiliging te laten werken. Deze kunt u niet uitzetten."
              checked
              disabled
            />
            <Optie
              id="trk-c-voorkeuren"
              titel="Voorkeuren onthouden"
              uitleg="Onthoudt bijvoorbeeld uw taalkeuze, het geopende tabblad en uw laatste zoekopdracht."
              checked={voorkeuren}
              onChange={setVoorkeuren}
            />
            <Optie
              id="trk-c-statistieken"
              titel="Statistieken"
              uitleg="Nu niet in gebruik: er worden geen bezoekstatistieken verzameld. Zet u dit aan, dan geldt dat pas als dit in de toekomst wordt toegevoegd."
              checked={statistieken}
              onChange={setStatistieken}
            />
          </fieldset>
        )}

        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8 }}>
          {isVoorkeurenScherm ? (
            <>
              <button
                type="button"
                onClick={() => opslaan({ voorkeuren: true, statistieken: true })}
                style={{ ...knopBasis, border: "none", background: STZ.rood, color: "#fff" }}
              >
                {T("Alles accepteren")}
              </button>
              <button
                type="button"
                onClick={() => opslaan({ voorkeuren, statistieken })}
                style={{ ...knopBasis, border: `1px solid ${STZ.terra}`, background: "#fff", color: STZ.rood }}
              >
                Keuze opslaan
              </button>
              <button
                type="button"
                onClick={() => opslaan({ voorkeuren: true, statistieken: false })}
                style={{ ...knopBasis, border: `1px solid ${STZ.terra}`, background: "#fff", color: STZ.rood }}
              >
                Alleen noodzakelijk en voorkeuren
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => opslaan({ voorkeuren: true, statistieken: true })}
                style={{ ...knopBasis, border: "none", background: STZ.rood, color: "#fff" }}
              >
                {T("Alles accepteren")}
              </button>
              <button
                type="button"
                onClick={() => opslaan({ voorkeuren: true, statistieken: false })}
                style={{ ...knopBasis, border: `1px solid ${STZ.terra}`, background: "#fff", color: STZ.rood }}
              >
                Alleen noodzakelijk en voorkeuren
              </button>
              <button
                type="button"
                onClick={() => setModus("voorkeuren")}
                style={{ ...knopBasis, border: `1px solid ${STZ.terra}`, background: "#fff", color: STZ.rood }}
              >
                Voorkeuren aanpassen
              </button>
            </>
          )}
        </div>
        <p style={{ fontSize: 10.5, lineHeight: 1.55, color: "#3E6A7D", margin: "8px 0 0" }}>
          {T("De beoogde functie van TekenRisicoKaart - TekenbeetGids is informatief: de diensten bieden informatie, begeleiding en inzicht. De privacydocumenten beschrijven de beoogde inrichting met het oog op de AVG (GDPR), AI-transparantie en toekomstige aansluiting op de EHDS en HDAB. Dit vormt geen verklaring of garantie van volledige wettelijke naleving.")}
        </p>
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 10, marginTop: 8 }}>
          <Link to="/gebruiksvoorwaarden" style={{ fontSize: 10, fontWeight: 700, color: STZ.terra }}>Gebruiksvoorwaarden</Link>
          <Link to="/disclaimer" style={{ fontSize: 10, fontWeight: 700, color: STZ.terra }}>Disclaimer</Link>
          <Link to="/privacyverklaring" style={{ fontSize: 10, fontWeight: 700, color: STZ.terra }}>Privacyverklaring</Link>
          <Link to="/privacyverklaring-gezondheidsgegevens" style={{ fontSize: 10, fontWeight: 700, color: STZ.terra }}>Privacyverklaring Gezondheidsgegevens</Link>
          <Link to="/cookiebeleid" style={{ fontSize: 10, fontWeight: 700, color: STZ.terra }}>Cookiebeleid</Link>
          <Link to="/transparantieverklaring" style={{ fontSize: 10, fontWeight: 700, color: STZ.terra }}>Transparantieverklaring</Link>
          <Link to="/toegankelijkheidsverklaring" style={{ fontSize: 10, fontWeight: 700, color: STZ.terra }}>Toegankelijkheidsverklaring</Link>
          <Link to="/verwerkingsregister" style={{ fontSize: 10, fontWeight: 700, color: STZ.terra }}>Verwerkingsregister</Link>
          <Link to="/gegevensbeschermingseffectbeoordeling" style={{ fontSize: 10, fontWeight: 700, color: STZ.terra }}>Gegevensbeschermingseffectbeoordeling (DPIA)</Link>
        </div>
        <div style={{ marginTop: 10, display: "flex", alignItems: "flex-end", gap: 8, flexWrap: "wrap" }}>
          <img
            src={dsaLogoAsset.url}
            alt={T("Logo van Dominic Smith Advies")}
            width={20}
            height={20}
            style={{ width: 20, height: 20, objectFit: "contain", flexShrink: 0, display: "block", marginBottom: 3 }}
          />
          <span style={{ fontSize: 10, lineHeight: 1.5, color: "#3E6A7D" }}>
            {T("© 2026 Dominic Smith Advies. Alle rechten voorbehouden.")}
          </span>
        </div>
      </div>
    </>
  );
}

function Optie({
  id,
  titel,
  uitleg,
  checked,
  disabled,
  onChange,
}: {
  id: string;
  titel: string;
  uitleg: string;
  checked: boolean;
  disabled?: boolean;
  onChange?: (waarde: boolean) => void;
}) {
  const uitlegId = `${id}-uitleg`;
  return (
    <div style={{ display: "flex", gap: 8, alignItems: "flex-start", marginBottom: 8 }}>
      <input
        id={id}
        type="checkbox"
        checked={checked}
        disabled={disabled}
        aria-describedby={uitlegId}
        onChange={(e) => onChange?.(e.target.checked)}
        style={{ marginTop: 2, width: 16, height: 16, accentColor: STZ.rood }}
      />
      <div>
        <label htmlFor={id} style={{ fontSize: 10.5, fontWeight: 800, color: STZ.rood, cursor: disabled ? "default" : "pointer" }}>
          {titel}
        </label>
        <p id={uitlegId} style={{ fontSize: 10, lineHeight: 1.5, color: "#3E6A7D", margin: "2px 0 0" }}>
          {uitleg}
        </p>
      </div>
    </div>
  );
}
