import { describe, expect, it } from 'vitest';
import { mergeProgress, validateProgress } from '../utils/validate.js';

const good = {
  version: 1,
  roadmap: { r1: { done: true, updatedAt: 1700000000000 } },
  dsa: { d1: { done: true, revisit: false, notes: '', updatedAt: 1700000000000 } },
  interview: { i1: { done: true, confidence: 'ok', answer: '', updatedAt: 1700000000000 } },
  settings: { theme: 'dark' },
};

describe('validateProgress', () => {
  it('accepts a correct file', () => {
    expect(validateProgress(good)).toEqual({ valid: true, errors: [] });
  });

  it('rejects non-objects', () => {
    expect(validateProgress(null).valid).toBe(false);
    expect(validateProgress([]).valid).toBe(false);
    expect(validateProgress('text').valid).toBe(false);
  });

  it('rejects a wrong version', () => {
    expect(validateProgress({ ...good, version: 2 }).valid).toBe(false);
  });

  it('rejects a missing section', () => {
    const { dsa, ...rest } = good;
    expect(validateProgress(rest).valid).toBe(false);
  });

  it('rejects bad entry values', () => {
    const bad = { ...good, interview: { i1: { done: 'yes', confidence: 'great', updatedAt: 'now' } } };
    const res = validateProgress(bad);
    expect(res.valid).toBe(false);
    expect(res.errors.length).toBeGreaterThanOrEqual(3);
  });
});

describe('mergeProgress', () => {
  it('keeps the newest change per item and keeps current settings', () => {
    const current = {
      ...good,
      roadmap: { r1: { done: false, updatedAt: 200 }, r2: { done: true, updatedAt: 50 } },
      settings: { theme: 'light' },
    };
    const incoming = { ...good, roadmap: { r1: { done: true, updatedAt: 100 }, r3: { done: true, updatedAt: 10 } } };
    const merged = mergeProgress(current, incoming);
    expect(merged.roadmap.r1.done).toBe(false); // current is newer
    expect(merged.roadmap.r2.done).toBe(true);
    expect(merged.roadmap.r3.done).toBe(true);
    expect(merged.settings.theme).toBe('light');
  });
});
