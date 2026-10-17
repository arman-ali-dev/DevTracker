import { Search } from 'lucide-react';

// Search box with an icon and a hidden label.
export default function SearchInput({ value, onChange, placeholder = 'Search...' }) {
  return (
    <label className="relative block">
      <span className="sr-only">{placeholder}</span>
      <Search
        className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500"
        aria-hidden="true"
      />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg border border-slate-300 bg-white py-2 pl-9 pr-3 text-sm placeholder:text-slate-500 dark:border-slate-700 dark:bg-slate-900"
      />
    </label>
  );
}
