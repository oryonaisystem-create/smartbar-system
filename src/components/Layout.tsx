import React, { useState } from 'react';
import {
    LayoutDashboard,
    Package,
    BarChart3,
    Calendar,
    MessageSquare,
    Settings,
    Scan,
    TrendingUp,
    AlertTriangle,
    LogOut,
    Bell
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Layout = ({ children }: { children: React.ReactNode }) => {
    const [activeTab, setActiveTab] = useState('dashboard');

    const navItems = [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'inventory', label: 'Estoque', icon: Package },
        { id: 'finance', label: 'Financeiro', icon: BarChart3 },
        { id: 'agenda', label: 'Agenda', icon: Calendar },
        { id: 'automation', label: 'Automação', icon: MessageSquare },
    ];

    return (
        <div className="flex min-h-screen bg-background text-foreground font-sans">
            {/* Sidebar */}
            <aside className="w-64 border-r border-white/5 bg-background flex flex-col fixed h-full z-50">
                <div className="p-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/30">
                            <BarChart3 className="text-white w-6 h-6" />
                        </div>
                        <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-white to-muted bg-clip-text text-transparent">
                            SmartBar
                        </h1>
                    </div>
                </div>

                <nav className="flex-1 px-4 py-4 space-y-1">
                    {navItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            className={`nav-item w-full ${activeTab === item.id ? 'active' : ''}`}
                        >
                            <item.icon className="w-5 h-5" />
                            <span>{item.label}</span>
                        </button>
                    ))}
                </nav>

                <div className="p-4 mt-auto">
                    <div className="glass-card p-4 space-y-3">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-secondary/20 border border-secondary/30 flex items-center justify-center">
                                <span className="text-secondary font-bold text-sm">JD</span>
                            </div>
                            <div className="flex-1 overflow-hidden">
                                <p className="text-sm font-medium truncate">João Dono</p>
                                <p className="text-xs text-muted truncate">Admin</p>
                            </div>
                        </div>
                        <button className="flex items-center gap-2 text-sm text-red-400 hover:text-red-300 transition-colors pt-2">
                            <LogOut className="w-4 h-4" />
                            Sair
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 ml-64 p-8 relative overflow-y-auto">
                {/* Header */}
                <header className="flex justify-between items-center mb-10">
                    <div>
                        <h2 className="text-3xl font-bold">Resumo Geral</h2>
                        <p className="text-muted mt-1">Bem-vindo de volta! Aqui está o status do seu bar hoje.</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <button className="p-2.5 glass-card hover:bg-white/10 relative">
                            <Bell className="w-5 h-5" />
                            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"></span>
                        </button>
                        <button className="btn-primary flex items-center gap-2">
                            <Scan className="w-5 h-5" />
                            Scanner
                        </button>
                    </div>
                </header>

                {children}
            </main>
        </div>
    );
};

export default Layout;
