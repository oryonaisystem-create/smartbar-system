import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Session, User } from '@supabase/supabase-js';
import { logEvent } from '../lib/logger';

type UserRole = 'admin' | 'manager' | 'waiter' | 'kitchen';

interface AuthContextType {
    session: Session | null;
    user: User | null;
    role: UserRole | null;
    avatarUrl: string | null;
    status: 'loading' | 'loading_profile' | 'authenticated' | 'unauthenticated' | 'error';
    error: any;
    signIn: (email: string, password: string) => Promise<any>;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [session, setSession] = useState<Session | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [role, setRole] = useState<UserRole | null>(null);
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
    const [status, setStatus] = useState<'loading' | 'loading_profile' | 'authenticated' | 'unauthenticated' | 'error'>('loading');
    const [error, setError] = useState<any>(null);

    useEffect(() => {
        let mounted = true;

        // --- CORE LOGIC: Resolve Profile ---
        const resolveProfile = async (currentSession: Session) => {
            if (!mounted) return;
            setStatus('loading_profile');
            try {
                // 1. Fetch Profile
                // 1. Fetch Profile with Timeout
                const fetchProfilePromise = supabase
                    .from('profiles')
                    .select('role, avatar_url')
                    .eq('id', currentSession.user.id)
                    .single();

                const timeoutPromise = new Promise((_, reject) =>
                    setTimeout(() => reject(new Error('Profile fetch timed out')), 10000)
                );

                // @ts-ignore
                const { data: profile, error: profileError } = await Promise.race([fetchProfilePromise, timeoutPromise]);

                if (profileError && profileError.code === 'PGRST116') {
                    // 2. Profile Missing -> CREATE (SaaS Logic: Default to Admin)
                    logEvent({
                        type: 'auth_success',
                        severity: 'info',
                        message: 'Creating Default Admin Profile',
                        user_id: currentSession.user.id
                    });

                    const { error: insertError } = await supabase
                        .from('profiles')
                        .insert([{
                            id: currentSession.user.id,
                            email: currentSession.user.email,
                            role: 'admin' // DEFAULT ADMIN
                        }]);

                    if (insertError) {
                        console.error('❌ [Auth] Failed to create profile:', insertError);
                        logEvent({ type: 'auth_error', severity: 'error', message: 'Failed to create profile', context: { error: insertError } });
                    }

                    if (mounted) {
                        setRole('admin');
                        setAvatarUrl(null);
                        setStatus('authenticated');
                    }
                } else if (profile) {
                    // 3. Profile Found
                    if (mounted) {
                        // SAAS RULE: Default role is ADMIN.
                        // Only fallback to 'waiter' if there is strong reason, but prompt says "Default role = admin".
                        // However, we must respect DB role if it exists.

                        let finalRole = (profile.role as UserRole) || 'admin';

                        // Whitelist can remain as safety net for self-correction of old accounts
                        const emailToCheck = currentSession.user.email?.toLowerCase().trim();
                        const adminEmails = [
                            'patrick.contatos-smartbar@hotmail.com',
                            'patrick.contatos@hotmail.com',
                            'oryonaisystem@gmail.com'
                        ];

                        if (emailToCheck && adminEmails.includes(emailToCheck)) {
                            finalRole = 'admin';
                            if (profile.role !== 'admin') {
                                console.log('🆙 [Auth] Auto-promoting whitelist user to Admin');
                                supabase.from('profiles').update({ role: 'admin' }).eq('id', currentSession.user.id).then();
                            }
                        }

                        setRole(finalRole);
                        setAvatarUrl(profile.avatar_url || null);
                        setStatus('authenticated');
                        logEvent({ type: 'auth_success', severity: 'info', message: 'User Authenticated', user_id: currentSession.user.id, context: { role: finalRole } });
                    }
                } else {
                    throw profileError || new Error("Profile not found and could not be created.");
                }
            } catch (err: any) {
                console.error('❌ [Auth] Profile Resolution Error:', err);
                logEvent({ type: 'auth_error', severity: 'error', message: 'Profile Resolution Error', context: { error: err } });
                if (mounted) {
                    setError(err);
                    setStatus('error');
                }
            }
        };

        // --- INITIALIZATION ---
        const initializeAuth = async () => {
            try {
                // 1. Get Session
                const { data: { session: initialSession }, error: sessionError } = await supabase.auth.getSession();

                if (sessionError) throw sessionError;

                if (!mounted) return;

                if (initialSession) {
                    setSession(initialSession);
                    setUser(initialSession.user);
                    await resolveProfile(initialSession);
                } else {
                    setStatus('unauthenticated');
                }

            } catch (err: any) {
                console.error('💥 [Auth] Init Error:', err);
                logEvent({ type: 'auth_error', severity: 'error', message: 'Auth Init Error', context: { error: err } });
                if (mounted) {
                    setError(err);
                    setStatus('error');
                }
            }
        };

        initializeAuth();

        // --- LISTENER ---
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, newSession) => {
            console.log(`🔔 [Auth] Change Event: ${event}`);
            if (!mounted) return;

            if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
                if (newSession) {
                    setSession(newSession);
                    setUser(newSession.user);
                    await resolveProfile(newSession);
                }
            } else if (event === 'SIGNED_OUT') {
                logEvent({ type: 'auth_success', severity: 'info', message: 'User Signed Out' });
                setSession(null);
                setUser(null);
                setRole(null);
                setAvatarUrl(null);
                setStatus('unauthenticated');
            }
        });

        return () => {
            mounted = false;
            subscription.unsubscribe();
        };
    }, []);

    const signIn = async (email: string, password: string) => {
        const result = await supabase.auth.signInWithPassword({ email, password });
        if (result.error) {
            logEvent({ type: 'auth_error', severity: 'warning', message: 'Sign In Failed', context: { email, error: result.error.message } });
        }
        return result;
    };

    const signOut = async () => {
        try {
            await supabase.auth.signOut();
        } catch (e: any) {
            console.error('SignOut error:', e);
            logEvent({ type: 'auth_error', severity: 'error', message: 'SignOut Error', context: { error: e.message } });
            localStorage.removeItem('supabase.auth.token');
            window.location.reload();
        }

        const savedEmail = localStorage.getItem('smartbar_remember_email');
        if (savedEmail) localStorage.setItem('smartbar_remember_email', savedEmail);
    };

    return (
        <AuthContext.Provider value={{ session, user, role, avatarUrl, status, error, signIn, signOut }}>
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
