-- ===========================================
-- SMARTBAR - FIX TRANSACTIONS TABLE
-- Execute this in Supabase SQL Editor
-- ===========================================

-- First, check if transactions table exists and its structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'transactions' AND table_schema = 'public';

-- If the table doesn't have the right columns, drop and recreate it
-- WARNING: This will delete all existing transaction data!

DROP TABLE IF EXISTS transaction_items CASCADE;
DROP TABLE IF EXISTS transactions CASCADE;

-- Recreate transactions table with correct columns
CREATE TABLE transactions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    type TEXT CHECK (type IN ('sale', 'expense')) NOT NULL DEFAULT 'sale',
    total_amount NUMERIC(10,2) NOT NULL DEFAULT 0,
    payment_method TEXT DEFAULT 'DINHEIRO',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Recreate transaction_items table
CREATE TABLE transaction_items (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    transaction_id UUID REFERENCES transactions(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE SET NULL,
    quantity INT NOT NULL DEFAULT 1,
    unit_price NUMERIC(10,2) DEFAULT 0,
    unit_cost NUMERIC(10,2) DEFAULT 0
);

-- Disable RLS
ALTER TABLE transactions DISABLE ROW LEVEL SECURITY;
ALTER TABLE transaction_items DISABLE ROW LEVEL SECURITY;

-- Grant permissions
GRANT ALL ON transactions TO anon, authenticated;
GRANT ALL ON transaction_items TO anon, authenticated;

-- Enable realtime
ALTER TABLE transactions REPLICA IDENTITY FULL;
ALTER TABLE transaction_items REPLICA IDENTITY FULL;

DO $$
BEGIN
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE transactions;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END;
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE transaction_items;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END;
END $$;

-- Verify the table structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'transactions' AND table_schema = 'public'
ORDER BY ordinal_position;
