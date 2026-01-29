import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export interface CashierSession {
    id: string;
    opened_at: string;
    closed_at?: string;
    opened_by: string;
    closed_by?: string;
    initial_balance: number;
    final_balance?: number;
    total_sales: number;
    total_expenses: number;
    status: 'open' | 'closed';
}

interface CashierContextType {
    currentSession: CashierSession | null;
    loading: boolean;
    openCashier: (operator: string, initialBalance: number) => Promise<void>;
    closeCashier: (operator: string, finalBalance: number, notes?: string) => Promise<void>;
    refreshStatus: () => Promise<void>;
}

const CashierContext = createContext<CashierContextType | undefined>(undefined);

export const CashierProvider = ({ children }: { children: React.ReactNode }) => {
    const [currentSession, setCurrentSession] = useState<CashierSession | null>(null);
    const [loading, setLoading] = useState(true);

    const checkStatus = async () => {
        try {
            const { data, error } = await supabase
                .from('cashier_sessions')
                .select('*')
                .eq('status', 'open')
                .order('opened_at', { ascending: false })
                .limit(1)
                .maybeSingle();

            if (error) throw error;
            setCurrentSession(data);
        } catch (err) {
            console.error('Error checking cashier status:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        checkStatus();

        const channel = supabase
            .channel('cashier-context-realtime')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'cashier_sessions' },
                () => {
                    console.log('🔄 [CashierContext] Realtime update detected, refreshing status...');
                    checkStatus();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    const openCashier = async (operator: string, initialBalance: number) => {
        const { data, error } = await supabase
            .from('cashier_sessions')
            .insert([{
                opened_by: operator,
                initial_balance: initialBalance,
                status: 'open'
            }])
            .select()
            .single();

        if (error) throw error;
        setCurrentSession(data);
    };

    const closeCashier = async (operator: string, finalBalance: number, notes?: string) => {
        if (!currentSession) return;

        // Calculate totals for report
        const { data: transactions } = await supabase
            .from('transactions')
            .select('total_amount, type')
            .eq('cashier_session_id', currentSession.id);

        const totalSales = transactions?.filter(t => t.type === 'sale').reduce((acc, t) => acc + t.total_amount, 0) || 0;
        const totalExpenses = transactions?.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.total_amount, 0) || 0;
        const expectedBalance = currentSession.initial_balance + totalSales - totalExpenses;

        const { error } = await supabase
            .from('cashier_sessions')
            .update({
                closed_at: new Date().toISOString(),
                closed_by: operator,
                final_balance: finalBalance,
                total_sales: totalSales,
                total_expenses: totalExpenses,
                expected_balance: expectedBalance,
                status: 'closed',
                notes: notes
            })
            .eq('id', currentSession.id);

        if (error) throw error;

        // Automation trigger
        const savedSettings = localStorage.getItem('smartbar_settings');
        if (savedSettings) {
            const { cashierWebhookUrl, adminReportEmail } = JSON.parse(savedSettings);
            if (cashierWebhookUrl) {
                try {
                    fetch(cashierWebhookUrl, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            event: 'cashier_closed',
                            session_id: currentSession.id,
                            opened_at: currentSession.opened_at,
                            closed_at: new Date().toISOString(),
                            opened_by: currentSession.opened_by,
                            closed_by: operator,
                            initial_balance: currentSession.initial_balance,
                            final_balance: finalBalance,
                            total_sales: totalSales,
                            total_expenses: totalExpenses,
                            expected_balance: expectedBalance,
                            difference: finalBalance - expectedBalance,
                            admin_email: adminReportEmail || 'admin@smartbar.com',
                            notes: notes
                        })
                    });
                } catch (e) {
                    console.error('Failed to trigger automation:', e);
                }
            }
        }

        setCurrentSession(null);
    };

    return (
        <CashierContext.Provider value={{ currentSession, loading, openCashier, closeCashier, refreshStatus: checkStatus }}>
            {children}
        </CashierContext.Provider>
    );
};

export const useCashier = () => {
    const context = useContext(CashierContext);
    if (!context) {
        throw new Error('useCashier must be used within a CashierProvider');
    }
    return context;
};
