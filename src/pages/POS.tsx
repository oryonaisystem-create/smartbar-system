import { useState, useEffect, useMemo } from 'react';
import {
    ShoppingCart,
    Search,
    Plus,
    Minus,
    Trash2,
    CheckCircle2,
    X,
    Barcode,
    Zap,
    ChevronRight,
    CreditCard,
    Banknote,
    Filter,
    List,
    Grid,
    Users,
    Lock
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Product } from './Inventory';
import { ProductScanner } from '../components/ProductScanner';
import { useNavigate } from 'react-router-dom';
import { useViewport } from '../hooks/useViewport';
import MobilePDV from './mobile/MobilePDV';
import { OperatorGuardModal } from '../components/OperatorGuardModal';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useCashier } from '../context/CashierContext';
import { CashierManager } from '../components/CashierManager';

function cn(...inputs: ClassValue[]) { return twMerge(clsx(inputs)); }

interface CartItem extends Product {
    quantity: number;
}

type PaymentMethod = 'DINHEIRO' | 'CARTAO';

const POS = () => {
    const navigate = useNavigate();
    const { isMobile } = useViewport();
    const [products, setProducts] = useState<Product[]>([]);
    const [cart, setCart] = useState<CartItem[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [showScanner, setShowScanner] = useState(false);
    const [loading, setLoading] = useState(false);
    const [checkoutStatus, setCheckoutStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('DINHEIRO');
    const [categoryFilter, setCategoryFilter] = useState<string>('all');
    const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
    const [showOperatorModal, setShowOperatorModal] = useState(false);
    const [operator, setOperator] = useState<string | null>(null);
    const { currentSession } = useCashier();
    const [showCashierManager, setShowCashierManager] = useState(false);


    // Get unique categories from products
    const categories = useMemo(() => {
        const cats = new Set(products.map(p => p.category || 'Outros'));
        return ['all', ...Array.from(cats)];
    }, [products]);

    useEffect(() => {
        fetchProducts();
        // Auto-open operator modal REMOVED

        const channel = supabase
            .channel('pos-products')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'products' },
                () => fetchProducts()
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    const fetchProducts = async () => {
        // Select explicit columns to prevent 400 error if schema is mismatched
        const { data, error } = await supabase
            .from('products')
            .select('id, name, price, cost_price, stock_quantity, category, barcode, image_url')
            .order('name');
        if (!error && data) setProducts(data);
    };

    if (isMobile) {
        return <MobilePDV />;
    }

    const addToCart = (product: Product) => {
        const existing = cart.find(item => item.id === product.id);
        if (existing) {
            setCart(cart.map(item =>
                item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
            ));
        } else {
            setCart([...cart, { ...product, quantity: 1 }]);
        }
    };

    const updateQuantity = (id: string, delta: number) => {
        setCart(cart.map(item => {
            if (item.id === id) {
                const newQty = Math.max(1, item.quantity + delta);
                return { ...item, quantity: newQty };
            }
            return item;
        }));
    };

    const removeFromCart = (id: string) => {
        setCart(cart.filter(item => item.id !== id));
    };

    const handleScanSuccess = (code: string) => {
        const product = products.find(p => p.barcode === code);
        if (product) {
            addToCart(product);
            setShowScanner(false);
        } else {
            alert("Produto não cadastrado no banco.");
        }
    };

    const total = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);

    // Triggered when clicking "Finalizar Venda" or "Identificar Operador"
    const handleMainButtonClick = () => {
        if (operator) {
            // If operator is already identified, proceed to actual checkout
            processCheckout(operator);
        } else {
            // Otherwise open modal to identify
            setShowOperatorModal(true);
        }
    };

    // Called when OperatorGuardModal confirms identity
    const handleOperatorIdentified = (name: string) => {
        setOperator(name);
        setShowOperatorModal(false);
    };

    // Triggered by Modal on confirmation
    const processCheckout = async (operatorName: string) => {
        setLoading(true);
        // Calculate total cost for profit reporting
        const totalCost = cart.reduce((sum, item) => sum + ((item.cost_price || 0) * item.quantity), 0);
        console.log('🛒 POS: Starting checkout...', { cart, total, paymentMethod, operatorName, totalCost });

        try {
            // 1. Create Transaction
            console.log('🛒 POS: Creating transaction...');
            const { data: tx, error: txError } = await supabase
                .from('transactions')
                .insert([{
                    type: 'sale',
                    total_amount: total,
                    payment_method: paymentMethod,
                    operator: operatorName,
                    cost_price: totalCost,
                    cashier_session_id: currentSession?.id
                }])
                .select()
                .single();

            if (txError) {
                console.error('🛒 POS: Transaction error:', txError);
                throw txError;
            }
            console.log('🛒 POS: Transaction created:', tx);

            // 2. Create Items & Deduct Stock
            for (const item of cart) {
                console.log('🛒 POS: Adding item:', item.name);

                const { error: itemError } = await supabase.from('transaction_items').insert([{
                    transaction_id: tx.id,
                    product_id: item.id,
                    quantity: item.quantity,
                    unit_price: item.price,
                    unit_cost: item.cost_price || 0
                }]);

                if (itemError) {
                    console.error('🛒 POS: Item insert error:', itemError);
                }

                console.log('🛒 POS: Decrementing stock for:', item.name);
                const { error: stockError } = await supabase.rpc('decrement_stock', {
                    row_id: item.id,
                    qty: item.quantity
                });

                if (stockError) {
                    console.error('🛒 POS: Stock decrement error:', stockError);
                }
            }

            console.log('🛒 POS: Checkout complete!');
            setCheckoutStatus('success');
            setCart([]);
            setOperator(null); // Reset operator operator for next sale security
            setTimeout(() => setCheckoutStatus('idle'), 3000);
            // Refresh products to show new stock
            fetchProducts();
        } catch (error: any) {
            console.error('🛒 POS: Checkout failed:', error);
            setCheckoutStatus('error');
            alert(`Erro no checkout: ${error.message || error}`);
        } finally {
            setLoading(false);
        }
    };

    // Filter products by search term and category
    const filteredProducts = products.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.barcode?.includes(searchTerm);
        const matchesCategory = categoryFilter === 'all' ||
            (p.category || 'Outros') === categoryFilter;
        return matchesSearch && matchesCategory;
    });

    return (
        <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-8rem)]">
            <OperatorGuardModal
                isOpen={showOperatorModal}
                onClose={() => setShowOperatorModal(false)}
                onConfirm={handleOperatorIdentified}
                totalAmount={total}
            />

            {/* Products Column */}
            <div className="flex-1 space-y-4 flex flex-col min-h-0">
                {/* Search and Filters Row */}
                <div className="flex flex-col gap-3">
                    <div className="flex gap-3">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Buscar produto por nome ou código..."
                                className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-10 pr-4 focus:ring-2 focus:ring-primary/50 outline-none transition-all"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <button
                            onClick={() => setShowScanner(!showScanner)}
                            className={cn(
                                "p-3 rounded-2xl border border-white/10 transition-all",
                                showScanner ? "bg-primary text-white" : "bg-white/5 text-muted hover:text-white"
                            )}
                        >
                            <Barcode className="w-6 h-6" />
                        </button>
                        <button
                            onClick={() => setViewMode(viewMode === 'list' ? 'grid' : 'list')}
                            className="p-3 rounded-2xl border border-white/10 bg-white/5 text-muted hover:text-white transition-all"
                            title={viewMode === 'list' ? 'Ver em grade' : 'Ver em lista'}
                        >
                            {viewMode === 'list' ? <Grid className="w-6 h-6" /> : <List className="w-6 h-6" />}
                        </button>
                    </div>

                    {/* Category Filter */}
                    <div className="flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar">
                        <Filter className="w-4 h-4 text-muted shrink-0" />
                        {categories.map(cat => (
                            <button
                                key={cat}
                                onClick={() => setCategoryFilter(cat)}
                                className={cn(
                                    "px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all",
                                    categoryFilter === cat
                                        ? "bg-primary text-white"
                                        : "bg-white/5 text-muted hover:bg-white/10 hover:text-white"
                                )}
                            >
                                {cat === 'all' ? 'Todos' : cat}
                            </button>
                        ))}
                    </div>
                </div>

                {showScanner && (
                    <div className="absolute inset-0 z-40 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md lg:static lg:bg-transparent lg:p-0">
                        <div className="max-w-md w-full relative">
                            <button
                                onClick={() => setShowScanner(false)}
                                className="absolute -top-12 right-0 text-white hover:text-primary p-2"
                            >
                                <X className="w-8 h-8" />
                            </button>
                            <ProductScanner onScanSuccess={handleScanSuccess} />
                        </div>
                    </div>
                )}

                {/* Products List or Grid */}
                {viewMode === 'list' ? (
                    <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2 pb-4">
                        {filteredProducts.map(p => (
                            <div
                                key={p.id}
                                onClick={() => addToCart(p)}
                                className="flex items-center gap-4 p-3 bg-white/5 border border-white/10 rounded-2xl hover:border-primary/50 cursor-pointer group transition-all"
                            >
                                <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 overflow-hidden bg-white/10">
                                    {p.image_url ? (
                                        <img src={p.image_url} alt={p.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="text-lg font-bold text-primary">{p.name.charAt(0)}</span>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-bold text-sm truncate">{p.name}</h4>
                                    <p className="text-xs text-muted">{p.category || 'Vários'} • Estoque: {p.stock_quantity}</p>
                                </div>
                                <div className="text-right shrink-0">
                                    <span className="text-primary font-bold">R$ {p.price.toFixed(2)}</span>
                                </div>
                                <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-primary rounded-xl p-2">
                                    <Plus className="w-5 h-5 text-white" />
                                </div>
                            </div>
                        ))}
                        {filteredProducts.length === 0 && (
                            <div className="text-center py-10 text-muted/50">
                                Nenhum produto encontrado
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 overflow-y-auto custom-scrollbar flex-1 pb-4">
                        {filteredProducts.map(p => (
                            <div
                                key={p.id}
                                onClick={() => addToCart(p)}
                                className="glass-card hover:border-primary/50 cursor-pointer group transition-all p-4 flex flex-col justify-between"
                            >
                                {/* Product Image */}
                                <div className="w-full aspect-square rounded-xl overflow-hidden bg-white/10 mb-3">
                                    {p.image_url ? (
                                        <img src={p.image_url} alt={p.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <span className="text-3xl font-bold text-primary">{p.name.charAt(0)}</span>
                                        </div>
                                    )}
                                </div>
                                <div className="space-y-1">
                                    <h4 className="font-bold text-sm truncate">{p.name}</h4>
                                    <p className="text-xs text-muted">{p.category || 'Vários'}</p>
                                </div>
                                <div className="mt-4 flex justify-between items-center">
                                    <span className="text-primary font-bold">R$ {p.price.toFixed(2)}</span>
                                    <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-primary rounded-lg p-1">
                                        <Plus className="w-4 h-4 text-white" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Cart Column */}
            <div className="w-full lg:w-[420px] xl:w-[480px] flex flex-col glass-card p-6 border-white/10">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <ShoppingCart className="text-primary w-6 h-6" />
                        Pedido
                    </h2>
                    <span className="text-sm bg-white/5 px-3 py-1 rounded-full text-muted">{cart.length} itens</span>
                </div>

                <div className="flex-1 min-h-0 overflow-y-auto space-y-3 mb-6 custom-scrollbar pr-2">
                    {cart.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-center opacity-30 select-none">
                            <ShoppingCart className="w-16 h-16 mb-4" />
                            <p>Carrinho vazio</p>
                        </div>
                    ) : cart.map(item => (
                        <div key={item.id} className="bg-white/5 border border-white/10 p-3 rounded-xl flex items-center justify-between gap-3 group hover:bg-white/[0.08] transition-all">
                            <div className="min-w-0 flex-1">
                                <p className="font-bold text-sm text-white truncate pr-2">{item.name}</p>
                                <p className="text-xs text-muted">
                                    {item.quantity}x R$ {item.price.toFixed(2)} = <span className="text-primary font-bold">R$ {(item.price * item.quantity).toFixed(2)}</span>
                                </p>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                                {/* Quantity Controls */}
                                <div className="flex items-center gap-1 bg-black/20 border border-white/5 rounded-lg p-1">
                                    <button
                                        onClick={() => updateQuantity(item.id, -1)}
                                        className="p-1 hover:bg-white/20 rounded-md transition-colors text-red-400"
                                    >
                                        <Minus className="w-3 h-3" />
                                    </button>
                                    <span className="font-mono font-bold text-xs text-white w-6 text-center">{item.quantity}</span>
                                    <button
                                        onClick={() => updateQuantity(item.id, 1)}
                                        className="p-1 hover:bg-white/20 rounded-md transition-colors text-green-400"
                                    >
                                        <Plus className="w-3 h-3" />
                                    </button>
                                </div>

                                <button
                                    onClick={() => removeFromCart(item.id)}
                                    className="p-1.5 text-red-500/50 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="pt-6 border-t border-white/10 space-y-4 shrink-0">
                    {/* Payment Method Selection */}
                    <div className="space-y-2">
                        <p className="text-xs text-muted font-bold uppercase tracking-wider">Forma de Pagamento</p>
                        <div className="grid grid-cols-2 gap-2">
                            <button
                                onClick={() => setPaymentMethod('DINHEIRO')}
                                className={cn(
                                    "flex items-center justify-center gap-2 p-3 rounded-2xl font-bold text-sm transition-all border",
                                    paymentMethod === 'DINHEIRO'
                                        ? "bg-green-500/20 border-green-500 text-green-400"
                                        : "bg-white/5 border-white/10 text-muted hover:border-white/30"
                                )}
                            >
                                <Banknote className="w-5 h-5" />
                                Dinheiro
                            </button>
                            <button
                                onClick={() => setPaymentMethod('CARTAO')}
                                className={cn(
                                    "flex items-center justify-center gap-2 p-3 rounded-2xl font-bold text-sm transition-all border",
                                    paymentMethod === 'CARTAO'
                                        ? "bg-blue-500/20 border-blue-500 text-blue-400"
                                        : "bg-white/5 border-white/10 text-muted hover:border-white/30"
                                )}
                            >
                                <CreditCard className="w-5 h-5" />
                                Cartão
                            </button>
                        </div>
                    </div>

                    <div className="flex justify-between items-center text-sm text-muted">
                        <span>Subtotal</span>
                        <span>R$ {total.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center bg-primary/10 p-4 rounded-2xl">
                        <span className="font-bold">Total</span>
                        <span className="text-2xl font-black text-primary">R$ {total.toFixed(2)}</span>
                    </div>

                    {/* Button States Logic */}
                    <button
                        onClick={handleMainButtonClick}
                        disabled={cart.length === 0 || loading}
                        className={cn(
                            "w-full py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 transition-all",
                            checkoutStatus === 'success'
                                ? "bg-green-500 text-white"
                                : operator
                                    ? "btn-primary shadow-lg shadow-primary/30"
                                    : "bg-amber-500 text-black hover:bg-amber-400 shadow-lg shadow-amber-500/20"
                        )}
                    >
                        {loading ? (
                            <Zap className="w-6 h-6 animate-spin" />
                        ) : checkoutStatus === 'success' ? (
                            <><CheckCircle2 className="w-6 h-6" /> Pago!</>
                        ) : (
                            <><Zap className="w-6 h-6 fill-white" /> Finalizar Venda {operator ? `(${operator})` : ''}</>
                        )}
                    </button>
                </div>
            </div>
            {/* Cashier Blocking Overlay */}
            {!currentSession && (
                <div className="absolute inset-0 z-[60] bg-black/60 backdrop-blur-sm flex items-center justify-center p-6 text-center animate-in fade-in duration-300 rounded-3xl">
                    <div className="max-w-xs space-y-6">
                        <div className="w-20 h-20 bg-amber-500/20 rounded-full flex items-center justify-center mx-auto border border-amber-500/30">
                            <Lock className="w-10 h-10 text-amber-500" />
                        </div>
                        <div className="space-y-2">
                            <h2 className="text-2xl font-black text-white italic uppercase">Caixa Fechado</h2>
                            <p className="text-muted text-sm font-medium">Você precisa abrir o caixa para realizar vendas e operações financeiras.</p>
                        </div>
                        <button
                            onClick={() => setShowCashierManager(true)}
                            className="w-full btn-primary py-4 text-lg"
                        >
                            Abrir Caixa Agora
                        </button>
                    </div>
                </div>
            )}

            <CashierManager isOpen={showCashierManager} onClose={() => setShowCashierManager(false)} />
        </div>
    );
};

export default POS;
