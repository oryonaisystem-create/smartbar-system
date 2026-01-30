import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { logEvent } from '../lib/logger';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('💥 [Global Error Boundary] Uncaught error:', error, errorInfo);
        logEvent({
            type: 'system_error',
            severity: 'critical',
            message: error.message,
            context: { stack: error.stack, componentStack: errorInfo.componentStack }
        });
    }

    public handleReload = () => {
        window.location.reload();
    };

    public render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-[#020617] flex items-center justify-center p-4">
                    <div className="glass-card max-w-md w-full p-8 text-center border-white/10 shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 via-orange-500 to-red-500" />

                        <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6 animate-in zoom-in duration-300">
                            <AlertTriangle className="w-8 h-8 text-red-500" />
                        </div>

                        <h1 className="text-2xl font-black text-white mb-2 tracking-tight">Algo deu errado</h1>
                        <p className="text-muted text-sm mb-8 leading-relaxed">
                            O sistema encontrou um erro inesperado. Por segurança, precisamos reiniciar a aplicação.
                        </p>

                        <button
                            onClick={this.handleReload}
                            className="w-full bg-white text-black py-4 rounded-xl font-black flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-white/10"
                        >
                            <RefreshCw className="w-5 h-5" />
                            Recarregar Sistema
                        </button>

                        <div className="mt-8 pt-6 border-t border-white/5">
                            <p className="text-[10px] text-muted/30 font-mono uppercase tracking-widest">
                                SmartBar Error Guard • v1.0
                            </p>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
