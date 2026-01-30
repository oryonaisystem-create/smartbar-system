import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Package, Search, Plus } from 'lucide-react';
import { ProductScanner } from '../components/ProductScanner';
import { ProductModal } from '../components/ProductModal';
import { LoadingState } from '../components/ui/LoadingState';
import { ErrorMessage } from '../components/ui/ErrorMessage';

export interface Product {
    id: string;
    name: string;
    barcode: string;
    price: number;
    cost_price: number;
    stock_quantity: number;
    min_stock_alert: number;
    category: string;
    image_url?: string;
    description?: string;
    show_on_menu?: boolean;
}

export const getStockStatus = (p: Product) => {
    if (p.stock_quantity === 0) return { label: "ESGOTADO", color: "bg-red-600", textColor: "text-white" };
    if (p.stock_quantity <= p.min_stock_alert)
        return { label: "CRÍTICO", color: "bg-red-500/20 text-red-500", textColor: "text-red-500" };
    if (p.stock_quantity <= p.min_stock_alert * 1.5)
        return { label: "BAIXO", color: "bg-yellow-500/20 text-yellow-500", textColor: "text-yellow-500" };

    return { label: "NORMAL", color: "bg-green-500/20 text-green-500", textColor: "text-green-500" };
};

const Inventory = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showScanner, setShowScanner] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    // Modal states
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [scannedBarcode, setScannedBarcode] = useState<string | null>(null);

    const fetchProducts = async () => {
        setLoading(true);
        setError(null);
        try {
            const { data, error } = await supabase
                .from('products')
                .select('*')
                .order('name');

            if (error) {
                console.error('❌ Erro Supabase (Estoque):', error);
                throw error;
            }
            if (data) {
                console.log('📦 Produtos recebidos:', data.length);
                setProducts(data);
            } else {
                console.warn('⚠️ Nenhum dado retornado do Supabase (Array nulo)');
            }
        } catch (error: any) {
            console.error('Erro ao buscar produtos:', error);
            setError(error.message || 'Erro desconhecido ao carregar estoque.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();

        // Subscribe to realtime changes on products table
        const channel = supabase
            .channel('inventory-realtime')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'products' },
                (payload) => {
                    console.log('📦 Inventory: Realtime update received', payload);
                    fetchProducts();
                }
            )
            .subscribe((status) => {
                console.log('📦 Inventory: Realtime subscription status:', status);
            });

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    const handleScanSuccess = async (code: string) => {
        setShowScanner(false);
        setSearchTerm(code);
        const product = products.find(p => p.barcode === code);
        if (product) {
            setSelectedProduct(product);
            setScannedBarcode(null);
            setIsModalOpen(true);
        } else {
            // Create new product with this barcode
            setSelectedProduct(null);
            setScannedBarcode(code); // Store the barcode to pre-fill the modal
            setIsModalOpen(true);
        }
    };

    const openNewProduct = () => {
        setSelectedProduct(null);
        setScannedBarcode(null); // Clear scanned barcode when opening manually
        setIsModalOpen(true);
    };

    const openEditProduct = (p: Product) => {
        setSelectedProduct(p);
        setIsModalOpen(true);
    };

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.barcode?.includes(searchTerm)
    );

    if (loading) return <LoadingState message="Carregando estoque..." />;
    if (error) return <ErrorMessage message={error} onRetry={fetchProducts} />;

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold">Estoque</h1>
                    <p className="text-muted">Gerencie seus produtos e níveis de suprimento</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => setShowScanner(!showScanner)}
                        className="btn-outline flex items-center gap-2"
                    >
                        <Search className="w-5 h-5" />
                        Scanner
                    </button>
                    <button
                        onClick={openNewProduct}
                        className="btn-primary flex items-center gap-2"
                    >
                        <Plus className="w-5 h-5" />
                        Novo Produto
                    </button>
                </div>
            </div>

            {showScanner && (
                <div className="max-w-md mx-auto">
                    <ProductScanner onScanSuccess={handleScanSuccess} />
                </div>
            )}

            <div className="glass-card overflow-hidden border-white/5 shadow-2xl">
                <div className="p-5 border-b border-white/5 bg-white/[0.02] backdrop-blur-sm">
                    <div className="relative max-w-md">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted/50 w-4.5 h-4.5 group-focus-within:text-primary transition-colors" />
                        <input
                            type="text"
                            placeholder="Buscar por nome ou código..."
                            className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-11 pr-4 focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder:text-muted/30 text-white font-medium text-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full border-separate border-spacing-0">
                        <thead>
                            <tr className="text-left bg-white/[0.03] text-muted text-[10px] font-black uppercase tracking-[0.15em] border-b border-white/10">
                                <th className="px-5 py-3.5 first:pl-8">Produto</th>
                                <th className="px-5 py-3.5">Atalho</th>
                                <th className="px-5 py-3.5">Preço</th>
                                <th className="px-5 py-3.5 text-center">Qtd</th>
                                <th className="px-5 py-3.5 text-center">Status</th>
                                <th className="px-5 py-3.5 pr-8 text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {loading ? (
                                <tr><td colSpan={6} className="text-center py-10 text-muted">Carregando estoque...</td></tr>
                            ) : filteredProducts.length === 0 ? (
                                <tr><td colSpan={6} className="text-center py-10 text-muted">Nenhum produto encontrado.</td></tr>
                            ) : filteredProducts.map((p) => {
                                const status = getStockStatus(p);
                                return (
                                    <tr
                                        key={p.id}
                                        onClick={() => openEditProduct(p)}
                                        className="hover:bg-white/[0.03] transition-colors border-b border-white/5 last:border-0 group cursor-pointer"
                                    >
                                        <td className="px-5 py-4 first:pl-8">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center group-hover:bg-primary/10 transition-all border border-white/10 overflow-hidden">
                                                    {p.image_url ? (
                                                        <img
                                                            src={p.image_url}
                                                            alt={p.name}
                                                            className="w-full h-full object-cover"
                                                            onError={(e) => {
                                                                (e.target as HTMLImageElement).src = '';
                                                                (e.target as HTMLImageElement).className = 'hidden';
                                                            }}
                                                        />
                                                    ) : (
                                                        <Package className="text-muted/50 w-5 h-5" />
                                                    )}
                                                </div>
                                                <div className="flex flex-col min-w-0">
                                                    <span className="font-bold text-white text-sm truncate">{p.name}</span>
                                                    <span className="text-[10px] text-muted font-mono tracking-tight uppercase">{p.barcode || 'Sem código'}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-5 py-4">
                                            <span className="text-[10px] font-black bg-white/5 px-2 py-0.5 rounded-lg border border-white/5 text-muted/70 uppercase tracking-widest">{p.category || 'N/A'}</span>
                                        </td>
                                        <td className="px-5 py-4 font-bold text-sm text-primary italic">R$ {p.price.toFixed(2)}</td>
                                        <td className="px-5 py-4 text-white font-bold text-center text-sm">{p.stock_quantity}</td>
                                        <td className="px-5 py-4 text-center">
                                            <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${status.color} ${status.textColor} border border-current/10`}>
                                                {status.label}
                                            </span>
                                        </td>
                                        <td className="px-5 py-4 pr-8 text-right">
                                            <button
                                                onClick={(e) => { e.stopPropagation(); openEditProduct(p); }}
                                                className="text-primary hover:text-primary/80 text-sm font-semibold transition-colors"
                                            >
                                                Editar
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            <ProductModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={fetchProducts}
                product={selectedProduct}
                initialBarcode={scannedBarcode || undefined}
            />
        </div>
    );
};

export default Inventory;
