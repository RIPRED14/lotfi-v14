-- Création de la fonction RPC pour ajouter la colonne form_id si elle n'existe pas
CREATE OR REPLACE FUNCTION add_form_id_column()
RETURNS VOID AS $$
DECLARE
  column_exists BOOLEAN;
BEGIN
  -- Vérifier si la colonne existe déjà
  SELECT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'samples' 
    AND column_name = 'form_id'
  ) INTO column_exists;
  
  -- Si la colonne n'existe pas, l'ajouter
  IF NOT column_exists THEN
    EXECUTE 'ALTER TABLE samples ADD COLUMN form_id TEXT DEFAULT NULL';
    RAISE NOTICE 'Colonne form_id ajoutée à la table samples';
  ELSE
    RAISE NOTICE 'La colonne form_id existe déjà dans la table samples';
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 