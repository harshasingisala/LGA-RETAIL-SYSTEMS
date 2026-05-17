// PURPOSE: Defines application routing, local auth state, and protected app routes.
// USAGE: Rendered by `main.jsx` as the root React component.

import { lazy, Suspense } from "react";
import { BrowserRouter, Navigate, Route, Routes, useLocation } from "react-router-dom";

import { AppLayout } from "./layouts/AppLayout";
import { DashboardPage } from "./pages/DashboardPage";
import { InventoryPage } from "./pages/InventoryPage";
import { LoginPage } from "./pages/LoginPage";
import { SalesPage } from "./pages/SalesPage";
import { useLocalStorage } from "./hooks/useLocalStorage";
import { APP_STORAGE_KEYS, ROUTES } from "./utils/constants";

const AnalyticsPage = lazy(() =>
  import("./pages/AnalyticsPage").then((module) => ({ default: module.AnalyticsPage })),
);

function ProtectedRoute({ session, children }) {
  const location = useLocation();

  if (!session?.isAuthenticated) {
    return <Navigate to={ROUTES.login} replace state={{ from: location }} />;
  }

  return children;
}

function RootRedirect({ session }) {
  return <Navigate to={session?.isAuthenticated ? ROUTES.dashboard : ROUTES.login} replace />;
}

export default function App() {
  const [session, setSession, clearSession] = useLocalStorage(APP_STORAGE_KEYS.session, {
    isAuthenticated: false,
    userName: "",
  });

  function handleLogin(userName) {
    setSession({ isAuthenticated: true, userName });
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<RootRedirect session={session} />} />
        <Route path={ROUTES.login} element={<LoginPage session={session} onLogin={handleLogin} />} />
        <Route
          element={
            <ProtectedRoute session={session}>
              <AppLayout onLogout={clearSession} />
            </ProtectedRoute>
          }
        >
          <Route path={ROUTES.dashboard} element={<DashboardPage />} />
          <Route path={ROUTES.inventory} element={<InventoryPage />} />
          <Route path={ROUTES.sales} element={<SalesPage />} />
          <Route
            path={ROUTES.analytics}
            element={
              <Suspense
                fallback={
                  <div className="rounded-lg border border-slate-200 bg-white p-4 text-sm font-semibold text-slate-600">
                    Loading analytics...
                  </div>
                }
              >
                <AnalyticsPage />
              </Suspense>
            }
          />
        </Route>
        <Route path="*" element={<Navigate to={ROUTES.dashboard} replace />} />
      </Routes>
    </BrowserRouter>
  );
}
