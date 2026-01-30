import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

export interface Subscription {
    plan: 'basic' | 'pro';
    status: 'trial' | 'active' | 'past_due' | 'canceled';
    trial_ends_at: string | null;
}

export const usePlan = () => {
    const { user, session } = useAuth();
    const [subscription, setSubscription] = useState<Subscription | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;

        const fetchSubscription = async () => {
            try {
                let { data, error } = await supabase
                    .from('subscriptions')
                    .select('*')
                    .eq('user_id', user.id)
                    .single();

                if (error && error.code === 'PGRST116') {
                    // Create default Basic Trial subscription if missing
                    const trialEnd = new Date();
                    trialEnd.setDate(trialEnd.getDate() + 30);

                    const { data: newSub, error: createError } = await supabase
                        .from('subscriptions')
                        .insert([{
                            user_id: user.id,
                            plan: 'basic',
                            status: 'trial',
                            trial_ends_at: trialEnd.toISOString()
                        }])
                        .select()
                        .single();

                    if (!createError) {
                        data = newSub;
                    }
                }

                setSubscription(data);
            } catch (err) {
                console.error('Error fetching subscription:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchSubscription();
    }, [user]);

    const isPro = subscription?.plan === 'pro' && (subscription?.status === 'active' || subscription?.status === 'trial');
    // NOTE: For now, allowing trial to access Pro features if we want to upsell by showing them?
    // Actually prompt says: "Trial: 30 days (BASIC only)". So Trial = Basic features.
    // Wait, prompt says "2. Upgrade to PRO". 
    // And "Feature Matrix ... IA & Insights ... Pro".
    // So isPro is ONLY if plan === 'pro'.

    // Correction based on prompt: "Trial: 30 days (BASIC only)"
    // So Trial gives you Basic access. Pro gives you Pro.

    const isPlanActive = subscription?.status === 'active' || subscription?.status === 'trial';
    const isProPlan = subscription?.plan === 'pro' && isPlanActive;

    return {
        plan: subscription?.plan || 'basic',
        status: subscription?.status || 'trial',
        isPro: isProPlan,
        loading,
        features: {
            pdv: true,
            kitchen: true,
            reportsStub: true, // Basic reports
            advancedReports: isProPlan,
            aiInsights: isProPlan,
            telemetry: isProPlan,
            automation: isProPlan
        }
    };
};
