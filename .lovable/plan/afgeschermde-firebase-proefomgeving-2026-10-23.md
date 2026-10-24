# Afgeschermde Firebase-proefomgeving

## Doel

Een afzonderlijke, lege Firestore-proefdatabase bij Google voorbereiden om de verhuizing met fictieve gegevens te testen. Uw werkende websites, huidige administratie, e-mailmeldingen en geplande taken blijven ongewijzigd. Dit is nog geen verhuizing of volledig werkend proefexemplaar van de website.

## Gecontroleerd

- Google-project `tekenbeetgids-vertex-ai` bestaat en is actief; toegang is gecontroleerd via Dominic's Google Cloud API.
- De Firestore API staat uit; daarom is de bestaande database-inventaris nog niet controleerbaar.
- De Cloud Billing API staat uit; accountfacturering en uw genoemde €2-limiet zijn niet bevestigd.

## Voorgestelde inrichting

1. Na uw toestemming de Firestore API en Cloud Billing API inschakelen in uitsluitend `tekenbeetgids-vertex-ai`.
2. De database-inventaris en factureringskoppeling controleren. Stoppen bij een naamconflict of onduidelijke facturering; geen bestaande database aanpassen.
3. Een **named database** `tekenbeetgids-proef` aanmaken: Firestore Standard/Native, Nederland (`europe-west4`), met verwijderbeveiliging. Dit is een afzonderlijke database binnen hetzelfde Google-project, geen afzonderlijk facturerings- of project-IAM-domein.
4. Alle directe bezoekerslezingen en -schrijfacties blokkeren en dat zonder aanmelding controleren voordat proefgegevens worden gebruikt. Bestaande Google-projectbeheerders kunnen via hun IAM-rechten toegang houden; deze stap trekt hun rechten niet in. Geen nieuwe IAM-rechten, accounts of sleutels verstrekken.
5. Inventaris, locatie, beveiliging en aanmaakstatus vastleggen. Geen koppeling aan de productie-website, geen echte gegevens importeren, geen mails, Gemini-aanroepen of geplande taken starten.

## Kosten en afzonderlijk akkoord

Een named database heeft **geen gratis Firestore-quota**; Google reserveert die voor de geschikte ene gratis database per project. Operaties, opgeslagen gegevens en eventuele latere back-ups kunnen kosten veroorzaken. De lege proefomgeving is geen garantie op €0 of maximaal €2. Een budgetwaarschuwing is geen hard kostenplafond. Exacte Nederlandse tarieven/accountvaluta worden eerst gecontroleerd; bij ontbrekend bewijs worden geen betaalde middelen aangemaakt.

Deze stap maakt geen Cloud SQL-instance, extra Cloud Run-service, back-upabonnement of Scheduler-taak aan. Voor deze aanmaak en mogelijke kosten vraag ik na goedkeuring van dit voorbereidingsplan **nog één afzonderlijke bevestiging**, vóór de eerste wijziging bij Google. Die bevestiging benoemt de definitieve inrichting en financiële beperking; uw oorspronkelijke verzoek geldt niet als die tweede bevestiging.

## Wat daarna nog nodig is

Een veilig, uitsluitend voor u toegankelijk proefexemplaar van de website vereist apart werk aan Google-beheertoegang, Firestore-opslaghandelingen, oude intrekcodes, proefmodus zonder echte meldingen en geïsoleerde publicatie. Daarvoor wordt de huidige productieversie niet als testschrijver gebruikt. Eerst testen met fictieve deelnemers; een echte export/import gebeurt alleen na een afzonderlijk goedgekeurde migratiestap.

## Technische details

- Project: `tekenbeetgids-vertex-ai`; database-ID: `tekenbeetgids-proef`; locatie: `europe-west4`; type: `FIRESTORE_NATIVE`; Standard-editie.
- Google-acties: API-enable voor `firestore.googleapis.com` en `cloudbilling.googleapis.com`, database create met delete protection, database-specifieke deny-all clientregels. Geen wijzigingen aan project-IAM of bestaande runtime-identiteiten.
- Server-IAM omzeilt clientregels: later alleen een afzonderlijke proefidentiteit met minimaal, database-specifiek bereik toestaan, na apart akkoord.
- Database verwijderen is een afzonderlijke destructieve handeling; terugdraaien verwijdert niet automatisch eventuele geregistreerde gebruikskosten. Locatie kan na aanmaak niet worden gewijzigd.