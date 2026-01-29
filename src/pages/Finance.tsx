import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import {
    Receipt,
    Plus,
    ArrowUpCircle,
    ArrowDownCircle,
    DollarSign,
    TrendingUp,
    PieChart
} from 'lucide-react';
import { TransactionModal } from '../components/TransactionModal';

const Finance = () => {
    const [transactions, setTransactions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedTransaction, setSelectedTransaction] = useState<any>(null);

    const fetchTransactions = async () => {
        setLoading(true);
        console.log('📊 Finance: Fetching transactions...');

        const { data, error } = await supabase
            .from('transactions')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(20);

        if (error) {
            console.error('📊 Finance: Error fetching transactions:', error);
        } else {
            console.log('📊 Finance: Fetched', data?.length, 'transactions', data);
            setTransactions(data || []);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchTransactions();

        // Subscribe to realtime changes on transactions table
        console.log('📊 Finance: Setting up realtime subscription...');
        const channel = supabase
            .channel('finance-realtime')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'transactions' },
                (payload) => {
                    console.log('📊 Finance: Realtime update received', payload);
                    fetchTransactions();
                }
            )
            .subscribe((status, err) => {
                console.log('📊 Finance: Realtime status:', status);
                if (err) console.error('📊 Finance: Realtime error:', err);
            });

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    const handleEditTransaction = (transaction: any) => {
        setSelectedTransaction(transaction);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedTransaction(null);
    };

    const totalSales = transactions
        .filter(t => t.type === 'sale')
        .reduce((acc, t) => acc + t.total_amount, 0);

    const totalExpenses = transactions
        .filter(t => t.type === 'expense')
        .reduce((acc, t) => acc + t.total_amount, 0);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Financeiro</h1>
                    <p className="text-muted">Fluxo de caixa e gestão de lucros</p>
                </div>
                <button
                    onClick={() => {
                        setSelectedTransaction(null);
                        setIsModalOpen(true);
                    }}
                    className="btn-primary flex items-center gap-2"
                >
                    <Plus className="w-5 h-5" /> Nova Transação
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="glass-card p-6 border-green-500/20 bg-green-500/5">
                    <div className="flex justify-between items-start">
                        <div className="p-2 bg-green-500/10 rounded-xl">
                            <TrendingUp className="text-green-500 w-6 h-6" />
                        </div>
                    </div>
                    <div className="mt-4">
                        <p className="text-muted text-sm font-medium">Entradas (Recente)</p>
                        <h3 className="text-2xl font-bold mt-1 text-green-500">R$ {totalSales.toFixed(2)}</h3>
                    </div>
                </div>
                <div className="glass-card p-6 border-red-500/20 bg-red-500/5">
                    <div className="flex justify-between items-start">
                        <div className="p-2 bg-red-500/10 rounded-xl">
                            <ArrowDownCircle className="text-red-500 w-6 h-6" />
                        </div>
                    </div>
                    <div className="mt-4">
                        <p className="text-muted text-sm font-medium">Despesas (Recente)</p>
                        <h3 className="text-2xl font-bold mt-1 text-red-500">R$ {totalExpenses.toFixed(2)}</h3>
                    </div>
                </div>
                <div className="glass-card p-6 border-primary/20 bg-primary/5">
                    <div className="flex justify-between items-start">
                        <div className="p-2 bg-primary/10 rounded-xl">
                            <DollarSign className="text-primary w-6 h-6" />
                        </div>
                    </div>
                    <div className="mt-4">
                        <p className="text-muted text-sm font-medium">Saldo Líquido</p>
                        <h3 className="text-2xl font-bold mt-1">R$ {(totalSales - totalExpenses).toFixed(2)}</h3>
                    </div>
                </div>
            </div>

            <div className="glass-card overflow-hidden">
                <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5">
                    <h3 className="font-bold flex items-center gap-2">
                        <Receipt className="text-muted w-5 h-5" />
                        Últimas Movimentações
                    </h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-white/5 text-xs font-bold text-muted uppercase tracking-wider border-b border-white/10">
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Data</th>
                                <th className="px-6 py-4">Método</th>
                                <th className="px-6 py-4 text-right">Valor</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {loading ? (
                                <tr><td colSpan={4} className="px-6 py-10 text-center text-muted">Carregando...</td></tr>
                            ) : transactions.length === 0 ? (
                                <tr><td colSpan={4} className="px-6 py-10 text-center text-muted">Nenhuma transação registrada.</td></tr>
                            ) : transactions.map(t => (
                                <tr key={t.id} className="hover:bg-white/5 transition-colors group">
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${t.type === 'sale' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                                            {t.type === 'sale' ? <ArrowUpCircle className="w-3 h-3" /> : <ArrowDownCircle className="w-3 h-3" />}
                                            {t.type === 'sale' ? 'Venda' : 'Despesa'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-muted">
                                        <div className="flex flex-col">
                                            <span>{new Date(t.created_at).toLocaleString('pt-BR')}</span>
                                            {t.operator && <span className="text-xs text-primary">{t.operator}</span>}
                                            {t.updated_by && <span className="text-[10px] text-orange-400 italic">Edit: {t.updated_by}</span>}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm font-medium">
                                        {t.payment_method}
                                    </td>
                                    <td className={`px-6 py-4 text-right font-bold flex items-center justify-end gap-3 ${t.type === 'sale' ? 'text-green-500' : 'text-red-500'}`}>
                                        <span>{t.type === 'sale' ? '+' : '-'} R$ {t.total_amount.toFixed(2)}</span>
                                        <button
                                            onClick={() => handleEditTransaction(t)}
                                            className="p-1.5 bg-white/5 hover:bg-white/20 text-muted hover:text-white rounded-lg transition-all opacity-0 group-hover:opacity-100"
                                            title="Editar"
                                        >
                                            <Receipt className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <TransactionModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                onSave={fetchTransactions}
                transaction={selectedTransaction}
            />
        </div>
    );
};

export default Finance;
