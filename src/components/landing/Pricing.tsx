import { useScrollAnimation } from '../../hooks/useScrollAnimation';

export function Pricing() {
    const scrollRef = useScrollAnimation();

    const plans = [
        {
            name: 'Starter',
            price: '89',
            desc: 'Ideal para bares pequenos e food trucks iniciantes.',
            features: [
                'Até 500 pedidos/mês',
                '1 Usuário Administrativo',
                'Gestão de Estoque Básico',
                'Suporte por Email',
            ],
            highlight: false,
        },
        {
            name: 'Pro',
            price: '159',
            desc: 'Perfeito para bares em crescimento que precisam de controle.',
            features: [
                'Pedidos Ilimitados',
                '5 Usuários (Garçons/Cozinha)',
                'Ficha Técnica Avançada',
                'Relatórios Financeiros',
                'Suporte WhatsApp Prioritário',
                'Cardápio Digital QR Code',
            ],
            highlight: true,
        },
        {
            name: 'Enterprise',
            price: 'Sob Consulta',
            desc: 'Para redes de franquias e grandes operações.',
            features: [
                'Múltiplas Filiais',
                'API de Integração',
                'Gerente de Contas Dedicado',
                'Treinamento Presencial',
                'Customização de Relatórios',
            ],
            highlight: false,
            customPrice: true,
        },
    ];

    return (
        <section id="pricing" className="py-20 relative" ref={scrollRef}>
            <div className="max-w-7xl mx-auto px-6">
                <div className="text-center mb-16 scroll-animate">
                    <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                        Planos que cabem no seu bolso
                    </h2>
                    <p className="text-xl text-gray-400">
                        Comece grátis. Cancele quando quiser. Sem fidelidade.
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-8 items-center max-w-6xl mx-auto">
                    {plans.map((plan, index) => (
                        <div
                            key={index}
                            className={`scroll-animate relative p-8 rounded-3xl border transition-all duration-300 ${plan.highlight
                                    ? 'bg-gradient-to-b from-sky-500/10 to-blue-600/10 border-sky-500 shadow-2xl shadow-sky-500/20 transform md:-translate-y-4'
                                    : 'bg-[#0F172A] border-white/10 hover:border-white/20'
                                }`}
                        >
                            {plan.highlight && (
                                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-sky-500 text-white px-4 py-1 rounded-full text-sm font-bold shadow-lg shadow-sky-500/50">
                                    MAIS POPULAR
                                </div>
                            )}
                            <h3 className="text-2xl font-bold text-white mb-2">
                                {plan.name}
                            </h3>
                            <p className="text-gray-400 mb-6 text-sm h-10">{plan.desc}</p>
                            <div className="text-4xl font-bold text-white mb-8">
                                {plan.customPrice ? (
                                    'Custom'
                                ) : (
                                    <>
                                        <span className="text-lg text-gray-400 font-normal">R$</span>
                                        {plan.price}
                                        <span className="text-lg text-gray-400 font-normal">
                                            /mês
                                        </span>
                                    </>
                                )}
                            </div>
                            <ul className="space-y-4 mb-8">
                                {plan.features.map((feature, i) => (
                                    <li key={i} className="flex items-center text-gray-300">
                                        <i className="ri-checkbox-circle-fill text-sky-500 mr-3 text-lg"></i>
                                        {feature}
                                    </li>
                                ))}
                            </ul>
                            <button
                                className={`w-full py-4 rounded-xl font-bold transition-all duration-300 whitespace-nowrap cursor-pointer ${plan.highlight
                                        ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white hover:shadow-lg hover:shadow-sky-500/25'
                                        : 'bg-white/5 text-white hover:bg-white/10 border border-white/10'
                                    }`}
                            >
                                Começar Agora
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
