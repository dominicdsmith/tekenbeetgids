import { Link, useRouteContext } from "@tanstack/react-router";
import { Children, cloneElement, isValidElement, useEffect, useRef, useState, type ReactNode } from "react";
import { Download, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { maakPdf, deelOfDownloadPdf, isMobiel, isIOS, openPdf } from "@/lib/rapportPdf";
import { STZ } from "@/data/tekenData";
import dsaLogoAsset from "@/assets/dominic-smith-advies-logo.jpg.asset.json";
import { useTaal } from "@/lib/taal";
import { vertaalTekst } from "@/lib/vertaling";
import InformatieAssistent from "@/components/InformatieAssistent";

export function JuridischPagina({
  titel,
  bijgewerkt,
  children,
}: {
  titel: string;
  bijgewerkt: string;
  children: ReactNode;
}) {
  const taal = useTaal();
  // Op tekenbeetgids.nl toont de assistent de TekenbeetGids-onderwerpen, elders die van de kaart.
  const routeContext = useRouteContext({ from: "__root__" }) as { isTekenbeetHulpHost?: boolean };
  const gidsHost = Boolean(routeContext.isTekenbeetHulpHost);
  const T = (nl: string) => vertaalTekst(nl, taal === "en");
  const documentRef = useRef<HTMLDivElement>(null);
  const [pdf, setPdf] = useState<Blob | null>(null);
  const [pdfFout, setPdfFout] = useState(false);
  const [actieFout, setActieFout] = useState(false);
  const naam = `${T(titel).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}.pdf`;

  useEffect(() => {
    let actief = true;
    setPdf(null);
    setPdfFout(false);
    setActieFout(false);
    const inhoud = documentRef.current;
    if (!inhoud) return;
    const doc = document.implementation.createHTMLDocument(T(titel));
    doc.documentElement.lang = taal;
    const stijl = doc.createElement("style");
    stijl.textContent = `body { font-family: system-ui, sans-serif; color: #264A61; background: #fff; }
      h1 { font-size: 22px; margin: 0 0 12px; } h2 { font-size: 16px !important; margin: 20px 0 8px !important; }
      p, li { font-size: 14px !important; line-height: 1.6 !important; } a { color: #264A61; }
      .document-datum, footer { font-size: 12px; margin: 10px 0 18px; }
      @media print { @page { size: A4; margin: 15mm; } h1, h2 { break-after: avoid; } p, li { orphans: 3; widows: 3; } }`;
    doc.head.appendChild(stijl);
    const kop = doc.createElement("h1");
    kop.textContent = T(titel);
    const datum = doc.createElement("p");
    datum.className = "document-datum";
    datum.textContent = `${T("Laatst bijgewerkt")}: ${T(bijgewerkt)}`;
    const voet = doc.createElement("footer");
    voet.textContent = T("© 2026 Dominic Smith Advies. Alle rechten voorbehouden.");
    doc.body.append(kop, datum, inhoud.cloneNode(true), voet);
    maakPdf(`<!DOCTYPE html>${doc.documentElement.outerHTML}`, { watermerk: false })
      .then((bestand) => { if (actief) setPdf(bestand); })
      .catch(() => { if (actief) setPdfFout(true); });
    return () => { actief = false; };
  }, [taal, titel, bijgewerkt]);

  const printPdf = () => {
    if (!pdf) return;
    setActieFout(false);
    if (isIOS()) {
      void deelOfDownloadPdf(pdf, naam, true).catch(() => setActieFout(true));
      return;
    }
    const url = URL.createObjectURL(pdf);
    const venster = window.open(url, "_blank");
    if (!venster) {
      setActieFout(true);
      URL.revokeObjectURL(url);
      return;
    }
    venster.onload = () => {
      try { venster.focus(); venster.print(); } catch { /* PDF-viewer retains its print control. */ }
    };
    window.setTimeout(() => URL.revokeObjectURL(url), 120000);
  };

  const opslaanPdf = () => {
    if (!pdf) return;
    setActieFout(false);
    void deelOfDownloadPdf(pdf, naam, isMobiel()).catch(() => {
      if (!openPdf(pdf)) setActieFout(true);
    });
  };

  return (
    <div data-geen-vertaling style={{ minHeight: "100vh", background: STZ.creme, fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, sans-serif", color: STZ.tekst }}>
      <header style={{ background: STZ.rood, color: "#fff", padding: "14px 16px" }}>
        <Link to="/" style={{ color: "#fff", fontSize: 11, fontWeight: 700, textDecoration: "none", opacity: 0.85 }}>
          ← {T("Terug naar de TekenRisicoKaart")}
        </Link>
        <h1 style={{ margin: "8px 0 0", fontSize: 20, fontWeight: 800 }}>{T(titel)}</h1>
        <div style={{ fontSize: 10, opacity: 0.8, marginTop: 4 }}>
          {T("Laatst bijgewerkt")}: {T(bijgewerkt)}
        </div>
      </header>
      <main style={{ maxWidth: 780, margin: "0 auto", padding: "16px 16px 48px" }}>
        <div style={{ background: "#fff", border: `1px solid #BBD7E6`, borderRadius: 10, padding: 16 }}><div ref={documentRef}>{children}</div></div>
        <div className="mt-3 flex flex-wrap items-center gap-2" aria-busy={!pdf && !pdfFout}>
          <Button type="button" variant="outline" size="sm" disabled={!pdf} onClick={printPdf}>
            <Printer aria-hidden="true" />{taal === "en" ? "Print PDF" : "Print pdf"}
          </Button>
          <Button type="button" variant="outline" size="sm" disabled={!pdf} onClick={opslaanPdf}>
            <Download aria-hidden="true" />{taal === "en" ? "Save PDF" : "Opslaan pdf"}
          </Button>
          {!pdf && !pdfFout && <span role="status" className="text-xs text-muted-foreground">{taal === "en" ? "Preparing PDF…" : "Pdf voorbereiden…"}</span>}
        </div>
        {(pdfFout || actieFout) && <p role="alert" className="mt-2 text-xs text-destructive">{taal === "en" ? "The PDF could not be opened. Please try again or allow pop-ups for this website." : "De pdf kon niet worden geopend. Probeer opnieuw of sta pop-ups toe voor deze website."}</p>}
        <div style={{ marginTop: 14, fontSize: 10, color: "#5A8299", display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
          <Link to="/gebruiksvoorwaarden" style={{ color: STZ.terra, fontWeight: 700 }}>{T("Gebruiksvoorwaarden")}</Link>
          <Link to="/disclaimer" style={{ color: STZ.terra, fontWeight: 700 }}>Disclaimer</Link>
          <Link to="/privacyverklaring" style={{ color: STZ.terra, fontWeight: 700 }}>{T("Privacyverklaring")}</Link>
          <Link to="/privacyverklaring-gezondheidsgegevens" style={{ color: STZ.terra, fontWeight: 700 }}>{T("Privacyverklaring Gezondheidsgegevens")}</Link>
          <Link to="/cookiebeleid" style={{ color: STZ.terra, fontWeight: 700 }}>{T("Cookiebeleid")}</Link>
          <Link to="/transparantieverklaring" style={{ color: STZ.terra, fontWeight: 700 }}>{T("Transparantieverklaring")}</Link>
          <Link to="/toegankelijkheidsverklaring" style={{ color: STZ.terra, fontWeight: 700 }}>{T("Toegankelijkheidsverklaring")}</Link>
          <Link to="/verwerkingsregister" style={{ color: STZ.terra, fontWeight: 700 }}>{T("Verwerkingsregister")}</Link>
          <Link to="/gegevensbeschermingseffectbeoordeling" style={{ color: STZ.terra, fontWeight: 700 }}>{T("Gegevensbeschermingseffectbeoordeling (DPIA)")}</Link>
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
      </main>
      {/* Assistent blijft ook in voorwaarden en verklaringen rechtsonder zweven. */}
      <InformatieAssistent context={gidsHost ? "gids" : "kaart"} gidsHost={gidsHost} />
    </div>
  );
}

/** Vertaalt alle tekstdelen binnen een boom van React-nodes. */
export function vertaalNode(node: ReactNode, en: boolean): ReactNode {
  if (!en) return node;
  if (typeof node === "string") return vertaalTekst(node, true);
  if (Array.isArray(node)) return Children.map(node, (n) => vertaalNode(n, en));
  if (isValidElement(node)) {
    const kind = (node.props as { children?: ReactNode }).children;
    if (kind === undefined) return node;
    return cloneElement(node, undefined, vertaalNode(kind, en));
  }
  return node;
}

function useVertaal() {
  const taal = useTaal();
  return taal === "en";
}

export const H2 = ({ children }: { children: ReactNode }) => {
  const en = useVertaal();
  return (
    <h2 style={{ fontSize: 13, fontWeight: 800, color: "#264A61", margin: "18px 0 6px" }}>{vertaalNode(children, en)}</h2>
  );
};

export const P = ({ children }: { children: ReactNode }) => {
  const en = useVertaal();
  return (
    <p style={{ fontSize: 11.5, lineHeight: 1.65, color: "#4A7A9E", margin: "0 0 8px" }}>{vertaalNode(children, en)}</p>
  );
};

export const UL = ({ items }: { items: ReactNode[] }) => {
  const en = useVertaal();
  return (
    <ul style={{ margin: "0 0 8px", paddingLeft: 18 }}>
      {items.map((it, i) => (
        <li key={i} style={{ fontSize: 11.5, lineHeight: 1.65, color: "#4A7A9E", marginBottom: 3 }}>{vertaalNode(it, en)}</li>
      ))}
    </ul>
  );
};
