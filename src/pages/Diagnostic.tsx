
import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Activity, Wifi, ShieldCheck, Database, Server, Globe } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Diagnostic = () => {
    const { session, user, role, status } = useAuth();
    const [logs, setLogs] = useState<string[]>([]);
    const [health, setHealth] = useState({
        network: 'pending',
        auth: 'pending',
        realtime: 'pending',
        database: 'pending'
    });

    const addLog = (msg: string) => setLogs(prev => [...prev, `${new Date().toLocaleTimeString()} - ${msg}`]);

    const runTest = async () => {
        setLogs([]);
        setHealth({ network: 'pending', auth: 'pending', realtime: 'pending', database: 'pending' });
        addLog('🚀 Iniciando Diagnóstico Enterprise V2...');

        // 1. NETWORK HEALTH
        try {
            addLog('📡 [Network] Verificando conectividade...');
            const start = Date.now();
            const res = await fetch(import.meta.env.VITE_SUPABASE_URL, { method: 'HEAD' });
            const latency = Date.now() - start;
            addLog(`✅ [Network] OK (Latência: ${latency}ms)`);
            setHealth(prev => ({ ...prev, network: 'ok' }));
        } catch (e: any) {
            addLog(`❌ [Network] FALHA: ${e.message}`);
            setHealth(prev => ({ ...prev, network: 'error' }));
        }

        // 2. AUTH HEALTH
        try {
            addLog('🛡️ [Auth] Checando Sessão...');
            if (status === 'authenticated') {
                addLog(`✅ [Auth] Autenticado como: ${role}`);
                addLog(`ℹ️ [Auth] User ID: ${user?.id}`);
                setHealth(prev => ({ ...prev, auth: 'ok' }));
            } else {
                addLog(`⚠️ [Auth] Status: ${status} (Não autenticado)`);
                setHealth(prev => ({ ...prev, auth: 'warning' }));
            }
        } catch (e) {
            setHealth(prev => ({ ...prev, auth: 'error' }));
        }

        // 3. DATABASE HEALTH
        try {
            addLog('💾 [DB] Testando Leitura...');
            const { data, error, count } = await supabase
                .from('profiles')
                .select('*', { count: 'exact', head: true });

            if (error) throw error;
            addLog(`✅ [DB] Conectado (Registros: ${count})`);
            setHealth(prev => ({ ...prev, database: 'ok' }));
        } catch (e: any) {
            addLog(`❌ [DB] Erro de Leitura: ${e.message}`);
            setHealth(prev => ({ ...prev, database: 'error' }));
        }

        // 4. REALTIME HEALTH
        try {
            addLog('⚡ [Realtime] Iniciando Teste de Inscrição...');
            const channel = supabase.channel('diag_test_' + Date.now());

            channel
                .subscribe((status) => {
                    if (status === 'SUBSCRIBED') {
                        addLog('✅ [Realtime] Inscrito com Sucesso!');
                        setHealth(prev => ({ ...prev, realtime: 'ok' }));
                        supabase.removeChannel(channel);
                    } else if (status === 'CHANNEL_ERROR') {
                        addLog('❌ [Realtime] Erro no Canal.');
                        setHealth(prev => ({ ...prev, realtime: 'error' }));
                    } else if (status === 'TIMED_OUT') {
                        addLog('❌ [Realtime] Timeout.');
                        setHealth(prev => ({ ...prev, realtime: 'error' }));
                    }
                });

        } catch (e: any) {
            addLog(`❌ [Realtime] Falha Inicial: ${e.message}`);
            setHealth(prev => ({ ...prev, realtime: 'error' }));
        }
    };

    return (
        <div className="p-8 bg-[#020617] min-h-screen text-green-500 font-mono safe-area">
            <div className="max-w-4xl mx-auto space-y-8">
                <div className="flex items-center justify-between border-b border-green-500/30 pb-4">
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-1">SYSTEM DIAGNOSTICS</h1>
                        <p className="text-green-500/60 text-xs uppercase tracking-[0.3em]">SmartBar Enterprise Telemetry</p>
                    </div>
                    <div className="text-right">
                        <p className="text-white font-bold">{new Date().toLocaleDateString()}</p>
                        <p className="text-xs text-green-500">{new Date().toLocaleTimeString()}</p>
                    </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <StatusCard icon={Wifi} label="Network" status={health.network} />
                    <StatusCard icon={ShieldCheck} label="Auth" status={health.auth} />
                    <StatusCard icon={Database} label="Database" status={health.database} />
                    <StatusCard icon={Activity} label="Realtime" status={health.realtime} />
                </div>

                <div className="flex gap-4">
                    <button
                        onClick={runTest}
                        className="bg-green-600 hover:bg-green-500 text-black px-8 py-3 rounded-lg font-black uppercase tracking-widest transition-all hover:scale-105 active:scale-95"
                    >
                        Executar Scan Completo
                    </button>
                    <button
                        onClick={() => {
                            localStorage.clear();
                            window.location.reload();
                        }}
                        className="bg-red-900/20 border border-red-500/50 text-red-400 px-8 py-3 rounded-lg font-bold uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all"
                    >
                        Hard Reset
                    </button>
                    <a href="/" className="px-8 py-3 text-muted hover:text-white font-bold uppercase">Voltar</a>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Live Logs */}
                    <div>
                        <h3 className="text-xl font-bold text-white mb-4">Diagnostics Logs</h3>
                        <div className="bg-black/50 p-6 rounded-xl border border-green-500/20 min-h-[400px] font-mono text-sm shadow-inner shadow-black/50 overflow-auto max-h-[500px]">
                            {logs.length === 0 && <p className="text-green-500/30 italic text-center mt-20">Aguardando inicialização de testes...</p>}
                            {logs.map((log, i) => (
                                <div key={i} className="mb-2 border-b border-green-500/10 pb-1 last:border-0 hover:bg-green-500/5 px-2 rounded">
                                    {log}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Telemetry History */}
                    <div>
                        <h3 className="text-xl font-bold text-white mb-4">Telemetry Events (DB)</h3>
                        <TelemetryHistory />
                    </div>
                </div>
            </div>
        </div>
    );
};

const StatusCard = ({ icon: Icon, label, status }: any) => {
    const colors = {
        pending: 'text-slate-500 border-slate-500/30 bg-slate-500/5',
        ok: 'text-green-400 border-green-500/50 bg-green-500/10',
        warning: 'text-yellow-400 border-yellow-500/50 bg-yellow-500/10',
        error: 'text-red-400 border-red-500/50 bg-red-500/10'
    };

    // @ts-ignore
    const colorClass = colors[status] || colors.pending;

    return (
        <div className={`p-4 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all ${colorClass}`}>
            <Icon className="w-8 h-8" />
            <span className="text-xs font-black uppercase tracking-widest">{label}</span>
            <span className="text-[10px] opacity-70 uppercase">{status}</span>
        </div>
    );
};

const TelemetryHistory = () => {
    const [events, setEvents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchHistory();
    }, []);

    const fetchHistory = async () => {
        const { data } = await supabase
            .from('telemetry_events')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(50);

        if (data) setEvents(data);
        setLoading(false);
    };

    if (loading) return <div className="text-center p-10 text-muted animate-pulse">Carregando histórico...</div>;

    return (
        <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden max-h-[500px] overflow-y-auto">
            {events.length === 0 && <div className="p-10 text-center text-muted">Sem eventos registrados</div>}
            {events.map(ev => (
                <div key={ev.id} className="p-3 border-b border-white/5 last:border-0 hover:bg-white/5 text-xs font-mono">
                    <div className="flex justify-between mb-1">
                        <span className={`font-bold ${ev.severity === 'error' || ev.severity === 'critical' ? 'text-red-400' :
                            ev.severity === 'warning' ? 'text-yellow-400' : 'text-blue-400'
                            }`}>[{ev.severity.toUpperCase()}] {ev.event_type}</span>
                        <span className="text-muted">{new Date(ev.created_at).toLocaleTimeString()}</span>
                    </div>
                    {ev.context?.message && <div className="text-white/80 mb-1">{ev.context.message}</div>}
                    <div className="text-white/30 truncate">{JSON.stringify(ev.context || {})}</div>
                </div>
            ))}
        </div>
    );
};

export default Diagnostic;
