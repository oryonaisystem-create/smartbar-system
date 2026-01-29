import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load .env
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing environment variables VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
    console.log('🔍 Testing Supabase connection...');
    console.log('URL:', supabaseUrl);

    const start = Date.now();
    try {
        const { data, error } = await supabase.from('profiles').select('count', { count: 'exact', head: true });

        const duration = Date.now() - start;

        if (error) {
            console.error('❌ Connection error:', error.message);
            console.error('Error details:', error);
            if (error.message.includes('503') || error.message.includes('FetchError')) {
                console.error('\n💡 HINT: The project might be PAUSED or the URL is incorrect.');
            }
        } else {
            console.log(`✅ Connection successful! (${duration}ms)`);
            console.log('Data:', data);
        }
    } catch (err) {
        console.error('💥 Unexpected exception:', err);
    }
}

testConnection();
