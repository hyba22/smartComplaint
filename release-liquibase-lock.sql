-- Release Liquibase lock 
-- Run this in your PostgreSQL database
--script for when Liquibase gets stuck /troubleshooting helper

UPDATE databasechangeloglock SET locked = FALSE, lockgranted = NULL, lockedby = NULL WHERE id = 1;

-- Verify the lock is released
SELECT * FROM databasechangeloglock;
