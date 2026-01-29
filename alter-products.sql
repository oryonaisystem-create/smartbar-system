-- Add cost column to products for Profit Reports
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS cost NUMERIC DEFAULT 0;

COMMENT ON COLUMN public.products.cost IS 'Cost price of the product for margin calculation';
