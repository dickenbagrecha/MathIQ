import React, { useState, useMemo } from 'react';
import { T } from '../design/tokens';
import { COURSES } from '../walkthroughs/courses';
import { getDailyContent } from '../state/dailyScribe';
import { useTypedString } from '../state/useTypedString';
import type { Route } from '../router';

interface SubjectsProps {
  onNavigate: (route: Route) => void;
}

interface CourseCardProps {
  title: string;
  blurb: string;
  topicCount?: number;
  onClick: () => void;
}

function ScribeMark({ src, fill }: { src: string; fill: string }) {
  return (
    <span
      className="scribe-art"
      style={
        {
          '--scribe': `url(${src})`,
          '--scribe-fill': `url(${fill})`,
          flexShrink: 0,
        } as React.CSSProperties
      }
    >
      {/* Sized in index.css — the squished layout has to be able to override
          it, and an inline style would outrank any media query. */}
      <img src={src} alt="" aria-hidden />
    </span>
  );
}

function CourseCard({ title, blurb, topicCount, onClick }: CourseCardProps) {
  return (
    <button
      onClick={onClick}
      aria-label={`Open ${title}`}
      className="lift btn-press course-card"
      style={{
        background: 'transparent',
        border: `1px solid ${T.ink}`,
        padding: '20px 22px 18px',
        textAlign: 'left',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        fontFamily: 'inherit',
        color: T.ink,
        borderRadius: 0,
        width: '100%',
        position: 'relative',
        minHeight: 120,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
        <div
          className="card-title"
          style={{
            fontSize: 22,
            fontWeight: 700,
            lineHeight: 1.15,
            letterSpacing: '-0.01em',
          }}
        >
          {title}
        </div>
        {topicCount !== undefined && (
          <span
            style={{
              fontSize: 11,
              fontFamily: T.mono,
              letterSpacing: '0.08em',
              color: T.muted,
              textTransform: 'uppercase',
              border: `1px solid ${T.hair}`,
              padding: '2px 6px',
            }}
          >
            {topicCount} topics
          </span>
        )}
      </div>
      <div style={{ fontSize: 14, color: T.muted, lineHeight: 1.4, paddingRight: 24 }}>
        {blurb}
      </div>
      <span
        className="arrow-nudge"
        aria-hidden
        style={{
          position: 'absolute',
          right: 18,
          bottom: 14,
          fontSize: 22,
          color: T.ink,
        }}
      >
        →
      </span>
    </button>
  );
}

export function Subjects({ onNavigate }: SubjectsProps) {
  const { dayLabel, tagline, scribeSrc, scribeFillSrc } = useMemo(() => getDailyContent(), []);
  const typedLabel = useTypedString(dayLabel, 40, 180);
  const [courseSearch, setCourseSearch] = useState('');

  const filteredCourses = useMemo(() => {
    if (!courseSearch.trim()) return COURSES;
    const q = courseSearch.toLowerCase().trim();
    return COURSES.filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        c.blurb.toLowerCase().includes(q) ||
        c.topics.some((t) => t.title.toLowerCase().includes(q)),
    );
  }, [courseSearch]);

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
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 'clamp(24px, 5vw, 56px)',
          flexWrap: 'wrap',
          marginBottom: 64,
        }}
      >
        <div style={{ flex: '3 1 320px', minWidth: 0 }}>
          <div
            className="reveal reveal-1"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              marginBottom: 18,
            }}
          >
            <span
              style={{
                fontFamily: T.mono,
                fontSize: 11,
                letterSpacing: '0.22em',
                color: T.ink,
                textTransform: 'uppercase',
                // Most taglines are full sentences, so this slot has to wrap.
                // (The day label it replaced was one word held on one line.)
                lineHeight: 1.7,
                maxWidth: 520,
              }}
            >
              {tagline}
            </span>
            <span
              aria-hidden
              className="kicker-rule"
              style={{
                flex: 1,
                height: 1,
                background: T.ink,
                // Floor it so a long tagline can't squeeze the rule to nothing.
                minWidth: 24,
                maxWidth: 240,
              }}
            />
          </div>

          <h1
            className="reveal reveal-2"
            style={{
              fontFamily: T.sans,
              fontSize: 'clamp(36px, 8vw, 64px)',
              fontWeight: 700,
              lineHeight: 1.0,
              letterSpacing: '-0.025em',
              margin: '0 0 18px',
              maxWidth: 16 * 38,
            }}
          >
            Subjects.
          </h1>

          <p
            className="reveal reveal-3"
            style={{
              fontSize: 19,
              color: T.ink,
              lineHeight: 1.55,
              margin: 0,
              maxWidth: 620,
              fontWeight: 600,
              whiteSpace: 'pre',
            }}
            aria-label={dayLabel}
          >
            {typedLabel}
            {typedLabel.length < dayLabel.length && <span className="type-caret" aria-hidden />}
          </p>
        </div>

        <div
          className="reveal reveal-2 scribe-slot"
          style={{ flex: '2 1 200px', display: 'flex' }}
        >
          <ScribeMark src={scribeSrc} fill={scribeFillSrc} />
        </div>
      </div>

      {/* Course Search & Filter */}
      <div style={{ marginBottom: 24 }}>
        <input
          type="search"
          value={courseSearch}
          onChange={(e) => setCourseSearch(e.target.value)}
          placeholder="Filter courses or topics (e.g. calculus, differential, matrix, vectors)…"
          aria-label="Filter courses or topics"
          style={{
            width: '100%',
            padding: '14px 18px',
            background: T.paper2,
            border: `1px solid ${T.ink}`,
            color: T.ink,
            fontFamily: T.sans,
            fontSize: 15,
            outline: 'none',
            borderRadius: 0,
            boxSizing: 'border-box',
          }}
        />
      </div>

      {filteredCourses.length === 0 ? (
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
          No courses or topics matched "{courseSearch}".
        </div>
      ) : (
        <div
          className="stagger-children"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
            gap: 12,
          }}
        >
          {filteredCourses.map((c) => (
            <CourseCard
              key={c.id}
              title={c.title}
              blurb={c.blurb}
              topicCount={c.topics.length}
              onClick={() => onNavigate({ name: 'walkthrough', courseId: c.id })}
            />
          ))}
        </div>
      )}
    </main>
  );
}
