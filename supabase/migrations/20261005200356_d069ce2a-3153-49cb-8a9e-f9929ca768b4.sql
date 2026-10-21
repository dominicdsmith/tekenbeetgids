REVOKE EXECUTE ON FUNCTION public.opschonen_fotoscan_cache() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.opschonen_fotoscan_cache() TO service_role;