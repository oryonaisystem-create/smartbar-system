import { useState } from 'react';
import { Check, Star, Zap, Shield, ShieldCheck, Loader2 } from 'lucide-react';
import { usePlan } from '../hooks/usePlan';
import { supabase } from '../lib/supabase';
import Layout from '../components/Layout';

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
            <Layout>
                <div className="flex bg-[#020617] items-center justify-center min-h-[60vh]">
                    <Loader2 className="w-8 h-8 text-primary animate-spin" />
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
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
                        ${plan === 'basic' ? 'bg-white/5 border-primary/50 shadow-2xl shadow-primary/10' : 'bg-[#0f172a]/50 border-white/5 hover:border-white/10'}
                    `}>
                        {plan === 'basic' && (
                            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary/20 text-primary border border-primary/50 px-4 py-1 rounded-full text-xs font-black uppercase tracking-widest shadow-xl">
                                Seu Plano Atual
                            </div>
                        )}
                        <div className="flex justify-between items-start mb-8">
                            <div>
                                <h3 className="text-2xl font-bold text-white mb-2">Basic</h3>
                                <p className="text-muted/60 text-sm">Essencial para operações ágeis.</p>
                            </div>
                            <Zap className="w-10 h-10 text-white/20" />
                        </div>
                        <div className="mb-8">
                            <span className="text-4xl font-black text-white">R$ 49,90</span>
                            <span className="text-muted text-sm">/mês</span>
                        </div>
                        <ul className="space-y-4 mb-8">
                            {[
                                'PDV Completo',
                                'Controle de Caixa',
                                'Gestão de Estoque',
                                'KDS (Cozinha)',
                                'Relatórios Diários'
                            ].map((feature) => (
                                <li key={feature} className="flex items-center gap-3 text-sm text-gray-300">
                                    <Check className="w-4 h-4 text-primary" />
                                    {feature}
                                </li>
                            ))}
                        </ul>
                        <button disabled={true} className="w-full py-4 rounded-xl font-bold bg-white/5 text-muted cursor-not-allowed">
                            {plan === 'basic' ? 'Plano Ativo' : 'Downgrade'}
                        </button>
                    </div>

                    {/* PRO PLAN */}
                    <div className={`
                        relative group p-8 rounded-3xl border transition-all duration-300 overflow-hidden
                        ${plan === 'pro' ? 'bg-primary/10 border-primary shadow-2xl shadow-primary/20' : 'bg-[#0f172a] border-white/10 hover:border-primary/50 hover:shadow-2xl hover:shadow-primary/5'}
                    `}>
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <Star className="w-48 h-48 text-primary rotate-12" />
                        </div>

                        {plan === 'pro' && (
                            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-400 to-orange-500 text-black border border-white/20 px-6 py-1 rounded-full text-xs font-black uppercase tracking-widest shadow-xl">
                                Plano Recomendado
                            </div>
                        )}

                        <div className="flex justify-between items-start mb-8 relative">
                            <div>
                                <h3 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
                                    Pro <ShieldCheck className="w-5 h-5 text-amber-400" />
                                </h3>
                                <p className="text-muted/60 text-sm">Inteligência e escala para líderes.</p>
                            </div>
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center shadow-lg">
                                <Star className="w-6 h-6 text-black fill-black" />
                            </div>
                        </div>

                        <div className="mb-8 relative">
                            <span className="text-5xl font-black text-white">R$ 99,90</span>
                            <span className="text-muted text-sm">/mês</span>
                            <div className="text-xs text-green-400 font-bold mt-2 uppercase tracking-wide">
                                7 dias Trial Grátis (Novo Usuário)
                            </div>
                        </div>

                        <ul className="space-y-4 mb-8 relative">
                            {[
                                'Tudo do Basic',
                                'Relatórios Avançados',
                                'IA Insights & Previsões',
                                'Telemetria em Tempo Real',
                                'Automações de Marketing',
                                'Prioridade no Suporte'
                            ].map((feature) => (
                                <li key={feature} className="flex items-center gap-3 text-sm text-white font-medium">
                                    <div className="bg-gradient-to-r from-amber-400 to-orange-500 rounded-full p-0.5">
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
                                    : 'bg-gradient-to-r from-primary to-orange-600 hover:scale-[1.02] active:scale-95 text-white shadow-lg shadow-primary/25'
                                }
                            `}
                        >
                            {billingLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                                plan === 'pro' ? 'Plano Ativo' : 'Atualizar para PRO'
                            )}
                        </button>
                    </div>
                </div>

                <div className="text-center pt-8">
                    <p className="text-xs text-muted/30 uppercase tracking-widest font-bold">Secure Payments by Mercado Pago</p>
                </div>
            </div>
        </Layout>
    );
};

export default PlansPage;
