import React, { useState, useEffect } from 'react';
import { X, Save, Package, DollarSign, Barcode, Tag, FolderOpen, Plus, Image as ImageIcon, Upload, Loader2, Eye } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Product } from '../pages/Inventory';

// Predefined categories
const PREDEFINED_CATEGORIES = [
    'Bebidas',
    'Cervejas',
    'Destilados',
    'Vinhos',
    'Refrigerantes',
    'Energéticos',
    'Águas',
    'Sucos',
    'Petiscos',
    'Outros'
];

interface ProductModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: () => void;
    product?: Product | null;
    initialBarcode?: string;
}

export const ProductModal = ({ isOpen, onClose, onSave, product, initialBarcode }: ProductModalProps) => {
    const [formData, setFormData] = useState({
        name: '',
        barcode: '',
        price: 0,
        cost_price: 0,
        stock_quantity: 0,
        min_stock_alert: 5,
        category: '',
        image_url: '',
        description: '',
        show_on_menu: true
    });
    const [loading, setLoading] = useState(false);
    const [customCategory, setCustomCategory] = useState('');
    const [showCustomInput, setShowCustomInput] = useState(false);
    const [existingCategories, setExistingCategories] = useState<string[]>([]);
    const [uploading, setUploading] = useState(false);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;

        const file = e.target.files[0];
        setUploading(true);

        try {
            console.log('🚀 Iniciando upload...', file.name);

            // VERIFY_BUCKET: Ensure the 'products' bucket exists in your Supabase storage.
            // Client side cannot create buckets without Service Role key.

            const fileExt = file.name.split('.').pop();
            const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
            const filePath = `${fileName}`;

            console.log('📤 Enviando para:', filePath);

            const { data, error: uploadError } = await supabase.storage
                .from('products')
                .upload(filePath, file, {
                    cacheControl: '3600',
                    upsert: false
                });

            if (uploadError) {
                console.error('❌ Supabase Upload Error:', uploadError);
                throw uploadError;
            }

            const { data: publicData } = supabase.storage
                .from('products')
                .getPublicUrl(filePath);

            if (!publicData?.publicUrl) {
                throw new Error('Failed to get public URL');
            }

            console.log('✅ Upload concluído! URL:', publicData.publicUrl);
            setFormData(prev => ({ ...prev, image_url: publicData.publicUrl }));

        } catch (error: any) {
            console.error('❌ Erro no Upload:', error);

            if (error.message?.includes('bucket') || error.error === 'Bucket not found' || error.status === 404) {
                alert('⚠️ O bucket "products" não foi encontrado.\n\nPor favor, crie um bucket PÚBLICO chamado "products" no painel do Supabase (Storage).');
            } else {
                alert(`❌ Falha no Upload: ${error.message || 'Erro de conexão ou permissão'}`);
            }
        } finally {
            setUploading(false);
            e.target.value = ''; // Reset input
        }
    };

    // ... useEffect ...

    useEffect(() => {
        if (product) {
            setFormData({
                name: product.name,
                barcode: product.barcode || '',
                price: product.price,
                cost_price: product.cost_price,
                stock_quantity: product.stock_quantity,
                min_stock_alert: product.min_stock_alert,
                category: product.category || '',
                image_url: product.image_url || '',
                description: product.description || '',
                show_on_menu: product.show_on_menu !== false
            });
            setShowCustomInput(false);
        } else {
            setFormData({
                name: '',
                barcode: initialBarcode || '',
                price: 0,
                cost_price: 0,
                stock_quantity: 0,
                min_stock_alert: 5,
                category: '',
                image_url: '',
                description: '',
                show_on_menu: true
            });
            setShowCustomInput(false);
            setCustomCategory('');
        }
    }, [product, isOpen, initialBarcode]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        // Use custom category if provided
        const finalCategory = showCustomInput && customCategory
            ? customCategory
            : formData.category;

        const dataToSave = { ...formData, category: finalCategory };

        try {
            if (product) {
                const { error } = await supabase
                    .from('products')
                    .update(dataToSave)
                    .eq('id', product.id);
                if (error) throw error;
            } else {
                const { error } = await supabase
                    .from('products')
                    .insert([dataToSave]);
                if (error) throw error;
            }
            onSave();
            onClose();
        } catch (error: any) {
            console.error('Erro detalhado:', error);
            // Check for common errors
            if (error.message?.includes('violates foreign key constraint')) {
                alert('Erro de relacionamento no banco de dados.');
            } else if (error.code === '42703') { // Undefined column
                alert(`Erro: A coluna 'image_url' parece não existir no banco de dados. Por favor, atualize a tabela 'products'.\nDetalhes: ${error.message}`);
            } else {
                alert(`Erro ao salvar produto: ${error.message || JSON.stringify(error)}`);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="glass-card w-[95%] sm:w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200 max-h-[85vh] sm:max-h-[90vh] overflow-y-auto flex flex-col">
                <div className="p-4 sm:p-6 border-b border-white/10 flex justify-between items-center bg-white/5 sticky top-0 z-10 backdrop-blur-md">
                    <h2 className="text-lg sm:text-xl font-bold flex items-center gap-2 text-white">
                        <Package className="text-primary w-5 h-5" />
                        {product ? 'Editar Produto' : 'Novo Produto'}
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors text-muted hover:text-white">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 overflow-y-auto custom-scrollbar">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                            <label className="text-xs sm:text-sm font-medium text-muted mb-1.5 block">Nome do Produto</label>
                            <div className="relative">
                                <Tag className="absolute left-3 top-1/2 -translate-y-1/2 text-muted/50 w-4 h-4" />
                                <input
                                    required
                                    type="text"
                                    placeholder="Ex: Heineken 330ml"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 focus:ring-2 focus:ring-primary/50 outline-none transition-all text-white placeholder:text-muted/30"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="md:col-span-2">
                            <label className="text-xs sm:text-sm font-medium text-muted mb-1.5 block italic">Descrição no Cardápio Digital</label>
                            <textarea
                                placeholder="Descreva o produto para os clientes (Ex: 100% Malte, 330ml...)"
                                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:ring-2 focus:ring-primary/50 outline-none transition-all text-white placeholder:text-muted/30 resize-none h-20"
                                value={formData.description}
                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                            />
                        </div>

                        <div className="md:col-span-2">
                            <div className="flex items-center justify-between p-4 bg-primary/10 border border-primary/20 rounded-2xl">
                                <div className="flex items-center gap-3">
                                    <Eye className="w-5 h-5 text-primary" />
                                    <div>
                                        <p className="text-sm font-bold text-white leading-none">Mostrar no Cardápio Digital</p>
                                        <p className="text-[10px] text-primary/70 uppercase tracking-widest mt-1">Visível para clientes nas mesas</p>
                                    </div>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="sr-only peer"
                                        checked={formData.show_on_menu}
                                        onChange={e => setFormData({ ...formData, show_on_menu: e.target.checked })}
                                    />
                                    <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                                </label>
                            </div>
                        </div>

                        <div className="md:col-span-2">
                            <div className="mb-1.5 flex justify-between items-center">
                                <label className="text-xs sm:text-sm font-medium text-muted">Imagem do Produto</label>
                            </div>

                            <div className="border-dashed border-2 border-white/10 rounded-xl p-1 hover:border-primary/50 hover:bg-white/5 transition-all relative group bg-black/20">
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileUpload}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                    disabled={uploading}
                                />
                                {uploading ? (
                                    <div className="h-32 flex flex-col items-center justify-center gap-3">
                                        <Loader2 className="w-8 h-8 text-primary animate-spin" />
                                        <span className="text-xs font-bold text-muted animate-pulse">Enviando...</span>
                                    </div>
                                ) : formData.image_url ? (
                                    <div className="relative h-48 w-full rounded-lg overflow-hidden bg-black/50 flex items-center justify-center group-hover:opacity-80 transition-all">
                                        <img
                                            src={formData.image_url}
                                            alt="Preview"
                                            className="h-full w-full object-contain"
                                        />
                                        <div className="absolute inset-0 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/60 backdrop-blur-sm">
                                            <Upload className="w-8 h-8 text-white mb-2" />
                                            <span className="text-white text-xs font-bold uppercase tracking-widest">Alterar Imagem</span>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="h-32 flex flex-col items-center justify-center gap-2 text-muted group-hover:text-primary transition-colors">
                                        <div className="p-3 rounded-full bg-white/5 group-hover:bg-primary/10 transition-colors">
                                            <ImageIcon className="w-6 h-6" />
                                        </div>
                                        <div className="text-center">
                                            <p className="text-sm font-bold">Clique para enviar uma foto</p>
                                            <p className="text-[10px] uppercase tracking-widest opacity-60 mt-1">PNG, JPG ou GIF</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Category Selection */}
                        <div className="md:col-span-2">
                            <label className="text-xs sm:text-sm font-medium text-muted mb-1.5 block">Categoria</label>
                            <div className="space-y-2">
                                {/* Category buttons */}
                                <div className="flex flex-wrap gap-2">
                                    {existingCategories.map(cat => (
                                        <button
                                            key={cat}
                                            type="button"
                                            onClick={() => {
                                                setFormData({ ...formData, category: cat });
                                                setShowCustomInput(false);
                                            }}
                                            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all border ${formData.category === cat && !showCustomInput
                                                ? 'bg-primary border-primary text-white'
                                                : 'bg-white/5 border-white/10 text-muted hover:border-primary/50 hover:text-white'
                                                }`}
                                        >
                                            {cat}
                                        </button>
                                    ))}
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowCustomInput(true);
                                            setFormData({ ...formData, category: '' });
                                        }}
                                        className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all border flex items-center gap-1 ${showCustomInput
                                            ? 'bg-primary border-primary text-white'
                                            : 'bg-white/5 border-white/10 text-muted hover:border-primary/50 hover:text-white'
                                            }`}
                                    >
                                        <Plus className="w-3 h-3" />
                                        Nova
                                    </button>
                                </div>

                                {/* Custom category input */}
                                {showCustomInput && (
                                    <div className="relative animate-in fade-in slide-in-from-top-2 duration-200">
                                        <FolderOpen className="absolute left-3 top-1/2 -translate-y-1/2 text-muted/50 w-4 h-4" />
                                        <input
                                            type="text"
                                            placeholder="Digite o nome da nova categoria"
                                            className="w-full bg-white/5 border border-primary/50 rounded-xl py-3 pl-10 pr-4 focus:ring-2 focus:ring-primary/50 outline-none transition-all text-white"
                                            value={customCategory}
                                            onChange={e => setCustomCategory(e.target.value)}
                                            autoFocus
                                        />
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="md:col-span-2">
                            <label className="text-xs sm:text-sm font-medium text-muted mb-1.5 block">Código de Barras (EAN)</label>
                            <div className="relative">
                                <Barcode className="absolute left-3 top-1/2 -translate-y-1/2 text-muted/50 w-4 h-4" />
                                <input
                                    type="text"
                                    placeholder="Escaneie ou digite o código"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 focus:ring-2 focus:ring-primary/50 outline-none transition-all text-white tracking-widest font-mono"
                                    value={formData.barcode}
                                    onChange={e => setFormData({ ...formData, barcode: e.target.value })}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="text-xs sm:text-sm font-medium text-muted mb-1.5 block">Preço de Venda</label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted/50 text-sm">R$</span>
                                <input
                                    required
                                    type="number"
                                    step="0.01"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 focus:ring-2 focus:ring-primary/50 outline-none transition-all text-white font-bold"
                                    value={formData.price}
                                    onChange={e => {
                                        const val = parseFloat(e.target.value);
                                        setFormData({ ...formData, price: isNaN(val) ? 0 : val });
                                    }}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="text-xs sm:text-sm font-medium text-muted mb-1.5 block">Custo Unitário</label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted/50 text-sm">R$</span>
                                <input
                                    required
                                    type="number"
                                    step="0.01"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 focus:ring-2 focus:ring-primary/50 outline-none transition-all text-white"
                                    value={formData.cost_price}
                                    onChange={e => {
                                        const val = parseFloat(e.target.value);
                                        setFormData({ ...formData, cost_price: isNaN(val) ? 0 : val });
                                    }}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="text-xs sm:text-sm font-medium text-muted mb-1.5 block">Estoque Inicial</label>
                            <input
                                required
                                type="number"
                                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:ring-2 focus:ring-primary/50 outline-none transition-all text-white"
                                value={formData.stock_quantity}
                                onChange={e => {
                                    const val = parseInt(e.target.value);
                                    setFormData({ ...formData, stock_quantity: isNaN(val) ? 0 : val });
                                }}
                            />
                        </div>

                        <div>
                            <label className="text-xs sm:text-sm font-medium text-muted mb-1.5 block">Alerta de Estoque Mínimo</label>
                            <input
                                required
                                type="number"
                                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:ring-2 focus:ring-primary/50 outline-none transition-all text-white"
                                value={formData.min_stock_alert}
                                onChange={e => {
                                    const val = parseInt(e.target.value);
                                    setFormData({ ...formData, min_stock_alert: isNaN(val) ? 0 : val });
                                }}
                            />
                        </div>
                    </div>

                    <div className="pt-4 flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 btn-outline py-3"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 btn-primary py-3 flex items-center justify-center gap-2"
                        >
                            {loading ? 'Salvando...' : (
                                <>
                                    <Save className="w-5 h-5" />
                                    Salvar
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

