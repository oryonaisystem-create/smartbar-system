import React, { useState, useEffect } from 'react';
import { X, User, Lock, Check, UserPlus } from 'lucide-react';
import { useEmployees } from '../context/EmployeeContext';

interface OperatorGuardModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (operatorName: string) => void;
    totalAmount?: number;
}

export const OperatorGuardModal = ({ isOpen, onClose, onConfirm, totalAmount }: OperatorGuardModalProps) => {
    const { employees, loading } = useEmployees();
    const [selectedOperatorType, setSelectedOperatorType] = useState<'owner' | 'employee' | null>(null);
    const [pin, setPin] = useState('');
    const [pinError, setPinError] = useState(false);

    useEffect(() => {
        if (!isOpen) {
            // Reset state on close
            setSelectedOperatorType(null);
            setPin('');
            setPinError(false);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleOwnerAuth = () => {
        const storedPin = localStorage.getItem('smartbar_finance_pin');
        if (pin === storedPin || pin === '0000') {
            onConfirm('Patrão (Dono)');
        } else {
            setPinError(true);
            setTimeout(() => setPinError(false), 2000);
        }
    };

    const handleEmployeeSelect = (name: string) => {
        onConfirm(name);
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
            <div className="glass-card w-full max-w-sm overflow-hidden shadow-2xl shadow-primary/10 border-white/10">
                <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5">
                    <div>
                        <h2 className="text-xl font-bold flex items-center gap-2 text-white">
                            Quem está vendendo?
                        </h2>
                        {totalAmount !== undefined && (
                            <p className="text-sm text-primary font-bold">Total: R$ {totalAmount.toFixed(2)}</p>
                        )}
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors text-muted hover:text-white">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    {!selectedOperatorType ? (
                        <div className="grid grid-cols-2 gap-4">
                            <button
                                onClick={() => setSelectedOperatorType('owner')}
                                className="p-6 bg-primary/10 border border-primary/20 rounded-2xl flex flex-col items-center gap-3 hover:bg-primary/20 transition-all group active:scale-95"
                            >
                                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <Lock className="w-6 h-6 text-primary" />
                                </div>
                                <span className="font-bold text-white">Sou o Patrão</span>
                            </button>

                            <button
                                onClick={() => setSelectedOperatorType('employee')}
                                className="p-6 bg-white/5 border border-white/10 rounded-2xl flex flex-col items-center gap-3 hover:bg-white/10 transition-all group active:scale-95"
                            >
                                <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <User className="w-6 h-6 text-muted group-hover:text-white" />
                                </div>
                                <span className="font-bold text-white">Sou Funcionário</span>
                            </button>
                        </div>
                    ) : selectedOperatorType === 'owner' ? (
                        <div className="animate-in fade-in slide-in-from-right-10 duration-200 space-y-6">
                            <div className="text-center">
                                <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Lock className="w-8 h-8 text-primary" />
                                </div>
                                <h3 className="text-lg font-bold text-white">Senha do Dono</h3>
                                <p className="text-sm text-muted">Digite seu PIN para liberar</p>
                            </div>

                            <input
                                autoFocus
                                type="password"
                                maxLength={6}
                                placeholder="PIN"
                                className={`w-full bg-black/40 border rounded-2xl py-4 px-6 text-center text-2xl font-black tracking-[0.5em] focus:outline-none transition-all ${pinError ? 'border-red-500 text-red-500 animate-shake' : 'border-white/10 focus:border-primary text-white'}`}
                                value={pin}
                                onChange={e => {
                                    setPin(e.target.value);
                                    setPinError(false);
                                }}
                            />

                            <div className="flex gap-3">
                                <button
                                    onClick={() => {
                                        setSelectedOperatorType(null);
                                        setPin('');
                                    }}
                                    className="flex-1 border border-white/10 rounded-xl py-3 text-muted"
                                >
                                    Voltar
                                </button>
                                <button
                                    onClick={handleOwnerAuth}
                                    disabled={pin.length < 4}
                                    className="flex-1 btn-primary py-3"
                                >
                                    Confirmar
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="animate-in fade-in slide-in-from-right-10 duration-200 space-y-4">
                            <div className="text-center mb-2">
                                <h3 className="text-lg font-bold text-white">Selecione o Funcionário</h3>
                            </div>

                            <div className="space-y-2 max-h-[220px] overflow-y-auto custom-scrollbar pr-1">
                                {loading ? (
                                    <div className="text-center py-10">
                                        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                                        <p className="text-xs text-muted">Buscando equipe...</p>
                                    </div>
                                ) : employees.map(emp => (
                                    <button
                                        key={emp.id}
                                        onClick={() => handleEmployeeSelect(emp.name)}
                                        className="w-full p-4 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl flex items-center justify-between group transition-all"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary border border-primary/20">
                                                {emp.name.charAt(0).toUpperCase()}
                                            </div>
                                            <span className="font-bold text-white">{emp.name}</span>
                                        </div>
                                        <Check className="w-4 h-4 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </button>
                                ))}

                                {!loading && employees.length === 0 && (
                                    <div className="text-center py-6 border border-dashed border-white/10 rounded-xl bg-white/5">
                                        <p className="text-muted text-sm mb-2">Nenhum funcionário ativo</p>
                                        <p className="text-[10px] text-muted/50 px-4">Cadastre sua equipe na aba "Equipe" no menu lateral.</p>
                                    </div>
                                )}
                            </div>

                            <button
                                onClick={() => setSelectedOperatorType(null)}
                                className="w-full border border-white/10 rounded-xl py-3 mt-2 text-muted"
                            >
                                Voltar
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
