import { useState, useEffect, useMemo } from 'react';
import { useUser } from '@clerk/clerk-react';
import { T } from '../design/tokens';
import { COURSES_BY_ID } from '../walkthroughs/courses';
import { readBookmarks, removeBookmark, type BookmarkRecord } from '../state/bookmarks';
import { BookmarkIcon, CrossIcon } from '../design/icons';
import { MathMarkdown } from '../components/MathMarkdown';
import type { Route } from '../router';

interface SavedTopicsProps {
  onNavigate: (route: Route) => void;
}

export function SavedTopics({ onNavigate }: SavedTopicsProps) {
  const { user } = useUser();
  const userId = user?.id ?? null;
  const [bookmarks, setBookmarks] = useState<BookmarkRecord[]>(() => readBookmarks(userId));
  const [search, setSearch] = useState('');

  useEffect(() => {
    setBookmarks(readBookmarks(userId));
    const handleSync = () => {
      setBookmarks(readBookmarks(userId));
    };
    window.addEventListener('mathiq:bookmarks-changed', handleSync);
    window.addEventListener('storage', handleSync);
    return () => {
      window.removeEventListener('mathiq:bookmarks-changed', handleSync);
      window.removeEventListener('storage', handleSync);
    };
  }, [userId]);

  const resolvedBookmarks = useMemo(() => {
    return bookmarks
      .map((b) => {
        const course = COURSES_BY_ID[b.courseId];
        const topic = course?.topics.find((t) => t.id === b.topicId);
        if (!course || !topic) return null;
        return {
          ...b,
          courseTitle: course.title,
          topicTitle: topic.title,
          topicBlurb: topic.blurb,
          exampleProblem: topic.exampleProblem,
        };
      })
      .filter((item): item is NonNullable<typeof item> => item !== null);
  }, [bookmarks]);

  const filtered = useMemo(() => {
    if (!search.trim()) return resolvedBookmarks;
    const q = search.toLowerCase().trim();
    return resolvedBookmarks.filter(
      (b) =>
        b.topicTitle.toLowerCase().includes(q) ||
        b.courseTitle.toLowerCase().includes(q) ||
        b.topicBlurb.toLowerCase().includes(q),
    );
  }, [resolvedBookmarks, search]);

  return (
    <main
      className="responsive-pad"
      style={{
        maxWidth: 960,
        margin: '0 auto',
        paddingTop: 32,
        paddingBottom: 96,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <button
          onClick={() => onNavigate({ name: 'subjects' })}
          className="btn-press"
          style={{
            background: 'transparent',
            border: 'none',
            padding: 0,
            fontSize: 13,
            fontFamily: T.mono,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: T.muted,
            cursor: 'pointer',
          }}
        >
          ← Courses
        </button>
        <span
          style={{
            fontSize: 12,
            fontFamily: T.mono,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: T.muted,
          }}
        >
          {resolvedBookmarks.length} saved
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
        <BookmarkIcon size="28px" filled />
        <h1
          style={{
            fontFamily: T.sans,
            fontSize: 'clamp(28px, 6vw, 44px)',
            fontWeight: 700,
            letterSpacing: '-0.02em',
            margin: 0,
            color: T.ink,
          }}
        >
          Saved Topics
        </h1>
      </div>

      <p
        style={{
          fontSize: 16,
          color: T.muted,
          lineHeight: 1.5,
          margin: '0 0 28px',
          maxWidth: 620,
        }}
      >
        Quick access to concepts, definitions, and problem formulas you want to revisit.
      </p>

      {resolvedBookmarks.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search saved topics…"
            aria-label="Search saved topics"
            style={{
              width: '100%',
              padding: '12px 16px',
              background: T.paper2,
              border: `1px solid ${T.ink}`,
              color: T.ink,
              fontFamily: T.sans,
              fontSize: 14,
              outline: 'none',
              borderRadius: 0,
              boxSizing: 'border-box',
            }}
          />
        </div>
      )}

      {resolvedBookmarks.length === 0 ? (
        <div
          role="status"
          style={{
            padding: '48px 24px',
            border: `1px dashed ${T.hair}`,
            textAlign: 'center',
            color: T.muted,
            background: T.paper2,
          }}
        >
          <div style={{ fontSize: 32, marginBottom: 12 }}>🔖</div>
          <div style={{ fontFamily: T.sans, fontSize: 18, fontWeight: 600, color: T.ink, marginBottom: 8 }}>
            No saved topics yet
          </div>
          <div style={{ fontSize: 14, maxWidth: 440, margin: '0 auto 20px', lineHeight: 1.4 }}>
            Click the bookmark icon on any topic card or walkthrough screen to pin it here for focused review.
          </div>
          <button
            type="button"
            onClick={() => onNavigate({ name: 'subjects' })}
            className="btn-press chamfer"
            style={{
              background: T.accent,
              color: T.paper,
              border: 'none',
              padding: '10px 20px',
              fontSize: 14,
              fontWeight: 500,
              cursor: 'pointer',
              fontFamily: T.sans,
            }}
          >
            Browse Course Catalog →
          </button>
        </div>
      ) : filtered.length === 0 ? (
        <div
          role="status"
          style={{
            padding: '36px 20px',
            border: `1px dashed ${T.hair}`,
            textAlign: 'center',
            color: T.muted,
            fontFamily: T.mono,
            fontSize: 13,
          }}
        >
          No saved topics matched "{search}".
        </div>
      ) : (
        <div
          className="stagger-children"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))',
            gap: 14,
          }}
        >
          {filtered.map((item) => (
            <div
              key={`${item.courseId}-${item.topicId}`}
              className="lift"
              style={{
                border: `1px solid ${T.ink}`,
                background: T.paper2,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                padding: '18px 20px',
                position: 'relative',
              }}
            >
              <div>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: 8,
                    gap: 8,
                  }}
                >
                  <span
                    style={{
                      fontSize: 11,
                      fontFamily: T.mono,
                      letterSpacing: '0.1em',
                      textTransform: 'uppercase',
                      color: T.accent,
                    }}
                  >
                    {item.courseTitle}
                  </span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeBookmark(item.courseId, item.topicId, userId);
                    }}
                    aria-label={`Remove ${item.topicTitle} from bookmarks`}
                    title="Remove bookmark"
                    className="btn-press"
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: T.muted,
                      cursor: 'pointer',
                      padding: 4,
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <CrossIcon size="14px" />
                  </button>
                </div>

                <div
                  style={{
                    fontSize: 18,
                    fontWeight: 700,
                    lineHeight: 1.25,
                    color: T.ink,
                    marginBottom: 8,
                  }}
                >
                  {item.topicTitle}
                </div>

                <MathMarkdown
                  className="markdown-body"
                  style={{ fontSize: 13, color: T.muted, lineHeight: 1.4, marginBottom: 12 }}
                >
                  {item.topicBlurb}
                </MathMarkdown>

                <div
                  style={{
                    padding: '8px 10px',
                    background: T.paper,
                    border: `1px solid ${T.hair}`,
                    fontSize: 13,
                    overflowX: 'auto',
                    marginBottom: 16,
                  }}
                >
                  <MathMarkdown className="markdown-body">
                    {item.exampleProblem}
                  </MathMarkdown>
                </div>
              </div>

              <button
                type="button"
                onClick={() =>
                  onNavigate({
                    name: 'topic',
                    courseId: item.courseId,
                    topicId: item.topicId,
                  })
                }
                className="btn-press chamfer"
                style={{
                  width: '100%',
                  background: T.ink,
                  color: T.paper,
                  border: 'none',
                  padding: '10px 16px',
                  fontSize: 13,
                  fontWeight: 500,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  fontFamily: T.sans,
                }}
              >
                <span>Study Topic</span>
                <span aria-hidden>→</span>
              </button>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
