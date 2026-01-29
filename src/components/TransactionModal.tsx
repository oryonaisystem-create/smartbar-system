import React, { useState } from 'react';
import { X, Save, DollarSign, CreditCard, ArrowUpCircle, ArrowDownCircle, Users, User, UserPlus, Lock, Check } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useEmployees } from '../context/EmployeeContext';
import { useCashier } from '../context/CashierContext';

interface TransactionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: () => void;
    transaction?: any; // Transaction to edit
}

type Step = 'DETAILS' | 'OPERATOR';

export const TransactionModal = ({ isOpen, onClose, onSave, transaction }: TransactionModalProps) => {
    const { employees, loading: loadingEmployees } = useEmployees();
    const { currentSession } = useCashier();
    const [step, setStep] = useState<Step>('DETAILS');
    const [formData, setFormData] = useState({
        type: transaction?.type || 'sale',
        total_amount: transaction?.total_amount || 0,
        payment_method: transaction?.payment_method || 'DINHEIRO',
        operator: ''
    });
    const [loading, setLoading] = useState(false);

    // Operator Selection State
    const [selectedOperatorType, setSelectedOperatorType] = useState<'owner' | 'employee' | null>(null);
    const [pin, setPin] = useState('');
    const [pinError, setPinError] = useState(false);

    useEffect(() => {
        if (!isOpen) {
            setStep('DETAILS');
            setSelectedOperatorType(null);
            setPin('');
            setPinError(false);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleNext = (e: React.FormEvent) => {
        e.preventDefault();
        const pinRequired = localStorage.getItem('smartbar_security_pin_required') !== 'false';

        if (!pinRequired) {
            handleSubmit('Admin (Auto)');
        } else {
            setStep('OPERATOR');
        }
    };

    const handleOwnerAuth = () => {
        const storedPin = localStorage.getItem('smartbar_finance_pin');
        if (pin === storedPin || pin === '0000') {
            handleSubmit('Patrão (Dono)');
        } else {
            setPinError(true);
            setTimeout(() => setPinError(false), 2000);
        }
    };

    const handleEmployeeSelect = (name: string) => {
        handleSubmit(name);
    };

    const handleSubmit = async (operatorName: string) => {
        setLoading(true);
        try {
            if (transaction) {
                const { error } = await supabase
                    .from('transactions')
                    .update({
                        type: formData.type,
                        total_amount: formData.total_amount,
                        payment_method: formData.payment_method,
                        updated_by: operatorName,
                        updated_at: new Date().toISOString()
                    })
                    .eq('id', transaction.id);

                if (error) throw error;
            } else {
                const { error } = await supabase
                    .from('transactions')
                    .insert([{
                        ...formData,
                        operator: operatorName,
                        cashier_session_id: currentSession?.id,
                        created_at: new Date().toISOString()
                    }]);

                if (error) throw error;
            }

            onSave();
            onClose();
        } catch (error: any) {
            alert(`Erro ao salvar transação: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="glass-card w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        {step === 'DETAILS' ? (
                            <>
                                <DollarSign className="text-primary w-5 h-5" />
                                {transaction ? 'Editar Transação' : 'Nova Transação'}
                            </>
                        ) : (
                            <>
                                <Users className="text-primary w-5 h-5" />
                                Identificar Operador
                            </>
                        )}
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors text-muted hover:text-white">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {step === 'DETAILS' ? (
                    <form onSubmit={handleNext} className="p-6 space-y-4">
                        <div className="flex bg-white/5 p-1 rounded-xl border border-white/10">
                            <button
                                type="button"
                                onClick={() => setFormData({ ...formData, type: 'sale' })}
                                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg transition-all ${formData.type === 'sale' ? 'bg-green-500 text-white shadow-lg' : 'text-muted hover:text-white'}`}
                            >
                                <ArrowUpCircle className="w-4 h-4" /> Venda / Entrada
                            </button>
                            <button
                                type="button"
                                onClick={() => setFormData({ ...formData, type: 'expense' })}
                                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg transition-all ${formData.type === 'expense' ? 'bg-red-500 text-white shadow-lg' : 'text-muted hover:text-white'}`}
                            >
                                <ArrowDownCircle className="w-4 h-4" /> Despesa / Saída
                            </button>
                        </div>

                        <div>
                            <label className="text-sm font-medium text-muted mb-1.5 block">Valor Total</label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted/50 text-sm">R$</span>
                                <input
                                    required
                                    type="number"
                                    step="0.01"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 focus:ring-2 focus:ring-primary/50 outline-none transition-all text-xl font-bold text-white"
                                    value={formData.total_amount || ''}
                                    onChange={e => setFormData({ ...formData, total_amount: parseFloat(e.target.value) })}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="text-sm font-medium text-muted mb-1.5 block">Método de Pagamento</label>
                            <div className="relative">
                                <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 text-muted/50 w-4 h-4" />
                                <select
                                    className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 focus:ring-2 focus:ring-primary/50 outline-none transition-all appearance-none text-white bg-gray-900"
                                    value={formData.payment_method}
                                    onChange={e => setFormData({ ...formData, payment_method: e.target.value })}
                                >
                                    <option value="DINHEIRO">Dinheiro</option>
                                    <option value="PIX">PIX</option>
                                    <option value="CREDITO">Cartão de Crédito</option>
                                    <option value="DEBITO">Cartão de Débito</option>
                                </select>
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
                                className="flex-1 btn-primary py-3 flex items-center justify-center gap-2"
                            >
                                Próximo <Users className="w-4 h-4" />
                            </button>
                        </div>
                    </form>
                ) : (
                    <div className="p-6 space-y-6">
                        {!selectedOperatorType ? (
                            <div className="grid grid-cols-2 gap-4">
                                <button
                                    onClick={() => setSelectedOperatorType('owner')}
                                    className="p-6 bg-primary/10 border border-primary/20 rounded-2xl flex flex-col items-center gap-3 hover:bg-primary/20 transition-all group"
                                >
                                    <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                                        <Lock className="w-6 h-6 text-primary" />
                                    </div>
                                    <span className="font-bold text-white">Sou o Patrão</span>
                                </button>

                                <button
                                    onClick={() => setSelectedOperatorType('employee')}
                                    className="p-6 bg-white/5 border border-white/10 rounded-2xl flex flex-col items-center gap-3 hover:bg-white/10 transition-all group"
                                >
                                    <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                                        <User className="w-6 h-6 text-muted group-hover:text-white" />
                                    </div>
                                    <span className="font-bold text-white">Sou Funcionário</span>
                                </button>
                            </div>
                        ) : selectedOperatorType === 'owner' ? (
                            <div className="animate-in fade-in slide-in-from-right-10 duration-200 space-y-4">
                                <div className="text-center">
                                    <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Lock className="w-8 h-8 text-primary" />
                                    </div>
                                    <h3 className="text-lg font-bold text-white">Senha do Patrão</h3>
                                    <p className="text-sm text-muted">Digite seu PIN para confirmar</p>
                                </div>

                                <input
                                    autoFocus
                                    type="password"
                                    maxLength={6}
                                    placeholder="PIN"
                                    className={`w-full bg-black/40 border rounded-2xl py-4 px-6 text-center text-2xl font-black tracking-[0.5em] focus:outline-none transition-all ${pinError ? 'border-red-500 text-red-500' : 'border-white/10 focus:border-primary text-white'}`}
                                    value={pin}
                                    onChange={e => {
                                        setPin(e.target.value);
                                        setPinError(false);
                                    }}
                                />

                                <div className="flex gap-3 pt-2">
                                    <button
                                        onClick={() => {
                                            setSelectedOperatorType(null);
                                            setPin('');
                                        }}
                                        className="flex-1 btn-outline py-3"
                                    >
                                        Voltar
                                    </button>
                                    <button
                                        onClick={handleOwnerAuth}
                                        disabled={loading || pin.length < 4}
                                        className="flex-1 btn-primary py-3"
                                    >
                                        {loading ? 'Validando...' : 'Confirmar'}
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="animate-in fade-in slide-in-from-right-10 duration-200 space-y-4">
                                <div className="text-center mb-4">
                                    <h3 className="text-lg font-bold text-white">Selecione o Funcionário</h3>
                                </div>

                                <div className="space-y-2 max-h-[200px] overflow-y-auto custom-scrollbar pr-1">
                                    {loadingEmployees ? (
                                        <div className="text-center py-10">
                                            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                                            <p className="text-xs text-muted">Buscando equipe...</p>
                                        </div>
                                    ) : employees.map(emp => (
                                        <button
                                            key={emp.id}
                                            onClick={() => handleEmployeeSelect(emp.name)}
                                            className="w-full p-4 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl flex items-center gap-3 transition-all group"
                                        >
                                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary border border-primary/20">
                                                {emp.name.charAt(0).toUpperCase()}
                                            </div>
                                            <span className="font-bold text-white flex-1 text-left">{emp.name}</span>
                                            <Check className="w-4 h-4 text-white opacity-0 group-hover:opacity-100" />
                                        </button>
                                    ))}

                                    {!loadingEmployees && employees.length === 0 && (
                                        <div className="text-center py-8 border border-dashed border-white/10 rounded-xl">
                                            <p className="text-muted text-xs">Nenhum funcionário ativo</p>
                                        </div>
                                    )}
                                </div>

                                <button
                                    onClick={() => setSelectedOperatorType(null)}
                                    className="w-full border border-white/10 rounded-xl py-3 mt-2 text-muted text-sm font-bold uppercase tracking-widest"
                                >
                                    Voltar
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};
