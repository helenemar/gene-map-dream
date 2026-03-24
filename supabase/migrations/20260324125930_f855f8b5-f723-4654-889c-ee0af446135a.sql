
CREATE OR REPLACE FUNCTION public.get_shared_genogram(p_token text)
 RETURNS TABLE(genogram_id uuid, genogram_name text, genogram_data jsonb, access_level share_access_level)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $$
  SELECT 
    g.id, 
    g.name, 
    jsonb_set(
      g.data,
      '{pathologies}',
      COALESCE(
        (SELECT jsonb_agg(jsonb_build_object('id', p.id, 'name', p.name, 'color_hex', p.color_hex))
         FROM public.pathologies p WHERE p.genogram_id = g.id),
        '[]'::jsonb
      )
    ),
    s.access_level
  FROM public.genogram_shares s
  JOIN public.genograms g ON g.id = s.genogram_id
  WHERE s.share_token = p_token
    AND s.is_active = true;
$$;
