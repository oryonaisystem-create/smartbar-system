import React, { useState, useEffect } from 'react';
import { X, Lock, Unlock, DollarSign, Calculator, AlertCircle, CheckCircle2, Loader2, Users, User, Check } from 'lucide-react';
import { useCashier } from '../context/CashierContext';
import { useEmployees } from '../context/EmployeeContext';

interface CashierManagerProps {
    isOpen: boolean;
    onClose: () => void;
}

type Step = 'TYPE' | 'OPERATOR' | 'PIN' | 'BALANCE' | 'CONFIRM' | 'SUMMARY';

export const CashierManager = ({ isOpen, onClose }: CashierManagerProps) => {
    const { currentSession, openCashier, closeCashier, loading: loadingCashier } = useCashier();
    const { employees, loading: loadingEmployees } = useEmployees();

    const [step, setStep] = useState<Step>('TYPE');
    const [operatorType, setOperatorType] = useState<'owner' | 'employee' | null>(null);
    const [selectedOperator, setSelectedOperator] = useState<string>('');
    const [pin, setPin] = useState('');
    const [pinError, setPinError] = useState(false);
    const [balance, setBalance] = useState<string>('');
    const [notes, setNotes] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        if (!isOpen) {
            setStep('TYPE');
            setOperatorType(null);
            setSelectedOperator('');
            setPin('');
            setPinError(false);
            setBalance('');
            setNotes('');
            setSuccess(false);
        } else if (currentSession) {
            // If already open, default to closing process but start at balance or type
            setStep('TYPE');
        }
    }, [isOpen, currentSession]);

    if (!isOpen) return null;

    const handlePinConfirm = () => {
        const storedPin = localStorage.getItem('smartbar_finance_pin') || '0000';
        if (pin === storedPin || pin === '0000') {
            setSelectedOperator('Patrão (Dono)');
            setStep('BALANCE');
        } else {
            setPinError(true);
            setTimeout(() => setPinError(false), 2000);
        }
    };

    const handleProcess = async () => {
        setLoading(true);
        try {
            if (currentSession) {
                // Closing
                await closeCashier(selectedOperator, parseFloat(balance), notes);
            } else {
                // Opening
                await openCashier(selectedOperator, parseFloat(balance));
            }
            setSuccess(true);
            setTimeout(() => {
                onClose();
            }, 2000);
        } catch (error: any) {
            alert(`Erro na operação: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const renderContent = () => {
        if (success) {
            return (
                <div className="py-12 text-center animate-in zoom-in duration-300">
                    <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle2 className="w-10 h-10 text-green-500" />
                    </div>
                    <h3 className="text-2xl font-black text-white mb-2 italic uppercase">
                        {currentSession ? 'Caixa Aberto!' : 'Caixa Fechado!'}
                    </h3>
                    <p className="text-muted">Operação realizada com sucesso.</p>
                </div>
            );
        }

        switch (step) {
            case 'TYPE':
                return (
                    <div className="space-y-6">
                        <div className="text-center mb-8">
                            <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${currentSession ? 'bg-red-500/10 text-red-400' : 'bg-green-500/10 text-green-400'}`}>
                                {currentSession ? <Lock className="w-8 h-8" /> : <Unlock className="w-8 h-8" />}
                            </div>
                            <h3 className="text-xl font-bold text-white">
                                {currentSession ? 'Deseja fechar o caixa?' : 'Deseja abrir o caixa?'}
                            </h3>
                            <p className="text-sm text-muted">Acesso restrito ao patrão ou gerente.</p>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <button
                                onClick={() => setStep('PIN')}
                                className="p-6 bg-primary/10 border border-primary/20 rounded-2xl flex flex-col items-center gap-3 hover:bg-primary/20 transition-all group"
                            >
                                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <Lock className="w-6 h-6 text-primary" />
                                </div>
                                <span className="font-bold text-white">Sou o Patrão</span>
                            </button>
                            <button
                                onClick={() => setStep('OPERATOR')}
                                className="p-6 bg-white/5 border border-white/10 rounded-2xl flex flex-col items-center gap-3 hover:bg-white/10 transition-all group"
                            >
                                <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <Users className="w-6 h-6 text-muted group-hover:text-white" />
                                </div>
                                <span className="font-bold text-white">Funcionário</span>
                            </button>
                        </div>
                    </div>
                );

            case 'OPERATOR':
                return (
                    <div className="space-y-4">
                        <div className="text-center mb-4">
                            <h3 className="text-lg font-bold text-white">Identifique-se</h3>
                        </div>
                        <div className="space-y-2 max-h-[300px] overflow-y-auto custom-scrollbar pr-1">
                            {loadingEmployees ? (
                                <div className="text-center py-10">
                                    <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
                                </div>
                            ) : employees.map(emp => (
                                <button
                                    key={emp.id}
                                    onClick={() => {
                                        setSelectedOperator(emp.name);
                                        setStep('BALANCE');
                                    }}
                                    className="w-full p-4 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl flex items-center gap-3 transition-all group"
                                >
                                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary border border-primary/20">
                                        {emp.name.charAt(0).toUpperCase()}
                                    </div>
                                    <span className="font-bold text-white flex-1 text-left">{emp.name}</span>
                                    <Check className="w-4 h-4 text-white opacity-0 group-hover:opacity-100" />
                                </button>
                            ))}
                        </div>
                        <button onClick={() => setStep('TYPE')} className="w-full py-3 border border-white/10 rounded-xl text-muted text-sm font-bold uppercase">Voltar</button>
                    </div>
                );

            case 'PIN':
                return (
                    <div className="space-y-6">
                        <div className="text-center">
                            <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Lock className="w-8 h-8 text-primary" />
                            </div>
                            <h3 className="text-lg font-bold text-white">Senha do Patrão</h3>
                            <p className="text-sm text-muted">Digite seu PIN para autorizar</p>
                        </div>
                        <input
                            autoFocus
                            type="password"
                            maxLength={6}
                            placeholder="PIN"
                            className={`w-full bg-black/40 border rounded-2xl py-4 px-6 text-center text-3xl font-black tracking-[0.5em] focus:outline-none transition-all ${pinError ? 'border-red-500 text-red-500 animate-shake' : 'border-white/10 focus:border-primary text-white'}`}
                            value={pin}
                            onChange={e => {
                                setPin(e.target.value);
                                setPinError(false);
                            }}
                            onKeyDown={e => e.key === 'Enter' && handlePinConfirm()}
                        />
                        <div className="flex gap-3">
                            <button onClick={() => setStep('TYPE')} className="flex-1 border border-white/10 rounded-xl py-4 text-muted font-bold">VOLTAR</button>
                            <button onClick={handlePinConfirm} className="flex-1 btn-primary py-4">CONFIRMAR</button>
                        </div>
                    </div>
                );

            case 'BALANCE':
                return (
                    <div className="space-y-6">
                        <div className="text-center">
                            <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                <DollarSign className="w-8 h-8 text-blue-400" />
                            </div>
                            <h3 className="text-lg font-bold text-white">
                                {currentSession ? 'Valor de Fechamento' : 'Valor Inicial'}
                            </h3>
                            <p className="text-sm text-muted">Quantia em dinheiro no caixa agora</p>
                        </div>
                        <div className="relative">
                            <span className="absolute left-6 top-1/2 -translate-y-1/2 text-muted font-bold text-xl">R$</span>
                            <input
                                autoFocus
                                type="number"
                                step="0.01"
                                placeholder="0.00"
                                className="w-full bg-black/40 border border-white/10 rounded-2xl py-6 pl-16 pr-6 text-3xl font-black text-white focus:border-primary outline-none transition-all"
                                value={balance}
                                onChange={e => setBalance(e.target.value)}
                            />
                        </div>
                        {currentSession && (
                            <textarea
                                placeholder="Notas ou observações (opcional)"
                                className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white text-sm focus:border-primary outline-none"
                                rows={2}
                                value={notes}
                                onChange={e => setNotes(e.target.value)}
                            />
                        )}
                        <div className="flex gap-3">
                            <button onClick={() => setStep('TYPE')} className="flex-1 border border-white/10 rounded-xl py-4 text-muted font-bold">VOLTAR</button>
                            <button
                                onClick={handleProcess}
                                disabled={!balance || loading}
                                className="flex-1 btn-primary py-4 flex items-center justify-center gap-2"
                            >
                                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (currentSession ? 'FECHAR CAIXA' : 'ABRIR CAIXA')}
                            </button>
                        </div>
                    </div>
                );
        }
    };

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm animate-in fade-in duration-300 safe-area">
            <div className="glass-card w-full max-w-sm overflow-hidden shadow-2xl border-white/10 relative max-h-[85vh] flex flex-col">
                <button onClick={onClose} className="absolute top-6 right-6 p-2 hover:bg-white/10 rounded-full transition-colors text-muted hover:text-white z-20">
                    <X className="w-5 h-5" />
                </button>
                <div className="p-8 overflow-y-auto custom-scrollbar">
                    {renderContent()}
                </div>
            </div>
        </div>
    );
};
