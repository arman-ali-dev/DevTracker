import { describe, expect, it } from 'vitest';
import { combine, countDone, percent } from '../utils/progress.js';

describe('percent', () => {
  it('rounds done / total * 100', () => {
    expect(percent(1, 3)).toBe(33);
    expect(percent(2, 3)).toBe(67);
    expect(percent(5, 5)).toBe(100);
    expect(percent(0, 5)).toBe(0);
  });

  it('returns 0 when total is 0 (no NaN)', () => {
    expect(percent(0, 0)).toBe(0);
    expect(percent(3, 0)).toBe(0);
  });
});

describe('countDone', () => {
  const items = [{ id: 'a' }, { id: 'b' }, { id: 'c' }];

  it('counts only done items that exist in the content', () => {
    const map = {
      a: { done: true, updatedAt: 1 },
      b: { done: false, updatedAt: 1 },
      gone: { done: true, updatedAt: 1 }, // id removed from content: ignored
    };
    expect(countDone(items, map)).toEqual({ done: 1, total: 3, percent: 33 });
  });

  it('handles empty content and empty progress', () => {
    expect(countDone([], {})).toEqual({ done: 0, total: 0, percent: 0 });
    expect(countDone(items, undefined)).toEqual({ done: 0, total: 3, percent: 0 });
  });

  it('brings progress back when an id returns', () => {
    const map = { a: { done: true, updatedAt: 1 } };
    expect(countDone([{ id: 'b' }], map).done).toBe(0);
    expect(countDone([{ id: 'a' }, { id: 'b' }], map).done).toBe(1);
  });
});

describe('combine', () => {
  it('adds results together', () => {
    const r = combine([
      { done: 1, total: 2 },
      { done: 2, total: 2 },
    ]);
    expect(r).toEqual({ done: 3, total: 4, percent: 75 });
  });
});
