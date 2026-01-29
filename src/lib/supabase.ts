import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

console.log('🔌 [Supabase] Inicializando Cliente...');
console.log('🔗 [Supabase] URL:', supabaseUrl ? 'OK' : 'FALTANDO');
console.log('🔑 [Supabase] Key:', supabaseAnonKey ? 'OK' : 'FALTANDO');

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ [Supabase] Credenciais ausentes!');
}

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '', {
    auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
    },
    realtime: {
        params: {
            eventsPerSecond: 10
        }
    }
});

console.log('✅ [Supabase] Cliente instanciado.');
