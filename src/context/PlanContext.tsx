import React, { createContext, useContext, useState, useEffect } from 'react';

export type PlanType = 'gratuito' | 'pro';

export interface PlanFeatures {
    pdv: boolean;
    estoque: boolean;
    financeiro: boolean;
    agenda: boolean;
    automacao: boolean;
    relatorios: boolean;
    integracaoApi: boolean;
    suportePrioritario: boolean;
}

export interface Plan {
    id: PlanType;
    name: string;
    price: number;
    features: PlanFeatures;
    description: string;
}

export const PLANS: Plan[] = [
    {
        id: 'gratuito',
        name: 'Gratuito',
        price: 0,
        description: 'Essencial para o dia-a-dia do bar',
        features: {
            pdv: true,
            estoque: true,
            financeiro: true,
            agenda: false,
            automacao: false,
            relatorios: true,
            integracaoApi: false,
            suportePrioritario: false
        }
    },
    {
        id: 'pro',
        name: 'SmartBar Pro',
        price: 49.90,
        description: 'Tudo desbloqueado + automação',
        features: {
            pdv: true,
            estoque: true,
            financeiro: true,
            agenda: true,
            automacao: true,
            relatorios: true,
            integracaoApi: true,
            suportePrioritario: true
        }
    }
];

interface PlanContextType {
    currentPlan: Plan;
    planType: PlanType;
    setPlanType: (plan: PlanType) => void;
    hasFeature: (feature: keyof PlanFeatures) => boolean;
    isFeatureLocked: (feature: keyof PlanFeatures) => boolean;
    isPro: boolean;
}

const PlanContext = createContext<PlanContextType | undefined>(undefined);

export const PlanProvider = ({ children }: { children: React.ReactNode }) => {
    const [planType, setPlanTypeState] = useState<PlanType>(() => {
        const saved = localStorage.getItem('smartbar_plan');
        return (saved as PlanType) || 'gratuito'; // Default to free
    });

    useEffect(() => {
        localStorage.setItem('smartbar_plan', planType);
    }, [planType]);

    const currentPlan = PLANS.find(p => p.id === planType) || PLANS[0];

    const hasFeature = (feature: keyof PlanFeatures) => {
        return currentPlan.features[feature];
    };

    const isFeatureLocked = (feature: keyof PlanFeatures) => {
        return !currentPlan.features[feature];
    };

    const setPlanType = (plan: PlanType) => {
        setPlanTypeState(plan);
    };

    const isPro = planType === 'pro';

    return (
        <PlanContext.Provider value={{
            currentPlan,
            planType,
            setPlanType,
            hasFeature,
            isFeatureLocked,
            isPro
        }}>
            {children}
        </PlanContext.Provider>
    );
};

export const usePlan = () => {
    const context = useContext(PlanContext);
    if (!context) {
        throw new Error('usePlan must be used within a PlanProvider');
    }
    return context;
};
