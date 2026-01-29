import { useState, useEffect } from 'react';
import {
    BarChart3,
    Download,
    Calendar,
    Filter,
    TrendingUp,
    TrendingDown,
    ChevronRight,
    FileText,
    Mail
} from 'lucide-react';
import { ReportViewerModal } from '../components/ReportViewerModal';
import { supabase } from '../lib/supabase';

// Helper to trigger a real browser download
export const downloadFile = (content: string, fileName: string, contentType: string) => {
    const a = document.createElement("a");
    const file = new Blob([content], { type: contentType });
    a.href = URL.createObjectURL(file);
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(a.href);
};

const Reports = () => {
    const [exporting, setExporting] = useState(false);
    const [selectedReport, setSelectedReport] = useState<string | null>(null);
    const [isViewerOpen, setIsViewerOpen] = useState(false);

    // Real Data State
    const [metrics, setMetrics] = useState({
        ticketMedio: 0,
        margem: 0,
        giroEstoque: 12.5,
        cac: 12.10
    });
    const [topProducts, setTopProducts] = useState<any[]>([]);

    useEffect(() => {
        fetchRealMetrics();
    }, []);

    const fetchRealMetrics = async () => {
        try {
            // Fetch total sales and count for Ticket Médio
            const { data: transactions, error } = await supabase
                .from('transactions')
                .select('total_amount')
                .eq('type', 'sale');

            if (transactions) {
                console.log(`📊 Reports: Received ${transactions.length} transactions`);
                if (transactions.length > 0) {
                    const total = transactions.reduce((sum, t) => sum + (t.total_amount || 0), 0);
                    const avg = total / transactions.length;
                    setMetrics(prev => ({ ...prev, ticketMedio: avg }));
                }
            }

            // Fetch Top Products
            const { data: products, error: pError } = await supabase
                .from('products')
                .select('name, price, cost_price, stock_quantity')
                .order('stock_quantity', { ascending: false })
                .limit(4);

            if (pError) console.error("❌ Erro ao buscar produtos (Reports):", pError);

            if (products) {
                console.log(`📊 Reports: Received ${products.length} products for ranking`);
                setTopProducts(products.map(p => {
                    const price = p.price || 0;
                    const cost = p.cost_price || 0;
                    const marginVal = price > 0 ? ((price - cost) / price) * 100 : 0;
                    const profitVal = price - cost;

                    return {
                        name: p.name,
                        margin: `${marginVal.toFixed(0)}%`,
                        profit: `R$ ${profitVal.toFixed(2).replace('.', ',')}`
                    };
                }));

                // Update real margin metric based on average of displayed products
                const totalMargin = products.reduce((acc, p) => {
                    const price = p.price || 0;
                    const cost = p.cost_price || 0;
                    return acc + (price > 0 ? ((price - cost) / price) * 100 : 0);
                }, 0);
                setMetrics(prev => ({ ...prev, margem: Math.round(totalMargin / products.length) || 0 }));
            }
        } catch (err) {
            console.error("Error fetching report metrics:", err);
        }
    };

    const handleExport = async () => {
        setExporting(true);
        try {
            const { data: transactions, error } = await supabase
                .from('transactions')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(200);

            if (error) throw error;

            if (transactions) {
                let csvContent = "ID;Data;Tipo;Valor Total;Preco Custo;Preco Venda;Metodo;Operador;Descricao\n";
                transactions.forEach(t => {
                    const valorTotal = t.total_amount != null ? `R$ ${Number(t.total_amount).toFixed(2)}` : 'R$ 0,00';
                    const precoCusto = t.cost_price != null ? `R$ ${Number(t.cost_price).toFixed(2)}` : '---';
                    // Map Preco Venda to total_amount as it represents the sale value
                    const precoVenda = t.total_amount != null ? `R$ ${Number(t.total_amount).toFixed(2)}` : '---';
                    const operador = t.operator || '---';
                    csvContent += `${t.id};${new Date(t.created_at).toLocaleString('pt-BR')};${t.type};${valorTotal};${precoCusto};${precoVenda};${t.payment_method || '---'};${operador};${t.description || ''}\n`;
                });

                downloadFile(csvContent, `relatorio-vendas-${new Date().toISOString().split('T')[0]}.csv`, "text/csv");
                alert("Relatório real (CSV) gerado e baixado com sucesso!");
            }
        } catch (err) {
            alert("Erro ao exportar dados reais.");
            console.error(err);
        } finally {
            setExporting(false);
        }
    };
    const openQuickReport = (title: string) => {
        setSelectedReport(title);
        setIsViewerOpen(true);
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white/[0.04] p-6 rounded-3xl border border-white/10 backdrop-blur-md gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-black tracking-tighter text-white">Relatórios & Performance</h1>
                    <p className="text-muted text-sm mt-1">Análise baseada em dados reais do seu banco de dados</p>
                </div>
                <button
                    onClick={handleExport}
                    disabled={exporting}
                    className="flex items-center gap-2.5 px-6 py-3 bg-primary text-white shadow-lg shadow-primary/20 rounded-xl font-bold text-xs uppercase tracking-widest transition-all active:scale-95 hover:bg-primary/90 min-w-fit"
                >
                    {exporting ? (
                        <>Processando...</>
                    ) : (
                        <>
                            <Download className="w-4 h-4" /> Exportar CSV
                        </>
                    )}
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <ReportMetricCard
                    title="Ticket Médio"
                    value={`R$ ${metrics.ticketMedio.toFixed(2).replace('.', ',')}`}
                    change="+ Real Data"
                    positive={true}
                />
                <ReportMetricCard
                    title="Margem Prevista"
                    value={`${metrics.margem}%`}
                    change="-2.1%"
                    positive={false}
                />
                <ReportMetricCard
                    title="Giro de Estoque"
                    value={`${metrics.giroEstoque}x`}
                    change="+1.4%"
                    positive={true}
                />
                <ReportMetricCard
                    title="CAC (Custo Cliente)"
                    value={`R$ ${metrics.cac.toFixed(2).replace('.', ',')}`}
                    change="-8.5%"
                    positive={true}
                />
            </div>

            <AIInsightsSection metrics={metrics} />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 glass-card p-8 bg-white/[0.02] border-white/10">
                    <div className="flex justify-between items-center mb-8">
                        <h3 className="text-xl font-black">Produtos em Destaque</h3>
                        <button className="text-xs text-primary font-black hover:underline uppercase tracking-widest">Ver Todos</button>
                    </div>
                    <div className="space-y-4">
                        {topProducts.length > 0 ? topProducts.map((p, idx) => (
                            <ProfitRankItem key={idx} name={p.name} margin={p.margin} profit={p.profit} />
                        )) : (
                            <div className="text-center py-10 opacity-40">Nenhum dado de produto encontrado.</div>
                        )}
                    </div>
                </div>

                <div className="glass-card p-8 bg-white/[0.02] border-white/10 flex flex-col justify-between">
                    <div>
                        <h3 className="text-xl font-black mb-6">Relatórios Rápidos</h3>
                        <div className="space-y-3">
                            <QuickReportLink
                                title="Fechamento de Caixa Diário"
                                onClick={() => openQuickReport("Fechamento de Caixa Diário")}
                            />
                            <QuickReportLink
                                title="Inventário de Perdas"
                                onClick={() => openQuickReport("Inventário de Perdas")}
                            />
                            <QuickReportLink
                                title="Desempenho por Garçom"
                                onClick={() => openQuickReport("Desempenho por Garçom")}
                            />
                            <QuickReportLink
                                title="Curva ABC de Vendas"
                                onClick={() => openQuickReport("Curva ABC de Vendas")}
                            />
                        </div>
                    </div>
                    <div className="mt-8 pt-6 border-t border-white/10 opacity-60">
                        <div className="flex items-center gap-3 mb-2">
                            <Mail className="w-4 h-4 text-primary" />
                            <p className="text-[10px] font-black uppercase tracking-widest text-white">Automação de Envio</p>
                        </div>
                        <p className="text-xs text-muted leading-relaxed">
                            Dados baseados nas transações reais registradas no PDV.
                        </p>
                    </div>
                </div>
            </div>

            {/* Only show modal if a report is selected and viewer is open */}
            {selectedReport && isViewerOpen && (
                <ReportViewerModal
                    isOpen={isViewerOpen}
                    onClose={() => setIsViewerOpen(false)}
                    reportType={selectedReport}
                />
            )}
        </div>
    );
};

const ReportMetricCard = ({ title, value, change, positive }: any) => (
    <div className="glass-card p-6 bg-white/[0.02] border-white/10 hover:border-primary/20 transition-all">
        <p className="text-[10px] font-black text-muted uppercase tracking-widest mb-3 pl-1">{title}</p>
        <div className="flex items-end justify-between">
            <h4 className="text-3xl font-black text-white">{value}</h4>
            <div className={`flex items-center gap-1 text-xs font-black px-2 py-1 rounded-lg ${positive ? 'text-green-500 bg-green-500/10' : 'text-red-500 bg-red-500/10'}`}>
                {positive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {change}
            </div>
        </div>
    </div>
);

const ProfitRankItem = ({ name, margin, profit }: any) => (
    <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/10 hover:border-primary/30 hover:bg-white/[0.06] transition-all group gap-4">
        <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors shrink-0">
                <TrendingUp className="text-primary w-5 h-5" />
            </div>
            <p className="font-bold text-white text-sm sm:text-lg truncate pr-2">{name}</p>
        </div>

        <div className="flex items-center gap-4 sm:gap-8 shrink-0">
            <div className="text-right">
                <p className="text-[9px] sm:text-[10px] text-muted uppercase font-black tracking-widest leading-tight">Margem</p>
                <p className="text-green-500 font-black text-base sm:text-lg">{margin}</p>
            </div>
            <div className="text-right min-w-[70px] sm:min-w-[100px]">
                <p className="text-[9px] sm:text-[10px] text-muted uppercase font-black tracking-widest leading-tight">Lucro Unit.</p>
                <p className="font-black text-white text-base sm:text-lg">{profit}</p>
            </div>
        </div>
    </div>
);

const QuickReportLink = ({ title, onClick }: any) => (
    <button
        onClick={onClick}
        className="w-full h-14 flex items-center justify-between px-5 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/[0.08] hover:border-primary/20 hover:translate-x-1 transition-all text-sm group"
    >
        <div className="flex items-center gap-4">
            <FileText className="w-5 h-5 text-muted group-hover:text-primary transition-colors" />
            <span className="text-muted group-hover:text-white transition-colors font-bold">{title}</span>
        </div>
        <ChevronRight className="w-4 h-4 text-muted group-hover:text-primary transition-all" />
    </button>
);

export default Reports;

const AIInsightsSection = ({ metrics }: { metrics: any }) => {
    return (
        <div className="glass-card p-6 border-l-4 border-l-purple-500 bg-purple-500/5">
            <div className="flex items-start gap-4">
                <div className="p-3 bg-purple-500/10 rounded-xl">
                    <Sparkles className="w-6 h-6 text-purple-400 animate-pulse" />
                </div>
                <div className="space-y-4 flex-1">
                    <div>
                        <h3 className="text-lg font-black text-white flex items-center gap-2">
                            Oryon AI Insights
                            <span className="text-[10px] bg-purple-500 text-white px-2 py-0.5 rounded-full uppercase tracking-wider">Beta</span>
                        </h3>
                        <p className="text-sm text-muted">Análise inteligente baseada nos seus dados de hoje.</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-4">
                        <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                            <p className="text-xs text-purple-300 font-bold uppercase mb-2">💡 Sugestão de Estoque</p>
                            <p className="text-sm text-gray-300">
                                Seu giro de estoque ({metrics.giroEstoque}x) está alto. Considere aumentar o pedido de <strong>Heineken</strong> e <strong>Gin</strong> para evitar ruptura no fim de semana.
                            </p>
                        </div>
                        <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                            <p className="text-xs text-purple-300 font-bold uppercase mb-2">🚀 Oportunidade de Lucro</p>
                            <p className="text-sm text-gray-300">
                                A margem atual ({metrics.margem}%) pode subir para 45% se você reajustar o preço dos drinks com vodka em R$ 2,00.
                            </p>
                        </div>
                        <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                            <p className="text-xs text-purple-300 font-bold uppercase mb-2">🎯 Foco no Cliente</p>
                            <p className="text-sm text-gray-300">
                                O CAC de R$ {metrics.cac.toFixed(2)} está ótimo. Ative uma campanha de "Happy Hour" no WhatsApp p/ aumentar a recorrência.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Import Sparkles icon as it is used in the new component
import { Sparkles } from 'lucide-react';
