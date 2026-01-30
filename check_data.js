
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing env vars');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkData() {
    console.log('Checking Transactions...');
    const { data: transactions, error } = await supabase
        .from('transactions')
        .select('*')
        .limit(5);

    if (error) {
        console.error('Error fetching transactions:', error);
    } else {
        console.log(`Found ${transactions.length} transactions.`);
        if (transactions.length > 0) {
            console.log('Sample:', transactions[0]);
        } else {
            console.log('Table is empty.');
        }
    }
}

checkData();
