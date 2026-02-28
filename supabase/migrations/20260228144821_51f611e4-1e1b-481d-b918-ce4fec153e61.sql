-- Create pathologies table for per-genogram custom pathologies
CREATE TABLE public.pathologies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  genogram_id UUID NOT NULL REFERENCES public.genograms(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color_hex TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.pathologies ENABLE ROW LEVEL SECURITY;

-- Policies: only the genogram owner can CRUD pathologies
CREATE POLICY "Owner can view pathologies"
  ON public.pathologies FOR SELECT
  USING (owns_genogram(auth.uid(), genogram_id));

CREATE POLICY "Owner can insert pathologies"
  ON public.pathologies FOR INSERT
  WITH CHECK (owns_genogram(auth.uid(), genogram_id));

CREATE POLICY "Owner can update pathologies"
  ON public.pathologies FOR UPDATE
  USING (owns_genogram(auth.uid(), genogram_id));

CREATE POLICY "Owner can delete pathologies"
  ON public.pathologies FOR DELETE
  USING (owns_genogram(auth.uid(), genogram_id));

-- Index for fast lookup by genogram
CREATE INDEX idx_pathologies_genogram ON public.pathologies(genogram_id);