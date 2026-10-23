import { AI_VERWERKING } from "@/data/aiVerwerking";
import VerwerkersToelichting from "@/components/VerwerkersToelichting";
import { createFileRoute } from "@tanstack/react-router";
import { JuridischPagina, H2, P } from "@/components/JuridischPagina";
import { LAATST_BIJGEWERKT } from "@/data/tekenData";
import { useTaal } from "@/lib/taal";

const title = "Gegevensbeschermingseffectbeoordeling (DPIA) — TekenbeetGids";
const description = "DPIA voor de onderzoeksinzendingen van TekenbeetGids: beschrijving, noodzaak, risico's, maatregelen, restrisico en voorbereiding op EHDS en HDAB.";

export const Route = createFileRoute("/gegevensbeschermingseffectbeoordeling")({
  head: () => ({ meta: [
    { title }, { name: "description", content: description },
    { property: "og:title", content: title }, { property: "og:description", content: description },
    { property: "og:type", content: "article" }, { name: "twitter:card", content: "summary" },
  ], links: [{ rel: "canonical", href: "https://tekenrisicokaart.nl/gegevensbeschermingseffectbeoordeling" }] }),
  component: DpiaPagina,
});

const KOP = { fontSize: 13, fontWeight: 800, color: "#264A61", margin: "18px 0 6px" } as const;
const TEKST = { fontSize: 11.5, lineHeight: 1.65, color: "#4A7A9E", margin: "0 0 8px" } as const;
const LIJST = { margin: "0 0 8px", paddingLeft: 18 } as const;
const ITEM = { fontSize: 11.5, lineHeight: 1.65, color: "#4A7A9E", marginBottom: 3 } as const;

type Rij = { nl: string; en: string };
const L = (nl: string, en: string): Rij => ({ nl, en });

type Sectie = { titel: Rij; tekst?: Rij[]; punten?: Rij[] };

const INLEIDING: Rij[] = [
  L(
    "Deze gegevensbeschermingseffectbeoordeling (DPIA, artikel 35 AVG) gaat over de vrijwillige onderzoeksinzendingen van TekenbeetGids. Omdat het daarbij om gezondheidsgegevens gaat, is een beoordeling uitgevoerd, ook al is deelname volledig vrijwillig en kleinschalig.",
    "This data protection impact assessment (DPIA, Article 35 GDPR) concerns the voluntary research submissions of TekenbeetGids. Because health data is involved, an assessment was carried out, even though participation is entirely voluntary and small in scale.",
  ),
  L(
    "Verwerkingsverantwoordelijke: Dominic Smith Advies. Beoordelingsdatum: 23 september 2026. Deze beoordeling wordt herzien bij elke wezenlijke wijziging en ten minste elke twee jaar.",
    "Controller: Dominic Smith Consultancy. Assessment date: 23 September 2026. This assessment is reviewed whenever there is a material change and at least every two years.",
  ),
];

const SECTIES: Sectie[] = [
  {
    titel: L("1. Beschrijving van de verwerking", "1. Description of the processing"),
    punten: [
      L("Een gebruiker beantwoordt vragen over de teek, de beetplek, de omgeving, eventuele klachten en eerdere tekenbeten. De antwoorden blijven tijdens het invullen op het eigen toestel.", "A user answers questions about the tick, the bite site, the surroundings, any symptoms and previous tick bites. While filling in the form, the answers remain on the user's own device."),
      L("Pas na uitdrukkelijke toestemming voor deelname aan onderzoek worden de antwoorden en het gegenereerde overzicht beveiligd opgeslagen onder een uniek deelnemernummer.", "Only after explicit consent for research participation are the answers and the generated overview stored securely under a unique participant number."),
      L("Foto's blijven lokaal op het eigen apparaat, tenzij de gebruiker expliciet kiest voor een AI-scan; dan wordt de foto via onze server doorgestuurd naar een externe AI-dienst voor verwerking. Foto's worden niet door ons opgeslagen en niet toegevoegd aan het onderzoeksbestand; ze blijven alleen in het browsergeheugen voor beide rapporten en de pdf tot de wizard wordt gereset of de pagina sluit.", "Photos stay local on the user's device unless the user explicitly chooses an AI scan; the photo is then forwarded via our server to an external AI service for processing. Photos are not stored by us and not added to the research dataset; they remain only in browser memory for both reports and the PDF until the wizard is reset or the page is closed."),
      L("Naam, adres, geboortedatum, burgerservicenummer en contactgegevens worden niet gevraagd.", "Name, address, date of birth, citizen service number and contact details are not requested."),
      L(AI_VERWERKING.nl, AI_VERWERKING.en),
    ],
  },
  {
    titel: L("2. Noodzaak en evenredigheid", "2. Necessity and proportionality"),
    punten: [
      L("Doel: inzicht in tekenbeten, huidreacties en tekenbeetziekten in Nederland, ter aanvulling op openbare cijfers.", "Purpose: insight into tick bites, skin reactions and tick-borne diseases in the Netherlands, supplementing public figures."),
      L("Grondslag: uitdrukkelijke toestemming (artikel 6 lid 1 sub a en artikel 9 lid 2 sub a AVG) in de context van wetenschappelijk onderzoek (artikel 89 AVG).", "Legal basis: explicit consent (Article 6(1)(a) and Article 9(2)(a) GDPR) in the context of scientific research (Article 89 GDPR)."),
      L("Dataminimalisatie: alleen onderzoeksrelevante antwoorden, geen direct identificerende gegevens en geen foto's.", "Data minimisation: only research-relevant answers, no directly identifying data and no photos."),
      L("Het doel kan niet met minder gegevens worden bereikt; zonder de antwoorden over omgeving, tijdstip en klachten heeft de inzending geen onderzoekswaarde.", "The purpose cannot be achieved with less data; without the answers about surroundings, timing and symptoms the submission has no research value."),
    ],
  },
  {
    titel: L("3. Risico's voor betrokkenen", "3. Risks to data subjects"),
    punten: [
      L("Herleidbaarheid: een combinatie van plaats, datum en klachten zou in theorie naar een persoon kunnen wijzen. Ingeschat als laag.", "Identifiability: a combination of location, date and symptoms could in theory point to a person. Assessed as low."),
      L("Onbevoegde toegang tot opgeslagen gezondheidsgegevens. Ingeschat als laag tot middel.", "Unauthorised access to stored health data. Assessed as low to medium."),
      L("Onbedoeld medisch vertrouwen: een gebruiker kan de uitkomst zien als diagnose of triage. Ingeschat als middel.", "Unintended medical reliance: a user might see the outcome as a diagnosis or triage. Assessed as medium."),
      L("Onduidelijkheid over toestemming: onduidelijk wat wel en niet wordt opgeslagen. Ingeschat als laag.", "Unclarity about consent: uncertainty about what is and is not stored. Assessed as low."),
      L("Te lang bewaren van gegevens. Ingeschat als laag.", "Keeping data for too long. Assessed as low."),
    ],
  },
  {
    titel: L("4. Maatregelen", "4. Measures"),
    punten: [
      L("Opslag uitsluitend na uitdrukkelijke toestemming, onder een uniek deelnemernummer, zonder naam of contactgegevens.", "Storage only after explicit consent, under a unique participant number, without name or contact details."),
      L("Versleutelde verzending en opslag; toegang alleen na beveiligd inloggen door de bevoegde beheerder; toegangsregels op databaseniveau.", "Encrypted transmission and storage; access only after secure login by the authorised administrator; access rules at database level."),
      L("IP-adressen uitsluitend gehasht en alleen voor misbruikbeperking; automatische verwijdering binnen 24 uur.", "IP addresses only in hashed form and only for abuse limitation; automatic deletion within 24 hours."),
      L("Foto's worden niet door ons opgeslagen, niet toegevoegd aan het onderzoeksbestand en alleen bij een expliciete AI-scan naar een externe AI-dienst gestuurd; bij reset van de wizard of sluiten van de pagina verdwijnen ze uit het geheugen.", "Photos are not stored by us, not added to the research dataset and only sent to an external AI service after an explicit AI scan; they are cleared from memory when the wizard is reset or the page is closed."),
      L("Neutrale formuleringen: geen diagnose, geen urgentiebepaling, geen behandeladvies; duidelijke AI-melding volgens artikel 50 van de AI-verordening.", "Neutral wording: no diagnosis, no urgency assessment, no treatment advice; a clear AI notice in line with Article 50 of the AI Act."),
      L("Intrekken van deelname met het deelnemernummer en de intrekcode via de opt-out, of via het contactformulier met handmatige controle, met bevestiging en verwijdering.", "Withdrawal of participation using the participant number and withdrawal code via the opt-out, or via the contact form with manual verification, with confirmation and deletion."),
      L("Automatische opschoning: onderzoeksinzendingen en registraties na 5 jaar, technische logs na 30 dagen, privacyverzoeken na 3 jaar.", "Automatic clean-up: research submissions and registrations after 5 years, technical logs after 30 days, privacy requests after 3 years."),
      L("Klachten en bezwaren worden op verzoek in een apart, afgeschermd privacyregister vastgelegd, zodat afhandeling aantoonbaar is.", "Complaints and objections are, on request, recorded in a separate, shielded privacy register, so that handling is demonstrable."),
    ],
  },
  {
    titel: L("5. Restrisico en conclusie", "5. Residual risk and conclusion"),
    tekst: [
      L(
        "Werkkopie bij Google: de gepseudonimiseerde onderzoekskopie, de anonieme registers en de versleutelde back-up staan in een afgeschermde werkomgeving bij Google, waartoe alleen de beheerder toegang heeft (met tweefactorauthenticatie). Met Google zijn een verwerkersovereenkomst (artikel 28 AVG) en de bijbehorende addenda gesloten. De werkkopie is geen bronadministratie; uitval veroorzaakt geen verlies van brongegevens. De kopie bevat geen foto's, namen of contactgegevens; de back-up is vooraf versleuteld met een wachtzin die alleen de beheerder heeft, zodat Google de inhoud niet kan lezen.",
        "Working copy at Google: the pseudonymised research copy, the anonymous registers and the encrypted backup are stored in a shielded environment at Google that only the administrator can access (with two-factor authentication). A data processing agreement (Article 28 GDPR) and the related addenda have been concluded with Google. The working copy is not the source administration; an outage does not cause loss of source data. The copy contains no photos, names or contact details; the backup is encrypted beforehand with a passphrase held only by the administrator, so Google cannot read its contents.",
      ),
      L(
        "De beheerder bevestigt betaald Gemini API-gebruik en acceptatie van de CDPA met SCC’s. Googles gepubliceerde misbruikbeleid beschrijft 55 dagen bewaring. De bevestiging is geen onafhankelijke inzage in de accountdocumenten; verwerking uitsluitend binnen de EU is niet gegarandeerd. De interne beoordeling blijft voorlopig: deze afspraken alleen stellen geen definitief laag restrisico of de noodzaak van voorafgaande raadpleging (artikel 36 AVG) vast. De uitgever moet de contractstukken bewaren en de feitelijke verwerking en overige dienstverleners blijven beoordelen.",
        "The administrator confirms paid Gemini API use and acceptance of the CDPA with SCCs. Google's published abuse-monitoring policy describes 55 days of retention. This confirmation is not an independent review of account documents; EU-only processing is not guaranteed. The internal assessment remains provisional: these arrangements alone do not establish a final low residual risk or whether prior consultation is required (Article 36 GDPR). The publisher must retain contractual evidence and continue assessing actual processing and other service providers.",
      ),
      L(
        "Nieuwe functionaliteit met gezondheidsgegevens, uitwisseling met zorgverleners of een grotere schaal van deelname leidt tot een nieuwe beoordeling vóór ingebruikname.",
        "New functionality involving health data, exchange with healthcare providers or a larger scale of participation will lead to a new assessment before it goes live.",
      ),
    ],
  },
  {
    titel: L("6. Klaar voor EHDS en HDAB", "6. Ready for EHDS and HDAB"),
    punten: [
      L("De onderzoeksgegevens worden gestructureerd en met eenduidige velden opgeslagen, gescheiden van direct herleidbare gegevens, zodat aansluiting op de Europese ruimte voor gezondheidsgegevens (EHDS, verordening (EU) 2025/327) mogelijk blijft.", "Research data is stored in a structured way with unambiguous fields, separated from directly identifiable data, so that connection to the European Health Data Space (EHDS, Regulation (EU) 2025/327) remains possible."),
      L("Secundair gebruik gebeurt alleen op basis van uitdrukkelijke toestemming; deelnemers kunnen die toestemming op elk moment intrekken met hun deelnemernummer en intrekcode.", "Secondary use only takes place on the basis of explicit consent; participants can withdraw that consent at any time using their participant number and withdrawal code."),
      L("Er vindt op dit moment geen uitwisseling plaats met zorgverleners, zorgsystemen, een gezondheidsdata-toegangsinstantie of een onderzoeksinfrastructuur.", "There is currently no exchange with healthcare providers, care systems, a health data access body or a research infrastructure."),
      L("Bij een toekomstige aansluiting op EHDS of een Nederlandse toegangsinstantie voor gezondheidsgegevens (HDAB) worden vooraf verwerkersafspraken, een geactualiseerde DPIA en een openbare toelichting toegevoegd.", "For any future connection to EHDS or a Dutch health data access body (HDAB), processor agreements, an updated DPIA and a public explanation will be added beforehand."),
    ],
  },
  {
    titel: L("7. Contact", "7. Contact"),
    tekst: [
      L(
        "Vragen over deze beoordeling of over uw gegevens? Gebruik het contactformulier onder Help. Het privacy-aanspreekpunt is de bevoegde beheerder van Dominic Smith Advies; dit is geen externe persoon of extern bedrijf. U kunt ook een klacht indienen bij de Autoriteit Persoonsgegevens of bij de privacytoezichthouder in uw eigen land.",
        "Questions about this assessment or about your data? Use the contact form under Help. The privacy point of contact is the authorised administrator of Dominic Smith Consultancy; this is not an external person or company. You can also lodge a complaint with the Dutch Data Protection Authority or with the data protection authority in your own country.",
      ),
    ],
  },
];

function DpiaPagina() {
  const en = useTaal() === "en";
  const t = (r: Rij) => (en ? r.en : r.nl);

  return (
    <JuridischPagina titel="Gegevensbeschermingseffectbeoordeling (DPIA)" bijgewerkt={LAATST_BIJGEWERKT}>
      {INLEIDING.map((r, i) => (
        <p key={i} style={TEKST}>{t(r)}</p>
      ))}
      {SECTIES.map((s) => (
        <div key={s.titel.nl}>
          <h2 style={KOP}>{t(s.titel)}</h2>
          {s.tekst?.map((r, i) => (
            <p key={i} style={TEKST}>{t(r)}</p>
          ))}
          {s.punten && (
            <ul style={LIJST}>
              {s.punten.map((r, i) => (
                <li key={i} style={ITEM}>{t(r)}</li>
              ))}
            </ul>
          )}
        </div>
      ))}
    <H2>{en ? "Open independent assessments" : "Openstaande onafhankelijke beoordelingen"}</H2>
      <P>{en ? "This published assessment is not an independent medical or legal audit. The administrator has confirmed the Gemini contractual arrangements; Google's published retention policy is described below. The account documents have not been independently reviewed and no EU processing region is guaranteed. Actual processing and other provider contracts remain subject to assessment. The intended purpose and actual AI behaviour require an independent medical review and MDR assessment before wider rollout." : "Deze gepubliceerde beoordeling is geen onafhankelijke medische of juridische audit. De beheerder heeft de Gemini-contractafspraken bevestigd; Googles gepubliceerde bewaarbeleid staat hieronder. De accountdocumenten zijn niet onafhankelijk ingezien en een EU-verwerkingsregio is niet gegarandeerd. De feitelijke verwerking en overige dienstverlenersafspraken blijven te beoordelen. Het beoogde doel en de feitelijke AI-werking vragen een onafhankelijke medische inhoudscontrole en MDR-beoordeling vóór bredere inzet."}</P>
      <VerwerkersToelichting />
    </JuridischPagina>
  );
}
