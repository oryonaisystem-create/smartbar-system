import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { LogIn, Wine, ShieldCheck, Mail, Eye, EyeOff, ArrowLeft, Loader2, UserPlus, Fingerprint } from 'lucide-react';

const Login = () => {
    const { signOut } = useAuth();
    const [loading, setLoading] = useState(false);
    const [view, setView] = useState<'initial' | 'login' | 'register'>('initial');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(true);

    const logoUrl = "https://public.readdy.ai/ai/img_res/4ced1042-ca06-43d9-9c63-861d1f714373.png";

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        if (params.get('action') === 'register') {
            setView('register');
        }

        const savedEmail = localStorage.getItem('smartbar_remember_email');
        if (savedEmail) {
            setEmail(savedEmail);
        }
    }, []);

    const handleGoogleLogin = async () => {
        setLoading(true);
        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: window.location.origin
                }
            });
            if (error) {
                if (error.message.includes("provider is not enabled")) {
                    throw new Error("O login pelo Google está desabilitado no Supabase. Use E-mail e Senha por enquanto.");
                }
                throw error;
            }
        } catch (err: any) {
            alert(err.message || 'Erro ao entrar com Google');
            setLoading(false);
        }
    };

    const handleAuthAction = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        if (rememberMe) {
            localStorage.setItem('smartbar_remember_email', email);
        } else {
            localStorage.removeItem('smartbar_remember_email');
        }

        try {
            if (view === 'login') {
                const { data, error } = await supabase.auth.signInWithPassword({ email, password });

                if (error) {
                    if (error.message === "Invalid login credentials") {
                        throw new Error("Credenciais Inválidas. Verifique e-mail e senha.");
                    }
                    throw error;
                }

                if (data.user) {
                    // ✅ PURE SAAS LOGIN (No Business Logic Here)
                    // The AuthContext listener will detect the session change.
                    // The App.tsx router will redirect based on 'session' existence.
                    console.log('✅ [Login] Success. Session established.');
                    return;
                }
            } else {
                const { error } = await supabase.auth.signUp({ email, password });
                if (error) throw error;
                alert("Cadastro realizado com sucesso! Se a confirmação de e-mail estiver ativada no seu Supabase, verifique sua caixa de entrada.");
                setView('login');
            }
        } catch (err: any) {
            alert(err.message || 'Erro na autenticação');
        } finally {
            setLoading(false);
        }
    };

    const handleForgotPassword = async () => {
        if (!email) {
            alert("Insira seu e-mail primeiro para recuperar a senha.");
            return;
        }
        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email);
            if (error) throw error;
            alert("E-mail de recuperação enviado!");
        } catch (err: any) {
            alert(err.message || "Erro ao solicitar recuperação");
        }
    };

    return (
        <div className="min-h-screen bg-[#020617] flex items-center justify-center p-4 relative overflow-hidden font-sans">
            {/* Background elements */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[120px] animate-pulse" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[120px]" />

            <div className="glass-card w-full max-w-md p-6 border-white/10 shadow-3xl relative z-10 animate-in fade-in zoom-in duration-500 max-h-[95vh] overflow-y-auto custom-scrollbar">
                <div className="absolute top-4 left-4">
                    <a href="/" className="text-muted hover:text-white transition-colors flex items-center gap-1 text-xs uppercase font-bold tracking-widest">
                        <ArrowLeft className="w-3 h-3" /> Voltar
                    </a>
                </div>

                <div className="flex justify-center mb-6 relative mt-4">
                    {view !== 'initial' && (
                        <button
                            onClick={() => setView('initial')}
                            className="absolute left-0 top-1/2 -translate-y-1/2 p-2 hover:bg-white/5 rounded-full transition-colors text-muted hover:text-white"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                    )}
                    <img src={logoUrl} alt="Logo" className="h-10 w-auto animate-bounce-subtle" />
                </div>

                <div className="text-center mb-6">
                    <h1 className="text-2xl font-black text-white tracking-tighter mb-1 italic">
                        {view === 'initial' ? 'Bem-vindo ao SmartBar' : view === 'login' ? 'Entrar' : 'Criar Conta'}
                    </h1>
                    <p className="text-muted text-[10px] font-medium uppercase tracking-[0.2em]">SISTEMA DE INTELIGÊNCIA</p>
                </div>

                {view === 'initial' ? (
                    <div className="space-y-3">
                        <button
                            onClick={handleGoogleLogin}
                            disabled={loading}
                            className="w-full flex items-center justify-center gap-4 bg-white text-black p-4 rounded-2xl font-black text-lg transition-all hover:scale-[1.02] hover:shadow-xl shadow-white/5 active:scale-95 disabled:opacity-50"
                        >
                            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-6 h-6" alt="Google" />
                            Entrar com Google
                        </button>

                        <div className="relative py-4">
                            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/5"></div></div>
                            <div className="relative flex justify-center text-[10px]"><span className="px-3 bg-[#0f172a] text-muted font-black uppercase tracking-widest">OU</span></div>
                        </div>

                        <button
                            onClick={() => setView('login')}
                            className="w-full flex items-center justify-center gap-4 bg-white/5 border border-white/10 text-white p-4 rounded-2xl font-black text-lg transition-all hover:bg-white/10 hover:scale-[1.02] active:scale-95"
                        >
                            <Mail className="w-6 h-6 text-primary" />
                            Acessar com E-mail
                        </button>

                        <button
                            onClick={() => setView('register')}
                            className="w-full text-[10px] text-muted uppercase font-black tracking-widest mt-8 hover:text-white transition-colors"
                        >
                            Não tem uma conta? <span className="text-primary underline">Cadastre-se</span>
                        </button>
                    </div>
                ) : (
                    <form onSubmit={handleAuthAction} className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                        <div className="space-y-4">
                            <div className="space-y-1.5 px-1">
                                <label className="text-[10px] font-black uppercase tracking-widest text-muted">E-mail</label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted/50" />
                                    <input
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="seu@email.com"
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-6 text-white outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all font-medium"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5 px-1">
                                <label className="text-[10px] font-black uppercase tracking-widest text-muted">Senha</label>
                                <div className="relative">
                                    <LogIn className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted/50" />
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="••••••••"
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-12 text-white outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all font-medium"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-muted/50 hover:text-white transition-colors"
                                    >
                                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {view === 'login' && (
                            <div className="flex items-center justify-between px-1">
                                <label className="flex items-center gap-2 cursor-pointer group">
                                    <input
                                        type="checkbox"
                                        checked={rememberMe}
                                        onChange={(e) => setRememberMe(e.target.checked)}
                                        className="w-4 h-4 rounded border-white/10 bg-white/5 text-primary focus:ring-primary/20"
                                    />
                                    <span className="text-[10px] font-black uppercase tracking-tighter text-muted group-hover:text-white transition-colors">Lembrar</span>
                                </label>
                                <button
                                    type="button"
                                    onClick={handleForgotPassword}
                                    className="text-[10px] font-black uppercase tracking-tighter text-primary hover:underline"
                                >
                                    Esqueceu a senha?
                                </button>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full btn-primary py-4 rounded-2xl font-black text-lg flex items-center justify-center gap-3 shadow-2xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
                        >
                            {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : (
                                <>
                                    {view === 'login' ? 'Entrar agora' : 'Criar minha conta'}
                                    <LogIn className="w-5 h-5" />
                                </>
                            )}
                        </button>

                        <button
                            type="button"
                            onClick={() => setView(view === 'login' ? 'register' : 'login')}
                            className="w-full text-[10px] text-muted uppercase font-black tracking-widest text-center hover:text-white transition-colors"
                        >
                            {view === 'login' ? 'Precisa de uma conta? ' : 'Já tem uma conta? '}
                            <span className="text-primary underline">{view === 'login' ? 'Cadastre-se' : 'Entrar'}</span>
                        </button>
                    </form>
                )}

                <div className="mt-12 pt-8 border-t border-white/5 flex flex-col items-center gap-4">
                    <a
                        href="/staff-login"
                        className="text-[10px] text-muted uppercase font-black tracking-widest hover:text-orange-400 transition-colors"
                    >
                        Funcionário? <span className="text-orange-400 underline">Acesse aqui</span>
                    </a>
                    <div className="flex items-center gap-2 opacity-30">
                        <ShieldCheck className="w-4 h-4 text-green-500" />
                        <span className="text-[9px] font-bold uppercase tracking-widest">End-to-End Encryption</span>
                    </div>
                </div>
            </div>

            <div className="absolute bottom-10 text-center w-full">
                <p className="text-[10px] text-muted font-black tracking-[0.3em] uppercase opacity-20">© 2026 SMARTBAR INTELLIGENCE SYSTEM</p>
                <p className="text-[8px] text-muted/30 font-mono mt-1">v.FIX.1.1 (Admin Default)</p>
            </div>
        </div>
    );
};

export default Login;
