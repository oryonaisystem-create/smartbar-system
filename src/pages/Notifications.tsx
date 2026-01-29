import React, { useState, useEffect } from 'react';
import { Bell, Check, Filter, Search, Package, Calendar, BarChart3, Clock, Trash2 } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

import { useNotifications } from '../context/NotificationContext';
import { useViewport } from '../hooks/useViewport';
import MobileCard from '../components/mobile/MobileCard';

const Notifications = () => {
    const { isMobile } = useViewport();
    const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');
    const [search, setSearch] = useState('');

    const {
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
        deleteNotification
    } = useNotifications();

    const filteredNotifications = notifications.filter(n => {
        const matchesFilter = filter === 'all' ? true : filter === 'unread' ? !n.read : n.read;
        const matchesSearch = n.text.toLowerCase().includes(search.toLowerCase()) || n.type.toLowerCase().includes(search.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    return (
        <div className="space-y-10 animate-in fade-in duration-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black text-white tracking-tighter mb-2 italic">Central de <span className="text-primary italic">Notificações</span></h1>
                    <p className="text-muted font-medium">Gerencie alertas de estoque, agenda e sistema em um só lugar.</p>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={markAllAsRead}
                        className="btn-outline px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2"
                    >
                        <Check className="w-4 h-4" /> Marcar todas como lidas
                    </button>
                </div>
            </div>

            <div className="bg-white/[0.02] border border-white/5 rounded-[40px] p-8">
                <div className="flex flex-col md:flex-row gap-6 mb-8 justify-between">
                    <div className="flex bg-white/5 p-1.5 rounded-2xl w-fit">
                        <button
                            onClick={() => setFilter('all')}
                            className={cn("px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all", filter === 'all' ? "bg-primary text-white shadow-lg" : "text-muted hover:text-white")}
                        >
                            Todas
                        </button>
                        <button
                            onClick={() => setFilter('unread')}
                            className={cn("px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all relative", filter === 'unread' ? "bg-primary text-white shadow-lg" : "text-muted hover:text-white")}
                        >
                            Não Lidas
                            {unreadCount > 0 && <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[9px] flex items-center justify-center border-2 border-[#020617]">{unreadCount}</span>}
                        </button>
                        <button
                            onClick={() => setFilter('read')}
                            className={cn("px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all", filter === 'read' ? "bg-primary text-white shadow-lg" : "text-muted hover:text-white")}
                        >
                            Lidas
                        </button>
                    </div>

                    <div className="relative max-w-sm w-full">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                        <input
                            type="text"
                            placeholder="Buscar notificações..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-12 pr-6 text-white text-xs outline-none focus:border-primary/50 transition-all font-medium"
                        />
                    </div>
                </div>

                <div className="space-y-4">
                    {filteredNotifications.length === 0 ? (
                        <div className="py-20 text-center">
                            <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center mx-auto mb-6 opacity-20">
                                <Bell className="w-10 h-10" />
                            </div>
                            <p className="text-muted font-black uppercase tracking-widest text-xs">Nenhum alerta encontrado</p>
                        </div>
                    ) : (
                        filteredNotifications.map(n => isMobile ? (
                            <MobileCard
                                key={n.id}
                                title={n.type}
                                subtitle={n.time}
                                description={n.text}
                                icon={n.icon}
                                className={cn(n.read && "opacity-60 grayscale-[0.5]")}
                                badge={!n.read ? { text: 'Novo', variant: 'primary' } : undefined}
                            >
                                <div className="flex gap-3 justify-end">
                                    {!n.read && (
                                        <button
                                            onClick={() => markAsRead(n.id)}
                                            className="px-4 py-2 bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest rounded-xl"
                                        >
                                            Marcar como lida
                                        </button>
                                    )}
                                    <button
                                        onClick={() => deleteNotification(n.id)}
                                        className="p-2 text-red-500/50 hover:text-red-500"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </MobileCard>
                        ) : (
                            <div
                                key={n.id}
                                className={cn(
                                    "p-6 rounded-[32px] border transition-all flex items-center justify-between group",
                                    n.read ? "bg-white/[0.01] border-white/5 opacity-60" : "bg-white/[0.03] border-white/10 shadow-lg"
                                )}
                            >
                                <div className="flex items-center gap-6">
                                    <div className={cn(
                                        "w-14 h-14 rounded-2xl flex items-center justify-center shadow-inner",
                                        n.read ? "bg-white/5" :
                                            n.type === 'Estoque' ? "bg-amber-500/10" :
                                                n.type === 'Financeiro' ? "bg-green-500/10" :
                                                    n.type === 'Agenda' ? "bg-blue-500/10" :
                                                        "bg-primary/10"
                                    )}>
                                        {n.type === 'Estoque' ? <Package className={cn("w-6 h-6", n.read ? "text-muted" : "text-amber-500")} /> :
                                            n.type === 'Financeiro' ? <BarChart3 className={cn("w-6 h-6", n.read ? "text-muted" : "text-green-500")} /> :
                                                n.type === 'Agenda' ? <Calendar className={cn("w-6 h-6", n.read ? "text-muted" : "text-blue-500")} /> :
                                                    <Bell className={cn("w-6 h-6", n.read ? "text-muted" : "text-primary")} />}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-3 mb-1">
                                            <span className={cn(
                                                "text-[10px] font-black uppercase tracking-widest",
                                                n.type === 'Estoque' ? "text-amber-500" :
                                                    n.type === 'Financeiro' ? "text-green-500" :
                                                        n.type === 'Agenda' ? "text-blue-500" :
                                                            "text-primary"
                                            )}>{n.type}</span>
                                            <span className="text-[10px] text-muted font-bold">•</span>
                                            <span className="text-[10px] text-muted font-bold font-mono">{n.time}</span>
                                            {!n.read && <span className="px-2 py-0.5 bg-red-500 text-white text-[8px] font-black uppercase rounded-full">Novo</span>}
                                        </div>
                                        <p className="text-sm text-white/90 font-medium max-w-xl">{n.text}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                    {!n.read && (
                                        <button
                                            onClick={() => markAsRead(n.id)}
                                            className="p-3 bg-primary/10 hover:bg-primary/20 text-primary rounded-xl transition-all"
                                            title="Marcar como lida"
                                        >
                                            <Check className="w-5 h-5" />
                                        </button>
                                    )}
                                    <button
                                        onClick={() => deleteNotification(n.id)}
                                        className="p-3 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-xl transition-all"
                                        title="Excluir"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default Notifications;
