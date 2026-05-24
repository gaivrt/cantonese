import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { api, type LessonDetail } from "../lib/api";
import LessonViewer from "../components/lesson/LessonViewer";

export default function LessonPage() {
  const { id } = useParams<{ id: string }>();
  const [lesson, setLesson] = useState<LessonDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;
    api
      .getLesson(parseInt(id))
      .then(setLesson)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--color-warm-bg)" }}>
        <p style={{ color: "var(--color-warm-text-hint)", fontFamily: "var(--font-serif)" }}>載入中...</p>
      </div>
    );
  }

  if (error || !lesson) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--color-warm-bg)" }}>
        <p style={{ color: "var(--color-terracotta)" }}>{error || "找不到教材"}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: "var(--color-warm-bg)" }}>
      <header
        className="sticky top-0 z-10"
        style={{ background: "var(--color-warm-bg)", borderBottom: "1px solid var(--color-warm-border)" }}
      >
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-4">
          <Link
            to="/"
            className="no-underline transition-colors duration-250"
            style={{ fontSize: "13px", color: "var(--color-warm-text-hint)" }}
            onMouseEnter={(e) => e.currentTarget.style.color = "var(--color-terracotta)"}
            onMouseLeave={(e) => e.currentTarget.style.color = "var(--color-warm-text-hint)"}
          >
            ← 返回
          </Link>
          <h1
            className="truncate"
            style={{ fontFamily: "var(--font-serif)", fontSize: "18px", fontWeight: 700 }}
          >
            {lesson.title}
          </h1>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <LessonViewer lesson={lesson} />
      </main>
    </div>
  );
}
