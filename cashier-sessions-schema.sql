-- ===================================================
-- CASHIER SESSIONS SCHEMA
-- ===================================================

-- 1. Create cashier_sessions table
CREATE TABLE IF NOT EXISTS public.cashier_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    opened_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    closed_at TIMESTAMPTZ,
    opened_by TEXT NOT NULL,
    closed_by TEXT,
    initial_balance NUMERIC NOT NULL DEFAULT 0,
    final_balance NUMERIC,
    total_sales NUMERIC DEFAULT 0,
    total_expenses NUMERIC DEFAULT 0,
    expected_balance NUMERIC,
    notes TEXT,
    status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'closed')),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Add cashier_session_id to transactions
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS cashier_session_id UUID REFERENCES public.cashier_sessions(id);

-- 3. Security & Policies
ALTER TABLE public.cashier_sessions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "cashier_sessions_select" ON public.cashier_sessions;
CREATE POLICY "cashier_sessions_select" ON public.cashier_sessions FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "cashier_sessions_insert" ON public.cashier_sessions;
CREATE POLICY "cashier_sessions_insert" ON public.cashier_sessions FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "cashier_sessions_update" ON public.cashier_sessions;
CREATE POLICY "cashier_sessions_update" ON public.cashier_sessions FOR UPDATE TO authenticated USING (true);

-- 4. Sample Transaction Query for Report (Logic helper)
-- SELECT sum(total_amount) FROM public.transactions WHERE cashier_session_id = '...' AND type = 'sale';
