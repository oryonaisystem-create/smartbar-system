-- Create function to get report metrics safely
CREATE OR REPLACE FUNCTION get_daily_metrics()
RETURNS json
LANGUAGE plpgsql
AS $$
DECLARE
    total_sales numeric;
    ticket_medio numeric;
    result json;
BEGIN
    SELECT COALESCE(SUM(total_amount), 0), COALESCE(AVG(total_amount), 0)
    INTO total_sales, ticket_medio
    FROM transactions
    WHERE type = 'sale' AND created_at >= CURRENT_DATE;

    result := json_build_object(
        'total_sales', total_sales,
        'ticket_medio', ticket_medio
    );

    RETURN result;
END;
$$;
