-- ===========================================
-- SMARTBAR REALTIME SETUP
-- Execute this in Supabase SQL Editor
-- ===========================================

-- 1. Enable Realtime for tables
-- First, drop them from publication if they exist (to avoid errors)
DO $$
BEGIN
    -- Remove tables from publication if they exist
    BEGIN
        ALTER PUBLICATION supabase_realtime DROP TABLE products;
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'products was not in publication';
    END;
    
    BEGIN
        ALTER PUBLICATION supabase_realtime DROP TABLE transactions;
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'transactions was not in publication';
    END;
    
    BEGIN
        ALTER PUBLICATION supabase_realtime DROP TABLE transaction_items;
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'transaction_items was not in publication';
    END;
    
    BEGIN
        ALTER PUBLICATION supabase_realtime DROP TABLE events;
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'events was not in publication';
    END;
END $$;

-- 2. Add tables to realtime publication with REPLICA IDENTITY FULL
-- This ensures all row data is sent for updates/deletes
ALTER TABLE products REPLICA IDENTITY FULL;
ALTER TABLE transactions REPLICA IDENTITY FULL;
ALTER TABLE transaction_items REPLICA IDENTITY FULL;
ALTER TABLE events REPLICA IDENTITY FULL;

-- 3. Add tables back to publication
ALTER PUBLICATION supabase_realtime ADD TABLE products;
ALTER PUBLICATION supabase_realtime ADD TABLE transactions;
ALTER PUBLICATION supabase_realtime ADD TABLE transaction_items;
ALTER PUBLICATION supabase_realtime ADD TABLE events;

-- 4. Grant necessary permissions for realtime
GRANT SELECT ON products TO anon, authenticated;
GRANT SELECT ON transactions TO anon, authenticated;
GRANT SELECT ON transaction_items TO anon, authenticated;
GRANT SELECT ON events TO anon, authenticated;

-- 5. Verify realtime is enabled
SELECT 
    schemaname, 
    tablename, 
    (SELECT array_agg(pubname::text) 
     FROM pg_publication_tables 
     WHERE schemaname = t.schemaname AND tablename = t.tablename) as publications
FROM pg_tables t
WHERE schemaname = 'public' 
AND tablename IN ('products', 'transactions', 'transaction_items', 'events');

-- If you see 'supabase_realtime' in the publications column, realtime is enabled!
