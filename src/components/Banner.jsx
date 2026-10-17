import { AlertTriangle } from 'lucide-react';

// Small warning banner.
export default function Banner({ children }) {
  return (
    <div
      role="alert"
      className="flex items-start gap-2 border-b border-amber-300 bg-amber-100 px-4 py-2 text-sm text-amber-950 dark:border-amber-800 dark:bg-amber-900/40 dark:text-amber-100"
    >
      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
      <span>{children}</span>
    </div>
  );
}
