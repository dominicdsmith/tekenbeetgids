ALTER TABLE public.databronnen ADD COLUMN IF NOT EXISTS peildatum text;

UPDATE public.databronnen SET peildatum = 'cijferpagina, geraadpleegd 2026' WHERE sleutel = 'stz' AND peildatum IS NULL;
UPDATE public.databronnen SET peildatum = 'geraadpleegd 2026' WHERE sleutel = 'lymevereniging' AND peildatum IS NULL;
UPDATE public.databronnen SET peildatum = 'richtlijnversies 2025–2026; Staat van Infectieziekten 2024' WHERE sleutel = 'rivm_lyme' AND peildatum IS NULL;
UPDATE public.databronnen SET peildatum = 'TBE-meldingen t/m 30 september 2025 (27 meldingen in 2025)' WHERE sleutel = 'lci_tbe' AND peildatum IS NULL;
UPDATE public.databronnen SET peildatum = 'tekenbeetmeldingen 2019–2025' WHERE sleutel = 'tekenradar' AND peildatum IS NULL;
UPDATE public.databronnen SET peildatum = 'onderzoeksgegevens t/m 2025' WHERE sleutel = 'wur' AND peildatum IS NULL;