-- ===================================================
-- FIX RLS PARA STAFF (ANON) LER PRODUTOS
-- Execute no Supabase SQL Editor
-- ===================================================

-- 1. Garantir que tabela tem RLS habilitado
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- 2. Permitir que ANON leia produtos (para garçons/clientes)
DROP POLICY IF EXISTS "products_anon_select" ON public.products;
CREATE POLICY "products_anon_select" ON public.products
FOR SELECT TO anon USING (true);

-- 3. Permitir que AUTHENTICATED faça tudo em produtos
DROP POLICY IF EXISTS "products_auth_all" ON public.products;
CREATE POLICY "products_auth_all" ON public.products
FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 4. Fazer o mesmo para table_sessions (mesas)
ALTER TABLE public.table_sessions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "table_sessions_anon_all" ON public.table_sessions;
CREATE POLICY "table_sessions_anon_all" ON public.table_sessions
FOR ALL TO anon USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "table_sessions_auth_all" ON public.table_sessions;
CREATE POLICY "table_sessions_auth_all" ON public.table_sessions
FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 5. Fazer o mesmo para table_notifications
ALTER TABLE public.table_notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "table_notifications_anon_all" ON public.table_notifications;
CREATE POLICY "table_notifications_anon_all" ON public.table_notifications
FOR ALL TO anon USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "table_notifications_auth_all" ON public.table_notifications;
CREATE POLICY "table_notifications_auth_all" ON public.table_notifications
FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 6. Fazer o mesmo para transactions
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "transactions_anon_all" ON public.transactions;
CREATE POLICY "transactions_anon_all" ON public.transactions
FOR ALL TO anon USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "transactions_auth_all" ON public.transactions;
CREATE POLICY "transactions_auth_all" ON public.transactions
FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 7. Reload config
NOTIFY pgrst, 'reload config';

-- Verificação
SELECT 'RLS policies created for staff access' as status;
