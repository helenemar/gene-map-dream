UPDATE public.genograms
SET data = jsonb_set(
  data,
  '{members}',
  (
    SELECT jsonb_agg(
      CASE
        WHEN elem->>'id' = 'gp-f2' THEN jsonb_set(elem, '{pathologies}', '["diabetes","cardiovascular"]')
        WHEN elem->>'id' = 'p2-h' THEN jsonb_set(elem, '{pathologies}', '["cardiovascular"]')
        WHEN elem->>'id' = 'p3-w' THEN jsonb_set(elem, '{pathologies}', '["depression"]')
        WHEN elem->>'id' = 'p4-w' THEN jsonb_set(elem, '{pathologies}', '["psychogenic"]')
        WHEN elem->>'id' = 'c1-w' THEN jsonb_set(elem, '{pathologies}', '["cancer"]')
        WHEN elem->>'id' = 'c2' THEN jsonb_set(elem, '{pathologies}', '["addiction"]')
        WHEN elem->>'id' = 'c4' THEN jsonb_set(elem, '{pathologies}', '["bipolar","depression"]')
        WHEN elem->>'id' = 'c5' THEN jsonb_set(elem, '{pathologies}', '["cardiovascular"]')
        WHEN elem->>'id' = 'c6b' THEN jsonb_set(elem, '{pathologies}', '["psychogenic"]')
        WHEN elem->>'id' = 'p1' THEN jsonb_set(elem, '{pathologies}', '["addiction","depression"]')
        WHEN elem->>'id' = 'p3' THEN jsonb_set(elem, '{pathologies}', '["cardiovascular","diabetes"]')
        ELSE elem
      END
    )
    FROM jsonb_array_elements(data->'members') AS elem
  )
),
updated_at = now()
WHERE id = '785a23ae-5fdb-4207-8e64-e99c6c20690a';