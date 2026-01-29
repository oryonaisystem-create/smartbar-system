import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { ChefHat, Search, Eye, EyeOff, Package, AlertCircle, Loader2, Edit3, Check, X } from 'lucide-react';
import { Product, getStockStatus } from './Inventory';
import { useViewport } from '../hooks/useViewport';
import { clsx } from 'clsx';
import { cn } from '../lib/utils';

export const MenuManager = () => {
    const { isMobile } = useViewport();
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [updatingId, setUpdatingId] = useState<string | null>(null);
    const [editingPriceId, setEditingPriceId] = useState<string | null>(null);
    const [tempPrice, setTempPrice] = useState<string>('');

    const fetchProducts = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('products')
            .select('*')
            .order('category', { ascending: true });

        if (error) {
            console.error('❌ Error fetching products:', error);
        } else {
            setProducts(data || []);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchProducts();

        const channel = supabase
            .channel('menu-manager-realtime')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'products' },
                () => {
                    fetchProducts();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    const toggleMenuVisibility = async (product: Product) => {
        setUpdatingId(product.id);
        const newValue = !product.show_on_menu;

        const { error } = await supabase
            .from('products')
            .update({ show_on_menu: newValue })
            .eq('id', product.id);

        if (error) {
            alert('Erro ao atualizar cardápio: ' + error.message);
        } else {
            setProducts(prev => prev.map(p => p.id === product.id ? { ...p, show_on_menu: newValue } : p));
        }
        setUpdatingId(null);
    };

    const updatePrice = async (product: Product) => {
        const newPrice = parseFloat(tempPrice.replace(',', '.'));
        if (isNaN(newPrice)) return;

        setUpdatingId(product.id);
        const { error } = await supabase
            .from('products')
            .update({ price: newPrice })
            .eq('id', product.id);

        if (error) {
            alert('Erro ao atualizar preço: ' + error.message);
        } else {
            setProducts(prev => prev.map(p => p.id === product.id ? { ...p, price: newPrice } : p));
            setEditingPriceId(null);
        }
        setUpdatingId(null);
    };

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.category?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white/5 p-6 rounded-3xl border border-white/10 backdrop-blur-md gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
                        <ChefHat className="text-primary w-8 h-8" />
                        Gerenciar Cardápio
                    </h1>
                    <p className="text-muted mt-1">Controle o que seus clientes veem no menu digital das mesas.</p>
                </div>
                <div className="relative w-full md:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted w-4 h-4" />
                    <input
                        type="text"
                        placeholder="Buscar produto ou categoria..."
                        className="w-full bg-black/20 border border-white/10 rounded-xl py-2 pl-10 pr-4 outline-none focus:border-primary/50 transition-all text-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </header>

            {loading ? (
                <div className="h-64 flex flex-col items-center justify-center gap-4 text-muted">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    <p className="animate-pulse">Carregando catálogo...</p>
                </div>
            ) : filteredProducts.length === 0 ? (
                <div className="bg-white/5 border border-white/5 rounded-3xl p-12 text-center">
                    <AlertCircle className="w-12 h-12 text-muted/30 mx-auto mb-4" />
                    <h3 className="text-lg font-bold text-white">Nenhum produto encontrado</h3>
                    <p className="text-muted max-w-xs mx-auto mt-2">Certifique-se de que existem produtos cadastrados no estoque.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredProducts.map(product => {
                        const status = getStockStatus(product);
                        const isVisible = product.show_on_menu !== false; // Default to true if null
                        const isUpdating = updatingId === product.id;

                        return (
                            <div
                                key={product.id}
                                className={clsx(
                                    "glass-card p-5 border transition-all duration-300 group",
                                    isVisible ? "border-white/10 bg-white/5" : "border-white/5 bg-white/[0.02] opacity-70 grayscale-[0.5]"
                                )}
                            >
                                <div className="flex gap-4">
                                    <div className="w-20 h-20 rounded-2xl bg-black/40 flex items-center justify-center shrink-0 border border-white/5 relative overflow-hidden">
                                        {product.image_url ? (
                                            <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <Package className="text-muted/30 w-8 h-8" />
                                        )}
                                        <div className={clsx(
                                            "absolute top-1 right-1 px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-tighter",
                                            status.color
                                        )}>
                                            {status.label}
                                        </div>
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-start gap-2">
                                            <h3 className="font-bold text-white text-lg leading-tight truncate">{product.name}</h3>
                                            {editingPriceId === product.id ? (
                                                <div className="flex items-center gap-1 bg-black/40 rounded-lg p-1 border border-primary/30">
                                                    <input
                                                        autoFocus
                                                        type="text"
                                                        value={tempPrice}
                                                        onChange={(e) => setTempPrice(e.target.value)}
                                                        className="w-16 bg-transparent text-xs font-black text-primary outline-none text-right"
                                                    />
                                                    <button onClick={() => updatePrice(product)} className="p-1 text-green-500"><Check className="w-3 h-3" /></button>
                                                    <button onClick={() => setEditingPriceId(null)} className="p-1 text-red-500"><X className="w-3 h-3" /></button>
                                                </div>
                                            ) : (
                                                <span
                                                    onClick={() => {
                                                        if (isMobile) {
                                                            setEditingPriceId(product.id);
                                                            setTempPrice(product.price.toString());
                                                        }
                                                    }}
                                                    className={cn(
                                                        "text-xs font-black text-primary bg-primary/10 px-2 py-0.5 rounded-lg flex items-center gap-1",
                                                        isMobile && "cursor-pointer hover:bg-primary/20"
                                                    )}
                                                >
                                                    {product.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                                    {isMobile && <Edit3 className="w-2.5 h-2.5 opacity-50" />}
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-[10px] uppercase font-black tracking-widest text-muted/60 mt-1">{product.category || 'Sem Categoria'}</p>

                                        <div className="flex items-center justify-between mt-4">
                                            <span className={clsx(
                                                "text-[10px] font-black uppercase tracking-widest flex items-center gap-2",
                                                isVisible ? "text-green-400" : "text-red-400"
                                            )}>
                                                {isVisible ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                                                {isVisible ? 'Vísivel no Menu' : 'Oculto'}
                                            </span>

                                            <button
                                                onClick={() => toggleMenuVisibility(product)}
                                                disabled={isUpdating}
                                                className={clsx(
                                                    "px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                                                    isVisible
                                                        ? "bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white"
                                                        : "bg-green-500/10 text-green-500 hover:bg-green-500 hover:text-white",
                                                    isUpdating && "opacity-50 cursor-wait"
                                                )}
                                            >
                                                {isUpdating ? 'Salvando...' : isVisible ? 'Ocultar' : 'Mostrar'}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};
