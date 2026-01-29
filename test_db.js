import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://xlyjdtxbeqbvmrebjqkh.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhseWpkdHhiZXFidm1yZWJqcWtoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk1NDU0NTksImV4cCI6MjA4NTEyMTQ1OX0.aE_0SIYJR9btYVsjgAhOPZpVK0K9QgEWzjCPqvlppRw';

const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
    console.log("🔍 Checking tables...");

    const { data: products, error: pErr } = await supabase.from('products').select('count');
    if (pErr) console.error("❌ products:", pErr.message);
    else console.log("✅ products exists. Count:", products);

    const { data: tx, error: tErr } = await supabase.from('transactions').select('count');
    if (tErr) console.error("❌ transactions:", tErr.message);
    else console.log("✅ transactions exists. Count:", tx);

    const { data: ti, error: iErr } = await supabase.from('transaction_items').select('count');
    if (iErr) console.error("❌ transaction_items:", iErr.message);
    else console.log("✅ transaction_items exists. Count:", ti);

    console.log("\n🔍 Checking auth...");
    const { data: profiles, error: prErr } = await supabase.from('profiles').select('count');
    if (prErr) console.error("❌ profiles:", prErr.message);
    else console.log("✅ profiles exists. Count:", profiles);
}

test();
