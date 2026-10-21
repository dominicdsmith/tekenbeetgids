-- De opschoonfunctie voor de fotoscan-cache mag alleen door de server worden aangeroepen.
REVOKE EXECUTE ON FUNCTION public.opschonen_fotoscan_cache() FROM anon, authenticated;