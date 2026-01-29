import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

interface LandingNavbarProps {
    scrolled: boolean;
}

export function LandingNavbar({ scrolled }: LandingNavbarProps) {
    const [isOpen, setIsOpen] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    const scrollToSection = (id: string) => {
        if (location.pathname !== '/') {
            navigate(`/#${id}`);
            return;
        }

        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
            setIsOpen(false);
        }
    };

    return (
        <nav
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled
                ? 'bg-[#020617]/95 backdrop-blur-xl border-b border-sky-500/20 shadow-lg'
                : 'bg-transparent'
                }`}
        >
            <div className="max-w-7xl mx-auto px-6 py-4">
                <div className="flex items-center justify-between">
                    <div
                        className="flex items-center gap-3 cursor-pointer"
                        onClick={() => navigate('/')}
                    >
                        <div className="w-10 h-10 bg-gradient-to-br from-sky-500 to-cyan-500 rounded-xl flex items-center justify-center">
                            <i className="ri-bar-chart-box-line text-2xl text-white"></i>
                        </div>
                        <span className="text-2xl font-bold text-white">SmartBar</span>
                    </div>

                    <div className="hidden md:flex items-center gap-6">
                        <button
                            onClick={() => scrollToSection('about')}
                            className="text-gray-300 hover:text-sky-400 transition-colors cursor-pointer whitespace-nowrap"
                        >
                            Sobre
                        </button>
                        <button
                            onClick={() => scrollToSection('features')}
                            className="text-gray-300 hover:text-sky-400 transition-colors cursor-pointer whitespace-nowrap"
                        >
                            Recursos
                        </button>
                        <button
                            onClick={() => scrollToSection('pricing')}
                            className="text-gray-300 hover:text-sky-400 transition-colors cursor-pointer whitespace-nowrap"
                        >
                            Preços
                        </button>
                        <button
                            onClick={() => navigate('/download')}
                            className="text-gray-300 hover:text-sky-400 transition-colors cursor-pointer whitespace-nowrap"
                        >
                            Download
                        </button>
                        <button
                            onClick={() => scrollToSection('contact')}
                            className="text-gray-300 hover:text-sky-400 transition-colors cursor-pointer whitespace-nowrap"
                        >
                            Contato
                        </button>

                        <div className="h-6 w-px bg-white/10 mx-2"></div>

                        <button
                            onClick={() => navigate('/login')}
                            className="text-white hover:text-sky-400 transition-colors cursor-pointer whitespace-nowrap font-medium"
                        >
                            Entrar
                        </button>
                        <button
                            onClick={() => navigate('/download')}
                            className="px-6 py-3 bg-gradient-to-r from-sky-500 to-cyan-500 rounded-full font-bold text-white hover:shadow-lg hover:shadow-sky-500/50 transition-all duration-300 whitespace-nowrap cursor-pointer transform hover:-translate-y-0.5 active:translate-y-0"
                        >
                            <i className="ri-download-line mr-2"></i>
                            Baixar App
                        </button>
                    </div>

                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className="md:hidden text-3xl text-white cursor-pointer"
                    >
                        <i className={isOpen ? 'ri-close-line' : 'ri-menu-line'}></i>
                    </button>
                </div>

                {isOpen && (
                    <div className="md:hidden mt-6 pb-6 space-y-4 border-t border-sky-500/20 pt-6">
                        <button
                            onClick={() => scrollToSection('about')}
                            className="block w-full text-left text-gray-300 hover:text-sky-400 transition-colors cursor-pointer whitespace-nowrap"
                        >
                            Sobre
                        </button>
                        <button
                            onClick={() => scrollToSection('features')}
                            className="block w-full text-left text-gray-300 hover:text-sky-400 transition-colors cursor-pointer whitespace-nowrap"
                        >
                            Recursos
                        </button>
                        <button
                            onClick={() => scrollToSection('pricing')}
                            className="block w-full text-left text-gray-300 hover:text-sky-400 transition-colors cursor-pointer whitespace-nowrap"
                        >
                            Preços
                        </button>
                        <button
                            onClick={() => navigate('/download')}
                            className="block w-full text-left text-gray-300 hover:text-sky-400 transition-colors cursor-pointer whitespace-nowrap"
                        >
                            Download
                        </button>
                        <button
                            onClick={() => scrollToSection('contact')}
                            className="block w-full text-left text-gray-300 hover:text-sky-400 transition-colors cursor-pointer whitespace-nowrap"
                        >
                            Contato
                        </button>

                        <div className="border-t border-white/10 my-4 pt-4">
                            <button
                                onClick={() => navigate('/login')}
                                className="block w-full text-left text-white font-medium hover:text-sky-400 transition-colors cursor-pointer whitespace-nowrap mb-4"
                            >
                                Entrar no sistema
                            </button>
                            <button
                                onClick={() => navigate('/download')}
                                className="w-full px-6 py-3 bg-gradient-to-r from-sky-500 to-cyan-500 rounded-full font-bold text-white hover:shadow-lg hover:shadow-sky-500/50 transition-all duration-300 whitespace-nowrap cursor-pointer flex items-center justify-center"
                            >
                                <i className="ri-download-line mr-2"></i>
                                Baixar App
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </nav>
    );
}
