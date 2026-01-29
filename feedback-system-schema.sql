-- ===================================================
-- CUSTOMER FEEDBACK SYSTEM
-- Execute no Supabase SQL Editor
-- ===================================================

-- 1. TABELA DE SESSÕES DE MESA (COMANDA DO CLIENTE)
CREATE TABLE IF NOT EXISTS public.table_sessions (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    table_number text NOT NULL,
    customer_name text NOT NULL,
    customer_phone text NOT NULL,
    customer_email text,
    status text DEFAULT 'active', -- active, closed
    opened_at timestamp with time zone DEFAULT now(),
    closed_at timestamp with time zone,
    total_spent numeric DEFAULT 0,
    feedback_sent boolean DEFAULT false
);

-- 2. TABELA DE RESPOSTAS DE FEEDBACK
CREATE TABLE IF NOT EXISTS public.feedback_responses (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id uuid REFERENCES public.table_sessions(id),
    rating_service integer CHECK (rating_service >= 1 AND rating_service <= 5),
    rating_products integer CHECK (rating_products >= 1 AND rating_products <= 5),
    rating_ambiance integer CHECK (rating_ambiance >= 1 AND rating_ambiance <= 5),
    suggestions text,
    responded_at timestamp with time zone DEFAULT now()
);

-- 3. RLS PARA TABLE_SESSIONS
ALTER TABLE public.table_sessions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "table_sessions_all" ON public.table_sessions;
CREATE POLICY "table_sessions_all" ON public.table_sessions
FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Anon pode insert (cliente abrindo comanda)
DROP POLICY IF EXISTS "table_sessions_anon_insert" ON public.table_sessions;
CREATE POLICY "table_sessions_anon_insert" ON public.table_sessions
FOR INSERT TO anon WITH CHECK (true);

-- Anon pode select para verificar sessão
DROP POLICY IF EXISTS "table_sessions_anon_select" ON public.table_sessions;
CREATE POLICY "table_sessions_anon_select" ON public.table_sessions
FOR SELECT TO anon USING (true);

-- 4. RLS PARA FEEDBACK_RESPONSES
ALTER TABLE public.feedback_responses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "feedback_all" ON public.feedback_responses;
CREATE POLICY "feedback_all" ON public.feedback_responses
FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Anon pode insert (cliente respondendo feedback)
DROP POLICY IF EXISTS "feedback_anon_insert" ON public.feedback_responses;
CREATE POLICY "feedback_anon_insert" ON public.feedback_responses
FOR INSERT TO anon WITH CHECK (true);

-- 5. ÍNDICES
CREATE INDEX IF NOT EXISTS idx_sessions_table ON public.table_sessions(table_number);
CREATE INDEX IF NOT EXISTS idx_sessions_status ON public.table_sessions(status);
CREATE INDEX IF NOT EXISTS idx_feedback_session ON public.feedback_responses(session_id);

-- 6. REALTIME
DO $$
BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.table_sessions;
    ALTER PUBLICATION supabase_realtime ADD TABLE public.feedback_responses;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- 7. RELOAD
NOTIFY pgrst, 'reload config';

-- VERIFICAÇÃO
SELECT 'Feedback system tables created' as status;
