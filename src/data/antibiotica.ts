/** Recorded prescriptions, not a treatment recommendation or disease-specific ranking. */
export const ANTIBIOTICA = [
  { id: "doxycycline", label: "Doxycycline", en: "Doxycycline" },
  { id: "amoxicilline", label: "Amoxicilline", en: "Amoxicillin" },
  { id: "azitromycine", label: "Azitromycine", en: "Azithromycin" },
  { id: "cefuroxim", label: "Cefuroxim axetil", en: "Cefuroxime axetil" },
  { id: "ceftriaxon", label: "Ceftriaxon", en: "Ceftriaxone" },
  { id: "claritromycine", label: "Claritromycine", en: "Clarithromycin" },
  { id: "penicilline", label: "Penicilline / Feneticilline", en: "Penicillin / Pheneticillin" },
  { id: "penicilline_v", label: "Penicilline V (fenoxymethylpenicilline)", en: "Penicillin V (phenoxymethylpenicillin)" },
  { id: "minocycline", label: "Minocycline", en: "Minocycline" },
  { id: "rifampicine", label: "Rifampicine", en: "Rifampicin" },
  { id: "cotrimoxazol", label: "Co-trimoxazol", en: "Co-trimoxazole" },
  { id: "ciprofloxacine", label: "Ciprofloxacine", en: "Ciprofloxacin" },
  { id: "cefotaxim", label: "Cefotaxim", en: "Cefotaxime" },
  { id: "cefalexine", label: "Cefalexine", en: "Cefalexin" },
  // Retain the historical identifier for existing records; not offered as an antibiotic.
  { id: "atovaquon", label: "Atovaquon (bij babesiose)", en: "Atovaquone (for babesiosis)" },
];

export const antibioticumNaam = (id: string, en: boolean) => {
  const middel = ANTIBIOTICA.find((m) => m.id === id);
  return middel ? (en ? middel.en : middel.label) : id;
};