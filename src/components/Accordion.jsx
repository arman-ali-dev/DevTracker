import { useEffect, useId, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import ProgressBar from './ProgressBar.jsx';

// Collapsible block with a header, a percent and an optional action area.
// Children are only rendered when open, which keeps long lists fast.
export default function Accordion({
  title,
  subtitle,
  percent,
  defaultOpen = false,
  forceOpen = false,
  openSignal,
  actions,
  level = 1,
  children,
}) {
  const [open, setOpen] = useState(defaultOpen);
  // Open the block whenever openSignal changes (used by "random weak question").
  useEffect(() => {
    if (openSignal) setOpen(true);
  }, [openSignal]);
  const panelId = useId();
  const isOpen = open || forceOpen;
  const box =
    level === 1
      ? 'rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900'
      : 'rounded-lg border border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900/60';

  return (
    <section className={box}>
      <div className="flex flex-wrap items-center gap-2 p-3 sm:p-4">
        <button
          type="button"
          onClick={() => setOpen(!open)}
          aria-expanded={isOpen}
          aria-controls={panelId}
          className="flex min-w-0 flex-1 items-center gap-2 rounded text-left"
        >
          <ChevronDown
            className={`h-5 w-5 shrink-0 transition-transform ${isOpen ? '' : '-rotate-90'}`}
            aria-hidden="true"
          />
          <span className="min-w-0">
            <span className={`block truncate font-semibold ${level === 1 ? 'text-base' : 'text-sm'}`}>
              {title}
            </span>
            {subtitle && (
              <span className="block text-xs text-slate-600 dark:text-slate-400">{subtitle}</span>
            )}
          </span>
        </button>
        {actions}
        {percent !== undefined && (
          <div className="flex w-full items-center gap-2 sm:w-40">
            <ProgressBar value={percent} label={`${title} progress`} size="sm" />
            <span className="w-10 text-right text-xs font-semibold tabular-nums">{percent}%</span>
          </div>
        )}
      </div>
      {isOpen && (
        <div id={panelId} className="border-t border-slate-200 p-3 dark:border-slate-800 sm:p-4">
          {children}
        </div>
      )}
    </section>
  );
}
