-- ===========================================
-- SMARTBAR - REPAIR & REALTIME FIX
-- Execute this in your Supabase SQL Editor
-- ===========================================

-- 1. Create missing transaction_items table
CREATE TABLE IF NOT EXISTS transaction_items (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    transaction_id UUID REFERENCES transactions(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE SET NULL,
    quantity INT NOT NULL DEFAULT 1,
    unit_price NUMERIC(10,2) DEFAULT 0,
    unit_cost NUMERIC(10,2) DEFAULT 0
);

-- 2. Ensure profiles table exists (if it doesn't)
CREATE TABLE IF NOT EXISTS profiles (
    id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    role TEXT DEFAULT 'waiter',
    avatar_url TEXT,
    full_name TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Enable real-time for core tables
ALTER TABLE products REPLICA IDENTITY FULL;
ALTER TABLE transactions REPLICA IDENTITY FULL;
ALTER TABLE transaction_items REPLICA IDENTITY FULL;

-- Add tables to the realtime publication
DO $$
BEGIN
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE products;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END;
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE transactions;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END;
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE transaction_items;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END;
END $$;

-- 4. Disable RLS for development (Quick fix for connectivity)
ALTER TABLE products DISABLE ROW LEVEL SECURITY;
ALTER TABLE transactions DISABLE ROW LEVEL SECURITY;
ALTER TABLE transaction_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- 5. Grant permissions
GRANT ALL ON products TO anon, authenticated;
GRANT ALL ON transactions TO anon, authenticated;
GRANT ALL ON transaction_items TO anon, authenticated;
GRANT ALL ON profiles TO anon, authenticated;

-- 6. Done!
SELECT 'Database repaired and realtime enabled!' as info;
