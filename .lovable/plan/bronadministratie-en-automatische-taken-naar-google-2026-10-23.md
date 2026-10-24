# Bronadministratie en automatische taken naar Google

## Doel
De publieke websites blijven bij Google draaien. Ook registraties, onderzoeksdeelnames, klachten en privacyverzoeken krijgen Google als bronadministratie. U blijft de websites vanuit Lovable aanpassen; wijzigingen gaan via de gekoppelde GitHub-repository naar de publieke versie.

## Gecontroleerde uitgangssituatie
- Het juiste Google-project is `tekenbeetgids-vertex-ai`.
- De Cloud SQL Admin API en Cloud Scheduler API staan volgens Google nog uit. Een bestaande Google-database en Google-taakplanning konden daarom niet worden vastgesteld.
- De huidige administratie en taken worden niet uitgezet tijdens de voorbereiding.
- Er zijn zes actieve taken: wekelijkse back-up en dagelijkse broncontrole, beveiligingscontrole, opschoning en twee cijferupdates.

## Aanpak
1. **Google-inrichting vastleggen.** Voorstel: Cloud SQL PostgreSQL in `europe-west4`, naast de bestaande Cloud Run-hosting, en Cloud Scheduler voor de automatische taken. Eerst de actuele kostenraming, opslag, back-upinstellingen en beschikbaarheidskeuze tonen. Geen betaalde database of extra toegangsrechten aanmaken zonder afzonderlijke toestemming.
2. **Registratieverwerking geschikt maken.** Alle opslag en teruglezing via afgeschermde serverhandelingen laten lopen. Bestaande deelnamenummers, intrekcodes, toestemmingen, bewaartermijnen en toegang uitsluitend voor de beheerder behouden. Ook kaartcijfers, bronstatus, scanlimieten en logboeken meenemen zodat geen stille afhankelijkheid van de oude administratie overblijft.
3. **Google-koppelingen overzetten.** Meldingen, werkkopieën, Gemini en versleutelde back-ups vanuit de Google-versie laten werken. Bestaande Lovable-koppelingen en sleutels zijn niet automatisch overdraagbaar. Benodigde toegang veilig instellen; niets in openbare code of chat zetten.
4. **Bestaande gegevens gecontroleerd overbrengen.** U maakt een beveiligde export via Lovable: **More → Database → Manage → Settings → Export data**. Deze bevat structuur, gegevens en gebruikersaccounts, maar geen geheimen of losse opslagbestanden. De export in een afgeschermde proefomgeving verwerken; aantallen, onderlinge verbanden en intrekcodes vergelijken. Geen volledige export via scripts uit de huidige administratie maken.
5. **Automatische taken overzetten.** Tijdstippen voorlopig ongewijzigd houden, inclusief de wekelijkse versleutelde back-up met maximaal twaalf bestanden. Nieuwe taken eerst uitgeschakeld aanmaken en afzonderlijk controleren; oude en nieuwe taken nooit tegelijk laten schrijven of berichten versturen.
6. **Werkende proefversie controleren.** Registratie en deelname opslaan en als beheerder teruglezen; intrekken en verwijdering in bron/werkkopie controleren; contact, privacyverzoek, meldingen, beide scans, assistent en back-up/herstel testen met herkenbare proefgegevens. Geen echte gebruikersgegevens in testuitvoer tonen.
7. **Gecontroleerd omschakelen.** Korte aangekondigde schrijfpauze, definitieve export/import en vergelijking uitvoeren. Pas na geslaagde controles Google als enige bron inschakelen en oude taken stoppen. Terugvalprocedure houdt rekening met gegevens die na omschakeling zijn toegevoegd; niet blind terugschakelen. Oude administratie pas later afbouwen volgens afgesproken bewaartermijnen.
8. **Lovable-beheer behouden en teksten bijwerken.** Een wijziging vanuit Lovable via GitHub tot op de publieke website controleren. De voorbeeldweergave gebruikt een aparte, beveiligde testverbinding, niet onbeperkt de echte administratie. NL/EN-verwerkingsinformatie pas aanpassen wanneer de feitelijke omschakeling voltooid is.

## Technische aandachtspunten
- Cloud SQL is PostgreSQL, maar vervangt de huidige diensten voor aanmelden, rollen en database-aanroepen niet automatisch. Een PostgreSQL-import alleen is onvoldoende; beheerauthenticatie, serverautorisatie en huidige functies/policies moeten expliciet worden aangepast en getest.
- Houd de huidige opslag onaangeroerd totdat de Google-implementatie klaar is. Geen dubbele bronadministratie of automatische schrijfherhalingen.
- Database niet publiek toegankelijk maken voor bezoekers; minimale rechten voor de app en aparte beheer/migratietoegang. Google-runtimegeheimen blijven in Secret Manager; browsercode krijgt geen databasewachtwoorden of privésleutels.
- Actieve planning, alle tijden UTC: back-up maandag 02:15; beveiliging dagelijks 03:25; opschoning 03:15; broncontrole 05:30; RIVM-sync 05:10; TBE/activiteit-sync 04:40. Definitieve uitvoercontrole omvat ook de huidige taakinhoud, niet alleen deze namen.
- Versleuteling en sleutelcontinuïteit controleren vóór import: bestaande intrekcodes en oudere back-ups moeten blijven werken.
- Bestaande intrekcodes zijn afgeleid van een niet-overdraagbare Lovable-serverkey. Tijdens de overgang alleen de oude codecontrole daar behouden; nieuwe codes met een eigen, versiegebonden Google-geheim uitgeven. Vóór volledige beëindiging een veilige oplossing voor oude codes afspreken. De onbeschikbare serverkey niet opvragen of reconstrueren.
- De huidige wekelijkse export bevat vijf brontabellen en is geen volledige herstelbare databasekopie. Naast deze versleutelde export een consistente databaseback-up en herstelproef inrichten; exportlimieten en verwijdering van overtollige bestanden expliciet controleren.

## Benodigd vóór de daadwerkelijke verhuizing
- Akkoord op inrichting en actuele Google-kosten; daarna afzonderlijke toestemming voor betaalde middelen en toegangsaanpassingen.
- Werkende Google-database/toegang en veilige overdracht van benodigde dienstgeheimen.
- Beveiligde export van de huidige administratie en een afgesproken omschakelmoment.

Goedkeuring van dit plan start de voorbereiding; het betekent niet dat de database al is verhuisd of dat betaalde middelen zonder verdere toestemming worden aangemaakt.