# Google-bronadministratie: voorbereiding en omschakelvoorwaarden

Status: voorbereiding met Google-kopie en live-spiegel, **geen productieschakelaar gewijzigd**.
Doelproject: `tekenbeetgids-vertex-ai`; voorgestelde regio: `europe-west4`.

## Besluit en grenzen

De gebruiker heeft op 23 oktober 2026 gekozen voor bronadministratie en taakuitvoering
bij Google, met blijvend wijzigen vanuit Lovable via de bestaande GitHub-koppeling.
Dit vervangt het eerdere einddoel van een hybride opstelling, niet de huidige
werkende uitvoering. Het goedgekeurde migratieplan vereist aparte toestemming
voor betaalde middelen en nieuwe toegangsrechten.

De Cloud SQL Admin API en Cloud Scheduler API gaven bij de controle `SERVICE_DISABLED`.
Daarom is niet vastgesteld of er al een Cloud SQL-instance of Scheduler-job bestaat.
Niet automatisch opnieuw proberen, middelen aanmaken of productieverwerking wijzigen.

## Migratie-inventaris

| Onderdeel | Huidige uitvoering | Vereiste overgang |
| --- | --- | --- |
| Deelname | `onderzoek.server.ts`, `onderzoek_deelnames` | Serverrepository, behoud deelnamenummer, toestemming, rapport en status |
| Registratie | `registratie.server.ts`, `tekenbeet_registraties` | Deelnamevalidatie, limieten en insert in één transactie; beheertoegang behouden |
| Contact/privacy | `contact.server.ts`, `contact_berichten`, `privacy_verzoeken` | Bestaande verschillen tussen gewone contactmail en opgeslagen privacyberichten behouden |
| Intrekken | `optout.server.ts` | Bronverwijdering transactioneel; werkkopie en melding met gecontroleerde afronding |
| Beheer | Auth-middleware, `has_role`, gebruikersgebonden policies | Aangemelde identiteit verifiëren vóór minimale SQL-rechten; geen openbare beheerleesfunctie |
| Kaartcijfers/status | `cijfers.ts`, `dataStatus.ts`, sync-routes | Browseraanroepen vervangen door gecontroleerde publieke leeshandelingen |
| Tellingen/scan-cache/limieten | `telling.server.ts`, `beveiliging.server.ts` | Atomiciteit, bestaande scanverdeling en bewaartermijnen behouden |
| Logs/backup | `backuplog.ts`, `beveiligingsscans.ts`, hooks | Nieuwe bron, consistente back-up en nieuwe beveiligingscontrole |
| Drive/mail | `werkkopie.server.ts`, mailhelpers | Nieuwe veilige Google-toegang; bestaande Lovable-connectorgegevens niet als overdraagbaar behandelen |
| Gemini | `gemini.server.ts` | Actieve betaalde API-toegang via Secret Manager; visuele/medische grenzen ongewijzigd |

Schema reconstrueren uit **beide** migratiegeschiedenissen (`supabase/migrations`
en `drizzle/migrations`) en vergelijken met de echte export. De lege Drizzle-schemafile
is geen volledige beschrijving van de huidige administratie.

## Niet-overdraagbare intrekcodes

`beveiliging.server.ts` gebruikt de niet-beschikbare Lovable-serverkey als grondslag
voor bestaande intrekcodes. Deze key niet opvragen, exporteren of reconstrueren.

- Oude codes voorlopig uitsluitend door de bestaande afgeschermde verifier controleren.
- Nieuwe codes krijgen een aparte versie en een eigen servergeheim bij Google.
- Deelname moet ook na een geldige codecontrole bestaan in de nieuwe bron; een oude
  verifier mag nooit verwijderde deelnemers opnieuw geldig maken.
- Definitieve beëindiging van de oude verifier vereist een afzonderlijk afgesproken
  oplossing voor bestaande deelnemers. Zonder die oplossing geen volledige ontkoppeling claimen.
- De huidige Cloud Run-bridge niet omkeren of naar zichzelf laten wijzen. Een nieuwe
  recordverbinding krijgt een apart beperkt protocol en expliciete autorisatie.

## Google-inrichting vóór uitvoering

Regiospecifieke publieke tarieven gecontroleerd in de gerenderde Google-prijspagina
met **Netherlands (europe-west4)** geselecteerd, Enterprise General Purpose, on-demand USD:

| Resource, per uur | Eén zone | Regionale HA |
| --- | --- | --- |
| Dedicated vCPU | 0,0454 USD | 0,0909 USD |
| Geheugen per GiB | 0,0077 USD | 0,0154 USD |
| SSD per GiB | 0,000256164 USD | 0,000512329 USD |
| Gebruikte backupopslag per GiB | 0,000120548 USD | 0,000120548 USD |

Voor 1 vCPU, 3,75 GiB RAM, 20 GiB SSD en aangenomen 20 GiB gemiddelde billable
backupopslag is dit 0,081809240 USD/uur (één zone) of 0,161307540 USD/uur (HA).
Bij 730 uur geeft de berekening **59,72 USD** respectievelijk **117,75 USD**.
Dit zijn scenario's op geverifieerde Nederlandse tarieven, geen vaste maandfactuur
of kostenplafond. Backupvolume en maanduren variëren; accountvaluta en eventuele
contractprijzen zijn niet gecontroleerd. Btw, netwerk, extra verbindingen,
AI/meldingen en bestaande Cloud Run-kosten zijn uitgesloten. HA-tarieven niet opnieuw verdubbelen.
Cloud Scheduler kost USD 0,10 per taak per 31 dagen, met drie gratis taken per
factureringsaccount indien die ruimte nog vrij is: zes taken kosten daardoor
USD 0,30–0,60 per 31 dagen, exclusief hun uitvoering. Gepauzeerde taken tellen mee.
Bronnen: https://cloud.google.com/sql/pricing en https://cloud.google.com/scheduler/pricing.
Single-zone biedt niet dezelfde automatische uitwijking als regionale HA.
Facturering kon niet via de API worden bevestigd (`Cloud Billing API: SERVICE_DISABLED`).
De gebruiker koos vervolgens **eerst exacte kosten**: geen keuze voor single-zone/HA
of toestemming voor aanmaak. Een geaggregeerde meting van de huidige public-tabellen
inclusief indexen geeft 3456 kB; dit is geen volledig database-/backupvolume of
capaciteitsmeting en onderbouwt geen CPU-/geheugenkeuze. Allocatie en groei, niet
alleen de huidige rijen, bepalen de Cloud SQL-opslagprijs.

- Kosten en keuze tussen één zone of regionale hoge beschikbaarheid goedkeuren.
- Cloud SQL PostgreSQL met minimale databaserechten, aparte migratie-identiteit en
  geen bezoekersverbinding met de database. Netwerkroute vanuit Cloud Run expliciet testen.
- Secret Manager bevat alleen servergeheimen; niets in browserconfiguratie of images.
- Eigen beheerauthenticatie/rollen of een tijdelijk expliciet afgebakende auth-afhankelijkheid
  kiezen en testen. Een database-import verplaatst Auth/PostgREST niet automatisch.
- Privé testomgeving voor Lovable-preview inrichten; geen automatische productie-inserts
  vanuit de preview.
- Google-toegang voor werkkopieën, meldingmail en AI opnieuw controleren met minimale scopes.

## Actieve taken, gecontroleerd op naam en tijdstip

Deze lijst komt uit `cron.job`, niet alleen uit oudere migraties; de taakinhoud en
uitvoeringsresultaten moeten vóór overgang apart worden gecontroleerd zonder geheime
requestheaders in logs te tonen.

| Taak | Bestaand schema |
| --- | --- |
| `backup-export-wekelijks` | `15 2 * * 1` |
| `beveiligingsscan-dagelijks` | `25 3 * * *` |
| `opschonen-oude-gegevens` | `15 3 * * *` |
| `databroncontrole-dagelijks` | `30 5 * * *` |
| `rivm-sync-dagelijks` | `10 5 * * *` |
| `tbe-activiteit-sync-dagelijks` | `40 4 * * *` |

Nieuwe taken eerst gepauzeerd. Privileged callbacks vereisen geverifieerde
Google-identiteit of een afzonderlijk server-only authenticatiemiddel; een aanwezige
publishable bearer-key is geen beveiligingsgrens. Overlappende uitvoeringen blokkeren,
bij retries eerst de eerdere uitvoer controleren, en geen dubbele e-mails/writes veroorzaken.
De oude beveiligings-RPC controleert de huidige backend, niet de nieuwe Cloud SQL-inrichting;
daarvoor een nieuwe inhoudelijke controle ontwerpen.

## Export en herstel

De gebruiker exporteert de volledige administratie via
**More → Database → Manage → Settings → Export data**. Geen volledige dump via
SQL-tools, scripts of gepagineerde service-role-aanroepen. Export privé houden;
gebruikersaccounts/passwordhashes niet in chat, Git, screenshots of testlogs.
Geheimen, providerinstellingen en losse storagebestanden zitten niet in deze export.

De huidige wekelijkse AES-GCM-export bevat vijf brontabellen en is **geen volledige
herstelbare databaseback-up**. Behoud de eigen wachtzin en opgeslagen PBKDF2-iteratiecount
voor oudere exports. Naast deze export een consistente databaseback-up inrichten,
een herstelproef doen en aantallen/relaties controleren. Het huidige paginalimiet en
best-effort verwijderen van overtollige Drive-bestanden mogen geen onopgemerkte
truncatie of ongecontroleerde retentie veroorzaken. Doel blijft maximaal twaalf exports.

## Test- en omschakelpoort

1. Afgeschermde import/proefomgeving: schema, aantallen en relaties vergelijken.
2. Registratie en deelname inzenden, beheertoegang testen en bronrecord teruglezen.
3. Oude/nieuwe intrekcodes testen, deelname en alle gekoppelde registraties verwijderen,
   werkkopie verwijderen en melding controleren; onbevoegde beheerlezing moet falen.
4. Contact en privacyverzoek, beide scans, bevestiging vóór overname, assistent,
   afzonderlijke scanlimieten, cijferupdates en alle zes taken testen.
5. Versleutelde export, retentie en herstel controleren; geen foto- of gespreksopslag.
6. Een wijziging vanuit Lovable door GitHub tot de publieke Google-site volgen.
7. Schrijfpauze aankondigen, definitieve export/import/vergelijking uitvoeren en één
   bron inschakelen. Oude taken stoppen vóór nieuwe taken worden hervat.
8. Terugval alleen met reconciliatie van nieuwe writes en ingetrokken deelnemers;
   oude back-ups mogen opt-outs niet ongemerkt terugbrengen.
9. Feitelijke NL/EN-opslagverklaringen pas bij omschakeling wijzigen; oude bron pas
   na overeengekomen controle-/bewaarperiode afbouwen.

## Open uitvoering

- Uitgevoerd 23 oktober 2026: Firestore-productiedatabase `tekenbeetgids-prod` (europe-west4,
  verwijderbeveiliging aan, deny-all clientregels) en eerste beheerimport via
  `/beheer/firebase-migratie` (`src/lib/firebase-migratie.*`). Acht records gekopieerd
  (6 deelnames, 1 registratie, 1 contactbericht, 0 privacyverzoeken); aantallen bron/Google
  gelijk, bron ongewijzigd. Import is idempotent (upsert op bron-uuid) en toont alleen aantallen.
- Beslissing genomen: Firestore in plaats van Cloud SQL; de Cloud SQL-kostenscenario's hierboven
  zijn daarmee vervallen. Cloud Scheduler-taken worden in fase C opnieuw ingericht.
- Uitgevoerd 23 oktober 2026 (fase B deel 2): live-spiegel `src/lib/firebase-spiegel.*`.
  Nieuwe deelnames, registraties, contactberichten, privacyverzoeken, tellingen en
  back-uplogregels worden direct na de bronschrijfactie ook naar tekenbeetgids-prod
  gekopieerd (upsert op bron-uuid, volledige rij als JSON). Intrekkingen verwijderen de
  gespiegelde deelname én gekoppelde registraties; statuswijzigingen (Tekenbeet gemeld)
  worden bijgewerkt. Een mislukte spiegel blokkeert de schrijfactie nooit en verschijnt
  in de collectie migratie_log, zichtbaar via /beheer/firebase-migratie (Spiegellog).
  De huidige administratie blijft leidend. Scans slaan geen foto's of persoonsgegevens
  op; scanlimieten en de fotoscan-cache blijven bewust alleen in de huidige administratie.
- End-to-end-test van de live-spiegel uitgevoerd: fictieve deelname TRK-2026-P9FSU4 verhoogde beide aantallen van 7 naar 8; intrekking verwijderde de kopie en bracht beide terug naar 7, zonder gemelde spiegelfout. Dit bewijst niet dat mislukte of concurrerende intrekkingen duurzaam worden afgehandeld.
- Volgende voorbereidingsstap: bronlezing in vaste ID-volgorde met pagina's van 500 en onafhankelijke exacte telling vóór/na de lezing. `controleren` vergelijkt ook IDs en volledige JSON-inhoud met de Google-kopie; de browser ontvangt alleen aantallen ontbrekende, extra en afwijkende records. Geen herstel of overschrijving bij verschillen. Tijdens actieve writes blijft dit een momentopname; evenveel rijen sluiten gelijktijdige inhoudswijzigingen niet uit.
- Massaal opnieuw kopiëren is server-side geblokkeerd zolang de live-spiegel actief is, omdat oude snapshots ingetrokken records kunnen terugplaatsen. Een toekomstige import vereist een aparte gecontroleerde schrijfpauze en duurzame intrekkings-/versiebeveiliging; er is nu geen ontgrendelknop.
- Definitieve oplossing voor oude intrekcodes en beheeridentiteit: nog niet uitgevoerd.
- Omschakeling (schrijfpauze, eindcontrole inclusief intrekkingen na de import, single-writer):
  nog niet uitgevoerd.

De werkende websites, huidige bron en bestaande taken blijven intussen ongewijzigd.