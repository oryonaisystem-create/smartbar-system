const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Basic .env parser
function loadEnv() {
    const envPath = path.resolve(__dirname, '.env');
    if (!fs.existsSync(envPath)) return {};
    const content = fs.readFileSync(envPath, 'utf8');
    const env = {};
    content.split('\n').forEach(line => {
        const [key, value] = line.split('=');
        if (key && value) env[key.trim()] = value.trim();
    });
    return env;
}

const env = loadEnv();
const supabaseUrl = env.VITE_SUPABASE_URL;
const supabaseKey = env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing environment variables in .env');
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
            if (error.status === 503 || error.message.includes('FetchError')) {
                console.error('\n💡 HINT: The project might be PAUSED or the URL is incorrect.');
            }
        } else {
            console.log(`✅ Connection successful! (${duration}ms)`);
        }
    } catch (err) {
        console.error('💥 Unexpected exception:', err.message);
    }
}

testConnection();
