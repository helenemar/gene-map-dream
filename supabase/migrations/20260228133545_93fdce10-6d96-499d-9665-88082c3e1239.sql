
-- Create genogram_notes table
CREATE TABLE public.genogram_notes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  genogram_id UUID NOT NULL REFERENCES public.genograms(id) ON DELETE CASCADE,
  author_id UUID NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.genogram_notes ENABLE ROW LEVEL SECURITY;

-- Helper function: check if user owns the genogram
CREATE OR REPLACE FUNCTION public.owns_genogram(_user_id uuid, _genogram_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.genograms
    WHERE id = _genogram_id AND user_id = _user_id
  )
$$;

-- SELECT: only owner of the genogram can read notes
CREATE POLICY "Owner can view genogram notes"
ON public.genogram_notes
FOR SELECT
USING (public.owns_genogram(auth.uid(), genogram_id));

-- INSERT: only owner can add notes, and author_id must match
CREATE POLICY "Owner can insert genogram notes"
ON public.genogram_notes
FOR INSERT
WITH CHECK (
  auth.uid() = author_id
  AND public.owns_genogram(auth.uid(), genogram_id)
);

-- DELETE: only owner can delete notes
CREATE POLICY "Owner can delete genogram notes"
ON public.genogram_notes
FOR DELETE
USING (public.owns_genogram(auth.uid(), genogram_id));

-- Index for fast lookup by genogram
CREATE INDEX idx_genogram_notes_genogram_id ON public.genogram_notes(genogram_id);
