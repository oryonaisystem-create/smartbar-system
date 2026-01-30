import { LoadingState } from '../components/ui/LoadingState';
import { ErrorMessage } from '../components/ui/ErrorMessage';

// ... (keep StatCard and StockAlertItem)

const Dashboard = () => {
    const navigate = useNavigate();
    const { isMobile } = useViewport();
    const { currentSession, loading: loadingCashier } = useCashier();
    const [showCashierManager, setShowCashierManager] = useState(false);
    const { role } = useAuth();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // ... stats state ...

    useEffect(() => {
        let mounted = true;

        const fetchDashboardData = async () => {
            if (!mounted) return;
            setLoading(true);
            setError(null);
            console.log('🔍 [Dashboard] Loading data...');

            try {
                // ... logic ...
                // Note: The original logic in fetchDashboardData was good (try/catch setting error).
                // I am strictly replacing the RENDER part in this MultiReplace, 
                // but I need to make sure I don't lose the fetch logic.
                // Wait, 'replace_file_content' replaces a block.
                // I need to be careful not to delete fetchDashboardData logic if I select a huge block.
                // I will use smaller chunks.
            }
         };
        // ...
    }, []);

    // ...
};

import { CashierManager } from '../components/CashierManager';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts';
import { useViewport } from '../hooks/useViewport';
import MobileDashboard from './mobile/MobileDashboard';

interface DashboardStats {
    todaySales: number;
    todayProfit: number;
    itemsSold: number;
    transactionCount: number;
}

const StatCard = ({ title, value, change, icon: Icon, trend, path, loading }: any) => {
    const navigate = useNavigate();
    return (
        <div
            onClick={() => path && navigate(path)}
            className={cn(
                "glass-card p-6 flex flex-col justify-between group hover:border-primary/50 transition-all",
                path ? "cursor-pointer hover:scale-[1.02]" : "cursor-default"
            )}
        >
            <div className="flex justify-between items-start">
                <div className="p-2 bg-white/5 rounded-xl group-hover:bg-primary/10 transition-colors">
                    <Icon className="w-6 h-6 text-muted group-hover:text-primary transition-colors" />
                </div>
                {change !== undefined && (
                    <div className={cn(
                        "flex items-center gap-1 text-sm font-medium px-2 py-1 rounded-full",
                        trend === 'up' ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"
                    )}>
                        {trend === 'up' ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                        {change}%
                    </div>
                )}
            </div>
            <div className="mt-4">
                <p className="text-muted text-sm font-medium">{title}</p>
                {loading ? (
                    <div className="flex items-center gap-2 mt-1">
                        <Loader2 className="w-5 h-5 animate-spin text-primary" />
                    </div>
                ) : (
                    <h3 className="text-3xl font-bold mt-1">{value}</h3>
                )}
            </div>
        </div>
    );
};

const StockAlertItem = ({ name, stock, min }: any) => {
    const navigate = useNavigate();
    return (
        <div
            onClick={() => navigate('/inventory')}
            className="flex items-center justify-between p-3 bg-white/5 rounded-2xl border border-white/10 group hover:bg-white/10 hover:border-primary/30 transition-all cursor-pointer"
        >
            <div>
                <p className="font-medium text-sm">{name}</p>
                <p className="text-xs text-muted">Mínimo: {min} un.</p>
            </div>
            <div className="text-right">
                <p className={cn(
                    "text-sm font-bold",
                    stock === 0 ? "text-red-500" : "text-yellow-500"
                )}>
                    {stock} un.
                </p>
                <p className="text-[10px] text-muted uppercase tracking-tighter">Estoque Atual</p>
            </div>
        </div>
    );
};

const Dashboard = () => {
    const navigate = useNavigate();
    const { isMobile } = useViewport();
    const { currentSession, loading: loadingCashier } = useCashier();
    const [showCashierManager, setShowCashierManager] = useState(false);
    const { role } = useAuth();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [stats, setStats] = useState<DashboardStats>({
        todaySales: 0,
        todayProfit: 0,
        itemsSold: 0,
        transactionCount: 0
    });
    const [stockAlerts, setStockAlerts] = useState<any[]>([]);
    const [chartData, setChartData] = useState<any[]>([]);

    useEffect(() => {
        let mounted = true; // A variável nasce dentro do useEffect

        const fetchDashboardData = async () => {
            if (!mounted) return;
            setLoading(true);
            setError(null);
            console.log('🔍 [Dashboard] Loading data...');

            try {
                const startOfDay = new Date();
                startOfDay.setHours(0, 0, 0, 0);
                const isoToday = startOfDay.toISOString();

                // For a more robust "today" including timezone shifts in DB, 
                // sometimes using just the date string is better for 'date' columns,
                // but for 'timestamptz' we use ISO.
                console.log('🔍 [Dashboard] Filtering from:', isoToday);

                // Busca Vendas, Itens e Produtos em paralelo
                // Simplificando busca de itens: buscamos todos os itens de transações do tipo 'sale' de hoje
                const [txRes, prodRes] = await Promise.all([
                    supabase.from('transactions').select('*').gte('created_at', isoToday).eq('type', 'sale'),
                    supabase.from('products').select('*').order('stock_quantity', { ascending: true })
                ]);

                if (txRes.error) throw txRes.error;
                if (prodRes.error) throw prodRes.error;

                const transactions = txRes.data || [];
                const allProducts = prodRes.data || [];

                // Agora buscamos os itens especificamente para as transações encontradas
                let txItems: any[] = [];
                if (transactions.length > 0) {
                    const txIds = transactions.map(t => t.id);
                    const { data: itemsData, error: itemsError } = await supabase
                        .from('transaction_items')
                        .select('*')
                        .in('transaction_id', txIds);

                    if (!itemsError && itemsData) {
                        txItems = itemsData;
                    }
                }

                // Cálculos de Stats
                const todaySales = transactions.reduce((acc, t) => acc + (t.total_amount || 0), 0);
                const itemsSold = txItems.reduce((acc, i) => acc + (i.quantity || 0), 0);
                const todayProfit = txItems.reduce((acc, i) => acc + (((i.unit_price || 0) - (i.unit_cost || 0)) * (i.quantity || 0)), 0);

                if (mounted) {
                    setStats({
                        todaySales,
                        todayProfit,
                        itemsSold,
                        transactionCount: transactions.length
                    });
                    setStockAlerts(allProducts.filter(p => p.stock_quantity <= p.min_stock_alert).slice(0, 5));

                    // Processamento de dados para o gráfico (Últimas 8h ou Horas do Dia)
                    const hourlyData: { [key: string]: number } = {};
                    transactions.forEach((t) => {
                        const hour = new Date(t.created_at).getHours();
                        hourlyData[`${hour}h`] = (hourlyData[`${hour}h`] || 0) + (t.total_amount || 0);
                    });

                    const currentHour = new Date().getHours();
                    const chartDataArray = [];
                    for (let i = 7; i >= 0; i--) {
                        const hour = (currentHour - i + 24) % 24;
                        chartDataArray.push({ name: `${hour}h`, sales: hourlyData[`${hour}h`] || 0 });
                    }
                    setChartData(chartDataArray);
                }
            } catch (err: any) {
                console.error('❌ [Dashboard] Error:', err);
                if (mounted) {
                    setError(err.message || 'Erro ao carregar dados do dashboard.');
                }
            } finally {
                if (mounted) setLoading(false);
            }
        };

        fetchDashboardData();

        // Realtime: Recarrega dados ao detectar mudanças nas tabelas
        const channel = supabase
            .channel('dashboard-realtime')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'transactions' }, () => {
                if (mounted) fetchDashboardData();
            })
            .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, () => {
                if (mounted) fetchDashboardData();
            })
            .subscribe();

        return () => {
            mounted = false; // A variável morre aqui (Cleanup)
            supabase.removeChannel(channel);
        };
    }, []);

    if (isMobile) {
        return <MobileDashboard />;
    }

    if (loading) return <LoadingState message="Atualizando painel..." />;
    if (error) return <ErrorMessage message={error} onRetry={() => window.location.reload()} />;

    return (
        <div className="space-y-6">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white/5 p-6 rounded-3xl border border-white/10 backdrop-blur-md gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-white">Dashboard Central</h1>
                    <p className="text-muted mt-1">Bem-vindo ao centro de comando do SmartBar.</p>
                </div>
                <div className="flex items-center gap-4">
                    {role === 'admin' && (
                        <div className="flex items-center gap-3 bg-black/20 p-1.5 rounded-xl border border-white/5">
                            <div className={cn(
                                "px-3 py-1.5 rounded-lg flex items-center gap-2 text-xs font-black uppercase tracking-wider transition-all",
                                currentSession ? "bg-green-500/20 text-green-500" : "bg-red-500/20 text-red-500"
                            )}>
                                {currentSession ? (
                                    <>
                                        <Store className="w-4 h-4" />
                                        Caixa Aberto
                                    </>
                                ) : (
                                    <>
                                        <Lock className="w-4 h-4" />
                                        Caixa Fechado
                                    </>
                                )}
                            </div>
                            <button
                                onClick={() => setShowCashierManager(true)}
                                className={cn(
                                    "px-4 py-1.5 rounded-lg text-xs font-bold uppercase transition-all hover:scale-105 active:scale-95",
                                    currentSession
                                        ? "bg-red-500 hover:bg-red-600 text-white"
                                        : "bg-green-500 hover:bg-green-600 text-white"
                                )}
                            >
                                {currentSession ? 'Fechar Caixa' : 'Abrir Caixa'}
                            </button>
                        </div>
                    )}
                    <button
                        onClick={() => navigate('/pos')}
                        className="btn-primary flex items-center gap-2"
                    >
                        <Plus className="w-5 h-5" /> Venda
                    </button>
                </div>
            </header>

            {/* KPI Stats */}
            <DashboardStats
                todaySales={stats.todaySales}
                todayProfit={stats.todayProfit}
                itemsSold={stats.itemsSold}
                transactionCount={stats.transactionCount}
                loading={loading}
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Sales Chart */}
                <div className="lg:col-span-2 glass-card p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-bold">Fluxo de Vendas (Hoje)</h3>
                        <span className="bg-primary/10 text-primary text-xs font-bold px-3 py-1 rounded-full">
                            Tempo Real
                        </span>
                    </div>
                    <div className="h-[300px] w-full min-h-[300px]">
                        <ResponsiveContainer width="100%" height="100%" minHeight={300}>
                            <AreaChart data={chartData}>
                                <defs>
                                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                                <XAxis
                                    dataKey="name"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#64748b', fontSize: 12 }}
                                />
                                <YAxis hide />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                                    itemStyle={{ color: '#f8fafc' }}
                                    formatter={(value: any) => [`R$ ${value.toFixed(2)}`, 'Vendas']}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="sales"
                                    stroke="#3b82f6"
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#colorSales)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Stock Alerts */}
                <div className="glass-card p-6">
                    <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                        <AlertCircle className="text-yellow-500 w-5 h-5" />
                        Alertas de Estoque
                    </h3>
                    <div className="space-y-4">
                        {loading ? (
                            <div className="flex items-center justify-center py-10">
                                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                            </div>
                        ) : stockAlerts.length === 0 ? (
                            <p className="text-center text-muted py-10 text-sm">
                                ✅ Estoque em níveis normais!
                            </p>
                        ) : (
                            stockAlerts.map(p => (
                                <StockAlertItem
                                    key={p.id}
                                    name={p.name}
                                    stock={p.stock_quantity}
                                    min={p.min_stock_alert}
                                />
                            ))
                        )}
                    </div>
                    <Link to="/inventory" className="btn-outline w-full mt-6 flex items-center justify-center gap-2">
                        Ver Inventário Completo
                    </Link>
                    <CashierManager
                        isOpen={showCashierManager}
                        onClose={() => setShowCashierManager(false)}
                    />
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
