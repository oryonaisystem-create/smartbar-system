-- ===================================================
-- STAFF USERS SYSTEM - COM USUÁRIOS DE TESTE
-- Execute no Supabase SQL Editor
-- ===================================================

-- 1. CRIAR TABELA DE FUNCIONÁRIOS
CREATE TABLE IF NOT EXISTS public.staff_users (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    username text NOT NULL UNIQUE,
    password_hash text NOT NULL,
    display_name text,
    role text DEFAULT 'waiter', -- waiter, kitchen
    active boolean DEFAULT true,
    created_by uuid REFERENCES auth.users(id),
    created_at timestamp with time zone DEFAULT now(),
    last_login timestamp with time zone
);

-- 2. RLS - Admin pode gerenciar, anon pode ler para login
ALTER TABLE public.staff_users ENABLE ROW LEVEL SECURITY;

-- Admin autenticado pode fazer tudo
DROP POLICY IF EXISTS "staff_admin_all" ON public.staff_users;
CREATE POLICY "staff_admin_all" ON public.staff_users
FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Anon pode SELECT para verificar login
DROP POLICY IF EXISTS "staff_anon_select" ON public.staff_users;
CREATE POLICY "staff_anon_select" ON public.staff_users
FOR SELECT TO anon USING (true);

-- Anon pode UPDATE para last_login
DROP POLICY IF EXISTS "staff_anon_update" ON public.staff_users;
CREATE POLICY "staff_anon_update" ON public.staff_users
FOR UPDATE TO anon USING (true) WITH CHECK (true);

-- 3. ÍNDICE PARA BUSCA RÁPIDA
CREATE INDEX IF NOT EXISTS idx_staff_username ON public.staff_users(username);

-- 4. REALTIME
DO $$
BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.staff_users;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- 5. RELOAD
NOTIFY pgrst, 'reload config';

-- 6. CRIAR USUÁRIOS DE TESTE
-- SENHA PARA AMBOS: 1234
-- Hash gerado com: SHA256("1234" + "smartbar_salt_2026")

DELETE FROM public.staff_users WHERE username IN ('garcom', 'cozinha');

INSERT INTO public.staff_users (username, password_hash, display_name, role, active)
VALUES 
    ('garcom', 'c29ac82202e6d2ec43ffbbd128837e410d2d8e2c5a2f336155f76ec01c925733', 'Garçom Teste', 'waiter', true),
    ('cozinha', 'c29ac82202e6d2ec43ffbbd128837e410d2d8e2c5a2f336155f76ec01c925733', 'Cozinha Teste', 'kitchen', true);

-- ===================================================
-- CREDENCIAIS DE TESTE:
-- 
-- GARÇOM:
--   Usuário: garcom
--   Senha: 1234
--   Redireciona para: /pos
--
-- COZINHA:
--   Usuário: cozinha
--   Senha: 1234
--   Redireciona para: /kitchen
-- ===================================================

-- VERIFICAÇÃO
SELECT username, display_name, role, active FROM public.staff_users;
