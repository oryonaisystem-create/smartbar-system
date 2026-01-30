import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface ErrorMessageProps {
    message?: string;
    onRetry?: () => void;
}

export const ErrorMessage = ({ message = "Ocorreu um erro ao carregar os dados.", onRetry }: ErrorMessageProps) => {
    return (
        <div className="flex flex-col items-center justify-center p-8 text-center bg-red-500/5 border border-red-500/10 rounded-2xl animate-in fade-in duration-300">
            <div className="w-12 h-12 bg-red-500/10 rounded-full flex items-center justify-center mb-4">
                <AlertCircle className="w-6 h-6 text-red-400" />
            </div>
            <h3 className="text-white font-bold mb-1">Ops! Algo deu errado.</h3>
            <p className="text-muted text-sm mb-4 max-w-sm">{message}</p>

            {onRetry && (
                <button
                    onClick={onRetry}
                    className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg text-xs font-bold uppercase tracking-widest transition-all"
                >
                    <RefreshCw className="w-3 h-3" />
                    Tentar Novamente
                </button>
            )}
        </div>
    );
};
