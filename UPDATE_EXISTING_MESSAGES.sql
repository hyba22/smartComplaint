-- Update existing messages to set messageType based on pieceJointe field

UPDATE message 
SET message_type = 'IMAGE' 
WHERE piece_jointe IS NOT NULL 
  AND piece_jointe LIKE '%images/%'
  AND (message_type IS NULL OR message_type = 'TEXT');

-- Set messageType to 'VOICE' for messages with voice files
UPDATE message 
SET message_type = 'VOICE' 
WHERE piece_jointe IS NOT NULL 
  AND piece_jointe LIKE '%voice/%'
  AND (message_type IS NULL OR message_type = 'TEXT');

-- Set messageType to 'TEXT' for all other messages
UPDATE message 
SET message_type = 'TEXT' 
WHERE message_type IS NULL;

-- Verify the update
SELECT message_type, COUNT(*) as count 
FROM message 
GROUP BY message_type;
