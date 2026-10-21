export type AssistentContext = "kaart" | "gids";
type Tekst = { nl: string; en: string };
const t = (nl: string, en: string): Tekst => ({ nl, en });
export type AssistentOnderwerp = {
  id: string;
  context: AssistentContext | "beide";
  titel: Tekst;
  vragen: { vraag: Tekst; antwoord: Tekst }[];
  link: { pad: string; titel: Tekst; kaart?: boolean };
};
export const ASSISTENT_ONDERWERPEN: AssistentOnderwerp[] = [
  {
    id: "kaart",
    context: "kaart",
    titel: t("Kaartkleuren en cijfers", "Map colours and figures"),
    vragen: [
      {
        vraag: t("Wat betekenen de kaartkleuren?", "What do the map colours mean?"),
        antwoord: t(
          "De kleuren tonen gebiedsgebonden klassen op basis van de geselecteerde gegevens. Deze kaart geeft gebiedsgebonden informatie en geen individuele medische risico-inschatting. Een hoge klasse betekent niet dat uw persoonlijke infectierisico hoog is.",
          "Colours show area-level classes based on the selected data. This map provides area-level information, not an individual medical risk assessment. A high class does not mean that your personal infection risk is high.",
        ),
      },
      {
        vraag: t("Zijn alle cijfers vergelijkbaar?", "Are all figures comparable?"),
        antwoord: t(
          "Nee. Tekenbeten, ziektegevallen, onderzoekspercentages en bevestigde tekenvondsten hebben verschillende bronnen, perioden en berekeningen. De uitleg bij de kaart en bij elke bron vermeldt wat het cijfer beschrijft.",
          "No. Tick bites, disease cases, research percentages and confirmed tick findings have different sources, time periods and calculations. The map explanation and source notes describe what each figure represents.",
        ),
      },
    ],
    link: {
      pad: "/?tab=help#help-kaartkleuren",
      kaart: true,
      titel: t("Uitleg over kaartklassen", "Map class explanation"),
    },
  },
  {
    id: "gebieden",
    context: "kaart",
    titel: t("Provincies en gemeenten", "Provinces and municipalities"),
    vragen: [
      {
        vraag: t(
          "Waar vind ik mijn provincie of gemeente?",
          "Where can I find my province or municipality?",
        ),
        antwoord: t(
          "Provincies en Gemeenten tonen de beschikbare gebiedscijfers. De zoekbalk zoekt ook op plaatsnamen. De cijfers beschrijven het gebied, niet uw persoonlijke situatie.",
          "Provinces and Municipalities show available area figures. The search bar also accepts place names. Figures describe the area, not your personal situation.",
        ),
      },
      {
        vraag: t("Wat betekent een TBE-vindplaats?", "What does a TBE finding location mean?"),
        antwoord: t(
          "Een bekende TBE-vindplaats is een locatie waarvoor de vermelde bron bewijs beschrijft. Niet elke menselijke melding is opgelopen in de woonprovincie. Geen vermelde vindplaats betekent niet dat TBE is uitgesloten.",
          "A known TBE finding location is a location for which the cited source describes evidence. Human cases were not necessarily acquired in the province of residence. No listed finding does not rule out TBE.",
        ),
      },
    ],
    link: { pad: "/?tab=gem", kaart: true, titel: t("Gemeenten bekijken", "View municipalities") },
  },
  {
    id: "meldingen",
    context: "kaart",
    titel: t("Tekenmeldingen", "Tick reports"),
    vragen: [
      {
        vraag: t("Wat betekenen de D- en H-stippen?", "What do the D and H dots mean?"),
        antwoord: t(
          "D staat voor Vlekkenteek en H voor Reuzenteek. Een stip toont een bevestigde historische vondst, met een locatie bij benadering en een bron. Het is geen aantal teken, ziektegeval of live overzicht. Rode TBE-stippen tonen bekende TBE-vindplaatsen.",
          "D indicates the ornate dog tick and H the giant tick. A dot shows a confirmed historical finding with an approximate location and source. It is not a tick count, disease case or live overview. Red TBE dots show known TBE finding locations.",
        ),
      },
      {
        vraag: t("Waar kan ik een bijzondere teek melden?", "Where can I report an unusual tick?"),
        antwoord: t(
          "Bij de soorten in Tekenmeldingen staat een koppeling naar het officiële NVWA-meldformulier. De NVWA verzamelt meldingen om de verspreiding van deze tekensoorten te volgen.",
          "Species entries in Tick reports link to the official NVWA reporting form. The NVWA collects reports to monitor the distribution of these tick species.",
        ),
      },
    ],
    link: {
      pad: "/?tab=tekenmeldingen",
      kaart: true,
      titel: t("Tekenmeldingen bekijken", "View tick reports"),
    },
  },
  {
    id: "gids",
    context: "gids",
    titel: t("Vragenlijst en overzicht", "Questionnaire and record"),
    vragen: [
      {
        vraag: t("Wat doet TekenbeetGids?", "What does Tick Bite Guide do?"),
        antwoord: t(
          "De gids ordent feitelijke informatie die u zelf invult over een tekenbeet en het verloop daarvan. Het overzicht is voor uzelf of om met een arts te delen. De gids stelt geen diagnose, bepaalt geen urgentie en adviseert geen behandeling.",
          "The guide organises factual information you enter about a tick bite and its course. The record is for you or to share with a doctor. The guide does not diagnose, determine urgency or recommend treatment.",
        ),
      },
      {
        vraag: t(
          "Kan ik de gids zonder onderzoek gebruiken?",
          "Can I use the guide without joining research?",
        ),
        antwoord: t(
          "Ja. Onderzoeksdeelname is vrijwillig en vraagt afzonderlijke, uitdrukkelijke toestemming. U kunt uw overzicht en PDF gebruiken zonder aan onderzoek mee te doen.",
          "Yes. Research participation is voluntary and requires separate, explicit consent. You can use your record and PDF without joining research.",
        ),
      },
    ],
    link: {
      pad: "/?tab=help#help-tekenbeetgids",
      kaart: true,
      titel: t("Uitleg over de gids", "Guide explanation"),
    },
  },
  {
    id: "foto",
    context: "gids",
    titel: t("Foto’s en AI-vergelijking", "Photos and AI comparison"),
    vragen: [
      {
        vraag: t("Wanneer wordt mijn foto verstuurd?", "When is my photo sent?"),
        antwoord: t(
          "Een gekozen foto blijft lokaal totdat u een optionele AI-scan start en de aparte bevestiging voor externe verwerking via Google AI Studio / Gemini API accepteert. Alleen het openen of annuleren van die bevestiging verstuurt geen foto. Onderzoekstoestemming staat hier los van.",
          "A selected photo stays local until you start an optional AI scan and accept the separate confirmation for external processing via Google AI Studio / Gemini API. Opening or cancelling that confirmation does not send a photo. Research consent is separate.",
        ),
      },
      {
        vraag: t("Geeft de vergelijking een diagnose?", "Does the comparison give a diagnosis?"),
        antwoord: t(
          "Nee. De vergelijking beschrijft zichtbare kenmerken of een mogelijke tekensoort met vaste uitkomsten. Ze stelt geen diagnose en bepaalt geen infectiekans of behandeling. Foto’s gaan niet naar het onderzoek. Wij gebruiken foto’s en scanuitkomsten zelf niet voor AI-training; de externe voorwaarden worden afzonderlijk beoordeeld.",
          "No. Comparison describes visible features or a possible tick species using fixed outcomes. It does not diagnose or determine infection probability or treatment. Photos are excluded from research. We do not use photos or scan results ourselves for AI training; external terms are assessed separately.",
        ),
      },
    ],
    link: {
      pad: "/transparantieverklaring",
      titel: t("Transparantie en AI-gebruik", "Transparency and AI use"),
    },
  },
  {
    id: "pdf",
    context: "gids",
    titel: t("PDF en afdrukken", "PDF and printing"),
    vragen: [
      {
        vraag: t("Waar vind ik mijn PDF?", "Where can I find my PDF?"),
        antwoord: t(
          "De PDF- en afdrukknoppen staan bij uw overzicht in de gids. Het document wordt op uw toestel gemaakt; u kiest zelf of u het opslaat, afdrukt of deelt.",
          "PDF and print controls are available with your record in the guide. The document is generated on your device; you choose whether to save, print or share it.",
        ),
      },
      {
        vraag: t(
          "Blijven foto’s beschikbaar voor een tweede PDF?",
          "Are photos available for a second PDF?",
        ),
        antwoord: t(
          "Foto’s bij het tussentijdse overzicht blijven tijdelijk in het geheugen van de app voor bekijken en herhaalde PDF-exports, totdat u de gids opnieuw begint. Ze worden niet duurzaam door de app opgeslagen. Een PDF die u zelf bewaart kan de foto’s wel bevatten.",
          "Photos in the interim record remain temporarily in app memory for viewing and repeat PDF exports until you restart the guide. The app does not store them durably. A PDF you save yourself may contain the photos.",
        ),
      },
    ],
    link: {
      pad: "/?tab=help#help-tekenbeetgids",
      kaart: true,
      titel: t("Uitleg over overzicht en PDF", "Record and PDF explanation"),
    },
  },
  {
    id: "onderzoek",
    context: "beide",
    titel: t("Onderzoek en intrekken", "Research and withdrawal"),
    vragen: [
      {
        vraag: t("Welke gegevens gaan naar onderzoek?", "Which data is used for research?"),
        antwoord: t(
          "Alleen na uw afzonderlijke uitdrukkelijke toestemming worden de ingevulde onderzoeksgegevens gepseudonimiseerd opgeslagen. Foto’s gaan niet mee. Gepseudonimiseerd is niet hetzelfde als volledig anoniem. De privacyverklaring beschrijft de opslag en uw rechten.",
          "Only after your separate explicit consent are the entered research data stored in pseudonymised form. Photos are excluded. Pseudonymised is not the same as fully anonymous. The privacy statement describes storage and your rights.",
        ),
      },
      {
        vraag: t("Hoe trek ik mijn deelname in?", "How do I withdraw my participation?"),
        antwoord: t(
          "Gebruik het intrekformulier onder Help bij Deelnemen aan onderzoek. U hebt uw deelnamenummer en persoonlijke intrekcode nodig. Zonder code volgt handmatige controle via het contactformulier. Intrekken verwijdert geen gegevens uit al gemaakte versleutelde back-ups; die verdwijnen wanneer de back-ups verlopen.",
          "Use the withdrawal form under Help in Research participation. You need your participant number and personal withdrawal code. Without the code, manual verification through the contact form is required. Withdrawal does not remove data from existing encrypted backups; they disappear when those backups expire.",
        ),
      },
    ],
    link: {
      pad: "/?tab=help#help-onderzoek",
      kaart: true,
      titel: t("Onderzoek en intrekformulier", "Research and withdrawal form"),
    },
  },
  {
    id: "privacy",
    context: "beide",
    titel: t("Privacy en contact", "Privacy and contact"),
    vragen: [
      {
        vraag: t("Kan deze assistent mijn gegevens zien?", "Can this assistant see my data?"),
        antwoord: t(
          "Deze informatieassistent heeft geen toegang tot uw ingevulde gidsantwoorden, foto’s of onderzoeksgegevens. Bij een vrije vraag wordt de tekst van dit gesprek via Google AI Studio / Gemini API verwerkt om een gecontroleerd website-antwoord te kiezen. De app bewaart het gesprek niet; sluiten wist het gesprek. Externe bewaartermijnen zijn niet bevestigd. Stuur geen medische of persoonlijke gegevens mee.",
          "This information assistant has no access to your guide answers, photos or research data. For a typed question, the text of this conversation is processed through Google AI Studio / Gemini API to select a reviewed website answer. The app does not save the conversation; closing clears it. External retention periods have not been confirmed. Please do not include medical or personal data.",
        ),
      },
      {
        vraag: t(
          "Waar kan ik een vraag of correctie doorgeven?",
          "Where can I send a question or correction?",
        ),
        antwoord: t(
          "Het contactformulier staat onder Help. Stuur geen medische gegevens, klachten of symptomen, diagnoses, medicatie of onderzoeksbestanden mee. Privacyverzoeken kunt u daar ook indienen; de privacyverklaring beschrijft uw rechten.",
          "The contact form is under Help. Please do not include medical data, complaints or symptoms, diagnoses, medication or research files. You can also submit privacy requests there; the privacy statement describes your rights.",
        ),
      },
    ],
    link: {
      pad: "/?tab=help#help-contact",
      kaart: true,
      titel: t("Contactformulier", "Contact form"),
    },
  },
  {
    id: "bronnen",
    context: "beide",
    titel: t("Bronnen en verantwoording", "Sources and accountability"),
    vragen: [
      {
        vraag: t("Waar komt de informatie vandaan?", "Where does the information come from?"),
        antwoord: t(
          "De website verwijst naar openbare bronnen en wetenschappelijke publicaties. Bron, periode en beperkingen worden bij de gegevens uitgelegd. De gedeelde bronverantwoording staat in de transparantieverklaring.",
          "The website refers to public sources and scientific publications. Sources, time periods and limitations are explained alongside the data. Shared source accountability is available in the transparency statement.",
        ),
      },
      {
        vraag: t(
          "Garandeert automatische controle dat alles klopt?",
          "Does automatic checking guarantee accuracy?",
        ),
        antwoord: t(
          "Nee. Automatische controles kunnen veranderingen en technische problemen signaleren, maar vervangen geen inhoudelijke beoordeling. Een bereikbaar bronadres betekent niet dat alle informatie actueel of volledig is.",
          "No. Automatic checks can flag changes and technical issues, but do not replace a content review. A reachable source address does not mean that all information is current or complete.",
        ),
      },
    ],
    link: {
      pad: "/transparantieverklaring",
      titel: t("Bronnen en transparantie", "Sources and transparency"),
    },
  },
  {
    id: "website",
    context: "beide",
    titel: t("Zo werkt de website", "How the website works"),
    vragen: [
      {
        vraag: t("Wat kan ik op deze website vinden?", "What can I find on this website?"),
        antwoord: t(
          "De website heeft twee delen: TekenRisicoKaart met gebiedsgebonden kaartinformatie over teken, tekenbeten en tekensoorten, en TekenbeetGids met een educatieve vragenlijst en logboek na een tekenbeet. Onder Help staat uitleg per onderdeel. Deze kaart geeft gebiedsgebonden informatie en geen individuele medische risico-inschatting.",
          "The website has two parts: TekenRisicoKaart with area-level map information about ticks, tick bites and tick species, and TekenbeetGids with an educational questionnaire and record after a tick bite. Help explains each part. This map provides area-level information, not an individual medical risk assessment.",
        ),
      },
      {
        vraag: t(
          "Hoe wissel ik tussen Nederlands en Engels?",
          "How do I switch between Dutch and English?",
        ),
        antwoord: t(
          "Met de taalknop bovenin wisselt u tussen Nederlands en Engels. Als u bij de cookievoorkeuren voorkeuren laat onthouden, blijft uw taalkeuze bewaard voor uw volgende bezoek.",
          "Use the language button at the top to switch between Dutch and English. If you allow remembering preferences in the cookie preferences, your language choice is kept for your next visit.",
        ),
      },
    ],
    link: { pad: "/?tab=help", kaart: true, titel: t("Uitleg onder Help", "Explanation under Help") },
  },
  {
    id: "cookies",
    context: "beide",
    titel: t("Cookies en voorkeuren", "Cookies and preferences"),
    vragen: [
      {
        vraag: t("Welke cookiekeuzes kan ik maken?", "Which cookie choices can I make?"),
        antwoord: t(
          "In de cookievoorkeuren kiest u tussen: strikt noodzakelijk (altijd aan), voorkeuren onthouden en statistieken. Het scherm opent bij uw eerste bezoek. Dit gesprek met de assistent valt buiten die keuzes: het wordt niet in uw browser opgeslagen.",
          "In the cookie preferences you choose between: strictly necessary (always on), remember preferences and statistics. The screen opens on your first visit. This assistant conversation falls outside those choices: it is not stored in your browser.",
        ),
      },
      {
        vraag: t("Kan ik mijn keuze later wijzigen?", "Can I change my choice later?"),
        antwoord: t(
          "Ja. Met het ronde schildknopje linksonder in beeld opent u de cookievoorkeuren opnieuw en past u uw keuze aan. Het cookiebeleid beschrijft wat elke categorie doet.",
          "Yes. The round shield button in the bottom-left corner opens the cookie preferences again, where you can adjust your choice. The cookie policy describes what each category does.",
        ),
      },
    ],
    link: { pad: "/cookiebeleid", titel: t("Cookiebeleid", "Cookie policy") },
  },
  {
    id: "verklaringen",
    context: "beide",
    titel: t("Voorwaarden en verklaringen", "Terms and statements"),
    vragen: [
      {
        vraag: t("Welke documenten zijn er?", "Which documents are available?"),
        antwoord: t(
          "De gebruiksvoorwaarden, de privacyverklaring, de verklaring over gezondheidsgegevens, de transparantieverklaring, de toegankelijkheidsverklaring, het verwerkingsregister, de gegevensbeschermingseffectbeoordeling en het cookiebeleid. Ze zijn in het Nederlands en Engels beschikbaar en u kunt ze als PDF opslaan.",
          "Terms of use, the privacy statement, the health data statement, the transparency statement, the accessibility statement, the processing register, the data protection impact assessment and the cookie policy. They are available in Dutch and English and can be saved as PDF.",
        ),
      },
      {
        vraag: t("Wie is verantwoordelijk voor de website?", "Who is responsible for the website?"),
        antwoord: t(
          "In de gebruiksvoorwaarden en het verwerkingsregister staat wie verantwoordelijk is en welke partijen achter de diensten zitten, met hun rollen en de beperkingen daarvan.",
          "The terms of use and the processing register state who is responsible and which parties sit behind the services, with their roles and the limitations thereof.",
        ),
      },
    ],
    link: { pad: "/gebruiksvoorwaarden", titel: t("Gebruiksvoorwaarden", "Terms of use") },
  },
  {
    id: "ziekten",
    context: "beide",
    titel: t("Ziekten en landelijk overzicht", "Diseases and national overview"),
    vragen: [
      {
        vraag: t(
          "Waar vind ik informatie over door teken overgedragen ziekten?",
          "Where can I find information about tick-borne diseases?",
        ),
        antwoord: t(
          "Het landelijke overzicht beschrijft 11 aandoeningen die met teken en tekenbeten samenhangen, met per aandoening bron, bewijsstatus en beperkingen. Deze informatie is algemene voorlichting en stelt geen diagnose.",
          "The national overview describes 11 conditions associated with ticks and tick bites, with source, evidence status and limitations per condition. This information is general education and does not diagnose.",
        ),
      },
      {
        vraag: t("Kan ik hier een diagnose krijgen?", "Can I get a diagnosis here?"),
        antwoord: t(
          "Nee. Deze website en de assistent geven alleen gecontroleerde website-informatie over gebieden, bronnen en tekensoorten, geen diagnose, infectiekans of behandeladvies.",
          "No. This website and the assistant only provide reviewed website information about areas, sources and tick species, not a diagnosis, infection probability or treatment advice.",
        ),
      },
    ],
    link: {
      pad: "/ziekten",
      kaart: true,
      titel: t("Overzicht van aandoeningen", "Overview of conditions"),
    },
  },
];
export function assistentOnderwerpen(context: AssistentContext) {
  return ASSISTENT_ONDERWERPEN.filter(
    (item) => item.context === context || item.context === "beide",
  );
}
export function assistentLink(onderwerp: AssistentOnderwerp, gidsHost: boolean) {
  return onderwerp.link.kaart && gidsHost
    ? `https://tekenrisicokaart.nl${onderwerp.link.pad}`
    : onderwerp.link.pad;
}
