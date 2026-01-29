import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { LogIn, User, Lock, Loader2, ChefHat, UtensilsCrossed, AlertCircle } from 'lucide-react';

// Simple hash function matching the SQL hash
async function hashPassword(password: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(password + 'smartbar_salt_2026');
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export default function StaffLogin() {
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [debugInfo, setDebugInfo] = useState('');

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setDebugInfo('');

        try {
            // 1. Hash the password
            const passwordHash = await hashPassword(password);
            console.log('Hash gerado:', passwordHash);
            setDebugInfo(`Hash: ${passwordHash.substring(0, 20)}...`);

            // 2. Get all active users with this username
            const { data, error: queryError } = await supabase
                .from('staff_users')
                .select('id, username, password_hash, display_name, role, active')
                .eq('username', username.toLowerCase().trim())
                .eq('active', true);

            console.log('Query result:', { data, queryError });

            if (queryError) {
                console.error('Query error:', queryError);
                setDebugInfo(`Erro DB: ${queryError.message}`);
                throw new Error(`Erro ao consultar: ${queryError.message}`);
            }

            if (!data || data.length === 0) {
                setDebugInfo('Usuário não encontrado');
                throw new Error('Usuário não encontrado');
            }

            const user = data[0];
            console.log('User found:', user.username, 'Expected hash:', user.password_hash);
            console.log('Provided hash:', passwordHash);

            // 3. Verify password hash
            if (user.password_hash !== passwordHash) {
                setDebugInfo(`Hash não confere. DB: ${user.password_hash.substring(0, 20)}...`);
                throw new Error('Senha incorreta');
            }

            // 4. Update last_login
            try {
                await supabase
                    .from('staff_users')
                    .update({ last_login: new Date().toISOString() })
                    .eq('id', user.id);
            } catch (updateErr) {
                console.warn('Could not update last_login:', updateErr);
            }

            // 5. Store staff session in localStorage
            const staffSession = {
                id: user.id,
                username: user.username,
                displayName: user.display_name,
                role: user.role,
                loginTime: new Date().toISOString()
            };
            localStorage.setItem('smartbar_staff_session', JSON.stringify(staffSession));

            // 6. Redirect based on role - use window.location to force App reload
            console.log('Login successful! Role:', user.role);
            if (user.role === 'kitchen') {
                window.location.href = '/kitchen';
            } else {
                window.location.href = '/pos';
            }

        } catch (err: any) {
            console.error('Login error:', err);
            setError(err.message || 'Erro ao fazer login');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#020617] flex items-center justify-center p-4 relative overflow-hidden font-sans">
            {/* Background elements */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-orange-500/20 rounded-full blur-[120px] animate-pulse" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[120px]" />

            <div className="glass-card w-full max-w-md p-10 border-white/10 shadow-3xl relative z-10 animate-in fade-in zoom-in duration-500">
                {/* Header */}
                <div className="text-center mb-10">
                    <div className="w-20 h-20 mx-auto bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center mb-6 shadow-2xl shadow-orange-500/30">
                        <UtensilsCrossed className="w-10 h-10 text-white" />
                    </div>
                    <h1 className="text-3xl font-black text-white tracking-tighter mb-1 italic">
                        Acesso Funcionário
                    </h1>
                    <p className="text-muted text-xs font-medium uppercase tracking-[0.2em]">Sistema SmartBar</p>
                </div>

                {/* Error */}
                {error && (
                    <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-2xl flex items-center gap-3 animate-in slide-in-from-top">
                        <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
                        <div>
                            <p className="text-red-400 text-sm font-medium">{error}</p>
                            {debugInfo && <p className="text-red-400/60 text-xs mt-1">{debugInfo}</p>}
                        </div>
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleLogin} className="space-y-6">
                    <div className="space-y-4">
                        <div className="space-y-1.5 px-1">
                            <label className="text-[10px] font-black uppercase tracking-widest text-muted">Usuário</label>
                            <div className="relative">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted/50" />
                                <input
                                    type="text"
                                    required
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    placeholder="garcom ou cozinha"
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-6 text-white outline-none focus:border-orange-500/50 focus:ring-4 focus:ring-orange-500/10 transition-all font-medium"
                                    autoComplete="username"
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5 px-1">
                            <label className="text-[10px] font-black uppercase tracking-widest text-muted">Senha</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted/50" />
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="1234"
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-6 text-white outline-none focus:border-orange-500/50 focus:ring-4 focus:ring-orange-500/10 transition-all font-medium"
                                    autoComplete="current-password"
                                />
                            </div>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-orange-500 to-red-500 py-4 rounded-2xl font-black text-lg flex items-center justify-center gap-3 shadow-2xl shadow-orange-500/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 text-white"
                    >
                        {loading ? (
                            <Loader2 className="w-6 h-6 animate-spin" />
                        ) : (
                            <>
                                Entrar
                                <LogIn className="w-5 h-5" />
                            </>
                        )}
                    </button>
                </form>

                {/* Test credentials hint */}
                <div className="mt-6 p-4 bg-green-500/10 border border-green-500/30 rounded-2xl">
                    <p className="text-green-400 text-xs font-bold mb-2">📌 Credenciais de Teste:</p>
                    <div className="grid grid-cols-2 gap-2 text-xs text-green-300">
                        <div>Garçom: <code className="bg-black/30 px-1 rounded">garcom / 1234</code></div>
                        <div>Cozinha: <code className="bg-black/30 px-1 rounded">cozinha / 1234</code></div>
                    </div>
                </div>

                {/* Footer */}
                <div className="mt-8 pt-6 border-t border-white/5 text-center">
                    <a
                        href="/login"
                        className="text-[10px] text-muted uppercase font-black tracking-widest hover:text-white transition-colors"
                    >
                        Administrador? <span className="text-orange-400 underline">Acesse aqui</span>
                    </a>
                </div>

                {/* Role indicators */}
                <div className="mt-6 flex justify-center gap-4 opacity-50">
                    <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-blue-400">
                        <User className="w-3 h-3" />
                        Garçom
                    </div>
                    <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-orange-400">
                        <ChefHat className="w-3 h-3" />
                        Cozinha
                    </div>
                </div>
            </div>

            <div className="absolute bottom-10 text-center w-full">
                <p className="text-[10px] text-muted font-black tracking-[0.3em] uppercase opacity-20">© 2026 SMARTBAR</p>
            </div>
        </div>
    );
}
