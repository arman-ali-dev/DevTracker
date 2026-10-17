import { memo } from "react";

// Simple progress bar. "label" is read by screen readers.
function ProgressBar({
  value,
  label,
  size = "md",
  color = "bg-black dark:bg-indigo-400",
}) {
  const h = size === "sm" ? "h-1.5" : "h-2.5";
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={value}
      className={`w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700 ${h}`}
    >
      <div
        className={`${h} rounded-full transition-all ${color}`}
        style={{ width: `${value}%` }}
      />
    </div>
  );
}

export default memo(ProgressBar);
