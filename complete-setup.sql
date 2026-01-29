-- ===========================================
-- SMARTBAR - COMPLETE DATABASE SETUP
-- Execute ALL of this in Supabase SQL Editor
-- ===========================================

-- 1. EXTENSION
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. DROP and RECREATE TABLES (to ensure clean slate)
-- Comment these out if you want to keep existing data

-- 3. CREATE TABLES
CREATE TABLE IF NOT EXISTS products (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    barcode TEXT UNIQUE,
    price NUMERIC(10,2) NOT NULL DEFAULT 0,
    cost NUMERIC(10,2) NOT NULL DEFAULT 0,
    stock_quantity INT DEFAULT 0,
    min_stock_alert INT DEFAULT 5,
    category TEXT,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS transactions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    type TEXT CHECK (type IN ('sale', 'expense')),
    total_amount NUMERIC(10,2) NOT NULL DEFAULT 0,
    payment_method TEXT DEFAULT 'DINHEIRO',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS transaction_items (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    transaction_id UUID REFERENCES transactions(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE SET NULL,
    quantity INT NOT NULL DEFAULT 1,
    unit_price NUMERIC(10,2) DEFAULT 0,
    unit_cost NUMERIC(10,2) DEFAULT 0
);

CREATE TABLE IF NOT EXISTS events (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT,
    start_date TIMESTAMP WITH TIME ZONE,
    end_date TIMESTAMP WITH TIME ZONE,
    type TEXT,
    cost NUMERIC(10,2)
);

-- 4. DISABLE RLS (for development - enable in production)
ALTER TABLE products DISABLE ROW LEVEL SECURITY;
ALTER TABLE transactions DISABLE ROW LEVEL SECURITY;
ALTER TABLE transaction_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE events DISABLE ROW LEVEL SECURITY;

-- 5. GRANT FULL PERMISSIONS
GRANT ALL ON products TO anon, authenticated;
GRANT ALL ON transactions TO anon, authenticated;
GRANT ALL ON transaction_items TO anon, authenticated;
GRANT ALL ON events TO anon, authenticated;

-- 6. CREATE/REPLACE DECREMENT STOCK FUNCTION
CREATE OR REPLACE FUNCTION decrement_stock(row_id UUID, qty INT)
RETURNS VOID AS $$
BEGIN
    UPDATE products
    SET stock_quantity = GREATEST(0, stock_quantity - qty)
    WHERE id = row_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION decrement_stock(UUID, INT) TO anon, authenticated;

-- 7. CREATE INCREMENT STOCK FUNCTION (for restocking)
CREATE OR REPLACE FUNCTION increment_stock(row_id UUID, qty INT)
RETURNS VOID AS $$
BEGIN
    UPDATE products
    SET stock_quantity = stock_quantity + qty
    WHERE id = row_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION increment_stock(UUID, INT) TO anon, authenticated;

-- 8. ENABLE REALTIME
ALTER TABLE products REPLICA IDENTITY FULL;
ALTER TABLE transactions REPLICA IDENTITY FULL;
ALTER TABLE transaction_items REPLICA IDENTITY FULL;
ALTER TABLE events REPLICA IDENTITY FULL;

-- Add to realtime publication (ignore errors if already added)
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
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE events;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END;
END $$;

-- 9. INSERT TEST DATA (if tables are empty)
INSERT INTO products (name, barcode, price, cost, stock_quantity, min_stock_alert, category)
SELECT 'Coca-Cola 350ml', '7894900010015', 8.00, 4.50, 50, 10, 'Bebidas'
WHERE NOT EXISTS (SELECT 1 FROM products WHERE barcode = '7894900010015');

INSERT INTO products (name, barcode, price, cost, stock_quantity, min_stock_alert, category)
SELECT 'Heineken 330ml', '8712000900212', 12.00, 7.00, 30, 10, 'Cervejas'
WHERE NOT EXISTS (SELECT 1 FROM products WHERE barcode = '8712000900212');

INSERT INTO products (name, barcode, price, cost, stock_quantity, min_stock_alert, category)
SELECT 'Red Bull 250ml', '9002490100070', 15.00, 9.00, 25, 8, 'Energéticos'
WHERE NOT EXISTS (SELECT 1 FROM products WHERE barcode = '9002490100070');

-- 10. VERIFICATION - Check everything is set up
SELECT 'Tables and functions created successfully!' as status;

SELECT 
    tablename,
    (SELECT COUNT(*) FROM pg_policies WHERE tablename = t.tablename) as policies,
    (SELECT array_agg(pubname::text) FROM pg_publication_tables WHERE tablename = t.tablename) as realtime
FROM pg_tables t
WHERE schemaname = 'public' 
AND tablename IN ('products', 'transactions', 'transaction_items', 'events');

SELECT COUNT(*) as product_count FROM products;
