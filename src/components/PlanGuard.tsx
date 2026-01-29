import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Crown, ArrowRight, Sparkles, Check } from 'lucide-react';
import { usePlan, PLANS, PlanFeatures } from '../context/PlanContext';

interface PlanGuardProps {
    children: React.ReactNode;
    feature: keyof PlanFeatures;
    featureName?: string;
}

export const PlanGuard = ({ children, feature, featureName }: PlanGuardProps) => {
    const navigate = useNavigate();
    const { hasFeature, currentPlan } = usePlan();

    if (hasFeature(feature)) {
        return <>{children}</>;
    }

    // Find the Pro plan
    const proPlan = PLANS.find(p => p.id === 'pro')!;

    return (
        <div className="min-h-[70vh] flex items-center justify-center p-6 animate-in fade-in duration-500">
            <div className="glass-card w-full max-w-lg p-8 border-white/10 shadow-3xl text-center relative overflow-hidden">
                {/* Decorative elements */}
                <div className="absolute top-0 right-0 w-40 h-40 bg-amber-500/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-primary/10 rounded-full blur-[60px] translate-y-1/2 -translate-x-1/2" />

                <div className="relative z-10">
                    {/* Premium Icon */}
                    <div className="flex justify-center mb-6">
                        <div className="w-20 h-20 bg-gradient-to-br from-amber-500/20 to-amber-600/10 rounded-3xl flex items-center justify-center border border-amber-500/30 shadow-lg shadow-amber-500/10">
                            <Crown className="w-10 h-10 text-amber-500" />
                        </div>
                    </div>

                    <h2 className="text-2xl font-black text-white tracking-tight mb-2">
                        Recurso <span className="text-amber-500">Pro</span>
                    </h2>
                    <p className="text-muted text-sm font-medium mb-6 leading-relaxed">
                        O recurso <strong className="text-white">{featureName || feature}</strong> está disponível apenas no plano <strong className="text-amber-500">SmartBar Pro</strong>.
                    </p>

                    <div className="text-left mb-6">
                        <p className="text-xs text-muted uppercase font-bold tracking-wider mb-3">Seu plano atual</p>
                        <div className="bg-white/5 p-4 rounded-2xl border border-white/10 flex justify-between items-center">
                            <div>
                                <span className="text-white font-bold">{currentPlan.name}</span>
                                <span className="text-muted text-sm ml-2">
                                    {currentPlan.price === 0 ? 'Grátis' : `R$ ${currentPlan.price.toFixed(2)}/mês`}
                                </span>
                            </div>
                            <span className="text-xs bg-white/10 px-2 py-1 rounded-full text-muted">Ativo</span>
                        </div>
                    </div>

                    {/* Pro Plan Highlight */}
                    <div className="bg-gradient-to-br from-amber-500/10 to-transparent p-4 rounded-2xl border border-amber-500/30 mb-6">
                        <div className="flex justify-between items-center mb-3">
                            <div className="flex items-center gap-2">
                                <Sparkles className="w-5 h-5 text-amber-500" />
                                <span className="text-white font-bold">{proPlan.name}</span>
                            </div>
                            <span className="text-amber-500 font-black text-lg">
                                R$ {proPlan.price.toFixed(2)}<span className="text-xs font-normal">/mês</span>
                            </span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-left">
                            <div className="flex items-center gap-2 text-xs text-muted">
                                <Check className="w-3 h-3 text-green-500" /> Agenda
                            </div>
                            <div className="flex items-center gap-2 text-xs text-muted">
                                <Check className="w-3 h-3 text-green-500" /> Automação
                            </div>
                            <div className="flex items-center gap-2 text-xs text-muted">
                                <Check className="w-3 h-3 text-green-500" /> Integrações API
                            </div>
                            <div className="flex items-center gap-2 text-xs text-muted">
                                <Check className="w-3 h-3 text-green-500" /> Suporte VIP
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={() => navigate('/configuracoes')}
                        className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black font-black py-4 rounded-2xl flex items-center justify-center gap-2 transition-all hover:scale-[1.02] shadow-lg shadow-amber-500/30"
                    >
                        <Crown className="w-5 h-5" />
                        Fazer Upgrade
                        <ArrowRight className="w-5 h-5" />
                    </button>

                    <button
                        onClick={() => navigate(-1)}
                        className="w-full btn-outline py-3 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 mt-3"
                    >
                        ← Voltar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PlanGuard;

