import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard,
    Package,
    Receipt,
    Calendar,
    Settings,
    LogOut,
    User,
    Users,
    Zap,
    BarChart3,
    CreditCard,
    MessageSquare,
    Bell,
    Check,
    X,
    ChefHat,
    QrCode,
    Activity
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { supabase } from '../lib/supabase';
import { useNotifications } from '../context/NotificationContext';
import { useAuth } from '../context/AuthContext';
import { useViewport } from '../hooks/useViewport';
import MobileLayout from './mobile/MobileLayout';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface LayoutProps {
    children: React.ReactNode;
}

const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/' },
    { id: 'pos', label: 'Venda', icon: Zap, path: '/pos' },
    { id: 'kitchen', label: 'Cozinha', icon: ChefHat, path: '/kitchen' },
    { id: 'team', label: 'Equipe', icon: Users, path: '/team' },
    { id: 'tables', label: 'Mesas', icon: QrCode, path: '/tables' },
    { id: 'inventory', label: 'Estoque', icon: Package, path: '/inventory' },
    { id: 'finance', label: 'Financeiro', icon: Receipt, path: '/finance' },
    { id: 'reports', label: 'Relatórios', icon: BarChart3, path: '/reports' },
    { id: 'agenda', label: 'Agenda', icon: Calendar, path: '/agenda' },
    { id: 'automation', label: 'Automação', icon: MessageSquare, path: '/automation' },
    { id: 'menu-manager', label: 'Cardápio', icon: ChefHat, path: '/menu-manager' },
];

const Layout = ({ children }: LayoutProps) => {
    const location = useLocation();
    const navigate = useNavigate();
    const { isMobile } = useViewport();
    const [isCollapsed, setIsCollapsed] = React.useState(false);
    const { unreadCount } = useNotifications();
    const { signOut } = useAuth();

    if (isMobile) {
        return <MobileLayout>{children}</MobileLayout>;
    }

    return (
        <div className="flex min-h-screen bg-background text-foreground overflow-hidden">
            {/* Sidebar - HIDDEN on Mobile (Logic Check) */}
            {!isMobile && (
                <aside className={cn(
                    "border-r border-white/10 flex flex-col glass-card m-4 mr-0 rounded-3xl h-[calc(100vh-2rem)] overflow-hidden transition-all duration-500 ease-in-out shadow-2xl shadow-black/50 relative z-50",
                    isCollapsed ? "w-24" : "w-64"
                )}>
                    {/* ... content ... */}
                    {/* Note: In a real implementation I would wrap the content. 
                        Since 'replace_file_content' is block based, I'll be careful.
                        The existing code logic for `isMobile` at line 61 ALREADY returns <MobileLayout> early.
                        So if isMobile is true, this rendering path is unreachable.
                        However, the user requirement is "Sidebar doesn't exist on mobile".
                        The existing early return `if (isMobile) return <MobileLayout>` satisfies this perfectly.
                        Wait, let's verify if `MobileLayout` renders the Sidebar.
                        I better check MobileLayout to be sure.
                    */}
                    <div className={cn("p-8 transition-all duration-500", isCollapsed && "px-6")}>
                        <div
                            className="flex items-center gap-3 cursor-pointer group"
                            onClick={() => setIsCollapsed(!isCollapsed)}
                            title={isCollapsed ? "Expandir Menu" : "Recolher Menu"}
                        >
                            <img
                                src="https://public.readdy.ai/ai/img_res/4ced1042-ca06-43d9-9c63-861d1f714373.png"
                                alt="SmartBar Logo"
                                className={cn("h-10 w-auto transition-all duration-500", isCollapsed ? "h-8" : "h-10")}
                            />
                            {!isCollapsed && (
                                <h1 className="text-xl font-bold tracking-tight animate-in fade-in slide-in-from-left-2 duration-300">
                                    Smart<span className="text-primary">Bar</span>
                                </h1>
                            )}
                        </div>
                    </div>

                    <nav className="flex-1 px-4 py-4 space-y-2 overflow-y-auto custom-scrollbar">
                        {navItems.map((item) => (
                            <Link
                                key={item.id}
                                to={item.path}
                                className={cn(
                                    "nav-item flex items-center gap-4 transition-all duration-300",
                                    isCollapsed && "justify-center px-0",
                                    location.pathname === item.path && "active"
                                )}
                                title={isCollapsed ? item.label : ""}
                            >
                                <item.icon className="w-5 h-5 shrink-0" />
                                {!isCollapsed && (
                                    <span className="font-medium animate-in fade-in slide-in-from-left-2 duration-300">{item.label}</span>
                                )}
                            </Link>
                        ))}

                        <div className="pt-4 mt-4 border-t border-white/10 relative">
                            <Link
                                to="/notifications"
                                className={cn(
                                    "nav-item w-full flex items-center gap-4 transition-all duration-300 relative",
                                    isCollapsed && "justify-center px-0",
                                    location.pathname === '/notifications' && "active"
                                )}
                                title={isCollapsed ? "Notificações" : ""}
                            >
                                <div className="relative">
                                    <Bell className="w-5 h-5 shrink-0" />
                                    {unreadCount > 0 && (
                                        <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-[#020617]" />
                                    )}
                                </div>
                                {!isCollapsed && (
                                    <div className="flex-1 flex justify-between items-center">
                                        <span className="font-medium">Notificações</span>
                                        {unreadCount > 0 && (
                                            <span className="bg-primary/20 text-primary text-[10px] font-black px-2 py-0.5 rounded-full">
                                                {unreadCount}
                                            </span>
                                        )}
                                    </div>
                                )}
                            </Link>
                        </div>

                        <div className="pt-4 mt-4 border-t border-white/10">
                            <Link
                                to="/pricing"
                                className={cn(
                                    "nav-item text-amber-400 hover:bg-amber-500/10 transition-all duration-300",
                                    isCollapsed && "justify-center px-0",
                                    location.pathname === '/pricing' && "active"
                                )}
                                title={isCollapsed ? "Planos Pro" : ""}
                            >
                                <CreditCard className="w-5 h-5 shrink-0" />
                                {!isCollapsed && (
                                    <span className="animate-in fade-in slide-in-from-left-2 duration-300">Planos Pro</span>
                                )}
                            </Link>
                        </div>
                    </nav>

                    <div className="p-4 border-t border-white/10 space-y-2">
                        <button
                            onClick={() => navigate('/settings')}
                            className={cn(
                                "nav-item w-full transition-all duration-300",
                                isCollapsed && "justify-center px-0",
                                location.pathname === '/settings' && "active"
                            )}
                            title={isCollapsed ? "Configurações" : ""}
                        >
                            <Settings className="w-5 h-5 shrink-0" />
                            {!isCollapsed && (
                                <span className="animate-in fade-in slide-in-from-left-2 duration-300">Configurações</span>
                            )}
                        </button>
                        <button
                            onClick={async () => {
                                await signOut();
                                navigate('/login', { replace: true });
                            }}
                            className={cn(
                                "nav-item w-full text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all duration-300",
                                isCollapsed && "justify-center px-0"
                            )}
                            title={isCollapsed ? "Sair" : ""}
                        >
                            <LogOut className="w-5 h-5 shrink-0" />
                            {!isCollapsed && (
                                <span className="animate-in fade-in slide-in-from-left-2 duration-300">Sair</span>
                            )}
                        </button>
                    </div>
                </aside>
            )}

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto p-8 relative custom-scrollbar">
                <div className="max-w-6xl mx-auto">
                    {children}
                </div>
            </main>
        </div>
    );
};

export default Layout;
