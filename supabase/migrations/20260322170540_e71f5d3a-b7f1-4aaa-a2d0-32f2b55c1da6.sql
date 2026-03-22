CREATE OR REPLACE FUNCTION public.claim_shared_genogram(p_token text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  UPDATE public.genogram_shares
  SET shared_with_user_id = auth.uid()
  WHERE share_token = p_token
    AND is_active = true
    AND shared_with_user_id IS NULL
    AND created_by != auth.uid();
  RETURN FOUND;
END;
$$;