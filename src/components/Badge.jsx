import { memo } from 'react';

// Colour classes for each badge tone (good contrast in both themes).
const tones = {
  green: 'bg-emerald-100 text-emerald-900 dark:bg-emerald-900/50 dark:text-emerald-200',
  amber: 'bg-amber-100 text-amber-900 dark:bg-amber-900/50 dark:text-amber-200',
  red: 'bg-red-100 text-red-900 dark:bg-red-900/50 dark:text-red-200',
  blue: 'bg-sky-100 text-sky-900 dark:bg-sky-900/50 dark:text-sky-200',
  slate: 'bg-slate-200 text-slate-800 dark:bg-slate-700 dark:text-slate-200',
  indigo: 'bg-indigo-100 text-indigo-900 dark:bg-indigo-900/50 dark:text-indigo-200',
};

function Badge({ tone = 'slate', children }) {
  return (
    <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${tones[tone]}`}>
      {children}
    </span>
  );
}

export default memo(Badge);
