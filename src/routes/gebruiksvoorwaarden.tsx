import { AI_VERWERKING } from "@/data/aiVerwerking";
import VerwerkersToelichting from "@/components/VerwerkersToelichting";
import BronnenToelichting from "@/components/BronnenToelichting";
import { createFileRoute } from "@tanstack/react-router";
import { JuridischPagina, H2, P, UL } from "@/components/JuridischPagina";
import { LAATST_BIJGEWERKT } from "@/data/tekenData";
import { useTaal } from "@/lib/taal";

const title = "Gebruiksvoorwaarden — TekenRisicoKaart";
const description =
  "Gebruiksvoorwaarden van TekenRisicoKaart: gebruik van de website en web-app, medische disclaimer, aansprakelijkheid, intellectueel eigendom en toepasselijk Nederlands en EU-recht.";

export const Route = createFileRoute("/gebruiksvoorwaarden")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { name: "author", content: "Dominic Smith Advies" },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "article" },
      { property: "og:url", content: "https://tekenrisicokaart.nl/gebruiksvoorwaarden" },
      { name: "twitter:card", content: "summary" },
    ],
    links: [{ rel: "canonical", href: "https://tekenrisicokaart.nl/gebruiksvoorwaarden" }],
  }),
  component: VoorwaardenPagina,
});

function VoorwaardenPagina() {
  const en = useTaal() === "en";
  return (
    <JuridischPagina titel="Gebruiksvoorwaarden TekenRisicoKaart" bijgewerkt={LAATST_BIJGEWERKT}>
      <P>
        Deze gebruiksvoorwaarden zijn van toepassing op ieder gebruik van de webapplicaties TekenRisicoKaart
        en TekenbeetGids, bereikbaar via tekenrisicokaart.nl en tekenbeetgids.nl en als aan het startscherm toegevoegde web-app (hierna: de website en web-app). Door de
        website te openen of te gebruiken, aanvaardt u deze voorwaarden. Gebruik de website en web-app niet als u niet met deze
        voorwaarden akkoord gaat.
      </P>

      <H2>1. Aanbieder</H2>
      <P>
        De website en web-app wordt aangeboden door Dominic Smith Advies (hierna: de aanbieder), gevestigd in Nederland, KvK-nummer 01170115.
      </P>
      <BronnenToelichting />




      <H2>2. Doel van de website en web-app</H2>
      <P>
        De website en web-app geeft algemene, indicatieve informatie over tekenrisico's, tekensoorten, tekenbeetziekten,
        seizoensinvloeden en preventie in Nederland. De weergegeven risiconiveaus zijn schattingen op basis van
        openbare gegevens en modelmatige inzichten; zij zeggen niets over het risico op een specifieke plek of
        op een specifiek moment.
      </P>
      <P>
        TekenbeetGids is een gids na een tekenbeet: een educatieve vragenlijst die ingevoerde informatie over een
        tekenbeet en huidreactie ordent tot een persoonlijk overzicht. De toepassing helpt gebruikers die informatie vast
        te leggen, toont algemene aandachtspunten en bewaart het overzicht voor eigen gebruik. Zij bepaalt niet of
        afwachten volstaat, stelt geen diagnose of urgentie vast en kiest geen behandeling.
      </P>

      <H2>3. Medische disclaimer</H2>
      <P>
        De beoogde functie is algemene informatie en registratie, niet diagnose of behandeling. Een disclaimer bepaalt op zichzelf niet of software onder Verordening (EU) 2017/745 (MDR) valt. Een onafhankelijke beoordeling van de bedoelde en feitelijke werking, inclusief de AI-functies, blijft nodig. De informatie vervangt geen artsenbeoordeling.
      </P>
      <UL
        items={[
          "Heeft u klachten na een tekenbeet (zoals een rode ring, koorts, griepachtige verschijnselen of neurologische klachten)? Neem contact op met uw huisarts.",
          "Bij spoedeisende klachten belt u 112 of de huisartsenpost.",
          "Baseer medische beslissingen nooit uitsluitend op de informatie in deze website en web-app.",
        ]}
      />

      <H2>4. Toegestaan gebruik</H2>
      <UL
        items={[
          "U gebruikt de website en web-app uitsluitend voor eigen, niet-commercieel informatief gebruik, tenzij schriftelijk anders is overeengekomen.",
          "U verstoort de werking, beschikbaarheid of beveiliging van de website en web-app niet, en verschaft u geen ongeautoriseerde toegang.",
          "Geautomatiseerd grootschalig uitlezen (scraping), herpublicatie of het opnieuw aanbieden van de website en web-app of haar gegevens als eigen dienst is niet toegestaan zonder voorafgaande schriftelijke toestemming.",
          "U gebruikt de website en web-app niet in strijd met Nederlands of Europees recht, of op een wijze die schade of hinder veroorzaakt voor anderen.",
        ]}
      />

      <H2>5. Deelname aan wetenschappelijk onderzoek</H2>
      <P>
        Via <strong>TekenbeetGids</strong> kunt u vrijwillig uw ingevulde antwoorden en het rapport voor de huisarts
        beschikbaar stellen voor wetenschappelijk onderzoek naar tekenbeten en tekenziekten in Nederland.
      </P>
      <UL
        items={[
          "Deelname is vrijwillig. Gezondheidsgegevens worden gepseudonimiseerd opgeslagen onder een deelnamenummer, zonder naam of e-mailadres. Indirecte herkenbaarheid door combinatie van gegevens blijft mogelijk.",
          "U geeft expliciet toestemming via een digitaal toestemmingsformulier voor deelname aan onderzoek. Een kopie van dit formulier wordt opgeslagen bij de gepseudonimiseerde onderzoeksgegevens.",
          "Na akkoord ontvangt u een uniek deelnemernummer en een persoonlijke intrekcode. Bewaar beide; u hebt ze nodig om uw deelname later in te trekken of voor een verzoek tot inzage of verwijdering.",
          en ? "After consent, pseudonymised data is stored in Lovable Cloud, with a research copy in a shielded environment at Google (processor, under a data processing agreement). Only the authorised administrator can read it through the application. A weekly encrypted backup of the source data is kept in a shielded environment at Google; it is encrypted with a passphrase held only by the administrator, the last twelve backups are kept (about three months) and older ones are deleted automatically." : "De gepseudonimiseerde gegevens worden na toestemming in Lovable Cloud opgeslagen, met een onderzoekskopie in een afgeschermde werkomgeving bij Google (verwerker, met verwerkersovereenkomst). Alleen de bevoegde beheerder kan ze via de toepassing teruglezen. Wekelijks wordt een versleutelde reservekopie (back-up) van de brongegevens bewaard in een afgeschermde werkomgeving bij Google; die is versleuteld met een wachtzin die alleen de beheerder heeft, de laatste twaalf back-ups worden bewaard (ongeveer drie maanden) en oudere worden automatisch gewist.",
          en ? "Sharing for new research requires a separate prior assessment of the legal basis, consent and safeguards; pseudonymised data is not fully anonymous." : "Delen voor nieuw onderzoek vereist vooraf een afzonderlijke beoordeling van grondslag, toestemming en waarborgen; gepseudonimiseerde gegevens zijn niet volledig anoniem.",
          "De aanbieder is niet aansprakelijk voor beslissingen of publicaties van derden die gebruikmaken van de gepseudonimiseerde onderzoeksgegevens.",
        ]}
      />

      <H2>6. Beschikbaarheid en wijzigingen</H2>
      <P>
        De website en web-app wordt aangeboden "as is" en "as available". De aanbieder mag de website en web-app, de inhoud en deze
        voorwaarden op ieder moment wijzigen, tijdelijk opschorten of beëindigen. Bij inhoudelijk belangrijke
        wijzigingen van deze voorwaarden wordt de datum bovenaan deze pagina bijgewerkt.
      </P>

      <H2>7. Juistheid van de informatie</H2>
      <P>
        De aanbieder stelt de informatie met zorg samen, maar geeft geen garantie dat deze volledig, actueel of
        foutloos is. Cijfers, risiconiveaus en meldingen kunnen verouderen of afwijken van andere bronnen.
        Externe links naar bijvoorbeeld tekenbeetziekten.nl, lymevereniging.nl, RIVM, Tekenradar.nl, WUR, ECDC of
        GGD-websites vallen buiten de verantwoordelijkheid van de aanbieder.


      </P>

      <H2>8. Aansprakelijkheid</H2>
      <P>
        Voor zover wettelijk toegestaan is de aanbieder niet aansprakelijk voor schade die voortvloeit uit het
        gebruik van, of het vertrouwen op, de website en web-app of de daarin opgenomen informatie, waaronder indirecte schade,
        gevolgschade, gemiste besparingen of gezondheidsschade. Deze beperking geldt niet bij opzet of bewuste
        roekeloosheid van de aanbieder, noch bij aansprakelijkheid die op grond van dwingend Nederlands recht
        (waaronder productaansprakelijkheid en letsel- of overlijdensschade) niet kan worden uitgesloten.
      </P>

      <H2>9. Intellectueel eigendom</H2>
      <P>
        De namen TekenRisicoKaart en TekenbeetGids, de domeinen tekenrisicokaart.nl en tekenbeetgids.nl, de software, de broncode, de vormgeving en de
        opbouw van de website en web-app zijn intellectueel eigendom van Dominic Smith Advies. Het auteursrecht op de gebruikte
        data en gegevens berust bij de betreffende partijen die eigenaar zijn van die data en gegevens.
        Verveelvoudiging, openbaarmaking of hergebruik is zonder voorafgaande schriftelijke toestemming van de
        rechthebbende niet toegestaan, behoudens wettelijke uitzonderingen zoals het citaatrecht.
      </P>


      <H2>10. Privacy en cookies</H2>
      <P>
        De website en web-app verwerkt zo min mogelijk persoonsgegevens en gebruikt geen tracking- of advertentiecookies. Zie
        de privacyverklaring en het cookiebeleid, opgesteld volgens de Algemene verordening gegevensbescherming
        (AVG/GDPR) en artikel 11.7a van de Telecommunicatiewet.
      </P>
      <P>
        In het contactformulier onder Help kunt u een privacyklacht of privacyverzoek indienen. Met de bewaaroptie bij dat
        formulier wordt uw klacht of bezwaar vastgelegd in een apart, afgeschermd privacyregister met een eigen
        verzoeknummer, net als de onderzoeksinzendingen onder een deelnemernummer. Alleen de bevoegde beheerder kan dit
        teruglezen; na drie jaar wordt het automatisch verwijderd. De volledige beschrijving staat in het{" "}
        <a href="/verwerkingsregister" style={{ color: "#2E7BA0", fontWeight: 700 }}>verwerkingsregister</a> en in de{" "}
        <a href="/gegevensbeschermingseffectbeoordeling" style={{ color: "#2E7BA0", fontWeight: 700 }}>gegevensbeschermingseffectbeoordeling</a>.
      
        {" "}Een overzicht in gewone taal van wat de toepassingen wel en niet doen staat in de{" "}
        <a href="/transparantieverklaring" style={{ color: "#2E7BA0", fontWeight: 700 }}>transparantieverklaring</a>.
      </P>

      <H2>11. Consumentenrechten</H2>
      <P>
        De website en web-app is kosteloos en er wordt geen overeenkomst op afstand tot levering van betaalde diensten
        gesloten. Dwingendrechtelijke consumentenbescherming op grond van Nederlands en EU-recht blijft
        onverkort van toepassing. Klachten kunt u melden via de contactgegevens in de privacyverklaring; komen
        we er niet uit, dan kunt u als consument in de EU ook gebruikmaken van geschilbeslechting via de
        bevoegde instanties.
      </P>

      <H2>12. Toepasselijk recht en bevoegde rechter</H2>
      <P>
        Op deze voorwaarden en op ieder gebruik van de website en web-app is Nederlands recht van toepassing, met inachtneming
        van dwingend EU-recht. Geschillen worden voorgelegd aan de bevoegde Nederlandse rechter, tenzij dwingend
        recht een andere rechter aanwijst.
      </P>

      <H2>13. Legitimiteit, veiligheid en herkomst</H2>
      <P>
        TekenRisicoKaart en TekenbeetGids zijn legitieme, publieke voorlichtingswebsites over teken en tekenbeetziekten in
        Nederland. De websites worden beheerd door Dominic Smith Advies, ingeschreven in het Nederlandse handelsregister onder
        KvK-nummer 01170115, en zijn bereikbaar via de officiële domeinen tekenrisicokaart.nl en tekenbeetgids.nl.
      </P>
      <UL
        items={[
          "Wij vragen nooit om betalingsgegevens, wachtwoorden, inloggegevens of andere vertrouwelijke informatie.",
          "Wij verkopen geen producten of diensten en sturen geen ongevraagde e-mails, berichten of facturen.",
          "De websites gebruiken uitsluitend HTTPS-verbindingen en plaatsen geen tracking-, advertentie- of marketingcookies.",
          en ? "The sources and limitations of automatic checks are described in section 1 of these terms. Source attribution does not imply endorsement or independent assessment of the applications by those organisations." : "De bronnen en beperkingen van automatische controles staan in onderdeel 1 van deze voorwaarden. Bronvermelding betekent niet dat deze organisaties de toepassingen onderschrijven of onafhankelijk beoordelen.",
          "Deelname is vrijwillig en betreft gepseudonimiseerde gezondheidsgegevens, zonder direct identificerende gegevens.",
          "Vragen of meldingen over de legitimiteit of veiligheid van deze websites kunt u indienen via het contactformulier onder Help.",
        ]}
      />
      <P>
        Wordt een van deze domeinen onterecht door antivirussoftware of een reputatiedienst gemarkeerd als frauduleus of
        onbetrouwbaar? Gebruik dan het false-positive formulier van de betreffende dienst en verwijs naar deze pagina. Wij
        werken mee aan een snelle heroverweging van de markering.
      </P>

      <H2>14. Kunstmatige intelligentie (AI)</H2>
      <AiIntro />
      <UL
        items={[
          "Conform artikel 50 van de Europese AI-verordening (Verordening (EU) 2024/1689) wordt u vooraf duidelijk geïnformeerd dat u met een AI-systeem interageert.",
          "De uitkomst van de vergelijking bevat een neutrale beschrijving van zichtbare kenmerken, een mogelijke referentiecategorie of tekensoort en een onzekerheidsindicatie. Zij bevat geen diagnose, urgentiescore, behandeladvies of individuele zorgbeslissing.",
          "De AI-vergelijking is niet bedoeld als medisch hulpmiddel en er worden geen geautomatiseerde beslissingen genomen die voor u rechtsgevolgen hebben (art. 22 AVG).",
AI_VERWERKING[en ? "en" : "nl"],
          "De AI-contactpersoon is werkzaam bij Dominic Smith Advies en kan worden gecontacteerd via het contactformulier onder Help.",
        ]}
      />
    <VerwerkersToelichting />
    </JuridischPagina>
  );
}

function AiIntro() {
  const en = useTaal() === "en";
  return en
    ? <P>Within <strong>Tick Bite Guide</strong> you can voluntarily have a photo of the bite site or of the removed tick compared with reference images by an artificial intelligence (AI) system.</P>
    : <P>Binnen <strong>TekenbeetGids</strong> kunt u vrijwillig een foto van de beetplek of van de verwijderde teek laten vergelijken met referentiebeelden door een systeem voor kunstmatige intelligentie (AI).</P>;
}
