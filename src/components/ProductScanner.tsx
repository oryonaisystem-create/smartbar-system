import { useEffect, useRef, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { ScanLine, CheckCircle2, AlertTriangle } from 'lucide-react';

interface ProductScannerProps {
    onScanSuccess: (decodedText: string) => void;
    onScanError?: (error: string) => void;
}

export const ProductScanner = ({ onScanSuccess, onScanError }: ProductScannerProps) => {
    const scannerRef = useRef<Html5QrcodeScanner | null>(null);
    const [scanStatus, setScanStatus] = useState<'scanning' | 'success' | 'error'>('scanning');
    const [lastScanned, setLastScanned] = useState<string | null>(null);

    useEffect(() => {
        // Configurações do Scanner
        const config = {
            fps: 10,
            qrbox: { width: 250, height: 150 },
            aspectRatio: 1.5,
            showZoomSliderIfSupported: true,
            showTorchButtonIfSupported: true,
        };

        const scanner = new Html5QrcodeScanner("reader", config, false);
        scannerRef.current = scanner;

        scanner.render(
            (decodedText) => {
                // Sucesso na leitura
                setScanStatus('success');
                setLastScanned(decodedText);
                onScanSuccess(decodedText);
                // Reset status after 2 seconds
                setTimeout(() => setScanStatus('scanning'), 2000);
            },
            (errorMessage) => {
                // Only report actual errors, not "no QR code found" messages
                if (onScanError && !errorMessage.includes('No')) {
                    setScanStatus('error');
                    onScanError(errorMessage);
                    setTimeout(() => setScanStatus('scanning'), 2000);
                }
            }
        );

        return () => {
            if (scannerRef.current) {
                scannerRef.current.clear().catch(error => {
                    console.error("Failed to clear scanner: ", error);
                });
            }
        };
    }, [onScanSuccess, onScanError]);

    return (
        <div className="glass-card p-4 lg:p-6 overflow-hidden space-y-4">
            {/* Status Indicator */}
            <div className={`flex items-center justify-center gap-2 py-2 px-4 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${scanStatus === 'success' ? 'bg-green-500/20 text-green-500' :
                    scanStatus === 'error' ? 'bg-red-500/20 text-red-500' :
                        'bg-primary/10 text-primary'
                }`}>
                {scanStatus === 'success' ? (
                    <><CheckCircle2 className="w-4 h-4" /> Código lido: {lastScanned}</>
                ) : scanStatus === 'error' ? (
                    <><AlertTriangle className="w-4 h-4" /> Erro na leitura</>
                ) : (
                    <><ScanLine className="w-4 h-4 animate-pulse" /> Escaneando...</>
                )}
            </div>

            {/* Scanner Container */}
            <div id="reader" className="w-full max-w-md mx-auto overflow-hidden rounded-2xl border border-white/10" />

            {/* Instructions */}
            <p className="text-center text-xs text-muted font-medium leading-relaxed">
                Posicione o <span className="text-primary font-bold">código de barras</span> no centro do quadrado.<br />
                A leitura acontece automaticamente.
            </p>
        </div>
    );
};
