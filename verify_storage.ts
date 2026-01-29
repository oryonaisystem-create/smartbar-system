
import { supabase } from './src/lib/supabase';

async function checkStorage() {
    console.log("Checking Supabase Storage buckets...");
    const { data, error } = await supabase.storage.listBuckets();
    if (error) {
        console.error("Error listing buckets:", error);
    } else {
        console.log("Buckets found:", data);
        const productsBucket = data.find(b => b.name === 'products');
        if (productsBucket) {
            console.log("✅ 'products' bucket exists!");
        } else {
            console.log("❌ 'products' bucket MISSING!");
        }
    }
}

checkStorage();
