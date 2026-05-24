import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../lib/auth";
import StudentsPanel from "../components/admin/StudentsPanel";
import SchedulingPanel from "../components/admin/SchedulingPanel";
import RecordingPanel from "../components/admin/RecordingPanel";

const TABS = [
  { key: "students", label: "學生管理" },
  { key: "scheduling", label: "排課預約" },
  { key: "recording", label: "教材錄音" },
] as const;

type Tab = (typeof TABS)[number]["key"];

export default function AdminDashboard() {
  const [tab, setTab] = useState<Tab>("students");
  const { name, logout } = useAuth();

  return (
    <div className="min-h-screen" style={{ background: "var(--color-warm-bg)" }}>
      <header
        className="sticky top-0 z-10 backdrop-blur-sm"
        style={{ background: "rgba(250, 249, 245, 0.9)", borderBottom: "1px solid var(--color-warm-border)" }}
      >
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              to="/"
              className="no-underline"
              style={{ fontFamily: "var(--font-serif)", fontSize: "18px", fontWeight: 700, color: "var(--color-warm-text)" }}
            >
              🧊 冰紅茶粵語課堂
            </Link>
            <span
              className="px-2 py-0.5 rounded text-xs"
              style={{ background: "var(--color-terracotta)", color: "white", letterSpacing: "0.05em" }}
            >
              ADMIN
            </span>
          </div>
          <div className="flex items-center gap-4" style={{ fontSize: "13px" }}>
            <span style={{ color: "var(--color-warm-text-secondary)" }}>{name}</span>
            <button
              onClick={logout}
              className="cursor-pointer px-3 py-1 rounded transition-all duration-250"
              style={{ color: "var(--color-warm-text-secondary)", background: "none", border: "1px solid var(--color-warm-border)", fontSize: "12px" }}
            >
              登出
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
        <div className="flex gap-1 mb-6 overflow-x-auto" style={{ scrollbarWidth: "none" }}>
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className="cursor-pointer px-4 py-2 rounded-lg text-sm transition-all duration-200 whitespace-nowrap shrink-0"
              style={{
                fontFamily: "var(--font-sans)",
                background: tab === t.key ? "var(--color-beige)" : "transparent",
                color: tab === t.key ? "var(--color-warm-text)" : "var(--color-warm-text-secondary)",
                border: "none",
                fontWeight: tab === t.key ? 600 : 400,
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {tab === "students" && <StudentsPanel />}
        {tab === "scheduling" && <SchedulingPanel />}
        {tab === "recording" && <RecordingPanel />}
      </div>
    </div>
  );
}
