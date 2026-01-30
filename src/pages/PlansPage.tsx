import { useState } from 'react';
import { Check, Star, Zap, Shield, ShieldCheck, Loader2 } from 'lucide-react';
import { usePlan } from '../hooks/usePlan';
import { supabase } from '../lib/supabase';


const PlansPage = () => {
    const { plan, status, loading: planLoading } = usePlan();
    const [billingLoading, setBillingLoading] = useState(false);

    const handleUpgrade = async () => {
        setBillingLoading(true);
        // MOCK MERCADO PAGO FLOW
        try {
            // In a real app, we would call an edge function here to create a preference
            // const { data } = await supabase.functions.invoke('create-mp-preference', { ... })
            // window.location.href = data.init_point;

            console.log("Redirecting to Mercado Pago Checkout...");
            setTimeout(() => {
                alert("Simulação: Redirecionando para Mercado Pago... (Integração Backend necessária)");
                setBillingLoading(false);
            }, 1000);
        } catch (error) {
            console.error(error);
            setBillingLoading(false);
        }
    };

    if (planLoading) {
        return (
            <div className="flex bg-[#020617] items-center justify-center min-h-[60vh]">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="text-center space-y-4">
                <h1 className="text-4xl font-black text-white tracking-tighter">
                    Planos <span className="text-primary">SmartBar</span>
                </h1>
                <p className="text-muted text-lg max-w-2xl mx-auto">
                    Escolha a inteligência certa para o tamanho do seu negócio.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto pt-8">
                {/* BASIC PLAN */}
                <div className={`
                        relative group p-8 rounded-3xl border transition-all duration-300
                        ${plan === 'basic' ? 'bg-[#0f172a] border-primary/50 shadow-2xl shadow-primary/10' : 'bg-[#0f172a]/50 border-white/5 hover:border-white/10'}
                    `}>
                    <div className="flex justify-between items-start mb-8">
                        <div>
                            <h3 className="text-2xl font-bold text-white mb-2">Basic</h3>
                            <p className="text-muted/60 text-sm">Ideal para começar.</p>
                        </div>
                        <Zap className="w-10 h-10 text-white/20" />
                    </div>
                    <div className="mb-4">
                        <span className="text-4xl font-black text-white">R$ 49,90</span>
                        <span className="text-muted text-sm">/mês</span>
                    </div>
                    <div className="mb-8 p-3 bg-green-500/10 border border-green-500/20 rounded-xl">
                        <p className="text-xs text-green-400 font-bold uppercase tracking-wide flex items-center gap-2">
                            <Star className="w-3 h-3 fill-green-400" />
                            30 Dias Grátis (Trial)
                        </p>
                    </div>
                    <ul className="space-y-4 mb-8">
                        {[
                            'PDV (Ponto de Venda)',
                            'Controle de Estoque',
                            'Financeiro',
                            'Relatórios'
                        ].map((feature) => (
                            <li key={feature} className="flex items-center gap-3 text-sm text-gray-300">
                                <div className="bg-white/10 rounded-full p-0.5">
                                    <Check className="w-3 h-3 text-green-400" />
                                </div>
                                {feature}
                            </li>
                        ))}
                    </ul>
                    <button
                        disabled={plan === 'basic'}
                        className={`
                                w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all
                                ${plan === 'basic'
                                ? 'bg-white/5 text-muted cursor-default border border-white/5'
                                : 'bg-white text-black hover:bg-gray-100 font-black'
                            }
                            `}
                    >
                        {plan === 'basic' ? 'Plano Atual' : 'Usar Gratuito (30 dias)'}
                    </button>
                </div>

                {/* PRO PLAN */}
                <div className={`
                        relative group p-8 rounded-3xl border transition-all duration-300 overflow-hidden
                        ${plan === 'pro'
                        ? 'bg-primary/10 border-primary shadow-2xl shadow-primary/20'
                        : 'bg-[#0f172a] border-blue-500/30 hover:border-blue-500 shadow-2xl shadow-blue-900/20'
                    }
                    `}>
                    {plan === 'pro' && (
                        <div className="absolute top-0 right-0 bg-primary text-white px-4 py-1 rounded-bl-xl text-xs font-black uppercase tracking-widest">
                            Ativo
                        </div>
                    )}

                    <div className="flex justify-between items-start mb-8 relative">
                        <div>
                            <h3 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
                                Pro <ShieldCheck className="w-5 h-5 text-blue-400" />
                            </h3>
                            <p className="text-muted/60 text-sm">Escala e automação total.</p>
                        </div>
                        <div className="w-12 h-12 rounded-xl bg-blue-600/20 flex items-center justify-center shadow-lg border border-blue-500/30">
                            <Star className="w-6 h-6 text-blue-500" />
                        </div>
                    </div>

                    <div className="mb-8 relative">
                        <span className="text-5xl font-black text-white">R$ 99,90</span>
                        <span className="text-muted text-sm">/mês</span>
                        <p className="text-xs text-blue-400 mt-2 font-medium">Cobrança imediata no cartão</p>
                    </div>

                    <ul className="space-y-4 mb-8 relative">
                        {[
                            'Tudo do Basic',
                            'Agenda de Reservas',
                            'Automação WhatsApp',
                            'Integrações API',
                            'Suporte Prioritário'
                        ].map((feature) => (
                            <li key={feature} className="flex items-center gap-3 text-sm text-white font-medium">
                                <div className="bg-blue-500 rounded-full p-0.5">
                                    <Check className="w-3 h-3 text-black" />
                                </div>
                                {feature}
                            </li>
                        ))}
                    </ul>

                    <button
                        onClick={handleUpgrade}
                        disabled={plan === 'pro' || billingLoading}
                        className={`
                                w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 relative overflow-hidden transition-all
                                ${plan === 'pro'
                                ? 'bg-primary/20 text-primary cursor-default'
                                : 'bg-gradient-to-r from-blue-600 to-blue-500 hover:scale-[1.02] active:scale-95 text-white shadow-lg shadow-blue-500/25'
                            }
                            `}
                    >
                        {billingLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                            plan === 'pro' ? 'Plano Atual' : 'Assinar Pro (Cartão)'
                        )}
                    </button>
                </div>
            </div>

            <div className="text-center pt-8">
                <p className="text-xs text-muted/30 uppercase tracking-widest font-bold">Secure Payments by Mercado Pago</p>
            </div>
        </div>

    );
};

export default PlansPage;
