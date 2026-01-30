import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingStateProps {
    message?: string;
}

export const LoadingState = ({ message = "Carregando dados..." }: LoadingStateProps) => {
    return (
        <div className="flex flex-col items-center justify-center p-12 animate-in fade-in duration-300 w-full h-full min-h-[200px]">
            <Loader2 className="w-8 h-8 text-primary animate-spin mb-4" />
            <p className="text-muted text-xs font-bold uppercase tracking-widest animate-pulse">{message}</p>
        </div>
    );
};
