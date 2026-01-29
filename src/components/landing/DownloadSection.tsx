import { useScrollAnimation } from '../../hooks/useScrollAnimation';

export function DownloadSection() {
    const scrollRef = useScrollAnimation();

    return (
        <section id="download" className="py-20 relative overflow-hidden bg-gradient-to-b from-[#020617] to-sky-900/20" ref={scrollRef}>
            <div className="max-w-7xl mx-auto px-6 relative z-10">
                <div className="bg-[#0F172A] rounded-[3rem] p-12 md:p-20 relative overflow-hidden border border-white/10 scroll-animate">
                    <div className="absolute top-0 right-0 -mr-20 -mt-20 w-[600px] h-[600px] bg-sky-500/20 rounded-full blur-[120px]"></div>

                    <div className="grid md:grid-cols-2 gap-12 items-center relative z-10">
                        <div className="space-y-8">
                            <h2 className="text-4xl md:text-5xl font-bold text-white leading-tight">
                                Leve o controle do seu bar
                                <span className="block text-sky-400">no seu bolso</span>
                            </h2>
                            <p className="text-xl text-gray-400">
                                Baixe agora o aplicativo Android e tenha acesso a todas as funcionalidades do SmartBar onde estiver.
                            </p>

                            <div className="flex flex-col sm:flex-row gap-4">
                                <a href="/smartbar.apk" download className="flex items-center justify-center gap-3 px-8 py-4 bg-white text-slate-900 rounded-xl font-bold hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 shadow-xl shadow-white/10 cursor-pointer">
                                    <i className="ri-google-play-fill text-2xl"></i>
                                    <div className="text-left">
                                        <div className="text-xs font-semibold uppercase tracking-wide">Disponível para</div>
                                        <div className="text-xl leading-none">Android</div>
                                    </div>
                                </a>

                                <button className="flex items-center justify-center gap-3 px-8 py-4 bg-white/5 text-white rounded-xl font-bold border border-white/10 hover:bg-white/10 transition-all duration-300 backdrop-blur-sm cursor-pointer grayscale opacity-50 cursor-not-allowed">
                                    <i className="ri-apple-fill text-2xl"></i>
                                    <div className="text-left">
                                        <div className="text-xs font-semibold uppercase tracking-wide">Em Breve</div>
                                        <div className="text-xl leading-none">iOS</div>
                                    </div>
                                </button>
                            </div>

                            <div className="flex items-center gap-4 text-sm text-gray-500">
                                <div className="flex -space-x-2">
                                    {[1, 2, 3, 4].map((i) => (
                                        <div key={i} className="w-8 h-8 rounded-full bg-slate-700 border-2 border-[#0F172A] flex items-center justify-center text-xs text-white">
                                            <i className="ri-user-smile-line"></i>
                                        </div>
                                    ))}
                                </div>
                                <span>Junte-se a +2.000 bares usando SmartBar</span>
                            </div>
                        </div>

                        <div className="relative">
                            <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A] via-transparent to-transparent z-10"></div>
                            <img
                                src="https://readdy.ai/api/search-image?query=hand%20holding%20smartphone%20showing%20bar%20management%20dashboard%20app%20screen%2C%20dark%20mode%20ui%2C%20clean%20background%2C%20high%20quality%20product%20shot&width=500&height=600&seq=download-app-mockup&orientation=landscape"
                                alt="App Mobile"
                                className="w-full rounded-2xl shadow-2xl transform rotate-[-5deg] hover:rotate-0 transition-transform duration-500"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
