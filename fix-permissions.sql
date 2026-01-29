-- ===========================================
-- SMARTBAR - DISABLE RLS FOR TESTING
-- Execute this in Supabase SQL Editor
-- ===========================================

-- Disable RLS on all tables (for testing only - re-enable in production)
ALTER TABLE products DISABLE ROW LEVEL SECURITY;
ALTER TABLE transactions DISABLE ROW LEVEL SECURITY;
ALTER TABLE transaction_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE events DISABLE ROW LEVEL SECURITY;

-- Grant full access to anon and authenticated users
GRANT ALL ON products TO anon, authenticated;
GRANT ALL ON transactions TO anon, authenticated;
GRANT ALL ON transaction_items TO anon, authenticated;
GRANT ALL ON events TO anon, authenticated;

-- Enable realtime with correct settings
ALTER TABLE products REPLICA IDENTITY FULL;
ALTER TABLE transactions REPLICA IDENTITY FULL;
ALTER TABLE transaction_items REPLICA IDENTITY FULL;
ALTER TABLE events REPLICA IDENTITY FULL;

-- Add tables to realtime publication (ignore errors if already added)
DO $$
BEGIN
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE products;
    EXCEPTION WHEN duplicate_object THEN
        RAISE NOTICE 'products already in publication';
    END;
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE transactions;
    EXCEPTION WHEN duplicate_object THEN
        RAISE NOTICE 'transactions already in publication';
    END;
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE transaction_items;
    EXCEPTION WHEN duplicate_object THEN
        RAISE NOTICE 'transaction_items already in publication';
    END;
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE events;
    EXCEPTION WHEN duplicate_object THEN
        RAISE NOTICE 'events already in publication';
    END;
END $$;

-- Verify setup
SELECT tablename, 
       (SELECT COUNT(*) FROM pg_policies WHERE tablename = t.tablename) as policy_count,
       (SELECT array_agg(pubname::text) FROM pg_publication_tables WHERE tablename = t.tablename) as publications
FROM pg_tables t
WHERE schemaname = 'public' 
AND tablename IN ('products', 'transactions', 'transaction_items', 'events');
