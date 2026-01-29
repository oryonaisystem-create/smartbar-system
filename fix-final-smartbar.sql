-- ===========================================
-- CORREÇÃO FINAL - SMARTBAR (ESTOQUE & VENDAS)
-- Execute no Editor SQL do seu Supabase
-- ===========================================

DO $$ 
BEGIN
    -- 1. Colunas para PRODUTOS (Cardápio Digital)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'show_on_menu') THEN
        ALTER TABLE products ADD COLUMN show_on_menu BOOLEAN DEFAULT true;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'description') THEN
        ALTER TABLE products ADD COLUMN description TEXT;
    END IF;

    -- 2. Colunas para TRANSAÇÕES (Vendas & Lucro)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'transactions' AND column_name = 'cost_price') THEN
        ALTER TABLE transactions ADD COLUMN cost_price NUMERIC(10,2) DEFAULT 0;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'transactions' AND column_name = 'operator') THEN
        ALTER TABLE transactions ADD COLUMN operator TEXT;
    END IF;
END $$;

-- 3. Garantir permissões totais
ALTER TABLE products DISABLE ROW LEVEL SECURITY;
ALTER TABLE transactions DISABLE ROW LEVEL SECURITY;
ALTER TABLE transaction_items DISABLE ROW LEVEL SECURITY;

GRANT ALL ON products TO anon, authenticated;
GRANT ALL ON transactions TO anon, authenticated;
GRANT ALL ON transaction_items TO anon, authenticated;

-- 4. Sucesso
SELECT 'Banco de dados SmartBar totalmente restaurado!' as status;
