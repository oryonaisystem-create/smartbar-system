import React from 'react';
import { useAuth } from '../context/AuthContext';
import { LoadingState } from './ui/LoadingState';
import { ErrorMessage } from './ui/ErrorMessage';
import Login from '../pages/Login';

interface AuthGateProps {
    children: React.ReactNode;
}

export const AuthGate = ({ children }: AuthGateProps) => {
    const { status, error } = useAuth();

    // 1. BOOTING: Starting up, initial Session check
    if (status === 'booting') {
        return (
            <div className="min-h-screen bg-[#020617] flex items-center justify-center">
                <LoadingState message="Iniciando SmartBar..." />
            </div>
        );
    }

    // 2. LOADING PROFILE: Session found, syncing profile
    if (status === 'loading_profile') {
        return (
            <div className="min-h-screen bg-[#020617] flex items-center justify-center">
                <LoadingState message="Sincronizando Perfil..." />
            </div>
        );
    }

    // 3. UNAUTHENTICATED: No session or profile -> Login
    // Note: We render Login directly here, blocking access to ANY route if not logged in.
    // If you need public pages (outside AuthGate), you must structure App.tsx differently.
    // But for a SaaS/Enterprise app, wrapping everything often makes sense, 
    // OR we put AuthGate inside specific Route guards.
    // Given the prompt "Centralize Access", let's defer the "Rendering Logic" to this gate for protected routes.
    // However, App.tsx has public routes (Home, Login, etc).
    // The "Principle" says: No component renders before status is known.
    // So if Unauthenticated, we let the Router decide (usually redirect to Login).
    // BUT, the prompt said: "AuthGate decides: unauthenticated -> Login".
    // Let's assume AuthGate wraps the PROTECTED part of the app.
    // Wait, step 3 says "AuthGate wraps AppRoutes".
    // If I wrap everything, Public pages might be inaccessible if I enforce login.
    // I will implementation AuthGate to EXPOSE the status, but if I return <Login> for unauthenticated,
    // I block Landing Page.
    // Refinement: AuthGate should return `children` even if unauthenticated, 
    // BUT `AuthContext` must be ready. 
    // Actually, looking at the user prompt: "Booting -> Loader", "Unauthenticated -> Login".
    // This implies the entire App is behind the gate?
    // "App.tsx has public routes".
    // I will implement AuthGate to be "Status Ready Gate".
    // It blocks 'booting' and 'loading_profile'.
    // It allows 'authenticated' and 'unauthenticated' to pass through, allowing the Router to handle "Landing Page" vs "Dashboard".
    // WAIT. If I pass 'unauthenticated', existing logic in App.tsx (`if (!session) return <Routes>...`) handles the public pages.
    // So AuthGate just needs to BLOCK 'booting' and 'loading_profile'.

    if (status === 'error') {
        return (
            <div className="min-h-screen bg-[#020617] flex items-center justify-center p-4">
                <ErrorMessage
                    message={`Erro crítico de autenticação: ${error?.message || 'Desconhecido'}`}
                    onRetry={() => window.location.reload()}
                />
            </div>
        );
    }

    // 4. AUTHENTICATED or UNAUTHENTICATED (Ready)
    // We let the children (Router) decide what to show based on `session` / `user` presence.
    return <>{children}</>;
};
