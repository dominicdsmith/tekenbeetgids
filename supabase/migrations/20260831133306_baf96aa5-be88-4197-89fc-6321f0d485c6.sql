ALTER TABLE public.onderzoek_deelnames
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'Ingediend',
  ADD COLUMN IF NOT EXISTS gemeld_op timestamptz;