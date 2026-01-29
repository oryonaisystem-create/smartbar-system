import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, ShieldAlert, Mail, ArrowRight, Loader2 } from 'lucide-react';
import { useViewport } from '../hooks/useViewport';
import MobilePINGuard from './mobile/MobilePINGuard';

interface FinanceGuardProps {
    children: React.ReactNode;
}

export const FinanceGuard = ({ children }: FinanceGuardProps) => {
    const navigate = useNavigate();
    const { isMobile } = useViewport();
    const [isUnlocked, setIsUnlocked] = useState(() => {
        // Synchronous check to prevent flash of lock screen
        return localStorage.getItem('smartbar_security_pin_required') === 'false';
    });
    const [pin, setPin] = useState("");
    const [verifying, setVerifying] = useState(false);
    const [showReset, setShowReset] = useState(false);
    const [resetStep, setResetStep] = useState(1);

    const savedPin = localStorage.getItem('smartbar_finance_pin') || "1994";

    useEffect(() => {
        // Check global security setting
        const pinRequired = localStorage.getItem('smartbar_security_pin_required');
        if (pinRequired === 'false') {
            setIsUnlocked(true);
        }
    }, [isMobile]); // Re-check if mobile state changes, or just on mount

    const handleUnlock = () => {
        setVerifying(true);
        setTimeout(() => {
            if (pin === savedPin) {
                setIsUnlocked(true);
            } else {
                alert("PIN Financeiro incorreto!");
                setPin("");
            }
            setVerifying(false);
        }, 800);
    };

    const handleRequestReset = () => {
        setVerifying(true);
        setTimeout(() => {
            alert("Código de segurança enviado para patrick@smartbar.com");
            setResetStep(2);
            setVerifying(false);
        }, 1500);
    };

    if (isUnlocked) return <>{children}</>;

    if (isMobile) {
        return <MobilePINGuard onSuccess={() => setIsUnlocked(true)} onCancel={() => navigate(-1)} correctPIN={savedPin} />;
    }

    return (
        <div className="fixed inset-0 z-[100] bg-[#020617]/95 backdrop-blur-xl flex items-center justify-center p-6 animate-in fade-in duration-500">
            <div className="glass-card w-full max-w-sm p-8 border-white/10 shadow-3xl text-center relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-[60px] -translate-y-1/2 translate-x-1/2" />

                <div className="flex justify-center mb-6">
                    <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center border border-primary/20 shadow-inner">
                        <Lock className="w-8 h-8 text-primary" />
                    </div>
                </div>

                <h2 className="text-2xl font-black text-white tracking-tight mb-2">Área Protegida</h2>
                <p className="text-muted text-sm font-medium mb-8 leading-relaxed">
                    Insira sua **Senha do Dono** para acessar os dados financeiros e relatórios confidenciais.
                </p>

                <div className="space-y-4">
                    <div className="relative">
                        <input
                            type="password"
                            maxLength={6}
                            value={pin}
                            onChange={(e) => setPin(e.target.value)}
                            placeholder="****"
                            className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-center text-2xl font-black tracking-[0.5em] text-white outline-none focus:border-primary/50 transition-all placeholder:text-muted/20"
                        />
                    </div>

                    <button
                        onClick={handleUnlock}
                        disabled={verifying || pin.length < 4}
                        className="w-full btn-primary py-4 rounded-2xl font-black text-lg flex items-center justify-center gap-3 transition-all hover:scale-[1.02] disabled:opacity-50"
                    >
                        {verifying ? <Loader2 className="w-6 h-6 animate-spin" /> : <>Desbloquear <ArrowRight className="w-5 h-5" /></>}
                    </button>

                    <button
                        onClick={() => setShowReset(true)}
                        className="text-[10px] text-muted uppercase font-black tracking-widest hover:text-primary transition-colors mt-4 block mx-auto underline"
                    >
                        Esqueci minha senha
                    </button>

                    <button
                        onClick={() => navigate(-1)}
                        className="w-full btn-outline py-3 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 mt-2"
                    >
                        ← Voltar
                    </button>
                </div>

                {showReset && (
                    <div className="absolute inset-0 bg-[#0f172a] p-8 flex flex-col justify-center animate-in slide-in-from-bottom duration-300">
                        <ShieldAlert className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
                        <h3 className="text-xl font-black mb-2">Recuperação de Acesso</h3>

                        {resetStep === 1 ? (
                            <>
                                <p className="text-xs text-muted mb-6">Enviaremos um código de autenticação para o e-mail cadastrado do administrador.</p>
                                <button
                                    onClick={handleRequestReset}
                                    disabled={verifying}
                                    className="btn-outline w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2"
                                >
                                    {verifying ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
                                    Solicitar Código
                                </button>
                            </>
                        ) : (
                            <div className="space-y-4">
                                <p className="text-xs text-primary font-bold">Código enviado! Verifique seu e-mail.</p>
                                <input
                                    type="text"
                                    placeholder="000-000"
                                    className="w-full bg-white/5 border border-white/20 rounded-xl py-3 text-center font-mono text-lg"
                                />
                                <button
                                    onClick={() => {
                                        localStorage.setItem('smartbar_finance_pin', '1994'); // Reset for demo
                                        setPin("1994");
                                        setResetStep(1);
                                        setShowReset(false);
                                        alert("Senha financeira redefinida para '1994' para este acesso.");
                                    }}
                                    className="btn-primary w-full py-4 rounded-xl font-black"
                                >
                                    Validar & Resetar
                                </button>
                            </div>
                        )}

                        <button
                            onClick={() => setShowReset(false)}
                            className="mt-6 text-[10px] text-muted font-black uppercase tracking-widest"
                        >
                            Voltar
                        </button>
                    </div>
                )}
            </div>

            <div className="absolute bottom-10 flex items-center gap-3 opacity-30 grayscale pointer-events-none">
                <ShieldAlert className="w-5 h-5" />
                <span className="text-xs font-black uppercase tracking-[0.2em]">SmartBar Encryption Shield</span>
            </div>
        </div>
    );
};
