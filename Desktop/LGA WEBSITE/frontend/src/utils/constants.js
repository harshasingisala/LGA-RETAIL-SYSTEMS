// PURPOSE: Stores shared frontend constants for routes, stock policy, and product categories.
// USAGE: Import from this file instead of duplicating literal values across pages.

export const CATEGORIES = [
  "All",
  "Shampoos",
  "Soaps",
  "Oils",
  "Noodles",
  "Tea/Coffee",
  "Snacks",
  "Cleaning",
  "Personal Care",
  "Staples",
];

export const STOCK_THRESHOLDS = {
  default: 20,
  staples: 50,
  personal_care: 15,
};

export const ROUTES = {
  login: "/login",
  dashboard: "/dashboard",
  inventory: "/inventory",
  sales: "/sales",
  analytics: "/analytics",
};

export const APP_STORAGE_KEYS = {
  session: "warehouse-mgmt-session",
};
