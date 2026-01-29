
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

async function testUpload() {
    console.log("🚀 Testing Direct Upload...");

    // Create a dummy file buffer
    const buffer = Buffer.from('test image content');
    const fileName = `test_${Date.now()}.txt`;

    console.log(`Trying to upload ${fileName} to 'products'...`);

    const { data, error } = await supabase.storage
        .from('products')
        .upload(fileName, buffer, {
            contentType: 'text/plain',
            upsert: true
        });

    if (error) {
        console.error("❌ Upload Failed!");
        console.error("Message:", error.message);
        console.error("Error Object:", error);
    } else {
        console.log("✅ Upload SUCCESS!");
        console.log("Path:", data.path);

        // Clean up
        await supabase.storage.from('products').remove([fileName]);
        console.log("🗑️ Cleaned up test file.");
    }
}

testUpload();
