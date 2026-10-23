import { AI_VERWERKING } from "@/data/aiVerwerking";
import { H2, P, UL } from "@/components/JuridischPagina";
import { useTaal } from "@/lib/taal";

/** Shared factual disclosure; provider contract claims require documentary evidence. */
export default function VerwerkersToelichting() {
  const en = useTaal() === "en";
  return <section aria-label={en ? "Processing and service providers" : "Verwerking en dienstverleners"}>
    <H2>{en ? "Processing, storage and service providers" : "Verwerking, opslag en dienstverleners"}</H2>
    <P>{en
      ? "Local photos: photos remain on your device and can be included locally in your summary and PDF, without storage on our server. AI-scan: only after your explicit choice is the selected photo sent via our server to an external AI service. Research: storing health data for research requires separate explicit consent. These are three separate choices; consent for one is not consent for another."
      : "Lokale foto’s: foto’s blijven op uw apparaat en kunnen lokaal worden opgenomen in uw samenvatting en PDF, zonder opslag op onze server. AI-scan: alleen na uw expliciete keuze wordt de geselecteerde foto via onze server naar een externe AI-dienst gestuurd. Onderzoek: opslag van gezondheidsgegevens voor onderzoek vereist afzonderlijke uitdrukkelijke toestemming. Dit zijn drie afzonderlijke keuzes; toestemming voor het ene is geen toestemming voor het andere."}</P>
    <P>{en
      ? "Article 50 of the EU AI Act concerns transparency about the use of certain AI systems. It does not determine whether software is a medical device under the MDR; that assessment concerns the intended medical purpose and functionality."
      : "Artikel 50 van de Europese AI-verordening gaat over transparantie over het gebruik van bepaalde AI-systemen. Het bepaalt niet of software een medisch hulpmiddel is onder de MDR; die beoordeling betreft het beoogde medische doel en de functionaliteit."}</P>
    <P>{en
      ? "Health data is stored for research only after your explicit consent (Articles 6(1)(a) and 9(2)(a) GDPR). Research consent is separate from your optional choice to send a photo for AI comparison. The local guide is not automatically uploaded. Research data is pseudonymised, not fully anonymous."
      : "Gezondheidsgegevens worden alleen met uw uitdrukkelijke toestemming voor onderzoeksdoeleinden opgeslagen (artikel 6 lid 1 sub a en artikel 9 lid 2 sub a AVG). Onderzoekstoestemming staat los van uw optionele keuze om een foto voor AI-vergelijking te versturen. De lokale gids wordt niet automatisch geüpload. Onderzoeksgegevens zijn gepseudonimiseerd, niet volledig anoniem."}</P>
    <P>{en
      ? "Lovable Cloud is the source administration (primary database) for research submissions, registrations, contact messages and tick-bite counts. A shielded environment at Google (processor, under a data processing agreement) is the working environment with working copies."
      : "Lovable Cloud is de bronadministratie (primaire database) voor onderzoeksinzendingen, registraties, contactberichten en tekenbeettellingen. Een afgeschermde werkomgeving bij Google (verwerker, met verwerkersovereenkomst) is de werkomgeving met werkkopieën."}</P>
    <UL items={en ? [
      "Lovable Cloud: the protected database for consented research submissions and registrations. Only the authorised administrator of Dominic Smith Consultancy can read these records through the application after secure login.",
      "Google (processor, under a data processing agreement): a pseudonymised research copy (participant number and answers, no photos, names or e-mail addresses), anonymous registers of privacy complaints and privacy requests (without name or contact details), anonymous AI-scan outcomes (without photo) and the encrypted weekly backup, in a shielded environment that only the authorised administrator can access. A data processing agreement (Article 28 GDPR) and the related addenda have been concluded with Google. There are no public links or shared accounts, and the administrator account is protected with two-factor authentication (2FA). If the service is unavailable, the primary database in Lovable Cloud remains authoritative and the copy may be temporarily incomplete. This environment is not the application's primary database.",
    ] : [
      "Lovable Cloud: de afgeschermde database voor onderzoeksinzendingen en registraties na toestemming. Alleen de bevoegde beheerder van Dominic Smith Advies kan deze gegevens via de toepassing na beveiligd inloggen teruglezen.",
      "Google (verwerker, met verwerkersovereenkomst): een gepseudonimiseerde onderzoekskopie (deelnamenummer en antwoorden, geen foto's, namen of e-mailadressen), anonieme registers van privacyklachten en privacyverzoeken (zonder naam of contactgegevens), anonieme AI-scanuitkomsten (zonder foto) en de versleutelde wekelijkse back-up, in een afgeschermde werkomgeving waartoe alleen de bevoegde beheerder toegang heeft. Met Google zijn een verwerkersovereenkomst (artikel 28 AVG) en de bijbehorende addenda gesloten. Er zijn geen openbare links of gedeelde accounts, en het beheerdersaccount is beveiligd met tweefactorauthenticatie (2FA). Bij uitval blijft de hoofddatabase in Lovable Cloud leidend en kan de kopie tijdelijk onvolledig zijn. Deze werkomgeving is niet de hoofddatabase van de toepassing.",
    ]} />
    <P>{en
      ? "The parties involved and their roles at a glance:"
      : "De betrokken partijen en hun rollen op een rij:"}</P>
    <UL items={en ? [
      "Lovable Cloud van Lovable AB (Stockholm, Sweden, EU) — hosting of the website and the protected primary database. The database runs on a managed PostgreSQL platform operated by Supabase, Inc. and is hosted on European servers of Amazon Web Services (AWS EU, Ireland). The legal contracting party is Lovable AB (Stockholm, Sweden, EU); according to Lovable's public statement, no separate data processing agreement applies for this workspace and Lovable's Terms of Service govern.",
      "Google (processor, under a data processing agreement) — the shielded environment holding the pseudonymised research copy, the anonymous registers and the encrypted backup.",
      "Google Ireland Limited — Gmail, via the business Google account of Dominic Smith Advies, only for e-mail notifications; the data processing agreement with Google (Article 28 GDPR) and its addenda also apply to this account.",
    ] : [
      "Lovable Cloud van Lovable AB (Stockholm, Zweden, EU) — hosting van de website en de beveiligde hoofddatabase. De database draait op een beheerd PostgreSQL-platform van Supabase, Inc. en staat op de Europese servers van Amazon Web Services (AWS EU, Ierland). De juridische contractspartij is Lovable AB (Stockholm, Zweden, EU); volgens de publieke toelichting van Lovable geldt voor deze werkruimte geen aparte verwerkersovereenkomst en zijn de gebruiksvoorwaarden van Lovable leidend.",
      "Google (verwerker, met verwerkersovereenkomst) — de afgeschermde werkomgeving met de gepseudonimiseerde onderzoekskopie, de anonieme registers en de versleutelde back-up.",
      "Google Ireland Limited — Gmail, via het zakelijke Google-account van Dominic Smith Advies, alleen voor e-mailmeldingen; ook voor dit account gelden de verwerkersovereenkomst met Google (artikel 28 AVG) en de bijbehorende addenda.",
    ]} />
    <P>{en
      ? "Backup: once a week an encrypted backup of the source data (research submissions, registrations, contact messages and tick-bite counts) is made from Lovable Cloud and stored in a shielded environment at Google (processor, under a data processing agreement). The backup is encrypted with a passphrase held only by the administrator; without it the file cannot be read. Contact messages in the backup may contain a name or e-mail address. The last twelve backups are kept (about three months); older backups are deleted automatically. When you withdraw via the opt-out, the source data and the working copy are erased immediately; in already-made encrypted backups a withdrawn row disappears when that backup expires."
      : "Reservekopie (back-up): wekelijks wordt een versleutelde back-up van de brongegevens (onderzoeksinzendingen, registraties, contactberichten en tekenbeettellingen) uit Lovable Cloud gemaakt en bewaard in een afgeschermde werkomgeving bij Google (verwerker, met verwerkersovereenkomst). De back-up is versleuteld met een wachtzin die alleen de beheerder heeft; zonder die wachtzin is het bestand niet te lezen. Contactberichten in de back-up kunnen een naam of e-mailadres bevatten. De laatste twaalf back-ups worden bewaard (ongeveer drie maanden); oudere back-ups worden automatisch gewist. Bij intrekking via de opt-out worden de brongegevens en de werkkopie direct gewist; in reeds gemaakte versleutelde back-ups verdwijnt een ingetrokken rij zodra die back-up verloopt."}</P>
    <P>{en
      ? AI_VERWERKING.en
      : AI_VERWERKING.nl}</P>
    <P>
      <a href="https://ai.google.dev/gemini-api/terms" target="_blank" rel="noopener noreferrer" className="text-primary underline">{en ? "Gemini API terms (paid services and processing agreement)" : "Gemini API-voorwaarden (betaalde dienst en verwerkersovereenkomst)"}</a>
      {" · "}
      <a href="https://ai.google.dev/gemini-api/docs/usage-policies" target="_blank" rel="noopener noreferrer" className="text-primary underline">{en ? "Google abuse monitoring and retention" : "Googles misbruikcontrole en bewaartermijn"}</a>
    </P>
    <P>{en
      ? "Lovable Cloud remains the hosting and primary database provider; its contractual arrangements are separate from those for Gemini. User consent alone does not establish GDPR compliance."
      : "Lovable Cloud blijft de hostingpartij en bronadministratie; de afspraken daarvoor staan los van Gemini. Toestemming alleen bewijst geen AVG-naleving."}</P>
    <P>{en
      ? "You can withdraw research consent through the opt-out under Help using your participant number and withdrawal code, or make a request through the contact form. Deletion concerns the protected research records and the corresponding row in the research copy in the environment. Clearing browser data or resetting the wizard only removes local data; it does not withdraw research consent or erase records already submitted."
      : "U kunt onderzoekstoestemming intrekken via de opt-out onder Help met uw deelnamenummer en intrekcode, of een verzoek doen via het contactformulier. Verwijdering betreft de afgeschermde onderzoeksgegevens en de bijbehorende rij in de onderzoekskopie in de werkomgeving. Browsergegevens wissen of de wizard resetten verwijdert alleen lokale gegevens; daarmee trekt u geen onderzoekstoestemming in en wist u geen eerder ingestuurde gegevens."}</P>
  </section>;
}
