// PURPOSE: Provides the protected mobile app shell with header, scrollable content, and bottom navigation.
// USAGE: Used as the parent route element for dashboard, inventory, sales, and analytics pages.

import { Outlet, useLocation } from "react-router-dom";

import { BottomNav } from "../components/layout/BottomNav";
import { PageHeader } from "../components/layout/PageHeader";
import { Button } from "../components/ui/Button";
import { ROUTES } from "../utils/constants";

const titlesByPath = {
  [ROUTES.dashboard]: "Dashboard",
  [ROUTES.inventory]: "Inventory",
  [ROUTES.sales]: "Sales",
  [ROUTES.analytics]: "Analytics",
};

export function AppLayout({ onLogout }) {
  const location = useLocation();
  const title = titlesByPath[location.pathname] || "GodownAdmin";

  return (
    <div className="min-h-screen bg-slate-50">
      <PageHeader
        eyebrow={import.meta.env.VITE_APP_NAME || "GodownAdmin"}
        title={title}
        action={
          <Button variant="secondary" className="min-h-9 px-3 py-1.5 text-xs" onClick={onLogout}>
            Sign out
          </Button>
        }
      />
      <main className="mx-auto max-w-5xl overflow-y-auto px-4 py-4 pb-20">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
}
