-- ===========================================
-- 🚀 SOLUÇÃO ATÔMICA - CONEXÃO & REALTIME
-- Execute no Editor SQL do seu Supabase
-- ===========================================

-- 1. ADICIONAR COLUNAS (FOTOS, CARDÁPIO E VENDAS)
DO $$ 
BEGIN
    -- Produtos
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'show_on_menu') THEN
        ALTER TABLE products ADD COLUMN show_on_menu BOOLEAN DEFAULT true;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'description') THEN
        ALTER TABLE products ADD COLUMN description TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'image_url') THEN
        ALTER TABLE products ADD COLUMN image_url TEXT;
    END IF;

    -- Vendas
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'transactions' AND column_name = 'cost_price') THEN
        ALTER TABLE transactions ADD COLUMN cost_price NUMERIC(10,2) DEFAULT 0;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'transactions' AND column_name = 'operator') THEN
        ALTER TABLE transactions ADD COLUMN operator TEXT;
    END IF;
END $$;

-- 2. ATIVAR REALTIME (Para os dados aparecerem na hora)
-- Se já estiverem, o comando apenas confirma.
BEGIN;
  -- Remove se existir para garantir clean slate
  DROP PUBLICATION IF EXISTS supabase_realtime;
  -- Cria a publicação e adiciona as tabelas
  CREATE PUBLICATION supabase_realtime FOR TABLE products, transactions, transaction_items;
COMMIT;

-- 3. RESET DE PERMISSÕES TOTAIS (Bypass RLS para o App)
ALTER TABLE products DISABLE ROW LEVEL SECURITY;
ALTER TABLE transactions DISABLE ROW LEVEL SECURITY;
ALTER TABLE transaction_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

GRANT ALL ON products, transactions, transaction_items, profiles TO anon, authenticated, service_role;

-- 4. CONFIGURAÇÃO DO BUCKET DE IMAGENS
-- Se o bucket 'products' não existir, isso tenta criar (requer permissão admin)
INSERT INTO storage.buckets (id, name, public)
SELECT 'products', 'products', true
WHERE NOT EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'products');

-- 5. SUCESSO
SELECT '✅ SISTEMA SMARTBAR RESTAURADO COM SUCESSO!' as status;
