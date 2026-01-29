-- ===================================================
-- SMARTBAR ULTIMATE FIX V2.0
-- Execute este script COMPLETO no Supabase SQL Editor
-- ===================================================

-- 1. ADICIONAR COLUNAS FALTANTES (se não existirem)
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS payment_method text;
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS operator text;
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS shift_id uuid;
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS type text DEFAULT 'sale';
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS total_amount numeric DEFAULT 0;

ALTER TABLE public.transaction_items ADD COLUMN IF NOT EXISTS unit_cost numeric DEFAULT 0;

ALTER TABLE public.products ADD COLUMN IF NOT EXISTS description text;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS show_on_menu boolean DEFAULT false;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS cost_price numeric DEFAULT 0;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS cost numeric DEFAULT 0;

-- 2. RLS ABERTO PARA USUÁRIOS AUTENTICADOS
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transaction_items ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "products_all" ON public.products;
DROP POLICY IF EXISTS "products_select" ON public.products;
DROP POLICY IF EXISTS "products_insert" ON public.products;
DROP POLICY IF EXISTS "products_update" ON public.products;
DROP POLICY IF EXISTS "products_delete" ON public.products;

DROP POLICY IF EXISTS "transactions_all" ON public.transactions;
DROP POLICY IF EXISTS "transactions_select" ON public.transactions;
DROP POLICY IF EXISTS "transactions_insert" ON public.transactions;

DROP POLICY IF EXISTS "transaction_items_all" ON public.transaction_items;
DROP POLICY IF EXISTS "transaction_items_select" ON public.transaction_items;
DROP POLICY IF EXISTS "transaction_items_insert" ON public.transaction_items;

-- Create OPEN policies
CREATE POLICY "products_all" ON public.products FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "transactions_all" ON public.transactions FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "transaction_items_all" ON public.transaction_items FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 3. CRIAR TRANSAÇÕES DE TESTE PARA HOJE
DO $$
DECLARE
    test_tx_id uuid;
    test_product_id uuid;
BEGIN
    -- Só cria se não houver transações hoje
    IF NOT EXISTS (
        SELECT 1 FROM public.transactions 
        WHERE created_at >= CURRENT_DATE
    ) THEN
        -- Pega um produto para usar na transação
        SELECT id INTO test_product_id FROM public.products LIMIT 1;
        
        IF test_product_id IS NOT NULL THEN
            -- Transação 1
            INSERT INTO public.transactions (type, total_amount, payment_method, operator, created_at)
            VALUES ('sale', 88.00, 'pix', 'Sistema', now())
            RETURNING id INTO test_tx_id;
            
            INSERT INTO public.transaction_items (transaction_id, product_id, quantity, unit_price, unit_cost)
            VALUES (test_tx_id, test_product_id, 5, 8.00, 4.00);
            
            -- Transação 2
            INSERT INTO public.transactions (type, total_amount, payment_method, operator, created_at)
            VALUES ('sale', 150.00, 'card', 'Sistema', now())
            RETURNING id INTO test_tx_id;
            
            INSERT INTO public.transaction_items (transaction_id, product_id, quantity, unit_price, unit_cost)
            VALUES (test_tx_id, test_product_id, 10, 15.00, 8.00);
            
            -- Transação 3
            INSERT INTO public.transactions (type, total_amount, payment_method, operator, created_at)
            VALUES ('sale', 150.00, 'cash', 'Sistema', now())
            RETURNING id INTO test_tx_id;
            
            INSERT INTO public.transaction_items (transaction_id, product_id, quantity, unit_price, unit_cost)
            VALUES (test_tx_id, test_product_id, 6, 25.00, 12.00);
            
            RAISE NOTICE '✅ 3 transações de teste criadas para hoje!';
        ELSE
            RAISE NOTICE '⚠️ Nenhum produto encontrado para criar transações de teste.';
        END IF;
    ELSE
        RAISE NOTICE '⚠️ Já existem transações hoje.';
    END IF;
END $$;

-- 4. SYNC DE PROFILES
INSERT INTO public.profiles (id, email, role)
SELECT id, email, 'admin' FROM auth.users
ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email;

-- 5. REALTIME
DO $$
BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.products;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.transactions;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.transaction_items;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- 6. RELOAD CACHE
NOTIFY pgrst, 'reload config';

-- VERIFICAÇÃO FINAL
SELECT 'products' as tabela, count(*) as registros FROM public.products
UNION ALL
SELECT 'transactions', count(*) FROM public.transactions
UNION ALL
SELECT 'transaction_items', count(*) FROM public.transaction_items;
