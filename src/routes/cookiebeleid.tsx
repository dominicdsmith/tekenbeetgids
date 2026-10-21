import VerwerkersToelichting from "@/components/VerwerkersToelichting";
import { useTaal } from "@/lib/taal";
import { createFileRoute } from "@tanstack/react-router";
import { JuridischPagina, H2, P, UL } from "@/components/JuridischPagina";
import { LAATST_BIJGEWERKT } from "@/data/tekenData";

const title = "Cookiebeleid — TekenRisicoKaart";
const description =
  "Cookiebeleid van TekenRisicoKaart: welke cookies en lokale opslag worden gebruikt, waarom, en hoe u uw keuze aanpast (AVG en Telecommunicatiewet).";

export const Route = createFileRoute("/cookiebeleid")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { name: "author", content: "Dominic Smith Advies" },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "article" },
      { property: "og:url", content: "https://tekenrisicokaart.nl/cookiebeleid" },
      { name: "twitter:card", content: "summary" },
    ],
    links: [{ rel: "canonical", href: "https://tekenrisicokaart.nl/cookiebeleid" }],
  }),
  component: CookiePagina,
});

function CookiePagina() {
  const en = useTaal() === "en";
  return (
    <JuridischPagina titel="Cookiebeleid" bijgewerkt={LAATST_BIJGEWERKT}>
      <P>
        Dit cookiebeleid legt uit welke cookies en vergelijkbare technieken (zoals lokale opslag) worden
        gebruikt binnen TekenRisicoKaart / TekenbeetGids (tekenrisicokaart.nl en tekenbeetgids.nl). Wij volgen hierbij artikel 11.7a van de
        Telecommunicatiewet en de Algemene Verordening Gegevensbescherming (AVG/GDPR).
      </P>

      <H2>1. Wat zijn cookies?</H2>
      <P>
        Cookies zijn kleine tekstbestanden die bij een bezoek aan een website op uw apparaat worden geplaatst.
        Vergelijkbare technieken zijn bijvoorbeeld localStorage en sessionStorage, waarmee gegevens lokaal in uw
        browser worden bewaard.
      </P>

      <H2>2. Welke technieken gebruikt TekenRisicoKaart / TekenbeetGids?</H2>
      <P>
        TekenRisicoKaart / TekenbeetGids gebruikt <b>geen tracking-, advertentie- of profileringscookies</b> en deelt geen
        gegevens met advertentienetwerken of sociale media. Wij gebruiken uitsluitend strikt noodzakelijke
        lokale opslag:
      </P>
      <UL
        items={[
          <>
            <b>trk-cookie-keuze</b> (localStorage, max. 12 maanden) — onthoudt dat u de cookiemelding hebt
            gezien of uw keuze hebt gemaakt, zodat de melding niet elk bezoek terugkomt.
          </>,
          <>
            <b>Websitevoorkeuren</b> (localStorage) — bijvoorbeeld de gekozen kaartlaag of het geopende tabblad,
            zodat de website en web-app werkt zoals u verwacht.
          </>,
          <>
            <b>Offline-cache (service worker)</b> — bewaart pagina- en afbeeldingsbestanden zodat de website en web-app snel
            laadt en, wanneer u hem aan uw startscherm toevoegt, ook bij een slechte verbinding bruikbaar is.
          </>,
        ]}
      />
      <P>
        Voor strikt noodzakelijke opslag is volgens de Telecommunicatiewet geen toestemming vereist; wij
        informeren u erover via de cookiemelding en deze pagina.
      </P>

      <H2>3. Statistieken en toestemming</H2>
      <P>
        Op dit moment worden er geen analytische of statistiekcookies geplaatst. Mocht dit in de toekomst
        veranderen, dan gebeurt dat uitsluitend nadat u in de cookiemelding uitdrukkelijk toestemming hebt
        gegeven. U kunt die toestemming op elk moment intrekken zonder dat dit gevolgen heeft voor het gebruik
        van de website en web-app.
      </P>

      <H2>4. Uw keuze aanpassen of gegevens wissen</H2>
      <UL
        items={[
          "Verwijder de lokale gegevens via de instellingen van uw browser (browsergegevens/website-data wissen). Daarna verschijnt de cookiemelding opnieuw.",
          "In de meeste browsers kunt u cookies en lokale opslag ook per website blokkeren. Blokkeren kan ertoe leiden dat voorkeuren niet worden onthouden.",
          "Heeft u de web-app aan uw startscherm toegevoegd? Verwijder de web-app en voeg hem opnieuw toe om de offline-cache te wissen.",
        ]}
      />

      <H2>5. Persoonsgegevens</H2>
      <P>
        Hoe wij met (technische) persoonsgegevens omgaan, staat beschreven in de{" "}
        <a href="/privacyverklaring" style={{ color: "#2E7BA0", fontWeight: 700 }}>privacyverklaring</a>. Daar
        leest u ook welke rechten u hebt en hoe u een klacht kunt indienen bij de Autoriteit
        Persoonsgegevens.
      </P>
      <P>
        Foto’s die u voor een optionele AI-scan aanbiedt, blijven op uw eigen apparaat tot u de wizard reset of de
        pagina sluit. Alleen als u expliciet kiest voor een AI-scan, wordt de foto via onze server doorgestuurd naar
        een externe AI-dienst voor verwerking. Wij slaan de foto niet op, voegen hem niet toe aan het
        onderzoeksbestand en gebruiken hem niet om AI-modellen te trainen.
      </P>

      <H2>6. Wijzigingen</H2>
      <P>
        Wij kunnen dit cookiebeleid aanpassen wanneer de website en web-app of de wet- en regelgeving verandert. De actuele
        versie vindt u altijd op deze pagina.
      </P>
    <VerwerkersToelichting />
    </JuridischPagina>
  );
}
