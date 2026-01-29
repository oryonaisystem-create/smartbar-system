-- FIX: Adicionar coluna payment_method se ela não existir
-- Rode este comando no SQL Editor do seu Supabase

DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='transactions' AND column_name='payment_method') THEN 
        ALTER TABLE transactions ADD COLUMN payment_method text;
    END IF;
END $$;
