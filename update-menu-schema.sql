-- ===========================================
-- ATUALIZAÇÃO DO SCHEMA PARA GESTÃO DE CARDÁPIO
-- Execute no Editor SQL do seu Supabase
-- ===========================================

DO $$ 
BEGIN
    -- 1. Adicionar coluna show_on_menu (Padrão: true para itens existentes)
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'products' AND column_name = 'show_on_menu'
    ) THEN
        ALTER TABLE products ADD COLUMN show_on_menu BOOLEAN DEFAULT true;
    END IF;

    -- 2. Adicionar coluna description se não existir (para o cardápio digital)
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'products' AND column_name = 'description'
    ) THEN
        ALTER TABLE products ADD COLUMN description TEXT;
    END IF;
END $$;

-- 3. Garantir permissões
ALTER TABLE products DISABLE ROW LEVEL SECURITY;
GRANT ALL ON products TO anon, authenticated;

-- 4. Mensagem de sucesso
SELECT 'Schema do cardápio atualizado com sucesso!' as info;
