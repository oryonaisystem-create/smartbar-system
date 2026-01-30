import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import StaffLogin from './pages/StaffLogin';
import LandingPage from './pages/LandingPage';
import PublicMenu from './pages/PublicMenu';
import { FinanceGuard } from './components/FinanceGuard';
import { PlanGuard } from './components/PlanGuard';
import { NotificationProvider } from './context/NotificationContext';
import { PlanProvider } from './context/PlanContext';
import { EmployeeProvider } from './context/EmployeeContext';
import { CashierProvider } from './context/CashierContext';
import { useAuth } from './context/AuthContext';
import { Loader2 } from 'lucide-react';

// Lazy Load Heavy Components
const Inventory = lazy(() => import('./pages/Inventory'));
const POS = lazy(() => import('./pages/POS'));
const Kitchen = lazy(() => import('./pages/Kitchen'));
const Finance = lazy(() => import('./pages/Finance'));
const Agenda = lazy(() => import('./pages/Agenda'));
const Reports = lazy(() => import('./pages/Reports'));
const Automation = lazy(() => import('./pages/Automation'));
const Settings = lazy(() => import('./pages/Settings'));
const Pricing = lazy(() => import('./pages/PlansPage')); // PLANS UX
const Notifications = lazy(() => import('./pages/Notifications'));
const DownloadPage = lazy(() => import('./pages/DownloadPage').then(module => ({ default: module.DownloadPage })));
const MenuManager = lazy(() => import('./pages/MenuManager').then(module => ({ default: module.MenuManager })));
const Team = lazy(() => import('./pages/Team'));
const Tables = lazy(() => import('./pages/Tables'));
const FeedbackPage = lazy(() => import('./pages/FeedbackPage'));
const WaiterPOS = lazy(() => import('./pages/WaiterPOS'));
const Diagnostic = lazy(() => import('./pages/Diagnostic').then(module => ({ default: module.Diagnostic })));

// Loading Component
const PageLoader = () => (
  <div className="flex h-[50vh] w-full items-center justify-center">
    <Loader2 className="h-10 w-10 animate-spin text-primary" />
  </div>
);

// Check if staff is logged in via localStorage
function getStaffSession() {
  try {
    const saved = localStorage.getItem('smartbar_staff_session');
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error('Error parsing staff session:', e);
  }
  return null;
}

// Minimal Layout for Staff (no sidebar, just header)
function StaffLayout({ children }: { children: React.ReactNode }) {
  const staffSession = getStaffSession();

  const handleLogout = () => {
    localStorage.removeItem('smartbar_staff_session');
    window.location.href = '/staff-login';
  };

  return (
    <div className="min-h-screen bg-[#0f172a]">
      {/* Simple top bar */}
      <header className="bg-[#1e293b] border-b border-white/10 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span className="text-xl font-black text-white italic">SmartBar</span>
          <span className="text-xs font-bold uppercase tracking-widest text-orange-400 bg-orange-500/10 px-3 py-1 rounded-full">
            {staffSession?.role === 'kitchen' ? '👨‍🍳 Cozinha' : '🍽️ Garçom'}
          </span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted">{staffSession?.displayName || staffSession?.username}</span>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all"
          >
            Sair
          </button>
        </div>
      </header>
      {/* Main content */}
      <main className="p-6">
        {children}
      </main>
    </div>
  );
}


function App() {
  const { session, role } = useAuth(); // Status is handled by AuthGate upstream

  // Check for staff session (localStorage based)
  const staffSession = getStaffSession();

  // EMERGENCY DIAGNOSTIC ROUTE - Bypasses all auth/loading checks
  if (window.location.pathname === '/diag') {
    return (
      <Suspense fallback={<PageLoader />}>
        <Diagnostic />
      </Suspense>
    );
  }

  // Loading handled by AuthGate in main.tsx - App only mounts when Ready (Auth or Unauth)

  // STAFF ROUTES (no Supabase auth required)
  if (staffSession && !session) {
    return (
      <PlanProvider>
        <EmployeeProvider>
          <CashierProvider>
            <NotificationProvider>
              <Suspense fallback={<PageLoader />}>
                <Routes>
                  {/* Staff can access their specific pages */}
                  <Route path="/pos" element={
                    <StaffLayout>
                      <WaiterPOS />
                    </StaffLayout>
                  } />
                  <Route path="/kitchen" element={
                    <StaffLayout>
                      <Kitchen />
                    </StaffLayout>
                  } />
                  <Route path="/staff-login" element={<StaffLogin />} />
                  <Route path="/feedback" element={<FeedbackPage />} />
                  <Route path="/menu" element={<PublicMenu />} />

                  {/* Redirect based on role */}
                  <Route path="*" element={
                    staffSession.role === 'kitchen'
                      ? <Navigate to="/kitchen" replace />
                      : <Navigate to="/pos" replace />
                  } />
                </Routes>
              </Suspense>
            </NotificationProvider>
          </CashierProvider>
        </EmployeeProvider>
      </PlanProvider>
    );
  }

  // PUBLIC ROUTES (not logged in at all)
  if (!session) {
    return (
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/download" element={<DownloadPage />} />
          <Route path="/menu" element={<PublicMenu />} />
          <Route path="/staff-login" element={<StaffLogin />} />
          <Route path="/feedback" element={<FeedbackPage />} />
          <Route path="/diag" element={<Diagnostic />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    );
  }

  // --- ADMIN ROLE BASED REDIRECTION ---
  // if (role === 'waiter' && window.location.pathname === '/') {
  //   return <Navigate to="/pos" replace />;
  // }

  if (role === 'kitchen' && window.location.pathname === '/') {
    return <Navigate to="/kitchen" replace />;
  }

  // ADMIN ROUTES (full Supabase auth)
  return (
    <PlanProvider>
      <EmployeeProvider>
        <CashierProvider>
          <NotificationProvider>
            <Suspense fallback={<PageLoader />}>
              <Routes>
                {/* Standalone Routes */}
                <Route path="/download" element={<DownloadPage />} />
                <Route path="/menu" element={<PublicMenu />} />
                <Route path="/diag" element={<Diagnostic />} />

                {/* Main App Layout */}
                <Route path="/*" element={
                  <Layout>
                    <Routes>
                      <Route path="/" element={<Dashboard />} />
                      <Route path="/inventory" element={<Inventory />} />
                      <Route path="/pos" element={<POS />} />
                      <Route path="/kitchen" element={<FinanceGuard><Kitchen /></FinanceGuard>} />
                      <Route path="/finance" element={<FinanceGuard><Finance /></FinanceGuard>} />
                      <Route path="/agenda" element={
                        <PlanGuard feature="agenda" featureName="Agenda">
                          <Agenda />
                        </PlanGuard>
                      } />
                      <Route path="/automation" element={
                        <PlanGuard feature="automacao" featureName="Automação">
                          <Automation />
                        </PlanGuard>
                      } />
                      <Route path="/reports" element={<FinanceGuard><Reports /></FinanceGuard>} />
                      <Route path="/notifications" element={<Notifications />} />
                      <Route path="/team" element={<Team />} />
                      <Route path="/tables" element={<Tables />} />

                      <Route path="/menu-manager" element={<MenuManager />} />
                      <Route path="/settings" element={<Settings />} />
                      <Route path="/configuracoes" element={<Settings />} />
                      <Route path="/pricing" element={<FinanceGuard><Pricing /></FinanceGuard>} />
                      <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                  </Layout>
                } />
              </Routes>
            </Suspense>
          </NotificationProvider>
        </CashierProvider>
      </EmployeeProvider>
    </PlanProvider>
  );
}

export default App;