import { useScrollAnimation } from '../../hooks/useScrollAnimation';

export function Contact() {
    const scrollRef = useScrollAnimation();

    return (
        <section id="contact" className="py-20 relative" ref={scrollRef}>
            <div className="max-w-7xl mx-auto px-6">
                <div className="grid md:grid-cols-2 gap-16 items-start">
                    <div className="scroll-animate space-y-8">
                        <h2 className="text-4xl md:text-5xl font-bold text-white leading-tight">
                            Ficou com alguma <span className="text-sky-400">dúvida?</span>
                        </h2>
                        <p className="text-xl text-gray-400">
                            Nossa equipe de especialistas em bares está pronta para te ajudar a escolher o melhor plano para o seu negócio.
                        </p>

                        <div className="space-y-6">
                            <div className="flex items-center gap-4 text-gray-300">
                                <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center text-sky-400 text-xl">
                                    <i className="ri-whatsapp-line"></i>
                                </div>
                                <div>
                                    <div className="text-sm text-gray-500">WhatsApp</div>
                                    <div className="text-lg font-semibold">(11) 99999-9999</div>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 text-gray-300">
                                <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center text-sky-400 text-xl">
                                    <i className="ri-mail-send-line"></i>
                                </div>
                                <div>
                                    <div className="text-sm text-gray-500">Email</div>
                                    <div className="text-lg font-semibold">contato@smartbar.com.br</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <form className="scroll-animate bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-3xl space-y-6">
                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-400">Nome</label>
                                <input type="text" className="w-full bg-[#020617]/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-sky-500 transition-colors" placeholder="Seu nome" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-400">Telefone</label>
                                <input type="text" className="w-full bg-[#020617]/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-sky-500 transition-colors" placeholder="(00) 00000-0000" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-400">Email</label>
                            <input type="email" className="w-full bg-[#020617]/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-sky-500 transition-colors" placeholder="seu@email.com" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-400">Mensagem</label>
                            <textarea rows={4} className="w-full bg-[#020617]/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-sky-500 transition-colors" placeholder="Como podemos ajudar?"></textarea>
                        </div>
                        <button className="w-full py-4 bg-sky-500 hover:bg-sky-600 rounded-xl font-bold text-white transition-colors cursor-pointer">
                            Enviar Mensagem
                        </button>
                    </form>
                </div>
            </div>
        </section>
    );
}
