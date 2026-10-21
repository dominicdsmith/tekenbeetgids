export const ALFA_GAL_BEHANDELINGEN = [
  { id: "dieet", nl: "Dieet", en: "Diet" },
  { id: "antihistaminica", nl: "Antihistaminica", en: "Antihistamines" },
  { id: "adrenaline_autoinjector", nl: "Adrenaline-auto-injector", en: "Adrenaline auto-injector" },
] as const;

export function alfaGalBehandelingNaam(id: string, en: boolean) {
  if (id === "onbekend") return en ? "Don't know" : "Weet ik niet";
  const keuze = ALFA_GAL_BEHANDELINGEN.find((item) => item.id === id);
  return keuze ? (en ? keuze.en : keuze.nl) : id;
}

export function alfaGalBehandelingStappen(index: number, behandeld?: string | null) {
  return [
    `testbehandeld_${index}__alfagal`,
    ...(behandeld === "ja" ? [`testmiddelen_${index}__alfagal`] : []),
  ];
}