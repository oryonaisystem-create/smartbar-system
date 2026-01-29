import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://xlyjdtxbeqbvmrebjqkh.supabase.co';
const supabaseKey = 'sb_publishable_4knnokMAQCIR75UOfydZiA_Xy4yFCkN';

const supabase = createClient(supabaseUrl, supabaseKey);

async function inspect() {
    console.log("--- PRODUCTS ---");
    const { data: products } = await supabase.from('products').select('*');
    console.log(JSON.stringify(products, null, 2));

    console.log("\n--- TRANSACTIONS ---");
    const { data: transactions } = await supabase.from('transactions').select('*');
    console.log(JSON.stringify(transactions, null, 2));

    console.log("\n--- TIME CHECK ---");
    console.log("Current Server Time (Node):", new Date().toISOString());
}

inspect();
