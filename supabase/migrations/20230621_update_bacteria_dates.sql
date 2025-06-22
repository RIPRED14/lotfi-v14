-- Mise à jour des dates des bactéries pour tester le système de couleurs
-- Cette migration met à jour les dates et statuts des bactéries existantes

-- Mettre à jour les bactéries avec des dates et statuts variés
WITH bacteria_updates AS (
  SELECT 
    id,
    ROW_NUMBER() OVER (ORDER BY id) AS rn,
    bacteria_name,
    bacteria_delay,
    status
  FROM form_bacteria_selections
)
UPDATE form_bacteria_selections 
SET 
  created_at = CASE 
    -- En retard (2 jours avant)
    WHEN bacteria_updates.rn % 6 = 1 THEN (CURRENT_DATE - INTERVAL '2 days')::timestamp
    -- À faire aujourd'hui (hier)
    WHEN bacteria_updates.rn % 6 = 2 THEN (CURRENT_DATE - INTERVAL '1 day')::timestamp
    -- Terminé (2 jours avant)
    WHEN bacteria_updates.rn % 6 = 3 THEN (CURRENT_DATE - INTERVAL '2 days')::timestamp
    -- En cours (hier)
    WHEN bacteria_updates.rn % 6 = 4 THEN (CURRENT_DATE - INTERVAL '1 day')::timestamp
    -- Pas encore à échéance (aujourd'hui)
    WHEN bacteria_updates.rn % 6 = 5 THEN CURRENT_DATE::timestamp
    -- Pas encore à échéance (demain)
    ELSE (CURRENT_DATE + INTERVAL '1 day')::timestamp
  END,
  status = CASE 
    -- En retard
    WHEN bacteria_updates.rn % 6 = 1 THEN 'pending'
    -- À faire aujourd'hui
    WHEN bacteria_updates.rn % 6 = 2 THEN 'pending'
    -- Terminé
    WHEN bacteria_updates.rn % 6 = 3 THEN 'completed'
    -- En cours
    WHEN bacteria_updates.rn % 6 = 4 THEN 'in_progress'
    -- Pas encore à échéance
    WHEN bacteria_updates.rn % 6 = 5 THEN 'pending'
    -- Pas encore à échéance
    ELSE 'pending'
  END,
  modified_at = CURRENT_TIMESTAMP
FROM bacteria_updates
WHERE form_bacteria_selections.id = bacteria_updates.id;

-- Afficher les résultats
SELECT 
  'Mise à jour terminée' as message,
  COUNT(*) as total_bacteria,
  COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_count,
  COUNT(CASE WHEN status = 'in_progress' THEN 1 END) as in_progress_count,
  COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_count
FROM form_bacteria_selections; 