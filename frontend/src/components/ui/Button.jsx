// PURPOSE: Provides a reusable button with consistent sizing, states, and visual variants.
// USAGE: Import `Button` in pages and components for primary, secondary, and ghost actions.

const variants = {
  primary: "bg-brand-600 text-white hover:bg-brand-700 focus:ring-brand-500",
  secondary: "bg-white text-ink border border-slate-200 hover:bg-slate-50 focus:ring-brand-500",
  ghost: "bg-transparent text-slate-700 hover:bg-slate-100 focus:ring-slate-300",
  danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500",
};

export function Button({
  children,
  type = "button",
  variant = "primary",
  className = "",
  disabled = false,
  ...props
}) {
  return (
    <button
      type={type}
      disabled={disabled}
      className={`inline-flex min-h-11 items-center justify-center rounded-md px-4 py-2 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
