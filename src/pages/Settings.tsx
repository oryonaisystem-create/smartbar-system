import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import {
    User,
    Smartphone,
    Bell,
    Shield,
    Save,
    Camera,
    LogOut,
    ChevronRight,
    Database,
    Globe,
    Lock,
    MessageSquare,
    Package,
    CheckCircle2,
    Fingerprint,
    Mail,
    Crown,
    Check,
    Sparkles
} from 'lucide-react';
import { usePlan, PLANS, PlanType, PlanFeatures } from '../context/PlanContext';
import { useAuth } from '../context/AuthContext';

const Settings = () => {
    const [activeTab, setActiveTab] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);
    const navigate = useNavigate();
    const { currentPlan, planType, setPlanType } = usePlan();
    const { signOut } = useAuth();

    // Default to 'profile' on desktop, but null on mobile to show the list
    useEffect(() => {
        const isMobile = window.innerWidth < 1024;
        if (!isMobile && !activeTab) {
            setActiveTab('profile');
        }
    }, [activeTab]);

    // Load actual profile data from Supabase if available
    useEffect(() => {
        const loadProfile = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', user.id)
                    .single();

                if (profile) {
                    setSettings(prev => ({
                        ...prev,
                        profileName: profile.full_name || prev.profileName,
                        profileImage: profile.avatar_url || prev.profileImage
                    }));
                }
            }
        };
        loadProfile();
    }, []);

    // Persistence Layer
    const [settings, setSettings] = useState(() => {
        const saved = localStorage.getItem('smartbar_settings');
        if (saved) return JSON.parse(saved);
        return {
            profileName: 'Patrick SmartBar Admin',
            profileEmail: 'patrick@smartbar.com',
            profileImage: null,
            primaryColor: '#3b82f6',
            notifications: {
                stock: true,
                reports: true,
                reservations: false
            }
        };
    });

    useEffect(() => {
        // Sync to localStorage
        localStorage.setItem('smartbar_settings', JSON.stringify(settings));

        // Sync specific security setting to localStorage key for easier access in other components
        if (settings.financialPinRequired === undefined) {
            localStorage.setItem('smartbar_security_pin_required', 'true');
        } else {
            localStorage.setItem('smartbar_security_pin_required', String(settings.financialPinRequired));
        }
    }, [settings]);

    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleLogout = async () => {
        await signOut();
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                await supabase
                    .from('profiles')
                    .update({
                        full_name: settings.profileName,
                        updated_at: new Date().toISOString()
                    })
                    .eq('id', user.id);
            }

            // Success
            alert("Configurações salvas com sucesso!");
        } catch (error: any) {
            console.error('Error saving settings:', error);
            alert("Erro ao salvar: " + error.message);
        } finally {
            setSaving(false);
        }
    };

    const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        try {
            setSaving(true);
            const fileExt = file.name.split('.').pop();
            const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
            const filePath = `avatars/${fileName}`;

            // 1. Upload to Supabase Storage (reusing 'products' bucket for simplicity or creating 'profiles')
            const { error: uploadError } = await supabase.storage
                .from('products')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            // 2. Get Public URL
            const { data: { publicUrl } } = supabase.storage
                .from('products')
                .getPublicUrl(filePath);

            setSettings({ ...settings, profileImage: publicUrl });

            // 3. Update profiles table if user is logged in
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                await supabase
                    .from('profiles')
                    .update({ avatar_url: publicUrl })
                    .eq('id', user.id);
            }

            alert("Foto de perfil atualizada!");
        } catch (error: any) {
            console.error('Error uploading image:', error);
            alert("Erro ao enviar imagem: " + error.message);
        } finally {
            setSaving(false);
        }
    };

    const triggerProfileUpload = () => fileInputRef.current?.click();

    return (
        <div className="flex flex-col lg:flex-row gap-8 h-full lg:h-[calc(100vh-8rem)]">
            {/* Hidden inputs */}
            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />

            {/* Sidebar Navigation - Hidden on mobile if a tab is active */}
            <div className={`w-full lg:w-72 space-y-2 ${activeTab ? 'hidden lg:block' : 'block'}`}>
                <h1 className="text-3xl font-black tracking-tight mb-6 text-white uppercase px-2 lg:px-0">Ajustes</h1>

                <div className="mx-2 lg:mx-0 bg-primary/5 p-4 rounded-3xl border border-primary/20 mb-6 transition-all hover:bg-primary/10 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center font-black overflow-hidden border border-white/20 shadow-inner">
                            {settings.profileImage ? <img src={settings.profileImage} className="w-full h-full object-cover" /> : 'P'}
                        </div>
                        <div>
                            <p className="text-sm font-bold text-white leading-tight">{settings.profileName.split(' ')[0]} Admin</p>
                            <p className="text-[10px] text-primary uppercase font-black tracking-widest">Acesso Irrestrito</p>
                        </div>
                    </div>
                </div>

                <div className="space-y-2 px-2 lg:px-0">
                    <SettingsNavItem
                        icon={<User className="w-5 h-5" />}
                        label="Perfil do Usuário"
                        active={activeTab === 'profile'}
                        onClick={() => setActiveTab('profile')}
                    />
                    <SettingsNavItem
                        icon={<Smartphone className="w-5 h-5" />}
                        label="Integrações API"
                        active={activeTab === 'api'}
                        onClick={() => setActiveTab('api')}
                    />
                    <SettingsNavItem
                        icon={<Bell className="w-5 h-5" />}
                        label="Notificações & Alertas"
                        active={activeTab === 'notifications'}
                        onClick={() => setActiveTab('notifications')}
                    />
                    <SettingsNavItem
                        icon={<Fingerprint className="w-5 h-5" />}
                        label="Segurança Financeira"
                        active={activeTab === 'security'}
                        onClick={() => setActiveTab('security')}
                    />
                    <SettingsNavItem
                        icon={<Crown className="w-5 h-5" />}
                        label="Plano & Assinatura"
                        active={activeTab === 'plan'}
                        onClick={() => setActiveTab('plan')}
                    />
                </div>

                <div className="pt-8 mt-8 border-t border-white/10 px-2 lg:px-0">
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 w-full p-4 rounded-2xl text-red-500 hover:bg-red-500/10 active:bg-red-500/20 transition-all font-bold group"
                    >
                        <LogOut className="w-5 h-5 group-hover:scale-110 transition-transform" />
                        <span className="uppercase text-xs tracking-widest">Sair da Conta</span>
                    </button>
                </div>
            </div>

            {/* Main Content Area - Full screen on mobile if active */}
            {activeTab && (
                <div className="flex-1 glass-card p-6 lg:p-10 border-white/10 overflow-y-auto custom-scrollbar bg-white/[0.02] flex flex-col h-full lg:h-auto animate-in slide-in-from-right-4 duration-300">
                    {/* Mobile Back Button */}
                    <button
                        onClick={() => setActiveTab(null)}
                        className="lg:hidden flex items-center gap-2 text-primary font-black uppercase text-[10px] tracking-widest mb-6 active:scale-95 transition-all"
                    >
                        <ChevronRight className="w-4 h-4 rotate-180" /> Voltar aos Ajustes
                    </button>

                    <div className="flex-1">
                        {activeTab === 'profile' && (
                            <div className="space-y-10">
                                <div>
                                    <h2 className="text-2xl font-black mb-2 text-white">Perfil do Usuário</h2>
                                    <p className="text-muted text-sm font-medium">Gerencie suas informações pessoais e foto de perfil.</p>
                                </div>

                                <div className="flex flex-col sm:flex-row items-center gap-8">
                                    <div className="relative group">
                                        <div
                                            className="w-28 h-28 rounded-full bg-primary/20 flex items-center justify-center border-2 border-primary/50 overflow-hidden cursor-pointer hover:opacity-80 transition-opacity"
                                            onClick={triggerProfileUpload}
                                        >
                                            {settings.profileImage ? (
                                                <img src={settings.profileImage} className="w-full h-full object-cover" />
                                            ) : (
                                                <User className="w-12 h-12 text-primary" />
                                            )}
                                        </div>
                                        <button
                                            onClick={triggerProfileUpload}
                                            className="absolute bottom-0 right-0 p-3 bg-primary text-white rounded-full shadow-lg group-hover:scale-110 transition-transform hover:bg-blue-600 active:scale-90"
                                        >
                                            <Camera className="w-5 h-5" />
                                        </button>
                                    </div>
                                    <div className="space-y-1 text-center sm:text-left">
                                        <p className="font-black text-2xl text-white tracking-tight">{settings.profileName}</p>
                                        <div className="flex items-center justify-center sm:justify-start gap-2">
                                            <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                                            <p className="text-[10px] text-primary font-black uppercase tracking-widest">Assinatura Vitalícia Ativa</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-muted/60 uppercase tracking-widest pl-1">Nome Completo</label>
                                        <input
                                            type="text"
                                            value={settings.profileName}
                                            onChange={(e) => setSettings({ ...settings, profileName: e.target.value })}
                                            className="w-full bg-white/[0.04] border border-white/10 rounded-2xl py-4 lg:py-5 px-6 focus:ring-2 focus:ring-primary/30 outline-none transition-all placeholder:text-muted/30 text-white font-bold"
                                        />
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-muted/60 uppercase tracking-widest pl-1">E-mail de Acesso</label>
                                        <input
                                            type="email"
                                            value={settings.profileEmail}
                                            onChange={(e) => setSettings({ ...settings, profileEmail: e.target.value })}
                                            className="w-full bg-white/[0.04] border border-white/10 rounded-2xl py-4 lg:py-5 px-6 focus:ring-2 focus:ring-primary/30 outline-none transition-all placeholder:text-muted/30 text-white font-bold"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'api' && (
                            <div className="space-y-8">
                                <div>
                                    <h2 className="text-2xl font-black mb-2 text-white">WhatsApp (Evolution API)</h2>
                                    <p className="text-muted text-sm font-medium">Configure a integração com WhatsApp para enviar avaliações.</p>
                                </div>

                                {!currentPlan.features.integracaoApi ? (
                                    /* Locked State for Free Plan */
                                    <div className="p-8 bg-gradient-to-br from-amber-500/10 to-transparent rounded-3xl border border-amber-500/30 text-center">
                                        <Crown className="w-12 h-12 text-amber-500 mx-auto mb-4" />
                                        <h3 className="text-xl font-black text-white mb-2">Recurso do Plano Pro</h3>
                                        <p className="text-muted text-sm mb-6 max-w-md mx-auto">
                                            A integração WhatsApp está disponível apenas no plano <strong className="text-amber-500">SmartBar Pro</strong>.
                                        </p>
                                        <button
                                            onClick={() => setActiveTab('plan')}
                                            className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black font-black py-3 px-8 rounded-2xl inline-flex items-center gap-2 transition-all hover:scale-[1.02]"
                                        >
                                            <Crown className="w-5 h-5" />
                                            Fazer Upgrade
                                        </button>
                                    </div>
                                ) : (
                                    /* Unlocked State for Pro Plan */
                                    <>
                                        <div className="p-6 lg:p-10 bg-green-500/5 rounded-3xl border border-green-500/20 space-y-6">
                                            <div className="flex items-center gap-4">
                                                <div className="p-4 bg-green-500/10 rounded-2xl">
                                                    <MessageSquare className="w-6 h-6 text-green-500" />
                                                </div>
                                                <div>
                                                    <h4 className="font-black text-white text-lg">Evolution API</h4>
                                                    <p className="text-xs text-muted">Envio automático de pesquisas pós-atendimento</p>
                                                </div>
                                            </div>

                                            <div className="space-y-4">
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black uppercase tracking-widest text-muted">URL da API</label>
                                                    <input
                                                        type="text"
                                                        placeholder="https://sua-evolution-api.com"
                                                        value={settings.evolutionApiUrl || ''}
                                                        onChange={(e) => setSettings({ ...settings, evolutionApiUrl: e.target.value })}
                                                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white outline-none focus:ring-2 focus:ring-green-500/30 transition-all"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black uppercase tracking-widest text-muted">Instance Name</label>
                                                    <input
                                                        type="text"
                                                        placeholder="smartbar"
                                                        value={settings.evolutionInstance || ''}
                                                        onChange={(e) => setSettings({ ...settings, evolutionInstance: e.target.value })}
                                                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white outline-none focus:ring-2 focus:ring-green-500/30 transition-all"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black uppercase tracking-widest text-muted">API Key</label>
                                                    <input
                                                        type="password"
                                                        placeholder="••••••••••••"
                                                        value={settings.evolutionApiKey || ''}
                                                        onChange={(e) => setSettings({ ...settings, evolutionApiKey: e.target.value })}
                                                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white outline-none focus:ring-2 focus:ring-green-500/30 transition-all"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="p-6 bg-primary/5 rounded-3xl border border-primary/20 space-y-4">
                                            <div className="flex items-center gap-4">
                                                <Mail className="w-6 h-6 text-primary" />
                                                <h4 className="font-black text-white text-lg">Resumo por E-mail</h4>
                                            </div>
                                            <div className="space-y-4">
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black uppercase tracking-widest text-muted">Email do Admin (Destino)</label>
                                                    <input
                                                        type="email"
                                                        placeholder="admin@seubar.com"
                                                        value={settings.adminReportEmail || settings.profileEmail || ''}
                                                        onChange={(e) => setSettings({ ...settings, adminReportEmail: e.target.value })}
                                                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white outline-none focus:ring-2 focus:ring-primary/30 transition-all font-bold"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black uppercase tracking-widest text-muted">Webhook n8n/Automation (Opcional)</label>
                                                    <input
                                                        type="text"
                                                        placeholder="https://n8n.seu-servidor.com/webhook/..."
                                                        value={settings.cashierWebhookUrl || ''}
                                                        onChange={(e) => setSettings({ ...settings, cashierWebhookUrl: e.target.value })}
                                                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white outline-none focus:ring-2 focus:ring-primary/30 transition-all text-xs"
                                                    />
                                                    <p className="text-[10px] text-muted">O sistema enviará os dados do fechamento para este link para automação de e-mail personalizada.</p>
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        )}

                        {activeTab === 'notifications' && (
                            <div className="space-y-8">
                                <div>
                                    <h2 className="text-2xl font-black mb-2 text-white">Canais de Alerta</h2>
                                    <p className="text-muted text-sm font-medium">Controle como o sistema se comunica com você.</p>
                                </div>

                                <div className="space-y-4 lg:space-y-6">
                                    <NotificationToggle
                                        icon={<Package className="w-6 h-6 text-yellow-500" />}
                                        title="Avisos de Estoque Crítico"
                                        desc="Notificar gerente via WhatsApp quando itens atingirem o ponto de ressuprimento."
                                        active={settings.notifications.stock}
                                        onToggle={() => setSettings({ ...settings, notifications: { ...settings.notifications, stock: !settings.notifications.stock } })}
                                    />
                                    <NotificationToggle
                                        icon={<Shield className="w-6 h-6 text-blue-500" />}
                                        title="Relatório de Fechamento"
                                        desc="Enviar resumo PDF consolidado ao fechar o caixa do dia."
                                        active={settings.notifications.reports}
                                        onToggle={() => setSettings({ ...settings, notifications: { ...settings.notifications, reports: !settings.notifications.reports } })}
                                    />
                                    <NotificationToggle
                                        icon={<Bell className="w-6 h-6 text-purple-500" />}
                                        title="Alertas de Reservas"
                                        desc="Notificação sonora no dashboard para eventos agendados."
                                        active={settings.notifications.reservations}
                                        onToggle={() => setSettings({ ...settings, notifications: { ...settings.notifications, reservations: !settings.notifications.reservations } })}
                                    />
                                </div>
                            </div>
                        )}

                        {activeTab === 'security' && (
                            <div className="space-y-8">
                                <div>
                                    <h2 className="text-2xl font-black mb-2 text-white">Segurança Financeira</h2>
                                    <p className="text-muted text-sm font-medium">Proteja o acesso ao coração financeiro do seu bar.</p>
                                </div>

                                {/* Global Security Toggle */}
                                <div className="p-5 lg:p-8 bg-white/5 rounded-[32px] lg:rounded-[40px] border border-white/10 mb-6">
                                    <div className="flex items-center justify-between gap-4">
                                        <div className="flex items-center gap-4 lg:gap-6 flex-1">
                                            <div className="p-4 lg:p-5 bg-red-500/10 rounded-2xl shadow-inner border border-red-500/20 shrink-0">
                                                <Shield className="w-6 h-6 lg:w-8 lg:h-8 text-red-500" />
                                            </div>
                                            <div className="min-w-0">
                                                <h4 className="font-black text-white text-lg lg:text-xl leading-tight">Exigir PIN</h4>
                                                <p className="text-xs lg:text-sm text-muted font-medium leading-relaxed mt-1 hidden sm:block">
                                                    Se desativado, o sistema <strong className="text-red-400">não pedirá</strong> senha.
                                                </p>
                                                <p className="text-[10px] text-muted font-medium leading-relaxed mt-1 sm:hidden">
                                                    Bloquear área financeira.
                                                </p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => setSettings({ ...settings, financialPinRequired: !settings.financialPinRequired })}
                                            className={`relative inline-flex items-center h-8 lg:h-10 rounded-full w-16 lg:w-20 transition-all shrink-0 border-2 ${settings.financialPinRequired !== false
                                                ? 'bg-green-500 border-green-500 shadow-[0_0_20px_rgba(34,197,94,0.3)]'
                                                : 'bg-white/5 border-white/10'}`}
                                        >
                                            <span className={`absolute top-0.5 bottom-0.5 w-6 lg:w-8 bg-white rounded-full shadow-sm transition-all duration-300 ${settings.financialPinRequired !== false
                                                ? 'right-1'
                                                : 'left-1 bg-white/50'}`}
                                            />
                                        </button>
                                    </div>
                                </div>

                                <div className="p-5 lg:p-10 bg-primary/5 rounded-[32px] lg:rounded-[40px] border border-primary/20 space-y-6">
                                    <div className="flex items-center gap-4">
                                        <Lock className="w-5 h-5 lg:w-6 lg:h-6 text-primary" />
                                        <h4 className="font-black text-white text-base lg:text-lg">Senha do Dono (PIN)</h4>
                                    </div>

                                    <div className="max-w-xs space-y-4 mx-auto lg:mx-0 text-center lg:text-left">
                                        <p className="text-xs text-muted/80 leading-relaxed font-medium">Senha solicitada ao acessar Financeiro/Relatórios.</p>
                                        <input
                                            type="password"
                                            placeholder="Definir Novo PIN"
                                            maxLength={6}
                                            className="w-full bg-black/20 border border-white/10 rounded-2xl py-3 px-4 text-white font-black text-lg lg:text-xl tracking-[0.4em] placeholder:tracking-normal placeholder:font-bold outline-none focus:border-primary/50 text-center transition-all focus:bg-black/40"
                                            onChange={(e) => localStorage.setItem('smartbar_finance_pin', e.target.value)}
                                        />
                                        <p className="text-[9px] text-muted/60 font-bold italic">O PIN é salvo automaticamente.</p>
                                    </div>
                                </div>

                                <div className="p-5 lg:p-10 bg-white/[0.03] rounded-[32px] lg:rounded-[40px] border border-white/10 space-y-6">
                                    <div className="flex items-center gap-4">
                                        <Mail className="w-5 h-5 lg:w-6 lg:h-6 text-muted" />
                                        <h4 className="font-black text-white text-base lg:text-lg">Recuperação</h4>
                                    </div>
                                    <div className="flex flex-col xl:flex-row items-center justify-between gap-6 text-center xl:text-left">
                                        <p className="text-xs text-muted/80 font-medium leading-relaxed">Código enviado para <strong>{settings.profileEmail || 'email@admin.com'}</strong>.</p>
                                        <button
                                            onClick={() => alert("Simulação: E-mail de segurança enviado para patrick@smartbar.com")}
                                            className="w-full xl:w-auto px-8 py-4 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-white/10 active:scale-95 transition-all text-white"
                                        >
                                            Testar Envio de Código
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'plan' && (
                            <div className="space-y-8">
                                <div>
                                    <h2 className="text-2xl font-black mb-2 text-white">Plano & Assinatura</h2>
                                    <p className="text-muted text-sm font-medium">Gerencie seu plano e desbloqueie recursos premium.</p>
                                </div>

                                {/* Current Plan */}
                                <div className="p-6 bg-gradient-to-br from-primary/10 to-transparent rounded-3xl border border-primary/30">
                                    <div className="flex items-center gap-3 mb-4">
                                        <Crown className="w-6 h-6 text-primary" />
                                        <h3 className="font-black text-white text-lg">Plano Atual</h3>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-2xl font-black text-white">{currentPlan.name}</p>
                                            <p className="text-sm text-muted">{currentPlan.description}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-2xl font-black text-primary">
                                                R$ {currentPlan.price.toFixed(2)}
                                            </p>
                                            <p className="text-xs text-muted">/mês</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Available Plans */}
                                <div className="space-y-4">
                                    <h3 className="text-sm font-black text-muted uppercase tracking-wider">Escolha seu Plano</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {PLANS.map(plan => (
                                            <div
                                                key={plan.id}
                                                onClick={() => setPlanType(plan.id)}
                                                className={`p-6 rounded-2xl border-2 cursor-pointer transition-all ${planType === plan.id
                                                    ? 'border-primary bg-primary/10 shadow-lg shadow-primary/20'
                                                    : 'border-white/10 bg-white/5 hover:border-white/30'
                                                    }`}
                                            >
                                                <div className="flex items-center justify-between mb-4">
                                                    <h4 className="font-black text-white text-lg">{plan.name}</h4>
                                                    {plan.id === 'pro' && (
                                                        <Sparkles className="w-5 h-5 text-amber-500" />
                                                    )}
                                                </div>
                                                <p className="text-3xl font-black text-primary mb-1">
                                                    {plan.price === 0 ? 'Grátis' : `R$ ${plan.price.toFixed(2)}`}
                                                    {plan.price > 0 && <span className="text-xs text-muted font-normal">/mês</span>}
                                                </p>
                                                <p className="text-sm text-muted mb-6">{plan.description}</p>

                                                <div className="space-y-3">
                                                    <Feature label="PDV (Ponto de Venda)" enabled={plan.features.pdv} />
                                                    <Feature label="Controle de Estoque" enabled={plan.features.estoque} />
                                                    <Feature label="Financeiro" enabled={plan.features.financeiro} />
                                                    <Feature label="Relatórios" enabled={plan.features.relatorios} />
                                                    <div className="border-t border-white/10 pt-3 mt-3">
                                                        <Feature label="Agenda de Reservas" enabled={plan.features.agenda} />
                                                        <Feature label="Automação WhatsApp" enabled={plan.features.automacao} />
                                                        <Feature label="Integrações API" enabled={plan.features.integracaoApi} />
                                                        <Feature label="Suporte Prioritário" enabled={plan.features.suportePrioritario} />
                                                    </div>
                                                </div>

                                                {planType === plan.id ? (
                                                    <div className="mt-6 flex items-center justify-center gap-2 bg-primary text-white py-3 rounded-xl text-sm font-bold">
                                                        <Check className="w-4 h-4" />
                                                        Plano Atual
                                                    </div>
                                                ) : (
                                                    <button className="mt-6 w-full bg-white/10 hover:bg-white/20 text-white py-3 rounded-xl text-sm font-bold transition-all">
                                                        {plan.price === 0 ? 'Usar Gratuito' : 'Fazer Upgrade'}
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Footer Actions */}
                    <div className="mt-12 pt-10 border-t border-white/10 flex flex-col sm:flex-row justify-end gap-4 lg:gap-6">
                        <button
                            onClick={() => setActiveTab(null)}
                            className="px-10 py-4 font-bold border border-white/10 rounded-2xl hover:bg-white/5 active:scale-95 transition-all text-white uppercase tracking-widest text-[10px]"
                        >
                            Voltar
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="px-10 py-4 bg-primary text-white flex items-center justify-center gap-3 font-black text-sm shadow-xl shadow-primary/30 rounded-2xl hover:bg-primary/90 active:scale-95 transition-all"
                        >
                            {saving ? (
                                'Gravando...'
                            ) : (
                                <>
                                    <Save className="w-5 h-5" />
                                    <span className="uppercase tracking-widest">Salvar</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

const SettingsNavItem = ({ icon, label, active, onClick }: any) => (
    <button
        onClick={onClick}
        className={`w-full flex items-center justify-between p-6 rounded-[32px] transition-all ${active ? 'bg-primary text-white shadow-2xl shadow-primary/40 scale-[1.02] border border-white/10' : 'text-muted hover:bg-white/5 hover:text-white'}`}
    >
        <div className="flex items-center gap-5">
            <div className={active ? 'text-white' : ''}>{icon}</div>
            <span className="font-black text-sm tracking-tight uppercase">{label}</span>
        </div>
        {active && <ChevronRight className="w-4 h-4 text-white" />}
    </button>
);

const ApiIntegrationItem = ({ icon, name, status, desc, actionLabel, onAction }: any) => (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between p-5 lg:p-8 bg-white/5 rounded-3xl lg:rounded-[40px] border border-white/10 hover:border-primary/20 hover:bg-white/[0.04] transition-all group gap-4">
        <div className="flex items-center gap-4 lg:gap-6">
            <div className="p-4 lg:p-5 bg-white/5 rounded-xl lg:rounded-2xl group-hover:bg-primary/10 transition-colors shadow-inner">{icon}</div>
            <div>
                <h4 className="font-black text-white text-base lg:text-lg group-hover:text-primary transition-colors">{name}</h4>
                <p className="text-[11px] lg:text-xs text-muted font-medium">{desc}</p>
            </div>
        </div>
        <div className="flex items-center gap-3 sm:gap-4 justify-end">
            <span className={`text-[9px] lg:text-[10px] font-black uppercase px-4 lg:px-5 py-2 rounded-full border ${status === 'Conectado' || status === 'Ativo' ? 'bg-green-500/10 text-green-500 border-green-500/20 shadow-[0_0_15px_rgba(34,197,94,0.1)]' : 'bg-white/5 text-muted border-white/10 opacity-50'}`}>
                {status}
            </span>
            {actionLabel && onAction && (
                <button
                    onClick={onAction}
                    className="text-[9px] lg:text-[10px] font-black uppercase px-4 py-2 bg-primary/20 text-primary border border-primary/30 rounded-full hover:bg-primary/30 active:scale-95 transition-all"
                >
                    {actionLabel}
                </button>
            )}
        </div>
    </div>
);

const NotificationToggle = ({ icon, title, desc, active, onToggle }: any) => (
    <div className="flex items-center justify-between p-5 lg:p-8 bg-white/5 rounded-[32px] lg:rounded-[40px] border border-white/10 hover:border-white/20 transition-all shadow-sm gap-4">
        <div className="flex items-center gap-4 lg:gap-6 flex-1 min-w-0">
            <div className="p-4 lg:p-5 bg-white/5 rounded-2xl shadow-inner shrink-0">{icon}</div>
            <div className="min-w-0">
                <h4 className="font-black text-white text-base lg:text-lg truncate pr-2">{title}</h4>
                <p className="text-xs text-muted font-medium leading-tight line-clamp-2">{desc}</p>
            </div>
        </div>
        <button
            onClick={onToggle}
            className={`relative inline-flex items-center h-8 lg:h-9 rounded-full w-14 lg:w-16 transition-all shrink-0 border-2 ${active
                ? 'bg-primary border-primary shadow-[0_0_20px_rgba(59,130,246,0.3)]'
                : 'bg-white/10 border-white/10'}`}
        >
            <span className={`absolute top-0.5 bottom-0.5 w-6 lg:w-7 bg-white rounded-full shadow-sm transition-all duration-300 ${active
                ? 'right-1'
                : 'left-1'}`}
            />
        </button>
    </div>
);

const Feature = ({ label, enabled }: { label: string; enabled: boolean }) => (
    <div className="flex items-center gap-2">
        {enabled ? (
            <Check className="w-3.5 h-3.5 text-green-500" />
        ) : (
            <div className="w-3.5 h-3.5 rounded-full border border-white/20" />
        )}
        <span className={`text-xs ${enabled ? 'text-white' : 'text-muted/50'}`}>{label}</span>
    </div>
);

export default Settings;
