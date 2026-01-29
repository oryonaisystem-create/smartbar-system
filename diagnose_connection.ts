
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

// Load env
const envPath = path.resolve(__dirname, '.env');
if (fs.existsSync(envPath)) {
    const envConfig = dotenv.parse(fs.readFileSync(envPath));
    for (const k in envConfig) {
        process.env[k] = envConfig[k];
    }
}

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseKey) {
    console.error("❌ Missing Supabase credentials in .env");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function diagnose() {
    console.log("🔍 Diagnosing Supabase Connection...");
    console.log(`URL: ${supabaseUrl}`);

    // 1. Check Table Access (Products)
    console.log("\n1️⃣ Checking 'products' table...");
    const { data: products, error: prodError } = await supabase
        .from('products')
        .select('*')
        .limit(3);

    if (prodError) {
        console.error("❌ Failed to fetch products:", prodError.message);
    } else {
        console.log(`✅ Products fetched: ${products.length} items found.`);
    }

    // 2. Check Table Access (Transactions)
    console.log("\n2️⃣ Checking 'transactions' table...");
    const { data: transactions, error: txError } = await supabase
        .from('transactions')
        .select('*')
        .limit(3);

    if (txError) {
        console.error("❌ Failed to fetch transactions:", txError.message);
    } else {
        console.log(`✅ Transactions fetched: ${transactions.length} items found.`);
    }

    // 3. Check Storage Bucket
    console.log("\n3️⃣ Checking 'products' Storage Bucket...");
    const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();

    if (bucketError) {
        console.error("❌ Failed to list buckets:", bucketError.message);
    } else {
        const prodBucket = buckets.find(b => b.name === 'products');
        if (prodBucket) {
            console.log("✅ 'products' bucket FOUND!");
            console.log("   Public:", prodBucket.public);
        } else {
            console.log("❌ 'products' bucket NOT FOUND in list:", buckets.map(b => b.name));
        }
    }
}

diagnose();
