-- Add operator column to transactions table
ALTER TABLE transactions 
ADD COLUMN IF NOT EXISTS operator text;

-- Notify
DO $$
BEGIN
    RAISE NOTICE 'Added operator column to transactions table';
END $$;
