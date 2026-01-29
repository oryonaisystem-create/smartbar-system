import React, { useState, useEffect } from 'react';
import {
    Search, Plus, Minus, Trash2, Zap, ShoppingCart,
    X, CheckCircle2, Barcode, ChevronRight, Package, Users
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Product } from '../Inventory';
import { ProductScanner } from '../../components/ProductScanner';
import { OperatorGuardModal } from '../../components/OperatorGuardModal';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface CartItem extends Product {
    quantity: number;
}

const MobilePDV = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [cart, setCart] = useState<CartItem[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [showScanner, setShowScanner] = useState(false);
    const [showCart, setShowCart] = useState(false);
    const [loading, setLoading] = useState(false);
    const [checkoutStatus, setCheckoutStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [scanMessage, setScanMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const [showOperatorModal, setShowOperatorModal] = useState(false);

    const [operator, setOperator] = useState<string | null>(null);
    const [tableNumber, setTableNumber] = useState('');

    useEffect(() => {
        fetchProducts();

        // Subscribe to realtime changes on products table
        const channel = supabase
            .channel('mobile-pdv-products')
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

    const addToCart = (product: Product) => {
        const existing = cart.find(item => item.id === product.id);
        if (existing) {
            setCart(cart.map(item =>
                item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
            ));
        } else {
            setCart([...cart, { ...product, quantity: 1 }]);
        }
        // Feedback tátil visual
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

    const total = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);

    const handleCheckoutClick = () => {
        if (cart.length === 0) return;

        if (operator) {
            processCheckout(operator);
        } else {
            setShowOperatorModal(true);
        }
    };

    const handleOperatorConfirm = (name: string) => {
        setOperator(name);
        setShowOperatorModal(false);
    };

    const processCheckout = async (operatorName: string) => {
        setLoading(true);

        try {
            // Calculate total cost for reporting
            const totalCost = cart.reduce((sum, item) => sum + ((item.cost_price || 0) * item.quantity), 0);

            // Format description with Table/Comanda info if present
            const description = tableNumber ? `Mesa/Comanda ${tableNumber}` : '';

            const { data: tx, error: txError } = await supabase
                .from('transactions')
                .insert([{
                    type: 'sale',
                    total_amount: total,
                    payment_method: 'DINHEIRO',
                    operator: operatorName,
                    cost_price: totalCost,
                    description: description
                }])
                .select()
                .single();

            if (txError) throw txError;

            for (const item of cart) {
                await supabase.from('transaction_items').insert([{
                    transaction_id: tx.id,
                    product_id: item.id,
                    quantity: item.quantity,
                    unit_price: item.price,
                    unit_cost: item.cost_price || 0
                }]);

                await supabase.rpc('decrement_stock', {
                    row_id: item.id,
                    qty: item.quantity
                });
            }

            setCheckoutStatus('success');
            setCart([]);
            setTableNumber('');
            setShowOperatorModal(false);
            setOperator(null); // Reset operator after sale? Or keep? Reset seems safer for shared device.
            setTimeout(() => {
                setCheckoutStatus('idle');
                setShowCart(false);
            }, 2000);
        } catch (error: any) {
            console.error(error);
            setCheckoutStatus('error');
            alert(`Erro: ${error.message}`); // Show alert for debugging
        } finally {
            setLoading(false);
        }
    };

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="flex flex-col gap-6 animate-in fade-in duration-500 pb-20">
            <OperatorGuardModal
                isOpen={showOperatorModal}
                onClose={() => setShowOperatorModal(false)}
                onConfirm={handleOperatorConfirm}
                totalAmount={total}
            />

            {/* Header / Search */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    {/* Operator Badge */}
                    <button
                        onClick={() => setShowOperatorModal(true)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${operator
                            ? 'bg-primary text-white shadow-lg shadow-primary/20'
                            : 'bg-white/5 text-muted hover:bg-white/10'
                            }`}
                    >
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${operator ? 'bg-white/20' : 'bg-white/5'}`}>
                            <Users className="w-4 h-4" />
                        </div>
                        <div className="text-left">
                            <p className="text-[9px] font-black uppercase tracking-widest opacity-70">Operador</p>
                            <p className="text-xs font-bold truncate max-w-[100px]">{operator || 'Identificar'}</p>
                        </div>
                    </button>

                    <button
                        onClick={() => setShowScanner(true)}
                        className="p-3 bg-white/5 text-white rounded-xl active:scale-95 transition-all border border-white/5"
                    >
                        <Barcode className="w-6 h-6" />
                    </button>
                </div>

                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Buscar produto..."
                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-sm focus:ring-2 focus:ring-primary/50 outline-none transition-all"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Product List */}
            <div className="grid grid-cols-1 gap-2.5">
                {filteredProducts.map(p => (
                    <div
                        key={p.id}
                        onClick={() => addToCart(p)}
                        className="p-3 bg-white/[0.04] border border-white/10 rounded-2xl flex items-center justify-between active:scale-[0.98] active:bg-white/5 transition-all group shadow-sm"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/5 shadow-inner">
                                <Package className="w-4.5 h-4.5 text-muted group-active:text-primary transition-colors" />
                            </div>
                            <div>
                                <h4 className="text-white font-bold uppercase text-[11px] tracking-widest">{p.name}</h4>
                                <p className="text-primary font-black text-sm italic mt-0.5 tracking-tight">R$ {p.price.toFixed(2)}</p>
                            </div>
                        </div>
                        <div className="p-2 bg-primary/10 text-primary rounded-lg group-active:bg-primary group-active:text-white transition-all shadow-inner">
                            <Plus className="w-5 h-5" />
                        </div>
                    </div>
                ))}
            </div>

            {/* Floating Cart Button */}
            {cart.length > 0 && (
                <div className="fixed bottom-24 left-4 right-4 z-40 animate-in slide-in-from-bottom-5 duration-500">
                    <button
                        onClick={() => setShowCart(true)}
                        className="w-full bg-primary p-4 rounded-2xl shadow-[0_20px_50px_rgba(59,130,246,0.3)] flex items-center justify-between group active:scale-95 transition-all border border-white/10"
                    >
                        <div className="flex items-center gap-3">
                            <div className="bg-white/20 p-1.5 rounded-lg shadow-inner">
                                <ShoppingCart className="w-5 h-5 text-white" />
                                <span className="absolute -top-1.5 -right-1.5 bg-white text-primary text-[10px] font-black w-4.5 h-4.5 flex items-center justify-center rounded-full border border-primary shadow-sm">
                                    {cart.length}
                                </span>
                            </div>
                            <span className="text-white font-black uppercase text-xs tracking-widest drop-shadow-sm">Finalizar Venda</span>
                        </div>
                        <span className="text-white font-black text-lg italic drop-shadow-md">R$ {total.toFixed(2)}</span>
                    </button>
                </div>
            )}

            {/* Cart Sheet */}
            {showCart && (
                <div className="fixed inset-0 z-[100] animate-in fade-in duration-300">
                    <div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={() => setShowCart(false)} />
                    <div className="absolute bottom-0 left-0 right-0 max-h-[85vh] bg-[#0f172a] rounded-t-3xl border-t border-white/10 p-6 flex flex-col animate-in slide-in-from-bottom duration-500">
                        <div className="w-10 h-1 bg-white/10 rounded-full mx-auto mb-6" onClick={() => setShowCart(false)} />

                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-black text-white italic tracking-tighter">Seu <span className="text-primary italic">Pedido</span></h2>
                            <button onClick={() => setShowCart(false)} className="p-1.5 bg-white/5 rounded-full text-muted"><X className="w-5 h-5" /></button>
                        </div>

                        <div className="flex-1 min-h-0 overflow-y-auto space-y-3 mb-6 custom-scrollbar">
                            {cart.map(item => (
                                <div key={item.id} className="p-4 bg-white/5 border border-white/10 rounded-2xl flex items-start gap-3">
                                    <div className="flex-1 min-w-0">
                                        <p className="text-white font-black uppercase text-[11px] tracking-wide leading-snug">{item.name}</p>
                                        <p className="text-primary font-bold text-xs mt-1">R$ {item.price.toFixed(2)}</p>
                                    </div>
                                    <div className="flex items-center gap-3 shrink-0">
                                        <div className="flex items-center bg-black/20 border border-white/5 rounded-xl p-1">
                                            <button onClick={() => updateQuantity(item.id, -1)} className="p-2 text-red-400 hover:text-white rounded-lg active:bg-white/10 transition-colors"><Minus className="w-4 h-4" /></button>
                                            <span className="w-8 text-center text-white font-black text-sm">{item.quantity}</span>
                                            <button onClick={() => updateQuantity(item.id, 1)} className="p-2 text-green-400 hover:text-white rounded-lg active:bg-white/10 transition-colors"><Plus className="w-4 h-4" /></button>
                                        </div>
                                        <button onClick={() => removeFromCart(item.id)} className="p-2.5 bg-red-500/10 text-red-500 rounded-xl active:bg-red-500 active:text-white transition-colors"><Trash2 className="w-4.5 h-4.5" /></button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="space-y-3">
                            <div className="bg-white/5 border border-white/10 rounded-2xl p-3">
                                <label className="text-[10px] font-black uppercase tracking-widest text-muted block mb-2 px-1">Mesa / Comanda</label>
                                <input
                                    type="text"
                                    placeholder="Ex: 12"
                                    value={tableNumber}
                                    onChange={(e) => setTableNumber(e.target.value)}
                                    className="w-full bg-black/20 border border-white/5 rounded-xl py-3 px-4 text-white font-bold text-lg outline-none focus:ring-2 focus:ring-primary/50 transition-all placeholder:text-gray-600"
                                />
                            </div>

                            <div className="p-4 bg-primary/10 border border-primary/20 rounded-2xl flex items-center justify-between">
                                <span className="text-muted font-black uppercase text-[9px] tracking-widest">Valor Final</span>
                                <span className="text-2xl font-black text-primary italic tracking-tighter">R$ {total.toFixed(2)}</span>
                            </div>

                            <button
                                onClick={handleCheckoutClick}
                                disabled={loading}
                                className={cn(
                                    "w-full py-4 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 transition-all active:scale-95",
                                    checkoutStatus === 'success' ? "bg-green-500 text-white" : "bg-primary text-white shadow-xl shadow-primary/20"
                                )}
                            >
                                {loading ? (
                                    <Zap className="w-5 h-5 animate-spin" />
                                ) : checkoutStatus === 'success' ? (
                                    <CheckCircle2 className="w-5 h-5" />
                                ) : (
                                    <><Zap className="w-5 h-5 fill-white" /> Finalizar {operator ? `(${operator})` : ''}</>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Scanner Modal */}
            {showScanner && (
                <div className="fixed inset-0 z-[200] bg-black p-4 flex flex-col">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-white font-black uppercase text-sm">Scanner de Produtos</h3>
                        <button onClick={() => { setShowScanner(false); setScanMessage(null); }} className="p-2 bg-white/10 rounded-full text-white"><X className="w-6 h-6" /></button>
                    </div>

                    {/* Scan Message */}
                    {scanMessage && (
                        <div className={`mb-4 p-3 rounded-xl flex items-center gap-2 font-black text-xs uppercase tracking-widest ${scanMessage.type === 'success' ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'
                            }`}>
                            {scanMessage.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <X className="w-4 h-4" />}
                            {scanMessage.text}
                        </div>
                    )}

                    <div className="flex-1 rounded-3xl overflow-hidden border-2 border-primary/20 relative">
                        <ProductScanner onScanSuccess={(code) => {
                            const p = products.find(prod => prod.barcode === code);
                            if (p) {
                                addToCart(p);
                                setScanMessage({ type: 'success', text: `${p.name} adicionado!` });
                                setTimeout(() => {
                                    setShowScanner(false);
                                    setScanMessage(null);
                                }, 1000);
                            } else {
                                setScanMessage({ type: 'error', text: `Produto não cadastrado: ${code}` });
                            }
                        }} />
                        <div className="absolute inset-x-0 top-1/2 h-0.5 bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.5)] animate-pulse" />
                    </div>
                    <p className="text-muted text-center text-xs mt-6 px-10">Aponte a câmera para o código de barras para adicionar ao pedido automaticamente.</p>
                </div>
            )}
        </div>
    );
};

export default MobilePDV;
