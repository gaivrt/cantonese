import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api, type LessonSummary } from "../lib/api";
import { useAuth } from "../lib/auth";

const THEME_META: Record<string, { icon: string; desc: string }> = {
  trial:            { icon: "👋", desc: "基礎入門" },
  complaining:      { icon: "😤", desc: "投訴與服務" },
  national_culture: { icon: "🏛️", desc: "文化與節日" },
  daily_life:       { icon: "🏠", desc: "日常生活" },
  school:           { icon: "🏫", desc: "校園教育" },
  ocean_park:       { icon: "🎢", desc: "旅遊景點" },
  doctor:           { icon: "🏥", desc: "就醫健康" },
  renting:          { icon: "🔑", desc: "租房居住" },
  dining:           { icon: "🍜", desc: "飲食點餐" },
  places_shopping:  { icon: "🛍️", desc: "地方購物" },
  movie:            { icon: "🎬", desc: "電影娛樂" },
  education:        { icon: "📖", desc: "教育生活" },
  music:            { icon: "🎵", desc: "飲食生活" },
  general:          { icon: "📚", desc: "綜合練習" },
};

const DEFAULT_META = { icon: "📖", desc: "粵語課堂" };

export default function LessonListPage() {
  const [lessons, setLessons] = useState<LessonSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [credits, setCredits] = useState<number | null>(null);
  const [bookingToken, setBookingToken] = useState<string | null>(null);
  const { name, role, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    api.getLessons().then(setLessons).finally(() => setLoading(false));
    if (role === "student") {
      api.getMe().then((me) => { setCredits(me.credits); setBookingToken(me.booking_token); });
    }
  }, []);

  return (
    <div className="min-h-screen" style={{ background: "var(--color-warm-bg)" }}>
      <header
        className="sticky top-0 z-10 backdrop-blur-sm"
        style={{ background: "rgba(250, 249, 245, 0.9)", borderBottom: "1px solid var(--color-warm-border)" }}
      >
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <h1 style={{ fontFamily: "var(--font-serif)", fontSize: "18px", fontWeight: 700 }}>
            🧊 冰紅茶粵語課堂
          </h1>
          <div className="flex items-center gap-3" style={{ fontSize: "13px" }}>
            <span style={{ color: "var(--color-warm-text-secondary)" }}>{name}</span>
            {role === "student" && credits !== null && (
              <span className="px-2 py-0.5 rounded-full text-xs" style={{ background: credits >= 3 ? "rgba(189,210,203,0.3)" : "rgba(217,119,87,0.1)", color: credits >= 3 ? "#3d7565" : "var(--color-terracotta)", fontWeight: 600 }}>
                {credits} 課時
              </span>
            )}
            {role === "student" && bookingToken && (
              <button
                onClick={() => navigate(`/book/${bookingToken}`)}
                className="cursor-pointer px-3 py-1 rounded-lg"
                style={{ color: "var(--color-blue)", background: "none", border: "1px solid var(--color-warm-border)", fontSize: "12px" }}
              >
                預約上課
              </button>
            )}
            {role === "admin" && (
              <button onClick={() => navigate("/admin")} className="cursor-pointer px-3 py-1 rounded-lg" style={{ color: "white", background: "var(--color-terracotta)", border: "none", fontSize: "12px" }}>
                管理後台
              </button>
            )}
            <button onClick={logout} className="cursor-pointer px-3 py-1 rounded-lg" style={{ color: "var(--color-warm-text-secondary)", background: "none", border: "1px solid var(--color-warm-border)", fontSize: "12px" }}>
              登出
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
        <div className="mb-10">
          <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "32px", fontWeight: 700, lineHeight: 1.2 }}>
            教材
          </h2>
          <p style={{ fontSize: "13px", color: "var(--color-warm-text-secondary)", marginTop: "6px", letterSpacing: "0.03em" }}>
            {lessons.length} 門課程
          </p>
        </div>

        {loading ? (
          <p style={{ color: "var(--color-warm-text-hint)" }}>載入中...</p>
        ) : lessons.length === 0 ? (
          <p style={{ color: "var(--color-warm-text-hint)" }}>暫無教材</p>
        ) : (
          <div className="space-y-0" style={{ borderTop: "1px solid var(--color-warm-border)" }}>
            {lessons.map((lesson, i) => {
              const meta = THEME_META[lesson.theme] || DEFAULT_META;
              return (
                <Link
                  key={lesson.id}
                  to={`/lessons/${lesson.id}`}
                  className="no-underline flex items-center gap-4 sm:gap-5 py-4 sm:py-5 transition-all duration-200"
                  style={{
                    borderBottom: "1px solid var(--color-warm-border)",
                    color: "var(--color-warm-text)",
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.paddingLeft = "8px"; e.currentTarget.style.background = "var(--color-warm-card)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.paddingLeft = "0"; e.currentTarget.style.background = "transparent"; }}
                >
                  {/* Number */}
                  <span className="shrink-0" style={{ fontFamily: "var(--font-serif)", fontSize: "13px", color: "var(--color-warm-text-hint)", width: "24px", textAlign: "right" }}>
                    {String(i + 1).padStart(2, "0")}
                  </span>

                  {/* Icon */}
                  <span className="shrink-0" style={{ fontSize: "28px" }}>{meta.icon}</span>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="truncate" style={{ fontFamily: "var(--font-serif)", fontSize: "17px", fontWeight: 700, margin: 0 }}>
                      {lesson.title}
                    </h3>
                    <div className="flex items-center gap-2 mt-1 flex-wrap" style={{ fontSize: "12px", color: "var(--color-warm-text-secondary)" }}>
                      <span>{meta.desc}</span>
                      <span style={{ color: "var(--color-warm-text-hint)" }}>·</span>
                      <span>{lesson.section_count} 章</span>
                      <span style={{ color: "var(--color-warm-text-hint)" }}>·</span>
                      <span>{lesson.unit_count} 句</span>
                      {lesson.assigned_at && (
                        <>
                          <span style={{ color: "var(--color-warm-text-hint)" }}>·</span>
                          <span style={{ color: "var(--color-warm-text-hint)" }}>
                            {new Date(lesson.assigned_at).toLocaleDateString("zh-HK", { month: "short", day: "numeric" })} 分配
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Arrow */}
                  <span className="shrink-0" style={{ color: "var(--color-warm-text-hint)", fontSize: "14px" }}>→</span>
                </Link>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
