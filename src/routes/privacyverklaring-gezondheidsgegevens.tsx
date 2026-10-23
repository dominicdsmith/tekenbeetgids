import { AI_VERWERKING } from "@/data/aiVerwerking";
import VerwerkersToelichting from "@/components/VerwerkersToelichting";
import { useTaal } from "@/lib/taal";
import { createFileRoute } from "@tanstack/react-router";
import { JuridischPagina, H2, P, UL } from "@/components/JuridischPagina";
import { LAATST_BIJGEWERKT } from "@/data/tekenData";

const title = "Privacyverklaring gezondheidsgegevens — TekenbeetGids";
const description = "Aanvullende privacyverklaring over de beveiligde verwerking van tekenbeet-, huidreactie- en gezondheidsgegevens in TekenbeetGids.";

export const Route = createFileRoute("/privacyverklaring-gezondheidsgegevens")({
  head: () => ({ meta: [
    { title }, { name: "description", content: description },
    { property: "og:title", content: title }, { property: "og:description", content: description },
    { property: "og:type", content: "article" }, { name: "twitter:card", content: "summary" },
  ], links: [{ rel: "canonical", href: "https://tekenbeetgids.nl/privacyverklaring-gezondheidsgegevens" }] }),
  component: GezondheidsprivacyPagina,
});

function GezondheidsprivacyPagina() {
  const en = useTaal() === "en";
  return <JuridischPagina titel="Privacyverklaring gezondheidsgegevens" bijgewerkt={LAATST_BIJGEWERKT}>
    <P>Deze aanvullende verklaring geldt voor gegevens die u in TekenbeetGids invult over een tekenbeet, huidreactie, klachten, eerdere tests, medicijnen en andere gezondheidscontext. Dit kunnen bijzondere persoonsgegevens zijn in de zin van artikel 9 AVG.</P>
    <H2>1. Verantwoordelijke en doel</H2>
    <P>Dominic Smith Advies (KvK-nummer 01170115) is verwerkingsverantwoordelijke. De gegevens worden verwerkt om uw registratie veilig vast te leggen, een persoonlijk feitelijk overzicht te maken en de continuïteit en beveiliging van de dienst te bewaken. De registratie wordt niet gebruikt voor diagnose, triage, behandeling, profilering, reclame of verkoop.</P>
    <H2>2. Welke gegevens worden opgeslagen?</H2>
    <UL items={["antwoorden over de tekenbeet, huidreactie, klachten en omstandigheden;", "door u ingevulde leeftijds-, woonplaats-, beroeps-, vaccinatie-, test- en medicijninformatie;", "de neutrale uitkomst van een eventuele visuele AI-vergelijking en het persoonlijke tekstoverzicht;", "taal, datum en een willekeurig registratienummer;", "een niet terug te rekenen hash van het netwerkadres, uitsluitend voor beveiliging en misbruikbeperking."]} />
    <P>De foto blijft tijdelijk in het browsergeheugen voor beide rapporten en herhaalde pdf-export tot u de wizard reset of de pagina sluit. Dominic Smith Advies slaat de foto niet duurzaam op en stuurt deze niet naar het onderzoeksbestand. Alleen na uw keuze voor AI-vergelijking wordt de foto via een beveiligde verbinding verwerkt via Google (verwerker, met verwerkersovereenkomst), met de Gemini API.</P>
    <H2>3. Wanneer wordt er opgeslagen? Grondslag</H2>
    <P>Er wordt niets automatisch opgeslagen. Uw antwoorden en het overzicht blijven op uw eigen apparaat, tenzij u het aparte toestemmingsformulier voor wetenschappelijk onderzoek accepteert. Alleen dán wordt de rapportage beveiligd opgeslagen onder een uniek deelnamenummer. Foto&rsquo;s worden nooit opgeslagen. Stopt u zonder toestemming te geven, dan verlaat er geen enkel antwoord uw apparaat.</P>
    <P>De grondslag voor die opslag is uw uitdrukkelijke toestemming (art. 6 lid 1 sub a en art. 9 lid 2 sub a AVG). U kunt die toestemming op elk moment intrekken via de opt-out onder Help, met uw deelnamenummer en uw intrekcode.</P>
    <H2>4. Wie heeft toegang?</H2>
    <P>Opgeslagen rapportages zijn niet openbaar en niet leesbaar voor andere bezoekers of gewone accounts. Alleen de bevoegde beheerder van Dominic Smith Advies kan ze na beveiligd inloggen teruglezen; dit is geen externe persoon of extern bedrijf. Rapportages worden niet naar een chat gestuurd; een vrijwillig gekozen AI-fotovergelijking gebruikt wel een externe AI-dienst.</P>
    <H2>4a. Ontvangers en verwerkers</H2>
    <UL items={["Lovable Cloud van Lovable AB (Stockholm, Zweden, EU; database van Supabase, Inc., gehost op AWS EU-servers in Ierland), als hostingpartij van de website en de beveiligde database, uitsluitend voor levering en beveiliging;", AI_VERWERKING[en ? "en" : "nl"], "Gmail van Google Ireland Limited, voor de e-mailmeldingen, en een afgeschermde werkomgeving bij Google (verwerker, met verwerkersovereenkomst), voor het gepseudonimiseerde onderzoeksoverzicht na uw toestemming."]} />
    <P>Wekelijks wordt een versleutelde reservekopie (back-up) van de brongegevens bewaard in een afgeschermde werkomgeving bij Google (verwerker, met verwerkersovereenkomst), versleuteld met een wachtzin die alleen de beheerder heeft. De laatste twaalf back-ups worden bewaard (ongeveer drie maanden); oudere back-ups worden automatisch gewist. Bij intrekking via de opt-out worden de brongegevens en de werkkopie direct gewist; in reeds gemaakte versleutelde back-ups verdwijnt een ingetrokken rij zodra die back-up verloopt.</P>
    <P>Volgens de publieke toelichting van Lovable geldt voor deze werkruimte geen aparte verwerkersovereenkomst; de gebruiksvoorwaarden en privacyverklaring van Lovable zijn leidend. Bewaartermijnen en eventuele doorgifte buiten de EER moeten nog onafhankelijk worden geverifieerd. Gegevens worden niet verkocht of verhandeld.</P>
    <H2>4b. Leeftijd</H2>
    <P>Vanaf 16 jaar kunt u TekenbeetGids zelfstandig invullen en zelf toestemming geven voor onderzoek. Bent u jonger, vul dit dan samen met een ouder of verzorger in; die geeft dan ook de toestemming.</P>
    <H2>5. Beveiliging en bewaartermijn</H2>
    <UL items={["versleutelde verbindingen (HTTPS) tijdens transport;", "rijbeveiliging en toegang op basis van een servergecontroleerde beheerderrol;", "geen directe publieke toegang tot lezen, wijzigen of verwijderen;", "invoercontrole, omvangbeperking en misbruikbeperking;", "bewaring gedurende maximaal vijf jaar; een dagelijkse automatische opschoning verwijdert oudere inzendingen, technische controlelogs na 30 dagen en tijdelijke misbruikgegevens na één dag;", "eerdere verwijdering op verzoek, via de opt-out met uw deelnamenummer en intrekcode;"]} />
    <H2>6. AI en foto’s</H2>
    <P>{AI_VERWERKING[en ? "en" : "nl"]}</P>
    <H2>7. Vrijwillig onderzoek staat los hiervan</H2>
    <P>Opslag gebeurt uitsluitend via vrijwillige onderzoeksdeelname. Alleen als u het aparte toestemmingsformulier voor onderzoek accepteert, wordt een gepseudonimiseerde inzending onder een uniek deelnamenummer opgeslagen. Foto&rsquo;s worden ook dan niet meegestuurd. Intrekken kan via de opt-out onder Help met uw deelnamenummer en intrekcode.</P>
    <H2>8. Gebruikers van buiten Nederland</H2>
    <P>Deze verklaring geldt ook voor gebruikers van buiten Nederland die tijdens een vakantie, studie, werk of ander verblijf in Nederland een tekenbeet hebben opgelopen en TekenbeetGids invullen. Ongeacht uw nationaliteit of land van herkomst heeft u dezelfde bescherming onder de AVG en dezelfde rechten. Ook buitenlandse gebruikers kunnen vrijwillig en gepseudonimiseerd deelnemen aan het wetenschappelijke onderzoek; deelname staat volledig los van uw verblijfsstatus.</P>
    <P>U kunt een klacht over de verwerking van uw gegevens behalve bij de Nederlandse Autoriteit Persoonsgegevens ook indienen bij de privacytoezichthouder van uw eigen land. De medische verwijzingen in TekenbeetGids, zoals de huisarts, gaan uit van de Nederlandse zorg; neem bij klachten na terugkeer contact op met uw eigen arts of reisverzekering.</P>
    <H2>9. Uw rechten</H2>
    <P>U kunt vragen om inzage, correctie, verwijdering, beperking, overdracht of intrekking van toestemming. Vermeld daarbij uw deelnamenummer. U kunt ook een klacht indienen bij de Autoriteit Persoonsgegevens of bij de privacytoezichthouder van uw eigen land.</P>
    <H2>10. Contact en privacy-aanspreekpunt</H2>
    <P>Privacyvragen en verzoeken kunt u stellen via het contactformulier onder Help. Kies daar het onderwerp privacyklacht of privacyverzoek. Het privacy-aanspreekpunt is de bevoegde beheerder van Dominic Smith Advies. Gezien de beperkte omvang en het ontbreken van grootschalige monitoring is een functionaris gegevensbescherming (art. 37 AVG) niet verplicht.</P>
    <H2>11. Apart privacyregister voor klachten en bezwaren</H2>
    <P>In het contactformulier kunt u als onderwerp een privacyklacht of privacyverzoek kiezen. Met de bewaaroptie daarbij wordt uw klacht of bezwaar vastgelegd in een apart, afgeschermd privacyregister met een eigen verzoeknummer, net zoals onderzoeksinzendingen onder een deelnamenummer worden bewaard. Dit register bevat uw naam, e-mailadres, soort verzoek, bericht en de status van de afhandeling; alleen de bevoegde beheerder kan het teruglezen en het wordt na drie jaar automatisch verwijderd. Zonder de bewaaroptie wordt uw bericht alleen als gewoon contactbericht afgehandeld.</P>
    <H2>12. Verwerkingsregister, DPIA, EHDS en HDAB</H2>
    <P>De volledige beschrijving van alle verwerkingen staat in het verwerkingsregister (art. 30 AVG). {en ? "An internal data protection impact assessment (DPIA, Article 35 GDPR) has been drafted for the research submissions. It incorporates the administrator's confirmation of the Gemini CDPA and SCCs and Google's published abuse-monitoring retention policy. Its conclusion remains provisional; this is not an independent audit or a guarantee of full GDPR compliance." : "Voor de onderzoeksinzendingen is een interne gegevensbeschermingseffectbeoordeling (DPIA, art. 35 AVG) opgesteld. Daarin zijn de beheerdersbevestiging van de Gemini-CDPA en SCC’s en Googles gepubliceerde bewaarbeleid voor misbruikcontrole verwerkt. De conclusie blijft voorlopig; dit is geen onafhankelijke audit of garantie van volledige AVG-naleving."} Beide documenten zijn zo opgezet dat aansluiting op de Europese ruimte voor gezondheidsgegevens (EHDS) en een toekomstige Nederlandse toegangsinstantie voor gezondheidsgegevens (HDAB) mogelijk blijft. Er worden op dit moment geen gegevens uitgewisseld met zorgverleners, zorgsystemen of onderzoeksinfrastructuren.</P>
  <VerwerkersToelichting />
    </JuridischPagina>;
}
