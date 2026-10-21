import { createFileRoute } from "@tanstack/react-router";
import { JuridischPagina, H2, P, UL } from "@/components/JuridischPagina";
import { LAATST_BIJGEWERKT } from "@/data/tekenData";

const title = "Toegankelijkheidsverklaring — TekenRisicoKaart en TekenbeetGids";
const description = "Toegankelijkheidsverklaring voor TekenRisicoKaart en TekenbeetGids volgens WCAG 2.2: status, maatregelen, bekende beperkingen en contact.";

export const Route = createFileRoute("/toegankelijkheidsverklaring")({
  head: () => ({ meta: [
    { title }, { name: "description", content: description },
    { property: "og:title", content: title }, { property: "og:description", content: description },
    { property: "og:type", content: "article" }, { name: "twitter:card", content: "summary" },
  ], links: [{ rel: "canonical", href: "https://tekenrisicokaart.nl/toegankelijkheidsverklaring" }] }),
  component: ToegankelijkheidsPagina,
});

function ToegankelijkheidsPagina() {
  return <JuridischPagina titel="Toegankelijkheidsverklaring" bijgewerkt={LAATST_BIJGEWERKT}>
    <P>TekenRisicoKaart en TekenbeetGids willen hun websites en web-apps bruikbaar maken voor iedereen, waaronder mensen met een visuele, motorische, auditieve of cognitieve beperking. Deze verklaring beschrijft onze aanpak op basis van WCAG 2.2, niveau AA.</P>
    <P>Wij sluiten vrijwillig aan bij de Europese richtlijn (EU) 2016/2102 over de toegankelijkheid van overheidswebsites en mobiele applicaties, de Nederlandse uitwerking daarvan (Tijdelijk besluit digitale toegankelijkheid overheid) en de norm EN 301 549. Als particuliere aanbieder zijn wij daartoe niet wettelijk verplicht; wij hanteren deze eisen als richtsnoer. Ook houden wij rekening met de Europese toegankelijkheidsakte (richtlijn (EU) 2019/882).</P>
    <H2>1. Huidige status</H2>
    <P>De toepassingen voldoen gedeeltelijk aan WCAG 2.2 niveau AA. Belangrijke onderdelen zijn met toetsenbord te bedienen, formulieren hebben labels, afbeeldingen hebben tekstalternatieven en pagina’s gebruiken herkenbare koppen en taalinstellingen. Een volledige onafhankelijke toegankelijkheidsaudit is nog niet afgerond.</P>
    <P>Toetsingsmethode: interne evaluatie op 23 september 2026, bestaande uit een handmatige controle van toetsenbordbediening, koppenstructuur, formulierlabels, kleurcontrast en schermlezerondersteuning, aangevuld met geautomatiseerde browsercontroles. Deze verklaring is op dezelfde datum opgesteld en wordt bij elke inhoudelijke wijziging herzien.</P>
    <H2>2. Maatregelen</H2>
    <UL items={["duidelijke focusvolgorde en zichtbare toetsenbordfocus;", "tekstalternatieven bij informatieve afbeeldingen en labels bij bedieningselementen;", "schaalbare schermindeling voor telefoon, tablet en desktop;", "ondersteuning voor schermlezers met semantische koppen, lijsten, formulieren en meldingen;", "geen essentiële informatie die uitsluitend door kleur wordt overgebracht;", "regelmatige controles bij inhoudelijke en technische wijzigingen."]} />
    <H2>3. Bekende beperkingen</H2>
    <UL items={["De interactieve kaart kan met vergroting of bepaalde schermlezers minder eenvoudig te bedienen zijn; dezelfde kerninformatie staat ook in tekstblokken en lijsten.", "Automatisch gemaakte PDF- en printoverzichten zijn mogelijk niet volledig geoptimaliseerd voor alle schermlezers.", "Sommige oudere bronafbeeldingen of externe pagina’s vallen buiten onze technische controle."]} />
    <H2>4. Hulp of een probleem melden</H2>
    <P>Kunt u informatie niet bereiken of gebruiken? Meld dit via het contactformulier onder Help. Beschrijf de pagina, het apparaat, de browser en wat u probeerde te doen. We streven ernaar binnen vijf werkdagen te reageren en waar mogelijk een toegankelijk alternatief te bieden.</P>
    <H2>5. Onderzoek en verbetering</H2>
    <P>Wij toetsen nieuwe onderdelen tijdens ontwikkeling en verbeteren bekende knelpunten stapsgewijs. Na een onafhankelijke audit werken wij deze verklaring bij met de precieze toetsingsmethode, datum en resultaten.</P>
  </JuridischPagina>;
}
