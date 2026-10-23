import { AI_BEWARING, AI_VERWERKING } from "@/data/aiVerwerking";
import VerwerkersToelichting from "@/components/VerwerkersToelichting";
import { createFileRoute } from "@tanstack/react-router";
import { JuridischPagina } from "@/components/JuridischPagina";
import { LAATST_BIJGEWERKT } from "@/data/tekenData";
import { useTaal } from "@/lib/taal";

const title = "Verwerkingsregister — TekenRisicoKaart en TekenbeetGids";
const description = "Register van verwerkingsactiviteiten (artikel 30 AVG) van TekenRisicoKaart en TekenbeetGids: doelen, grondslagen, ontvangers en bewaartermijnen.";

export const Route = createFileRoute("/verwerkingsregister")({
  head: () => ({ meta: [
    { title }, { name: "description", content: description },
    { property: "og:title", content: title }, { property: "og:description", content: description },
    { property: "og:type", content: "article" }, { name: "twitter:card", content: "summary" },
  ], links: [{ rel: "canonical", href: "https://tekenrisicokaart.nl/verwerkingsregister" }] }),
  component: VerwerkingsregisterPagina,
});

const KOP = { fontSize: 13, fontWeight: 800, color: "#264A61", margin: "18px 0 6px" } as const;
const TEKST = { fontSize: 11.5, lineHeight: 1.65, color: "#4A7A9E", margin: "0 0 8px" } as const;
const LIJST = { margin: "0 0 8px", paddingLeft: 18 } as const;
const ITEM = { fontSize: 11.5, lineHeight: 1.65, color: "#4A7A9E", marginBottom: 3 } as const;

type Rij = { nl: string; en: string };
type Activiteit = { titel: Rij; regels: [Rij, Rij][] };

const L = (nl: string, en: string): Rij => ({ nl, en });

const ALGEMEEN: Rij[] = [
  L(
    "Dit register beschrijft de verwerkingsactiviteiten van TekenRisicoKaart en TekenbeetGids volgens artikel 30 van de Algemene verordening gegevensbescherming (AVG/GDPR). Het wordt bijgewerkt bij elke inhoudelijke wijziging van de website of web-app.",
    "This record describes the processing activities of TekenRisicoKaart and TekenbeetGids in accordance with Article 30 of the General Data Protection Regulation (GDPR). It is updated whenever the website or web app changes substantively.",
  ),
  L(
    "Verwerkingsverantwoordelijke: Dominic Smith Advies, gevestigd in Nederland en bereikbaar via het contactformulier onder Help. Privacy-aanspreekpunt: de bevoegde beheerder van Dominic Smith Advies. Een functionaris voor gegevensbescherming is niet verplicht (artikel 37 AVG); er vindt geen grootschalige of stelselmatige monitoring plaats.",
    "Controller: Dominic Smith Consultancy, established in the Netherlands and reachable through the contact form under Help. Privacy point of contact: the authorised administrator of Dominic Smith Consultancy. A data protection officer is not required (Article 37 GDPR); no large-scale or systematic monitoring takes place.",
  ),
];

const ACTIVITEITEN: Activiteit[] = [
  {
    titel: L("1. Websitebezoek en technische werking", "1. Website visits and technical operation"),
    regels: [
      [L("Doel", "Purpose"), L("De website en web-app veilig en werkend aanbieden, misbruik tegengaan en storingen oplossen.", "Providing the website and web app securely and reliably, preventing abuse and resolving malfunctions.")],
      [L("Betrokkenen", "Data subjects"), L("Bezoekers van de website en gebruikers van de web-app.", "Visitors to the website and users of the web app.")],
      [L("Gegevens", "Data"), L("Technische gegevens zoals het versleutelde (gehashte) IP-adres, browsertype en tijdstip; lokale voorkeuren zoals taal en cookiekeuze blijven op het eigen toestel.", "Technical data such as the hashed IP address, browser type and time; local preferences such as language and cookie choice remain on the user's own device.")],
      [L("Grondslag", "Legal basis"), L("Gerechtvaardigd belang (artikel 6 lid 1 sub f AVG): veiligheid en beschikbaarheid.", "Legitimate interest (Article 6(1)(f) GDPR): security and availability.")],
      [L("Ontvangers", "Recipients"), L("Lovable Cloud van Lovable AB (Stockholm, Zweden, EU; database van Supabase, Inc., gehost op AWS EU-servers in Ierland) als hostingpartij en verwerker; geen adverteerders, geen trackingdiensten.", "Lovable Cloud van Lovable AB (Stockholm, Sweden, EU; database by Supabase, Inc., hosted on AWS EU servers in Ireland) as hosting provider and processor; no advertisers, no tracking services.")],
      [L("Bewaartermijn", "Retention"), L("Technische logbestanden maximaal 30 dagen; misbruikbeperking maximaal 24 uur. Verwijdering gebeurt automatisch.", "Technical log files for a maximum of 30 days; abuse-limitation data for a maximum of 24 hours. Deletion happens automatically.")],
    ],
  },
  {
    titel: L("2. Contactformulier", "2. Contact form"),
    regels: [
      [L("Doel", "Purpose"), L("Vragen, correcties en meldingen beantwoorden.", "Answering questions, corrections and reports.")],
      [L("Betrokkenen", "Data subjects"), L("Personen die zelf contact opnemen.", "People who contact us themselves.")],
      [L("Gegevens", "Data"), L("Naam, e-mailadres, gekozen onderwerp, bericht, gehasht IP-adres en browsergegevens.", "Name, e-mail address, chosen subject, message, hashed IP address and browser details.")],
      [L("Grondslag", "Legal basis"), L("Gerechtvaardigd belang (artikel 6 lid 1 sub f AVG): beantwoorden van een eigen verzoek.", "Legitimate interest (Article 6(1)(f) GDPR): responding to a request the person made themselves.")],
      [L("Ontvangers", "Recipients"), L("Gmail van Google Ireland Limited (beveiligde e-mail) en Lovable Cloud van Lovable AB (Stockholm, Zweden, EU; database van Supabase, Inc. op AWS EU-servers in Ierland) als hostingpartij, beide als verwerker.", "Gmail of Google Ireland Limited (secure e-mail) and Lovable Cloud van Lovable AB (Stockholm, Sweden, EU; database by Supabase, Inc. on AWS EU servers in Ireland) as hosting provider, both as processors.")],
      [L("Bewaartermijn", "Retention"), L("Zolang nodig voor de afhandeling en de onderbouwing daarvan; daarna verwijderd.", "As long as needed to handle the message and account for it; deleted afterwards.")],
    ],
  },
  {
    titel: L("3. Privacyregister: klachten en bezwaarverzoeken", "3. Privacy register: complaints and objection requests"),
    regels: [
      [L("Doel", "Purpose"), L("Privacyklachten, bezwaren en verzoeken om inzage, correctie of verwijdering aantoonbaar en tijdig afhandelen (artikelen 12 tot en met 22 AVG).", "Handling privacy complaints, objections and requests for access, correction or deletion demonstrably and on time (Articles 12 to 22 GDPR).")],
      [L("Betrokkenen", "Data subjects"), L("Personen die een privacyklacht of privacyverzoek indienen en daarbij kiezen voor bewaren.", "People who submit a privacy complaint or request and choose to have it stored.")],
      [L("Gegevens", "Data"), L("Verzoeknummer, soort verzoek, naam, e-mailadres, bericht, taal, status, gehasht IP-adres en de verwijzing naar het contactbericht.", "Request number, type of request, name, e-mail address, message, language, status, hashed IP address and the reference to the contact message.")],
      [L("Grondslag", "Legal basis"), L("Wettelijke verplichting en verantwoordingsplicht (artikel 6 lid 1 sub c en artikel 5 lid 2 AVG), op basis van de expliciete keuze van de indiener.", "Legal obligation and accountability (Article 6(1)(c) and Article 5(2) GDPR), based on the explicit choice of the person submitting.")],
      [L("Ontvangers", "Recipients"), L("Uitsluitend de bevoegde beheerder van Dominic Smith Advies; Lovable Cloud van Lovable AB (Stockholm, Zweden, EU; database van Supabase, Inc. op AWS EU-servers in Ierland) als hostingpartij en verwerker.", "Only the authorised administrator of Dominic Smith Consultancy; Lovable Cloud van Lovable AB (Stockholm, Sweden, EU; database by Supabase, Inc. on AWS EU servers in Ireland) as hosting provider and processor.")],
      [L("Bewaartermijn", "Retention"), L("Maximaal 3 jaar in een apart, afgeschermd bestand; daarna automatisch verwijderd.", "A maximum of 3 years in a separate, shielded file; deleted automatically afterwards.")],
    ],
  },
  {
    titel: L("4. Onderzoeksinzendingen TekenbeetGids", "4. TekenbeetGids research submissions"),
    regels: [
      [L("Doel", "Purpose"), L("Wetenschappelijk en statistisch onderzoek naar tekenbeten, huidreacties en tekenbeetziekten in Nederland.", "Scientific and statistical research into tick bites, skin reactions and tick-borne diseases in the Netherlands.")],
      [L("Betrokkenen", "Data subjects"), L("Gebruikers die na afronding uitdrukkelijk toestemming geven voor deelname aan onderzoek.", "Users who give explicit consent for research participation after completing the questions.")],
      [L("Gegevens", "Data"), L("Antwoorden over de teek, de beetplek, omgeving, klachten, behandeling en het gegenereerde overzicht, opgeslagen onder een uniek deelnemernummer. Foto's worden nooit opgeslagen en nooit meegestuurd.", "Answers about the tick, the bite site, surroundings, symptoms, treatment and the generated overview, stored under a unique participant number. Photos are never stored and never sent along.")],
      [L("Grondslag", "Legal basis"), L("Uitdrukkelijke toestemming voor gezondheidsgegevens (artikel 6 lid 1 sub a en artikel 9 lid 2 sub a AVG), met wetenschappelijk onderzoek als context (artikel 89 AVG).", "Explicit consent for health data (Article 6(1)(a) and Article 9(2)(a) GDPR), in the context of scientific research (Article 89 GDPR).")],
      [L("Ontvangers", "Recipients"), L("De bevoegde beheerder; Lovable Cloud van Lovable AB (Stockholm, Zweden, EU; database van Supabase, Inc. op AWS EU-servers in Ierland) als hostingpartij en verwerker; een afgeschermde werkomgeving bij Google (verwerker, met verwerkersovereenkomst) met uitsluitend gepseudonimiseerde kopieën. Wekelijks wordt een versleutelde reservekopie (back-up) van de brongegevens bewaard in een afgeschermde werkomgeving bij Google, versleuteld met een wachtzin die alleen de beheerder heeft; de laatste twaalf back-ups worden bewaard (ongeveer drie maanden) en oudere worden automatisch gewist.", "The authorised administrator; Lovable Cloud van Lovable AB (Stockholm, Sweden, EU; database by Supabase, Inc. on AWS EU servers in Ireland) as hosting provider and processor; a shielded environment at Google (processor, under a data processing agreement) containing only pseudonymised copies. A weekly encrypted backup of the source data is kept in a shielded environment at Google, encrypted with a passphrase held only by the administrator; the last twelve backups are kept (about three months) and older ones are deleted automatically.")],
      [L("Bewaartermijn", "Retention"), L("Maximaal 5 jaar; daarna automatisch verwijderd. Intrekken kan eerder met het deelnemernummer en de bijbehorende intrekcode.", "A maximum of 5 years; deleted automatically afterwards. Withdrawal is possible earlier using the participant number and the matching withdrawal code.")],
    ],
  },
  {
    titel: L("5. Vrijwillige AI-fotovergelijking", "5. Optional AI photo comparison"),
    regels: [
      [L("Doel", "Purpose"), L("Een foto van een teek of huidreactie vergelijken met referentiemateriaal en zichtbare kenmerken beschrijven. Er wordt geen diagnose, urgentie of zorgbeslissing bepaald.", "Comparing a photo of a tick or skin reaction with reference material and describing visible characteristics. No diagnosis, urgency or care decision is determined.")],
      [L("Betrokkenen", "Data subjects"), L("Gebruikers die zelf een foto kiezen of maken.", "Users who choose or take a photo themselves.")],
      [L("Gegevens", "Data"), L("De foto blijft tijdelijk in het browsergeheugen voor beide rapporten en herhaalde pdf-export tot u de wizard reset of de pagina sluit. Dominic Smith Advies slaat de foto niet duurzaam op en stuurt deze niet naar het onderzoeksbestand. Alleen na uw keuze voor AI-vergelijking wordt de foto via een beveiligde verbinding verwerkt via Google (verwerker, met verwerkersovereenkomst), met de Gemini API.", "The photo remains temporarily in browser memory for both reports and repeated PDF export until you reset the wizard or close the page. Dominic Smith Consultancy does not store the photo permanently or send it to the research file. Only after you choose AI comparison is the photo processed over a secure connection via Google (processor, under a data processing agreement), using the Gemini API.")],
      [L("Grondslag", "Legal basis"), L("Uitdrukkelijke toestemming (artikel 6 lid 1 sub a en artikel 9 lid 2 sub a AVG); transparantieplicht volgens artikel 50 van de AI-verordening.", "Explicit consent (Article 6(1)(a) and Article 9(2)(a) GDPR); transparency obligation under Article 50 of the AI Act.")],
      [L("Ontvangers", "Recipients"), L("De AI-dienst als verwerker, uitsluitend voor deze eenmalige vergelijking.", "The AI service as processor, solely for this one-off comparison.")],
      [L("Bewaartermijn", "Retention"), L(`Geen duurzame foto-opslag door Dominic Smith Advies. Tijdelijk browsergeheugen tot reset. Een foto-hash en de gestructureerde uitkomst worden maximaal 24 uur gecachet; geen foto. ${AI_BEWARING.nl}`, `No permanent photo storage by Dominic Smith Consultancy. Temporary browser memory until reset. A photo hash and the structured result are cached for up to 24 hours; no photo. ${AI_BEWARING.en}`)],
    ],
  },
  {
    titel: L("6. Beheer, beveiliging en databroncontrole", "6. Administration, security and source-data checks"),
    regels: [
      [L("Doel", "Purpose"), L("Beveiligingsscans, controle van openbare bronnen en beheer van de toepassing.", "Security scans, checks of public sources and administration of the application.")],
      [L("Betrokkenen", "Data subjects"), L("De beheerder; geen bezoekersgegevens.", "The administrator; no visitor data.")],
      [L("Gegevens", "Data"), L("Inloggegevens van de beheerder, scanresultaten en controlelogs over openbare cijfers.", "Administrator login data, scan results and check logs about public figures.")],
      [L("Grondslag", "Legal basis"), L("Gerechtvaardigd belang (artikel 6 lid 1 sub f AVG): betrouwbaarheid en beveiliging.", "Legitimate interest (Article 6(1)(f) GDPR): reliability and security.")],
      [L("Ontvangers", "Recipients"), L("Lovable Cloud van Lovable AB (Stockholm, Zweden, EU; database van Supabase, Inc. op AWS EU-servers in Ierland) als hostingpartij en Gmail van Google Ireland Limited (meldingsmail) als verwerkers.", "Lovable Cloud van Lovable AB (Stockholm, Sweden, EU; database by Supabase, Inc. on AWS EU servers in Ireland) as hosting provider and Gmail of Google Ireland Limited (notification e-mail) as processors.")],
      [L("Bewaartermijn", "Retention"), L("Controlelogs maximaal 30 dagen; scanoverzichten maximaal 2 jaar.", "Check logs for a maximum of 30 days; scan overviews for a maximum of 2 years.")],
    ],
  },
];

const SLOT: [Rij, Rij[]][] = [
  [
    L("Beveiliging en doorgifte", "Security and transfers"),
    [
      L(AI_VERWERKING.nl, AI_VERWERKING.en),
    ],
  ],
  [
    L("Geen geautomatiseerde besluitvorming", "No automated decision-making"),
    [
      L("Er vindt geen geautomatiseerde besluitvorming of profilering met rechtsgevolgen plaats (artikel 22 AVG). De toepassing ordent informatie en bepaalt geen diagnose, urgentie of behandeling.", "No automated decision-making or profiling with legal effects takes place (Article 22 GDPR). The application organises information and does not determine any diagnosis, urgency or treatment."),
    ],
  ],
  [
    L("Voorbereiding op EHDS en HDAB", "Preparation for EHDS and HDAB"),
    [
      L("De onderzoeksinzendingen worden gestructureerd en met eenduidige velden opgeslagen, zodat ze later kunnen aansluiten op de Europese ruimte voor gezondheidsgegevens (EHDS, verordening (EU) 2025/327) en op een toekomstige Nederlandse toegangsinstantie voor gezondheidsgegevens (HDAB).", "Research submissions are stored in a structured way with unambiguous fields, so that they can later connect to the European Health Data Space (EHDS, Regulation (EU) 2025/327) and to a future Dutch health data access body (HDAB)."),
      L("Secundair gebruik van gegevens vindt uitsluitend plaats op basis van uitdrukkelijke toestemming en onder een deelnemernummer, gescheiden van direct herleidbare gegevens. Er worden nu geen gegevens uitgewisseld met zorgverleners, zorgsystemen of onderzoeksinfrastructuren.", "Secondary use of data takes place solely on the basis of explicit consent and under a participant number, separated from directly identifiable data. No data is currently exchanged with healthcare providers, care systems or research infrastructures."),
      L("Bij aansluiting op EHDS of HDAB worden vooraf een verwerkersovereenkomst, een bijgewerkte effectbeoordeling en een openbare toelichting toegevoegd.", "Before connecting to EHDS or HDAB, a processor agreement, an updated impact assessment and a public explanation will be added."),
    ],
  ],
];

function VerwerkingsregisterPagina() {
  const en = useTaal() === "en";
  const t = (r: Rij) => (en ? r.en : r.nl);

  return (
    <JuridischPagina titel="Verwerkingsregister" bijgewerkt={LAATST_BIJGEWERKT}>
      {ALGEMEEN.map((r, i) => (
        <p key={i} style={TEKST}>{t(r)}</p>
      ))}
      {ACTIVITEITEN.map((a) => (
        <div key={a.titel.nl}>
          <h2 style={KOP}>{t(a.titel)}</h2>
          <ul style={LIJST}>
            {a.regels.map(([label, waarde]) => (
              <li key={label.nl} style={ITEM}>
                <strong>{t(label)}:</strong> {t(waarde)}
              </li>
            ))}
          </ul>
        </div>
      ))}
      {SLOT.map(([titel, regels]) => (
        <div key={titel.nl}>
          <h2 style={KOP}>{t(titel)}</h2>
          {regels.map((r, i) => (
            <p key={i} style={TEKST}>{t(r)}</p>
          ))}
        </div>
      ))}
    <VerwerkersToelichting />
    </JuridischPagina>
  );
}
