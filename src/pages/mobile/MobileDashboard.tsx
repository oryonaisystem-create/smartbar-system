import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import {
    DollarSign, TrendingUp, ShoppingCart, Users,
    AlertCircle, ArrowUpRight, ArrowDownRight, Package,
    Zap, ChevronRight, Loader2, Lock
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import MobileCard from '../../components/mobile/MobileCard';
import { useCashier } from '../../context/CashierContext';
import { CashierManager } from '../../components/CashierManager';
import { useAuth } from '../../context/AuthContext';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface DashboardStats {
    todaySales: number;
    todayProfit: number;
    itemsSold: number;
    transactionCount: number;
}

const MobileDashboard = () => {
    const navigate = useNavigate();
    const { currentSession, loading: loadingCashier } = useCashier();
    const { role } = useAuth();
    const [showCashierManager, setShowCashierManager] = useState(false);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<DashboardStats>({
        todaySales: 0,
        todayProfit: 0,
        itemsSold: 0,
        transactionCount: 0
    });
    const [stockAlerts, setStockAlerts] = useState<any[]>([]);

    const fetchDashboardData = async () => {
        setLoading(true);

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayISO = today.toISOString();

        // Fetch today's transactions
        const { data: transactions } = await supabase
            .from('transactions')
            .select('*')
            .gte('created_at', todayISO)
            .eq('type', 'sale');

        // Fetch transaction items
        const { data: txItems } = await supabase
            .from('transaction_items')
            .select('*, transactions!inner(*)')
            .gte('transactions.created_at', todayISO);

        // Fetch low stock products
        const { data: allProducts } = await supabase
            .from('products')
            .select('*')
            .order('stock_quantity', { ascending: true });

        const alertProducts = allProducts?.filter(p => p.stock_quantity <= p.min_stock_alert).slice(0, 3) || [];

        // Calculate stats
        const todaySales = transactions?.reduce((acc, t) => acc + (t.total_amount || 0), 0) || 0;
        const itemsSold = txItems?.reduce((acc, i) => acc + (i.quantity || 0), 0) || 0;
        const todayProfit = txItems?.reduce((acc, i) => {
            const profit = ((i.unit_price || 0) - (i.unit_cost || 0)) * (i.quantity || 0);
            return acc + profit;
        }, 0) || 0;

        setStats({
            todaySales,
            todayProfit,
            itemsSold,
            transactionCount: transactions?.length || 0
        });

        setStockAlerts(alertProducts);
        setLoading(false);
    };

    useEffect(() => {
        fetchDashboardData();

        // Subscribe to realtime changes
        const channel = supabase
            .channel('mobile-dashboard-realtime')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'transactions' },
                () => fetchDashboardData()
            )
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'products' },
                () => fetchDashboardData()
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    const statsCards = [
        {
            title: "Vendas hoje",
            value: loading ? "..." : `R$ ${stats.todaySales.toFixed(2)}`,
            icon: <DollarSign className="w-5 h-5 text-primary" />,
            path: "/reports"
        },
        {
            title: "Lucro Bruto",
            value: loading ? "..." : `R$ ${stats.todayProfit.toFixed(2)}`,
            icon: <TrendingUp className="w-5 h-5 text-green-500" />,
            path: "/finance"
        },
        {
            title: "Itens Saídos",
            value: loading ? "..." : stats.itemsSold.toString(),
            icon: <ShoppingCart className="w-5 h-5 text-yellow-500" />,
            path: "/inventory"
        },
        {
            title: "Transações",
            value: loading ? "..." : stats.transactionCount.toString(),
            icon: <Users className="w-5 h-5 text-blue-500" />,
            path: "/reports"
        },
    ];

    return (
        <div className="flex flex-col gap-6 animate-in fade-in duration-500 pb-24">
            {/* Operational Banner (Cashier) */}
            <div className={cn(
                "p-5 rounded-[32px] border flex items-center justify-between transition-all shadow-lg",
                currentSession
                    ? "bg-green-500/10 border-green-500/20"
                    : "bg-red-500/10 border-red-500/20"
            )}>
                <div className="flex items-center gap-4">
                    <div className={cn(
                        "w-12 h-12 rounded-2xl flex items-center justify-center border shadow-inner",
                        currentSession ? "bg-green-500/20 border-green-500/30" : "bg-red-500/20 border-red-500/30"
                    )}>
                        {currentSession ? <Zap className="w-6 h-6 text-green-500 fill-green-500/50" /> : <Lock className="w-6 h-6 text-red-500" />}
                    </div>
                    <div>
                        <h3 className="text-white font-black uppercase text-xs tracking-widest leading-none">
                            {currentSession ? 'Caixa Aberto' : 'Caixa Fechado'}
                        </h3>
                        {currentSession ? (
                            <p className="text-green-500/70 text-[10px] font-bold mt-1">Por: {currentSession.opened_by}</p>
                        ) : (
                            <p className="text-red-500/70 text-[10px] font-bold mt-1">Operão Bloqueada</p>
                        )}
                    </div>
                </div>
                <button
                    onClick={() => setShowCashierManager(true)}
                    className={cn(
                        "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 shadow-md",
                        currentSession ? "bg-red-500 text-white" : "bg-green-500 text-white"
                    )}
                >
                    {currentSession ? 'Fechar' : 'Abrir'}
                </button>
            </div>

            {/* KPI Section */}
            <div>
                <div className="flex items-center justify-between mb-3 px-2">
                    <h3 className="text-white/80 font-black uppercase text-[11px] tracking-[0.2em]">
                        Desempenho <span className="text-primary italic">Hoje</span>
                        {!loading && <span className="text-green-500 ml-2">⚡</span>}
                    </h3>
                    <button onClick={() => navigate('/reports')} className="text-primary font-black uppercase text-[9px] tracking-widest flex items-center gap-1 opacity-80 hover:opacity-100">
                        Ver Tudo <ChevronRight className="w-3 h-3" />
                    </button>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                    {statsCards.map((stat, i) => (
                        <MobileCard
                            key={i}
                            title={stat.title}
                            value={stat.value}
                            icon={stat.icon}
                            className="bg-white/[0.04]"
                            onClick={() => stat.path && navigate(stat.path)}
                        />
                    ))}
                </div>
            </div>

            {/* Critical Alerts */}
            <div>
                <div className="flex items-center gap-3 mb-3 px-2">
                    <AlertCircle className="w-4 h-4 text-yellow-500" />
                    <h3 className="text-white/80 font-black uppercase text-[11px] tracking-[0.2em]">Alertas de <span className="text-yellow-500 italic">Estoque</span></h3>
                </div>

                <div className="space-y-2.5">
                    {loading ? (
                        <div className="flex items-center justify-center py-10">
                            <Loader2 className="w-6 h-6 animate-spin text-primary" />
                        </div>
                    ) : stockAlerts.length === 0 ? (
                        <p className="text-center text-muted py-6 text-xs">
                            ✅ Estoque em níveis normais!
                        </p>
                    ) : (
                        stockAlerts.map((alert, i) => {
                            const isCritical = alert.stock_quantity <= alert.min_stock_alert / 2;
                            return (
                                <div
                                    key={alert.id || i}
                                    onClick={() => navigate('/inventory')}
                                    className="p-3 bg-white/[0.04] border border-white/10 rounded-2xl flex items-center justify-between active:scale-[0.98] transition-all shadow-sm"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={cn(
                                            "w-9 h-9 rounded-xl flex items-center justify-center border shadow-inner",
                                            isCritical ? "bg-red-500/10 border-red-500/20" : "bg-yellow-500/10 border-yellow-500/20"
                                        )}>
                                            <Package className={cn(
                                                "w-4 h-4",
                                                isCritical ? "text-red-500" : "text-yellow-500"
                                            )} />
                                        </div>
                                        <div className="min-w-0">
                                            <h4 className="text-white font-bold uppercase text-[10px] tracking-widest truncate">{alert.name}</h4>
                                            <p className="text-muted/80 text-[9px] font-medium mt-0.5">{alert.stock_quantity} un. restantes</p>
                                        </div>
                                    </div>
                                    <span className={cn(
                                        "text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border shrink-0",
                                        isCritical ? "text-red-500 bg-red-500/10 border-red-500/10" : "text-yellow-500 bg-yellow-500/10 border-yellow-500/10"
                                    )}>
                                        {isCritical ? 'Crítico' : 'Baixo'}
                                    </span>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>

            {/* Cashier Manager Modal */}
            <CashierManager
                isOpen={showCashierManager}
                onClose={() => setShowCashierManager(false)}
            />
        </div>
    );
};

export default MobileDashboard;
