
-- Create enum for access levels
CREATE TYPE public.share_access_level AS ENUM ('reader', 'editor');

-- Create genogram_shares table
CREATE TABLE public.genogram_shares (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  genogram_id UUID NOT NULL REFERENCES public.genograms(id) ON DELETE CASCADE,
  -- For link sharing
  share_token TEXT UNIQUE DEFAULT encode(gen_random_bytes(32), 'hex'),
  access_level share_access_level NOT NULL DEFAULT 'reader',
  -- For email invitation (optional)
  shared_with_email TEXT,
  shared_with_user_id UUID,
  -- Metadata
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_active BOOLEAN NOT NULL DEFAULT true
);

-- Enable RLS
ALTER TABLE public.genogram_shares ENABLE ROW LEVEL SECURITY;

-- Owner can manage shares
CREATE POLICY "Owner can view shares"
  ON public.genogram_shares FOR SELECT
  USING (owns_genogram(auth.uid(), genogram_id));

CREATE POLICY "Owner can create shares"
  ON public.genogram_shares FOR INSERT
  WITH CHECK (owns_genogram(auth.uid(), genogram_id) AND auth.uid() = created_by);

CREATE POLICY "Owner can update shares"
  ON public.genogram_shares FOR UPDATE
  USING (owns_genogram(auth.uid(), genogram_id));

CREATE POLICY "Owner can delete shares"
  ON public.genogram_shares FOR DELETE
  USING (owns_genogram(auth.uid(), genogram_id));

-- Shared users can see their own shares
CREATE POLICY "Shared users can view their shares"
  ON public.genogram_shares FOR SELECT
  USING (shared_with_user_id = auth.uid() AND is_active = true);

-- Function to get genogram by share token (public access for link sharing)
CREATE OR REPLACE FUNCTION public.get_shared_genogram(p_token TEXT)
RETURNS TABLE(
  genogram_id UUID,
  genogram_name TEXT,
  genogram_data JSONB,
  access_level share_access_level
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT g.id, g.name, g.data, s.access_level
  FROM public.genogram_shares s
  JOIN public.genograms g ON g.id = s.genogram_id
  WHERE s.share_token = p_token
    AND s.is_active = true
    AND s.shared_with_email IS NULL
    AND s.shared_with_user_id IS NULL;
$$;

-- Function to update shared genogram (for editors via token)
CREATE OR REPLACE FUNCTION public.update_shared_genogram(p_token TEXT, p_data JSONB)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.genograms g
  SET data = p_data, updated_at = now()
  FROM public.genogram_shares s
  WHERE s.share_token = p_token
    AND s.is_active = true
    AND s.access_level = 'editor'
    AND g.id = s.genogram_id;
  RETURN FOUND;
END;
$$;

-- Allow authenticated shared users to read genograms shared with them
CREATE POLICY "Shared users can view shared genograms"
  ON public.genograms FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.genogram_shares
      WHERE genogram_id = genograms.id
        AND shared_with_user_id = auth.uid()
        AND is_active = true
    )
  );

-- Allow authenticated shared editors to update shared genograms
CREATE POLICY "Shared editors can update shared genograms"
  ON public.genograms FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.genogram_shares
      WHERE genogram_id = genograms.id
        AND shared_with_user_id = auth.uid()
        AND is_active = true
        AND access_level = 'editor'
    )
  );
