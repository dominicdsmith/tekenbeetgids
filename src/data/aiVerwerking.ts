/** Shared bilingual disclosure for the direct paid Gemini API, separate from Google storage contracts. */
export const AI_CONTRACT = {
  nl: "Google (verwerker, met verwerkersovereenkomst): volgens de bevestiging van de beheerder van Dominic Smith Advies is voor de gebruikte betaalde Gemini API de verwerkersovereenkomst (CDPA) geaccepteerd, inclusief de EU-modelcontractbepalingen (SCC’s) voor doorgifte buiten de EER. Deze bevestiging is geen onafhankelijke controle van de accountdocumenten. De overeenkomst voor de afgeschermde werkomgeving bij Google staat los van deze AI-afspraken. Een EU-verwerkingsregio is niet gegarandeerd. Deze afspraken bewijzen op zichzelf geen volledige AVG-naleving.",
  en: "Google (processor, under a data processing agreement): according to confirmation by the administrator of Dominic Smith Consultancy, the data processing agreement (CDPA), including EU Standard Contractual Clauses (SCCs) for transfers outside the EEA, has been accepted for the paid Gemini API in use. This confirmation is not an independent review of the account documents. The agreement for the shielded environment at Google is separate from these AI arrangements. An EU processing region is not guaranteed. These arrangements alone do not establish full GDPR compliance.",
};

export const AI_BEWARING = {
  nl: "Volgens Googles voorwaarden voor betaalde Gemini API-diensten worden prompts en antwoorden niet gebruikt om Googles producten te verbeteren. Het misbruikbeleid noemt 55 dagen bewaring van prompts, aanvullende context en antwoorden voor veiligheid, het opsporen en voorkomen van beleidsschendingen en vereiste wettelijke of toezichthoudende openbaarmakingen. Gemarkeerde inhoud kan door bevoegde Google-medewerkers worden beoordeeld. Misbruiklogs kunnen worden gebruikt voor modellen die specifiek beleidsschendingen tegengaan; dit is niet hetzelfde als training van algemene AI-modellen. De termijn betreft Googles misbruikcontrole, niet onze lokale foto’s of onze onderzoeksopslag.",
  en: "Under Google's terms for paid Gemini API services, prompts and responses are not used to improve Google's products. Its abuse-monitoring policy specifies 55 days of retention for prompts, additional context and responses for safety, detecting and preventing policy violations, and required legal or regulatory disclosures. Flagged content may be reviewed by authorised Google staff. Abuse logs may be used for models specifically enforcing policies; this is distinct from training general AI models. This period concerns Google's abuse monitoring, not our local photos or research storage.",
};

export const AI_VERWERKING = {
  nl: `De optionele fotovergelijkingen en informatieassistent gebruiken rechtstreeks Google AI Studio / Gemini API (betaalde dienst) met gemini-3.8-flash, via onze server over een beveiligde verbinding. Foto’s worden alleen na aparte uitdrukkelijke bevestiging verstuurd; de assistent verwerkt uitsluitend de tekst van het gesprek na akkoord. Wij bewaren geen foto’s of gesprekken duurzaam en gebruiken ze zelf niet voor modeltraining. ${AI_CONTRACT.nl} ${AI_BEWARING.nl} Toestemming vervangt de overige AVG-verplichtingen niet.`,
  en: `The optional photo comparisons and information assistant use Google AI Studio / Gemini API (paid service) directly, with gemini-3.8-flash, via our server over a secure connection. Photos are sent only after separate explicit confirmation; the assistant processes only conversation text after agreement. We do not store photos or conversations permanently or use them ourselves for model training. ${AI_CONTRACT.en} ${AI_BEWARING.en} Consent does not replace other GDPR obligations.`,
};

export const AI_SCAN_PRIVACY = {
  nl: `Zonder bevestiging blijft de foto lokaal. Wij slaan de scanfoto niet duurzaam op en voegen deze niet toe aan het onderzoeksbestand. Voor onderzoek is aparte toestemming nodig. ${AI_CONTRACT.nl} ${AI_BEWARING.nl}`,
  en: `Without confirmation, the photo stays local. We do not store the scan photo permanently or add it to the research dataset. Research requires separate consent. ${AI_CONTRACT.en} ${AI_BEWARING.en}`,
};

export const AI_ASSISTENT_PRIVACY = {
  nl: `Uw getypte vragen worden verwerkt door Google (verwerker, met verwerkersovereenkomst) om gecontroleerde website-informatie te kiezen. Google bewaart aanvragen maximaal 55 dagen, uitsluitend voor misbruikcontrole. De app bewaart het gesprek niet; sluiten wist het gesprek.`,
  en: `Your typed questions are processed by Google (processor, under a data processing agreement) to select reviewed website information. Google keeps requests for at most 55 days, solely for abuse monitoring. The app does not store the conversation; closing clears it.`,
};