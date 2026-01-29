
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// 1. Manually parse .env
const envPath = path.join(process.cwd(), '.env');
let supabaseUrl = '';
let supabaseKey = '';

if (fs.existsSync(envPath)) {
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

const supabase = createClient(supabaseUrl, supabaseKey);

async function diagnoseExpanded() {
    console.log("🚀 Testing Valid Upload & Transactions...");

    // 1. Test Transactions (Dashboard Issue)
    console.log("\n1️⃣ Fetching Transactions...");
    const { data: tx, error: txError } = await supabase
        .from('transactions')
        .select('*')
        .limit(3);

    if (txError) {
        console.error("❌ Transactions Fetch Failed:", txError.message);
    } else {
        console.log(`✅ Transactions Accessed. Count: ${tx?.length}`);
    }

    // 2. Test Image Upload
    console.log("\n2️⃣ Uploading Valid PNG...");
    // 1x1 Transparent PNG pixel
    const pngBuffer = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=', 'base64');
    const fileName = `test_pixel_${Date.now()}.png`;

    const { data, error } = await supabase.storage
        .from('products')
        .upload(fileName, pngBuffer, {
            contentType: 'image/png',
            upsert: true
        });

    if (error) {
        console.error("❌ Upload Failed!");
        console.error("Message:", error.message);
        // Check for RLS
        if (error.message.includes('policy')) console.log("💡 Hint: RLS Policy might be blocking Anon users (which this script is).");
    } else {
        console.log("✅ Upload SUCCESS!");
        console.log("Path:", data.path);

        // Clean up
        await supabase.storage.from('products').remove([fileName]);
        console.log("🗑️ Cleaned up test file.");
    }
}

diagnoseExpanded();
