import React from 'react';
import { Download, ShieldCheck, Smartphone, AlertTriangle } from 'lucide-react';

export const DownloadPage = () => {
    // Link direto para o arquivo que estará na pasta public do seu projeto
    const apkUrl = "/smartbar.apk";

    return (
        <div className="min-h-screen bg-[#0F172A] text-white font-sans selection:bg-blue-500 selection:text-white flex flex-col items-center">

            {/* Navbar */}
            <nav className="w-full p-6 flex justify-center border-b border-slate-800 bg-[#0F172A]/90 backdrop-blur fixed top-0 z-50">
                <h1 className="text-xl font-bold tracking-wider uppercase">
                    Smart<span className="text-blue-500">Bar</span> <span className="text-xs text-slate-500 normal-case border border-slate-700 rounded px-2 py-0.5 ml-2">Download Center</span>
                </h1>
            </nav>

            <main className="w-full max-w-md px-6 pt-28 pb-12 flex flex-col items-center text-center">

                {/* Ícone Hero */}
                <div className="mb-8 relative group">
                    <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full blur opacity-40 group-hover:opacity-60 transition duration-500"></div>
                    <div className="relative bg-slate-800 p-6 rounded-3xl border border-slate-700 shadow-2xl">
                        <Smartphone size={48} className="text-blue-400" />
                    </div>
                </div>

                <h2 className="text-3xl font-bold mb-3 text-white">Instalar App SmartBar</h2>
                <p className="text-slate-400 mb-8 leading-relaxed">
                    Versão exclusiva para gestão interna.<br />
                    Estoque, Financeiro e Scanner.
                </p>

                {/* Botão de Download */}
                <a
                    href={apkUrl}
                    download="SmartBar-App.apk"
                    className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white font-bold py-4 px-6 rounded-xl flex items-center justify-center gap-3 transition-all shadow-lg shadow-blue-900/20 active:scale-95 mb-6"
                >
                    <Download className="w-6 h-6" />
                    <div className="text-left">
                        <div className="text-xs font-normal text-blue-200">Baixar para Android</div>
                        <div className="text-lg leading-none">Download APK (v1.0)</div>
                    </div>
                </a>

                <div className="flex items-center gap-2 text-xs text-green-400 bg-green-400/10 px-3 py-1.5 rounded-full border border-green-400/20 mb-12">
                    <ShieldCheck size={14} />
                    <span>Arquivo Verificado e Seguro</span>
                </div>

                {/* Tutorial */}
                <div className="w-full text-left bg-slate-800/50 rounded-2xl p-6 border border-slate-700">
                    <h3 className="text-sm font-bold text-slate-300 mb-4 uppercase tracking-wider flex items-center gap-2">
                        <AlertTriangle size={16} className="text-yellow-500" />
                        Instalação
                    </h3>
                    <div className="space-y-4 text-sm text-slate-400">
                        <p>1. Clique em Baixar e confirme o download.</p>
                        <p>2. Se o Android bloquear, vá em Configurações e permita "Fontes Desconhecidas".</p>
                        <p>3. Instale e faça login com sua conta Google.</p>
                    </div>
                </div>
            </main>

            <footer className="w-full py-6 text-center text-slate-600 text-xs border-t border-slate-800/50">
                © 2026 SmartBar System
            </footer>
        </div>
    );
};
