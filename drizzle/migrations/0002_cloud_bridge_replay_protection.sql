CREATE TABLE public.cloud_bridge_nonces (
  nonce text PRIMARY KEY,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.cloud_bridge_nonces TO service_role;
ALTER TABLE public.cloud_bridge_nonces ENABLE ROW LEVEL SECURITY;
CREATE OR REPLACE FUNCTION public.claim_cloud_bridge_request(request_nonce text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF request_nonce !~ '^[0-9a-f-]{36}$' THEN RETURN false; END IF;
  DELETE FROM public.cloud_bridge_nonces WHERE created_at < now() - interval '5 minutes';
  INSERT INTO public.cloud_bridge_nonces(nonce) VALUES (request_nonce) ON CONFLICT DO NOTHING;
  RETURN FOUND;
END;
$$;
REVOKE ALL ON FUNCTION public.claim_cloud_bridge_request(text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.claim_cloud_bridge_request(text) TO service_role;