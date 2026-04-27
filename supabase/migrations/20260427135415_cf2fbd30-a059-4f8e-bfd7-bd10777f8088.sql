-- Add color column for category display
ALTER TABLE public.trauma_catalog
  ADD COLUMN IF NOT EXISTS category_color TEXT;

-- Replace seed with the new clinical taxonomy
DELETE FROM public.trauma_catalog;

INSERT INTO public.trauma_catalog (label, category, category_color) VALUES
  -- Traumas relationnels (rouge)
  ('Violence physique intrafamiliale',     'Relationnel', '#E24B4A'),
  ('Violence conjugale',                   'Relationnel', '#E24B4A'),
  ('Violence sexuelle (inceste, abus)',    'Relationnel', '#E24B4A'),
  ('Négligence parentale grave',           'Relationnel', '#E24B4A'),
  ('Abandon parental',                     'Relationnel', '#E24B4A'),
  ('Rejet familial',                       'Relationnel', '#E24B4A'),
  ('Humiliations répétées',                'Relationnel', '#E24B4A'),
  ('Maltraitance psychologique',           'Relationnel', '#E24B4A'),
  ('Contrôle coercitif',                   'Relationnel', '#E24B4A'),
  ('Exposition à la violence domestique',  'Relationnel', '#E24B4A'),

  -- Traumas de perte (bleu)
  ('Décès d''un parent (enfant mineur)',          'Perte', '#3B82F6'),
  ('Décès d''un enfant',                          'Perte', '#3B82F6'),
  ('Décès d''un conjoint',                        'Perte', '#3B82F6'),
  ('Décès traumatique (suicide, accident, homicide)', 'Perte', '#3B82F6'),
  ('Deuil périnatal (fausse couche, mort-né)',    'Perte', '#3B82F6'),
  ('Séparation brutale',                          'Perte', '#3B82F6'),
  ('Placement en famille d''accueil',             'Perte', '#3B82F6'),
  ('Rupture de fratrie',                          'Perte', '#3B82F6'),
  ('Disparition d''un proche',                    'Perte', '#3B82F6'),
  ('Deuil blanc (maladie d''Alzheimer)',          'Perte', '#3B82F6'),

  -- Traumas collectifs (vert)
  ('Guerre / conflit armé',                       'Collectif', '#10B981'),
  ('Exil forcé / déplacement',                    'Collectif', '#10B981'),
  ('Migration traumatique',                       'Collectif', '#10B981'),
  ('Génocide / persécution',                      'Collectif', '#10B981'),
  ('Détention politique',                         'Collectif', '#10B981'),
  ('Torture',                                     'Collectif', '#10B981'),
  ('Catastrophe naturelle (séisme, inondation)',  'Collectif', '#10B981'),
  ('Attentat terroriste',                         'Collectif', '#10B981'),
  ('Accident collectif (naufrage, crash)',        'Collectif', '#10B981'),
  ('Pandémie (COVID, etc.)',                      'Collectif', '#10B981'),

  -- Événements de vie majeurs (orange)
  ('Accident grave',                              'Événement', '#D97706'),
  ('Maladie somatique grave',                     'Événement', '#D97706'),
  ('Hospitalisation longue durée',                'Événement', '#D97706'),
  ('Intervention chirurgicale traumatisante',     'Événement', '#D97706'),
  ('Handicap acquis',                             'Événement', '#D97706'),
  ('Incarcération',                               'Événement', '#D97706'),
  ('Perte d''emploi brutale',                     'Événement', '#D97706'),
  ('Ruine financière',                            'Événement', '#D97706'),
  ('Catastrophe domestique (incendie, expulsion)', 'Événement', '#D97706'),
  ('Agression physique hors cadre familial',      'Événement', '#D97706'),

  -- Traumas sexuels (rose)
  ('Viol',                                        'Sexuel', '#EC4899'),
  ('Agression sexuelle',                          'Sexuel', '#EC4899'),
  ('Harcèlement sexuel prolongé',                 'Sexuel', '#EC4899'),
  ('Prostitution forcée',                         'Sexuel', '#EC4899'),
  ('Exploitation sexuelle',                       'Sexuel', '#EC4899'),
  ('Exposition précoce à la pornographie',        'Sexuel', '#EC4899'),
  ('Grossesse non désirée traumatique',           'Sexuel', '#EC4899'),
  ('IVG vécue sous contrainte',                   'Sexuel', '#EC4899'),

  -- Traumas transgénérationnels (violet)
  ('Secrets de famille',                          'Transgénérationnel', '#8B5CF6'),
  ('Adoption non révélée',                        'Transgénérationnel', '#8B5CF6'),
  ('Enfant caché',                                'Transgénérationnel', '#8B5CF6'),
  ('Trauma de guerre transmis',                   'Transgénérationnel', '#8B5CF6'),
  ('Trauma de l''Holocauste / génocide (descendants)', 'Transgénérationnel', '#8B5CF6'),
  ('Honte familiale transmise',                   'Transgénérationnel', '#8B5CF6'),
  ('Rupture de filiation',                        'Transgénérationnel', '#8B5CF6'),
  ('Adoption internationale',                     'Transgénérationnel', '#8B5CF6'),
  ('Enfant né d''un viol de guerre',              'Transgénérationnel', '#8B5CF6'),
  ('Ascendant bourreau',                          'Transgénérationnel', '#8B5CF6'),

  -- Traumas institutionnels (gris)
  ('Placement en foyer / MECS',                   'Institutionnel', '#6B7280'),
  ('Violence institutionnelle',                   'Institutionnel', '#6B7280'),
  ('Harcèlement scolaire (long terme)',           'Institutionnel', '#6B7280'),
  ('Violence religieuse / emprise sectaire',      'Institutionnel', '#6B7280'),
  ('Discrimination systémique (racisme, homophobie)', 'Institutionnel', '#6B7280'),
  ('Expérience de guerre vécue en tant que soldat', 'Institutionnel', '#6B7280'),
  ('Violence médicale',                           'Institutionnel', '#6B7280'),
  ('Internement psychiatrique abusif',            'Institutionnel', '#6B7280');