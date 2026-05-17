// PURPOSE: Provides fixed mobile-first navigation and highlights the active application route.
// USAGE: Rendered by `AppLayout` so protected app pages share the same navigation.

import { NavLink } from "react-router-dom";

import { ROUTES } from "../../utils/constants";

const navItems = [
  { label: "Dashboard", path: ROUTES.dashboard, icon: "D" },
  { label: "Inventory", path: ROUTES.inventory, icon: "I" },
  { label: "Sales", path: ROUTES.sales, icon: "S" },
  { label: "Analytics", path: ROUTES.analytics, icon: "A" },
];

export function BottomNav() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-slate-200 bg-white shadow-[0_-8px_24px_rgba(23,33,29,0.08)]">
      <div className="mx-auto grid h-16 max-w-5xl grid-cols-4">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center gap-1 text-xs font-semibold transition ${
                isActive ? "text-brand-700" : "text-slate-500 hover:text-ink"
              }`
            }
          >
            {({ isActive }) => (
              <>
                <span
                  className={`flex h-7 w-7 items-center justify-center rounded-md text-[11px] ${
                    isActive ? "bg-brand-100" : "bg-slate-100"
                  }`}
                  aria-hidden="true"
                >
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
