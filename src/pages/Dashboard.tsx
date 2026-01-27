import React from 'react';
import {
    TrendingUp,
    Users,
    Package,
    DollarSign,
    ArrowUpRight,
    ArrowDownRight,
    AlertCircle
} from 'lucide-react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    AreaChart,
    Area
} from 'recharts';

const data = [
    { name: '18:00', sales: 400, stock: 240 },
    { name: '19:00', sales: 700, stock: 220 },
    { name: '20:00', sales: 1200, stock: 190 },
    { name: '21:00', sales: 1800, stock: 150 },
    { name: '22:00', sales: 2400, stock: 110 },
    { name: '23:00', sales: 2100, stock: 80 },
    { name: '00:00', sales: 1500, stock: 60 },
];

const StatCard = ({ title, value, change, icon: Icon, trend }: any) => (
    <div className="glass-card p-6 flex flex-col justify-between">
        <div className="flex justify-between items-start">
            <div className="p-3 bg-white/5 rounded-xl border border-white/10 text-primary">
                <Icon className="w-6 h-6" />
            </div>
            {trend && (
                <span className={`flex items-center text-xs font-medium px-2 py-1 rounded-full ${trend === 'up' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                    {trend === 'up' ? <ArrowUpRight className="w-3 h-3 mr-1" /> : <ArrowDownRight className="w-3 h-3 mr-1" />}
                    {change}%
                </span>
            )}
        </div>
        <div className="mt-4">
            <p className="text-muted text-sm font-medium">{title}</p>
            <h3 className="text-2xl font-bold mt-1">{value}</h3>
        </div>
    </div>
);

const Dashboard = () => {
    return (
        <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Vendas de Hoje" value="R$ 4.250,00" change="12" icon={DollarSign} trend="up" />
                <StatCard title="Clientes Ativos" value="54" change="8" icon={Users} trend="up" />
                <StatCard title="Itens Vendidos" value="186" change="4" icon={Package} trend="up" />
                <StatCard title="Lucro Bruto" value="R$ 1.845,00" change="2" icon={TrendingUp} trend="down" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Sales Chart */}
                <div className="lg:col-span-2 glass-card p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h4 className="text-lg font-semibold font-medium">Fluxo de Vendas (Últimas 6h)</h4>
                        <div className="flex gap-2">
                            <span className="flex items-center gap-2 text-xs text-muted">
                                <span className="w-2 h-2 rounded-full bg-primary"></span> Receita
                            </span>
                        </div>
                    </div>
                    <div className="h-80 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={data}>
                                <defs>
                                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                                <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `R$${value}`} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#ffffff10', borderRadius: '12px', color: '#f8fafc' }}
                                    itemStyle={{ color: '#3b82f6' }}
                                />
                                <Area type="monotone" dataKey="sales" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Alerts & Notifications */}
                <div className="glass-card p-6">
                    <h4 className="text-lg font-semibold mb-6">Alertas de Estoque</h4>
                    <div className="space-y-4">
                        {[
                            { item: 'Heineken 330ml', stock: '8 unidades', status: 'Crítico' },
                            { item: 'Gin Tanqueray', stock: '2 garrafas', status: 'Baixo' },
                            { item: 'Gelo de Côco', stock: '12 pacotes', status: 'Repor em breve' },
                            { item: 'Red Bull Sugarfree', stock: '5 unidades', status: 'Baixo' },
                        ].map((alert, i) => (
                            <div key={i} className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/5">
                                <div className={`p-2 rounded-lg ${alert.status === 'Crítico' ? 'bg-red-500/10 text-red-500' : 'bg-yellow-500/10 text-yellow-500'}`}>
                                    <AlertCircle className="w-5 h-5" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-medium">{alert.item}</p>
                                    <p className="text-xs text-muted">{alert.stock}</p>
                                </div>
                                <span className={`text-[10px] font-bold uppercase tracking-wider ${alert.status === 'Crítico' ? 'text-red-500' : 'text-yellow-500'}`}>
                                    {alert.status}
                                </span>
                            </div>
                        ))}
                        <button className="w-full btn-outline text-sm mt-4">Ver Estoque Completo</button>
                    </div>
                </div>
            </div>

            {/* Recent Orders Table */}
            <div className="glass-card p-6 overflow-hidden">
                <h4 className="text-lg font-semibold mb-6">Últimos Pedidos</h4>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-white/5 text-muted text-sm">
                                <th className="pb-4 font-medium">Pedido</th>
                                <th className="pb-4 font-medium">Mesa</th>
                                <th className="pb-4 font-medium">Item</th>
                                <th className="pb-4 font-medium">Status</th>
                                <th className="pb-4 font-medium text-right">Valor</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {[
                                { id: '#1289', table: 'Mesa 04', item: '2x Moscow Mule', status: 'Pronto', value: 'R$ 76,00' },
                                { id: '#1288', table: 'Balcão', item: '1x Burger Classic', status: 'Na Cozinha', value: 'R$ 42,00' },
                                { id: '#1287', table: 'Mesa 12', item: '3x Chopp Artesanal', status: 'Pronto', value: 'R$ 54,00' },
                                { id: '#1286', table: 'Mesa 08', item: '1x Combo Gin', status: 'Preparando', value: 'R$ 210,00' },
                            ].map((order, i) => (
                                <tr key={i} className="group hover:bg-white/5 transition-colors">
                                    <td className="py-4 font-medium text-primary">{order.id}</td>
                                    <td className="py-4 text-sm">{order.table}</td>
                                    <td className="py-4 text-sm">{order.item}</td>
                                    <td className="py-4">
                                        <span className={`text-[10px] font-bold px-2 py-1 rounded-md uppercase ${order.status === 'Pronto' ? 'bg-green-500/10 text-green-500' :
                                                order.status === 'Na Cozinha' ? 'bg-orange-500/10 text-orange-500' :
                                                    'bg-blue-500/10 text-blue-500'
                                            }`}>
                                            {order.status}
                                        </span>
                                    </td>
                                    <td className="py-4 text-sm font-bold text-right">{order.value}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
