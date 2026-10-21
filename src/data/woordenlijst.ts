/* Verklarende woordenlijst onder Help → Veelgestelde vragen.
 * Elk begrip staat er in het Nederlands en het Engels; de lijst wordt per taal
 * op alfabetische volgorde gezet. De uitleg is kort en beschrijvend: een begrip is
 * geen medisch advies en geen vervanging van de eigen ziekte- of provinciekaart. */

export type Woord = {
  /** Nederlandse term zoals die op de site voorkomt */
  nl: string;
  /** Engelse term */
  en: string;
  /** Korte Nederlandse uitleg */
  uitleg: string;
  /** Korte Engelse uitleg */
  uitlegEn: string;
};

export const WOORDENLIJST: Woord[] = [
  {
    nl: "Aantoning", en: "Detection",
    uitleg: "Een ziekteverwekker is ergens daadwerkelijk vastgesteld, bijvoorbeeld TBE-virus of antistoffen in teken of wild. 'Nog niet aangetoond' betekent alleen dat er nog niets is gevonden, niet dat een risico is uitgesloten.",
    uitlegEn: "A pathogen has actually been found somewhere, for example TBE virus or antibodies in ticks or wildlife. 'Not yet detected' only means nothing has been found yet, not that a risk is excluded.",
  },
  {
    nl: "Aanwijzing (minimaal tot zeer sterk)", en: "Indication (minimal to very strong)",
    uitleg: "Klassen op de ziektekaarten die aangeven hoe sterk de cijfers wijzen op aanwezigheid van die ziekte in een provincie. Het is een aanduiding op basis van onderzoek, geen meting op een specifieke plek.",
    uitlegEn: "Classes on the disease cards showing how strongly the figures point to that disease being present in a province. It is an indication based on research, not a measurement at a specific location.",
  },
  {
    nl: "AI-scan (fotoherkenning)", en: "AI scan (photo recognition)",
    uitleg: "Automatische herkenning van een foto van een teek of bult, vergeleken met een referentiedatabase. De uitslag is een indicatie en geen diagnose; vóór de scan staat een eigen melding over hoe dit werkt.",
    uitlegEn: "Automatic recognition of a photo of a tick or a bump, compared with a reference database. The result is an indication and not a diagnosis; a separate notice explains how this works before the scan.",
  },
  {
    nl: "AI-verordening", en: "AI Act",
    uitleg: "Europese regels voor gebruik van kunstmatige intelligentie. Voor deze website betekent dat vooral transparant uitleggen wat de AI-scan doet en wat hij niet kan.",
    uitlegEn: "European rules for the use of artificial intelligence. For this website that mainly means transparently explaining what the AI scan does and what it cannot do.",
  },
  {
    nl: "Alfa-galsyndroom", en: "Alpha-gal syndrome",
    uitleg: "Allergische aandoening die na een tekenbeet kan ontstaan. Het alpha-gal-molecuul uit teekspeeksel kan een immuunreactie op zoogdierproducten uitlokken; er is geen ziekteverwekker.",
    uitlegEn: "Allergic condition that can develop after a tick bite. The alpha-gal molecule in tick saliva may trigger an immune response to mammalian products; no pathogen is involved.",
  },
  {
    nl: "Analytische cookies", en: "Analytical cookies",
    uitleg: "Cookies die bijhouden hoe bezoekers de website gebruiken. Op deze site worden ze nu niet geplaatst; mocht dat veranderen, dan alleen met uw toestemming in de cookiemelding.",
    uitlegEn: "Cookies that record how visitors use the website. They are not placed on this site now; if that ever changes, only with your consent in the cookie notice.",
  },
  {
    nl: "Anaplasmose", en: "Anaplasmosis",
    uitleg: "Bacteriële ziekte met hoge koorts, hoofdpijn en verlaagde witte bloedcellen; in Nederlandse teken in ongeveer 1% aangetoond.",
    uitlegEn: "Bacterial disease with high fever, headache and low white blood cells; demonstrated in about 1% of Dutch ticks.",
  },
  {
    nl: "Antibiotica", en: "Antibiotics",
    uitleg: "Geneesmiddelen tegen bepaalde bacteriële infecties. Een arts bepaalt of, welk middel en welke duur passend zijn. Antibiotica werken niet tegen TBE, omdat TBE door een virus wordt veroorzaakt.",
    uitlegEn: "Medicines for certain bacterial infections. A doctor determines whether they are appropriate, and which medicine and duration to use. Antibiotics do not work against TBE because TBE is caused by a virus.",
  },
  {
    nl: "Antistoffen", en: "Antibodies",
    uitleg: "Eiwitten die een lichaam maakt na contact met een ziekteverwekker. Antistoffen in een teek of dier wijzen op contact met bijvoorbeeld het TBE-virus, ook als het virus zelf niet meer wordt gevonden.",
    uitlegEn: "Proteins a body makes after contact with a pathogen. Antibodies in a tick or animal point to contact with, for example, the TBE virus, even when the virus itself is no longer found.",
  },
  {
    nl: "AVG (GDPR)", en: "GDPR",
    uitleg: "Europese privacywet. In de privacyverklaringen van deze site staat welke gegevens worden verwerkt, waarom, door wie en hoe lang.",
    uitlegEn: "European privacy law. The privacy statements on this site explain which data is processed, why, by whom and for how long.",
  },
  {
    nl: "Babesiose", en: "Babesiosis",
    uitleg: "Parasiet in de rode bloedcellen, overdraagbaar door een tekenbeet; de standaard antibiotica tegen Lyme werken hier niet tegen.",
    uitlegEn: "Parasite in the red blood cells, transmissible by a tick bite; the standard antibiotics against Lyme do not work against it.",
  },
  {
    nl: "Bartonellose", en: "Bartonellosis",
    uitleg: "Bacterie die wél in Nederlandse teken wordt aangetroffen, maar waarvan overdracht via een tekenbeet niet wetenschappelijk is vastgesteld; de kaart is opgenomen omdat de vraag in de praktijk vaak wordt gesteld.",
    uitlegEn: "Bacterium that is found in Dutch ticks, but for which transmission via a tick bite has not been scientifically established; the card is included because the question is frequently asked in practice.",
  },
  {
    nl: "Besmettingsgraad", en: "Infection rate",
    uitleg: "Aandeel van de teken dat een ziekteverwekker bij zich draagt, weergegeven in klassen: zeer laag (<1%), laag (1–3%), matig (3–10%), hoog (10–20%) en zeer hoog (>20%).",
    uitlegEn: "Share of ticks carrying a pathogen, shown in classes: very low (<1%), low (1–3%), moderate (3–10%), high (10–20%) and very high (>20%).",
  },
  {
    nl: "Bevestigde vondst", en: "Confirmed finding",
    uitleg: "Een teek waarvan de soort door een officiële instantie of in een publicatie is vastgesteld, bijvoorbeeld door soortbepaling bij de NVWA. Bij Tekenmeldingen gaat het om zulke historische vondsten.",
    uitlegEn: "A tick whose species has been established by an official body or in a publication, for example through species determination by the NVWA. The Tick reports concern such historical findings.",
  },
  {
    nl: "Borrelia", en: "Borrelia",
    uitleg: "Geslacht van bacteriën. Borrelia burgdorferi veroorzaakt de ziekte van Lyme; Borrelia miyamotoi veroorzaakt de Borrelia miyamotoi-ziekte.",
    uitlegEn: "Genus of bacteria. Borrelia burgdorferi causes Lyme disease; Borrelia miyamotoi causes Borrelia miyamotoi disease.",
  },
  {
    nl: "Borrelia miyamotoi-ziekte", en: "Borrelia miyamotoi disease",
    uitleg: "Bacteriële ziekte met terugkerende koortsaanvallen zonder rode ring; de standaard Lymetesten detecteren deze niet.",
    uitlegEn: "Bacterial disease with recurring fever attacks without a red ring; the standard Lyme tests do not detect it.",
  },
  {
    nl: "Bruine hondenteek", en: "Brown dog tick",
    uitleg: "Tekensoort (Rhipicephalus sanguineus) die vooral honden bijt en in Nederland door de NVWA wordt gemonitord.",
    uitlegEn: "Tick species (Rhipicephalus sanguineus) that mainly bites dogs and is monitored in the Netherlands by the NVWA.",
  },
  {
    nl: "CBS", en: "CBS (Statistics Netherlands)",
    uitleg: "Centraal Bureau voor de Statistiek: de officiële inwonertallen per provincie en gemeente en de bodemgebruikcijfers achter de groen-indicatie.",
    uitlegEn: "Netherlands Central Bureau of Statistics: the official population figures per province and municipality and the land-use figures behind the green indication.",
  },
  {
    nl: "CCHF", en: "CCHF",
    uitleg: "Krim-Congo hemorragische koorts: in Nederland nooit aangetoond bij mens of teek, daarom overal risicoklasse 'Geen'. In Europa is het virus wel in opmars, onder meer in Spanje, op de Balkan, in Griekenland, Turkije en Bulgarije.",
    uitlegEn: "Crimean-Congo haemorrhagic fever: never demonstrated in humans or ticks in the Netherlands, hence risk class 'None' everywhere. In Europe the virus is spreading, including in Spain, the Balkans, Greece, Turkey and Bulgaria.",
  },
  {
    nl: "Centrum Monitoring Vectoren (CMV)", en: "Vector Monitoring Centre (CMV)",
    uitleg: "Het meldpunt van de NVWA voor organismen die ziekten kunnen overdragen, waaronder teken. Meldingen van de reuzenteek en de vlekkenteek lopen hier via.",
    uitlegEn: "The NVWA's reporting point for organisms that can transmit diseases, including ticks. Reports of the giant tick and the ornate dog tick go through here.",
  },
  {
    nl: "Changelog", en: "Changelog",
    uitleg: "Openbaar overzicht van wat er op deze website en web-app is gewijzigd, per datum en zonder technische details.",
    uitlegEn: "Public overview of what has changed on this website and web app, per date and without technical details.",
  },
  {
    nl: "Deelnamenummer", en: "Participation number",
    uitleg: "Uniek nummer dat u krijgt bij vrijwillige deelname aan onderzoek. Alleen dat nummer verbindt de inzending aan u; naam, adres en e-mailadres worden niet bewaard. Met dit nummer kunt u uw deelname ook weer intrekken.",
    uitlegEn: "Unique number you receive when you take part in research voluntarily. Only that number links the submission to you; name, address and email address are not stored. You can use this number to withdraw your participation again.",
  },
  {
    nl: "Dermacentor reticulatus", en: "Dermacentor reticulatus",
    uitleg: "Wetenschappelijke naam van de vlekkenteek. De paarse stippen bij Tekenmeldingen tonen bevestigde vondsten van deze soort.",
    uitlegEn: "Scientific name of the ornate dog tick. The purple dots under Tick reports show confirmed findings of this species.",
  },
  {
    nl: "Dierlijk reservoir", en: "Animal reservoir",
    uitleg: "Dierenpopulatie waarin een ziekteverwekker in stand blijft, zoals reeën en kleine zoogdieren bij het TBE-virus. Teken kunnen er tijdens een beet aan worden blootgesteld.",
    uitlegEn: "Animal population in which a pathogen persists, such as deer and small mammals for the TBE virus. Ticks can be exposed to it while biting.",
  },
  {
    nl: "Driedelige TBE-kaart", en: "Three-class TBE map",
    uitleg: "Onderverdeling van de TBE-markeringen: een humaan geval in die regio, virus of antistoffen aangetoond in teken of wild, of nog niet aangetoond. Die laatste klasse sluit TBE niet uit.",
    uitlegEn: "Subdivision of the TBE markers: a human case in that region, virus or antibodies demonstrated in ticks or wildlife, or not yet demonstrated. The last class does not exclude TBE.",
  },
  {
    nl: "Duiventeek", en: "Pigeon tick",
    uitleg: "Tekensoort (Argas reflexus) die vooral bij duiven leeft en zich overdag verstopt.",
    uitlegEn: "Tick species (Argas reflexus) that lives mainly with pigeons and hides during the day.",
  },
  {
    nl: "DWHC", en: "DWHC",
    uitleg: "Dutch Wildlife Health Centre: surveillance van wilde dieren, waaronder reeën, en de overzichtskaart van het TBE-virus in Nederland.",
    uitlegEn: "Dutch Wildlife Health Centre: surveillance of wild animals, including deer, and the overview map of the TBE virus in the Netherlands.",
  },
  {
    nl: "ECDC", en: "ECDC",
    uitleg: "Europees Centrum voor ziektepreventie en -bestrijding: bron voor de Europese verspreiding van TBE, CCHF en de reuzenteek.",
    uitlegEn: "European Centre for Disease Prevention and Control: source for the European spread of TBE, CCHF and the giant tick.",
  },
  {
    nl: "Ehrlichiose", en: "Ehrlichiosis",
    uitleg: "Bacteriële ziekte die niet bij de elf ziekten op deze site staat: Ehrlichia is in Nederlandse teken of patiënten nog niet vastgesteld.",
    uitlegEn: "Bacterial disease not among the eleven diseases on this site: Ehrlichia has not yet been demonstrated in Dutch ticks or patients.",
  },
  {
    nl: "Egelteek", en: "Hedgehog tick",
    uitleg: "Tekensoort (Ixodes hexagonus) die vooral egels bijt.",
    uitlegEn: "Tick species (Ixodes hexagonus) that mainly bites hedgehogs.",
  },
  {
    nl: "EHDS / HDAB", en: "EHDS / HDAB",
    uitleg: "EHDS is de Europese ruimte voor gezondheidsgegevens. HDAB (Health Data Access Body) is een toegangsinstantie voor hergebruik van gezondheidsgegevens, geen aparte wet of certificering. Toekomstige aansluiting vraagt een afzonderlijke beoordeling.",
    uitlegEn: "EHDS is the European Health Data Space. HDAB (Health Data Access Body) is an access body for reuse of health data, not a separate law or certification. Any future connection requires a separate assessment.",
  },
  {
    nl: "Eindrapport", en: "Final report",
    uitleg: "Samenvatting die TekenbeetGids maakt na de wizard, inclusief het tussentijdse rapport en de foto's. U kunt het printen of als pdf opslaan om mee te nemen naar uw huisarts.",
    uitlegEn: "Summary that TekenbeetGids produces after the wizard, including the interim report and the photos. You can print it or save it as a pdf to take to your doctor.",
  },
  {
    nl: "Erythema migrans", en: "Erythema migrans",
    uitleg: "Medische naam voor een groter wordende rode of blauwrode vlek of ring die na een tekenbeet kan optreden en bij de ziekte van Lyme kan passen. Alleen een arts kan beoordelen of een huidverandering erythema migrans is.",
    uitlegEn: "Medical term for an expanding red or bluish-red patch or ring that may occur after a tick bite and can be consistent with Lyme disease. Only a doctor can assess whether a skin change is erythema migrans.",
  },
  {
    nl: "Erasmus MC (Viroscience)", en: "Erasmus MC (Viroscience)",
    uitleg: "Referentiediagnostiek en onderzoek naar het TBE-virus bij mens en teek in Nederland.",
    uitlegEn: "Reference diagnostics and research into the TBE virus in humans and ticks in the Netherlands.",
  },
  {
    nl: "et al.", en: "et al.",
    uitleg: "Latijn voor 'en anderen'. Bij een bron als 'Wijburg et al. 2026' staat dit achter de namen van onderzoekers die een wetenschappelijke publicatie hebben geschreven.",
    uitlegEn: "Latin for 'and others'. In a source such as 'Wijburg et al. 2026' it follows the names of researchers who wrote a scientific publication.",
  },
  {
    nl: "GGD", en: "GGD (public health service)",
    uitleg: "Gemeentelijke gezondheidsdienst: regionale infectieziektebestrijding, vaccinatie en voorlichting.",
    uitlegEn: "Municipal public health service: regional infectious disease control, vaccination and information.",
  },
  {
    nl: "GGD GHOR Nederland", en: "GGD GHOR Nederland",
    uitleg: "Landelijke vereniging van de GGD'en en de GHOR: kennisnetwerk voor infectieziektebestrijding en afstemming tussen de GGD-regio's.",
    uitlegEn: "National association of the GGDs and the GHOR: knowledge network for infectious disease control and coordination between the GGD regions.",
  },
  {
    nl: "GHOR", en: "GHOR",
    uitleg: "Geneeskundige Hulporganisatie bij Rampen: zorgorganisatie bij grootschalige incidenten, aangesloten bij GGD GHOR Nederland.",
    uitlegEn: "Medical Assistance Organisation in Disasters: care organisation for large-scale incidents, part of GGD GHOR Nederland.",
  },
  {
    nl: "Gevest (soort)", en: "Established (species)",
    uitleg: "Een tekensoort die in Nederland jaarlijks haar levenscyclus kan voltooien en blijft voorkomen. De vlekkenteek is hier gevestigd; de reuzenteek niet.",
    uitlegEn: "A tick species that can complete its life cycle in the Netherlands year after year and remains present. The ornate dog tick is established here; the giant tick is not.",
  },
  {
    nl: "Groen-indicatie", en: "Green indication",
    uitleg: "Hoeveel bos en natuur een provincie of gemeente heeft in vergelijking met alle gemeenten, van 'Zeer weinig' tot 'Zeer veel'. Berekend uit CBS-bodemgebruikcijfers; het is een aanduiding van leefgebied en geen gemeten tekendichtheid.",
    uitlegEn: "How much forest and nature a province or municipality has compared with all municipalities, from 'Very little' to 'Very much'. Calculated from CBS land-use figures; it indicates habitat and is not a measured tick density.",
  },
  {
    nl: "Haard (lokale haard)", en: "Focus (local focus)",
    uitleg: "Klein gebied waar het TBE-virus werkelijk zit. 'Aangetoond' in een provincie betekent dat het virus ergens daarin is gevonden, niet dat het overal voorkomt.",
    uitlegEn: "Small area where the TBE virus is actually present. 'Detected' in a province means the virus was found somewhere in it, not that it occurs everywhere.",
  },
  {
    nl: "Habitat", en: "Habitat",
    uitleg: "Leefomgeving van de teek in een provincie of gemeente: bos, heide, duin, struweel of park. Meer geschikt habitat betekent meestal meer teken.",
    uitlegEn: "Living environment of the tick in a province or municipality: forest, heath, dunes, undergrowth or park. More suitable habitat usually means more ticks.",
  },
  {
    nl: "Humaan geval", en: "Human case",
    uitleg: "Een ziektegeval bij een mens. Bij TBE maakt de kaart onderscheid tussen een humaan geval en virus of antistoffen die alleen in teken of wild zijn aangetoond.",
    uitlegEn: "A case of disease in a person. For TBE the map distinguishes a human case from virus or antibodies demonstrated only in ticks or wildlife.",
  },
  {
    nl: "Huisartsrapport", en: "GP report",
    uitleg: "Rapport van TekenbeetGids dat u kunt printen of als pdf opslaan om mee te nemen naar uw huisarts. Het bevat uw eigen antwoorden en de foto's, niet een diagnose.",
    uitlegEn: "Report from TekenbeetGids that you can print or save as a pdf to take to your doctor. It contains your own answers and the photos, not a diagnosis.",
  },
  {
    nl: "Hyalomma marginatum", en: "Hyalomma marginatum",
    uitleg: "Wetenschappelijke naam van de reuzenteek. De blauwe stippen bij Tekenmeldingen tonen bevestigde vondsten van deze soort.",
    uitlegEn: "Scientific name of the giant tick. The blue dots under Tick reports show confirmed findings of this species.",
  },
  {
    nl: "Incubatietijd", en: "Incubation period",
    uitleg: "Tijd tussen de tekenbeet en de eerste klachten. Die verschilt per ziekte en staat op de kaart van die ziekte.",
    uitlegEn: "Time between the tick bite and the first symptoms. It differs per disease and is stated on that disease's card.",
  },
  {
    nl: "Immuungecompromitteerd", en: "Immunocompromised",
    uitleg: "Iemand met een verzwakt afweersysteem, bijvoorbeeld door medicijnen of een ziekte. Bij sommige tekenbeetziekten kan het verloop dan ernstiger zijn.",
    uitlegEn: "A person with a weakened immune system, for example through medication or an illness. For some tick-borne diseases the course can then be more severe.",
  },
  {
    nl: "Ixodes ricinus", en: "Ixodes ricinus",
    uitleg: "Wetenschappelijke naam van de schapenteek, veruit de meest voorkomende teek in Nederland en de belangrijkste overdrager van tekenbeetziekten.",
    uitlegEn: "Scientific name of the castor bean tick, by far the most common tick in the Netherlands and the main transmitter of tick-borne diseases.",
  },
  {
    nl: "LabMicTA", en: "LabMicTA",
    uitleg: "Regionaal laboratorium voor medische microbiologie: diagnostiek van TBE en andere tekenbeetziekten in Oost-Nederland.",
    uitlegEn: "Regional laboratory for medical microbiology: diagnostics of TBE and other tick-borne diseases in the eastern Netherlands.",
  },
  {
    nl: "Larve en nymf", en: "Larva and nymph",
    uitleg: "Vroege stadia van de teek: een larve heeft zes poten, een nymf acht en is ongeveer zo groot als een speldenkop. Nymfen zijn moeilijk te zien en bijten vooral in voorjaar en zomer.",
    uitlegEn: "Early stages of the tick: a larva has six legs, a nymph eight and is about the size of a pinhead. Nymphs are hard to see and bite mainly in spring and summer.",
  },
  {
    nl: "LCI", en: "LCI",
    uitleg: "Landelijke Coördinatie Infectieziektebestrijding: richtlijnen voor artsen en GGD'en over verwekker, diagnostiek, behandeling en meldplicht per ziekte.",
    uitlegEn: "National Coordination of Infectious Disease Control: guidelines for doctors and GGDs on pathogen, diagnostics, treatment and reporting duty per disease.",
  },
  {
    nl: "Legitimiteitssignalen", en: "Legitimacy signals",
    uitleg: "Kenmerken waaraan u ziet dat deze websites echt zijn: ze vragen nooit om betaling of inloggegevens, sturen geen ongevraagde berichten en zijn alleen bereikbaar via HTTPS op de officiële domeinen.",
    uitlegEn: "Features that show these websites are genuine: they never ask for payment or login details, send no unsolicited messages and are only reachable via HTTPS on the official domains.",
  },
  {
    nl: "Lymevereniging", en: "Lymevereniging (Lyme patient association)",
    uitleg: "Patiëntenvereniging voor mensen met de ziekte van Lyme en andere tekenbeetziekten: voorlichting over klachten, diagnostiek, behandeling en ervaringen van patiënten.",
    uitlegEn: "Patient association for people with Lyme disease and other tick-borne diseases: information on symptoms, diagnostics, treatment and patient experiences.",
  },
  {
    nl: "Lymfeklieren", en: "Lymph nodes",
    uitleg: "Kleine afweerklieren in hals, oksels en liezen die bij een infectie kunnen opzwellen. Langdurige zwelling staat bij enkele ziekten genoemd als reden om contact op te nemen met een arts.",
    uitlegEn: "Small defence glands in the neck, armpits and groin that can swell during an infection. Prolonged swelling is listed with some diseases as a reason to contact a doctor.",
  },
  {
    nl: "Meldingsplichtig", en: "Notifiable",
    uitleg: "Ziekte die artsen verplicht moeten melden bij het RIVM. TBE is sinds 1 maart 2025 meldingsplichtig.",
    uitlegEn: "Disease that doctors are required to report to the RIVM. TBE has been notifiable since 1 March 2025.",
  },
  {
    nl: "Neoehrlichiose", en: "Neoehrlichiosis",
    uitleg: "Bacteriële ziekte die op Lyme kan lijken; bij mensen met een verzwakt afweersysteem kan het verloop ernstig zijn.",
    uitlegEn: "Bacterial disease that can resemble Lyme; the course can be severe in people with a weakened immune system.",
  },
  {
    nl: "Neurologische klachten", en: "Neurological symptoms",
    uitleg: "Klachten van hersenen, ruggenmerg of zenuwen, zoals hevige hoofdpijn, nekstijfheid of verwardheid. Bij TBE kunnen ze optreden na een griepachtige eerste fase.",
    uitlegEn: "Complaints of the brain, spinal cord or nerves, such as severe headache, neck stiffness or confusion. With TBE they can occur after a flu-like first phase.",
  },
  {
    nl: "NVWA", en: "NVWA",
    uitleg: "Nederlandse Voedsel- en Warenautoriteit: monitort inheemse en exotische tekensoorten en verzorgt de soortbepaling. Meldingen van reuzen- en vlekkenteek gaan via het Centrum Monitoring Vectoren (CMV).",
    uitlegEn: "Dutch Food and Consumer Product Safety Authority: monitors native and exotic tick species and provides species determination. Reports of giant ticks and ornate dog ticks go through the Vector Monitoring Centre (CMV).",
  },
  {
    nl: "Ondergrens", en: "Lower bound",
    uitleg: "Het werkelijke aantal is op minimaal dit cijfer geschat, maar waarschijnlijk hoger, omdat niet elke tekenbeet wordt gemeld.",
    uitlegEn: "The actual number is estimated at this figure at minimum, but is probably higher, because not every tick bite is reported.",
  },
  {
    nl: "Ongepasteuriseerde melk", en: "Unpasteurised milk",
    uitleg: "Melk die niet is verhit om ziekteverwekkers te doden. Rauwmelkse producten kunnen het TBE-virus overdragen.",
    uitlegEn: "Milk that has not been heated to kill pathogens. Raw-milk products can transmit the TBE virus.",
  },
  {
    nl: "Opt-out", en: "Opt-out",
    uitleg: "Mogelijkheid onder Help om uw deelname aan onderzoek in te trekken met uw deelnamenummer; de bijbehorende inzending wordt dan verwijderd.",
    uitlegEn: "Option under Help to withdraw your participation in research using your participation number; the related submission is then deleted.",
  },
  {
    nl: "Peildatum", en: "Reference date",
    uitleg: "Datum waarop de cijfers op deze site voor het laatst zijn bijgewerkt. Per bron kan die verschillen; de actuele peildata staan bij de cijfers.",
    uitlegEn: "Date on which the figures on this site were last updated. It can differ per source; the current reference dates are shown with the figures.",
  },
  {
    nl: "Per 100.000 inwoners", en: "Per 100,000 residents",
    uitleg: "Aantal meldingen omgerekend naar de bevolkingsgrootte, zodat gebieden met verschillend inwonertal beter vergeleken kunnen worden.",
    uitlegEn: "Number of reports converted to population size, so areas with different numbers of residents can be compared better.",
  },
  {
    nl: "Prevalentie", en: "Prevalence",
    uitleg: "Deel van de onderzochte teken dat een ziekteverwekker bij zich draagt. Op de ziektekaarten bepaalt de prevalentie van de verwekker de ziekteklasse van een provincie.",
    uitlegEn: "Share of the examined ticks carrying a pathogen. On the disease cards the prevalence of the pathogen determines a province's disease class.",
  },
  {
    nl: "Reuzenteek", en: "Giant tick",
    uitleg: "Nederlandse naam voor Hyalomma marginatum. Deze soort is in Nederland gevonden op trekvogels en geïmporteerde dieren, maar hier niet gevestigd.",
    uitlegEn: "Dutch name for Hyalomma marginatum. This species has been found in the Netherlands on migratory birds and imported animals, but is not established here.",
  },
  {
    nl: "Rickettsiose", en: "Rickettsiosis",
    uitleg: "Bacteriële ziekte die onder meer koorts en huiduitslag kan geven. Rickettsia-bacteriën worden geregeld in Nederlandse teken gevonden; percentages verschillen per onderzoek.",
    uitlegEn: "Bacterial disease that may cause fever and a rash. Rickettsia bacteria are regularly found in Dutch ticks; percentages vary between studies.",
  },
  {
    nl: "RIVM", en: "RIVM",
    uitleg: "Rijksinstituut voor Volksgezondheid en Milieu: landelijke cijfers over tekenbeten, Lyme en TBE, en samen met Wageningen University & Research de beheerder van Tekenradar.",
    uitlegEn: "National Institute for Public Health and the Environment: national figures on tick bites, Lyme and TBE, and together with Wageningen University & Research the manager of Tekenradar.",
  },
  {
    nl: "Risicoklasse (risiconiveau)", en: "Risk class (risk level)",
    uitleg: "Relatieve indeling van 'Zeer laag' tot 'Zeer hoog' voor provincies en ziekten; 'Geen' komt alleen voor bij CCHF. De provincieklasse gebruikt genormaliseerde meldingen en habitat. Het is geen gemeten tekendichtheid, individuele infectiekans of medische diagnose.",
    uitlegEn: "Indicative classification from 'Very low' to 'Very high' for provinces, municipalities and diseases; 'None' occurs only with CCHF. It is an epidemiological indication based on reports and research, not a measurement of an individual's infection probability and not a medical diagnosis.",
  },
  {
    nl: "Risicoprofiel", en: "Risk profile",
    uitleg: "Persoonlijke kenmerken die de tips in het rapport bepalen: leeftijd, een beroep met veel buitenzijn, eerdere behandelingen en of u tegen TBE bent gevaccineerd.",
    uitlegEn: "Personal characteristics that determine the tips in the report: age, an occupation with much time outdoors, previous treatments and whether you are vaccinated against TBE.",
  },
  {
    nl: "Rode ring", en: "Red ring",
    uitleg: "Een groter wordende rode of blauwrode vlek of ring die rond de beetplek of elders kan ontstaan en bij erythema migrans kan passen. Niet elke huidverandering heeft dezelfde vorm; alleen een arts kan dit beoordelen.",
    uitlegEn: "An expanding red or bluish-red patch or ring that may develop around the bite site or elsewhere and can be consistent with erythema migrans. Skin changes do not always have the same shape; only a doctor can assess this.",
  },
  {
    nl: "Schapenteek", en: "Castor bean tick",
    uitleg: "Meest voorkomende teek in Nederland (Ixodes ricinus); kan Borrelia en andere ziekteverwekkers overdragen.",
    uitlegEn: "Most common tick in the Netherlands (Ixodes ricinus); can transmit Borrelia and other pathogens.",
  },
  {
    nl: "Serologie en seroprevalentie", en: "Serology and seroprevalence",
    uitleg: "Onderzoek dat antistoffen in bloed meet. Seroprevalentie geeft aan welk deel van een groep mensen of dieren al met een ziekteverwekker in contact is geweest, ook als de infectie nooit opviel.",
    uitlegEn: "Research that measures antibodies in blood. Seroprevalence indicates what share of a group of people or animals has had contact with a pathogen, even when the infection was never noticed.",
  },
  {
    nl: "Speeksel (tekenspeeksel)", en: "Saliva (tick saliva)",
    uitleg: "Vloeistof die een teek afgeeft tijdens het zuigen. Er zitten stoffen in die de wond verdoven en het afweersysteem dempen, en ziekteverwekkers die zo op de gebeten persoon of dier overgaan.",
    uitlegEn: "Fluid a tick releases while feeding. It contains substances that numb the wound and dampen the immune response, and pathogens that can pass to the person or animal bitten.",
  },
  {
    nl: "Staat van Infectieziekten", en: "Staat van Infectieziekten (annual RIVM report)",
    uitleg: "Jaarlijkse publicatie van het RIVM over infectieziekten in Nederland. Deze site noemt het als bron bij TBE-gevallen en waarschijnlijke besmettingsplaatsen.",
    uitlegEn: "Annual RIVM publication on infectious diseases in the Netherlands. This site cites it as a source for TBE cases and likely infection locations.",
  },
  {
    nl: "Stichting Tekenbeetziekten", en: "Stichting Tekenbeetziekten (tick-borne disease foundation)",
    uitleg: "Stichting die voorlichting geeft over teken en tekenbeetziekten; hoofdbron voor de beschrijvingen van ziekten, tekensoorten, klachten en preventie op deze site.",
    uitlegEn: "Foundation that provides information about ticks and tick-borne diseases; main source for the descriptions of diseases, tick species, symptoms and prevention on this site.",
  },
  {
    nl: "TBE", en: "TBE",
    uitleg: "Tekenencefalitis: een virale ziekte die door een tekenbeet kan worden overgedragen en waar een vaccin voor bestaat. In Nederland meldingsplichtig; het aantal gevallen per jaar staat bij de provinciecijfers.",
    uitlegEn: "Tick-borne encephalitis: viral disease that can be transmitted by a tick bite and for which a vaccine exists. Notifiable in the Netherlands; the number of cases per year is shown with the province figures.",
  },
  {
    nl: "TBE-stip", en: "TBE dot",
    uitleg: "Stip op de kaart voor een bekende TBE-vindplaats of waarschijnlijke besmettingslocatie. Eén stip is niet één patiënt: provinciecijfers tellen patiënten naar woonprovincie.",
    uitlegEn: "Dot on the map for a known TBE location or likely infection site. One dot is not one patient: province figures count patients by province of residence.",
  },
  {
    nl: "TekenbeetGids", en: "TekenbeetGids (tick bite guide)",
    uitleg: "Onderdeel van deze site dat na een tekenbeet vragen stelt, een tussentijds en een eindrapport maakt en u de mogelijkheid biedt deel te nemen zonder direct identificerende gegevens aan onderzoek. Informatie en inzicht na een tekenbeet.",
    uitlegEn: "Part of this site that asks questions after a tick bite, produces an interim and a final report, and offers you the option to take part in research pseudonymously. Information and insight after a tick bite.",
  },
  {
    nl: "Tekenbeetziekte", en: "Tick-borne disease",
    uitleg: "Verzamelnaam voor ziekten die met een tekenbeet te maken hebben. Deze site toont er elf, elk met een eigen risicokaart en kaart met klachten en behandeling.",
    uitlegEn: "Umbrella term for diseases related to a tick bite. This site shows eleven of them, each with its own risk map and a card with symptoms and treatment.",
  },
  {
    nl: "Tekencheck", en: "Tick check",
    uitleg: "Zelf uw lichaam controleren op teken na een bezoek aan bos, duin, heide of ander groen. De site legt uit waar u op let.",
    uitlegEn: "Checking your own body for ticks after a visit to forest, dunes, heath or other green areas. The site explains what to look for.",
  },
  {
    nl: "Tekenmeldingen", en: "Tick reports",
    uitleg: "Overzicht van bevestigde, historische vondsten van de vlekkenteek (paarse stippen) en de reuzenteek (blauwe stippen). Het is geen volledig of actueel overzicht van deze soorten.",
    uitlegEn: "Overview of confirmed, historical findings of the ornate dog tick (purple dots) and the giant tick (blue dots). It is not a complete or current overview of these species.",
  },
  {
    nl: "Tekenradar", en: "Tekenradar",
    uitleg: "Publieksmeldingen van tekenbeten via Tekenradar.nl van het RIVM en Wageningen University & Research. Niet elke tekenbeet wordt gemeld, dus de aantallen zijn een ondergrens.",
    uitlegEn: "Public reports of tick bites via Tekenradar.nl by the RIVM and Wageningen University & Research. Not every tick bite is reported, so the numbers are a lower bound.",
  },
  {
    nl: "TekenRisicoKaart", en: "TekenRisicoKaart (tick risk map)",
    uitleg: "Kaart van het risico op teken en tekenbeetziekten in Nederland, per provincie, gemeente en ziekte, met seizoenen en TBE-meldingen.",
    uitlegEn: "Map of the risk of ticks and tick-borne diseases in the Netherlands, per province, municipality and disease, with seasons and TBE reports.",
  },
  {
    nl: "Tekenwerende middelen (DEET)", en: "Tick repellents (DEET)",
    uitleg: "Middelen die u op huid of kleding aanbrengt om teken op afstand te houden; DEET is een bekende werkzame stof. Ze weren teken, ze doden ze niet.",
    uitlegEn: "Products applied to skin or clothing to keep ticks away; DEET is a well-known active substance. They repel ticks, they do not kill them.",
  },
  {
    nl: "Tularemie", en: "Tularemia",
    uitleg: "Bacteriële ziekte die in Nederlandse teken is aangetoond; iemand loopt de besmetting primair op via contact met dieren.",
    uitlegEn: "Bacterial disease demonstrated in Dutch ticks; people are primarily infected through contact with animals.",
  },
  {
    nl: "Tussentijds rapport", en: "Interim report",
    uitleg: "Uitkomst van de wizard van TekenbeetGids over de vraag of een rode ring waarschijnlijk is of niet, inclusief de foto's die u hebt gemaakt. Het eindrapport bouwt hierop voort.",
    uitlegEn: "Outcome of the TekenbeetGids wizard on whether a red ring is likely or not, including the photos you took. The final report builds on this.",
  },
  {
    nl: "Uitsluiting niet mogelijk", en: "Cannot be excluded",
    uitleg: "Bij 'TBE nog niet aangetoond' staat dat uitsluiting niet mogelijk is: er is in die regio nog niets gevonden, maar dat betekent niet dat het virus er niet kan voorkomen.",
    uitlegEn: "With 'TBE not yet detected' it states that exclusion is not possible: nothing has been found in that region yet, but that does not mean the virus cannot occur there.",
  },
  {
    nl: "Verwekker", en: "Pathogen",
    uitleg: "Levend agens dat ziekte kan veroorzaken: een bacterie, virus of parasiet. Op deze site is het steeds een verwekker die met teken in verband wordt gebracht.",
    uitlegEn: "Living agent that can cause disease: a bacterium, virus or parasite. On this site it is always a pathogen associated with ticks.",
  },
  {
    nl: "Vlekkenteek", en: "Ornate dog tick",
    uitleg: "Nederlandse naam voor Dermacentor reticulatus. Deze soort is in Nederland gevestigd en breidt zich uit, vooral in het zuidwesten.",
    uitlegEn: "Dutch name for Dermacentor reticulatus. This species is established in the Netherlands and is expanding, especially in the south-west.",
  },
  {
    nl: "Wageningen University & Research (WUR)", en: "Wageningen University & Research (WUR)",
    uitleg: "Universiteit en onderzoeksinstituut: veldonderzoek naar tekendichtheid en besmettingspercentages, en samen met het RIVM achter Tekenradar.",
    uitlegEn: "University and research institute: field research on tick density and infection rates, and behind Tekenradar together with the RIVM.",
  },
  {
    nl: "Watermerk", en: "Watermark",
    uitleg: "Zacht, herhalend tekstpatroon op de achtergrond van een pdf van TekenbeetGids, met de naam en het adres van de website, zodat het document te herkennen is.",
    uitlegEn: "Soft, repeating text pattern in the background of a pdf from TekenbeetGids, with the name and address of the website, so the document is recognisable.",
  },
  {
    nl: "Ziekte van Lyme", en: "Lyme disease",
    uitleg: "Meest voorkomende tekenbeetziekte in Nederland, veroorzaakt door Borrelia-bacteriën. Een rode ring is een bekend vroeg teken.",
    uitlegEn: "Most common tick-borne disease in the Netherlands, caused by Borrelia bacteria. A red ring is a well-known early sign.",
  },
  {
    nl: "Zoonose", en: "Zoonosis",
    uitleg: "Ziekte die onder normale omstandigheden tussen dieren en mensen kan worden overgedragen. Op de ziektekaarten staat bij enkele ziekten dat het een zoonose is.",
    uitlegEn: "Disease that can normally be transmitted between animals and humans. Some disease cards state that the condition is a zoonosis.",
  },
];

/** Lijst in alfabetische volgorde voor de gevraagde taal. */
export function woordenLijstVoor(en: boolean): Woord[] {
  const kolator = new Intl.Collator(en ? "en" : "nl", { sensitivity: "base", numeric: true });
  return [...WOORDENLIJST].sort((a, b) =>
    kolator.compare(en ? a.en : a.nl, en ? b.en : b.nl),
  );
}
