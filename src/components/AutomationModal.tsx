import React, { useState, useEffect } from 'react';
import { X, Save, Bell, Smartphone, Clock, Settings, Package, Percent, AlertTriangle, CheckCircle2, MessageSquare, Zap } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface AutomationModalProps {
    isOpen: boolean;
    onClose: () => void;
    automation: {
        id: string;
        title: string;
        params: any;
    } | null;
    onSave: (id: string, newParams: any) => void;
}

const AutomationModal = ({ isOpen, onClose, automation, onSave }: AutomationModalProps) => {
    const [params, setParams] = useState<any>({});

    // Generate icon based on automation id
    const getAutomationIcon = (id: string, className = "w-6 h-6") => {
        switch (id) {
            case 'stock': return <AlertTriangle className={cn("text-yellow-500", className)} />;
            case 'reservation': return <CheckCircle2 className={cn("text-green-500", className)} />;
            case 'feedback': return <MessageSquare className={cn("text-primary", className)} />;
            case 'events': return <Zap className={cn("text-secondary", className)} />;
            default: return <Bell className={className} />;
        }
    };

    useEffect(() => {
        if (automation) {
            setParams(automation.params || {});
        }
    }, [automation]);

    if (!isOpen || !automation) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="glass-card w-full max-w-lg p-8 border-white/10 shadow-3xl animate-in zoom-in-95 duration-300">
                <div className="flex justify-between items-start mb-8">
                    <div className="flex items-center gap-4">
                        <div className="p-4 bg-primary/10 rounded-2xl text-primary">
                            {getAutomationIcon(automation.id)}
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-white">Ajustar Parâmetros</h2>
                            <p className="text-muted text-sm">{automation.title}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-xl transition-colors">
                        <X className="w-6 h-6 text-muted" />
                    </button>
                </div>

                <div className="space-y-6">
                    {automation.id === 'stock' && (
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-muted tracking-widest pl-1">Limite Crítico (%)</label>
                                <div className="relative">
                                    <Percent className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                                    <input
                                        type="number"
                                        value={params.threshold || 20}
                                        onChange={(e) => setParams({ ...params, threshold: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-primary/50 outline-none transition-all"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-muted tracking-widest pl-1">WhatsApp do Gerente</label>
                                <div className="relative">
                                    <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                                    <input
                                        type="text"
                                        value={params.phone || '+55 11 99999-9999'}
                                        onChange={(e) => setParams({ ...params, phone: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-primary/50 outline-none transition-all"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {automation.id === 'reservation' && (
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-muted tracking-widest pl-1">Aviso Antecipado (Horas)</label>
                                <div className="relative">
                                    <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                                    <input
                                        type="number"
                                        value={params.hours || 2}
                                        onChange={(e) => setParams({ ...params, hours: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-primary/50 outline-none transition-all"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-muted tracking-widest pl-1">Template da Mensagem</label>
                                <textarea
                                    rows={3}
                                    value={params.template || 'Olá! Confirmando sua reserva no SmartBar em 2 horas.'}
                                    onChange={(e) => setParams({ ...params, template: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl p-4 focus:ring-2 focus:ring-primary/50 outline-none transition-all resize-none text-sm"
                                />
                            </div>
                        </div>
                    )}

                    {automation.id === 'feedback' && (
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-muted tracking-widest pl-1">Gatilho de Valor (R$)</label>
                                <input
                                    type="number"
                                    value={params.minValue || 200}
                                    onChange={(e) => setParams({ ...params, minValue: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl py-4 px-4 focus:ring-2 focus:ring-primary/50 outline-none transition-all"
                                />
                                <p className="text-[10px] text-muted italic">Enviar apenas para contas acima deste valor.</p>
                            </div>
                        </div>
                    )}

                    {(automation.id === 'events' || automation.id === 'feedback') && !automation.id.includes('stock') && (
                        <div className="p-4 bg-primary/5 rounded-2xl border border-primary/20 flex gap-3">
                            <Settings className="w-5 h-5 text-primary shrink-0" />
                            <p className="text-xs text-muted leading-relaxed">
                                Os parâmetros para este gatilho são otimizados automaticamente pela IA baseada no fluxo de clientes histórico.
                            </p>
                        </div>
                    )}
                </div>

                <div className="mt-10 flex gap-4">
                    <button onClick={onClose} className="flex-1 btn-outline py-4 font-bold rounded-2xl">Cancelar</button>
                    <button
                        onClick={() => {
                            onSave(automation.id, params);
                            onClose();
                        }}
                        className="flex-1 btn-primary py-4 flex items-center justify-center gap-3 font-black text-lg shadow-xl shadow-primary/30 rounded-2xl"
                    >
                        <Save className="w-5 h-5" /> Salvar Regras
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AutomationModal;
