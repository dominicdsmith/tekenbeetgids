import { P } from "@/components/JuridischPagina";
import { useTaal } from "@/lib/taal";

/** Gedeelde bronvermelding voor de juridische documenten, in beide talen. */
export default function BronnenToelichting() {
  const en = useTaal() === "en";
  return <>
    <P>{en
      ? "Figures and information are based on public information from RIVM and its LCI guidelines, the NHG treatment guideline on tick bites and erythema migrans, Tekenradar.nl (RIVM and Wageningen University & Research), Wageningen University & Research / the Dutch tick knowledge network, Stichting Tekenbeetziekten, the Lymevereniging, CBS (population figures and municipality boundaries), NVWA (Centre for Monitoring of Vectors), regional public health services (GGDs), GGD GHOR Nederland and ECDC. Utrecht University, DWHC (Dutch Wildlife Health Centre), Erasmus MC (Viroscience), LabMicTA and Artemis One Health are also cited for research and background information on tick-borne diseases, including TBE. The source, study period and methodological limitations are stated with the relevant figures and information."
      : "Cijfers en informatie zijn gebaseerd op openbare informatie van het RIVM en de LCI-richtlijnen, de NHG-behandelrichtlijn Tekenbeet en erythema migrans, Tekenradar.nl (RIVM en Wageningen University & Research), Wageningen University & Research / het Nederlands Kennisnetwerk voor Teken, Stichting Tekenbeetziekten, de Lymevereniging, CBS (inwonertallen en gemeentegrenzen), NVWA (Centrum Monitoring Vectoren), regionale GGD’en, GGD GHOR Nederland en ECDC. Voor onderzoek en achtergrondinformatie over tekenbeetziekten, waaronder TBE, worden ook Universiteit Utrecht, DWHC (Dutch Wildlife Health Centre), Erasmus MC (Viroscience), LabMicTA en Artemis One Health aangehaald. Bij de betreffende cijfers en informatie staan de bron, onderzoeksperiode en methodologische beperkingen."}</P>
    <P>{en ? "Scientific publications used include " : "Gebruikte wetenschappelijke publicaties zijn onder meer "}
      <a href="https://doi.org/10.1371/journal.pntd.0005042" target="_blank" rel="noopener noreferrer">Jahfari et al. (2016, PLOS Neglected Tropical Diseases)</a>{", "}
      <a href="https://doi.org/10.2807/1560-7917.ES.2026.31.20.2500767" target="_blank" rel="noopener noreferrer">Wijburg et al. (2026, Eurosurveillance)</a>{en ? " and " : " en "}
      <a href="https://doi.org/10.33540/3645" target="_blank" rel="noopener noreferrer">{en ? "Wijburg’s dissertation (2026, Utrecht University)" : "het proefschrift van Wijburg (2026, Universiteit Utrecht)"}</a>
      {en ? ". Historical tick findings also refer to the original monitoring publications linked with each finding; these are not live reports." : ". Historische tekenvondsten verwijzen daarnaast naar de oorspronkelijke monitoringspublicaties bij de betreffende vondst; dit zijn geen live meldingen."}
    </P>
    <P>{en
      ? "Tick photographs and reference material have their own source attribution, including Stichting Tekenbeetziekten, RIVM, Waarneming.nl, Picture Insect and iNaturalist. An image source is not a medical guideline or an independent validation of an AI comparison."
      : "Tekenfoto’s en referentiemateriaal hebben een eigen bronvermelding, waaronder Stichting Tekenbeetziekten, RIVM, Waarneming.nl, Picture Insect en iNaturalist. Een beeldbron is geen medische richtlijn of onafhankelijke validatie van een AI-vergelijking."}</P>
    <P>{en
      ? "Selected RIVM, LCI and Tekenradar pages are checked automatically on a regular basis. This does not cover every source and is not an independent medical review. CBS figures, scientific publications, historical monitoring data and image references retain their stated source dates; they are not automatically replaced with new figures. Automatic checks do not guarantee that all information is complete or current."
      : "Geselecteerde pagina’s van RIVM, LCI en Tekenradar worden periodiek automatisch gecontroleerd. Dit omvat niet alle bronnen en is geen onafhankelijke medische inhoudscontrole. CBS-cijfers, wetenschappelijke publicaties, historische monitoringsgegevens en beeldreferenties behouden hun vermelde brondata; ze worden niet automatisch vervangen door nieuwe cijfers. Automatische controles garanderen niet dat alle informatie volledig of actueel is."}</P>
  </>;
}