# Firebase/Firestore: onderzoek naar Google-bronadministratie

Onderzoeksdatum: 23 oktober 2026. Alleen broncode en openbare Google-documentatie onderzocht; geen persoonsgegevens geëxporteerd, middelen aangemaakt, rechten veranderd of productie aangepast.

## Conclusie

Cloud Firestore Standard is een technisch haalbare kandidaat met gebruiksafhankelijke kosten, niet een rechtstreekse PostgreSQL-vervanging. Cloud Run en wijzigen vanuit Lovable via GitHub kunnen blijven. Er is nog geen keuze of aankoopakkoord voor Firestore. Een volledige verhuizing omvat ook beheeridentiteit, taken, Google-toegang voor werkkopieën/meldingen en de uitvoering van Gemini, niet alleen opgeslagen records.

De bestaande omschakelpoorten in `google-database-migration.md` blijven gelden. De oude bron, verifier, connectoren en taken blijven intact tot een gecontroleerde single-writer-overgang.

## Kostenbewijs en grenzen

Volgens de officiële Firestore-prijspagina heeft één database per project een gratis quota van 1 GiB opslag, 50.000 documentreads/dag, 20.000 writes/dag, 20.000 deletes/dag en 10 GiB uitgaand verkeer/maand. Dagquota resetten rond middernacht Pacific time; een maandgemiddelde bewijst niet dat alle dagen binnen quota vallen. Index-entry reads, herhaalde queries, lege queries, listeners, reconnects en transactionele retries kunnen extra leeswerk opleveren.

Blaze maakt betaald gebruik mogelijk; budgetmeldingen zijn geen algemeen hard kostenplafond. Back-ups, PITR, restores, clones en TTL-verwijderingen vallen buiten gratis gebruik. De bestaande Cloud SQL-raming is een conditioneel USD-scenario, geen gemeten besparing door Firestore.

`europe-west4` is beschikbaar, maar de in dit onderzoek beschikbare officiële prijsweergave leverde geen onafhankelijk verifieerbaar Nederlands bedrag per operatie op. Daarom geen euro-offerte of regionale operatieprijs geven. Voor de volgende kostenberekening zijn dagelijkse operaties, indexwerk, opslag inclusief indexen, export/back-upvolume, pieken, accountvaluta en actuele regionale tarieven nodig. Bestaande projectmiddelen, gemeten Firestore-activiteit en de daadwerkelijke rekening zijn niet gecontroleerd. De gevonden Google Cloud-verbinding was niet aan het project gekoppeld en werd niet gebruikt of gewijzigd.

Illustratie, geen voorspelling: 5.000 reads, 2.000 writes en 100 deletes per maand passen onder de genoemde dagquota als de aantallen op geen dag de quota overschrijden. Ook 300.000 reads, 60.000 writes en 3.000 deletes per maand kunnen daaronder blijven; dit omvat geen indexreads, retries, opslag of andere producten en zegt niets over het huidige verkeer.

Cloud Run, Scheduler, beheerlogin/MFA, netwerk, Secret Manager, Drive, Gemini en back-up/herstel moeten afzonderlijk worden begroot. Firebase Data Connect gebruikt Cloud SQL PostgreSQL en vermijdt de kosten van een SQL-instance dus niet automatisch.

## Broncodebevindingen

| Onderdeel | Geïnspecteerde bron | Vereiste bij overgang |
| --- | --- | --- |
| Deelname/registratie | `onderzoek.server.ts`: `bewaarDeelname`; `registratie.server.ts`: `bewaarRegistratie` | Stabiele deelnemers-ID, relatie met registraties, uniqueness en limietchecks atomair uitvoeren; documentmodel en indexen ontwerpen. Geen joins/RLS overnemen als vanzelfsprekend. |
| Intrekken | `optout.server.ts`: `verwerkOptOut`; `beveiliging.server.ts`: `maakIntrekcode`, `controleerIntrekcode` | Oude codes gebruiken een niet-overdraagbare sleutel. Tijdelijke afgeschermde verifier plus versie voor nieuwe codes, of afzonderlijk goedgekeurde compatibiliteitsoplossing. Bronverwijdering en werkkopie-afhandeling retry-veilig maken. |
| Beheer | Auth-middleware en `has_role` in beheerleesfuncties | Nieuwe beheerauthenticatie, minimaal toegangsmodel, MFA en verboden leesacties testen. Serverlibraries omzeilen Firestore Security Rules; Cloud Run moet identiteit en autorisatie afdwingen. |
| Scans/beveiliging | `beveiliging.server.ts`: limiet- en cachehelpers | Afzonderlijke persoonlijke scanlimieten, gedeeld plafond, versie/taal/scan-cache en uitzonderlijke blokkaderetentie bewaren; read-then-write-races niet reproduceren. |
| Contact/privacy | `contact.server.ts` | Verschillende opslagdoelen behouden; minimale servertoegang en aparte limieten. |
| Kaart en logs | `telling.server.ts`, `cijfers.ts`, `dataStatus.ts`, beide migratiebomen | Publieke geaggregeerde informatie scheiden van privérecords; SQL-RPC’s expliciet vervangen. |
| Taken en koppelingen | Migratiedocument, `cloudBridge.server.ts`, `werkkopie.server.ts`, mailhelpers | Zes taken opnieuw beveiligen, overlap/duplicaten voorkomen; huidige Google-koppelingen niet als overdraagbare credentials behandelen. |
| AI | `gemini.server.ts`, `assistent-ai.server.ts`, scanmodules | Betaalde Gemini behouden, maar uitvoering gaat momenteel via de Lovable-zijde van de bridge. Voor volledige ontkoppeling server-only naar Cloud Run verplaatsen en credentials/toestemming/limieten testen. |

Firestore-transacties kunnen callbacks herhalen: nooit mail, Drive-writes of AI-aanroepen daarin uitvoeren. Gebruik duurzame afhandelstatus/idempotency voor externe acties. Documenten zijn maximaal 1 MiB; meet rapportgrootte vóór documentmodellering. Geen foto- of gespreksopslag introduceren. Lovable-preview mag niet ongemerkt productie schrijven.

## Productiedatabase aangemaakt: 23 oktober 2026 22:03 UTC

Via de beheerde Google-koppeling (niet via de github-deployer-sleutel, die 403 kreeg op Firestore-beheer) is de productiedatabase `tekenbeetgids-prod` aangemaakt in project `tekenbeetgids-vertex-ai`, regio `europe-west4`: type FIRESTORE_NATIVE, verwijderbeveiliging `DELETE_PROTECTION_ENABLED`, clienttoegang deny-all via ruleset-release `cloud.firestore/tekenbeetgids-prod`. De database is volledig gescheiden van `tekenbeetgids-proef`.

Belangrijk verschil: de productiedatabase meldt `freeTier: false` (de proef gaf `freeTier: true`). Het gemarkeerde gratis gebruik is dus niet bevestigd voor productie; kosten volgen de gemeten Firestore-tarieven die al in dit document staan en blijven bij het huidige volume verwaarloosbaar klein. Er zijn nog geen gegevens geïmporteerd en de bestaande productiebron is ongewijzigd.

## Back-up en privacy

Firestore ondersteunt wekelijkse native back-ups met maximaal 14 weken retentie; 12 weken is mogelijk, maar is niet hetzelfde als een exacte limiet van twaalf Drive-exportbestanden. Herstel gebeurt naar een nieuwe database en vereist een gecontroleerde aansluiting/herstelproef. Native back-ups en de vooraf AES-GCM-versleutelde Drive-export zijn afzonderlijke voorzieningen. Oude exportwachtzin en PBKDF2-compatibiliteit behouden, exportvolledigheid/retentie toetsen en ingetrokken deelnemers bij herstel niet terugbrengen.

Firestore kan in Nederland worden gekozen; dit garandeert geen Nederlandse/EU-only Gemini-verwerking of Drive-locatie. Google-overeenkomsten en toegang moeten voor ieder actief product worden gecontroleerd; pseudonimisering is geen anonimisering of algemene AVG-garantie. Gemini blijft apart gefactureerd. Firestore vereist geen overstap naar Firebase AI Logic, Vertex AI of een ander model; bestaande gecontroleerde medische grenzen blijven.

## Volgende beslispoort

1. Meet geaggregeerde dagelijkse operatievolumes, document/index/opslagvolume en taakwerk; lees geen privé-inhoud om omvang te bepalen.
2. Verifieer actuele Nederlandse tarieven en accountvaluta; presenteer scenario’s inclusief back-up, taken en beheerlogin, met Gemini afzonderlijk.
3. Leg oude-codecompatibiliteit en beheeridentiteit voor, daarna pas toestemming voor een afgeschermde Firestore-proefomgeving en betaalde functies.
4. Test registratie/overlap, bronteruglezing, intrekken inclusief werkkopie, onbevoegde beheerlezing, twee scans/limieten, zes taken, volledige export/herstel en Lovable→GitHub→Cloud Run. Geen productieschakeling vóór alle bestaande migratiepoorten zijn gehaald.

## Voorbereiding proefomgeving: gecontroleerd 23 oktober 2026

Na goedkeuring van het voorbereidingsplan en een afzonderlijke tweede bevestiging zijn uitsluitend `firestore.googleapis.com` en `cloudbilling.googleapis.com` ingeschakeld in het bestaande Google-project. Beide inschakeloperaties bevestigden `done: true` en `ENABLED`. De Firestore-database-inventaris gaf een lege respons; de projectfactureringskoppeling gaf `billingEnabled: true`.

De aparte factureringsaccount-read (`displayName,currencyCode,open`) werd door Google geweigerd met `403 PERMISSION_DENIED`. Accountvaluta en contractprijzen blijven onbekend. Later konden publieke EUR-prijzen worden gecontroleerd via Cloud Billing Catalog voor service `EE2C-7FAC-5E08`: Nederlandse reads €0,0299/100.000, writes €0,0897/100.000, deletes €0,0096/100.000, opslag circa €0,1496/GiB-maand (effectiveTime 2026-10-23 07:00 UTC). Dit is geen exacte accountofferte.

Na een nieuw goedgekeurd plan en tweede expliciete kostenbevestiging is `tekenbeetgids-proef` aangemaakt om 21:30:53 UTC: Standard, Native, `europe-west4`, verwijderbeveiliging aan, PITR uit. **De live Database API retourneert `freeTier: true`**, ook bij deze named database; dit corrigeert de eerdere absolute aanname dat named databases nooit gratis quota hebben. Het marker is geen garantie op nul kosten of een €2-plafond.

De database-specifieke rules release `cloud.firestore/tekenbeetgids-proef` weigert alle directe clientreads/writes. Zonder credentials zijn GET en POST naar proefdocumenten met 403 PERMISSION_DENIED geweigerd. Server-IAM blijft apart gelden; geen IAM of sleutels aangemaakt/gewijzigd. De bestaande Google Cloud-verbinding is nu gekoppeld voor server-only appgebruik.

Een aparte beschermde route `/beheer/firebase-proef` en proefmodules zijn toegevoegd. Uitsluitend fictieve deelnames/registraties/klachten/privacyverzoeken, gekoppelde intrekking en drie handmatige proeftaken (verzoeken verwerken, relaties controleren, fictieve JSON-export). Eén begrensd proefdocument met optimistic commit preconditions maakt gekoppelde wijzigingen atomair; maximaal honderd acties en drie registraties per deelname. Bij fouten geen fallback naar de bestaande administratie, geen automatische retries. Bestaande formulieren, bronwrites, mail, Drive, AI en cronroutes zijn niet aangepast. De JSON-export is geen versleutelde productieback-up.

Negen isolatie-/regeltests geslaagd en build OK. Browsercontrole zonder login stuurt naar `/auth`; volledige aangemelde schrijf-/leesproef is **nog niet geverifieerd**. De automatische testsessie kon niet worden aangemaakt: het systeem meldde dat er geen authgebruikers zijn om een sessie voor te maken. Vraag de beheerder om via de preview aan te melden; maak geen willekeurig account of adminrol. Lovable-auth/rolcontrole blijft een expliciete tijdelijke afhankelijkheid. De database is leeg gebleven en de nieuwe proefcode is niet door deze taak gepubliceerd. Google-only beheertoegang, productieimport, echte geplande taken en hersteltest blijven latere stappen.

## Officiële bronnen

- https://firebase.google.com/docs/firestore/pricing
- https://cloud.google.com/firestore/pricing
- https://firebase.google.com/docs/firestore/locations
- https://firebase.google.com/docs/projects/billing/firebase-pricing-plans
- https://firebase.google.com/docs/projects/billing/budget-alerts
- https://cloud.google.com/firestore/docs/security/iam
- https://cloud.google.com/firestore/docs/manage-data/transactions
- https://cloud.google.com/firestore/docs/backups
- https://cloud.google.com/firestore/docs/use-pitr
- https://firebase.google.com/docs/auth/admin/verify-id-tokens
- https://firebase.google.com/docs/auth/admin/manage-mfa-users
- https://firebase.google.com/docs/data-connect/pricing
- https://ai.google.dev/gemini-api/docs/pricing