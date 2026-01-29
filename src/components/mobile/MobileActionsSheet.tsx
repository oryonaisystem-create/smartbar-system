import React, { useState } from 'react';
import { X, Calendar, MessageSquare, BarChart3, Bell, Settings, LogOut, ChevronRight, User, Users, QrCode, ChefHat, UtensilsCrossed, CreditCard, Lock, ArrowLeft } from 'lucide-react';
import { useNavigate, NavLink } from 'react-router-dom';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { supabase } from '../../lib/supabase';
import { useNotifications } from '../../context/NotificationContext';
import { useAuth } from '../../context/AuthContext';
import { usePlan } from '../../context/PlanContext';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface MobileActionsSheetProps {
    isOpen: boolean;
    onClose: () => void;
}

const MobileActionsSheet = ({ isOpen, onClose }: MobileActionsSheetProps) => {
    const navigate = useNavigate();
    const { unreadCount } = useNotifications();
    const { signOut } = useAuth();
    const { isFeatureLocked } = usePlan();

    const handleLogout = async () => {
        await signOut();
        navigate('/login', { replace: true });
        onClose();
    };

    const actionItems = [
        { path: '/kitchen', icon: ChefHat, label: '👨‍🍳 Cozinha & Pedidos' },
        { path: '/menu-manager', icon: UtensilsCrossed, label: '🍽️ Gerenciar Cardápio' },
        { path: '/team', icon: Users, label: '👥 Gestão de Equipe' },
        { path: '/tables', icon: QrCode, label: '📍 Controle de Mesas' },
        { path: '/reports', icon: BarChart3, label: '📊 Relatórios & Lucro' },
        { path: '/agenda', icon: Calendar, label: '📅 Agenda & Reservas', lock: isFeatureLocked('agenda') },
        { path: '/automation', icon: MessageSquare, label: '🤖 Automação Webhook', lock: isFeatureLocked('automacao') },
        { path: '/pricing', icon: CreditCard, label: '💎 Planos & Pro' },
        { path: '/settings', icon: Settings, label: '⚙️ Configurações' },
    ];

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] animate-in fade-in duration-300">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />

            {/* Sheet */}
            <div className="absolute bottom-0 left-0 right-0 bg-[#0f172a]/95 backdrop-blur-2xl border-t border-white/10 rounded-t-[40px] p-8 pb-12 animate-in slide-in-from-bottom duration-500">
                <div className="w-12 h-1.5 bg-white/10 rounded-full mx-auto mb-8" onClick={onClose} />

                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20">
                            <User className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                            <h3 className="text-white font-black uppercase text-sm tracking-widest">Patrick Admin</h3>
                            <p className="text-muted text-[10px] font-bold">SMARTBAR OWNER</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 bg-white/5 rounded-full text-muted">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-6">
                    {actionItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            onClick={onClose}
                            className={({ isActive }) => cn(
                                "flex flex-col items-center justify-center p-4 rounded-2xl border transition-all active:scale-95 group relative overflow-hidden",
                                isActive
                                    ? "bg-primary/10 border-primary/20 text-primary"
                                    : "bg-white/5 border-white/5 text-muted hover:bg-white/10 hover:text-white"
                            )}
                        >
                            {item.lock && (
                                <div className="absolute top-2 right-2">
                                    <Lock className="w-3 h-3 text-amber-500 opacity-70" />
                                </div>
                            )}

                            <item.icon className={cn(
                                "w-6 h-6 mb-2 transition-colors",
                                item.lock ? "text-muted opacity-50" : "group-hover:text-primary"
                            )} />

                            <span className="text-[10px] font-black uppercase tracking-widest text-center leading-tight">
                                {item.label.replace(/[\uD800-\uDBFF][\uDC00-\uDFFF]\s/g, '')} {/* Remove emojis for cleaner grid */}
                            </span>

                            {item.lock && (
                                <span className="mt-1 text-[8px] font-bold text-amber-500 bg-amber-500/10 px-1.5 py-0.5 rounded-full uppercase tracking-tighter border border-amber-500/20">
                                    Pro
                                </span>
                            )}
                        </NavLink>
                    ))}
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 flex items-center justify-center gap-2 p-4 bg-white/5 border border-white/10 rounded-2xl text-white font-black uppercase text-xs tracking-widest hover:bg-white/10 active:scale-95 transition-all"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Voltar
                    </button>

                    <button
                        onClick={handleLogout}
                        className="flex-1 flex items-center justify-center gap-2 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-500 font-black uppercase text-xs tracking-widest hover:bg-red-500/20 active:scale-95 transition-all"
                    >
                        <LogOut className="w-4 h-4" />
                        Sair
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MobileActionsSheet;
