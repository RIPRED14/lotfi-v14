-- Migration pour créer la table form_bacteria_selections
-- Cette table stocke les sélections de bactéries pour chaque formulaire
-- Date: 2023-06-20

CREATE TABLE IF NOT EXISTS form_bacteria_selections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  form_id TEXT NOT NULL,
  bacteria_name TEXT NOT NULL,
  bacteria_delay TEXT NOT NULL,
  reading_day TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'overdue')),
  reading_date TEXT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  modified_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour optimiser les requêtes
CREATE INDEX IF NOT EXISTS idx_form_bacteria_selections_form_id ON form_bacteria_selections(form_id);
CREATE INDEX IF NOT EXISTS idx_form_bacteria_selections_status ON form_bacteria_selections(status);
CREATE INDEX IF NOT EXISTS idx_form_bacteria_selections_reading_day ON form_bacteria_selections(reading_day);
CREATE INDEX IF NOT EXISTS idx_form_bacteria_selections_bacteria_name ON form_bacteria_selections(bacteria_name);

-- Trigger pour mettre à jour modified_at automatiquement
CREATE OR REPLACE FUNCTION update_form_bacteria_selections_modified_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.modified_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_form_bacteria_selections_modified_at
  BEFORE UPDATE ON form_bacteria_selections
  FOR EACH ROW
  EXECUTE FUNCTION update_form_bacteria_selections_modified_at();

-- Ajouter quelques données de test
INSERT INTO form_bacteria_selections (form_id, bacteria_name, bacteria_delay, reading_day, status, reading_date) VALUES
  ('test-form-001', 'Entérobactéries', '24h', 'Lundi', 'pending', '2025-01-27'),
  ('test-form-001', 'Levures/Moisissures', '3j', 'Mercredi', 'pending', '2025-01-29'),
  ('test-form-002', 'Listeria', '48h', 'Mardi', 'in_progress', '2025-01-28'),
  ('test-form-002', 'Coliformes totaux', '48h', 'Mardi', 'pending', '2025-01-28'),
  ('test-form-003', 'Staphylocoques', '48h', 'Vendredi', 'completed', '2025-01-31'); 