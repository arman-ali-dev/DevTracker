// Safe localStorage helpers. Every call is wrapped in try/catch.
export const STORAGE_KEY = 'prep-tracker:v1';
export const CURRENT_VERSION = 1;

export function emptyState() {
  return {
    version: CURRENT_VERSION,
    roadmap: {},
    dsa: {},
    interview: {},
    settings: { theme: 'light' },
  };
}

// Placeholder for future data changes. Today it only fills missing parts.
export function migrate(data) {
  const base = emptyState();
  const src = data && typeof data === 'object' ? data : {};
  // Example for the future: if (src.version === 1) { ...convert to 2... }
  return {
    version: CURRENT_VERSION,
    roadmap: { ...base.roadmap, ...(src.roadmap || {}) },
    dsa: { ...base.dsa, ...(src.dsa || {}) },
    interview: { ...base.interview, ...(src.interview || {}) },
    settings: { ...base.settings, ...(src.settings || {}) },
  };
}

// Read state. Returns { state, ok }. ok = false means storage is not usable.
export function loadState() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { state: emptyState(), ok: true };
    return { state: migrate(JSON.parse(raw)), ok: true };
  } catch (err) {
    // Storage blocked or data is broken: start empty and keep working in memory.
    return { state: emptyState(), ok: false };
  }
}

// Write state. Returns true when it worked.
export function saveState(state) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    return true;
  } catch (err) {
    return false;
  }
}

// Remove all saved progress. Returns true when it worked.
export function clearState() {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
    return true;
  } catch (err) {
    return false;
  }
}

// Size of the saved data in bytes (approximate, UTF-16 safe enough for display).
export function storageSize(state) {
  try {
    return new Blob([JSON.stringify(state)]).size;
  } catch (err) {
    return 0;
  }
}

export function formatBytes(n) {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(2)} MB`;
}
