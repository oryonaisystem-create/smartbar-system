import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://xlyjdtxbeqbvmrebjqkh.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseKey) {
    console.error("VITE_SUPABASE_ANON_KEY is missing!");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkRole() {
    console.log("Checking role for: oryonaisystem@gmail.com");
    const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', 'oryonaisystem@gmail.com')
        .single();

    if (error) console.error("Error:", error);
    else console.log("Profile Data:", profile);
}

checkRole();
