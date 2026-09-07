--i use this file as a small diagnostic SQL script for schema check and data preview

-- Check if new columns exist in reclamation table
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'reclamation' 
AND column_name IN ('classification_method', 'classification_confidence', 'niveau', 'assigned_to', 'feedback_comment')
ORDER BY column_name;

-- Check current reclamations
SELECT id_reclamation, titre, niveau, classification_method, classification_confidence
FROM reclamation
ORDER BY date_depot DESC
LIMIT 10;
