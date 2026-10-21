# Plan: TekenbeetGids startschermen, beveiligde registraties en verklaringen

## Resultaat
- Het eerste aangeleverde beeld wordt het liggende startscherm; het tweede het staande startscherm.
- Iedere afgeronde registratie van een tekenbeet en huidreactie wordt automatisch beveiligd opgeslagen.
- Alleen de beheerder met de bestaande adminrol kan registraties teruglezen; bezoekers en andere ingelogde gebruikers krijgen geen toegang.
- Na succesvolle opslag worden ingevulde antwoorden en foto’s uit het zichtbare scherm en browsergeheugen verwijderd.
- Er komen een Toegankelijkheidsverklaring en een aparte Privacyverklaring Gezondheidsgegevens, in Nederlands en Engels.
- Beide verklaringen worden gelinkt onder Help, op juridische pagina’s en in het cookievenster.

## Uitvoering
1. **Startschermen**
   - Upload beide aangeleverde beelden als vaste websitebestanden.
   - Koppel foto 1 aan liggende schermen en foto 2 aan staande schermen.
   - Behoud de bestaande vijf seconden weergave en vloeiende uitfade.

2. **Beveiligde automatische registratie**
   - Maak een aparte afgeschermde gegevenslijst voor afgeronde TekenbeetGids-registraties.
   - Sla alleen de feitelijk ingevulde wizardgegevens en het persoonlijke overzicht op; foto’s blijven buiten de opslag.
   - Laat schrijven uitsluitend via een beveiligde serverhandeling verlopen, met strikte invoercontrole, begrenzing en misbruikbeperking.
   - Sta lezen uitsluitend toe aan de bestaande adminrol; directe publieke lees-, wijzig- en verwijdertoegang blijft geblokkeerd.
   - Voeg de registraties toe aan de bestaande beheeromgeving, gescheiden van vrijwillige onderzoeksdeelnames.
   - Stuur deze automatische registraties niet naar Google Sheets en niet naar chat- of AI-prompts.

3. **Wissen na afronding**
   - Toon een korte opslagbevestiging met registratienummer.
   - Wis daarna de ingevulde wizardstatus en tijdelijke fotoverwijzingen uit het scherm en browsergeheugen.
   - Bij een opslagfout blijven de gegevens tijdelijk staan zodat de gebruiker opnieuw kan proberen; er wordt niet onterecht “opgeslagen” gemeld.

4. **Nieuwe verklaringen**
   - Maak een WCAG 2.2-georiënteerde Toegankelijkheidsverklaring met status, bekende beperkingen, maatregelen en meldmogelijkheid.
   - Maak een Privacyverklaring Gezondheidsgegevens met gegevenscategorieën, doel, grondslag, toegang, bewaartermijn, beveiliging, rechten, AI/foto-afbakening en onderzoeksafbakening.
   - Werk de bestaande algemene privacytekst bij zodat die niet langer ten onrechte zegt dat er geen gezondheidsgegevens worden opgeslagen.
   - Vermeld vóór het starten en bij afronding helder dat registratie automatisch wordt opgeslagen en alleen door de beheerder kan worden ingezien.

5. **Links en vertaling**
   - Voeg beide links toe onder Help naast Cookiebeleid, Privacyverklaring en Gebruiksvoorwaarden.
   - Voeg beide links toe aan het cookievenster en de voettekst van alle juridische pagina’s.
   - Voeg inhoudelijke Engelse versies en correcte Engelse titels/metadata toe.

6. **Controle**
   - Controleer staand en liggend op telefoon en desktop.
   - Test afronding, opslagbevestiging en het wissen van de wizard.
   - Controleer zonder login dat registraties niet leesbaar zijn en met adminlogin dat ze wel zichtbaar zijn.
   - Controleer alle nieuwe links, beide talen, typecontrole en de eerdere modulelaadfout.

## Technische details
- Nieuwe gegevenslijst met rijbeveiliging: geen publieke leesrechten; alleen admin-selectie via de bestaande servergevalideerde rol.
- Publieke registratiehandeling accepteert uitsluitend gevalideerde, begrensde velden en gebruikt geen door de bezoeker aangeleverde eigenaar-ID.
- Foto’s worden niet duurzaam opgeslagen; automatische registraties blijven gescheiden van vrijwillige onderzoeksdeelname.
- De bewaartermijn wordt in de gezondheidsprivacyverklaring vastgelegd en technisch ondersteund met beheer/verwijdermogelijkheden.
