-- Global trauma catalog (read-only for users, seeded with standard entries)
CREATE TABLE public.trauma_catalog (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  label TEXT NOT NULL UNIQUE,
  category TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.trauma_catalog ENABLE ROW LEVEL SECURITY;

-- Anyone authenticated can read the global catalog
CREATE POLICY "Authenticated users can view trauma catalog"
  ON public.trauma_catalog
  FOR SELECT
  TO authenticated
  USING (true);

-- Per-user trauma catalog (private additions for autocomplete)
CREATE TABLE public.user_trauma_catalog (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  label TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, label)
);

ALTER TABLE public.user_trauma_catalog ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own trauma entries"
  ON public.user_trauma_catalog
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own trauma entries"
  ON public.user_trauma_catalog
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own trauma entries"
  ON public.user_trauma_catalog
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Seed standard trauma catalog
INSERT INTO public.trauma_catalog (label, category) VALUES
  ('Deuil parental', 'Deuil'),
  ('Deuil d''un enfant', 'Deuil'),
  ('Deuil fraternel', 'Deuil'),
  ('Deuil du conjoint', 'Deuil'),
  ('Deuil périnatal', 'Deuil'),
  ('Suicide d''un proche', 'Deuil'),
  ('Mort violente d''un proche', 'Deuil'),

  ('Violences physiques', 'Violences'),
  ('Violences psychologiques', 'Violences'),
  ('Violences sexuelles', 'Violences'),
  ('Violences conjugales', 'Violences'),
  ('Maltraitance infantile', 'Violences'),
  ('Inceste', 'Violences'),
  ('Harcèlement', 'Violences'),
  ('Harcèlement scolaire', 'Violences'),
  ('Harcèlement au travail', 'Violences'),

  ('Négligence affective', 'Carence'),
  ('Négligence éducative', 'Carence'),
  ('Abandon', 'Carence'),
  ('Placement en institution', 'Carence'),
  ('Séparation précoce', 'Carence'),

  ('Accident grave', 'Accident'),
  ('Accident de la route', 'Accident'),
  ('Accident du travail', 'Accident'),
  ('Catastrophe naturelle', 'Accident'),
  ('Incendie', 'Accident'),
  ('Noyade', 'Accident'),

  ('Maladie grave', 'Santé'),
  ('Hospitalisation prolongée', 'Santé'),
  ('Diagnostic d''une maladie chronique', 'Santé'),
  ('Intervention chirurgicale lourde', 'Santé'),
  ('Fausse couche', 'Santé'),
  ('IVG', 'Santé'),
  ('Infertilité', 'Santé'),

  ('Guerre', 'Collectif'),
  ('Exil', 'Collectif'),
  ('Migration forcée', 'Collectif'),
  ('Génocide', 'Collectif'),
  ('Persécution politique', 'Collectif'),
  ('Persécution religieuse', 'Collectif'),
  ('Camp de concentration', 'Collectif'),
  ('Attentat', 'Collectif'),

  ('Divorce parental', 'Famille'),
  ('Séparation conjugale', 'Famille'),
  ('Conflit familial majeur', 'Famille'),
  ('Rupture familiale', 'Famille'),
  ('Secret de famille', 'Famille'),
  ('Adoption', 'Famille'),

  ('Précarité financière', 'Social'),
  ('Perte d''emploi', 'Social'),
  ('Faillite', 'Social'),
  ('Sans-abrisme', 'Social'),
  ('Discrimination', 'Social'),
  ('Racisme', 'Social'),
  ('LGBTphobie', 'Social'),

  ('Addiction d''un proche', 'Addictions'),
  ('Alcoolisme parental', 'Addictions'),

  ('Agression', 'Autre'),
  ('Témoin d''un événement traumatique', 'Autre'),
  ('Trauma médical', 'Autre');

CREATE INDEX idx_trauma_catalog_label ON public.trauma_catalog (lower(label));
CREATE INDEX idx_user_trauma_catalog_user ON public.user_trauma_catalog (user_id);