-- Função para decrementar estoque com segurança
CREATE OR REPLACE FUNCTION decrement_stock(row_id UUID, qty INT)
RETURNS void AS $$
BEGIN
  UPDATE products
  SET stock_quantity = stock_quantity - qty
  WHERE id = row_id;
END;
$$ LANGUAGE plpgsql;
