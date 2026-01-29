
import { createClient } from '@supabase/supabase-js';

// Credentials directly from your .env
const supabaseUrl = 'https://xlyjdtxbeqbvmrebjqkh.supabase.co';
const supabaseKey = 'sb_publishable_4knnokMAQCIR75UOfydZiA_Xy4yFCkN';

console.log("🚀 Iniciando Teste de Conexão (Browser-Simulated)...");

const supabase = createClient(supabaseUrl, supabaseKey);

(async () => {
    try {
        const start = Date.now();
        console.log("1. Tentando conectar com o banco...");

        const { data, error } = await supabase.from('products').select('*').limit(1);

        const end = Date.now();
        console.log(`⏱️ Tempo de resposta: ${(end - start) / 1000}s`);

        if (error) {
            console.error("❌ Erro de conexão:", error.message);
        } else {
            console.log("✅ Conexão BEM SUCEDIDA!");
            console.log(`📦 Produtos encontrados: ${data?.length}`);
        }
    } catch (e) {
        console.error("❌ Erro critico:", e);
    }
})();
