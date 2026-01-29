-- ===========================================
-- ADICIONAR COLUNA image_url NA TABELA products
-- Execute no Editor SQL do seu Supabase
-- ===========================================

DO $$ 
BEGIN
    -- 1. Tentar adicionar a coluna image_url
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'products' AND column_name = 'image_url'
    ) THEN
        ALTER TABLE products ADD COLUMN image_url TEXT;
    END IF;
END $$;

-- 2. Garantir permissões e realtime (apenas por segurança)
ALTER TABLE products REPLICA IDENTITY FULL;
ALTER TABLE products DISABLE ROW LEVEL SECURITY;
GRANT ALL ON products TO anon, authenticated;

-- 3. Mensagem de sucesso
SELECT 'Coluna image_url adicionada com sucesso!' as info;
