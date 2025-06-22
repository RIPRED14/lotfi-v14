-- Migration pour ajouter les champs nécessaires au workflow microbiologique
-- Version: 1.0.0
-- Date: 2023-11-01

-- Fonction pour ajouter les champs de workflow microbiologique
CREATE OR REPLACE FUNCTION add_microbiological_workflow_fields()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  reading_day_exists boolean;
  analysis_type_exists boolean;
  reading_date_exists boolean;
BEGIN
  -- Vérifier si les colonnes existent déjà dans la table samples
  SELECT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_name = 'samples' AND column_name = 'reading_day'
  ) INTO reading_day_exists;
  
  SELECT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_name = 'samples' AND column_name = 'analysis_type'
  ) INTO analysis_type_exists;
  
  SELECT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_name = 'samples' AND column_name = 'reading_date'
  ) INTO reading_date_exists;
  
  -- Ajouter les colonnes si elles n'existent pas
  IF NOT reading_day_exists THEN
    ALTER TABLE samples ADD COLUMN reading_day TEXT DEFAULT NULL;
    RAISE NOTICE 'Colonne reading_day ajoutée à la table samples';
  ELSE
    RAISE NOTICE 'La colonne reading_day existe déjà dans la table samples';
  END IF;
  
  IF NOT analysis_type_exists THEN
    ALTER TABLE samples ADD COLUMN analysis_type TEXT DEFAULT NULL;
    RAISE NOTICE 'Colonne analysis_type ajoutée à la table samples';
  ELSE
    RAISE NOTICE 'La colonne analysis_type existe déjà dans la table samples';
  END IF;
  
  IF NOT reading_date_exists THEN
    ALTER TABLE samples ADD COLUMN reading_date TEXT DEFAULT NULL;
    RAISE NOTICE 'Colonne reading_date ajoutée à la table samples';
  ELSE
    RAISE NOTICE 'La colonne reading_date existe déjà dans la table samples';
  END IF;
  
  -- Modifier la colonne status pour accepter les nouveaux états du workflow
  -- On vérifie d'abord le type actuel pour éviter les erreurs
  BEGIN
    -- Essayer de mettre à jour les contraintes de la colonne status si elle existe
    ALTER TABLE samples DROP CONSTRAINT IF EXISTS samples_status_check;
    ALTER TABLE samples ADD CONSTRAINT samples_status_check 
      CHECK (status IN ('pending', 'in_progress', 'completed', 'rejected', 'draft', 'waiting_reading', 'cancelled'));
    
    RAISE NOTICE 'Contrainte de la colonne status mise à jour dans la table samples';
  EXCEPTION
    WHEN OTHERS THEN
      RAISE NOTICE 'Erreur lors de la mise à jour de la contrainte de status: %', SQLERRM;
  END;
  
  -- Créer un index sur form_id pour améliorer les performances
  BEGIN
    CREATE INDEX IF NOT EXISTS idx_samples_form_id ON samples(form_id);
    RAISE NOTICE 'Index sur form_id créé';
  EXCEPTION
    WHEN OTHERS THEN
      RAISE NOTICE 'Erreur lors de la création de l''index sur form_id: %', SQLERRM;
  END;
  
  -- Créer un index sur status pour améliorer les performances de recherche
  BEGIN
    CREATE INDEX IF NOT EXISTS idx_samples_status ON samples(status);
    RAISE NOTICE 'Index sur status créé';
  EXCEPTION
    WHEN OTHERS THEN
      RAISE NOTICE 'Erreur lors de la création de l''index sur status: %', SQLERRM;
  END;
  
  RAISE NOTICE 'Migration des champs de workflow microbiologique terminée avec succès';
END;
$$;

-- Exécuter la fonction pour appliquer les modifications
SELECT add_microbiological_workflow_fields();

-- Supprimer la fonction après utilisation
DROP FUNCTION IF EXISTS add_microbiological_workflow_fields(); 