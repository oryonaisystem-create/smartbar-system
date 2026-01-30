import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { logEvent } from '../lib/logger';

export interface CashierSession {
    id: string;
    opened_at: string;
    opened_by: string;
    initial_balance: number;
    status: 'open' | 'closed';
    closed_at?: string;
    final_balance?: number;
    // other fields ...
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
                .maybeSingle();

            if (error && error.code !== 'PGRST116') throw error;
            setCurrentSession(data);

            // Sync with local storage for robust checks elsewhere
            if (data) {
                localStorage.setItem('smartbar_shift_open', 'true');
            } else {
                localStorage.setItem('smartbar_shift_open', 'false');
            }

        } catch (error) {
            console.error('Error checking cashier status:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        checkStatus();
    }, []);

    const openCashier = async (operator: string, initialBalance: number) => {
        try {
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
            logEvent({
                type: 'cashier_open',
                severity: 'info',
                message: 'Caixa Aberto',
                context: { operator, initialBalance, sessionId: data.id }
            });
        } catch (e: any) {
            console.error('Error opening cashier:', e);
            logEvent({ type: 'cashier_error', severity: 'error', message: 'Failed to open cashier', context: { error: e.message } });
            throw e;
        }
    };

    const closeCashier = async (operator: string, finalBalance: number, notes?: string) => {
        if (!currentSession) return;

        try {
            // Calculate totals for report
            const { data: transactions } = await supabase
                .from('transactions')
                .select('total_amount, type')
                .eq('cashier_session_id', currentSession.id);

            const totalSales = transactions?.filter(t => t.type === 'sale').reduce((acc, t) => acc + t.total_amount, 0) || 0;
            const totalExpenses = transactions?.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.total_amount, 0) || 0;
            const expectedBalance = currentSession.initial_balance + totalSales - totalExpenses;
            const difference = finalBalance - expectedBalance;

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

            logEvent({
                type: 'cashier_close',
                severity: Math.abs(difference) > 1 ? 'warning' : 'info',
                message: Math.abs(difference) > 1 ? 'Caixa Fechado com Divergência' : 'Caixa Fechado com Sucesso',
                context: {
                    operator,
                    finalBalance,
                    expectedBalance,
                    difference,
                    sessionId: currentSession.id
                }
            });

            // Automation trigger
            const savedSettings = localStorage.getItem('smartbar_settings');
            if (savedSettings) {
                const { cashierWebhookUrl, adminReportEmail } = JSON.parse(savedSettings);
                if (cashierWebhookUrl) {
                    // ... (existing fetch logic)
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
                            difference: difference,
                            admin_email: adminReportEmail || 'admin@smartbar.com',
                            notes: notes
                        })
                    }).catch(e => console.error('Webhook failed', e));
                }
            }

            setCurrentSession(null);
        } catch (e: any) {
            console.error('Error closing cashier:', e);
            logEvent({ type: 'cashier_error', severity: 'error', message: 'Failed to close cashier', context: { error: e.message } });
            throw e;
        }
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
