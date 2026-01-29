import React, { useState, useEffect } from 'react';
import { ShieldCheck, Lock, ChevronRight, Delete, CheckCircle2, AlertCircle } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface MobilePINGuardProps {
    onSuccess: () => void;
    onCancel?: () => void;
    correctPIN: string;
}

const MobilePINGuard = ({ onSuccess, onCancel, correctPIN }: MobilePINGuardProps) => {
    const [pin, setPin] = useState('');
    const [error, setError] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleKeyPress = (val: string) => {
        if (pin.length < 4) {
            const newPin = pin + val;
            setPin(newPin);
            if (newPin.length === 4) {
                if (newPin === correctPIN) {
                    setSuccess(true);
                    setTimeout(() => onSuccess(), 800);
                } else {
                    setError(true);
                    setTimeout(() => {
                        setPin('');
                        setError(false);
                    }, 1000);
                }
            }
        }
    };

    const handleDelete = () => {
        setPin(pin.slice(0, -1));
    };

    const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'delete'];

    return (
        <div className="fixed inset-0 z-[200] bg-[#020617] flex flex-col p-6 animate-in fade-in zoom-in duration-500">
            {/* Back Button */}
            {onCancel && (
                <button
                    onClick={onCancel}
                    className="absolute top-6 left-6 flex items-center gap-2 text-muted hover:text-white active:scale-95 transition-all z-10"
                >
                    <ChevronRight className="w-5 h-5 rotate-180" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Voltar</span>
                </button>
            )}

            <div className="flex-1 flex flex-col items-center justify-center text-center">
                <div className={cn(
                    "w-20 h-20 rounded-[32px] flex items-center justify-center mb-6 border transition-all duration-300",
                    success ? "bg-green-500/20 border-green-500 shadow-[0_0_30px_rgba(34,197,94,0.3)]" :
                        error ? "bg-red-500/20 border-red-500 animate-shake shadow-[0_0_30px_rgba(239,68,68,0.3)]" :
                            "bg-primary/5 border-primary/20 shadow-inner"
                )}>
                    {success ? <ShieldCheck className="w-10 h-10 text-green-500" /> :
                        error ? <AlertCircle className="w-10 h-10 text-red-500" /> :
                            <Lock className="w-10 h-10 text-primary opacity-50 transition-all duration-500" />}
                </div>

                <h2 className="text-2xl font-black text-white italic tracking-tighter mb-1">Acesso <span className="text-primary italic">Restrito</span></h2>
                <p className="text-muted font-black uppercase text-[9px] tracking-[0.2em] mb-8">Digite seu PIN Financeiro</p>

                <div className="flex gap-3 mb-10">
                    {[1, 2, 3, 4].map((i) => (
                        <div
                            key={i}
                            className={cn(
                                "w-3.5 h-3.5 rounded-full border-2 transition-all duration-300",
                                pin.length >= i ? "bg-primary border-primary scale-125 shadow-[0_0_12px_rgba(100,100,255,0.5)]" : "border-white/10"
                            )}
                        />
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-3 gap-4 max-w-xs mx-auto w-full pb-8">
                {keys.map((key, i) => {
                    if (key === '') return <div key={i} />;
                    if (key === 'delete') {
                        return (
                            <button
                                key={i}
                                onClick={handleDelete}
                                className="h-16 rounded-2xl flex items-center justify-center text-muted active:bg-white/5 active:scale-95 transition-all"
                            >
                                <Delete className="w-5 h-5" />
                            </button>
                        );
                    }
                    return (
                        <button
                            key={i}
                            onClick={() => handleKeyPress(key)}
                            className="h-16 bg-white/5 border border-white/5 rounded-2xl flex flex-col items-center justify-center text-white active:bg-primary active:border-primary active:scale-95 transition-all shadow-lg"
                        >
                            <span className="text-xl font-black">{key}</span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default MobilePINGuard;
