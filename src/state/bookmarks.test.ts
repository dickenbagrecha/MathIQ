/**
 * Unit & Regression Tests for Bookmark Persistence & Logic
 */
import { describe, expect, it, beforeEach } from 'vitest';
import {
  readBookmarks,
  writeBookmarks,
  toggleTopicBookmark,
  removeBookmark,
  isTopicBookmarked,
  type BookmarkRecord,
} from './bookmarks';

// In-memory mock for localStorage in NodeJS/Vitest environment
const storageMock: Record<string, string> = {};

globalThis.window = {
  localStorage: {
    getItem: (key: string) => storageMock[key] ?? null,
    setItem: (key: string, val: string) => {
      storageMock[key] = String(val);
    },
    removeItem: (key: string) => {
      delete storageMock[key];
    },
    clear: () => {
      for (const k in storageMock) delete storageMock[k];
    },
  },
  dispatchEvent: () => true,
  CustomEvent: class CustomEvent {
    type: string;
    detail: unknown;
    constructor(type: string, params?: { detail?: unknown }) {
      this.type = type;
      this.detail = params?.detail;
    }
  },
} as any;

describe('Bookmarks Storage & Management', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('starts with an empty bookmark list', () => {
    expect(readBookmarks('test-user')).toEqual([]);
    expect(isTopicBookmarked('algebra', 'factoring-quadratics', 'test-user')).toBe(false);
  });

  it('toggles bookmarks on and off correctly', () => {
    const isNowBookmarked = toggleTopicBookmark('algebra', 'factoring-quadratics', 'user-1');
    expect(isNowBookmarked).toBe(true);
    expect(isTopicBookmarked('algebra', 'factoring-quadratics', 'user-1')).toBe(true);

    // Toggle off
    const isNowUnbookmarked = toggleTopicBookmark('algebra', 'factoring-quadratics', 'user-1');
    expect(isNowUnbookmarked).toBe(false);
    expect(isTopicBookmarked('algebra', 'factoring-quadratics', 'user-1')).toBe(false);
  });

  it('prevents duplicates and preserves canonical topics', () => {
    toggleTopicBookmark('calc-1', 'differentiation-rules', 'user-1');
    toggleTopicBookmark('calc-1', 'antiderivatives-ftc', 'user-1');
    // Repeated toggle
    const bookmarks = readBookmarks('user-1');
    expect(bookmarks).toHaveLength(2);
    expect(bookmarks[0].topicId).toBe('antiderivatives-ftc');
    expect(bookmarks[1].topicId).toBe('differentiation-rules');
  });

  it('isolates bookmarks between different users', () => {
    toggleTopicBookmark('algebra', 'linear-equations', 'user-A');
    expect(isTopicBookmarked('algebra', 'linear-equations', 'user-A')).toBe(true);
    expect(isTopicBookmarked('algebra', 'linear-equations', 'user-B')).toBe(false);
    expect(readBookmarks('user-B')).toEqual([]);
  });

  it('handles corrupted JSON or invalid versions safely', () => {
    window.localStorage.setItem('mathiq:bookmarks:user-corrupt', '{ broken json ');
    expect(readBookmarks('user-corrupt')).toEqual([]);

    window.localStorage.setItem(
      'mathiq:bookmarks:user-corrupt',
      JSON.stringify({ v: 999, items: [{ courseId: 'algebra', topicId: 'linear-equations' }] }),
    );
    expect(readBookmarks('user-corrupt')).toEqual([]);
  });

  it('filters out non-existent courses and topics cleanly', () => {
    writeBookmarks(
      [
        { courseId: 'algebra', topicId: 'linear-equations', savedAt: Date.now() },
        { courseId: 'non-existent-course', topicId: 'bogus', savedAt: Date.now() },
      ],
      'user-1',
    );
    const valid = readBookmarks('user-1');
    expect(valid).toHaveLength(1);
    expect(valid[0].courseId).toBe('algebra');
    expect(valid[0].topicId).toBe('linear-equations');
  });

  it('removes bookmark directly', () => {
    toggleTopicBookmark('calc-1', 'limits', 'user-1');
    expect(isTopicBookmarked('calc-1', 'limits', 'user-1')).toBe(true);

    removeBookmark('calc-1', 'limits', 'user-1');
    expect(isTopicBookmarked('calc-1', 'limits', 'user-1')).toBe(false);
    expect(readBookmarks('user-1')).toEqual([]);
  });
});
