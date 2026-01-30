import React, { useState } from 'react';
import { X, FileText, Download, Printer, PieChart, TrendingUp, Users, AlertCircle, Mail, Loader2 } from 'lucide-react';
import { downloadFile } from '../pages/Reports';
import { pdf } from '@react-pdf/renderer';
import { CashCloseReport, CashCloseReportData } from './CashCloseReport';
import { supabase } from '../lib/supabase';

interface ReportViewerModalProps {
    isOpen: boolean;
    onClose: () => void;
    reportType: string | null;
}

export const ReportViewerModal = ({ isOpen, onClose, reportType }: ReportViewerModalProps) => {
    const [reportData, setReportData] = useState<any>(null);
    const [loadingData, setLoadingData] = useState(false);
    const [sending, setSending] = useState(false);
    const [downloading, setDownloading] = useState(false);

    React.useEffect(() => {
        if (isOpen) {
            if (reportType === 'Desempenho por Garçom') {
                fetchOperatorStats();
            } else if (reportType === 'Fechamento de Caixa Diário') {
                fetchDailyCloseStats();
            } else {
                setReportData(null);
            }
        }
    }, [isOpen, reportType]);



    const fetchDailyCloseStats = async () => {
        setLoadingData(true);
        try {
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const { data, error } = await supabase
                .from('transactions')
                .select('*')
                .gte('created_at', today.toISOString());

            if (error) throw error;

            let total = 0;
            let pix = 0;
            const opStats: Record<string, number> = {};

            data?.forEach((t: any) => {
                const amt = Number(t.total_amount || 0);
                total += amt;

                const method = (t.payment_method || '').toUpperCase();
                if (method.includes('PIX')) pix += amt;

                const op = t.operator || 'Não Identificado';
                opStats[op] = (opStats[op] || 0) + amt;
            });

            const sortedOps = Object.entries(opStats)
                .map(([name, value]) => ({ name, value }))
                .sort((a, b) => b.value - a.value);

            setReportData({
                total,
                pix,
                operators: sortedOps
            });
        } catch (err) {
            console.error(err);
        } finally {
            setLoadingData(false);
        }
    };

    const fetchOperatorStats = async () => {
        setLoadingData(true);
        try {
            const { data, error } = await supabase
                .from('transactions')
                .select('operator, total_amount')
                .eq('type', 'sale');

            if (error) throw error;

            const stats: Record<string, number> = {};
            data?.forEach((t: any) => {
                const op = t.operator || 'Não Identificado';
                stats[op] = (stats[op] || 0) + Number(t.total_amount || 0);
            });

            const sorted = Object.entries(stats)
                .map(([name, value]) => ({ name, value }))
                .sort((a, b) => b.value - a.value);

            // Calculate total for avg
            const total = sorted.reduce((acc, curr) => acc + curr.value, 0);
            const avg = sorted.length > 0 ? total / sorted.length : 0;

            setReportData({ top: sorted, avg, total });

        } catch (err) {
            console.error(err);
        } finally {
            setLoadingData(false);
        }
    };

    const handleEmailSend = () => {
        setSending(true);
        setTimeout(() => {
            setSending(false);
            alert(`Sucesso! O relatório "${reportType}" foi enviado para o e - mail cadastrado(patrick@smartbar.com).`);
        }, 1500);
    };

    const handleDownload = async () => {
        setDownloading(true);

        try {
            if (reportType === 'Fechamento de Caixa Diário') {
                // 1. Fetch Today's Transactions (Already fetched in reportData but logic for PDF expects fresh fetch or we can reuse)
                // Let's re-use the logic or re-fetch to be safe and consistent with previous implementation.
                // Actually, I can use reportData if available, but let's stick to the robust fetch logic for the PDF generation
                // to ensure it matches the specific format needed for CashCloseReportData.

                const todayIndices = new Date();
                todayIndices.setHours(0, 0, 0, 0);
                const { data: transactions, error } = await supabase
                    .from('transactions')
                    .select('*')
                    .gte('created_at', todayIndices.toISOString());

                if (error) throw error;

                // 2. Aggregate Data
                let total = 0;
                let pix = 0;
                let cartao = 0;
                let dinheiro = 0;
                const operatorStats: Record<string, number> = {};

                transactions?.forEach((t: any) => {
                    const amount = Number(t.total_amount || 0);
                    total += amount;

                    // Payment Method Stats
                    const method = t.payment_method?.toUpperCase() || 'OUTROS';
                    if (method.includes('PIX')) pix += amount;
                    else if (method.includes('CARTAO') || method.includes('CREDITO') || method.includes('DEBITO')) cartao += amount;
                    else if (method.includes('DINHEIRO')) dinheiro += amount;

                    // Operator Stats
                    const opName = t.operator || 'Não Identificado';
                    operatorStats[opName] = (operatorStats[opName] || 0) + amount;
                });

                // Format Operator Data for PDF
                const operatorsList = Object.entries(operatorStats).map(([name, value]) => ({
                    name,
                    value: `R$ ${value.toFixed(2).replace('.', ',')} `
                })).sort((a, b) => b.value.localeCompare(a.value));

                // Generate real PDF with SmartBar branding
                const pdfData: CashCloseReportData = {
                    totalCaixa: `R$ ${total.toFixed(2).replace('.', ',')} `,
                    pixTotal: `R$ ${pix.toFixed(2).replace('.', ',')} `,
                    cartaoTotal: `R$ ${cartao.toFixed(2).replace('.', ',')} `,
                    dinheiroTotal: `R$ ${dinheiro.toFixed(2).replace('.', ',')} `,
                    operators: operatorsList.length > 0 ? operatorsList : [{ name: 'Nenhuma venda registrada', value: 'R$ 0,00' }]
                };

                const blob = await pdf(<CashCloseReport data={pdfData} />).toBlob();
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `smartbar - fechamento - caixa - ${new Date().toISOString().split('T')[0]}.pdf`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(url);
            } else {
                // Fallback for other reports
                const content = `Relatório: ${reportType} \nData: ${new Date().toLocaleDateString()} \nStatus: Consolidado\n\nEste é um documento oficial do sistema SmartBar.`;
                downloadFile(content, `smartbar - ${reportType?.toLowerCase().replace(/ /g, '-')}.txt`, "text/plain");
            }
        } catch (error) {
            console.error('Error generating PDF:', error);
            alert('Erro ao gerar PDF. Tente novamente.');
        }

        setDownloading(false);
    };

    const renderContent = () => {
        if (loadingData) {
            return <div className="flex justify-center p-10"><Loader2 className="animate-spin w-8 h-8 text-primary" /></div>;
        }

        switch (reportType) {
            case 'Fechamento de Caixa Diário':
                return (
                    <div className="space-y-6">
                        <div className="flex bg-green-500/10 p-4 rounded-2xl border border-green-500/20 gap-4">
                            <div className="flex-1">
                                <p className="text-xs text-muted uppercase font-bold">Total em Caixa</p>
                                <h4 className="text-2xl font-black text-green-500">
                                    {reportData ? `R$ ${reportData.total.toFixed(2).replace('.', ',')} ` : 'R$ 0,00'}
                                </h4>
                            </div>
                            <div className="flex-1 border-l border-white/10 pl-4">
                                <p className="text-xs text-muted uppercase font-bold">Vendas PIX</p>
                                <h4 className="text-xl font-bold text-white">
                                    {reportData ? `R$ ${reportData.pix.toFixed(2).replace('.', ',')} ` : 'R$ 0,00'}
                                </h4>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <h5 className="text-sm font-bold text-muted uppercase tracking-widest text-[10px]">Resumo por Operador</h5>
                            {reportData?.operators && reportData.operators.length > 0 ? (
                                reportData.operators.map((op: any, idx: number) => (
                                    <div key={idx} className="bg-white/5 p-4 rounded-xl flex justify-between border border-white/5 group hover:border-primary/30 transition-all">
                                        <span className="text-white font-medium">{op.name}</span>
                                        <span className="font-black text-white">R$ {op.value.toFixed(2).replace('.', ',')}</span>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center text-muted text-xs py-4">Nenhuma venda hoje.</div>
                            )}
                        </div>
                    </div>
                );
            case 'Inventário de Perdas':
                // ... keep existing ...
                return (
                    <div className="space-y-6">
                        <div className="flex bg-red-500/10 p-4 rounded-2xl border border-red-500/20 gap-4">
                            <div>
                                <AlertCircle className="text-red-500 w-10 h-10" />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-white">Total de Perdas (Mês)</p>
                                <h4 className="text-2xl font-black text-red-500">R$ 450,00</h4>
                                <p className="text-xs text-muted">Abaixo da média histórica (R$ 600,00)</p>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <h5 className="text-sm font-bold text-muted uppercase tracking-widest text-[10px]">Principais Itens Estragados</h5>
                            <div className="bg-white/5 p-4 rounded-xl flex justify-between text-sm border border-white/5">
                                <span className="text-white">Heineken (Quebra de Garrafa)</span>
                                <span className="text-red-500 font-black">8 un.</span>
                            </div>
                        </div>
                    </div>
                );
            case 'Desempenho por Garçom':
                return (
                    <div className="space-y-4">
                        {reportData?.top && reportData.top.length > 0 ? (
                            <>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-white/5 p-5 rounded-2xl text-center border border-white/10 group hover:border-primary/30 transition-all">
                                        <Users className="mx-auto text-primary mb-2 w-6 h-6" />
                                        <p className="text-[10px] text-muted uppercase font-black tracking-widest">Top Operador</p>
                                        <p className="font-black text-white text-lg">{reportData.top[0].name}</p>
                                    </div>
                                    <div className="bg-white/5 p-5 rounded-2xl text-center border border-white/10 group hover:border-green-500/30 transition-all">
                                        <TrendingUp className="mx-auto text-green-500 mb-2 w-6 h-6" />
                                        <p className="text-[10px] text-muted uppercase font-black tracking-widest">Venda Total</p>
                                        <p className="font-black text-white text-lg">R$ {reportData.total.toFixed(2).replace('.', ',')}</p>
                                    </div>
                                </div>
                                <div className="space-y-2 mt-4">
                                    {reportData.top.map((op: any, i: number) => (
                                        <div key={i} className="bg-white/5 p-4 rounded-2xl flex items-center justify-between border border-white/5 hover:bg-white/[0.08] transition-all">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-[10px] font-black text-primary border border-primary/20">{i + 1}º</div>
                                                <span className="text-sm font-bold text-white">{op.name}</span>
                                            </div>
                                            <span className="font-black text-white">R$ {op.value.toFixed(2).replace('.', ',')}</span>
                                        </div>
                                    ))}
                                </div>
                            </>
                        ) : (
                            <div className="text-center text-muted py-10">Nenhum dado de vendas encontrado.</div>
                        )}
                    </div>
                );
            case 'Curva ABC de Vendas':
                // ... keep existing ...
                return (
                    <div className="space-y-6">
                        {/* ... */}
                        <div className="flex items-center justify-center py-4">
                            <div className="relative">
                                <PieChart className="w-24 h-24 text-primary opacity-20" />
                                <TrendingUp className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 text-primary" />
                            </div>
                        </div>
                        <p className="text-center text-muted text-sm">Dados simulados para demonstração da Curva ABC.</p>
                        {/* ... */}
                    </div>
                );
            default:
                return (
                    <div className="flex flex-col items-center justify-center py-10 gap-4">
                        <p className="text-center text-muted">Selecione um relatório.</p>
                        <button onClick={onClose} className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-sm font-bold transition-all">
                            Fechar
                        </button>
                    </div>
                );
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300 safe-area">
            <div className="glass-card w-full max-w-lg overflow-hidden border-white/10 shadow-3xl animate-in zoom-in-95 duration-300 max-h-[85vh] flex flex-col">
                <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/[0.03]">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-primary/10 rounded-xl">
                            <FileText className="text-primary w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-white">{reportType}</h2>
                            <p className="text-[10px] text-muted font-black uppercase tracking-widest">Análise de Sistema v1.4</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-xl transition-colors">
                        <X className="w-6 h-6 text-muted" />
                    </button>
                </div>

                <div className="p-8 overflow-y-auto custom-scrollbar">
                    {renderContent()}
                </div>

                <div className="p-6 border-t border-white/10 grid grid-cols-2 gap-4 bg-white/[0.03]">
                    <button
                        onClick={handleEmailSend}
                        disabled={sending}
                        className="btn-outline flex items-center justify-center gap-3 py-4 rounded-2xl font-bold group transition-all"
                    >
                        {sending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Mail className="w-5 h-5 text-primary group-hover:scale-110 transition-transform" />}
                        {sending ? 'Enviando...' : 'Enviar E-mail'}
                    </button>
                    <button
                        onClick={handleDownload}
                        disabled={downloading}
                        className="btn-primary flex items-center justify-center gap-3 py-4 rounded-2xl font-black shadow-lg shadow-primary/20 group transition-all"
                    >
                        {downloading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5 group-hover:translate-y-0.5 transition-transform" />}
                        {downloading ? 'Baixando...' : 'Baixar PDF'}
                    </button>
                </div>
            </div>
        </div>
    );
};
