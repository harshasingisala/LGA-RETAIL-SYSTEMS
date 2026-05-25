// PURPOSE: Provides consistent card surfaces for compact operational content.
// USAGE: Wrap dashboard metrics, lists, and forms with `Card`.

export function Card({ children, className = "" }) {
  return (
    <section className={`rounded-lg border border-slate-200 bg-white shadow-soft ${className}`}>
      {children}
    </section>
  );
}

export function CardHeader({ title, description, action }) {
  return (
    <div className="flex items-start justify-between gap-3 border-b border-slate-100 px-4 py-3">
      <div>
        <h2 className="text-base font-semibold text-ink">{title}</h2>
        {description ? <p className="mt-1 text-sm text-slate-500">{description}</p> : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

export function CardBody({ children, className = "" }) {
  return <div className={`px-4 py-4 ${className}`}>{children}</div>;
}
