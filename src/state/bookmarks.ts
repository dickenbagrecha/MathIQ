/**
 * Saved topics / bookmarks storage abstraction for MathIQ.
 *
 * Provides validated, versioned client-side storage for topic bookmarks.
 * Scoped by Clerk user ID when signed in to prevent cross-user account leakage
 * on shared computers, falling back cleanly to 'anon' when signed out.
 */
import { KEY_BOOKMARKS, readString, writeString } from '../lib/storage';
import { COURSES_BY_ID } from '../walkthroughs/courses';

const VERSION = 1;

export interface BookmarkRecord {
  courseId: string;
  topicId: string;
  savedAt: number;
}

interface StoredBookmarkPayload {
  v: number;
  items: BookmarkRecord[];
}

function storageKeyForUser(userId?: string | null): string {
  const userSegment = userId && userId.trim() ? userId.trim() : 'anon';
  return `${KEY_BOOKMARKS}:${userSegment}`;
}

export function readBookmarks(userId?: string | null): BookmarkRecord[] {
  const key = storageKeyForUser(userId);
  const raw = readString(key);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as Partial<StoredBookmarkPayload>;
    if (!parsed || parsed.v !== VERSION || !Array.isArray(parsed.items)) {
      return [];
    }
    // Filter and sanitize records against current canonical courses & topics
    return parsed.items.filter((item) => {
      if (!item || typeof item.courseId !== 'string' || typeof item.topicId !== 'string') {
        return false;
      }
      const course = COURSES_BY_ID[item.courseId];
      if (!course) return false;
      return course.topics.some((t) => t.id === item.topicId);
    });
  } catch {
    return [];
  }
}

export function writeBookmarks(items: BookmarkRecord[], userId?: string | null): void {
  const key = storageKeyForUser(userId);
  const payload: StoredBookmarkPayload = {
    v: VERSION,
    items,
  };
  try {
    writeString(key, JSON.stringify(payload));
  } catch {
    // Gracefully handle storage quota or privacy mode errors
  }
}

export function isTopicBookmarked(courseId: string, topicId: string, userId?: string | null): boolean {
  const items = readBookmarks(userId);
  return items.some((b) => b.courseId === courseId && b.topicId === topicId);
}

export function toggleTopicBookmark(courseId: string, topicId: string, userId?: string | null): boolean {
  const items = readBookmarks(userId);
  const existingIdx = items.findIndex((b) => b.courseId === courseId && b.topicId === topicId);
  let updated: BookmarkRecord[];
  let nowBookmarked = false;

  if (existingIdx >= 0) {
    updated = items.filter((_, idx) => idx !== existingIdx);
    nowBookmarked = false;
  } else {
    // Avoid duplicates, insert at front
    updated = [
      {
        courseId,
        topicId,
        savedAt: Date.now(),
      },
      ...items.filter((b) => !(b.courseId === courseId && b.topicId === topicId)),
    ];
    nowBookmarked = true;
  }

  writeBookmarks(updated, userId);

  // Dispatch custom storage event for in-tab reactivity across components
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('mathiq:bookmarks-changed', {
        detail: { courseId, topicId, bookmarked: nowBookmarked, userId: userId ?? null },
      }),
    );
  }

  return nowBookmarked;
}

export function removeBookmark(courseId: string, topicId: string, userId?: string | null): void {
  const items = readBookmarks(userId);
  const updated = items.filter((b) => !(b.courseId === courseId && b.topicId === topicId));
  writeBookmarks(updated, userId);
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('mathiq:bookmarks-changed', {
        detail: { courseId, topicId, bookmarked: false, userId: userId ?? null },
      }),
    );
  }
}
