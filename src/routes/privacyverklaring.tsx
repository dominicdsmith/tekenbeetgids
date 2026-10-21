import { AI_VERWERKING } from "@/data/aiVerwerking";
import VerwerkersToelichting from "@/components/VerwerkersToelichting";
import BronnenToelichting from "@/components/BronnenToelichting";
import { useTaal } from "@/lib/taal";
import { createFileRoute } from "@tanstack/react-router";
import { JuridischPagina, H2, P, UL } from "@/components/JuridischPagina";
import { LAATST_BIJGEWERKT } from "@/data/tekenData";

const title = "Privacyverklaring — TekenRisicoKaart";
const description =
  "Privacyverklaring van TekenRisicoKaart volgens de AVG (GDPR): welke gegevens worden verwerkt, waarom, hoe lang en welke rechten u hebt.";

export const Route = createFileRoute("/privacyverklaring")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { name: "author", content: "Dominic Smith Advies" },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "article" },
      { property: "og:url", content: "https://tekenrisicokaart.nl/privacyverklaring" },
      { name: "twitter:card", content: "summary" },
    ],
    links: [{ rel: "canonical", href: "https://tekenrisicokaart.nl/privacyverklaring" }],
  }),
  component: PrivacyPagina,
});

function PrivacyPagina() {
  const en = useTaal() === "en";
  return (
    <JuridischPagina titel="Privacyverklaring" bijgewerkt={LAATST_BIJGEWERKT}>
      <P>
        Deze privacyverklaring legt uit hoe binnen de webapplicaties TekenRisicoKaart
        (tekenrisicokaart.nl) en TekenbeetGids (tekenbeetgids.nl) met persoonsgegevens wordt omgegaan. Wij verwerken persoonsgegevens in
        overeenstemming met de Algemene Verordening Gegevensbescherming (AVG/GDPR), de Uitvoeringswet AVG
        en de Telecommunicatiewet.
      </P>

      <H2>1. Verwerkingsverantwoordelijke</H2>
      <P>
        Dominic Smith Advies (KvK-nummer 01170115) is verwerkingsverantwoordelijke voor de verwerking van persoonsgegevens via TekenRisicoKaart en TekenbeetGids. Vragen of verzoeken over privacy kunt u stellen via het contactformulier onder Help. Kies daar het onderwerp privacyklacht of privacyverzoek. Het privacy-aanspreekpunt is de bevoegde beheerder van Dominic Smith Advies; een functionaris gegevensbescherming is bij deze omvang niet verplicht (art. 37 AVG).
      </P>
      <BronnenToelichting />
      <P>{en ? "These organisations publish their own source data. Dominic Smith Consultancy remains responsible for its selection, presentation and use of that information within these applications. These source organisations do not receive your wizard answers or photos simply because their information is cited." : "Deze organisaties publiceren hun eigen brongegevens. Dominic Smith Advies blijft verantwoordelijk voor de selectie, presentatie en het gebruik van die informatie in deze toepassingen. Deze bronorganisaties ontvangen niet uw wizardantwoorden of foto’s doordat hun informatie wordt aangehaald."}</P>

      <H2>2. Welke gegevens verwerken wij?</H2>
      <P>
        TekenRisicoKaart / TekenbeetGids is bewust privacyvriendelijk opgezet. U hoeft geen account aan te maken en wij vragen bij onderzoeksdeelname
        niet om uw naam of e-mailadres. Uw antwoorden in TekenbeetGids blijven op uw eigen apparaat; ze worden
        alleen beveiligd opgeslagen als u toestemming geeft voor deelname aan het wetenschappelijk onderzoek,
        onder een uniek deelnamenummer. Concreet gaat het om:
      </P>
      <UL
        items={[
          <>
            <b>Technische gegevens (gewone serverlogs van de hostingpartij Lovable Cloud van Lovable AB (Stockholm, Zweden, EU); database van Supabase, Inc. op AWS EU-servers in Ierland):</b> IP-adres, datum en tijd van het
            bezoek, opgevraagde pagina, browsertype en besturingssysteem. Deze gegevens zijn nodig om de
            applicatie te leveren en te beveiligen.
          </>,
          <>
            <b>Lokale voorkeuren op uw apparaat:</b> instellingen zoals de gekozen kaartlaag, de zoekterm en
            uw keuze in de cookiemelding. Deze worden opgeslagen in de lokale opslag (localStorage) van uw
            browser en worden niet naar ons verstuurd.
          </>,
          <>
            <b>Zoekopdrachten op plaatsnaam, gemeente of provincie:</b> deze worden volledig in uw browser
            verwerkt op basis van een lijst die met de website en web-app wordt meegeleverd. Er wordt geen zoekopdracht
            opgeslagen of naar een server gestuurd.
          </>,
          <>
            <b>Onderzoeksinzendingen na uw toestemming:</b> ingevulde gegevens over de tekenbeet, huidreactie, klachten,
            omstandigheden, eerdere tests en medicijnen, plus het overzicht en een uniek deelnamenummer. Zonder
            toestemming voor onderzoek wordt hiervan niets opgeslagen. Foto&apos;s worden nooit opgeslagen.
          </>,
        ]}
      />
      <P>
        In een onderzoeksinzending kunnen bijzondere persoonsgegevens, waaronder gezondheidsgegevens,
        voorkomen. De aanvullende <a href="/privacyverklaring-gezondheidsgegevens" style={{ color: "#2E7BA0", fontWeight: 700 }}>Privacyverklaring Gezondheidsgegevens</a> beschrijft doel, grondslag, toegang, beveiliging en rechten.
      </P>

      <H2>3. Doeleinden en grondslagen</H2>
      <UL
        items={[
          <>
            <b>Aanbieden en beveiligen van de applicatie</b> (technische logging) — grondslag: gerechtvaardigd
            belang (art. 6 lid 1 sub f AVG), namelijk een werkende en veilige dienst.
          </>,
          <>
            <b>Onthouden van uw voorkeuren</b> (lokale opslag) — grondslag: noodzakelijk voor de door u
            gevraagde dienst (strikt noodzakelijke opslag, art. 11.7a lid 3 Telecommunicatiewet).
          </>,
          <>
            <b>Eventuele statistieken</b> — worden uitsluitend geplaatst na uw toestemming (art. 6 lid 1 sub
            a AVG). Op dit moment gebruikt TekenRisicoKaart geen analytische of marketingcookies.
          </>,
        ]}
      />

      <H2>4. Fotoanalyse met kunstmatige intelligentie (AI)</H2>
      <P>
        In <strong>TekenbeetGids</strong> kunt u vrijwillig een foto van de beetplek of van de verwijderde
        teek laten vergelijken met referentiebeelden. Daarbij geldt:
      </P>
      <UL
        items={[
          "U gebruikt daarbij een AI-systeem. Conform artikel 50 van de Europese AI-verordening (Verordening (EU) 2024/1689) wordt u hierover vooraf en duidelijk geïnformeerd, zowel op deze pagina als bij de scan zelf.",
          "De foto wordt uitsluitend op uw initiatief eenmalig via een beveiligde verbinding ter analyse aangeboden aan een AI-dienst en wordt door ons niet opgeslagen.",
          "Foto's worden niet meegestuurd naar de onderzoeksdatabase en niet door ons gebruikt om AI-modellen te trainen; zij komen alleen voor in de samenvatting en de pdf op uw eigen toestel.",
"De uitkomst bevat een neutrale beschrijving van zichtbare kenmerken, een mogelijke referentiecategorie of tekensoort en een onzekerheidsindicatie. De vergelijking stelt geen diagnose of urgentie vast en geeft geen behandeladvies. De verwerking vindt plaats op grond van uw toestemming (art. 6 lid 1 sub a AVG en, voor zover een foto van een huidafwijking als gezondheidsgegeven kan gelden, art. 9 lid 2 sub a AVG).",
          "De AI-contactpersoon is werkzaam bij Dominic Smith Advies en kan worden gecontacteerd via het contactformulier onder Help.",
          "Wij nemen geen geautomatiseerde besluiten over u op basis van profielen (art. 22 AVG). De fotoanalyse levert uitsluitend een beschrijving van zichtbare kenmerken; er wordt geen automatisch besluit over u of uw gezondheid genomen.",
        ]}
      />

      <H2>5. Deelname aan wetenschappelijk onderzoek</H2>
      <P>
        In de <strong>TekenbeetGids</strong>-wegwijzer kunt u vrijwillig kiezen om uw ingevulde antwoorden en
        het gegenereerde rapport voor de huisarts beschikbaar te stellen voor wetenschappelijk onderzoek naar
        tekenbeten en tekenziekten in Nederland.
      </P>
      <UL
        items={[
          <>
            <b>Gepseudonimiseerd:</b> deelname is zonder direct identificerende gegevens. Er worden geen naam-, adres-, e-mail-, telefoon- of
            andere direct identificerende gegevens gevraagd of opgeslagen.
          </>,
          <>
            <b>Gezondheidsgegevens:</b> de antwoorden kunnen gezondheidsgegevens bevatten. De ingevulde antwoorden worden gepseudonimiseerd voordat ze worden
            opgeslagen. Foto's van de beetplek of teek worden niet meegestuurd naar de onderzoeksdatabase.
          </>,
          <>
            <b>Toestemming:</b> u geeft expliciet toestemming via een apart toestemmingsformulier voor deelname aan onderzoek. Een kopie van
            dit formulier wordt samen met de gepseudonimiseerde gegevens opgeslagen.
          </>,
          <>
            <b>Uniek deelnemernummer:</b> na akkoord ontvangt u een uniek nummer en een persoonlijke intrekcode.
            Bewaar beide als u later uw deelname wilt intrekken of een verzoek tot verwijdering wilt indienen.
          </>,
          <>
            <b>Onderzoeksgegevens (gepseudonimiseerd):</b> onderzoeksgegevens (gepseudonimiseerd) kunnen worden gedeeld met
            onderzoekers en organisaties, uitsluitend na een afzonderlijke beoordeling van de grondslag en waarborgen. Gepseudonimiseerde gegevens zijn niet volledig anoniem.
          </>,
          <>
            <b>Grondslag:</b> de verwerking vindt plaats op grond van uw toestemming (art. 6 lid 1 sub a en
            art. 9 lid 2 sub a AVG). U kunt uw toestemming op ieder moment intrekken.
          </>,
          <>
            <b>Publicaties:</b> eventuele onderzoeksresultaten worden uitsluitend geaggregeerd gepubliceerd
            en zijn nooit herleidbaar tot individuele deelnemers.
          </>,
        ]}
      />

      <H2>6. Cookies en vergelijkbare technieken</H2>
      <P>
        TekenRisicoKaart / TekenbeetGids plaatst geen tracking- of marketingcookies. Er wordt alleen gebruikgemaakt van
        strikt noodzakelijke lokale opslag. Lees hierover meer in het{" "}
        <a href="/cookiebeleid" style={{ color: "#2E7BA0", fontWeight: 700 }}>cookiebeleid</a>.
      </P>

      <H2>7. Bewaartermijnen</H2>
      <UL
        items={[
          "Technische logbestanden: maximaal 30 dagen, tenzij langer bewaren noodzakelijk is voor het onderzoeken van een beveiligingsincident.",
          "Lokale voorkeuren in uw browser: totdat u ze zelf verwijdert (browsergegevens wissen). De keuze in de cookiemelding wordt maximaal 12 maanden bewaard.",
          "Gepseudonimiseerde onderzoeksgegevens: maximaal vijf jaar, tenzij u eerder verzoekt om verwijdering via uw unieke deelnemernummer en de bijbehorende intrekcode.",
          "Een dagelijkse automatische opschoning verwijdert inzendingen ouder dan vijf jaar, technische controlelogs ouder dan 30 dagen en tijdelijke misbruikgegevens ouder dan één dag. Deze termijnen gelden voor verschillende gegevenscategorieën: tijdelijke misbruikgegevens (gehashte IP-adressen) worden binnen 24 uur verwijderd, overige technische controlelogs na 30 dagen. Verwijdering uit de primaire database betekent niet dat een gegeven onmiddellijk uit reeds gemaakte versleutelde back-ups verdwijnt; dat gebeurt zodra die back-up verloopt, uiterlijk na ongeveer drie maanden.",
          "Privacyklachten en bezwaarverzoeken die u laat bewaren in het aparte privacyregister: maximaal drie jaar, daarna automatisch verwijderd.",
        ]}
      />

      <H2>8. Ontvangers en verwerkers</H2>
      <P>Wij schakelen de volgende partijen in als verwerker:</P>
      <UL
        items={[
          "Lovable Cloud van Lovable AB (Stockholm, Zweden, EU; database van Supabase, Inc., gehost op AWS EU-servers in Ierland), als hostingpartij van de website, web-app en beveiligde database, uitsluitend voor levering en beveiliging;",
          AI_VERWERKING[en ? "en" : "nl"],
          "Gmail van Google Ireland Limited, voor e-mailmeldingen; een afgeschermde werkomgeving bij Google (verwerker, met verwerkersovereenkomst), voor het gepseudonimiseerde onderzoeksoverzicht.",
        ]}
      />
      <P>De werkomgeving bij Google is alleen bereikbaar voor de bevoegde beheerder, is beveiligd met tweefactorauthenticatie (2FA) en bevat zo min mogelijk persoonsgegevens: geen namen, e-mailadressen of foto's. De hoofddatabase in Lovable Cloud blijft de bronadministratie.</P>
      <P>Wekelijks wordt een versleutelde reservekopie (back-up) van de brongegevens bewaard in een afgeschermde werkomgeving bij Google (verwerker, met verwerkersovereenkomst). De back-up is versleuteld met een wachtzin die alleen de beheerder heeft. Contactberichten in de back-up kunnen een naam of e-mailadres bevatten. De laatste twaalf back-ups worden bewaard (ongeveer drie maanden); oudere back-ups worden automatisch gewist. Bij intrekking via de opt-out worden de brongegevens en de werkkopie direct gewist; in reeds gemaakte versleutelde back-ups verdwijnt een ingetrokken rij zodra die back-up verloopt.</P>
      <P>{AI_VERWERKING[en ? "en" : "nl"]}</P>

      <H2>8a. Leeftijd</H2>
      <P>
        Vanaf 16 jaar kunt u TekenbeetGids zelfstandig invullen en zelf toestemming geven voor deelname aan
        onderzoek. Bent u jonger, vul dit dan samen met een ouder of verzorger in; die geeft dan ook de
        toestemming (art. 8 AVG).
      </P>

      <H2>9. Doorgifte buiten de EER</H2>
      <P>{AI_VERWERKING[en ? "en" : "nl"]}</P>

      <H2>10. Beveiliging</H2>
      <P>
        Wij nemen passende technische en organisatorische maatregelen (art. 32 AVG), waaronder versleutelde
        verbindingen (HTTPS), beperkte toegang tot systemen en dataminimalisatie: gegevens die niet nodig zijn,
        worden niet verzameld.
      </P>

      <H2>11. Uw rechten</H2>
      <P>Op grond van de AVG heeft u onder meer recht op:</P>
      <UL
        items={[
          "inzage in uw persoonsgegevens (art. 15);",
          "rectificatie of verwijdering (art. 16 en 17);",
          "beperking van de verwerking (art. 18);",
          "dataportabiliteit (art. 20);",
          "bezwaar tegen verwerking op basis van gerechtvaardigd belang (art. 21);",
          "intrekking van een gegeven toestemming, zonder terugwerkende kracht (art. 7 lid 3).",
        ]}
      />
      <P>
        Omdat wij u niet op naam of e-mailadres identificeren, kan het zijn dat
        wij aanvullende informatie moeten vragen of een verzoek niet kunnen uitvoeren (art. 11 AVG).
        Stuur bij een verzoek over TekenbeetGids uw registratienummer mee. Heeft u deelgenomen aan onderzoek, stuur dan het afzonderlijke deelnemernummer en, als u die heeft bewaard, uw intrekcode mee.
      </P>
      <P>
        Wij behandelen een verzoek binnen één maand. Lukt dat niet, dan kunnen wij die termijn met twee
        maanden verlengen; wij laten u dat binnen de eerste maand weten (art. 12 lid 3 AVG).
      </P>

      <H2>12. Gebruikers van buiten Nederland</H2>
      <P>
        Deze verklaring geldt ook voor gebruikers van buiten Nederland die tijdens een vakantie, studie, werk of
        ander verblijf in Nederland een tekenbeet hebben opgelopen en TekenRisicoKaart of TekenbeetGids gebruiken.
        Ongeacht uw nationaliteit of land van herkomst heeft u dezelfde bescherming onder de AVG en dezelfde
        rechten. Ook buitenlandse gebruikers kunnen vrijwillig en gepseudonimiseerd deelnemen aan het wetenschappelijke
        onderzoek; deelname staat volledig los van uw verblijfsstatus.
      </P>
      <P>
        De medische verwijzingen in de applicatie, zoals de huisarts, gaan uit van de Nederlandse zorg. Neem bij
        klachten na terugkeer in uw eigen land contact op met uw eigen arts of reisverzekering.
      </P>

      <H2>13. Klachten</H2>
      <P>
        Bent u het niet eens met de manier waarop wij met uw gegevens omgaan? Neem dan contact met ons op. U
        heeft ook het recht een klacht in te dienen bij de Autoriteit Persoonsgegevens,{" "}
        <a href="https://www.autoriteitpersoonsgegevens.nl" target="_blank" rel="noopener noreferrer" style={{ color: "#2E7BA0", fontWeight: 700 }}>
          www.autoriteitpersoonsgegevens.nl
        </a>
        . Woont of verblijft u buiten Nederland, dan kunt u uw klacht ook indienen bij de privacytoezichthouder
        van uw eigen land.
      </P>
      <P>
        In het contactformulier onder Help kunt u als onderwerp een privacyklacht of een privacyverzoek kiezen. Daarbij
        staat een bewaaroptie: kiest u die, dan wordt uw klacht of bezwaar in een apart, afgeschermd privacyregister
        vastgelegd onder een eigen verzoeknummer, net zoals onderzoeksinzendingen onder een deelnemernummer worden
        bewaard. Dat register bevat uw naam, e-mailadres, de soort van uw verzoek, uw bericht en de status van de
        afhandeling. Alleen de bevoegde beheerder kan het teruglezen en het wordt na drie jaar automatisch opgeschoond.
        Kiest u de bewaaroptie niet, dan wordt uw bericht alleen als gewoon contactbericht afgehandeld.
      </P>

      <H2>14. Medische disclaimer</H2>
      <P>
        TekenRisicoKaart en TekenbeetGids bieden algemene voorlichting en registratie. Zij beoordelen geen individuele
        situatie, bepalen geen urgentie en geven geen diagnose of behandeling. Bespreek klachten of twijfel met uw huisarts.
      </P>

      <H2>14a. Verwerkingsregister en effectbeoordeling</H2>
      <P>
        Alle verwerkingen staan beschreven in het{" "}
        <a href="/verwerkingsregister" style={{ color: "#2E7BA0", fontWeight: 700 }}>verwerkingsregister</a> (artikel 30 AVG).
        Voor de onderzoeksinzendingen is een{" "}
        <a href="/gegevensbeschermingseffectbeoordeling" style={{ color: "#2E7BA0", fontWeight: 700 }}>gegevensbeschermingseffectbeoordeling (DPIA)</a>{" "}
        uitgevoerd. Beide documenten zijn opgezet met het oog op de Europese ruimte voor gezondheidsgegevens (EHDS) en een
        toekomstige Nederlandse toegangsinstantie voor gezondheidsgegevens (HDAB).
      
        {" "}Een overzicht in gewone taal van wat de toepassingen wel en niet doen staat in de{" "}
        <a href="/transparantieverklaring" style={{ color: "#2E7BA0", fontWeight: 700 }}>transparantieverklaring</a>.
      </P>

      <H2>15. Wijzigingen</H2>
      <P>
        Wij kunnen deze privacyverklaring aanpassen, bijvoorbeeld bij wijzigingen in de applicatie of in wet-
        en regelgeving. De actuele versie staat altijd op deze pagina.
      </P>
    <VerwerkersToelichting />
    </JuridischPagina>
  );
}
