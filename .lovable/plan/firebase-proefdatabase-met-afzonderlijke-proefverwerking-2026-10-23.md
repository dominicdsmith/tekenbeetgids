# Firebase-proefdatabase met afzonderlijke proefverwerking

## Resultaat

Een afgeschermd proefscherm voor fictieve deelnames, gekoppelde registraties, klachten/privacyverzoeken en handmatig gestarte proeftaken. Proefgegevens worden uitsluitend in de nieuwe Firestore-database opgeslagen. De bestaande websiteformulieren, Lovable-bronadministratie, e-mails, werkkopieën en zes actieve taken blijven ongewijzigd.

Dit is een afzonderlijke proefworkflow, geen stilzwijgende omschakeling van de publieke website. Gebruik nog geen echte persoonsgegevens of medische informatie.

## Kosten gecontroleerd

De officiële Google Cloud-prijscatalogus geeft nu Nederlandse publieke prijzen in EUR, geldig vanaf 23 oktober 2026 07:00 UTC, zonder gratis quota:

| Firestore-verbruik | Publiek EUR-tarief |
| --- | --- |
| 100.000 documentreads | €0,0299 |
| 100.000 writes | €0,0897 |
| 100.000 deletes | €0,0096 |
| 1 GiB opslag per maand | circa €0,1496 |

Dit zijn publieke gebruikstarieven, geen exacte accountofferte of kostenplafond. Indexreads/retries kunnen extra operaties betekenen; netwerk, hosting, AI en andere Google-diensten zijn apart. Accountvaluta/contractprijzen zijn nog niet toegankelijk. De named proefdatabase heeft geen gratis quota; €2 is niet gegarandeerd. Er worden geen betaalde native back-ups, PITR, Scheduler-jobs of extra hostingdiensten ingeschakeld.

## Uitvoering

1. Na afzonderlijke bevestiging van deze kostenvoorwaarden: lege Standard/Native-database `tekenbeetgids-proef` aanmaken in `europe-west4`, met verwijderbeveiliging. De database-inventaris was leeg en projectfacturering is actief.
2. Database-specifieke deny-all bezoekersregels publiceren en zonder aanmelding lezen/schrijven testen. Zo nodig uitsluitend de Firebase Rules API inschakelen; geen nieuwe IAM-rechten of sleutels.
3. De bestaande Google Cloud-verbinding voor de app beschikbaar maken via het beveiligde koppelvenster. Geen credentials overnemen uit chat of browsercode.
4. Een apart, afgeschermd scherm `/beheer/firebase-proef` maken. Voorlopig blijft alleen de bestaande beheerlogin/rolcontrole van Lovable nodig; geen registraties of andere bronrecords worden daar gelezen of geschreven. Volledig Google-only beheerlogin is een latere stap en wordt niet als voltooid voorgesteld.
5. Fictieve deelname aanmaken met proefnummer, een registratie aan een bestaande proefdeelname koppelen, een fictieve klacht/privacyverzoek vastleggen, opgeslagen resultaten teruglezen en een proefdeelname met gekoppelde registraties intrekken. Deelname/registratie/intrekken zijn atomair en herhaalde verzoeken mogen geen dubbele records veroorzaken. Geen echte intrekcodes of oude records importeren.
6. Proeftaken handmatig starten en resultaten in dezelfde proefdatabase opslaan: verwerking van open proefrecords, controle van proefrelaties en een proefexport van fictieve gegevens. De zes productiecronjobs worden niet gekopieerd, aangezet of omgeleid. Bronupdates, beveiligingsaudit, echte e-mail/Drive-back-ups en AI worden niet nagebootst als succesvolle productie-uitvoering.
7. Isolatietests en browsercontrole: aangemelde beheerder schrijft en leest terug, onbevoegde toegang faalt, proefintrekking verwijdert gekoppelde gegevens en publieke formulieren/taken blijven de bestaande verwerking gebruiken. Als login of runtimekoppeling niet beschikbaar is, dat als blokkade melden in plaats van een geslaagde proef claimen.

## Veiligheid en beperkingen

- Bestaande projectbeheerders kunnen via Google-IAM toegang houden: deny-all clientregels beperken geen server-IAM. Geen rechten intrekken of toevoegen in deze stap.
- Database en collectiepad zijn server-side vastgezet; bezoekers kunnen geen productiepad of project meegeven.
- Alleen vooraf vastgelegde fictieve proefinhoud; geen foto's, gesprekken, vrije medische tekst, echte e-mailadressen, meldingen of Google-werkkopieën.
- Een proefexport is geen ingerichte herstelbare productieback-up; echte taken en backup/herstel volgen afzonderlijk na deze proef.
- Aanpassen vanuit Lovable blijft mogelijk. Automatische bestaande GitHub-publicatie kan nieuwe code meenemen, maar verandert geen opslagdoel van productieformulieren.

## Technische details

Nieuwe kleine modules voor proefvalidatie/IDs, Firestore REST-opslag en beschermde serverfuncties, plus één leaf-route onder het bestaande `_authenticated`-layout. Gebruik fetch via de bestaande Google Cloud-koppeling; uitsluitend server-only credentials. Firestore-transacties/batches voor gekoppelde writes; geen externe acties binnen retrybare transacties. Geen aanpassingen aan bestaande public writes, cronroutes, auth-middleware, databasepolicies of productiebridge. Minimaal gerichte tests voor database-isolatie, fictieve input, deelnamevereiste, gekoppelde intrekking en verboden taakneveneffecten.