-- ===================================================
-- PROFILE & STORAGE SYSTEM SETUP
-- Execute no Supabase SQL Editor
-- ===================================================

-- 1. Garantir tabela de perfis
CREATE TABLE IF NOT EXISTS public.profiles (
    id uuid REFERENCES auth.users(id) PRIMARY KEY,
    full_name text,
    avatar_url text,
    role text DEFAULT 'waiter',
    updated_at timestamp with time zone DEFAULT now()
);

-- 2. RLS para perfis
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
CREATE POLICY "Users can view their own profile" ON public.profiles
FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile" ON public.profiles
FOR UPDATE USING (auth.uid() = id);

-- 3. Trigger para criar perfil no signup (opcional se já tiver usuários)
-- INSERT INTO public.profiles (id, full_name, role)
-- SELECT id, email, 'admin' FROM auth.users
-- ON CONFLICT (id) DO NOTHING;

-- 4. Criar bucket de storage se não existir
-- Nota: Isso geralmente precisa ser feito via UI ou API de Admin
-- Mas podemos tentar liberar RLS para o bucket 'products' que o código usa

-- 5. Liberar acesso ao bucket 'products' no storage
-- INSERT INTO storage.buckets (id, name, public) 
-- VALUES ('products', 'products', true)
-- ON CONFLICT (id) DO NOTHING;

-- Políticas de Storage para o bucket 'products'
-- (Permitir que usuários autenticados façam upload na pasta avatars/)
DROP POLICY IF EXISTS "Avatar Upload Access" ON storage.objects;
CREATE POLICY "Avatar Upload Access" ON storage.objects 
FOR INSERT TO authenticated 
WITH CHECK (bucket_id = 'products');

DROP POLICY IF EXISTS "Avatar Public View" ON storage.objects;
CREATE POLICY "Avatar Public View" ON storage.objects 
FOR SELECT TO public
USING (bucket_id = 'products');

DROP POLICY IF EXISTS "Avatar Delete/Update" ON storage.objects;
CREATE POLICY "Avatar Delete/Update" ON storage.objects 
FOR ALL TO authenticated
USING (bucket_id = 'products' AND (auth.uid())::text = (storage.foldername(name))[1]);

-- Reload config
NOTIFY pgrst, 'reload config';
