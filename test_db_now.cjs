const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    'https://xlyjdtxbeqbvmrebjqkh.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhseWpkdHhiZXFidm1yZWJqcWtoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk1NDU0NTksImV4cCI6MjA4NTEyMTQ1OX0.aE_0SIYJR9btYVsjgAhOPZpVK0K9QgEWzjCPqvlppRw'
);

async function testDB() {
    console.log('🔍 Testing Supabase connection...\n');

    // Test 1: All transactions
    const { data: allTx, error: txErr } = await supabase
        .from('transactions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

    console.log('📊 ALL TRANSACTIONS:');
    if (txErr) {
        console.log('❌ Error:', txErr.message);
    } else {
        console.log(`Found ${allTx?.length || 0} transactions`);
        if (allTx?.length > 0) {
            allTx.forEach(t => {
                console.log(`  - ID: ${t.id}, Type: ${t.type}, Total: ${t.total_amount}, Created: ${t.created_at}`);
            });
        }
    }

    // Test 2: Dashboard query simulation
    console.log('\n📅 TODAY FILTER TEST:');
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const localTodayStr = now.toISOString();
    console.log(`Filter date: ${localTodayStr}`);

    const { data: todayTx, error: todayErr } = await supabase
        .from('transactions')
        .select('*')
        .gte('created_at', localTodayStr)
        .eq('type', 'sale');

    if (todayErr) {
        console.log('❌ Error:', todayErr.message);
    } else {
        console.log(`Found ${todayTx?.length || 0} transactions for today`);
        if (todayTx?.length > 0) {
            todayTx.forEach(t => {
                console.log(`  - Total: R$${t.total_amount}, Created: ${t.created_at}`);
            });
        }
    }

    // Test 3: Products
    console.log('\n📦 PRODUCTS:');
    const { data: products, error: prodErr } = await supabase
        .from('products')
        .select('*')
        .limit(5);

    if (prodErr) {
        console.log('❌ Error:', prodErr.message);
    } else {
        console.log(`Found ${products?.length || 0} products`);
        if (products?.length > 0) {
            products.forEach(p => {
                console.log(`  - ${p.name}: R$${p.price}, Stock: ${p.stock_quantity}`);
            });
        }
    }

    // Test 4: transaction_items
    console.log('\n🧾 TRANSACTION_ITEMS:');
    const { data: items, error: itemsErr } = await supabase
        .from('transaction_items')
        .select('*')
        .limit(5);

    if (itemsErr) {
        console.log('❌ Error:', itemsErr.message);
    } else {
        console.log(`Found ${items?.length || 0} transaction_items`);
        if (items?.length > 0) {
            items.forEach(i => {
                console.log(`  - Qty: ${i.quantity}, Price: ${i.unit_price}, TX ID: ${i.transaction_id}`);
            });
        }
    }
}

testDB().catch(console.error);
