import { TrendingUp, Users, ShoppingCart, DollarSign, Loader2, ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface DashboardStatsProps {
    todaySales: number;
    todayProfit: number;
    itemsSold: number;
    transactionCount: number;
    loading?: boolean;
}

export const DashboardStats = ({ todaySales, todayProfit, itemsSold, transactionCount, loading }: DashboardStatsProps) => {

    const stats = [
        {
            title: "Faturamento Hoje",
            value: new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(todaySales),
            icon: DollarSign,
            change: "+12.5%",
            trend: "up",
            color: "text-green-500",
            bg: "bg-green-500/10"
        },
        {
            title: "Lucro Bruto (Margem)",
            value: new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(todayProfit),
            icon: TrendingUp,
            change: "+8.2%",
            trend: "up",
            color: "text-purple-500",
            bg: "bg-purple-500/10"
        },
        {
            title: "Itens Vendidos",
            value: itemsSold.toString(),
            icon: ShoppingCart,
            change: "+3",
            trend: "up",
            color: "text-orange-500",
            bg: "bg-orange-500/10"
        },
        {
            title: "Transações",
            value: transactionCount.toString(),
            icon: Users,
            change: "+2",
            trend: "up",
            color: "text-blue-500",
            bg: "bg-blue-500/10"
        }
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((stat, index) => (
                <div key={index} className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/[0.07] transition-all group">
                    <div className="flex justify-between items-start mb-4">
                        <div className={`p-3 rounded-xl ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform`}>
                            <stat.icon className="w-6 h-6" />
                        </div>
                        {loading ? (
                            <div className="h-6 w-16 bg-white/10 rounded animate-pulse" />
                        ) : (
                            <div className="flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full bg-green-500/20 text-green-500">
                                <ArrowUpRight className="w-3 h-3" />
                                <span>Hoje</span>
                            </div>
                        )}
                    </div>

                    <div className="space-y-1">
                        <p className="text-sm font-medium text-muted">{stat.title}</p>
                        {loading ? (
                            <div className="h-8 w-32 bg-white/10 rounded animate-pulse mt-2" />
                        ) : (
                            <h3 className="text-2xl font-bold text-white tracking-tight">{stat.value}</h3>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
};
