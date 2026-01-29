import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

export function Hero() {
    const sectionRef = useRef<HTMLElement>(null);
    const navigate = useNavigate();

    useEffect(() => {
        const elements = sectionRef.current?.querySelectorAll('.hero-animate');
        elements?.forEach((el, index) => {
            setTimeout(() => {
                el.classList.add('animate-fade-in');
            }, index * 150);
        });
    }, []);

    const scrollToFeatures = () => {
        const element = document.getElementById('features');
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <section
            id="hero"
            className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20"
            ref={sectionRef}
        >
            <div className="absolute inset-0 bg-gradient-to-b from-[#020617] via-[#0EA5E9]/10 to-[#020617]"></div>
            <div className="absolute inset-0 opacity-20">
                <div
                    className="absolute inset-0"
                    style={{
                        backgroundImage:
                            'linear-gradient(#1E293B 1px, transparent 1px), linear-gradient(90deg, #1E293B 1px, transparent 1px)',
                        backgroundSize: '50px 50px',
                    }}
                ></div>
            </div>
            <div className="absolute inset-0 overflow-hidden">
                {[...Array(20)].map((_, i) => (
                    <div
                        key={i}
                        className="absolute w-1 h-1 bg-sky-400 rounded-full animate-pulse"
                        style={{
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                            animationDelay: `${Math.random() * 3}s`,
                            animationDuration: `${2 + Math.random() * 3}s`,
                        }}
                    ></div>
                ))}
            </div>

            <div className="relative z-10 max-w-7xl mx-auto px-6 py-20">
                <div className="max-w-4xl mx-auto text-center space-y-8">
                    <h1
                        className="hero-animate text-5xl md:text-7xl font-extrabold leading-tight text-white"
                        style={{ animationDelay: '0s' }}
                    >
                        Gestão Inteligente{' '}
                        <span className="bg-gradient-to-r from-sky-400 to-slate-400 bg-clip-text text-transparent">
                            em Tempo Real
                        </span>{' '}
                        para Seu Bar
                    </h1>
                    <p
                        className="hero-animate text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed"
                        style={{ animationDelay: '0.15s' }}
                    >
                        Centro de comando completo para bares modernos. PDV inteligente,
                        estoque automatizado e marketing via WhatsApp integrado.
                    </p>
                    <div
                        className="hero-animate flex flex-wrap gap-4 justify-center"
                        style={{ animationDelay: '0.3s' }}
                    >
                        <button
                            onClick={() => navigate('/download')}
                            className="px-8 py-4 bg-gradient-to-r from-sky-500 to-cyan-500 rounded-full font-bold text-lg text-white hover:shadow-2xl hover:shadow-sky-500/50 transition-all duration-300 hover:scale-105 whitespace-nowrap cursor-pointer"
                        >
                            <i className="ri-android-line mr-2"></i>
                            Baixar APK Grátis
                        </button>
                        <button
                            onClick={scrollToFeatures}
                            className="px-8 py-4 border-2 border-sky-400 rounded-full font-bold text-lg text-white hover:bg-sky-400/10 backdrop-blur-xl transition-all duration-300 whitespace-nowrap cursor-pointer"
                        >
                            <i className="ri-play-circle-line mr-2"></i>
                            Ver Demonstração
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
}
