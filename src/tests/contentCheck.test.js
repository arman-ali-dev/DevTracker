import { describe, expect, it } from 'vitest';
import { findDuplicateIds } from '../utils/contentCheck.js';
import roadmap from '../content/roadmap.json';
import dsa from '../content/dsa.json';
import interview from '../content/interview.json';

describe('findDuplicateIds', () => {
  it('returns an empty list when all ids are unique', () => {
    expect(findDuplicateIds([{ id: 'a' }, { id: 'b' }])).toEqual([]);
  });

  it('returns each repeated id once', () => {
    expect(findDuplicateIds([{ id: 'a' }, { id: 'b' }, { id: 'a' }, { id: 'a' }])).toEqual(['a']);
  });

  it('handles empty or missing lists', () => {
    expect(findDuplicateIds([])).toEqual([]);
    expect(findDuplicateIds(undefined)).toEqual([]);
  });
});

describe('sample content', () => {
  it('has unique ids in every content file', () => {
    const roadmapItems = roadmap.flatMap((p) => p.sections.flatMap((s) => s.items));
    expect(findDuplicateIds(roadmapItems)).toEqual([]);
    expect(findDuplicateIds(dsa)).toEqual([]);
    expect(findDuplicateIds(interview)).toEqual([]);
  });
});
