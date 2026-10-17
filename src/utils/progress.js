// Pure helper functions for progress maths. No React in here.

// percent = round(done / total * 100). Safe when total is 0.
export function percent(done, total) {
  if (!total || total <= 0) return 0;
  return Math.round((done / total) * 100);
}

// Count done items for a list of content items, using a progress map.
// Only items that exist in the list are counted.
export function countDone(items, progressMap) {
  let done = 0;
  for (const item of items) {
    if (progressMap && progressMap[item.id] && progressMap[item.id].done) done += 1;
  }
  return { done, total: items.length, percent: percent(done, items.length) };
}

// Group a flat list by a key. Keeps the first-seen order.
export function groupBy(items, key) {
  const map = new Map();
  for (const item of items) {
    const k = item[key];
    if (!map.has(k)) map.set(k, []);
    map.get(k).push(item);
  }
  return [...map.entries()].map(([name, list]) => ({ name, items: list }));
}

// Sum several {done,total} results into one.
export function combine(results) {
  const done = results.reduce((s, r) => s + r.done, 0);
  const total = results.reduce((s, r) => s + r.total, 0);
  return { done, total, percent: percent(done, total) };
}

// Start of today in local time (ms).
export function startOfToday(now = Date.now()) {
  const d = new Date(now);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

// Start of this week (Monday, local time, ms).
export function startOfWeek(now = Date.now()) {
  const d = new Date(now);
  d.setHours(0, 0, 0, 0);
  const day = (d.getDay() + 6) % 7; // Monday = 0
  d.setDate(d.getDate() - day);
  return d.getTime();
}

// Count items that were completed (done = true) since a timestamp.
// Only items that exist in the current content are counted.
export function countDoneSince(items, progressMap, since) {
  let n = 0;
  for (const item of items) {
    const p = progressMap && progressMap[item.id];
    if (p && p.done && p.updatedAt >= since) n += 1;
  }
  return n;
}

// Return the latest N entries by updatedAt across several sections.
// sections: [{ kind, items, map, linkTo, getTitle }]
export function recentActivity(sections, limit = 5) {
  const rows = [];
  for (const s of sections) {
    for (const item of s.items) {
      const p = s.map && s.map[item.id];
      if (p && p.updatedAt) {
        rows.push({
          id: item.id,
          kind: s.kind,
          title: s.getTitle(item),
          done: !!p.done,
          updatedAt: p.updatedAt,
          linkTo: s.linkTo,
        });
      }
    }
  }
  rows.sort((a, b) => b.updatedAt - a.updatedAt);
  return rows.slice(0, limit);
}
