import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Clock, CheckCircle2, ChefHat, Loader2, UtensilsCrossed, Calendar } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

const KitchenMobile = () => {
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

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

    useEffect(() => {
        fetchOrders();

        const ordersChannel = supabase
            .channel('kitchen-orders-mobile')
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'transactions' },
                (payload) => {
                    if (payload.new.type === 'sale') {
                        // Play sound or notification if possible
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

    const updateOrderStatus = async (id: string, status: string) => {
        await supabase
            .from('transactions')
            .update({ status })
            .eq('id', id);

        fetchOrders();
    };

    return (
        <div className="flex flex-col gap-6 animate-in fade-in duration-500 pb-24">
            <header className="flex items-center justify-between px-2">
                <div>
                    <h1 className="text-2xl font-black text-white italic flex items-center gap-2">
                        <ChefHat className="w-6 h-6 text-primary" />
                        COZINHA <span className="text-primary tracking-tighter">APP</span>
                    </h1>
                    <div className="flex items-center gap-1.5 mt-0.5">
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-green-500/80">Realtime Ativo</span>
                    </div>
                </div>
                {loading && <Loader2 className="w-5 h-5 animate-spin text-primary" />}
            </header>

            <div className="space-y-4">
                {orders.map((order) => (
                    <div
                        key={order.id}
                        className={cn(
                            "p-5 rounded-[32px] border transition-all shadow-xl",
                            order.status === 'pending' ? "bg-orange-500/5 border-orange-500/20" : "bg-yellow-500/5 border-yellow-500/20"
                        )}
                    >
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="text-lg font-black text-white italic tracking-tighter">ORDEM #{order.id.slice(0, 4)}</h3>
                                <div className="flex items-center gap-2 text-muted font-bold text-[10px] uppercase mt-0.5">
                                    <Clock className="w-3 h-3" />
                                    {new Date(order.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                </div>
                            </div>
                            <span className={cn(
                                "px-3 py-1 rounded-full text-[9px] font-black tracking-widest uppercase border",
                                order.status === 'pending' ? "bg-orange-500/20 text-orange-500 border-orange-500/20" : "bg-yellow-500/20 text-yellow-500 border-yellow-500/20"
                            )}>
                                {order.status === 'pending' ? 'NOVO' : 'PREPARANDO'}
                            </span>
                        </div>

                        {/* Order Context Label (Table/Delivery) */}
                        <div className="flex gap-2 mb-4">
                            {order.table_number ? (
                                <div className="flex-1 p-3 bg-primary/10 border border-primary/20 rounded-2xl flex items-center justify-center gap-3">
                                    <UtensilsCrossed className="w-4 h-4 text-primary" />
                                    <span className="text-sm font-black text-white uppercase italic">Mesa {order.table_number}</span>
                                </div>
                            ) : (
                                <div className="flex-1 p-3 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center gap-3">
                                    <Calendar className="w-4 h-4 text-muted" />
                                    <span className="text-sm font-black text-white uppercase italic">Take Away</span>
                                </div>
                            )}
                        </div>

                        {/* Items List */}
                        <div className="space-y-3 mb-6 bg-white/[0.03] p-4 rounded-2xl border border-white/5">
                            {order.transaction_items?.map((item: any, idx: number) => (
                                <div key={idx} className="flex justify-between items-center">
                                    <div className="flex items-center gap-3 flex-1 min-w-0">
                                        <span className="text-primary font-black text-sm">{item.quantity}x</span>
                                        <span className="text-white font-bold text-sm truncate uppercase tracking-tight">{item.products?.name}</span>
                                    </div>
                                    <div className="w-5 h-5 rounded-md border border-white/10 flex items-center justify-center">
                                        <div className="w-2.5 h-2.5 rounded-full bg-white/5" />
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3">
                            {order.status === 'pending' && (
                                <button
                                    onClick={() => updateOrderStatus(order.id, 'preparing')}
                                    className="flex-1 py-4 bg-yellow-500 text-white rounded-2xl font-black uppercase text-xs tracking-[0.15em] shadow-lg shadow-yellow-500/20 active:scale-95 transition-all"
                                >
                                    Preparar
                                </button>
                            )}
                            <button
                                onClick={() => updateOrderStatus(order.id, 'ready')}
                                className={cn(
                                    "py-4 rounded-2xl font-black uppercase text-xs tracking-[0.15em] active:scale-95 transition-all shadow-lg",
                                    order.status === 'pending' ? "flex-[0.6] bg-white/5 border border-white/10 text-muted" : "flex-1 bg-green-500 text-white shadow-green-500/20"
                                )}
                            >
                                Pronto
                            </button>
                        </div>
                    </div>
                ))}

                {orders.length === 0 && !loading && (
                    <div className="py-20 text-center flex flex-col items-center justify-center gap-4 opacity-40">
                        <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center border border-white/10">
                            <CheckCircle2 className="w-10 h-10 text-muted" />
                        </div>
                        <p className="font-black uppercase text-xs tracking-widest text-muted">Sem pedidos pendentes</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default KitchenMobile;
