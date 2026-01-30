
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function verifyReports() {
    console.log('--- Simulating Reports Page Logic ---');

    // 1. Fetch Sales for Ticket Medio
    const { data: transactions, error } = await supabase
        .from('transactions')
        .select('total_amount, type, cashier_session_id')
        .eq('type', 'sale');

    if (error) {
        console.error('Error fetching transactions:', error);
        return;
    }

    const count = transactions.length;
    const total = transactions.reduce((sum, t) => sum + (t.total_amount || 0), 0);
    const avg = count > 0 ? total / count : 0;

    console.log(`[Ticket Médio] Count: ${count}, Total: R$ ${total.toFixed(2)}, Avg: R$ ${avg.toFixed(2)}`);

    // 2. Check for Orphan Transactions (Null Session)
    const orphans = transactions.filter(t => !t.cashier_session_id).length;
    console.log(`[Sessions] Transactions without Cashier Session: ${orphans} / ${count}`);

    // 3. Fetch Products for Margin
    const { data: products } = await supabase
        .from('products')
        .select('price, cost_price, name')
        .limit(10);

    if (products && products.length > 0) {
        console.log(`[Products] Checked ${products.length} products for margin calculation.`);
        // Just showing first one as sample
        const p = products[0];
        console.log(`Sample Product: ${p.name} - Price: ${p.price}, Cost: ${p.cost_price}`);
    } else {
        console.log('[Products] No products found.');
    }
}

verifyReports();
