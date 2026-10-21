import { createFileRoute } from "@tanstack/react-router";
import { JuridischPagina, H2, P } from "@/components/JuridischPagina";
import { LAATST_BIJGEWERKT } from "@/data/tekenData";
import { useTaal } from "@/lib/taal";

const title = "Disclaimer — TekenRisicoKaart en TekenbeetGids";
const description = "Disclaimer voor TekenRisicoKaart en TekenbeetGids: algemene informatie, geen medische beoordeling, kaartgegevens en AI-vergelijkingen.";

export const Route = createFileRoute("/disclaimer")({
  head: () => ({ meta: [
    { title }, { name: "description", content: description },
    { property: "og:title", content: title }, { property: "og:description", content: description },
    { property: "og:type", content: "article" }, { name: "twitter:card", content: "summary" },
  ], links: [{ rel: "canonical", href: "https://tekenrisicokaart.nl/disclaimer" }] }),
  component: DisclaimerPagina,
});

function DisclaimerPagina() {
  const en = useTaal() === "en";
  return <JuridischPagina titel="Disclaimer" bijgewerkt={LAATST_BIJGEWERKT}>
    <H2>{en ? "1. Purpose of the websites and web apps" : "1. Doel van de websites en webapps"}</H2>
    <P>{en
      ? "TekenRisicoKaart and TekenbeetGids provide general information about ticks, tick bites and tick-borne diseases. TekenbeetGids also offers ways to record and organise information about a tick bite and its course. The content is intended for education and understanding, not for a personal medical assessment."
      : "TekenRisicoKaart en TekenbeetGids bieden algemene informatie over teken, tekenbeten en tekenbeetziekten. TekenbeetGids biedt daarnaast mogelijkheden om informatie over een tekenbeet en het verloop daarvan vast te leggen en te ordenen. De inhoud is bedoeld voor voorlichting en inzicht, niet voor een persoonlijke medische beoordeling."}</P>
    <H2>{en ? "2. No medical advice or diagnosis" : "2. Geen medisch advies of diagnose"}</H2>
    <P>{en
      ? "The information, questionnaires, maps, photo comparisons and records do not replace examination, diagnosis or advice from a qualified healthcare professional. They do not determine whether you have an infection, which treatment is appropriate or how urgently care is needed. Do not use an outcome to start, change or stop medication yourself, or to delay necessary care."
      : "De informatie, vragenlijsten, kaartweergaven, fotovergelijkingen en overzichten vervangen geen onderzoek, diagnose of advies van een bevoegde zorgverlener. Zij bepalen niet of u een infectie heeft, welke behandeling passend is of hoe dringend zorg nodig is. Gebruik een uitkomst niet om zelfstandig medicatie te starten, te wijzigen of te stoppen, of om noodzakelijke zorg uit te stellen."}</P>
    <P>{en
      ? "If you have questions or concerns about your health, you can contact a healthcare professional. Call 112 only in acute, serious or life-threatening situations."
      : "Bij vragen of zorgen over uw gezondheid kunt u contact opnemen met een zorgverlener. Bel 112 uitsluitend bij acute, ernstige of levensbedreigende situaties."}</P>
    <H2>{en ? "3. Meaning of the map" : "3. Betekenis van de kaart"}</H2>
    <P><strong>{en ? "This map provides area-based information, not an individual medical risk assessment." : "Deze kaart geeft gebiedsgebonden informatie en geen individuele medische risico-inschatting."}</strong>{" "}{en
      ? "Figures and classes describe data for an area, source or study period. A high class does not mean that your personal infection risk is high. A low class or the absence of reports does not rule out a tick bite or infection."
      : "Cijfers en klassen beschrijven gegevens over een gebied, bron of onderzoeksperiode. Een hoge klasse betekent niet dat uw persoonlijke infectierisico hoog is. Een lage klasse of het ontbreken van meldingen sluit een tekenbeet of infectie niet uit."}</P>
    <H2>{en ? "4. Photo comparisons and information assistant" : "4. Fotovergelijkingen en informatieassistent"}</H2>
    <P>{en
      ? "Optional AI scans can make mistakes. A tick comparison is not a definitive species identification. A skin photo comparison describes visible features only and does not make a diagnosis. If no feature is described, this does not mean that nothing is wrong."
      : "Optionele AI-scans kunnen fouten maken. Een teekvergelijking is geen definitieve soortidentificatie. Een huidfotovergelijking beschrijft uitsluitend zichtbare kenmerken en stelt geen diagnose. Als geen kenmerk wordt beschreven, betekent dit niet dat er niets aan de hand is."}</P>
    <P>{en
      ? "A photo is processed externally only after your separate confirmation. The information assistant selects previously reviewed website information and links, without an internet search function. The assistant does not provide a personal medical assessment and has no access to your completed guide answers, photos or research data."
      : "Externe verwerking van een foto vindt alleen plaats na uw afzonderlijke bevestiging. De informatieassistent selecteert vooraf gecontroleerde website-informatie en links, zonder internetzoekfunctie. De assistent geeft geen persoonlijke medische beoordeling en heeft geen toegang tot uw ingevulde gidsgegevens, foto's of onderzoeksgegevens."}</P>
    <H2>{en ? "5. Sources, currency and external links" : "5. Bronnen, actualiteit en externe links"}</H2>
    <P>{en
      ? "The content is based on cited public sources and scientific publications. Despite careful preparation, data may be incomplete, outdated or incorrect. Automatic source checks do not cover all sources and are not an independent medical content review. The respective providers are responsible for the content of and changes to external websites."
      : "De inhoud is gebaseerd op vermelde openbare bronnen en wetenschappelijke publicaties. Ondanks zorgvuldige samenstelling kunnen gegevens onvolledig, verouderd of onjuist zijn. Automatische broncontroles omvatten niet alle bronnen en zijn geen onafhankelijke medische inhoudscontrole. Voor inhoud en wijzigingen van externe websites zijn de betreffende aanbieders verantwoordelijk."}</P>
    <H2>{en ? "6. Records, privacy and responsibility" : "6. Overzichten, privacy en verantwoordelijkheid"}</H2>
    <P>{en
      ? "A record or PDF documents information provided and is not a medical opinion. Research participation is voluntary and requires separate explicit consent. The applicable privacy statements govern data processing and your rights; the terms of use govern use of the services."
      : "Een overzicht of PDF legt verstrekte informatie vast en is geen medisch oordeel. Onderzoeksdeelname is vrijwillig en vereist afzonderlijke uitdrukkelijke toestemming. Voor gegevensverwerking en uw rechten gelden de toepasselijke privacyverklaringen; voor gebruik gelden de gebruiksvoorwaarden."}</P>
    <P>{en
      ? "To the extent permitted by law, Dominic Smith Advies is not liable for damage caused by misuse or by treating general information as personal medical advice. This disclaimer does not limit statutory rights or liability that cannot lawfully be excluded."
      : "Dominic Smith Advies is, voor zover wettelijk toegestaan, niet aansprakelijk voor schade door onjuist gebruik of door het behandelen van algemene informatie als persoonlijk medisch advies. Deze disclaimer beperkt geen wettelijke rechten of aansprakelijkheid die niet rechtsgeldig kan worden uitgesloten."}</P>
    <P>{en
      ? "You can report inaccuracies or questions through the contact form under Help. Please do not include medical data or research files."
      : "Onjuistheden of vragen kunt u melden via het contactformulier onder Help. Stuur daarbij geen medische gegevens of onderzoeksbestanden mee."}</P>
    <P><em>{en
      ? "This disclaimer describes the boundaries of the services; it does not in itself prove compliance with privacy legislation or medical regulations."
      : "Deze disclaimer beschrijft de afbakening van de diensten; hij bewijst op zichzelf geen naleving van privacywetgeving of medische regelgeving."}</em></P>
  </JuridischPagina>;
}