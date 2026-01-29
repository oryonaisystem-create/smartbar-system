
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { WifiOff, Wifi } from 'lucide-react';

export const ConnectionStatus = () => {
    const [isOnline, setIsOnline] = useState<boolean | null>(null);

    useEffect(() => {
        const checkConnection = async () => {
            try {
                // Try to fetch a public table lightweight query
                const { error } = await supabase.from('products').select('count', { count: 'exact', head: true });
                if (error) throw error;
                setIsOnline(true);
            } catch (e) {
                console.error('Connection check failed:', e);
                setIsOnline(false);
            }
        };

        checkConnection();
        const interval = setInterval(checkConnection, 10000); // Check every 10s

        return () => clearInterval(interval);
    }, []);

    if (isOnline === null || isOnline === true) return null;

    return (
        <div className="fixed top-0 left-0 w-full bg-red-600 text-white z-[9999] px-4 py-2 flex items-center justify-center gap-2 shadow-lg animate-in slide-in-from-top">
            <WifiOff className="w-4 h-4" />
            <span className="text-sm font-bold">
                Sem conexão com o Supabase. Verifique sua internet ou firewall.
            </span>
        </div>
    );
};
