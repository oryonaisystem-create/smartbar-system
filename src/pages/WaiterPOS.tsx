import { useState, useEffect, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import {
    Bell, Receipt, Users, ChefHat, Plus, Minus, Send, X,
    Search, Coffee, UtensilsCrossed, AlertCircle, CheckCircle2,
    Clock, DollarSign, Trash2, ShoppingBag, Loader2
} from 'lucide-react';
import { closeTableSession } from '../services/whatsappService';

interface TableSession {
    id: string;
    table_number: string;
    customer_name: string;
    customer_phone: string;
    customer_email?: string;
    status: string;
    opened_at: string;
    total_spent: number;
}

interface TableNotification {
    id: string;
    table_number: string;
    type: 'call_waiter' | 'close_tab';
    status: string;
    created_at: string;
}

interface Product {
    id: string;
    name: string;
    price: number;
    cost_price: number;
    category: string;
    image_url?: string;
    stock_quantity: number;
}

interface CartItem extends Product {
    quantity: number;
}

export default function WaiterPOS() {
    const [tables, setTables] = useState<TableSession[]>([]);
    const [notifications, setNotifications] = useState<TableNotification[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    // Order state
    const [selectedTable, setSelectedTable] = useState<TableSession | null>(null);
    const [cart, setCart] = useState<CartItem[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('Todos');
    const [showMenu, setShowMenu] = useState(false);
    const [sending, setSending] = useState(false);

    // Fetch data on mount
    useEffect(() => {
        fetchTables();
        fetchNotifications();
        fetchProducts();

        // Real-time subscriptions
        const tablesChannel = supabase
            .channel('waiter-tables')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'table_sessions' }, () => {
                fetchTables();
            })
            .subscribe();

        const notifChannel = supabase
            .channel('waiter-notifications')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'table_notifications' }, (payload) => {
                playSound();
                setNotifications(prev => [payload.new as TableNotification, ...prev]);
            })
            .subscribe();

        const productsChannel = supabase
            .channel('waiter-products')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, () => {
                fetchProducts();
            })
            .subscribe();

        return () => {
            supabase.removeChannel(tablesChannel);
            supabase.removeChannel(notifChannel);
            supabase.removeChannel(productsChannel);
        };
    }, []);

    const playSound = () => {
        try {
            const audio = new Audio('data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YU');
            audio.volume = 0.5;
            audio.play().catch(() => { });
        } catch (e) { }
    };

    const fetchTables = async () => {
        const { data } = await supabase
            .from('table_sessions')
            .select('*')
            .eq('status', 'active')
            .order('opened_at', { ascending: false });

        if (data) setTables(data);
        setLoading(false);
    };

    const fetchNotifications = async () => {
        const { data } = await supabase
            .from('table_notifications')
            .select('*')
            .eq('status', 'pending')
            .order('created_at', { ascending: false });

        if (data) setNotifications(data);
    };

    const fetchProducts = async () => {
        console.log('Fetching products...');
        const { data, error } = await supabase
            .from('products')
            .select('id, name, price, cost_price, category, image_url, stock_quantity')
            .order('category');

        console.log('Products result:', { data, error, count: data?.length });

        if (error) {
            console.error('Error fetching products:', error);
            return;
        }

        if (data) {
            // Filter only products with stock > 0 if stock_quantity exists
            const available = data.filter(p => !p.stock_quantity || p.stock_quantity > 0);
            setProducts(available);
        }
    };

    const acknowledgeNotification = async (notif: TableNotification) => {
        // If close_tab, close the session and send WhatsApp
        if (notif.type === 'close_tab') {
            const table = tables.find(t => t.table_number === notif.table_number);
            if (table) {
                const result = await closeTableSession(table.id, supabase);
                alert(result.message);
                fetchTables();
            }
        }

        await supabase
            .from('table_notifications')
            .update({ status: 'acknowledged' })
            .eq('id', notif.id);

        setNotifications(prev => prev.filter(n => n.id !== notif.id));
    };

    const categories = useMemo(() => {
        const cats = new Set(products.map(p => p.category));
        return ['Todos', ...Array.from(cats).sort()];
    }, [products]);

    const filteredProducts = products.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === 'Todos' || p.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    const addToCart = (product: Product) => {
        setCart(prev => {
            const existing = prev.find(item => item.id === product.id);
            if (existing) {
                return prev.map(item => item.id === product.id
                    ? { ...item, quantity: item.quantity + 1 }
                    : item
                );
            }
            return [...prev, { ...product, quantity: 1 }];
        });
    };

    const updateQuantity = (id: string, delta: number) => {
        setCart(prev => prev.map(item => {
            if (item.id === id) {
                const newQty = Math.max(1, item.quantity + delta);
                return { ...item, quantity: newQty };
            }
            return item;
        }));
    };

    const removeFromCart = (id: string) => {
        setCart(prev => prev.filter(item => item.id !== id));
    };

    const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    const sendOrder = async () => {
        if (!selectedTable || cart.length === 0) return;

        setSending(true);
        try {
            // Get waiter name from localStorage
            let waiterName = 'Garçom';
            try {
                const staffSession = localStorage.getItem('smartbar_staff_session');
                if (staffSession) {
                    const session = JSON.parse(staffSession);
                    waiterName = session.displayName || session.username || 'Garçom';
                }
            } catch (e) { }

            // Create transaction with waiter info
            const { data: transaction, error: txError } = await supabase
                .from('transactions')
                .insert({
                    type: 'sale',
                    total_amount: cartTotal,
                    table_number: selectedTable.table_number,
                    description: `Mesa ${selectedTable.table_number} | ${waiterName} | ${selectedTable.customer_name}`,
                    status: 'pending',
                    operator: waiterName
                })
                .select()
                .single();

            if (txError) throw txError;

            // Create transaction items
            const items = cart.map(item => ({
                transaction_id: transaction.id,
                product_id: item.id,
                quantity: item.quantity,
                unit_price: item.price,
                unit_cost: item.cost_price || 0
            }));

            await supabase.from('transaction_items').insert(items);

            // Update products stock
            for (const item of cart) {
                await supabase
                    .from('products')
                    .update({ stock_quantity: item.stock_quantity - item.quantity })
                    .eq('id', item.id);
            }

            // Update table session total
            await supabase
                .from('table_sessions')
                .update({ total_spent: selectedTable.total_spent + cartTotal })
                .eq('id', selectedTable.id);

            setCart([]);
            setShowMenu(false);
            setSelectedTable(null);
            alert('✅ Pedido enviado para a cozinha!');
            fetchTables();
            fetchProducts();
        } catch (error: any) {
            console.error('Error sending order:', error);
            alert('Erro ao enviar pedido: ' + error.message);
        } finally {
            setSending(false);
        }
    };

    const closeTable = async (table: TableSession) => {
        if (!confirm(`Fechar mesa ${table.table_number}? Isso enviará a pesquisa de satisfação por WhatsApp.`)) return;

        const result = await closeTableSession(table.id, supabase);
        alert(result.message);
        fetchTables();
    };

    const formatTime = (dateStr: string) => {
        return new Date(dateStr).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black text-white flex items-center gap-3">
                        <Users className="w-8 h-8 text-orange-500" />
                        Mesas Ativas
                    </h1>
                    <p className="text-muted">{tables.length} mesa(s) em atendimento</p>
                </div>
                <div className="flex items-center gap-2 bg-green-500/10 px-4 py-2 rounded-xl border border-green-500/20">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    <span className="text-xs font-bold uppercase tracking-widest text-green-500">Tempo Real</span>
                </div>
            </div>

            {/* Notifications Alert */}
            {notifications.length > 0 && (
                <div className="space-y-3 animate-in slide-in-from-top duration-300">
                    <h3 className="text-sm font-black uppercase tracking-widest text-amber-400 flex items-center gap-2">
                        <Bell className="w-4 h-4" />
                        Notificações ({notifications.length})
                    </h3>
                    {notifications.map(notif => (
                        <div
                            key={notif.id}
                            className={`p-4 rounded-2xl flex items-center justify-between animate-pulse ${notif.type === 'call_waiter'
                                ? 'bg-amber-500/20 border border-amber-500/50'
                                : 'bg-purple-500/20 border border-purple-500/50'
                                }`}
                        >
                            <div className="flex items-center gap-4">
                                {notif.type === 'call_waiter' ? (
                                    <Bell className="w-6 h-6 text-amber-400" />
                                ) : (
                                    <Receipt className="w-6 h-6 text-purple-400" />
                                )}
                                <div>
                                    <h4 className={`font-black text-lg ${notif.type === 'call_waiter' ? 'text-amber-400' : 'text-purple-400'
                                        }`}>
                                        Mesa {notif.table_number}
                                    </h4>
                                    <p className="text-sm text-white/70">
                                        {notif.type === 'call_waiter' ? 'Chamando garçom' : 'Solicitou fechamento'}
                                    </p>
                                    <p className="text-xs text-muted">{formatTime(notif.created_at)}</p>
                                </div>
                            </div>
                            <button
                                onClick={() => acknowledgeNotification(notif)}
                                className={`px-4 py-2 rounded-xl font-bold uppercase text-xs transition-all hover:scale-105 active:scale-95 ${notif.type === 'call_waiter'
                                    ? 'bg-amber-500 text-white'
                                    : 'bg-purple-500 text-white'
                                    }`}
                            >
                                {notif.type === 'call_waiter' ? 'Atender' : 'Fechar Mesa'}
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* Tables Grid */}
            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="w-8 h-8 animate-spin text-muted" />
                </div>
            ) : tables.length === 0 ? (
                <div className="text-center py-20 opacity-30">
                    <Coffee className="w-16 h-16 mx-auto mb-4" />
                    <p className="text-lg">Nenhuma mesa ativa</p>
                    <p className="text-sm text-muted">As mesas aparecem quando clientes acessam o cardápio</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {tables.map(table => {
                        const hasNotif = notifications.some(n => n.table_number === table.table_number);
                        return (
                            <div
                                key={table.id}
                                className={`glass-card p-5 border-l-4 ${hasNotif ? 'border-l-amber-500 animate-pulse' : 'border-l-sky-500'
                                    }`}
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="text-2xl font-black text-white">
                                            Mesa {table.table_number}
                                        </h3>
                                        <p className="text-sm text-sky-400 font-bold">{table.customer_name}</p>
                                    </div>
                                    <span className="bg-green-500/20 text-green-400 text-[10px] font-black uppercase px-2 py-1 rounded">
                                        Ativa
                                    </span>
                                </div>

                                <div className="space-y-2 text-sm text-muted mb-4">
                                    <div className="flex items-center gap-2">
                                        <Clock className="w-4 h-4" />
                                        Aberta às {formatTime(table.opened_at)}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <DollarSign className="w-4 h-4" />
                                        Total: <span className="text-green-400 font-bold">R$ {table.total_spent.toFixed(2)}</span>
                                    </div>
                                </div>

                                <div className="flex gap-2">
                                    <button
                                        onClick={() => {
                                            setSelectedTable(table);
                                            setShowMenu(true);
                                        }}
                                        className="flex-1 py-2 bg-sky-500/10 text-sky-400 border border-sky-500/30 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-sky-500 hover:text-white transition-all flex items-center justify-center gap-2"
                                    >
                                        <Plus className="w-4 h-4" />
                                        Pedido
                                    </button>
                                    <button
                                        onClick={() => closeTable(table)}
                                        className="flex-1 py-2 bg-purple-500/10 text-purple-400 border border-purple-500/30 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-purple-500 hover:text-white transition-all flex items-center justify-center gap-2"
                                    >
                                        <Receipt className="w-4 h-4" />
                                        Fechar
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Menu Modal */}
            {showMenu && selectedTable && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in">
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowMenu(false)} />

                    <div className="relative w-full max-w-5xl max-h-[90vh] bg-[#0f172a] rounded-3xl border border-white/10 flex flex-col overflow-hidden animate-in zoom-in duration-300">
                        {/* Header */}
                        <div className="p-6 border-b border-white/10 flex items-center justify-between">
                            <div>
                                <h2 className="text-xl font-black text-white">
                                    Novo Pedido - Mesa {selectedTable.table_number}
                                </h2>
                                <p className="text-sm text-muted">{selectedTable.customer_name}</p>
                            </div>
                            <button onClick={() => setShowMenu(false)} className="p-2 hover:bg-white/10 rounded-full">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="flex flex-1 overflow-hidden">
                            {/* Products */}
                            <div className="flex-1 p-6 overflow-y-auto">
                                {/* Search */}
                                <div className="relative mb-4">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted w-5 h-5" />
                                    <input
                                        type="text"
                                        placeholder="Buscar produto..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 outline-none focus:ring-2 focus:ring-sky-500/30"
                                    />
                                </div>

                                {/* Categories */}
                                <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
                                    {categories.map(cat => (
                                        <button
                                            key={cat}
                                            onClick={() => setSelectedCategory(cat)}
                                            className={`px-4 py-2 rounded-full text-xs font-bold uppercase whitespace-nowrap transition-all ${selectedCategory === cat
                                                ? 'bg-sky-500 text-white'
                                                : 'bg-white/5 text-muted hover:bg-white/10'
                                                }`}
                                        >
                                            {cat}
                                        </button>
                                    ))}
                                </div>

                                {/* Products Grid */}
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                    {filteredProducts.map(product => (
                                        <button
                                            key={product.id}
                                            onClick={() => addToCart(product)}
                                            className="p-4 bg-white/5 border border-white/10 rounded-xl text-left hover:bg-white/10 transition-all active:scale-95 group"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="w-12 h-12 bg-gradient-to-br from-sky-500/20 to-purple-500/20 rounded-lg flex items-center justify-center shrink-0">
                                                    {product.image_url ? (
                                                        <img src={product.image_url} alt="" className="w-full h-full object-cover rounded-lg" />
                                                    ) : (
                                                        <UtensilsCrossed className="w-5 h-5 text-muted" />
                                                    )}
                                                </div>
                                                <div className="min-w-0">
                                                    <h4 className="font-bold text-white truncate group-hover:text-sky-400 transition-colors">
                                                        {product.name}
                                                    </h4>
                                                    <p className="text-sky-400 font-mono text-sm">
                                                        R$ {product.price.toFixed(2)}
                                                    </p>
                                                </div>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Cart Sidebar */}
                            <div className="w-80 bg-black/30 border-l border-white/10 flex flex-col">
                                <div className="p-4 border-b border-white/10">
                                    <h3 className="font-black flex items-center gap-2">
                                        <ShoppingBag className="w-5 h-5 text-orange-500" />
                                        Carrinho ({cart.reduce((s, i) => s + i.quantity, 0)})
                                    </h3>
                                </div>

                                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                                    {cart.length === 0 ? (
                                        <div className="text-center py-10 opacity-30">
                                            <ShoppingBag className="w-10 h-10 mx-auto mb-2" />
                                            <p className="text-sm">Carrinho vazio</p>
                                        </div>
                                    ) : (
                                        cart.map(item => (
                                            <div key={item.id} className="bg-white/5 p-3 rounded-xl flex items-center justify-between">
                                                <div className="min-w-0 flex-1">
                                                    <h4 className="font-bold text-sm truncate">{item.name}</h4>
                                                    <p className="text-xs text-sky-400">R$ {(item.price * item.quantity).toFixed(2)}</p>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <div className="flex items-center bg-black/30 rounded-lg">
                                                        <button onClick={() => updateQuantity(item.id, -1)} className="p-1 hover:bg-white/10 rounded">
                                                            <Minus className="w-3 h-3" />
                                                        </button>
                                                        <span className="w-6 text-center text-sm font-bold">{item.quantity}</span>
                                                        <button onClick={() => updateQuantity(item.id, 1)} className="p-1 hover:bg-white/10 rounded">
                                                            <Plus className="w-3 h-3" />
                                                        </button>
                                                    </div>
                                                    <button onClick={() => removeFromCart(item.id)} className="p-1 text-red-400 hover:bg-red-500/20 rounded">
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>

                                <div className="p-4 bg-black/20 space-y-4">
                                    <div className="flex justify-between text-lg font-bold">
                                        <span>Total</span>
                                        <span className="text-sky-400">R$ {cartTotal.toFixed(2)}</span>
                                    </div>
                                    <button
                                        onClick={sendOrder}
                                        disabled={cart.length === 0 || sending}
                                        className="w-full py-4 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 rounded-xl font-black uppercase tracking-widest text-sm flex items-center justify-center gap-2 transition-all active:scale-95"
                                    >
                                        {sending ? (
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                        ) : (
                                            <>
                                                <Send className="w-5 h-5" />
                                                Enviar Pedido
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
