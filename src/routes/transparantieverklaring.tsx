import { AI_VERWERKING } from "@/data/aiVerwerking";
import VerwerkersToelichting from "@/components/VerwerkersToelichting";
import BronnenToelichting from "@/components/BronnenToelichting";
import { createFileRoute } from "@tanstack/react-router";
import { JuridischPagina, H2, P, UL } from "@/components/JuridischPagina";
import { LAATST_BIJGEWERKT } from "@/data/tekenData";
import { useTaal } from "@/lib/taal";

const title = "Transparantieverklaring — TekenRisicoKaart en TekenbeetGids";
const description = "Wat TekenRisicoKaart en TekenbeetGids wel en niet doen: AI-gebruik, gegevensopslag, onderzoeksinzendingen, bronnen, financiering en contact.";

export const Route = createFileRoute("/transparantieverklaring")({
  head: () => ({ meta: [
    { title }, { name: "description", content: description },
    { property: "og:title", content: title }, { property: "og:description", content: description },
    { property: "og:type", content: "article" }, { name: "twitter:card", content: "summary" },
  ], links: [{ rel: "canonical", href: "https://tekenrisicokaart.nl/transparantieverklaring" }] }),
  component: TransparantiePagina,
});

function TransparantiePagina() {
  const en = useTaal() === "en";
  if (en) return <JuridischPagina titel="Transparantieverklaring" bijgewerkt={LAATST_BIJGEWERKT}>
    <P>In this statement we explain in plain language what TickRiskMap and Tick Bite Guide do, what they do not do and how we handle data, AI and sources. Both applications are published by Dominic Smith Consultancy.</P>
    <H2>1. What the applications are</H2>
    <UL items={["TickRiskMap provides information about tick bites and tick-borne diseases in the Netherlands, nationally and per province.", "Tick Bite Guide helps you, after a tick bite, to record your situation, view reliable information and see points of attention that you can discuss with your GP.", "The intended function is general information and recording, not diagnosis or treatment. A disclaimer alone does not determine whether software falls under Regulation (EU) 2017/745 (MDR). Independent assessment of its intended and actual operation, including AI features, remains necessary. The information does not replace assessment by a doctor."]} />
    <H2>2. Use of AI</H2>
    <P>With the tick and skin scan, your photo is compared once with reference images via Google (processor, under a data processing agreement), using the Gemini API over a secure connection. The outcome only describes visible features, a reference category and the degree of uncertainty. No automated decision-making takes place (Article 22 GDPR), and the wizard displays an AI notice before sending. This is not a declaration of full AI Act compliance. The AI contact person works at Dominic Smith Consultancy and can be reached via the contact form under Help.</P>
    <P>{AI_VERWERKING[en ? "en" : "nl"]}</P>
    <H2>3. What data we do and do not store</H2>
    <UL items={["The photo remains temporarily in browser memory for both reports and repeated PDF export until you reset the wizard or close the page. Dominic Smith Consultancy does not store the photo permanently or send it to the research file. Only after you choose AI comparison is the photo processed over a secure connection via Google (processor, under a data processing agreement), using the Gemini API.", "Answers in the wizard stay on your own device, unless you give consent to take part in research.", "Research submissions are only stored securely after consent, under a unique participant number, without name or e-mail address, and are automatically deleted after five years.", "Privacy complaints are only saved to a separate register when the retention option is selected, with name, email address, message and handling status.", "Only the authorised administrator of Dominic Smith Consultancy can read stored data back after secure login."]} />
    <H2>4. Accountability</H2>
    <P>All processing activities are described in the record of processing activities (Article 30 GDPR). A data protection impact assessment (DPIA, Article 35 GDPR) has been carried out for the research submissions. Both documents are publicly available via the links at the bottom of this page.</P>
    <H2>5. Sources and independence</H2>
    <BronnenToelichting />
    <P>The applications contain no advertising, do not sell data and are not funded by pharmaceutical or commercial parties. Source attribution does not imply that these organisations publish, endorse or independently assess the applications.</P>
    <H2>6. Service providers</H2>
    <P>{AI_VERWERKING[en ? "en" : "nl"]}</P>
    <H2>7. Questions or complaints</H2>
    <P>Do you have questions about this statement, or would you like to file a complaint? Use the contact form under Help. You can also lodge a complaint with the Dutch Data Protection Authority (Autoriteit Persoonsgegevens) or the data protection authority in your own country.</P>
  <VerwerkersToelichting />
    </JuridischPagina>;
  return <JuridischPagina titel="Transparantieverklaring" bijgewerkt={LAATST_BIJGEWERKT}>
    <P>In deze verklaring leggen wij in gewone taal uit wat TekenRisicoKaart en TekenbeetGids doen, wat ze niet doen en hoe wij met gegevens, AI en bronnen omgaan. Beide toepassingen worden uitgegeven door Dominic Smith Advies.</P>
    <H2>1. Wat de toepassingen zijn</H2>
    <UL items={["TekenRisicoKaart geeft informatie over tekenbeten en tekenbeetziekten in Nederland, landelijk en per provincie.", "TekenbeetGids helpt u na een tekenbeet uw situatie vast te leggen, betrouwbare informatie te bekijken en aandachtspunten te zien die u met uw huisarts kunt bespreken.", "De beoogde functie is algemene informatie en registratie, niet diagnose of behandeling. Een disclaimer bepaalt op zichzelf niet of software onder Verordening (EU) 2017/745 (MDR) valt. Een onafhankelijke beoordeling van de bedoelde en feitelijke werking, inclusief de AI-functies, blijft nodig. De informatie vervangt geen artsenbeoordeling."]} />
    <H2>2. Gebruik van AI</H2>
    <P>Bij de teek- en huidscan wordt uw foto eenmalig via een beveiligde verbinding via Google (verwerker, met verwerkersovereenkomst), met de Gemini API vergeleken met referentiebeelden. De uitkomst beschrijft alleen zichtbare kenmerken, een referentiecategorie en de mate van onzekerheid. Er vindt geen geautomatiseerde besluitvorming plaats (artikel 22 AVG) en vóór het versturen staat een duidelijke AI-melding in de wizard. Dit is geen verklaring van volledige naleving van de AI-verordening. De AI-contactpersoon is werkzaam bij Dominic Smith Advies en kan worden gecontacteerd via het contactformulier onder Help.</P>
    <P>{AI_VERWERKING[en ? "en" : "nl"]}</P>
    <H2>3. Welke gegevens wij wel en niet opslaan</H2>
    <UL items={["De foto blijft tijdelijk in het browsergeheugen voor beide rapporten en herhaalde pdf-export tot u de wizard reset of de pagina sluit. Dominic Smith Advies slaat de foto niet duurzaam op en stuurt deze niet naar het onderzoeksbestand. Alleen na uw keuze voor AI-vergelijking wordt de foto via een beveiligde verbinding verwerkt via Google (verwerker, met verwerkersovereenkomst), met de Gemini API.", "Antwoorden in de wizard blijven op uw eigen toestel, tenzij u toestemming geeft voor deelname aan onderzoek.", "Onderzoeksinzendingen worden alleen na toestemming beveiligd opgeslagen onder een uniek deelnamenummer, zonder naam of e-mailadres, en na vijf jaar automatisch verwijderd.", "Privacyklachten worden alleen met de bewaaroptie in een apart register vastgelegd, met naam, e-mailadres, bericht en afhandelstatus.", "Alleen de bevoegde beheerder van Dominic Smith Advies kan opgeslagen gegevens na veilig inloggen teruglezen."]} />
    <H2>4. Verantwoording</H2>
    <P>Alle verwerkingen staan beschreven in het verwerkingsregister (artikel 30 AVG). Voor de onderzoeksinzendingen is een gegevensbeschermingseffectbeoordeling (DPIA, artikel 35 AVG) uitgevoerd. Beide documenten staan openbaar via de links onderaan deze pagina.</P>
    <H2>5. Bronnen en onafhankelijkheid</H2>
    <BronnenToelichting />
    <P>De toepassingen bevatten geen advertenties, verkopen geen gegevens en worden niet door farmaceutische of commerciële partijen gefinancierd. Bronvermelding betekent niet dat deze organisaties de toepassingen uitgeven, onderschrijven of onafhankelijk beoordelen.</P>
    <H2>6. Dienstverleners</H2>
    <P>{AI_VERWERKING[en ? "en" : "nl"]}</P>
    <H2>7. Vragen of klachten</H2>
    <P>Heeft u vragen over deze verklaring, of wilt u een klacht indienen? Gebruik het contactformulier onder Help. U kunt ook een klacht indienen bij de Autoriteit Persoonsgegevens of de privacytoezichthouder in uw eigen land.</P>
  <VerwerkersToelichting />
    </JuridischPagina>;
}
