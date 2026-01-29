import { useState, useEffect } from 'react';
import {
    MessageSquare,
    Zap,
    Bell,
    Settings,
    ArrowRight,
    CheckCircle2,
    AlertTriangle,
    Send,
    Smartphone,
    Lock
} from 'lucide-react';
import AutomationModal from '../components/AutomationModal';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

const Automation = () => {
    const [activeTab, setActiveTab] = useState('triggers');
    const [testing, setTesting] = useState(false);
    const [selectedAutomation, setSelectedAutomation] = useState<any>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Icon mapping to avoid circular JSON (React components can't be stringified)
    const getAutomationIcon = (id: string, className = "") => {
        switch (id) {
            case 'stock': return <AlertTriangle className={cn("text-yellow-500", className)} />;
            case 'reservation': return <CheckCircle2 className={cn("text-green-500", className)} />;
            case 'feedback': return <MessageSquare className={cn("text-primary", className)} />;
            case 'events': return <Zap className={cn("text-secondary", className)} />;
            default: return <Bell className={className} />;
        }
    };

    // Initial automation data
    const [automations, setAutomations] = useState(() => {
        const saved = localStorage.getItem('smartbar_automations');
        if (saved) return JSON.parse(saved);
        return [
            {
                id: 'stock',
                title: "Alerta de Estoque Crítico",
                desc: "Enviar WhatsApp para o gerente quando um item atingir o estoque mínimo.",
                active: true,
                params: { threshold: 20, phone: '+55 11 99999-9999' }
            },
            {
                id: 'reservation',
                title: "Confirmação de Reserva",
                desc: "Mensagem automática 2h antes do horário agendado de um evento.",
                active: true,
                params: { hours: 2, template: 'Olá! Confirmando sua reserva no SmartBar em 2 horas.' }
            },
            {
                id: 'feedback',
                title: "Pesquisa de Satisfação",
                desc: "Disparar link de feedback 24h após um fechamento de conta alto.",
                active: true,
                params: { minValue: 200 }
            },
            {
                id: 'events',
                title: "Eventos Recorrentes",
                desc: "Notificar clientes sobre Happy Hour e eventos agendados.",
                active: true,
                params: {}
            },
        ];
    });

    useEffect(() => {
        localStorage.setItem('smartbar_automations', JSON.stringify(automations));
    }, [automations]);

    const handleTestTrigger = () => {
        setTesting(true);
        setTimeout(() => {
            setTesting(false);
            alert("Disparo de teste enviado via Evolution API! Patrick, sua instância Admin respondeu com sucesso.");
        }, 2000);
    };

    const toggleAutomation = (id: string) => {
        setAutomations(automations.map((a: any) =>
            a.id === id ? { ...a, active: !a.active } : a
        ));
    };

    const saveParams = (id: string, params: any) => {
        setAutomations(automations.map((a: any) =>
            a.id === id ? { ...a, params } : a
        ));
        alert("Parâmetros salvos com sucesso!");
    };

    return (
        <div className="space-y-4 lg:space-y-6">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 bg-white/5 p-4 lg:p-6 rounded-2xl lg:rounded-3xl border border-white/10 backdrop-blur-md">
                <div>
                    <h1 className="text-2xl lg:text-3xl font-black tracking-tighter text-white">Automação Inteligente</h1>
                    <div className="flex items-center gap-2 mt-1">
                        <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                        <p className="text-[10px] lg:text-xs text-primary font-black uppercase tracking-widest">Acesso Irrestrito (Patrick Admin)</p>
                    </div>
                </div>
                <div className="flex bg-white/5 p-1 rounded-xl lg:rounded-2xl border border-white/10 self-start md:self-auto">
                    <button
                        onClick={() => setActiveTab('triggers')}
                        className={`px-4 lg:px-6 py-2 lg:py-2.5 rounded-lg lg:rounded-xl text-[11px] lg:text-sm font-black transition-all ${activeTab === 'triggers' ? 'bg-primary text-white shadow-xl shadow-primary/30' : 'text-muted hover:text-white'}`}
                    >
                        Gatilhos Ativos
                    </button>
                    <button
                        onClick={() => setActiveTab('config')}
                        className={`px-4 lg:px-6 py-2 lg:py-2.5 rounded-lg lg:rounded-xl text-[11px] lg:text-sm font-black transition-all ${activeTab === 'config' ? 'bg-primary text-white shadow-xl shadow-primary/30' : 'text-muted hover:text-white'}`}
                    >
                        Gateway API
                    </button>
                </div>
            </div>

            {activeTab === 'triggers' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {automations.map((automation: any) => (
                        <AutomationCard
                            key={automation.id}
                            icon={getAutomationIcon(automation.id)}
                            title={automation.title}
                            desc={automation.desc}
                            active={automation.active}
                            onToggle={() => toggleAutomation(automation.id)}
                            onAdjust={() => {
                                setSelectedAutomation(automation);
                                setIsModalOpen(true);
                            }}
                        />
                    ))}
                </div>
            ) : (
                <div className="glass-card p-10 space-y-10">
                    <div className="flex items-center gap-8">
                        <div className="w-24 h-24 rounded-3xl bg-green-500/10 flex items-center justify-center border border-green-500/20 shadow-inner">
                            <Smartphone className="text-green-500 w-10 h-10" />
                        </div>
                        <div>
                            <h3 className="text-2xl font-black">Evolution API Engine</h3>
                            <p className="text-green-500 font-black flex items-center gap-2 text-sm uppercase tracking-widest mt-1">
                                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                                Instância Online: SmartBar_Patrick
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10 pt-10 border-t border-white/10">
                        <div className="space-y-6">
                            <h4 className="font-black flex items-center gap-2 text-white">
                                <Settings className="w-5 h-5 text-primary" />
                                Configurações do Gateway
                            </h4>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-muted uppercase tracking-widest pl-1">Instância WhatsApp</label>
                                <div className="bg-white/5 p-4 rounded-2xl border border-white/10 font-bold">SmartBar_Principal</div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-muted uppercase tracking-widest pl-1">API Token (Admin)</label>
                                <div className="flex gap-2">
                                    <div className="flex-1 bg-white/5 p-4 rounded-2xl border border-white/10 font-mono text-sm opacity-40 overflow-hidden">sk-ev-admin-********************</div>
                                    <button className="btn-outline p-4 rounded-2xl"><Lock className="w-4 h-4" /></button>
                                </div>
                            </div>
                        </div>

                        <div className="bg-primary/5 rounded-[40px] p-8 border border-primary/20 space-y-6 flex flex-col justify-center">
                            <div>
                                <h4 className="font-black text-xl mb-2">Simular Automação</h4>
                                <p className="text-sm text-muted leading-relaxed">
                                    Como administrador, você pode forçar um disparo de teste para validar os webhooks do n8n agora mesmo.
                                </p>
                            </div>
                            <button
                                onClick={handleTestTrigger}
                                disabled={testing}
                                className="w-full btn-primary py-4 flex items-center justify-center gap-3 font-black text-lg shadow-xl shadow-primary/30 rounded-2xl"
                            >
                                {testing ? 'Disparando...' : (
                                    <>
                                        <Send className="w-5 h-5" /> Enviar Mensagem Global
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <AutomationModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                automation={selectedAutomation}
                onSave={saveParams}
            />
        </div>
    );
};

const AutomationCard = ({ icon, title, desc, active, onToggle, onAdjust }: any) => (
    <div className={`glass-card p-8 border-l-4 transition-all group hover:-translate-y-1 hover:shadow-2xl hover:shadow-primary/5 ${active ? 'border-l-primary' : 'border-l-white/10'}`}>
        <div className="flex justify-between items-start mb-6">
            <div className="p-4 bg-white/5 rounded-2xl group-hover:bg-primary/10 transition-colors">
                {icon}
            </div>
            <button
                onClick={onToggle}
                className={`relative inline-flex items-center h-7 rounded-full w-14 transition-colors ${active ? 'bg-primary ring-4 ring-primary/20 shadow-lg shadow-primary/20' : 'bg-white/10'}`}
            >
                <span className={`inline-block w-5 h-5 transform transition-transform bg-white rounded-full shadow-lg ${active ? 'translate-x-8' : 'translate-x-1'}`} />
            </button>
        </div>
        <h3 className="text-xl font-black mb-2 tracking-tight">{title}</h3>
        <p className="text-sm text-muted leading-relaxed mb-8">{desc}</p>
        <button
            onClick={onAdjust}
            className="text-xs font-black flex items-center gap-2 group-hover:text-primary transition-colors uppercase tracking-widest"
        >
            Ajustar Parâmetros
            <ArrowRight className="w-4 h-4" />
        </button>
    </div>
);

export default Automation;
