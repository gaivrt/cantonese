import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api, type LessonSummary } from "../../lib/api";

const THEME_ICONS: Record<string, string> = {
  trial: "👋", complaining: "😤", national_culture: "🏛️", daily_life: "🏠",
  school: "🏫", ocean_park: "🎢", doctor: "🏥", renting: "🔑",
  dining: "🍜", places_shopping: "🛍️", movie: "🎬", education: "📖",
  music: "🎵", general: "📚",
};

export default function RecordingPanel() {
  const [lessons, setLessons] = useState<LessonSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    api.getLessons().then(setLessons).finally(() => setLoading(false));
  }, []);

  const totalUnits = lessons.reduce((s, l) => s + l.unit_count, 0);
  const totalRecorded = lessons.reduce((s, l) => s + l.recording_count, 0);
  const overallPct = totalUnits > 0 ? Math.round((totalRecorded / totalUnits) * 100) : 0;

  if (loading) return <p style={{ color: "var(--color-warm-text-hint)" }}>載入中...</p>;

  return (
    <div>
      <div
        className="rounded-xl p-5 mb-6"
        style={{ background: "var(--color-warm-card)", border: "1px solid var(--color-warm-border)" }}
      >
        <div className="flex items-center justify-between mb-3">
          <span style={{ fontFamily: "var(--font-serif)", fontSize: "15px", fontWeight: 600 }}>
            整體錄音進度
          </span>
          <span style={{ fontSize: "13px", color: "var(--color-warm-text-secondary)" }}>
            {totalRecorded} / {totalUnits} 句 ({overallPct}%)
          </span>
        </div>
        <div className="rounded-full overflow-hidden" style={{ height: "6px", background: "var(--color-warm-border)" }}>
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${overallPct}%`, background: overallPct === 100 ? "var(--color-sage)" : "var(--color-blue)" }}
          />
        </div>
      </div>

      <div className="space-y-2">
        {lessons.map((lesson) => {
          const pct = lesson.unit_count > 0 ? Math.round((lesson.recording_count / lesson.unit_count) * 100) : 0;
          const done = lesson.recording_count === lesson.unit_count && lesson.unit_count > 0;
          const icon = THEME_ICONS[lesson.theme] || "📖";

          return (
            <button
              key={lesson.id}
              onClick={() => navigate(`/lessons/${lesson.id}`)}
              className="w-full text-left cursor-pointer rounded-lg p-4 transition-all duration-200"
              style={{
                background: "transparent",
                border: "1px solid var(--color-warm-border)",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "var(--color-warm-card)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
            >
              <div className="flex items-center gap-3">
                <span style={{ fontSize: "22px" }}>{icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h3
                      className="truncate"
                      style={{ fontFamily: "var(--font-serif)", fontSize: "15px", fontWeight: 600, margin: 0 }}
                    >
                      {lesson.title}
                    </h3>
                    <span
                      className="shrink-0 px-2 py-0.5 rounded-full text-xs"
                      style={{
                        background: done ? "rgba(189,210,203,0.3)" : "rgba(106,156,205,0.1)",
                        color: done ? "#3d7565" : "var(--color-blue)",
                        fontWeight: 600,
                      }}
                    >
                      {done ? "✓ 完成" : `${lesson.recording_count}/${lesson.unit_count}`}
                    </span>
                  </div>
                  <div className="mt-2 rounded-full overflow-hidden" style={{ height: "3px", background: "var(--color-warm-border)" }}>
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${pct}%`, background: done ? "var(--color-sage)" : "var(--color-blue)" }}
                    />
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
