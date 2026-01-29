-- Add audit columns to transactions table
ALTER TABLE public.transactions 
ADD COLUMN IF NOT EXISTS updated_by TEXT,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE;

-- Comment on columns
COMMENT ON COLUMN public.transactions.updated_by IS 'Name of the operator who last modified the transaction';
COMMENT ON COLUMN public.transactions.updated_at IS 'Timestamp of the last modification';
