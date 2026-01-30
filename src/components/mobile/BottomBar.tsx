import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Zap, Package, Wallet, MoreHorizontal } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useNotifications } from '../../context/NotificationContext';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface BottomBarProps {
    onOpenMore: () => void;
    onOpenCashier: () => void;
}

const BottomBar = ({ onOpenMore, onOpenCashier }: BottomBarProps) => {
    const { unreadCount } = useNotifications();

    const navItems = [
        { path: '/', icon: LayoutDashboard, label: 'Home' },
        { path: '/pos', icon: Zap, label: 'PDV' },
        { path: '/inventory', icon: Package, label: 'Estoque' },
    ];

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 px-4 pb-6 pt-2 safe-area-bottom bg-gradient-to-t from-[#020617] via-[#020617]/95 to-transparent backdrop-blur-lg border-t border-white/5 pointer-events-auto">
            <nav className="flex items-center justify-between max-w-lg mx-auto bg-white/5 p-1 rounded-2xl border border-white/10 shadow-2xl backdrop-blur-2xl">
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) => cn(
                            "flex flex-col items-center justify-center py-2 px-1 flex-1 rounded-xl transition-all duration-300 relative",
                            isActive ? "text-primary bg-primary/10" : "text-muted hover:text-white"
                        )}
                    >
                        <item.icon className="w-5 h-5 mb-1" />
                        <span className="text-[9px] font-black uppercase tracking-tighter uppercase">{item.label}</span>
                    </NavLink>
                ))}

                <button
                    onClick={onOpenCashier}
                    className="flex flex-col items-center justify-center py-2 px-1 flex-1 rounded-xl text-muted hover:text-white transition-all duration-300 relative"
                >
                    <Wallet className="w-5 h-5 mb-1" />
                    <span className="text-[9px] font-black uppercase tracking-tighter uppercase">Caixa</span>
                </button>

                <button
                    onClick={onOpenMore}
                    className="flex flex-col items-center justify-center py-2 px-1 flex-1 rounded-xl text-muted transition-all duration-300 relative"
                >
                    <MoreHorizontal className="w-5 h-5 mb-1" />
                    <span className="text-[9px] font-black uppercase tracking-tighter uppercase">Mais</span>
                    {unreadCount > 0 && (
                        <span className="absolute top-2 right-4 w-4 h-4 bg-primary text-white text-[8px] flex items-center justify-center rounded-full border border-[#020617] font-black">
                            {unreadCount}
                        </span>
                    )}
                </button>
            </nav>
        </div>
    );
};

export default BottomBar;
