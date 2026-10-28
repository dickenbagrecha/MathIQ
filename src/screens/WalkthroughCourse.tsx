import { useState, useMemo, useEffect } from 'react';
import { useAuth, useUser } from '@clerk/clerk-react';
import { T } from '../design/tokens';
import { COURSES_BY_ID } from '../walkthroughs/courses';
import { NotFound } from './NotFound';
import { fetchSubscriptionState } from '../billing/client';
import { isPro } from '../walkthroughs/tier';
import { useUpgradePrompt } from '../upgrade/UpgradePrompt';
import { MathMarkdown } from '../components/MathMarkdown';
import { BookmarkIcon } from '../design/icons';
import { readBookmarks, toggleTopicBookmark } from '../state/bookmarks';
import { useAsync } from '../hooks/useAsync';
import type { Topic } from '../walkthroughs/types';
import type { Route } from '../router';

interface WalkthroughCourseProps {
  courseId: string;
  onNavigate: (route: Route) => void;
}

function TopicCard({
  courseId,
  topic,
  isBookmarked,
  onToggleBookmark,
  onOpen,
}: {
  courseId: string;
  topic: Topic;
  isBookmarked: boolean;
  onToggleBookmark: () => void;
  onOpen: () => void;
}) {
  return (
    <div
      className="lift"
      style={{
        background: 'transparent',
        border: `1px solid ${T.ink}`,
        padding: '18px 20px',
        textAlign: 'left',
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        fontFamily: 'inherit',
        color: T.ink,
        borderRadius: 0,
        width: '100%',
        position: 'relative',
        boxSizing: 'border-box',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
        <button
          type="button"
          onClick={onOpen}
          aria-label={`Open ${topic.title}`}
          className="btn-press"
          style={{
            background: 'transparent',
            border: 'none',
            padding: 0,
            margin: 0,
            textAlign: 'left',
            cursor: 'pointer',
            flex: 1,
            color: 'inherit',
          }}
        >
          <div
            style={{
              fontSize: 19,
              fontWeight: 700,
              lineHeight: 1.2,
              letterSpacing: '-0.01em',
            }}
          >
            {topic.title}
          </div>
        </button>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggleBookmark();
          }}
          aria-label={isBookmarked ? `Remove ${topic.title} from bookmarks` : `Bookmark ${topic.title}`}
          aria-pressed={isBookmarked}
          title={isBookmarked ? 'Bookmarked' : 'Add bookmark'}
          className="btn-press"
          style={{
            background: isBookmarked ? T.paper2 : 'transparent',
            border: `1px solid ${isBookmarked ? T.ink : T.hair}`,
            color: isBookmarked ? T.accent : T.muted,
            padding: '6px 8px',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            minWidth: 32,
            minHeight: 32,
          }}
        >
          <BookmarkIcon size="16px" filled={isBookmarked} />
        </button>
      </div>

      <div onClick={onOpen} style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: 8 }}>
        <MathMarkdown
          className="markdown-body"
          style={{ fontSize: 13, color: T.muted, lineHeight: 1.4 }}
        >
          {topic.blurb}
        </MathMarkdown>
        <MathMarkdown
          className="markdown-body"
          style={{
            marginTop: 4,
            padding: '8px 12px',
            background: T.paper2,
            border: `1px solid ${T.hair}`,
            fontSize: 14,
            overflowX: 'auto',
          }}
        >
          {topic.exampleProblem}
        </MathMarkdown>
      </div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 4 }}>
        <button
          type="button"
          onClick={onOpen}
          className="btn-press"
          style={{
            background: 'transparent',
            border: 'none',
            padding: 0,
            color: T.ink,
            fontSize: 14,
            fontWeight: 600,
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
          }}
        >
          <span>Start Walkthrough</span>
          <span aria-hidden>→</span>
        </button>
      </div>
    </div>
  );
}

export function WalkthroughCourse({ courseId, onNavigate }: WalkthroughCourseProps) {
  const course = COURSES_BY_ID[courseId];
  const [search, setSearch] = useState('');
  const { getToken, isSignedIn } = useAuth();
  const { user } = useUser();
  const userId = user?.id ?? null;
  const [bookmarks, setBookmarks] = useState(() => readBookmarks(userId));
  const { requireUpgrade } = useUpgradePrompt();
  const subAsync = useAsync(() => fetchSubscriptionState({ getToken }), [isSignedIn, getToken]);
  const tier = subAsync.data?.tier ?? null;

  useEffect(() => {
    setBookmarks(readBookmarks(userId));
    const handleSync = () => setBookmarks(readBookmarks(userId));
    window.addEventListener('mathiq:bookmarks-changed', handleSync);
    window.addEventListener('storage', handleSync);
    return () => {
      window.removeEventListener('mathiq:bookmarks-changed', handleSync);
      window.removeEventListener('storage', handleSync);
    };
  }, [userId]);

  const bookmarkedTopicIds = useMemo(() => {
    return new Set(
      bookmarks.filter((b) => b.courseId === courseId).map((b) => b.topicId),
    );
  }, [bookmarks, courseId]);

  const filteredTopics = useMemo(() => {
    if (!course) return [];
    if (!search.trim()) return course.topics;
    const query = search.toLowerCase().trim();
    return course.topics.filter(
      (t) =>
        t.title.toLowerCase().includes(query) ||
        t.blurb.toLowerCase().includes(query) ||
        t.exampleProblem.toLowerCase().includes(query),
    );
  }, [course, search]);

  if (!course) {
    return (
      <NotFound
        message="That course doesn't exist — it may have been renamed or removed."
        onNavigate={onNavigate}
      />
    );
  }

  function onExamsClick() {
    if (!isPro(tier)) {
      requireUpgrade('exam-mode');
      return;
    }
    onNavigate({ name: 'exams', courseId: course!.id });
  }

  return (
    <main
      className="responsive-pad"
      style={{
        maxWidth: 960,
        margin: '0 auto',
        paddingTop: 24,
        paddingBottom: 96,
      }}
    >
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
          marginBottom: 16,
        }}
      >
        ← Subjects
      </button>

      <h1
        className="reveal reveal-1"
        style={{
          fontFamily: T.sans,
          fontSize: 'clamp(32px, 7vw, 48px)',
          fontWeight: 700,
          lineHeight: 1.0,
          letterSpacing: '-0.025em',
          margin: '0 0 12px',
        }}
      >
        {course.title}
      </h1>
      <p
        className="reveal reveal-2"
        style={{
          fontSize: 16,
          color: T.muted,
          lineHeight: 1.55,
          margin: '0 0 24px',
          maxWidth: 540,
        }}
      >
        {course.blurb}
      </p>

      <button
        onClick={onExamsClick}
        className="lift btn-press"
        aria-label={`Open ${course.title} exam mode`}
        style={{
          background: T.accent,
          border: `1px solid ${T.ink}`,
          color: T.paper,
          padding: '16px 22px',
          fontSize: 15,
          fontWeight: 600,
          fontFamily: T.sans,
          cursor: 'pointer',
          width: '100%',
          marginBottom: 24,
          textAlign: 'left',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
        }}
      >
        <span style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <span>Exam mode</span>
          <span style={{ fontSize: 12, opacity: 0.75, fontWeight: 400, fontFamily: T.mono, letterSpacing: '0.1em' }}>
            4 EXAMS · GENERATED + GRADED · PRO
          </span>
          <span style={{ fontSize: 12, opacity: 0.75, fontWeight: 400, fontFamily: T.mono, letterSpacing: '0.1em' }}>
            RUNS ON OPUS · SPENDS 1 MAX SLOT
          </span>
        </span>
        <span aria-hidden style={{ fontSize: 18 }}>→</span>
      </button>

      {/* Search / Filter Topics */}
      <div style={{ marginBottom: 20 }}>
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={`Filter ${course.topics.length} topics in ${course.title}…`}
          aria-label={`Filter topics in ${course.title}`}
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

      {filteredTopics.length === 0 ? (
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
          No topics matched "{search}".
        </div>
      ) : (
        <div
          className="stagger-children"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: 12,
          }}
        >
          {filteredTopics.map((t) => (
            <TopicCard
              key={t.id}
              courseId={course.id}
              topic={t}
              isBookmarked={bookmarkedTopicIds.has(t.id)}
              onToggleBookmark={() => toggleTopicBookmark(course.id, t.id, userId)}
              onOpen={() => onNavigate({ name: 'topic', courseId: course.id, topicId: t.id })}
            />
          ))}
        </div>
      )}
    </main>
  );
}
