import { memo } from 'react';

// Checkbox with a proper label. "label" is used for screen readers.
function Checkbox({ checked, onChange, label }) {
  return (
    <input
      type="checkbox"
      checked={checked}
      onChange={(e) => onChange(e.target.checked)}
      aria-label={label}
      className="h-5 w-5 shrink-0 cursor-pointer rounded border-slate-400 accent-indigo-600"
    />
  );
}

export default memo(Checkbox);
