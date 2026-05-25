// PURPOSE: Root router. Auth state comes from AuthContext (real Supabase session).
// USAGE: Rendered by main.jsx wrapped in <AuthProvider>.

import { lazy, Suspense } from "react";
import { BrowserRouter, Navigate, Route, Routes, useLocation } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import { AppLayout } from "./layouts/AppLayout";
import { LoginPage } from "./pages/LoginPage";
import { ROUTES } from "./utils/constants";

const DashboardPage  = lazy(() => import("./pages/DashboardPage").then(m => ({ default: m.DashboardPage })));
const InventoryPage  = lazy(() => import("./pages/InventoryPage").then(m => ({ default: m.InventoryPage })));
const SalesPage      = lazy(() => import("./pages/SalesPage").then(m => ({ default: m.SalesPage })));
const BillingPage    = lazy(() => import("./pages/BillingPage").then(m => ({ default: m.BillingPage })));
const AnalyticsPage  = lazy(() => import("./pages/AnalyticsPage").then(m => ({ default: m.AnalyticsPage })));

const PageLoader = () => (
  <div className="flex h-48 items-center justify-center text-sm text-slate-500">
    Loading…
  </div>
);

function ProtectedRoute({ children, requiredRole }) {
  const { user, profile, loading } = useAuth();
  const location = useLocation();

  if (loading) return <PageLoader />;
  if (!user)   return <Navigate to={ROUTES.login} state={{ from: location }} replace />;
  if (!profile?.is_active) return <Navigate to={ROUTES.login} replace />;

  // Role guard (optional per-route)
  const roleRank = { cashier: 1, manager: 2, admin: 3 };
  if (requiredRole && (roleRank[profile?.role] ?? 0) < roleRank[requiredRole]) {
    return <Navigate to={ROUTES.dashboard} replace />;
  }

  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to={ROUTES.dashboard} replace />} />
        <Route path={ROUTES.login} element={<LoginPage />} />

        <Route
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route path={ROUTES.dashboard} element={
            <Suspense fallback={<PageLoader />}><DashboardPage /></Suspense>
          }/>
          <Route path={ROUTES.billing} element={
            <Suspense fallback={<PageLoader />}><BillingPage /></Suspense>
          }/>
          <Route path={ROUTES.inventory} element={
            <Suspense fallback={<PageLoader />}><InventoryPage /></Suspense>
          }/>
          <Route path={ROUTES.sales} element={
            <Suspense fallback={<PageLoader />}><SalesPage /></Suspense>
          }/>
          <Route path={ROUTES.analytics} element={
            <ProtectedRoute requiredRole="manager">
              <Suspense fallback={<PageLoader />}><AnalyticsPage /></Suspense>
            </ProtectedRoute>
          }/>
        </Route>

        <Route path="*" element={<Navigate to={ROUTES.dashboard} replace />} />
      </Routes>
    </BrowserRouter>
  );
}
