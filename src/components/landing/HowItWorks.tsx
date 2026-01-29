import { useScrollAnimation } from '../../hooks/useScrollAnimation';

export function HowItWorks() {
    const scrollRef = useScrollAnimation();

    const steps = [
        {
            num: '01',
            title: 'Cadastre seu Bar',
            desc: 'Crie sua conta em menos de 2 minutos. Configure seu cardápio e mesas de forma intuitiva.',
        },
        {
            num: '02',
            title: 'Baixe o App',
            desc: 'Instale o SmartBar nos celulares dos garçons. Compatível com qualquer Android.',
        },
        {
            num: '03',
            title: 'Comece a Operar',
            desc: 'Pronto! Seus pedidos já caem direto na cozinha e o estoque é atualizado automaticamente.',
        },
    ];

    return (
        <section className="py-20 relative bg-[#020617]" ref={scrollRef}>
            <div className="max-w-7xl mx-auto px-6">
                <div className="text-center mb-20 scroll-animate">
                    <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                        Simples assim.
                    </h2>
                    <p className="text-xl text-gray-400">
                        Sem treinamentos longos. Sem instalação complexa.
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-12 relative">
                    <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-0.5 bg-gradient-to-r from-sky-500/0 via-sky-500/50 to-sky-500/0 border-t border-dashed border-white/20 z-0"></div>

                    {steps.map((step, index) => (
                        <div key={index} className="scroll-animate relative z-10 text-center group">
                            <div className="w-24 h-24 mx-auto bg-[#0F172A] border-4 border-[#020617] rounded-full flex items-center justify-center text-3xl font-bold text-sky-500 shadow-xl shadow-sky-500/10 mb-8 group-hover:scale-110 transition-transform duration-300 group-hover:border-sky-500/50">
                                {step.num}
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-4">{step.title}</h3>
                            <p className="text-gray-400 max-w-xs mx-auto">{step.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
