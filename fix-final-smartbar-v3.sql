-- ===========================================
-- 🚀 SMARTBAR - CORREÇÃO TOTAL E DEFINITIVA
-- Execute no Editor SQL do seu Supabase
-- ===========================================

DO $$ 
BEGIN
    -- 1. TABELA DE PRODUTOS (Cardápio mesa)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'show_on_menu') THEN
        ALTER TABLE products ADD COLUMN show_on_menu BOOLEAN DEFAULT true;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'description') THEN
        ALTER TABLE products ADD COLUMN description TEXT;
    END IF;

    -- 2. TABELA DE TRANSAÇÕES (Vendas e Lucro)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'transactions' AND column_name = 'cost_price') THEN
        -- Adiciona a coluna que salva o custo total da venda pro seu relatório
        ALTER TABLE transactions ADD COLUMN cost_price NUMERIC(10,2) DEFAULT 0;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'transactions' AND column_name = 'operator') THEN
        -- Adiciona quem fez a venda
        ALTER TABLE transactions ADD COLUMN operator TEXT;
    END IF;
END $$;

-- 3. RESET DE PERMISSÕES (Garantir que o App consiga salvar tudo)
ALTER TABLE products DISABLE ROW LEVEL SECURITY;
ALTER TABLE transactions DISABLE ROW LEVEL SECURITY;
ALTER TABLE transaction_items DISABLE ROW LEVEL SECURITY;

GRANT ALL ON products TO anon, authenticated;
GRANT ALL ON transactions TO anon, authenticated;
GRANT ALL ON transaction_items TO anon, authenticated;

-- 4. Sucesso!
SELECT '🚀 Banco de dados SmartBar está 100% agora!' as status;
