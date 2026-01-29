import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Users, Shield, UserCog, ChefHat, Search, AlertCircle, UserPlus, X, Eye, EyeOff, Trash2, Loader2, CheckCircle2, Power, Pencil } from 'lucide-react';

interface StaffUser {
    id: string;
    username: string;
    display_name: string;
    role: 'admin' | 'waiter' | 'kitchen';
    active: boolean;
    created_at: string;
    last_login?: string;
}

// Same hash function as StaffLogin
async function hashPassword(password: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(password + 'smartbar_salt_2026');
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export default function Team() {
    const [staffUsers, setStaffUsers] = useState<StaffUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    // Create form state
    const [showCreate, setShowCreate] = useState(false);
    const [creating, setCreating] = useState(false);
    const [newUser, setNewUser] = useState({
        username: '',
        password: '',
        displayName: '',
        role: 'waiter'
    });
    const [showPassword, setShowPassword] = useState(false);
    const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null);

    // Edit state
    const [showEdit, setShowEdit] = useState(false);
    const [editingUser, setEditingUser] = useState<StaffUser | null>(null);
    const [editData, setEditData] = useState({
        displayName: '',
        username: '',
        role: 'waiter' as any,
        password: '' // Optional for reset
    });

    useEffect(() => {
        fetchStaffUsers();
    }, []);

    const showNotif = (type: 'success' | 'error', message: string) => {
        setNotification({ type, message });
        setTimeout(() => setNotification(null), 3000);
    };

    const fetchStaffUsers = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('staff_users')
            .select('*')
            .order('created_at', { ascending: false });

        if (!error && data) {
            setStaffUsers(data as StaffUser[]);
        }
        setLoading(false);
    };

    const createStaffUser = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!newUser.username || !newUser.password) {
            showNotif('error', 'Preencha usuário e senha');
            return;
        }

        if (newUser.password.length < 4) {
            showNotif('error', 'Senha deve ter pelo menos 4 caracteres');
            return;
        }

        setCreating(true);

        try {
            const passwordHash = await hashPassword(newUser.password);

            const { error } = await supabase
                .from('staff_users')
                .insert({
                    username: newUser.username.toLowerCase().trim(),
                    password_hash: passwordHash,
                    display_name: newUser.displayName || newUser.username,
                    role: newUser.role,
                    active: true
                });

            if (error) {
                if (error.code === '23505') {
                    throw new Error('Usuário já existe');
                }
                throw error;
            }

            showNotif('success', `Funcionário "${newUser.username}" criado com sucesso!`);
            setNewUser({ username: '', password: '', displayName: '', role: 'waiter' });
            setShowCreate(false);
            fetchStaffUsers();
        } catch (err: any) {
            showNotif('error', err.message || 'Erro ao criar funcionário');
        } finally {
            setCreating(false);
        }
    };

    const toggleUserActive = async (user: StaffUser) => {
        const { error } = await supabase
            .from('staff_users')
            .update({ active: !user.active })
            .eq('id', user.id);

        if (!error) {
            showNotif('success', user.active ? 'Funcionário desativado' : 'Funcionário ativado');
            fetchStaffUsers();
        }
    };

    const deleteUser = async (user: StaffUser) => {
        if (!confirm(`Excluir permanentemente "${user.display_name}"?`)) return;

        const { error } = await supabase
            .from('staff_users')
            .delete()
            .eq('id', user.id);

        if (!error) {
            showNotif('success', 'Funcionário excluído');
            fetchStaffUsers();
        }
    };

    const updateRole = async (id: string, newRole: string) => {
        const { error } = await supabase
            .from('staff_users')
            .update({ role: newRole })
            .eq('id', id);

        if (!error) {
            setStaffUsers(staffUsers.map(u => u.id === id ? { ...u, role: newRole as any } : u));
        }
    };

    const handleEditClick = (user: StaffUser) => {
        setEditingUser(user);
        setEditData({
            displayName: user.display_name,
            username: user.username,
            role: user.role,
            password: ''
        });
        setShowEdit(true);
    };

    const updateStaffUser = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingUser) return;

        setCreating(true);
        try {
            const updates: any = {
                display_name: editData.displayName,
                username: editData.username.toLowerCase().trim(),
                role: editData.role,
            };

            if (editData.password) {
                if (editData.password.length < 4) {
                    throw new Error('Nova senha deve ter pelo menos 4 caracteres');
                }
                updates.password_hash = await hashPassword(editData.password);
            }

            const { error } = await supabase
                .from('staff_users')
                .update(updates)
                .eq('id', editingUser.id);

            if (error) throw error;

            showNotif('success', 'Funcionário atualizado!');
            setShowEdit(false);
            fetchStaffUsers();
        } catch (err: any) {
            showNotif('error', err.message || 'Erro ao atualizar');
        } finally {
            setCreating(false);
        }
    };

    const filteredUsers = staffUsers.filter(u =>
        u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (u.display_name || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getRoleBadge = (role: string) => {
        switch (role) {
            case 'admin': return <span className="bg-purple-500/20 text-purple-400 px-2 py-1 rounded text-xs font-black uppercase flex items-center gap-1 border border-purple-500/20"><Shield className="w-3 h-3" /> Admin</span>;
            case 'waiter': return <span className="bg-blue-500/20 text-blue-400 px-2 py-1 rounded text-xs font-black uppercase flex items-center gap-1 border border-blue-500/20"><UserCog className="w-3 h-3" /> Garçom</span>;
            case 'kitchen': return <span className="bg-orange-500/20 text-orange-400 px-2 py-1 rounded text-xs font-black uppercase flex items-center gap-1 border border-orange-500/20"><ChefHat className="w-3 h-3" /> Cozinha</span>;
            default: return <span className="bg-gray-500/20 text-gray-400 px-2 py-1 rounded text-xs font-black uppercase border border-gray-500/20">Sem Cargo</span>;
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-20">
            {/* Notification */}
            {notification && (
                <div className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-2xl font-bold shadow-2xl animate-in slide-in-from-right flex items-center gap-2 ${notification.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                    }`}>
                    {notification.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                    {notification.message}
                </div>
            )}

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-white tracking-tighter flex items-center gap-3">
                        <Users className="w-8 h-8 text-primary" />
                        Gestão de Equipe
                    </h1>
                    <p className="text-muted text-sm mt-1">Crie e gerencie contas de funcionários.</p>
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={() => setShowCreate(!showCreate)}
                        className="btn-primary px-4 rounded-xl flex items-center gap-2 text-sm font-bold uppercase transition-transform hover:scale-105 active:scale-95"
                    >
                        <UserPlus className="w-4 h-4" />
                        Novo Funcionário
                    </button>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Buscar..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="bg-white/5 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-primary/50 outline-none w-full md:w-64"
                        />
                    </div>
                </div>
            </div>

            {/* Create Form */}
            {showCreate && (
                <div className="glass-card p-6 border border-primary/20 bg-primary/5 animate-in slide-in-from-top-4">
                    <div className="flex justify-between items-start mb-6">
                        <h3 className="font-bold text-white flex items-center gap-2">
                            <UserPlus className="w-5 h-5 text-primary" />
                            Criar Novo Funcionário
                        </h3>
                        <button onClick={() => setShowCreate(false)}><X className="w-5 h-5 text-muted hover:text-white" /></button>
                    </div>

                    <form onSubmit={createStaffUser} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-muted">Nome de Exibição</label>
                            <input
                                type="text"
                                placeholder="Ex: João Silva"
                                value={newUser.displayName}
                                onChange={(e) => setNewUser({ ...newUser, displayName: e.target.value })}
                                className="w-full bg-black/20 border border-white/10 rounded-xl py-3 px-4 text-white outline-none focus:ring-2 focus:ring-primary/50"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-muted">Usuário (Login) *</label>
                            <input
                                type="text"
                                placeholder="Ex: joao"
                                value={newUser.username}
                                onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                                className="w-full bg-black/20 border border-white/10 rounded-xl py-3 px-4 text-white outline-none focus:ring-2 focus:ring-primary/50"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-muted">Senha *</label>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="••••••"
                                    value={newUser.password}
                                    onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                                    className="w-full bg-black/20 border border-white/10 rounded-xl py-3 px-4 pr-10 text-white outline-none focus:ring-2 focus:ring-primary/50"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-white"
                                >
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-muted">Cargo</label>
                            <select
                                value={newUser.role}
                                onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                                className="w-full bg-black/20 border border-white/10 rounded-xl py-3 px-4 text-white outline-none focus:ring-2 focus:ring-primary/50"
                            >
                                <option value="waiter">Garçom</option>
                                <option value="kitchen">Cozinha</option>
                            </select>
                        </div>

                        <button
                            type="submit"
                            disabled={creating}
                            className="btn-primary h-[50px] px-6 rounded-xl font-bold uppercase tracking-widest hover:scale-105 transition-transform flex items-center justify-center gap-2"
                        >
                            {creating ? <Loader2 className="w-5 h-5 animate-spin" /> : <><UserPlus className="w-4 h-4" /> Criar</>}
                        </button>
                    </form>
                </div>
            )}

            {/* Edit Form Modal Overlay */}
            {showEdit && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="glass-card w-full max-w-xl p-8 border border-white/10 shadow-2xl relative animate-in slide-in-from-bottom-4">
                        <button
                            onClick={() => setShowEdit(false)}
                            className="absolute top-6 right-6 text-muted hover:text-white transition-colors"
                        >
                            <X className="w-6 h-6" />
                        </button>

                        <div className="mb-8">
                            <h3 className="text-2xl font-black text-white flex items-center gap-3">
                                <UserCog className="w-8 h-8 text-primary" />
                                Editar Funcionário
                            </h3>
                            <p className="text-muted text-sm">Altere os dados de @{editingUser?.username}</p>
                        </div>

                        <form onSubmit={updateStaffUser} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-muted">Nome de Exibição</label>
                                    <input
                                        type="text"
                                        value={editData.displayName}
                                        onChange={(e) => setEditData({ ...editData, displayName: e.target.value })}
                                        className="w-full bg-black/20 border border-white/10 rounded-xl py-4 px-5 text-white outline-none focus:ring-2 focus:ring-primary/50"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-muted">Usuário (Login)</label>
                                    <input
                                        type="text"
                                        value={editData.username}
                                        onChange={(e) => setEditData({ ...editData, username: e.target.value })}
                                        className="w-full bg-black/20 border border-white/10 rounded-xl py-4 px-5 text-white outline-none focus:ring-2 focus:ring-primary/50"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-muted">Cargo</label>
                                    <select
                                        value={editData.role}
                                        onChange={(e) => setEditData({ ...editData, role: e.target.value as any })}
                                        className="w-full bg-black/20 border border-white/10 rounded-xl py-4 px-5 text-white outline-none focus:ring-2 focus:ring-primary/50"
                                    >
                                        <option value="waiter">Garçom</option>
                                        <option value="kitchen">Cozinha</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-muted">Nova Senha (opcional)</label>
                                    <input
                                        type="password"
                                        placeholder="Deixe em branco para não alterar"
                                        value={editData.password}
                                        onChange={(e) => setEditData({ ...editData, password: e.target.value })}
                                        className="w-full bg-black/20 border border-white/10 rounded-xl py-4 px-5 text-white outline-none focus:ring-2 focus:ring-primary/50"
                                    />
                                </div>
                            </div>

                            <div className="flex gap-4 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowEdit(false)}
                                    className="flex-1 py-4 rounded-xl font-bold uppercase tracking-widest border border-white/10 text-muted hover:bg-white/5 transition-all text-xs"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={creating}
                                    className="flex-[2] btn-primary py-4 rounded-xl font-bold uppercase tracking-widest hover:scale-[1.02] transition-transform flex items-center justify-center gap-2"
                                >
                                    {creating ? <Loader2 className="w-5 h-5 animate-spin" /> : <><CheckCircle2 className="w-4 h-4" /> Salvar Alterações</>}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Staff List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {loading ? (
                    <div className="col-span-full py-20 text-center">
                        <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
                    </div>
                ) : filteredUsers.length === 0 ? (
                    <div className="col-span-full py-20 text-center opacity-30">
                        <Users className="w-16 h-16 mx-auto mb-4" />
                        <p>Nenhum funcionário cadastrado.</p>
                        <p className="text-sm mt-2">Clique em "Novo Funcionário" para começar.</p>
                    </div>
                ) : (
                    filteredUsers.map(user => (
                        <div key={user.id} className={`glass-card p-6 border relative group transition-all ${user.active ? 'border-white/5 hover:border-white/10' : 'border-red-500/20 opacity-60'
                            }`}>
                            {/* Inactive overlay */}
                            {!user.active && (
                                <div className="absolute top-3 right-3">
                                    <span className="text-[9px] font-black uppercase tracking-widest bg-red-500/20 text-red-400 px-2 py-1 rounded border border-red-500/20">
                                        INATIVO
                                    </span>
                                </div>
                            )}

                            <div className="flex items-start gap-4 mb-6">
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold border ${user.role === 'kitchen' ? 'bg-gradient-to-br from-orange-600 to-red-600 border-orange-500/30' :
                                    'bg-gradient-to-br from-blue-600 to-indigo-600 border-blue-500/30'
                                    }`}>
                                    {user.display_name ? user.display_name.charAt(0).toUpperCase() : user.username.charAt(0).toUpperCase()}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-bold text-white truncate">{user.display_name || user.username}</h3>
                                    <p className="text-xs text-muted font-mono truncate mb-2">@{user.username}</p>
                                    {getRoleBadge(user.role)}
                                </div>
                            </div>

                            {/* Role selector */}
                            <div className="bg-white/5 p-3 rounded-xl mb-4">
                                <label className="text-[10px] font-black uppercase tracking-widest text-muted block mb-2">Alterar Cargo</label>
                                <select
                                    value={user.role}
                                    onChange={(e) => updateRole(user.id, e.target.value)}
                                    className="w-full bg-black/20 border border-white/10 rounded-lg py-2 px-3 text-sm text-white appearance-none outline-none focus:ring-2 focus:ring-primary/50"
                                >
                                    <option value="waiter">Garçom</option>
                                    <option value="kitchen">Cozinha</option>
                                </select>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-2">
                                <button
                                    onClick={() => toggleUserActive(user)}
                                    className={`flex-1 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-1 ${user.active
                                        ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 hover:bg-yellow-500 hover:text-white'
                                        : 'bg-green-500/10 text-green-400 border border-green-500/20 hover:bg-green-500 hover:text-white'
                                        }`}
                                >
                                    <Power className="w-3 h-3" />
                                    {user.active ? 'Desativar' : 'Ativar'}
                                </button>
                                <button
                                    onClick={() => handleEditClick(user)}
                                    className="py-2 px-3 rounded-xl text-xs font-bold bg-white/5 text-white border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all"
                                    title="Editar Dados"
                                >
                                    <Pencil className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => deleteUser(user)}
                                    className="py-2 px-3 rounded-xl text-xs font-bold bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500 hover:text-white transition-all"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>

                            {/* Last login */}
                            {user.last_login && (
                                <p className="text-[10px] text-muted mt-3 text-center">
                                    Último acesso: {new Date(user.last_login).toLocaleString('pt-BR')}
                                </p>
                            )}
                        </div>
                    ))
                )}
            </div>

            {/* Info box */}
            <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl flex gap-3 text-sm text-blue-200">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <p>
                    <strong>Como funciona:</strong> Funcionários acessam pelo link <code className="bg-black/30 px-2 py-0.5 rounded text-xs">/staff-login</code> usando usuário e senha criados aqui.
                </p>
            </div>
        </div>
    );
}
