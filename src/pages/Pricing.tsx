import { useState } from 'react';
import {
    Check,
    Zap,
    Crown,
    Smartphone,
    BarChart3,
    Users,
    ShieldCheck,
    Star,
    Infinity
} from 'lucide-react';

const Pricing = () => {
    const [loading, setLoading] = useState(false);

    const handleUpgrade = () => {
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            alert(`Acesso Vitalício Ativado! Como você é o Administrador Patrick, sua conta já possui privilégios totais.`);
        }, 1500);
    };

    return (
        <div className="space-y-12 py-6">
            <div className="text-center space-y-4 max-w-2xl mx-auto">
                <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-white">Licença Vitalícia SmartBar.</h1>
                <p className="text-muted text-lg">Pague uma vez, tenha o controle total para sempre. Sem assinaturas, sem taxas mensais.</p>
            </div>

            <div className="max-w-4xl mx-auto px-4">
                {/* Single Luxury Plan Card */}
                <div className="glass-card p-12 border-primary shadow-2xl shadow-primary/20 flex flex-col md:flex-row gap-12 relative overflow-hidden bg-primary/5">
                    <div className="absolute top-0 right-0 bg-primary text-white text-[10px] font-black uppercase px-6 py-2 rounded-bl-2xl tracking-widest shadow-lg flex items-center gap-2">
                        <Infinity className="w-4 h-4" /> Acesso Vitalício
                    </div>

                    <div className="flex-1 space-y-8">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <Crown className="w-8 h-8 text-primary shadow-lg" />
                                <h3 className="text-3xl font-black text-white">SmartBar Full Pass</h3>
                            </div>
                            <p className="text-muted leading-relaxed">
                                Desbloqueie todo o potencial da plataforma com um investimento único. Ideal para donos de bares que buscam independência tecnológica.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <PriceFeature text="PDV & Carrinho Ilimitado" />
                            <PriceFeature text="Gestão de Estoque Inteligente" />
                            <PriceFeature text="Dashboard de Lucro Real" />
                            <PriceFeature text="Disparos WhatsApp (Ilimitados)" />
                            <PriceFeature text="Agenda de Shows & Eventos" />
                            <PriceFeature text="Relatórios Avançados (PDF)" />
                            <PriceFeature text="Scanner de Estoque Embutido" />
                            <PriceFeature text="Suporte VIP & Atualizações" />
                        </div>
                    </div>

                    <div className="w-full md:w-80 flex flex-col justify-center space-y-6 pt-12 md:pt-0 md:border-l border-white/10 md:pl-12">
                        <div className="text-center md:text-left">
                            <p className="text-sm text-muted line-through uppercase tracking-widest">De R$ 1.200,00</p>
                            <div className="flex items-baseline justify-center md:justify-start gap-2">
                                <span className="text-5xl font-black text-white">R$ 99,99</span>
                                <span className="text-muted font-bold">PIX / Único</span>
                            </div>
                            <p className="text-xs text-green-500 font-bold mt-2 uppercase tracking-tighter">Oferta de Lançamento por tempo limitado</p>
                        </div>

                        <button
                            onClick={handleUpgrade}
                            disabled={loading}
                            className="w-full btn-primary py-4 shadow-xl shadow-primary/40 font-black text-lg group overflow-hidden relative"
                        >
                            <span className="relative z-10">{loading ? 'Ativando...' : 'Garantir Acesso Vitalício'}</span>
                            <div className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                        </button>

                        <div className="space-y-3 opacity-60">
                            <div className="flex items-center gap-2 text-[10px] uppercase font-bold tracking-widest text-muted">
                                <ShieldCheck className="w-3 h-3" /> Transação Segura SSL
                            </div>
                            <div className="flex items-center gap-2 text-[10px] uppercase font-bold tracking-widest text-muted">
                                <Check className="w-3 h-3" /> 7 Dias de Garantia
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Trust Badges */}
            <div className="max-w-4xl mx-auto pt-12">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 opacity-40 grayscale hover:grayscale-0 transition-all duration-700">
                    <div className="flex flex-col items-center gap-2">
                        <Star className="w-6 h-6 text-yellow-500" />
                        <span className="text-[10px] uppercase font-black tracking-tighter">4.9/5 Estrelas</span>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                        <Users className="w-6 h-6" />
                        <span className="text-[10px] uppercase font-black tracking-tighter">+500 Bares</span>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                        <Infinity className="w-6 h-6" />
                        <span className="text-[10px] uppercase font-black tracking-tighter">Sem Mensalidades</span>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                        <BarChart3 className="w-6 h-6" />
                        <span className="text-[10px] uppercase font-black tracking-tighter">Gestão 360º</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

const PriceFeature = ({ text }: { text: string }) => (
    <li className="flex items-center gap-3 text-sm text-muted font-medium">
        <div className="bg-primary/20 rounded-full p-1 ring-4 ring-primary/5">
            <Check className="w-3 h-3 text-primary" />
        </div>
        {text}
    </li>
);

export default Pricing;
