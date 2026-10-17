// Returns the list of ids that appear more than once.
export function findDuplicateIds(list) {
  const seen = new Set();
  const dupes = new Set();
  for (const entry of list || []) {
    if (!entry || entry.id === undefined) continue;
    if (seen.has(entry.id)) dupes.add(entry.id);
    seen.add(entry.id);
  }
  return [...dupes];
}
