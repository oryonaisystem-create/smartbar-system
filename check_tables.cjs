const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    'https://xlyjdtxbeqbvmrebjqkh.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhseWpkdHhiZXFidm1yZWJqcWtoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk1NDU0NTksImV4cCI6MjA4NTEyMTQ1OX0.aE_0SIYJR9btYVsjgAhOPZpVK0K9QgEWzjCPqvlppRw'
);

async function listTables() {
    console.log('🔍 Checking all tables in Supabase...\n');

    // Check tables by attempting to query common ones
    const tables = ['products', 'transactions', 'transaction_items', 'profiles', 'shifts', 'categories', 'cashier_sessions'];

    for (const table of tables) {
        const { data, error, count } = await supabase
            .from(table)
            .select('*', { count: 'exact', head: true });

        if (error) {
            console.log(`❌ ${table}: ERROR - ${error.message}`);
        } else {
            console.log(`✅ ${table}: ${count ?? 'exists'} rows`);
        }
    }

    // Also check products with full data
    console.log('\n📦 Full products query:');
    const { data: prods, error: prodErr } = await supabase.from('products').select('*');
    if (prodErr) {
        console.log('Error:', prodErr);
    } else {
        // console.log('Products data:', JSON.stringify(prods, null, 2));
        console.log('Products data loaded (count: ' + prods.length + ')');
    }
}

listTables().catch(console.error);
