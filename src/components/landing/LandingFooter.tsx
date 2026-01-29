export function LandingFooter() {
    return (
        <footer className="bg-[#020617] border-t border-white/10 pt-20 pb-10">
            <div className="max-w-7xl mx-auto px-6">
                <div className="grid md:grid-cols-4 gap-12 mb-16">
                    <div className="space-y-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-sky-500 to-cyan-500 rounded-xl flex items-center justify-center">
                                <i className="ri-bar-chart-box-line text-2xl text-white"></i>
                            </div>
                            <span className="text-2xl font-bold text-white">SmartBar</span>
                        </div>
                        <p className="text-gray-400">
                            Transformando a gestão de bares e restaurantes com tecnologia e inteligência.
                        </p>
                    </div>

                    <div>
                        <h4 className="text-white font-bold mb-6">Produto</h4>
                        <ul className="space-y-4 text-gray-400">
                            <li><a href="#features" className="hover:text-sky-400 transition-colors">Funcionalidades</a></li>
                            <li><a href="#pricing" className="hover:text-sky-400 transition-colors">Preços</a></li>
                            <li><a href="#download" className="hover:text-sky-400 transition-colors">Download</a></li>
                            <li><a href="#" className="hover:text-sky-400 transition-colors">Atualizações</a></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-white font-bold mb-6">Empresa</h4>
                        <ul className="space-y-4 text-gray-400">
                            <li><a href="#about" className="hover:text-sky-400 transition-colors">Sobre Nós</a></li>
                            <li><a href="#" className="hover:text-sky-400 transition-colors">Carreiras</a></li>
                            <li><a href="#" className="hover:text-sky-400 transition-colors">Blog</a></li>
                            <li><a href="#contact" className="hover:text-sky-400 transition-colors">Contato</a></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-white font-bold mb-6">Legal</h4>
                        <ul className="space-y-4 text-gray-400">
                            <li><a href="#" className="hover:text-sky-400 transition-colors">Termos de Uso</a></li>
                            <li><a href="#" className="hover:text-sky-400 transition-colors">Privacidade</a></li>
                            <li><a href="#" className="hover:text-sky-400 transition-colors">Cookies</a></li>
                        </ul>
                    </div>
                </div>

                <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
                    <p className="text-gray-500 text-sm">
                        © {new Date().getFullYear()} SmartBar Tecnologia. Todos os direitos reservados.
                    </p>
                    <div className="flex gap-4">
                        <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:bg-sky-500 hover:text-white transition-all">
                            <i className="ri-instagram-line"></i>
                        </a>
                        <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:bg-sky-500 hover:text-white transition-all">
                            <i className="ri-facebook-fill"></i>
                        </a>
                        <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:bg-sky-500 hover:text-white transition-all">
                            <i className="ri-linkedin-fill"></i>
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
}
