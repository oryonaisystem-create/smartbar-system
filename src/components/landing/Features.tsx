import { useScrollAnimation } from '../../hooks/useScrollAnimation';

export function Features() {
    const scrollRef = useScrollAnimation();

    const features = [
        {
            title: 'Comanda Digital',
            desc: 'Elimine erros e filas. Seus garçons lançam pedidos direto pelo celular e a cozinha recebe instantaneamente.',
            icon: 'ri-smartphone-line',
            color: 'from-blue-500 to-cyan-500',
        },
        {
            title: 'Controle de Estoque',
            desc: 'Baixa automática de ingredientes por ficha técnica. Alertas de estoque baixo e sugestão de compras.',
            icon: 'ri-box-3-line',
            color: 'from-purple-500 to-pink-500',
        },
        {
            title: 'Gestão Financeira',
            desc: 'DRE automático, fluxo de caixa em tempo real e conciliação bancária simplificada.',
            icon: 'ri-money-dollar-circle-line',
            color: 'from-green-500 to-emerald-500',
        },
        {
            title: 'Automação WhatsApp',
            desc: 'Envie promoções, lembretes de reserva e pesquisas de satisfação automaticamente via WhatsApp.',
            icon: 'ri-whatsapp-line',
            color: 'from-green-400 to-emerald-600',
        },
        {
            title: 'Cardápio Digital',
            desc: 'QR Code nas mesas. O cliente pede, paga e você economiza com equipe de atendimento.',
            icon: 'ri-qr-code-line',
            color: 'from-yellow-400 to-orange-500',
        },
        {
            title: 'Relatórios IA',
            desc: 'Nossa IA analisa seus dados e sugere ações para aumentar seu lucro semanalmente.',
            icon: 'ri-brain-line',
            color: 'from-indigo-500 to-violet-500',
        },
        {
            title: 'Gestão de Eventos',
            desc: 'Organize shows e agenda de DJs. Controle de reservas e listas de convidados integrado.',
            icon: 'ri-calendar-event-line',
            color: 'from-pink-500 to-rose-500',
        },
        {
            title: 'Scanner Ultra-Rápido',
            desc: 'Use a câmera do celular para bipar produtos e lançar pedidos em milissegundos.',
            icon: 'ri-barcode-box-line',
            color: 'from-cyan-400 to-blue-500',
        },
    ];

    return (
        <section id="features" className="py-20 relative bg-[#0B1121]" ref={scrollRef}>
            <div className="max-w-7xl mx-auto px-6">
                <div className="text-center mb-16 scroll-animate">
                    <span className="text-sky-400 font-semibold tracking-wider text-sm uppercase bg-sky-500/10 px-4 py-2 rounded-full border border-sky-500/20">
                        Funcionalidades
                    </span>
                    <h2 className="mt-6 text-4xl md:text-5xl font-bold text-white">
                        Tudo o que você precisa
                        <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-blue-600">
                            em um único lugar
                        </span>
                    </h2>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {features.map((feature, index) => (
                        <div
                            key={index}
                            className="scroll-animate group relative p-1 rounded-3xl bg-gradient-to-br from-white/5 to-white/0 hover:from-sky-500/20 hover:to-purple-500/20 transition-all duration-300"
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-sky-500/10 to-purple-500/10 rounded-3xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            <div className="relative h-full bg-[#0F172A] p-8 rounded-[22px] border border-white/5 group-hover:border-sky-500/30 transition-colors">
                                <div
                                    className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-6 shadow-lg transform group-hover:scale-110 transition-transform duration-300`}
                                >
                                    <i className={`${feature.icon} text-2xl text-white`}></i>
                                </div>
                                <h3 className="text-2xl font-bold text-white mb-4">
                                    {feature.title}
                                </h3>
                                <p className="text-gray-400 leading-relaxed">{feature.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
