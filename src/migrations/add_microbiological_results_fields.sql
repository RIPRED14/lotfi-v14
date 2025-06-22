-- Migration pour ajouter les champs de résultats microbiologiques
-- Version: 1.1.0  
-- Date: 2023-11-02

-- Fonction pour ajouter les champs de résultats microbiologiques
CREATE OR REPLACE FUNCTION add_microbiological_results_fields()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  enterobacteria_exists boolean;
  yeast_mold_exists boolean;
  listeria_exists boolean;
  coliforms_exists boolean;
  staphylococcus_exists boolean;
  reading_comments_exists boolean;
  reading_technician_exists boolean;
BEGIN
  -- Vérifier si les colonnes de résultats microbiologiques existent déjà
  SELECT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_name = 'samples' AND column_name = 'enterobacteria_count'
  ) INTO enterobacteria_exists;
  
  SELECT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_name = 'samples' AND column_name = 'yeast_mold_count'
  ) INTO yeast_mold_exists;
  
  SELECT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_name = 'samples' AND column_name = 'listeria_count'
  ) INTO listeria_exists;
  
  SELECT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_name = 'samples' AND column_name = 'coliforms_count'
  ) INTO coliforms_exists;
  
  SELECT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_name = 'samples' AND column_name = 'staphylococcus_count'
  ) INTO staphylococcus_exists;
  
  SELECT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_name = 'samples' AND column_name = 'reading_comments'
  ) INTO reading_comments_exists;
  
  SELECT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_name = 'samples' AND column_name = 'reading_technician'
  ) INTO reading_technician_exists;
  
  -- Ajouter les colonnes de comptage des micro-organismes
  IF NOT enterobacteria_exists THEN
    ALTER TABLE samples ADD COLUMN enterobacteria_count INTEGER DEFAULT NULL;
    RAISE NOTICE 'Colonne enterobacteria_count ajoutée à la table samples';
  ELSE
    RAISE NOTICE 'La colonne enterobacteria_count existe déjà dans la table samples';
  END IF;
  
  IF NOT yeast_mold_exists THEN
    ALTER TABLE samples ADD COLUMN yeast_mold_count INTEGER DEFAULT NULL;
    RAISE NOTICE 'Colonne yeast_mold_count ajoutée à la table samples';
  ELSE
    RAISE NOTICE 'La colonne yeast_mold_count existe déjà dans la table samples';
  END IF;
  
  IF NOT listeria_exists THEN
    ALTER TABLE samples ADD COLUMN listeria_count INTEGER DEFAULT NULL;
    RAISE NOTICE 'Colonne listeria_count ajoutée à la table samples';
  ELSE
    RAISE NOTICE 'La colonne listeria_count existe déjà dans la table samples';
  END IF;
  
  IF NOT coliforms_exists THEN
    ALTER TABLE samples ADD COLUMN coliforms_count INTEGER DEFAULT NULL;
    RAISE NOTICE 'Colonne coliforms_count ajoutée à la table samples';
  ELSE
    RAISE NOTICE 'La colonne coliforms_count existe déjà dans la table samples';
  END IF;
  
  IF NOT staphylococcus_exists THEN
    ALTER TABLE samples ADD COLUMN staphylococcus_count INTEGER DEFAULT NULL;
    RAISE NOTICE 'Colonne staphylococcus_count ajoutée à la table samples';
  ELSE
    RAISE NOTICE 'La colonne staphylococcus_count existe déjà dans la table samples';
  END IF;
  
  -- Ajouter les colonnes de commentaires et technicien de lecture
  IF NOT reading_comments_exists THEN
    ALTER TABLE samples ADD COLUMN reading_comments TEXT DEFAULT NULL;
    RAISE NOTICE 'Colonne reading_comments ajoutée à la table samples';
  ELSE
    RAISE NOTICE 'La colonne reading_comments existe déjà dans la table samples';
  END IF;
  
  IF NOT reading_technician_exists THEN
    ALTER TABLE samples ADD COLUMN reading_technician TEXT DEFAULT NULL;
    RAISE NOTICE 'Colonne reading_technician ajoutée à la table samples';
  ELSE
    RAISE NOTICE 'La colonne reading_technician existe déjà dans la table samples';
  END IF;
  
  -- Créer des indexes pour optimiser les requêtes sur les résultats
  BEGIN
    CREATE INDEX IF NOT EXISTS idx_samples_reading_date ON samples(reading_date);
    RAISE NOTICE 'Index sur reading_date créé';
  EXCEPTION
    WHEN OTHERS THEN
      RAISE NOTICE 'Erreur lors de la création de l''index sur reading_date: %', SQLERRM;
  END;
  
  BEGIN
    CREATE INDEX IF NOT EXISTS idx_samples_reading_technician ON samples(reading_technician);
    RAISE NOTICE 'Index sur reading_technician créé';
  EXCEPTION
    WHEN OTHERS THEN
      RAISE NOTICE 'Erreur lors de la création de l''index sur reading_technician: %', SQLERRM;
  END;
  
  RAISE NOTICE 'Migration des champs de résultats microbiologiques terminée avec succès';
END;
$$;

-- Exécuter la fonction pour appliquer les modifications
SELECT add_microbiological_results_fields();

-- Supprimer la fonction après utilisation
DROP FUNCTION IF EXISTS add_microbiological_results_fields(); 