import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export interface Notification {
    id: number;
    type: 'Estoque' | 'Agenda' | 'Sistema' | 'Financeiro';
    text: string;
    time: string;
    read: boolean;
    productId?: string; // Track which product triggered this notification
}

interface NotificationContextType {
    notifications: Notification[];
    unreadCount: number;
    markAsRead: (id: number) => void;
    markAllAsRead: () => void;
    deleteNotification: (id: number) => void;
    addNotification: (notification: Omit<Notification, 'id' | 'time'>) => void;
    checkStockAlerts: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider = ({ children }: { children: React.ReactNode }) => {
    const [notifications, setNotifications] = useState<Notification[]>(() => {
        const saved = localStorage.getItem('smartbar_notifications_v2');
        return saved ? JSON.parse(saved) : [];
    });

    // Track which products have already alerted (to avoid duplicates)
    const [alertedProducts, setAlertedProducts] = useState<Set<string>>(() => {
        const saved = localStorage.getItem('smartbar_alerted_products');
        return saved ? new Set(JSON.parse(saved)) : new Set();
    });

    useEffect(() => {
        localStorage.setItem('smartbar_notifications_v2', JSON.stringify(notifications));
    }, [notifications]);

    useEffect(() => {
        localStorage.setItem('smartbar_alerted_products', JSON.stringify([...alertedProducts]));
    }, [alertedProducts]);

    const addNotification = useCallback((notification: Omit<Notification, 'id' | 'time'>) => {
        const newNotification: Notification = {
            ...notification,
            id: Date.now(),
            time: 'Agora'
        };
        setNotifications(prev => [newNotification, ...prev]);
    }, []);

    const checkStockAlerts = useCallback(async () => {
        try {
            const { data: products, error } = await supabase
                .from('products')
                .select('id, name, stock_quantity, min_stock_alert');

            if (error) {
                console.error('Error checking stock alerts:', error);
                return;
            }

            if (!products) return;

            // Find products at or below min_stock_alert (only those with min_stock_alert set)
            const lowStockProducts = products.filter(p =>
                p.min_stock_alert !== null &&
                p.min_stock_alert > 0 &&
                p.stock_quantity <= p.min_stock_alert
            );

            console.log('🔔 Checking stock alerts...', {
                total: products.length,
                lowStock: lowStockProducts.length,
                alertedProducts: [...alertedProducts]
            });

            // Create notifications for new low stock products
            lowStockProducts.forEach(product => {
                if (!alertedProducts.has(product.id)) {
                    console.log('🔔 Creating alert for:', product.name);
                    addNotification({
                        type: 'Estoque',
                        text: `⚠️ O estoque de "${product.name}" atingiu o nível crítico (${product.stock_quantity} unidades).`,
                        read: false,
                        productId: product.id
                    });
                    setAlertedProducts(prev => new Set([...prev, product.id]));
                }
            });

            // Clear alerts for products that are now back in stock
            const okProducts = products.filter(p =>
                p.min_stock_alert !== null &&
                p.min_stock_alert > 0 &&
                p.stock_quantity > p.min_stock_alert
            );
            okProducts.forEach(product => {
                if (alertedProducts.has(product.id)) {
                    console.log('✅ Stock restored for:', product.name);
                    setAlertedProducts(prev => {
                        const newSet = new Set(prev);
                        newSet.delete(product.id);
                        return newSet;
                    });
                    addNotification({
                        type: 'Estoque',
                        text: `✅ Estoque de "${product.name}" normalizado (${product.stock_quantity} unidades).`,
                        read: false,
                        productId: product.id
                    });
                }
            });

        } catch (err) {
            console.error('Error in checkStockAlerts:', err);
        }
    }, [alertedProducts, addNotification]);

    // Check stock alerts on mount and set up realtime subscription
    useEffect(() => {
        // Initial check
        checkStockAlerts();

        // Subscribe to product changes
        const channel = supabase
            .channel('stock-alerts')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'products' },
                () => {
                    console.log('🔔 Products changed, checking stock alerts...');
                    checkStockAlerts();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [checkStockAlerts]);

    const markAsRead = (id: number) => {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    };

    const markAllAsRead = () => {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    };

    const deleteNotification = (id: number) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    };

    const unreadCount = notifications.filter(n => !n.read).length;

    return (
        <NotificationContext.Provider value={{
            notifications,
            unreadCount,
            markAsRead,
            markAllAsRead,
            deleteNotification,
            addNotification,
            checkStockAlerts
        }}>
            {children}
        </NotificationContext.Provider>
    );
};

export const useNotifications = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotifications must be used within a NotificationProvider');
    }
    return context;
};
