import { useState, useEffect, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import { Search, ShoppingBag, ChefHat, GlassWater, Sparkles, AlertCircle, Plus, Minus, Trash2, Send, Bell, Receipt, UtensilsCrossed, User, Phone, Mail, ArrowRight } from 'lucide-react';

interface MenuItem {
    id: string;
    name: string;
    description?: string;
    price: number;
    cost_price?: number;
    category: string;
    image_url?: string;
    available: boolean;
}

interface CartItem extends MenuItem {
    quantity: number;
}

interface TableSession {
    id: string;
    table_number: string;
    customer_name: string;
    customer_phone: string;
    customer_email?: string;
}

export default function PublicMenu() {
    const [products, setProducts] = useState<MenuItem[]>([]);
    const [cart, setCart] = useState<CartItem[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('Todos');
    const [loading, setLoading] = useState(true);
    const [showCart, setShowCart] = useState(false);
    const [tableNumber, setTableNumber] = useState('');
    const [sending, setSending] = useState(false);
    const [notification, setNotification] = useState<string | null>(null);

    // Customer registration state
    const [session, setSession] = useState<TableSession | null>(null);
    const [showRegistration, setShowRegistration] = useState(true);
    const [customerData, setCustomerData] = useState({
        name: '',
        phone: '',
        email: ''
    });
    const [registering, setRegistering] = useState(false);

    useEffect(() => {
        const searchParams = new URLSearchParams(window.location.search);
        const tableParam = searchParams.get('table');
        if (tableParam) {
            setTableNumber(tableParam);
        }

        // Check for existing session in localStorage
        const savedSession = localStorage.getItem('smartbar_table_session');
        if (savedSession) {
            const parsed = JSON.parse(savedSession);
            // Check if same table number
            if (parsed.table_number === tableParam) {
                setSession(parsed);
                setShowRegistration(false);
            }
        }

        fetchMenu();
    }, []);

    const fetchMenu = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('products')
            .select('*')
            .eq('show_on_menu', true)
            .order('category', { ascending: true });

        if (!error && data) {
            setProducts(data.map(p => ({
                id: p.id,
                name: p.name,
                description: p.description || 'Deliciosa opção do nosso cardápio.',
                price: p.price,
                cost_price: p.cost_price || 0,
                category: p.category || 'Geral',
                image_url: p.image_url,
                available: p.stock_quantity > 0
            })));
        }
        setLoading(false);
    };

    // Register customer and create session
    const handleRegistration = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!customerData.name.trim()) {
            alert('Por favor, informe seu nome.');
            return;
        }

        if (!customerData.phone.trim() || customerData.phone.length < 10) {
            alert('Por favor, informe um WhatsApp válido.');
            return;
        }

        setRegistering(true);

        try {
            const { data, error } = await supabase
                .from('table_sessions')
                .insert({
                    table_number: tableNumber,
                    customer_name: customerData.name.trim(),
                    customer_phone: customerData.phone.replace(/\D/g, ''),
                    customer_email: customerData.email.trim() || null,
                    status: 'active'
                })
                .select()
                .single();

            if (error) throw error;

            const newSession: TableSession = {
                id: data.id,
                table_number: data.table_number,
                customer_name: data.customer_name,
                customer_phone: data.customer_phone,
                customer_email: data.customer_email
            };

            setSession(newSession);
            localStorage.setItem('smartbar_table_session', JSON.stringify(newSession));
            setShowRegistration(false);
            showNotification(`Bem-vindo(a), ${customerData.name.split(' ')[0]}! 🎉`);
        } catch (error: any) {
            console.error('Erro ao registrar:', error);
            alert('Erro ao registrar. Tente novamente.');
        } finally {
            setRegistering(false);
        }
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

    const addToCart = (product: MenuItem) => {
        if (!product.available) return;
        setCart(prev => {
            const existing = prev.find(item => item.id === product.id);
            if (existing) {
                return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
            }
            return [...prev, { ...product, quantity: 1 }];
        });
    };

    const updateQuantity = (id: string, delta: number) => {
        setCart(prev => prev.map(item => {
            if (item.id === id) {
                return { ...item, quantity: Math.max(1, item.quantity + delta) };
            }
            return item;
        }));
    };

    const removeFromCart = (id: string) => {
        setCart(prev => prev.filter(item => item.id !== id));
    };

    const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

    const showNotification = (message: string) => {
        setNotification(message);
        setTimeout(() => setNotification(null), 3000);
    };

    // Send order to kitchen
    const sendToKitchen = async () => {
        if (!session) {
            alert('Sessão não encontrada. Recarregue a página.');
            return;
        }

        if (cart.length === 0) {
            alert('Adicione itens ao pedido.');
            return;
        }

        setSending(true);

        try {
            // Create transaction
            const { data: transaction, error: txError } = await supabase
                .from('transactions')
                .insert({
                    type: 'sale',
                    total_amount: cartTotal,
                    table_number: tableNumber,
                    description: `Mesa ${tableNumber} - ${session.customer_name}`,
                    status: 'pending',
                    operator: session.customer_name
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

            const { error: itemsError } = await supabase
                .from('transaction_items')
                .insert(items);

            if (itemsError) throw itemsError;

            // Update session total
            await supabase
                .from('table_sessions')
                .update({
                    total_spent: (session as any).total_spent ? (session as any).total_spent + cartTotal : cartTotal
                })
                .eq('id', session.id);

            setCart([]);
            setShowCart(false);
            showNotification('✅ Pedido enviado para a cozinha!');
        } catch (error: any) {
            console.error('Erro ao enviar pedido:', error);
            alert('Erro ao enviar pedido. Tente novamente.');
        } finally {
            setSending(false);
        }
    };

    // Call waiter
    const callWaiter = async () => {
        if (!session) return;

        try {
            await supabase.from('table_notifications').insert({
                table_number: tableNumber,
                type: 'call_waiter',
                status: 'pending'
            });
            showNotification('🔔 Garçom foi chamado!');
        } catch (error) {
            console.error('Erro ao chamar garçom:', error);
        }
    };

    // Request close tab
    const requestCloseTab = async () => {
        if (!session) return;

        try {
            await supabase.from('table_notifications').insert({
                table_number: tableNumber,
                type: 'close_tab',
                status: 'pending'
            });
            showNotification('📋 Fechamento da comanda solicitado!');
        } catch (error) {
            console.error('Erro ao solicitar fechamento:', error);
        }
    };

    // Format phone number
    const formatPhone = (value: string) => {
        const numbers = value.replace(/\D/g, '');
        if (numbers.length <= 2) return numbers;
        if (numbers.length <= 7) return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
        if (numbers.length <= 11) return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7)}`;
        return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
    };

    // Registration Screen
    if (showRegistration) {
        return (
            <div className="min-h-screen bg-[#020617] text-white font-sans flex items-center justify-center p-4">
                {/* Background */}
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80')] bg-cover bg-center opacity-10"></div>
                <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-sky-500/20 rounded-full blur-[150px]" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-purple-500/10 rounded-full blur-[150px]" />

                <div className="relative z-10 w-full max-w-md">
                    <div className="glass-card p-8 border border-white/10 shadow-2xl animate-in fade-in zoom-in duration-500">
                        {/* Header */}
                        <div className="text-center mb-8">
                            <div className="w-20 h-20 mx-auto bg-gradient-to-br from-sky-500 to-indigo-600 rounded-2xl flex items-center justify-center mb-6 shadow-2xl shadow-sky-500/30">
                                <Sparkles className="w-10 h-10 text-white" />
                            </div>
                            <h1 className="text-3xl font-black tracking-tighter mb-2">
                                Bem-vindo! 🍹
                            </h1>
                            <p className="text-muted text-sm">
                                Mesa <span className="text-sky-400 font-bold">{tableNumber || '?'}</span> • Preencha para continuar
                            </p>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleRegistration} className="space-y-5">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-muted flex items-center gap-1">
                                    <User className="w-3 h-3" /> Seu Nome *
                                </label>
                                <input
                                    type="text"
                                    required
                                    placeholder="Como podemos te chamar?"
                                    value={customerData.name}
                                    onChange={(e) => setCustomerData({ ...customerData, name: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-5 text-white outline-none focus:border-sky-500/50 focus:ring-4 focus:ring-sky-500/10 transition-all font-medium placeholder:text-gray-600"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-muted flex items-center gap-1">
                                    <Phone className="w-3 h-3" /> WhatsApp *
                                </label>
                                <input
                                    type="tel"
                                    required
                                    placeholder="(00) 00000-0000"
                                    value={customerData.phone}
                                    onChange={(e) => setCustomerData({ ...customerData, phone: formatPhone(e.target.value) })}
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-5 text-white outline-none focus:border-sky-500/50 focus:ring-4 focus:ring-sky-500/10 transition-all font-medium placeholder:text-gray-600"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-muted flex items-center gap-1">
                                    <Mail className="w-3 h-3" /> Email (opcional)
                                </label>
                                <input
                                    type="email"
                                    placeholder="seu@email.com"
                                    value={customerData.email}
                                    onChange={(e) => setCustomerData({ ...customerData, email: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-5 text-white outline-none focus:border-sky-500/50 focus:ring-4 focus:ring-sky-500/10 transition-all font-medium placeholder:text-gray-600"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={registering}
                                className="w-full py-4 bg-gradient-to-r from-sky-500 to-indigo-600 rounded-2xl font-black text-lg flex items-center justify-center gap-3 shadow-2xl shadow-sky-500/30 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
                            >
                                {registering ? (
                                    <span className="animate-pulse">Entrando...</span>
                                ) : (
                                    <>
                                        Acessar Cardápio
                                        <ArrowRight className="w-5 h-5" />
                                    </>
                                )}
                            </button>
                        </form>

                        <p className="text-center text-[10px] text-muted mt-6">
                            Seus dados são usados apenas para melhorar sua experiência.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    // Main Menu (existing code)
    return (
        <div className="min-h-screen bg-[#020617] text-white font-sans selection:bg-sky-500/30">
            {/* Notification Toast */}
            {notification && (
                <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[200] bg-green-500 text-white px-6 py-3 rounded-2xl font-bold shadow-2xl animate-in slide-in-from-top-4 duration-300">
                    {notification}
                </div>
            )}

            {/* Header / Hero */}
            <div className="relative h-48 md:h-64 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-sky-900 via-indigo-900 to-slate-900"></div>
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80')] bg-cover bg-center opacity-20"></div>

                <div className="relative z-10 h-full flex flex-col justify-end px-6 pb-6 max-w-4xl mx-auto">
                    <div className="flex items-center gap-2 text-sky-400 mb-2 font-black uppercase tracking-widest text-xs animate-fade-in">
                        <Sparkles className="w-4 h-4" />
                        <span>Mesa {tableNumber} • {session?.customer_name}</span>
                    </div>
                    <h1 className="text-3xl md:text-5xl font-black tracking-tighter mb-2">SmartBar Menu</h1>
                    <p className="text-gray-400 text-sm md:text-base max-w-lg">
                        Explore nossos drinks artesanais e petiscos exclusivos.
                    </p>
                </div>
            </div>

            {/* Quick Actions Bar */}
            <div className="max-w-4xl mx-auto px-4 py-4">
                <div className="flex gap-3 overflow-x-auto pb-2">
                    <button
                        onClick={callWaiter}
                        className="flex items-center gap-2 px-5 py-3 bg-amber-500/10 border border-amber-500/30 text-amber-400 rounded-2xl font-bold text-sm whitespace-nowrap hover:bg-amber-500 hover:text-white transition-all active:scale-95"
                    >
                        <Bell className="w-5 h-5" />
                        Chamar Garçom
                    </button>
                    <button
                        onClick={requestCloseTab}
                        className="flex items-center gap-2 px-5 py-3 bg-purple-500/10 border border-purple-500/30 text-purple-400 rounded-2xl font-bold text-sm whitespace-nowrap hover:bg-purple-500 hover:text-white transition-all active:scale-95"
                    >
                        <Receipt className="w-5 h-5" />
                        Pedir Conta
                    </button>
                </div>
            </div>

            {/* Search & Filter */}
            <div className="sticky top-0 z-40 bg-[#020617]/90 backdrop-blur-xl border-b border-white/5 shadow-2xl">
                <div className="max-w-4xl mx-auto p-4 space-y-4">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Buscar no cardápio..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-12 pr-4 focus:ring-2 focus:ring-sky-500/50 outline-none transition-all placeholder:text-gray-600"
                        />
                    </div>
                </div>
            </div>

            {/* Categories */}
            <div className="max-w-4xl mx-auto px-4 pt-4 pb-0">
                <div className="flex gap-2 overflow-x-auto pb-4 hide-scrollbar">
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setSelectedCategory(cat)}
                            className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all border ${selectedCategory === cat
                                ? 'bg-sky-500 border-sky-500 text-white shadow-lg shadow-sky-500/20'
                                : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
                                }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            {/* Content */}
            <div className="max-w-4xl mx-auto p-4 pb-28">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 text-gray-500 animate-pulse">
                        <GlassWater className="w-12 h-12 mb-4 opacity-50" />
                        <p>Preparando cardápio...</p>
                    </div>
                ) : filteredProducts.length === 0 ? (
                    <div className="text-center py-20 text-gray-500">
                        <AlertCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>Nenhum item encontrado.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {filteredProducts.map(item => (
                            <div key={item.id} className="group bg-white/[0.02] border border-white/5 rounded-2xl p-4 flex gap-4 hover:bg-white/[0.05] transition-all">
                                <div className="w-24 h-24 rounded-xl bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center shrink-0 overflow-hidden relative">
                                    {item.image_url ? (
                                        <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                                    ) : (
                                        item.category === 'Bebidas' ? <GlassWater className="text-gray-700" /> : <ChefHat className="text-gray-700" />
                                    )}
                                    {!item.available && (
                                        <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                                            <span className="text-[10px] font-black uppercase tracking-widest text-white border border-white/20 px-2 py-1 rounded">Esgotado</span>
                                        </div>
                                    )}
                                </div>

                                <div className="flex-1 min-w-0 flex flex-col justify-between py-1">
                                    <div>
                                        <div className="flex justify-between items-start gap-2">
                                            <h3 className="font-bold text-lg leading-tight group-hover:text-sky-400 transition-colors">{item.name}</h3>
                                            <span className="font-mono font-bold text-sky-400">
                                                {item.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-500 mt-1 line-clamp-2 leading-relaxed">{item.description}</p>
                                    </div>
                                    <div className="flex justify-between items-end mt-2">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-600 bg-white/5 px-2 py-1 rounded-lg">
                                            {item.category}
                                        </span>
                                        <button
                                            onClick={() => addToCart(item)}
                                            disabled={!item.available}
                                            className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${item.available
                                                ? 'bg-sky-500/10 text-sky-500 hover:bg-sky-500 hover:text-white active:scale-95'
                                                : 'bg-white/5 text-gray-500 cursor-not-allowed'
                                                }`}
                                        >
                                            <Plus className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Floating Action Button */}
            {cartCount > 0 && (
                <div className="fixed bottom-6 right-6 left-6 md:left-auto z-50 animate-in slide-in-from-bottom-5 duration-500">
                    <button
                        onClick={() => setShowCart(true)}
                        className="w-full md:w-auto md:min-w-[200px] bg-sky-500 h-14 rounded-2xl shadow-2xl shadow-sky-500/40 flex items-center justify-between px-6 text-white hover:scale-105 active:scale-95 transition-all"
                    >
                        <div className="flex items-center gap-3">
                            <div className="bg-white/20 w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm">
                                {cartCount}
                            </div>
                            <span className="font-bold uppercase tracking-wider text-sm">Ver Pedido</span>
                        </div>
                        <span className="font-bold text-lg">R$ {cartTotal.toFixed(2)}</span>
                    </button>
                </div>
            )}

            {/* Cart Sheet / Modal */}
            {showCart && (
                <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center md:p-6 animate-in fade-in duration-200">
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowCart(false)}></div>
                    <div className="relative w-full max-w-md bg-[#0f172a] md:rounded-3xl rounded-t-3xl shadow-2xl border border-white/10 max-h-[90vh] flex flex-col animate-in slide-in-from-bottom duration-300">
                        <div className="p-6 border-b border-white/10 flex justify-between items-center">
                            <h2 className="text-xl font-black italic">Seu <span className="text-sky-500">Pedido</span></h2>
                            <button onClick={() => setShowCart(false)} className="p-2 bg-white/5 rounded-full hover:bg-white/10"><Minus className="w-5 h-5 rotate-90" /></button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
                            {cart.map(item => (
                                <div key={item.id} className="flex items-center justify-between bg-white/5 p-4 rounded-2xl">
                                    <div className="flex-1">
                                        <h4 className="font-bold">{item.name}</h4>
                                        <p className="text-sky-400 font-mono text-sm">R$ {item.price.toFixed(2)}</p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="flex items-center bg-black/30 rounded-lg p-1">
                                            <button onClick={() => updateQuantity(item.id, -1)} className="p-1 px-2 hover:bg-white/10 rounded"><Minus className="w-3 h-3" /></button>
                                            <span className="w-6 text-center text-sm font-bold">{item.quantity}</span>
                                            <button onClick={() => updateQuantity(item.id, 1)} className="p-1 px-2 hover:bg-white/10 rounded"><Plus className="w-3 h-3" /></button>
                                        </div>
                                        <button onClick={() => removeFromCart(item.id)} className="text-red-400 p-2"><Trash2 className="w-4 h-4" /></button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="p-6 bg-black/20 space-y-4 rounded-b-3xl">
                            <div className="flex justify-between items-center text-lg font-bold border-t border-white/10 pt-4">
                                <span>Total</span>
                                <span className="text-sky-400">R$ {cartTotal.toFixed(2)}</span>
                            </div>

                            <button
                                onClick={sendToKitchen}
                                disabled={sending}
                                className="w-full py-4 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl font-black uppercase tracking-widest text-sm flex items-center justify-center gap-2 shadow-lg shadow-orange-500/20 active:scale-95 transition-all text-white"
                            >
                                {sending ? (
                                    <span className="animate-pulse">Enviando...</span>
                                ) : (
                                    <>
                                        <UtensilsCrossed className="w-5 h-5" />
                                        Enviar para Cozinha
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
