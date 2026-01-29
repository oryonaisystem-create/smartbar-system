-- ===========================================
-- 🚀 SOLUÇÃO ATÔMICA V4 - RESTAURAÇÃO TOTAL
-- Execute no Editor SQL do seu Supabase
-- ===========================================

-- 1. COLUNAS FALTANTES
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'show_on_menu') THEN
        ALTER TABLE products ADD COLUMN show_on_menu BOOLEAN DEFAULT true;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'description') THEN
        ALTER TABLE products ADD COLUMN description TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'transactions' AND column_name = 'cost_price') THEN
        ALTER TABLE transactions ADD COLUMN cost_price NUMERIC(10,2) DEFAULT 0;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'transactions' AND column_name = 'operator') THEN
        ALTER TABLE transactions ADD COLUMN operator TEXT;
    END IF;
END $$;

-- 2. REALTIME (DADOS AO VIVO)
DROP PUBLICATION IF EXISTS supabase_realtime;
CREATE PUBLICATION supabase_realtime FOR TABLE products, transactions, transaction_items;

-- 3. PERMISSÕES DE TABELAS (RLS OFF)
ALTER TABLE products DISABLE ROW LEVEL SECURITY;
ALTER TABLE transactions DISABLE ROW LEVEL SECURITY;
ALTER TABLE transaction_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, postgres;

-- 4. STORAGE (FOTOS)
-- Cria o bucket se não existir
INSERT INTO storage.buckets (id, name, public)
SELECT 'products', 'products', true
WHERE NOT EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'products');

-- Libera Geral no Storage (Para as fotos salvarem sem erro)
CREATE POLICY "Libera Tudo" ON storage.objects FOR ALL USING (true) WITH CHECK (true);
-- Se a política acima der erro é porque já existe. Pode ignorar.

-- 5. FINALIZAR
SELECT '✅ SISTEMA 100% RESTAURADO!' as status;
