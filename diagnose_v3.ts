
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// 1. Manually parse .env using process.cwd()
const envPath = path.join(process.cwd(), '.env');
let supabaseUrl = '';
let supabaseKey = '';

if (fs.existsSync(envPath)) {
    console.log("📄 Found .env file, parsing...");
    const content = fs.readFileSync(envPath, 'utf-8');
    content.split('\n').forEach(line => {
        const [key, value] = line.split('=');
        if (key && value) {
            const cleanKey = key.trim();
            const cleanValue = value.trim();
            if (cleanKey === 'VITE_SUPABASE_URL') supabaseUrl = cleanValue;
            if (cleanKey === 'VITE_SUPABASE_ANON_KEY') supabaseKey = cleanValue;
        }
    });
}

if (!supabaseUrl || !supabaseKey) {
    console.log("❌ Missing Credentials in .env");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function diagnose() {
    console.log("🔍 Diagnosing Connection (V3)...");

    // 1. Test Select from Products
    console.log("👉 Fetching Products...");
    const { data: products, error: prodError } = await supabase.from('products').select('*').limit(1);

    if (prodError) {
        console.error("❌ Error fetching products:", prodError.message);
    } else {
        console.log(`✅ Products Table Accessed. Count: ${products?.length}`);
    }

    // 2. Test Storage Bucket
    console.log("👉 Listing Buckets...");
    const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();

    if (bucketError) {
        console.error("❌ Error listing buckets:", bucketError.message);
    } else {
        const prod = buckets.find(b => b.name === 'products');
        if (prod) {
            console.log("✅ 'products' bucket FOUND!");
        } else {
            console.log("❌ 'products' bucket MISSING. List:", buckets.map(b => b.name));
        }
    }
}

diagnose();
