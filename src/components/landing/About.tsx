import { useScrollAnimation } from '../../hooks/useScrollAnimation';

export function About() {
    const scrollRef = useScrollAnimation();

    return (
        <section id="about" className="py-20 relative overflow-hidden" ref={scrollRef}>
            <div className="absolute top-1/2 left-0 w-96 h-96 bg-sky-500/20 rounded-full blur-[100px] -translate-x-1/2 -translate-y-1/2"></div>
            <div className="max-w-7xl mx-auto px-6 relative z-10">
                <div className="text-center max-w-3xl mx-auto space-y-6 mb-20 scroll-animate">
                    <h2 className="text-4xl md:text-5xl font-bold text-white">
                        Revolucione a Gestão do seu
                        <span className="text-sky-400"> Bar ou Restaurante</span>
                    </h2>
                    <p className="text-xl text-gray-400">
                        Dê adeus às planilhas e sistemas complicados. O SmartBar centraliza
                        toda sua operação em uma única tela, permitindo que você foque no
                        que realmente importa: a experiência do seu cliente.
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                    {[
                        {
                            icon: 'ri-rocket-line',
                            title: 'Velocidade',
                            desc: 'Atendimento 3x mais rápido com comanda digital e cardápio QR Code integrado.',
                        },
                        {
                            icon: 'ri-shield-check-line',
                            title: 'Controle Total',
                            desc: 'Evite prejuízos. Saiba exatamente quanto entra e sai do seu estoque em tempo real.',
                        },
                        {
                            icon: 'ri-line-chart-line',
                            title: 'Lucratividade',
                            desc: 'Relatórios automáticos que mostram onde você está ganhando e perdendo dinheiro.',
                        },
                    ].map((item, index) => (
                        <div
                            key={index}
                            className="scroll-animate p-8 rounded-3xl bg-white/5 backdrop-blur-sm border border-white/10 hover:border-sky-500/30 transition-all duration-300 hover:transform hover:-translate-y-2 group"
                            style={{ transitionDelay: `${index * 100}ms` }}
                        >
                            <div className="w-14 h-14 bg-sky-500/10 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-sky-500/20 transition-colors">
                                <i className={`${item.icon} text-3xl text-sky-400`}></i>
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-4">
                                {item.title}
                            </h3>
                            <p className="text-gray-400 leading-relaxed">{item.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
