import { MessageSquare, Settings, CreditCard, Zap } from 'lucide-react';

export const AutomationPlaceholder = () => (
    <div className="space-y-6">
        <h1 className="text-3xl font-bold">Automação (SaaS MVP)</h1>
        <div className="glass-card p-12 flex flex-col items-center justify-center text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center">
                <MessageSquare className="text-accent w-8 h-8" />
            </div>
            <h2 className="text-xl font-semibold">Disparos WhatsApp (n8n + Evolution)</h2>
            <p className="text-muted max-w-md">
                Configurando gatilhos automáticos para estoque crítico e confirmação de reservas.
            </p>
        </div>
    </div>
);

export const SettingsPlaceholder = () => (
    <div className="space-y-6">
        <h1 className="text-3xl font-bold">Configurações</h1>
        <div className="glass-card p-12 flex flex-col items-center justify-center text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-gray-500/10 flex items-center justify-center">
                <Settings className="text-gray-400 w-8 h-8" />
            </div>
            <h2 className="text-xl font-semibold">Ajustes do Sistema</h2>
            <p className="text-muted max-w-md text-whitetext-2xl">Gerenciamento de perfil, permissões e integrações.</p>
        </div>
    </div>
);

export const PricingPlaceholder = () => (
    <div className="space-y-6">
        <h1 className="text-3xl font-bold">Planos & Assinatura</h1>
        <div className="glass-card p-12 flex flex-col items-center justify-center text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-amber-500/10 flex items-center justify-center">
                <CreditCard className="text-amber-500 w-8 h-8" />
            </div>
            <h2 className="text-xl font-semibold">Upgrade SmartBar Pro</h2>
            <p className="text-muted max-w-md text-whitetext-2xl">Escolha o plano ideal para o crescimento do seu bar.</p>
        </div>
    </div>
);
