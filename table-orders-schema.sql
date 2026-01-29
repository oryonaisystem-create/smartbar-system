-- ===================================================
-- SMARTBAR TABLE ORDERS SYSTEM
-- Execute no Supabase SQL Editor
-- ===================================================

-- 1. ADICIONAR COLUNAS EM TRANSACTIONS
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS description text;
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS status text DEFAULT 'pending';
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS table_number text;

-- 2. CRIAR TABELA DE NOTIFICAÇÕES DE MESA
CREATE TABLE IF NOT EXISTS public.table_notifications (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    table_number text NOT NULL,
    type text NOT NULL, -- 'call_waiter', 'close_tab'
    status text DEFAULT 'pending', -- pending, acknowledged
    created_at timestamp with time zone DEFAULT now()
);

-- 3. RLS PARA TABLE_NOTIFICATIONS
ALTER TABLE public.table_notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "table_notifications_all" ON public.table_notifications;
CREATE POLICY "table_notifications_all" ON public.table_notifications 
FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Permitir INSERT sem autenticação (cliente no menu público)
DROP POLICY IF EXISTS "table_notifications_anon_insert" ON public.table_notifications;
CREATE POLICY "table_notifications_anon_insert" ON public.table_notifications 
FOR INSERT TO anon WITH CHECK (true);

-- Permitir INSERT sem autenticação em transactions (cliente no menu público)
DROP POLICY IF EXISTS "transactions_anon_insert" ON public.transactions;
CREATE POLICY "transactions_anon_insert" ON public.transactions 
FOR INSERT TO anon WITH CHECK (true);

DROP POLICY IF EXISTS "transaction_items_anon_insert" ON public.transaction_items;
CREATE POLICY "transaction_items_anon_insert" ON public.transaction_items 
FOR INSERT TO anon WITH CHECK (true);

-- 4. REALTIME
DO $$
BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.table_notifications;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- 5. RELOAD CACHE
NOTIFY pgrst, 'reload config';

-- VERIFICAÇÃO
SELECT 'table_notifications criada' as status;
