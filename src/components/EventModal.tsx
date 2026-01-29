import React, { useState } from 'react';
import { X, Save, Calendar, Clock, Type, Sparkles } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface EventModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: () => void;
}

export const EventModal = ({ isOpen, onClose, onSave }: EventModalProps) => {
    const [formData, setFormData] = useState({
        title: '',
        start_date: '',
        end_date: '',
        type: 'EVENTO',
        cost: 0,
    });
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const { error } = await supabase
                .from('events')
                .insert([formData]);

            if (error) throw error;

            onSave();
            onClose();
        } catch (error: any) {
            alert(`Erro ao agendar evento: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="glass-card w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <Sparkles className="text-secondary w-5 h-5" />
                        Novo Evento / Reserva
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors text-muted hover:text-white">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="text-sm font-medium text-muted mb-1.5 block">Título ou Nome do Evento</label>
                        <div className="relative">
                            <Type className="absolute left-3 top-1/2 -translate-y-1/2 text-muted/50 w-4 h-4" />
                            <input
                                required
                                type="text"
                                placeholder="Ex: Noite Sertaneja com DJ Patrick"
                                className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 focus:ring-2 focus:ring-secondary/50 outline-none transition-all"
                                value={formData.title}
                                onChange={e => setFormData({ ...formData, title: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm font-medium text-muted mb-1.5 block">Início</label>
                            <div className="relative">
                                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-muted/50 w-4 h-4" />
                                <input
                                    required
                                    type="datetime-local"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 focus:ring-2 focus:ring-secondary/50 outline-none transition-all text-sm"
                                    value={formData.start_date}
                                    onChange={e => setFormData({ ...formData, start_date: e.target.value })}
                                />
                            </div>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-muted mb-1.5 block">Término</label>
                            <div className="relative">
                                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted/50 w-4 h-4" />
                                <input
                                    required
                                    type="datetime-local"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 focus:ring-2 focus:ring-secondary/50 outline-none transition-all text-sm"
                                    value={formData.end_date}
                                    onChange={e => setFormData({ ...formData, end_date: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm font-medium text-muted mb-1.5 block">Tipo</label>
                            <select
                                className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-4 focus:ring-2 focus:ring-secondary/50 outline-none transition-all appearance-none"
                                value={formData.type}
                                onChange={e => setFormData({ ...formData, type: e.target.value })}
                            >
                                <option value="EVENTO" className="bg-background">Evento Especial</option>
                                <option value="RESERVA" className="bg-background">Reserva de Mesa</option>
                                <option value="SHOW" className="bg-background">Show / Banda</option>
                                <option value="DJ" className="bg-background">Set de DJ</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-muted mb-1.5 block">Custo Estimado (Opcional)</label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted/50 text-sm">R$</span>
                                <input
                                    type="number"
                                    step="0.01"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 focus:ring-2 focus:ring-secondary/50 outline-none transition-all"
                                    value={formData.cost || ''}
                                    onChange={e => setFormData({ ...formData, cost: parseFloat(e.target.value) })}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="pt-4 flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 btn-outline py-3"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 bg-secondary text-white rounded-xl font-bold py-3 hover:bg-secondary/80 flex items-center justify-center gap-2 transition-all shadow-lg shadow-secondary/20"
                        >
                            {loading ? 'Agendando...' : (
                                <>
                                    <Calendar className="w-5 h-5" />
                                    Confirmar Agenda
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
