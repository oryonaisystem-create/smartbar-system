import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import {
    Calendar as CalendarIcon,
    Plus,
    Clock,
    MapPin,
    Sparkles,
    ChevronRight,
    Music,
    Users
} from 'lucide-react';
import { EventModal } from '../components/EventModal';

const Agenda = () => {
    const [events, setEvents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const fetchEvents = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('events')
            .select('*')
            .order('start_date', { ascending: true });

        if (!error && data) setEvents(data);
        setLoading(false);
    };

    useEffect(() => {
        fetchEvents();
    }, []);

    const getEventIcon = (type: string) => {
        switch (type) {
            case 'DJ': return <Music className="w-5 h-5 text-purple-400" />;
            case 'RESERVA': return <Users className="w-5 h-5 text-blue-400" />;
            case 'SHOW': return <Sparkles className="w-5 h-5 text-amber-400" />;
            default: return <CalendarIcon className="w-5 h-5 text-primary" />;
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-white">Agenda de Eventos</h1>
                    <p className="text-muted">Atrativos, DJs e Reservas de Mesas</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-secondary text-white font-bold py-2.5 px-6 rounded-xl hover:bg-secondary/80 flex items-center gap-2 transition-all shadow-lg shadow-secondary/20"
                >
                    <Plus className="w-5 h-5" /> Agendar Evento
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Próximos Eventos List */}
                <div className="lg:col-span-3 space-y-4">
                    {loading ? (
                        <div className="glass-card p-12 text-center text-muted">Carregando agenda...</div>
                    ) : events.length === 0 ? (
                        <div className="glass-card p-12 text-center space-y-4">
                            <CalendarIcon className="w-12 h-12 mx-auto text-muted opacity-20" />
                            <p className="text-muted">Nenhum evento agendado para os próximos dias.</p>
                            <button
                                onClick={() => setIsModalOpen(true)}
                                className="btn-outline"
                            >
                                Criar Primeiro Evento
                            </button>
                        </div>
                    ) : events.map(event => (
                        <div key={event.id} className="glass-card p-6 flex flex-col md:flex-row gap-6 hover:border-secondary/30 transition-all group">
                            <div className="md:w-32 flex flex-col items-center justify-center border-r border-white/10 pr-6">
                                <span className="text-3xl font-black text-secondary">
                                    {new Date(event.start_date).getDate()}
                                </span>
                                <span className="text-xs uppercase font-bold text-muted">
                                    {new Date(event.start_date).toLocaleString('pt-BR', { month: 'short' })}
                                </span>
                            </div>

                            <div className="flex-1 space-y-2">
                                <div className="flex items-center gap-2">
                                    {getEventIcon(event.type)}
                                    <span className="text-xs font-bold text-secondary tracking-widest uppercase">{event.type}</span>
                                </div>
                                <h3 className="text-xl font-bold group-hover:text-secondary transition-colors">{event.title}</h3>
                                <div className="flex flex-wrap gap-4 text-sm text-muted">
                                    <span className="flex items-center gap-1.5">
                                        <Clock className="w-4 h-4" />
                                        {new Date(event.start_date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                    <span className="flex items-center gap-1.5">
                                        <MapPin className="w-4 h-4" />
                                        Palco Principal
                                    </span>
                                </div>
                            </div>

                            <div className="flex items-center">
                                <button className="p-2 bg-white/5 rounded-full hover:bg-secondary/20 transition-colors">
                                    <ChevronRight className="w-6 h-6 text-muted group-hover:text-secondary" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Sidebar Info */}
                <div className="space-y-6">
                    <div className="glass-card p-6 bg-secondary/5 border-secondary/20">
                        <h4 className="font-bold flex items-center gap-2 mb-4">
                            <Sparkles className="w-5 h-5 text-secondary" />
                            Destaque do Mês
                        </h4>
                        <div className="relative rounded-xl overflow-hidden aspect-video bg-white/10 mb-4">
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-4">
                                <p className="font-bold text-sm">Noite do Gin & Tônica</p>
                            </div>
                        </div>
                        <p className="text-xs text-muted leading-relaxed">
                            Eventos com música ao vivo aumentam o faturamento médio em até 24%. Mantenha sua agenda sempre atualizada!
                        </p>
                    </div>
                </div>
            </div>

            <EventModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={fetchEvents}
            />
        </div>
    );
};

export default Agenda;
