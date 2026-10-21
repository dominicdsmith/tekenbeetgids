ALTER POLICY "Ziektecijfers openbaar leesbaar" ON public.ziekte_cijfers TO anon, authenticated USING (actief IS TRUE AND ziekte_id <> '' AND volgorde >= 0);

ALTER POLICY "Ziekte-provinciecijfers openbaar leesbaar" ON public.ziekte_provincie_meldingen TO anon, authenticated USING (ziekte_id <> '' AND provincie_id <> '' AND meldingen >= 0 AND jaar BETWEEN 2000 AND EXTRACT(YEAR FROM CURRENT_DATE)::integer);

ALTER POLICY "Datastatus is openbaar leesbaar" ON public.datastatus TO anon, authenticated USING (id = 1);

ALTER POLICY "Tekenradarcijfers openbaar leesbaar" ON public.tekenradar_cijfers TO anon, authenticated USING (jaar BETWEEN 2000 AND EXTRACT(YEAR FROM CURRENT_DATE)::integer AND meldingen >= 0);

ALTER POLICY "TBE-historie openbaar leesbaar" ON public.tbe_provincie_historie TO anon, authenticated USING (jaar BETWEEN 2000 AND EXTRACT(YEAR FROM CURRENT_DATE)::integer AND provincie_id <> '' AND tbe_gevallen >= 0);

ALTER POLICY "Tellingen openbaar leesbaar" ON public.tekenbeet_tellingen TO anon, authenticated USING (jaar = EXTRACT(YEAR FROM CURRENT_DATE)::integer AND maand BETWEEN 1 AND 12 AND datum BETWEEN make_date(EXTRACT(YEAR FROM CURRENT_DATE)::integer, 1, 1) AND CURRENT_DATE);

ALTER POLICY "TBE-jaarcijfers zijn openbaar" ON public.tbe_jaarcijfers TO anon, authenticated USING (jaar BETWEEN 2000 AND EXTRACT(YEAR FROM CURRENT_DATE)::integer AND meldingen >= 0);

ALTER POLICY "Tekenactiviteit is openbaar" ON public.tekenactiviteit_maand TO anon, authenticated USING (maand BETWEEN 0 AND 11 AND niveau BETWEEN 0 AND 4 AND (aandeel_pct IS NULL OR aandeel_pct BETWEEN 0 AND 100));

ALTER POLICY "Provinciecijfers openbaar leesbaar" ON public.provincie_cijfers TO anon, authenticated USING (provincie_id IN ('drenthe', 'flevoland', 'friesland', 'gelderland', 'groningen', 'limburg', 'noordbrabant', 'noordholland', 'overijssel', 'utrecht', 'zeeland', 'zuidholland') AND (meldingen IS NULL OR meldingen >= 0) AND (tekenbeet_aantal IS NULL OR tekenbeet_aantal >= 0));

ALTER POLICY "Databronnen zijn openbaar leesbaar" ON public.databronnen TO anon, authenticated USING (sleutel <> '' AND naam <> '' AND url ~ '^https://' AND volgorde >= 0);