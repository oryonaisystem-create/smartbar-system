import { useState, useEffect } from 'react';
import { QrCode, Plus, Trash2, ExternalLink, Printer } from 'lucide-react';

interface TableConfig {
    id: string;
    number: string;
    url: string;
}

export default function Tables() {
    const [tables, setTables] = useState<TableConfig[]>([]);
    const [newTableNumber, setNewTableNumber] = useState('');

    useEffect(() => {
        const saved = localStorage.getItem('smartbar_tables');
        if (saved) {
            setTables(JSON.parse(saved));
        }
    }, []);

    const saveTables = (newTables: TableConfig[]) => {
        setTables(newTables);
        localStorage.setItem('smartbar_tables', JSON.stringify(newTables));
    };

    const addTable = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTableNumber) return;

        if (tables.some(t => t.number === newTableNumber)) {
            alert('Mesa já cadastrada!');
            return;
        }

        const baseUrl = window.location.origin;
        const newTable: TableConfig = {
            id: crypto.randomUUID(),
            number: newTableNumber,
            url: `${baseUrl}/menu?table=${newTableNumber}` // We need to update PublicMenu to read this param if we want auto-fill
        };

        saveTables([...tables, newTable].sort((a, b) => parseInt(a.number) - parseInt(b.number)));
        setNewTableNumber('');
    };

    const removeTable = (id: string) => {
        if (confirm('Remover esta mesa?')) {
            saveTables(tables.filter(t => t.id !== id));
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-20">
            <div>
                <h1 className="text-3xl font-black text-white tracking-tighter flex items-center gap-3">
                    <QrCode className="w-8 h-8 text-primary" />
                    Gestão de Mesas
                </h1>
                <p className="text-muted text-sm mt-1">Cadastre mesas e gere QR Codes para o Cardápio Digital.</p>
            </div>

            {/* Add Table Form */}
            <div className="glass-card p-6 border border-white/5">
                <form onSubmit={addTable} className="flex gap-4 items-end">
                    <div className="space-y-2 flex-1 max-w-xs">
                        <label className="text-[10px] font-black uppercase tracking-widest text-muted block">Número da Mesa</label>
                        <input
                            type="number"
                            placeholder="Ex: 10"
                            value={newTableNumber}
                            onChange={(e) => setNewTableNumber(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white outline-none focus:ring-2 focus:ring-primary/50 transition-all font-bold"
                        />
                    </div>
                    <button
                        type="submit"
                        className="btn-primary h-[50px] px-8 rounded-xl font-black uppercase tracking-widest flex items-center gap-2 hover:scale-105 active:scale-95 transition-all"
                    >
                        <Plus className="w-5 h-5" />
                        Adicionar
                    </button>
                </form>
            </div>

            {/* Tables Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {tables.map(table => (
                    <div key={table.id} className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 flex flex-col items-center text-center relative group hover:bg-white/[0.05] transition-all">
                        <button
                            onClick={() => removeTable(table.id)}
                            className="absolute top-4 right-4 text-muted hover:text-red-500 p-2 opacity-0 group-hover:opacity-100 transition-all"
                            title="Remover Mesa"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>

                        <div className="w-16 h-16 bg-white rounded-xl mb-4 p-2 flex items-center justify-center">
                            {/* In a real app we would use a QRCode library here. For now, a placeholder icon or simulated code */}
                            <QrCode className="w-12 h-12 text-black" />
                        </div>

                        <h3 className="text-2xl font-black text-white mb-1">Mesa {table.number}</h3>
                        <p className="text-xs text-muted mb-6 break-all line-clamp-1">{table.url}</p>

                        <div className="flex gap-2 w-full">
                            <a
                                href={table.url}
                                target="_blank"
                                className="flex-1 py-2 bg-primary/10 text-primary rounded-lg text-xs font-bold uppercase hover:bg-primary hover:text-white transition-all flex items-center justify-center gap-2"
                            >
                                <ExternalLink className="w-3 h-3" />
                                Testar
                            </a>
                            <button
                                onClick={() => {
                                    // Simulated print or download
                                    window.open(`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(table.url)}`, '_blank');
                                }}
                                className="flex-1 py-2 bg-white/5 text-white rounded-lg text-xs font-bold uppercase hover:bg-white/10 transition-all flex items-center justify-center gap-2"
                            >
                                <Printer className="w-3 h-3" />
                                Imprimir
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
