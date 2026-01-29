import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Clock, CheckCircle2, ChefHat, Loader2 } from 'lucide-react';
import { useViewport } from '../hooks/useViewport';
import KitchenMobile from './mobile/KitchenMobile';

const Kitchen = () => {
    const { isMobile } = useViewport();
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchOrders();

        const ordersChannel = supabase
            .channel('kitchen-orders')
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'transactions' },
                (payload) => {
                    if (payload.new.type === 'sale') {
                        playNotificationSound();
                        fetchOrders();
                    }
                }
            )
            .on(
                'postgres_changes',
                { event: 'UPDATE', schema: 'public', table: 'transactions' },
                () => fetchOrders()
            )
            .subscribe();

        return () => {
            supabase.removeChannel(ordersChannel);
        };
    }, []);

    const playNotificationSound = () => {
        try {
            const audio = new Audio('data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YU');
            audio.volume = 0.3;
            audio.play().catch(() => { });
        } catch (e) { }
    };

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const todayDate = new Date();
            todayDate.setHours(0, 0, 0, 0);
            const todayISO = todayDate.toISOString();

            const { data, error } = await supabase
                .from('transactions')
                .select(`
                    *,
                    transaction_items (
                        quantity,
                        products (name)
                    )
                `)
                .eq('type', 'sale')
                .in('status', ['pending', 'preparing'])
                .gte('created_at', todayISO)
                .order('created_at', { ascending: false });

            if (!error && data) {
                setOrders(data);
            }
        } catch (error) {
            console.error('Erro ao buscar pedidos:', error);
        } finally {
            setLoading(false);
        }
    };

    const updateOrderStatus = async (id: string, status: string) => {
        await supabase
            .from('transactions')
            .update({ status })
            .eq('id', id);

        fetchOrders();
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending': return 'border-l-orange-500';
            case 'preparing': return 'border-l-yellow-500';
            case 'ready': return 'border-l-green-500';
            default: return 'border-l-gray-500';
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'pending': return 'NOVO';
            case 'preparing': return 'PREPARANDO';
            case 'ready': return 'PRONTO';
            default: return status;
        }
    };

    if (isMobile) {
        return <KitchenMobile />;
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black text-white flex items-center gap-3">
                        <ChefHat className="w-8 h-8 text-orange-500" />
                        Cozinha / Bar
                    </h1>
                    <p className="text-muted">Pedidos em tempo real</p>
                </div>
                <div className="bg-white/5 px-4 py-2 rounded-xl flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    <span className="text-xs font-bold uppercase tracking-widest text-green-500">Sistema Conectado</span>
                </div>
            </div>

            {/* Orders Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {orders.map(order => (
                    <div key={order.id} className={`glass-card p-6 border-l-4 ${getStatusColor(order.status)} animate-in slide-in-from-bottom-2`}>
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="text-xl font-black text-white">
                                    #{order.id.slice(0, 4)}
                                </h3>
                                <p className="text-sm text-muted font-mono">
                                    {new Date(order.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                </p>
                            </div>
                            <span className={`px-2 py-1 rounded text-xs font-black uppercase ${order.status === 'pending' ? 'bg-orange-500/20 text-orange-400' :
                                order.status === 'preparing' ? 'bg-yellow-500/20 text-yellow-400' :
                                    'bg-green-500/20 text-green-400'
                                }`}>
                                {getStatusLabel(order.status)}
                            </span>
                        </div>

                        {/* Table Number & Waiter Info */}
                        {(order.table_number || order.description || order.operator) && (
                            <div className="mb-4 space-y-2">
                                {/* Table */}
                                {order.table_number && (
                                    <div className="bg-orange-500/10 text-orange-400 p-3 rounded-lg text-center font-bold uppercase text-lg border border-orange-500/20">
                                        🍽️ Mesa {order.table_number}
                                    </div>
                                )}
                                {/* Waiter */}
                                {order.operator && order.operator !== 'admin' && (
                                    <div className="bg-sky-500/10 text-sky-400 p-2 rounded-lg text-center font-bold text-sm border border-sky-500/20 flex items-center justify-center gap-2">
                                        👨‍🍳 Garçom: {order.operator}
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="space-y-2 mb-6 border-t border-b border-white/5 py-4">
                            {order.transaction_items?.map((item: any, idx: number) => (
                                <div key={idx} className="flex justify-between items-center text-sm">
                                    <span className="text-white font-bold">{item.quantity}x</span>
                                    <span className="text-gray-300 truncate flex-1 ml-3">{item.products?.name}</span>
                                </div>
                            ))}
                        </div>

                        <div className="flex gap-2">
                            {order.status === 'pending' && (
                                <button
                                    onClick={() => updateOrderStatus(order.id, 'preparing')}
                                    className="flex-1 py-3 bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 hover:bg-yellow-500 hover:text-white rounded-xl font-black uppercase text-xs tracking-widest transition-all flex items-center justify-center gap-2"
                                >
                                    <Clock className="w-4 h-4" />
                                    Preparando
                                </button>
                            )}
                            {(order.status === 'pending' || order.status === 'preparing') && (
                                <button
                                    onClick={() => updateOrderStatus(order.id, 'ready')}
                                    className="flex-1 py-3 bg-green-500/10 text-green-500 border border-green-500/20 hover:bg-green-500 hover:text-white rounded-xl font-black uppercase text-xs tracking-widest transition-all flex items-center justify-center gap-2"
                                >
                                    <CheckCircle2 className="w-4 h-4" />
                                    Pronto
                                </button>
                            )}
                        </div>
                    </div>
                ))}

                {orders.length === 0 && !loading && (
                    <div className="col-span-full py-20 text-center opacity-30">
                        <CheckCircle2 className="w-16 h-16 mx-auto mb-4" />
                        <p>Tudo limpo na cozinha!</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Kitchen;
