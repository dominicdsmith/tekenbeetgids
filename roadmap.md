# Roadmap

- [x] AI-teksten NL/EN aangepast aan beheerdersbevestiging van betaald Gemini API-gebruik, CDPA en SCC’s; Google-bewaarbeleid (55 dagen, misbruikcontrole, bevoegde beoordeling en wettelijke openbaarmakingen) brongebonden toegelicht, geen algemene AVG-garantie. Zes verklaringen in beide talen en assistentvenster in browser gecontroleerd; toestemmingsknop bereikbaar, geen paginafouten, 13 tests geslaagd en build OK. Gedeelde tekst geldt ook voor Help en beide scanvensters. Niet gepubliceerd; onafhankelijke medische/MDR-controle blijft open.

- [x] Bij beide scans afzonderlijke bevestiging vóór overname in gidsvragen (NL/EN); annuleren, weigeren met handmatige invoer, bevestigen en wissen van oude soortovername in browser gecontroleerd met onderschepte proefscans zonder externe verzending/opslag. Acht tests geslaagd, build OK. Gepubliceerd 23 oktober 2026 09:52 UTC op tekenbeetgids.nl en tekenrisicokaart.nl en via commit 1f07cc0c7 naar Cloud Run overgenomen (workflow run 29 geslaagd).

- [x] Afzonderlijke persoonlijke limieten voor teek- en beetplekscans ingevoerd; beide volgordes getest (2 tests geslaagd, build OK); gezamenlijk kostenplafond behouden. Gepubliceerd 23 oktober 2026 08:52 UTC en via commit 0ce8d34c1 naar Cloud Run overgenomen (workflow geslaagd, backend-status ok).
- [x] Gebruiker bevestigt deelnamebewijs opslaan/printen op iPhone en ontvangst van de e-mailmelding.

- [x] PDF-deelnamebewijs lokaal vooraf maken; opslaan/download, iOS-deelmenu en desktopprint gecontroleerd met lokaal testnummer zonder inzending. PDF-tekst bevat beide codes; 14 tests geslaagd. Live log wees op scanlimiet, die voortaan als veilige NL/EN-limietmelding door de bridge gaat in plaats van foutieve beschikbaarheidsmelding. Publicatie en fysieke iPhone-printcontrole nog nodig.

- [x] Cloud Run-publicatie 015f73f (assistent-originfix + /__l5e-doorsturing) geverifieerd: workflow geslaagd, backend-status 200 en assistent 200 op de Cloud Run-link.

- [x] Volledige GitHub-synchronisatie hersteld: 27 gewijzigde/nieuwe bestanden (bewijs-PDF-print, scanlimietmelding, bridge-bestanden, Dockerfile, migraties) in één commit (2958d25da) naar main gezet via de gekoppelde GitHub-verbinding; Cloud Run-workflow geslaagd; backend-status 200, /__l5e-doorsturing 302 naar tekenbeetgids.nl, assistent 200 op beide routes. Afbeeldingen lopen nog via doorsturing; volledig meeleveren vereist dat de platform-Git-synchronisatie ze naar GitHub stuurt.
- [x] Lovable-publicatie aangevraagd 23 oktober 2026 08:25 UTC (bewijs-opsla/print-oplossing + scanlimietmelding live op tekenrisicokaart.nl en tekenbeetgids.nl); fysieke iPhone-printcontrole nog nodig.

- [x] Cloud Run veilig verbonden met de bestaande Lovable Cloud-registratie; deelname en contact via Cloud Run door de gebruiker bevestigd; assistent, status en afbeeldingsdoorsturing door de AI getest. Nog niet via Cloud Run getest: registratie, opt-out, scans.

- [x] GitHub Actions-deployment voor main naar Cloud Run (tekenbeetgids-vertex-ai, europe-west4) toegevoegd, met Bun/Vite-tests/build, Node-container, veilige secret-scheiding en setupinstructies; 42 tests en YAML-validatie geslaagd. Daadwerkelijke deployment niet uitgevoerd: wacht op Google/GitHub-accounts en secrets. Volledige verhuizing geblokkeerd door niet-overdraagbare Lovable Cloud-serverkey en nog niet geverifieerde connectorconfiguratie; bestaande domeinen/taken ongewijzigd.

- [x] Fotoscans en informatieassistent rechtstreeks naar Google AI Studio Gemini API met gemini-3.8-flash omgezet; SDK-JSON en tick-vision getest, echte huidscan en assistentvraag in browser geslaagd, medische weigering en annuleren zonder upload bevestigd, 23 veiligheidstests en build geslaagd. Zes verklaringen in NL/EN gecontroleerd. Niet gepubliceerd; afzonderlijke Gemini-contractdekking en externe bewaartermijnen blijven te verifiëren.

- [x] Caches ververst: asset-versiecode automatisch opnieuw gegenereerd en de app-cache-uitvoering opgehoogd, zodat elke bezoeker één keer oude bestanden en de offline-cache loslaat; in de voorbeeldweergave gecontroleerd (cache-marker 26, build OK, geen paginafouten). Niet gepubliceerd.



- [x] Gecontroleerde inhoudelijke aandachtspunten gecorrigeerd: blijvende kaartafbakening, datumduiding, overdrachtsroutes/bewijsstatus, aanwezigheidsindicatie, bronnotities, TBE-weging en herhalingen; NL/EN in browser gecontroleerd, 8 tests geslaagd. Osiris-selectie blijft niet onafhankelijk geverifieerd en is als zodanig aangeduid. Niet gepubliceerd.

- [x] TekenbeetGids-deelafbeelding op eigen domein ingesteld met afzonderlijke bestandsnaam; TekenRisicoKaart-afbeelding onveranderd. Nog niet gepubliceerd.

- [x] Imprint "Websiteversie": de updatecode dagdatumjaartal loopt niet meer achter op de bouw en wordt automatisch meegezet zodra de website-inhoud of de nieuwste logboekdag verandert; in de voorbeeldweergave gecontroleerd op 20102026 en vastgelegd met drie tests. Niet gepubliceerd.
- [x] Versienummer loopt automatisch op per logboekupdate (APP_VERSIE = v + aantal logboekregels; start v27); in de voorbeeldweergave gecontroleerd en vastgelegd met tests. Niet gepubliceerd.

- [x] Disclaimer in NL/EN in de bestaande juridische opmaak, met automatische bijwerkdatum, PDF-knoppen en links in cookiescherm, Help en juridische voettekst; beide links en beide PDF-downloads in de browser gecontroleerd zonder fouten. Niet gepubliceerd.

- [x] Lijnrandje van beide schilduitvoeringen (blauw naast de titel van cookiescherm en voorkeurenvenster, wit in de zwevende knop linksonder) verdikt tot dezelfde lijndikte als het tekstballonnetje van de assistent; nieuwe CDN-uitvoeringen gemaakt, pointerbestanden bijgewerkt, beide knoppen en de dialoogkop op telefoonformaat in browser vergeleken zonder fouten. Niet gepubliceerd.

- [x] Aangeleverd schild-met-slotje-icoontje omgekleurd naar het blauw van de assistent en als CDN-asset opgeslagen; staat nu links van de titel in zowel het cookiescherm als het cookievoorkeurenvenster (18 px), met behoud van het rode Dominic Smith Advies-logo onderaan; beide vensters op telefoonformaat in browser gecontroleerd zonder fouten. Niet gepubliceerd.

- [x] Assistentknopje uit de kopregel gehaald en als zwevend rond pictogram rechtsonder in beeld gezet in beide apps; uitwijken voor de balk onderin en het geopende venster op computer en telefoon in browser getest, Help-blok en stap "Zo werkt het" in NL/EN aangepast. Niet gepubliceerd.

- [x] Vrije vragen in gedeelde informatieassistent: één gesprek zonder opslag, AI selecteert uitsluitend gecontroleerde NL/EN-antwoorden van beide websites; vooraf akkoord voor externe verwerking. Echte vragen, vervolgvragen, medische weigering, wissen bij sluiten en Engels in de gids getest; 11 tests en build geslaagd. Bestaande algemene lintfouten buiten deze wijziging blijven staan; niet gepubliceerd.

- [x] Gedeelde NL/EN-informatieassistent met vaste onderwerpen en antwoorden in beide apps; zonder vrije tekst, generatieve AI, toegang tot gebruikersgegevens of gespreksopslag. Antwoorden, terug/sluiten, taal, uitlegkoppeling en telefoon/iPad/computer in browser getest; drie navigatietests geslaagd. Niet gepubliceerd.

- [x] Vervaagde bovenbalk: veilige statusbalkruimte en eigen ondoorzichtige laag toegevoegd; beide iPad-formaten, telefoon en computer in browser getest zonder overlap of fouten. Fysieke iPad/Safari nog niet gecontroleerd; niet gepubliceerd.

- [x] Bronnenpassages in transparantieverklaring, voorwaarden en privacyverklaring aangevuld in NL/EN, met wetenschappelijke publicaties, beeldbronnen en beperkingen van automatische broncontrole; overige verklaringen, verwerkingsregister en DPIA nagelopen zonder aanvullende inhoudelijke bronnenpassage. Drie aangepaste pagina’s in beide talen gecontroleerd zonder runtimefouten; niet gepubliceerd.

- [x] Terminologie NL/EN aangepast: geen Google Workspace/spreadsheets in website- of appteksten; HDAB en gepseudonimiseerd/pseudonymised consequent gebruikt in register, Help, cookies, woordenlijst, vertalingen en beheer. Acht juridische pagina’s in beide talen gecontroleerd zonder runtimefouten; Gmail-toelichting behouden. Niet gepubliceerd.

- [x] Huidscan: gescheiden vaste uitkomsten, geen onterechte overeenkomstzin, veiligheidsinformatie in resultaat en aparte AI-gatewaybevestiging; twintig NL/EN-kaders met nagebootste antwoorden getest, één echte scan gecontroleerd, annuleren verstuurt niets; gedeelde rapportteksten met zes tests gecontroleerd. Onbruikbare/ontbrekende kenmerken behouden handmatige huidvraag. Niet gepubliceerd.

- [x] Aangeleverde AI-privacyverbeteringen: consistente AI-spelling, externe verwerking vóór scanknop, lokale foto/PDF versus afzonderlijke onderzoekstoestemming, artikel 50 versus MDR en proportionele huisarts-/112-tekst in NL/EN controleren.

- [x] Automatische en handmatige positieve huiduitkomst gewijzigd naar "U heeft een rode vlek"; handmatige vraag "Rode vlek", neutrale negatieve tekst en overzichtlabels afgestemd in NL/EN, zonder EM vast te stellen of uit te sluiten.

- [x] Blijvende kaartzin vervangen door de gewenste gebiedsgebonden formulering, gedeeld met legenda, Help, panelen en ziektepagina’s in NL/EN.

- [x] Risicoklassen op kaart, legenda, provincie- en gemeentepaneel en ziektepagina's toegelicht als populatie-/gebiedsindicatie en niet als individueel medisch risico; gedeelde zin in NL/EN, ook op de geopende kaart op telefoonformaat gecontroleerd

- [x] Alfa-gal: antibiotica- en TBE-medicatievragen vervangen door Dieet, Antihistaminica en Adrenaline-auto-injector; meerdere keuzes mogelijk, NL/EN-labels in overzicht behouden; keuzelijst en uitgesloten vraagpaden getest.

- [x] Lyme/TBE-subpagina’s brongebonden afgestemd; brede medicatielijst met vijf middelen bovenaan, uitklapbare overige middelen en vrije invoer; NL/EN-keuzelijst in browser getest; actieve niet-vooraf-aangevinkte onderzoekstoestemming en Drenthe-meldingsformulering in code gecontroleerd. Geen automatische beoordeling van afwijkende voorschriften toegevoegd; de lijst blijft registratie, geen behandeladvies.
- [x] Cookievenster toont "TekenRisicoKaart - TekenbeetGids" met koppelteken; "logboek" overal vervangen door "gids" in Help, voorwaarden en verklaringen; beginschermkop "Gids na een tekenbeet: educatieve vragenlijst en persoonlijk overzicht"; vier verouderde woordenboeksleutels hersteld zodat de Engelse voorwaarden volledig Engels is; Engelse cookieknop "Accept all"; NL/EN gecontroleerd op telefoonformaat
- [x] Kleine Print pdf- en Opslaan pdf-knoppen onder alle acht juridische documenten; zestien NL/EN-pdf’s gedownload en alle pagina’s visueel gecontroleerd, losse koppen bij paginawissels gecorrigeerd; aanroep afdrukfunctie getest, fysieke mobiele deel-/printmenu’s niet getest

- [x] Gebruiksvoorwaarden en privacydocumenten afgestemd op aangeleverde verwerkerstekst in NL/EN; feitelijke opslag behouden en onbevestigde contractgaranties gecorrigeerd; zeven documenten in beide talen gecontroleerd

- [x] Cookievenster aangepast met de aangeleverde AI-scanformulering; Help-blok "Voorwaarden, privacy en cookies" en Imprint "Legitimiteit & veiligheid" op dezelfde tekst getrokken en cookiebeleid aangevuld; NL/EN in browser gecontroleerd

- [x] Cookievenster: zin "Geen datum van onafhankelijke medische controle." weggehaald; alleen de automatisch bijgewerkte inhoudsdatum blijft staan (NL/EN gecontroleerd), de logboektoelichting op de gids blijft behouden

- [x] Cookiemelding en Help-blok "Voorwaarden, Privacy en Cookies": MDR-beoordelingszin verwijderd en "dat de beoogde functie informatief is" opgenomen in de privacydocumentenzin; NL/EN in browser gecontroleerd

- [x] Beginscherm, vragen 1–13 en tussentijds overzicht aangepast aan logboekaanbevelingen in NL/EN; zichtbare scores, drempelbalken en symptoomkleurselectie verwijderd; vragenpad, klachtkleuren, Engels en PDF-voorbeeld gecontroleerd; bestaande foto-opslag in geheugen behouden

- [x] Changelog en Help-datums op 6 oktober 2026 bijgewerkt; automatische broncontrole (12:05 UTC) en beveiligingsscan (05:25 Nederlandse tijd) geverifieerd; bronjaren behouden

- [x] Herhaalde tekstcontrole: laagdefinities gedeeld, dubbele Bartonella-zin verwijderd en Groningen-grens 50.000 expliciet uitgelegd; eerder gecorrigeerde percentages, Lyme, EM, TBE-lijst en alfa-gal behouden

- [x] Gidsprivacyalinea dezelfde tekstgrootte als aangrenzende alinea's; gids en cookievenster delen de automatisch bijgewerkte inhoudsdatum in NL/EN

- [x] Acht aangeleverde tegenstrijdigheden nagelopen: Lyme-risicoverkleining, meldingsklasse per 100.000 inwoners, brongebonden Rickettsia, Terschelling 2023, gedeelde eenmalige TBE-lijst en zoönose-labels; NL/EN-browsercontrole geslaagd

- [x] Onderzoekspercentages en onzekere ziekterol R. helvetica, Babesia en B. miyamotoi brongebonden verduidelijkt; TBE-bewijsregels nagelopen; privacyomschrijving en zichtbare inhoudsdatum van de gids verbeterd; NL/EN-browsercontrole geslaagd

- [x] Klasseberekening en actuele gewogen scoregrenzen zichtbaar; Lyme-schatting 2017, Borrelia-bron/methode en binnenlandse versus totale TBE-meldingen verduidelijkt; NL/EN-browsercontrole, mobiele Lyme-pagina en berekeningscontrole geslaagd

- [x] Zeven aangeleverde inconsistenties gecorrigeerd in NL/EN: verwekkerpercentages zonder rangorde, genormaliseerde gewogen provincieklasse, dezelfde TBE-gebieden, genuanceerde tekendichtheid, voorlopige TBE-jaarcijfers zonder seizoen 2026, lokale TBE-noemer en alfa-gal zonder verwekker; browsercontrole op telefoon en computer zonder fouten

- [x] Medisch misleidende ranglijsten, risicoclaims en gidsgrenzen in NL/EN gecorrigeerd
- [ ] Externe medische inhoudscontrole en formele MDR-beoordeling — externe deskundigen nodig

- [x] Aangeleverde beoordeling toetsen: medische formuleringen, AI-afbakening, onderzoek/privacy en risico-indicaties in Nederlands en Engels
- [x] Medisch betrouwbaardere formuleringen doorgevoerd: 24 uur niet als veilige grens, TBE-overdracht genuanceerd, verwijderen/reinigen en vastleggen verduidelijkt, EM/klachten beschrijvend, behandeling brongebonden en risico-indicaties epidemiologisch afgebakend
- [x] Grenzen benoemen: onafhankelijke medische/MDR-beoordeling en niet-geverifieerde afspraken met AI-verwerkers
- [ ] Onafhankelijke medische inhoudscontrole en formele MDR-beoordeling — vereisen arts en bevoegde beoordelaar
- [x] Beheerder bevestigt op 23 oktober 2026 betaald Gemini API-gebruik en acceptatie van CDPA/SCC’s; officiële Google-voorwaarden en misbruikbeleid nagekeken. Accountdocumenten niet onafhankelijk ingezien; geen algemene AVG-garantie.
- [x] TBE-stip Friesland naar Terschelling verplaatst; gemeentekoppeling niet langer Ameland
- [x] Changelog en Beveiligingsscan op actuele datum (5 oktober 2026) gebracht; changelog-formuleringen netter gemaakt; beide blijven automatisch bijwerken
- [x] Help > Veelgestelde vragen: verklarende woordenlijst uitgebreid van 61 naar 93 begrippen (NL en EN), alfabetisch gesorteerd, gecontroleerd op telefoonformaat
- [x] Verklarende woordenlijst klapbaar gemaakt met + in dezelfde stijl als de vragen ervoor; zoeken in Help opent de lijst automatisch en springt naar het begrip
- [x] Help > Veelgestelde vragen: verklarende woordenlijst toegevoegd — 61 begrippen, alfabetisch in het Nederlands en het Engels, met eigen Help-zoekresultaten per begrip

- [x] Tekenmeldingen-pagina zelf: D/H-icoontjes toegepast bij de soortkeuze, bij de titel van elke melding en in het filter boven de kaart, NL/EN en gecontroleerd op telefoonformaat

- [x] Help > Tekenmeldingen: icoontjes bij de uitleg over de stippen (paars D Vlekkenteek, blauw H Reuzenteek, rood Bekende TBE-vindplaats), NL/EN en gecontroleerd op telefoon en computer

- [x] Teken meldingen na Tekensoorten: Vlekkenteek (paars) en Reuzenteek (blauw), bronverifieerbare historische kaartlocaties van NVWA/RIVM en aanvullend onderzoek; Tekenradar zonder openbare soortlocaties; NL/EN en schermcontrole

- [x] Foto’s zichtbaar in tussentijds en eindrapport; meenemen naar eindrapport en bij herhaald openen van pdf

- [x] Ziekte- en provinciecijfers uit database (RIVM-meldingen) i.p.v. hardcoded percentages
- [x] Actieve tekenbeten-telling: datum, locatie en tekensoort vastleggen bij elke scan; seizoensblok groeit mee
- [x] Provinciekaart opnieuw laden bij taalwissel (geen cache)
- [x] Provinciekaart bijwerken met TBE-cijfers 2025 en Tekenradar-jaarcijfer 10.795 meldingen
- [x] Tekenradar-jaarcijfers als echte dataset (tabel + automatische update, seizoenskaart reageert erop)
- [x] Eén app-gestuurd startscherm in browser en iOS-installatie: 5 seconden zichtbaar, 0,6 seconde fade-out, daarna cookie-popup
- [x] TekenbeetGids-startschermen vernieuwd: eerste upload liggend, tweede upload staand
- [x] Afgeronde TekenbeetGids-registraties automatisch beveiligd opslaan, foto’s uitsluiten en schermgeheugen wissen
- [x] Alleen beheerder kan registraties teruglezen via afgeschermd beheeroverzicht
- [x] Toegankelijkheidsverklaring en Privacyverklaring Gezondheidsgegevens met links in Help, juridische pagina’s en cookievenster
- [x] Opt-out: deelname aan onderzoek intrekken met deelnamenummer (beveiligd als contactformulier, mail-melding, sheetrij gewist)
- [x] Help-blok Deelnemen aan onderzoek bijgewerkt (toestemming, foto's, beveiligde opslag, opt-out)

- [x] Gemeenten-knop, zoeken op gemeentenaam en gemeentegrenzen op de kaart
- [x] Cijfers per gemeente (CBS inwoners, oppervlakte, bos/natuur, groen-indicatie, TBE in de buurt)
- [x] Help-blok "Gemeenten" (NL/EN) en vertalingen, gecontroleerd op telefoon, tablet en computer
- [x] TBE-teksten per provincie kloppend gemaakt (woonprovincie, besmetting kan elders zijn opgelopen)
- [x] Teken meldingen: uitleg waarom melden bij de NVWA, meldlink bij elke tekensoort, Help-blok 'Teken meldingen' en stap onder 'Zo werkt het' (NL/EN)
- [x] TBE-meldingen en TBE-verloop samengevoegd in één kaartje bij alle provincies
- [x] Vergrootglas-symbool in de zoekbalk van de tab Gemeenten
- [x] Gekleurde meldingsstippen bij Provincies en Gemeenten: stip na de naam in beide lijsten, rij in het gemeentepaneel, blok in het provinciepaneel en in de provincie-popup (NL/EN), getest op telefoon, tablet-formaat en computer
- [x] Groen-indicatie in het provinciepaneel verplaatst naar direct boven de Habitat-kolom (dubbel blok bovenaan verwijderd), gecontroleerd op telefoonformaat
- [x] Help-teksten Provincies en Gemeenten aangevuld: groen-indicatie bij provincies, TBE per jaar en verloop met woonprovincie-toelichting, TBE-vindplaatsen per gemeente (NL/EN, gecontroleerd op telefoonformaat)
- [x] Tekenmeldingen: bronlabel boven elke melding en in elke pop-up (Bevestigde NVWA-vondst / Onderzoek met NVWA-CMV en RIVM / Wetenschappelijk onderzoek — geen NVWA-melding), NL en EN
- [x] Help-blok Tekenmeldingen: nieuw item "Wat betekenen de stippen op de kaart?" boven "Waarom melden bij de NVWA?", zeven punten over stippen, posities en klikken (NL/EN, gecontroleerd op telefoonformaat)
- [x] TekenbeetGids vraag 3 en vraag 5: AI-teksten van inleiding, upload en verklaring aangepast (NL/EN), gecontroleerd in de gids zelf
- [x] Publiceren: deze sessie staat live op tekenrisicokaart.nl en tekenbeetgids.nl (19 oktober 2026); hierdoor draait de wekelijkse back-up weer (sleutelafleiding verlaagd naar de bovengrens van de serveromgeving; oudere back-ups blijven te openen met het eigen script)
- [x] Besluit: knop "Verder zonder AI-vergelijking" bij vraag 3 en 5 behouden — AI-gebruik blijft expliciete keus
- [x] Handmatige tekensoortvraag toegevoegd: kiest u bij vraag 5 "Verder zonder AI-vergelijking", dan volgt de vraag "Welke teek was het?" met de zes mensen-bijtende soorten en "weet ik niet" (NL/EN)
- [x] Besluit: beide scanuitkomsten alleen na afzonderlijke gebruikersbevestiging overnemen in gidsvragen; geen automatische overname na fotoverwerkingstoestemming.

- [x] Aanvinklijsten in de gids links uitgelijnd (hokje en tekst op gelijke linkerrand, vraag over lichaamspartijen en vraag over klachten); klachtentekst iets kleiner en hokjes groeien mee met twee-regelige regels zodat niets meer buiten de rand loopt; NL/EN op telefoon en computer gecontroleerd

- [x] Beginschermkop van de gids omgezet naar "Gids na een tekenbeet: educatieve vragenlijst en persoonlijk overzicht" (EN: "Guide after a tick bite: educational questionnaire and personal record"); looptekst en educatieve afbakening onveranderd, NL/EN op telefoonformaat gecontroleerd

- [x] Datum- en bronvermelding van de gids van boven naar onderaan het beginscherm verplaatst, op dezelfde lettergrootte en kleur als de andere alinea's (NL/EN gecontroleerd op telefoonformaat, de knop blijft de laatste regel); cookieknop 'Alles accepteren' heet in het Engels nu 'Accept all'

- [x] Afsluitende zin op het gidsbeginscherm: 'logboek' vervangen door 'gids' — 'Dit is een informatieve gids, geen medisch advies.' (Engels: 'This is an informative guide, not medical advice.'); blijft als laatste regel onderaan het tekstvak, op dezelfde lettergrootte als de andere alinea's

- [ ] PDF-toegankelijkheid en AI-beperking: PDF-maker herbouwd met echte selecteerbare tekst (geen schermafbeeldingen meer), documenttaal en leesvolgorde; vaste zin over de grens van de AI-fotoscan toegevoegd vóór de scan, bij de uitkomst en in het rapport (NL/EN); toegankelijkheidsverklaring eerlijk bijgewerkt. Verificatie (tekstuittreksel uit gegenereerde PDF, tests, browser) loopt nog. Niet gepubliceerd.
