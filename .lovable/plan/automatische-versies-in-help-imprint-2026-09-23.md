# Automatische versies in Help > Imprint

## Resultaat
Onder **Help > Imprint** worden voortaan afzonderlijk en automatisch de actuele versies getoond van:
- de website en web-app;
- de iconen van TekenRisicoKaart en TekenbeetGids;
- de startschermen van TekenRisicoKaart en TekenbeetGids.

## Aanpak
1. Breid de bestaande versiegenerator uit met aparte inhoudscontroles voor beide iconensets en beide startschermsets.
2. Bepaal de websiteversie automatisch uit de actuele websitebestanden, zonder handmatige versienummers.
3. Laat deze generator bij iedere productie-update automatisch draaien, vóórdat de website wordt samengesteld.
4. Toon de afzonderlijke versies duidelijk in het Imprint en gebruik dezelfde waarden voor cacheverversing van iconen en startschermen.
5. Controleer de Nederlandse en Engelse Imprint-weergave en verifieer dat de website zonder fouten opent.

## Technische details
De versies worden korte, reproduceerbare inhoudshashes. Alleen een gewijzigde categorie krijgt daardoor een nieuw versienummer; een wijziging aan een startscherm verandert bijvoorbeeld niet onnodig de icoonversie.
