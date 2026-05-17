// PURPOSE: Renders consistent page titles and context actions for mobile-first screens.
// USAGE: App layout and pages use `PageHeader` to keep top spacing and titles predictable.

export function PageHeader({ title, eyebrow, action }) {
  return (
    <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/95 px-4 py-3 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-3">
        <div>
          {eyebrow ? <p className="text-xs font-semibold uppercase tracking-wide text-brand-600">{eyebrow}</p> : null}
          <h1 className="text-xl font-bold text-ink">{title}</h1>
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
    </header>
  );
}
