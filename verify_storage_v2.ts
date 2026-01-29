
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

// Manual env parsing since we are in a raw script
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

async function checkStorage() {
    console.log("Checking Supabase Storage buckets...");
    const { data, error } = await supabase.storage.listBuckets();
    if (error) {
        console.error("❌ Error listing buckets:", error.message);
        console.error("Details:", error);
    } else {
        console.log("Buckets found:", data.map(b => b.name));
        const productsBucket = data.find(b => b.name === 'products');
        if (productsBucket) {
            console.log("✅ 'products' bucket exists!");
        } else {
            console.log("❌ 'products' bucket MISSING!");
            console.log("👉 Please create a public bucket named 'products' in your Supabase dashboard.");
        }
    }
}

checkStorage();
