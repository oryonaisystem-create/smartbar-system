
import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export const Diagnostic = () => {
    const [logs, setLogs] = useState<string[]>([]);

    const addLog = (msg: string) => setLogs(prev => [...prev, `${new Date().toLocaleTimeString()} - ${msg}`]);

    const runTest = async () => {
        setLogs([]);
        addLog('🚀 Iniciando Diagnóstico de Rede...');

        // 1. Check URL
        const url = import.meta.env.VITE_SUPABASE_URL;
        const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
        addLog(`Config URL: ${url}`);
        addLog(`Config Key (First 10): ${key?.substring(0, 10)}...`);

        if (!url) {
            addLog('❌ ERRO: URL não encontrada nas variáveis de ambiente!');
            return;
        }

        // 2. Test Raw Fetch (Bypass Supabase Client)
        try {
            addLog('📡 Testando Raw Fetch (ping)...');
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 10000);

            const res = await fetch(`${url}/rest/v1/`, {
                method: 'GET',
                signal: controller.signal,
                headers: {
                    'apikey': key,
                    'Authorization': `Bearer ${key}`
                }
            });
            clearTimeout(timeoutId);
            addLog(`Raw Fetch Status: ${res.status} ${res.statusText}`);
            if (res.ok) {
                addLog('✅ Raw Fetch SUCESSO! A rede está ok.');
            } else {
                addLog('⚠️ Raw Fetch retornou erro. Verifique CORS ou Key.');
            }
        } catch (e: any) {
            const errorMsg = e.name === 'AbortError' ? 'Timeout excedido (10s)' : e.message;
            addLog(`❌ Raw Fetch FALHOU: ${errorMsg}`);
            addLog('Isso indica bloqueio de rede (AdBlock, Firewall, DNS).');
        }

        // 3. Test Supabase Client
        try {
            addLog('📚 Testando Client Library (profiles)...');
            const { data, error } = await supabase.from('profiles').select('count', { count: 'exact', head: true });
            if (error) throw error;
            addLog('✅ Client Library SUCESSO!');
        } catch (e: any) {
            addLog(`❌ Client Library FALHOU: ${e.message}`);
        }

        // 4. Test General Internet
        try {
            addLog('🌐 Testando Internet Geral (google)...');
            const res = await fetch('https://www.google.com', { mode: 'no-cors' });
            addLog('✅ Internet Geral OK.');
        } catch (e: any) {
            addLog('❌ Internet Geral FALHOU. Você pode estar sem conexão ou com firewall agressivo.');
        }

        addLog('🏁 Diagnóstico Completo.');
    };

    return (
        <div className="p-8 bg-black min-h-screen text-green-500 font-mono">
            <h1 className="text-3xl font-bold text-white mb-2 underline">SYS_DIAGNOSTIC_V1</h1>
            <p className="mb-6 text-slate-400">Teste de conectividade com a infraestrutura Supabase.</p>
            <div className="flex gap-4">
                <button
                    onClick={runTest}
                    className="bg-green-600 hover:bg-green-500 text-black px-6 py-2 rounded mb-6 font-bold uppercase tracking-widest"
                >
                    Executar Scan
                </button>
                <button
                    onClick={() => {
                        localStorage.clear();
                        sessionStorage.clear();
                        window.location.reload();
                    }}
                    className="bg-red-600 hover:bg-red-500 text-white px-6 py-2 rounded mb-6 font-bold uppercase tracking-widest"
                >
                    Resetar Cache
                </button>
            </div>
            <div className="bg-black/50 p-4 rounded border border-slate-700 min-h-[300px]">
                {logs.map((log, i) => (
                    <div key={i} className="mb-1 border-b border-white/5 pb-1 last:border-0">
                        {log}
                    </div>
                ))}
            </div>
        </div>
    );
};
