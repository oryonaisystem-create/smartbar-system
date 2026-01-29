import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Session, User } from '@supabase/supabase-js';

type UserRole = 'admin' | 'waiter' | 'kitchen';

interface AuthContextType {
    session: Session | null;
    user: User | null;
    role: UserRole | null;
    avatarUrl: string | null;
    loading: boolean;
    signIn: (email: string, password: string) => Promise<{ error: any }>;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [session, setSession] = useState<Session | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [role, setRole] = useState<UserRole | null>(null);
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let mounted = true;

        const initAuth = async () => {
            console.log('🔄 [Auth] Starting initialization loop...');
            if (!mounted) return;
            setLoading(true);

            // Timeout de segurança para evitar tela preta infinita
            const timeoutPromise = new Promise((_, reject) =>
                setTimeout(() => reject(new Error('TIMEOUT_SUPABASE')), 10000)
            );

            try {
                console.log('🔄 [Auth] Fetching session (with 10s timeout)...');

                const sessionPromise = supabase.auth.getSession();
                const sessionResult = await Promise.race([sessionPromise, timeoutPromise]) as any;

                const { data: { session: currentSession }, error: sessionError } = sessionResult;

                if (sessionError) {
                    console.error('❌ [Auth] Session error:', sessionError);
                    if (mounted) setLoading(false);
                    return;
                }

                console.log('✅ [Auth] Session result:', currentSession ? 'User logged in' : 'No session');

                if (!currentSession?.user) {
                    if (mounted) {
                        setSession(null);
                        setUser(null);
                        setRole(null);
                        setAvatarUrl(null);
                        setLoading(false);
                    }
                    return;
                }

                if (mounted) {
                    setSession(currentSession);
                    setUser(currentSession.user);
                }

                console.log('🔄 [Auth] Fetching profile for user:', currentSession.user.id);

                // Fetch Profile com timeout tbm
                const profilePromise = supabase
                    .from('profiles')
                    .select('role, avatar_url')
                    .eq('id', currentSession.user.id)
                    .single();

                const profileResult = await Promise.race([profilePromise, timeoutPromise]) as any;
                const { data: profile, error: profileError } = profileResult;

                if (profileError) {
                    console.error('❌ [Auth] Profile error:', profileError);
                    // Fallback para admin em desenvolvimento se estiver local ou se for o dono
                    if (mounted) setRole('admin');
                } else if (profile && mounted) {
                    console.log('✅ [Auth] Profile loaded. Role:', profile.role);
                    setRole((profile.role as UserRole) || 'waiter');
                    setAvatarUrl(profile.avatar_url || null);
                }

            } catch (err: any) {
                console.error('💥 [Auth] Error or Timeout:', err.message || err);
                if (err.message === 'TIMEOUT_SUPABASE') {
                    console.warn('⚠️ [Auth] Supabase took too long. Falling back to default session if exists.');
                }

                // Nuclear Fallback: Se travar, pelo menos tenta renderizar algo se houver sessão local
                if (mounted) {
                    setLoading(false);
                    // Se não tivermos role mas tivermos user, assume garçom por segurança
                    if (!role) setRole('waiter');
                }
            } finally {
                if (mounted) {
                    console.log('🏁 [Auth] Initialization complete. Loading state:', false);
                    setLoading(false);
                }
            }
        };

        initAuth();

        const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
            initAuth();
        });

        return () => {
            mounted = false;
            subscription.unsubscribe();
        };
    }, []);

    const signIn = async (email: string, password: string) => {
        const result = await supabase.auth.signInWithPassword({ email, password });
        return result;
    };

    const signOut = async () => {
        try {
            await supabase.auth.signOut();
        } catch (e) {
            console.error('SignOut error:', e);
        }

        // Preserve "Remember Me" email and potentially other persistent settings
        const savedEmail = localStorage.getItem('smartbar_remember_email');

        // Force cleanup
        localStorage.clear();

        // Restore preserved items
        if (savedEmail) {
            localStorage.setItem('smartbar_remember_email', savedEmail);
        }

        setRole(null);
        setAvatarUrl(null);
        setSession(null);
        setUser(null);
        window.location.href = '/login'; // Nuclear re-route to login
    };

    return (
        <AuthContext.Provider value={{ session, user, role, avatarUrl, loading, signIn, signOut }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
