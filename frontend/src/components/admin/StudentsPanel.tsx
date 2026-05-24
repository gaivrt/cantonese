import { useEffect, useState } from "react";
import { api, type Student, type LessonSummary } from "../../lib/api";

export default function StudentsPanel() {
  const [students, setStudents] = useState<Student[]>([]);
  const [lessons, setLessons] = useState<LessonSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ username: "", password: "", name: "", phone: "", credits: 0 });

  // Inline editing states
  const [editingCredits, setEditingCredits] = useState<number | null>(null);
  const [creditAmount, setCreditAmount] = useState("");
  const [editingPw, setEditingPw] = useState<number | null>(null);
  const [newPw, setNewPw] = useState("");
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [assigningId, setAssigningId] = useState<number | null>(null);

  const copyLink = (id: number, text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  const reload = () => {
    setLoading(true); setError("");
    Promise.all([api.getStudents(), api.getLessons()])
      .then(([s, l]) => { setStudents(s); setLessons(l); })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => { reload(); }, []);

  const handleCreate = async () => {
    if (!form.username || !form.password || !form.name) return;
    try { await api.createStudent(form); } catch (e: any) { alert("創建失敗：" + e.message); return; }
    setShowForm(false);
    setForm({ username: "", password: "", name: "", phone: "", credits: 0 });
    reload();
  };

  const handleAddCredits = async (id: number) => {
    const amt = parseFloat(creditAmount);
    if (isNaN(amt) || amt === 0) return;
    setStudents((prev) => prev.map((s) => s.id === id ? { ...s, credits: s.credits + amt } : s));
    setEditingCredits(null); setCreditAmount("");
    try { await api.addCredits(id, amt, amt > 0 ? "充值" : "扣減"); } catch (e: any) { alert(e.message); reload(); }
  };

  const handleResetPw = async (id: number) => {
    if (newPw.length < 4) { alert("密碼至少4位"); return; }
    try { await api.resetPassword(id, newPw); } catch (e: any) { alert(e.message); return; }
    setEditingPw(null); setNewPw(""); alert("密碼已重置");
  };

  const handleAssign = async (studentId: number, lessonId: number, checked: boolean) => {
    const student = students.find((s) => s.id === studentId);
    if (!student) return;
    const newIds = checked ? [...student.lesson_ids, lessonId] : student.lesson_ids.filter((id) => id !== lessonId);
    setStudents((prev) => prev.map((s) => s.id === studentId ? { ...s, lesson_ids: newIds } : s));
    try { await api.assignLessons(studentId, newIds); } catch (e: any) { alert(e.message); reload(); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("確定刪除此學生？所有數據將永久刪除。")) return;
    await api.deleteStudent(id); reload();
  };

  const baseUrl = window.location.origin;

  const filtered = students.filter((s) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return s.name.toLowerCase().includes(q) || s.username.toLowerCase().includes(q) || s.phone.includes(q);
  });

  if (loading) return <p style={{ color: "var(--color-warm-text-hint)" }}>載入中...</p>;
  if (error) return (
    <div className="rounded-lg px-4 py-3" style={{ background: "rgba(217,119,87,0.1)", color: "var(--color-terracotta)" }}>
      {error} <button onClick={reload} className="cursor-pointer ml-3 underline" style={{ background: "none", border: "none", color: "inherit" }}>重試</button>
    </div>
  );

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div>
          <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "22px", fontWeight: 700, margin: 0 }}>學生管理</h2>
          <p style={{ fontSize: "12px", color: "var(--color-warm-text-secondary)", margin: "2px 0 0" }}>{students.length} 位學生</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="cursor-pointer px-4 py-2 rounded-xl text-sm"
          style={{ background: "var(--color-terracotta)", color: "white", border: "none" }}
        >
          + 新增學生
        </button>
      </div>

      {/* Search */}
      <div className="mb-4">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="搜索姓名、用戶名或電話..."
          className="w-full px-4 py-2.5 rounded-xl text-sm"
          style={{ border: "1px solid var(--color-warm-border)", background: "var(--color-warm-card)", outline: "none", color: "var(--color-warm-text)" }}
        />
      </div>

      {/* Create form */}
      {showForm && (
        <div className="rounded-xl p-4 sm:p-5 mb-4" style={{ background: "var(--color-warm-card)", border: "1px solid var(--color-warm-border)" }}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
            {[
              { label: "用戶名", key: "username", type: "text", placeholder: "英文/拼音，登錄用" },
              { label: "密碼", key: "password", type: "text", placeholder: "初始密碼" },
              { label: "姓名", key: "name", type: "text", placeholder: "顯示名稱" },
              { label: "電話", key: "phone", type: "text", placeholder: "可選" },
            ].map((f) => (
              <div key={f.key}>
                <label className="block mb-1" style={{ fontSize: "11px", letterSpacing: "0.08em", color: "var(--color-warm-text-secondary)" }}>{f.label}</label>
                <input
                  type={f.type}
                  value={(form as any)[f.key]}
                  onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                  placeholder={f.placeholder}
                  className="w-full px-3 py-2 rounded-lg text-sm"
                  style={{ border: "1px solid var(--color-warm-border)", background: "var(--color-warm-bg)", outline: "none" }}
                />
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <button onClick={handleCreate} className="cursor-pointer px-4 py-2 rounded-lg text-sm" style={{ background: "var(--color-terracotta)", color: "white", border: "none" }}>創建</button>
            <button onClick={() => setShowForm(false)} className="cursor-pointer px-4 py-2 rounded-lg text-sm" style={{ background: "none", color: "var(--color-warm-text-secondary)", border: "1px solid var(--color-warm-border)" }}>取消</button>
          </div>
        </div>
      )}

      {/* Student list */}
      {filtered.length === 0 ? (
        <div className="text-center py-8" style={{ color: "var(--color-warm-text-hint)" }}>
          {search ? "沒有匹配的學生" : "暫無學生"}
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((s) => {
            const isExpanded = expandedId === s.id;
            return (
              <div key={s.id} className="rounded-xl overflow-hidden transition-all" style={{ background: "var(--color-warm-card)", border: "1px solid var(--color-warm-border)" }}>
                {/* Collapsed row — always visible */}
                <div
                  className="flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors hover:bg-[var(--color-warm-surface)]"
                  onClick={() => setExpandedId(isExpanded ? null : s.id)}
                >
                  <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0" style={{ background: "var(--color-beige)", fontFamily: "var(--font-serif)", fontWeight: 700, fontSize: "14px" }}>
                    {s.name[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span style={{ fontWeight: 600, fontSize: "14px" }}>{s.name}</span>
                      <span style={{ fontSize: "11px", color: "var(--color-warm-text-hint)" }}>@{s.username}</span>
                    </div>
                    <div className="flex items-center gap-3 mt-0.5" style={{ fontSize: "12px", color: "var(--color-warm-text-secondary)" }}>
                      {s.phone && <span>{s.phone}</span>}
                      <span>{s.level}</span>
                      <span>{s.lesson_ids.length} 門課</span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span style={{ fontFamily: "var(--font-serif)", fontSize: "18px", fontWeight: 700, color: s.credits > 0 ? "var(--color-warm-text)" : "var(--color-terracotta)" }}>
                      {s.credits}
                    </span>
                    <div style={{ fontSize: "10px", color: "var(--color-warm-text-hint)" }}>課時</div>
                  </div>
                  <span style={{ fontSize: "12px", color: "var(--color-warm-text-hint)", transition: "transform 0.2s", transform: isExpanded ? "rotate(90deg)" : "" }}>▶</span>
                </div>

                {/* Expanded detail */}
                {isExpanded && (
                  <div className="px-4 pb-4 pt-3" style={{ borderTop: "1px solid var(--color-warm-border)" }}>
                    {/* Action buttons row */}
                    <div className="flex flex-wrap items-center gap-2 mb-3" style={{ minHeight: "34px" }}>
                      {/* Credits */}
                      {editingCredits === s.id ? (
                        <div className="flex items-center gap-1">
                          <input type="number" value={creditAmount} onChange={(e) => setCreditAmount(e.target.value)} placeholder="+5 或 -1" className="w-20 px-2 rounded-lg text-sm" style={{ height: "32px", border: "1px solid var(--color-warm-border)", background: "var(--color-warm-bg)", outline: "none" }} autoFocus />
                          <button onClick={() => handleAddCredits(s.id)} className="cursor-pointer px-2.5 rounded-lg text-xs" style={{ height: "32px", background: "var(--color-sage)", color: "white", border: "none" }}>確認</button>
                          <button onClick={() => setEditingCredits(null)} className="cursor-pointer px-1.5 rounded-lg text-xs" style={{ height: "32px", background: "none", color: "var(--color-warm-text-hint)", border: "none" }}>✕</button>
                        </div>
                      ) : (
                        <button onClick={() => setEditingCredits(s.id)} className="cursor-pointer text-xs px-3 rounded-lg" style={{ height: "32px", color: "var(--color-warm-text-secondary)", background: "none", border: "1px solid var(--color-warm-border)" }}>
                          充值/扣減課時
                        </button>
                      )}

                      {/* Password */}
                      {editingPw === s.id ? (
                        <div className="flex items-center gap-1">
                          <input type="text" value={newPw} onChange={(e) => setNewPw(e.target.value)} placeholder="新密碼" className="w-28 px-2 rounded-lg text-sm" style={{ height: "32px", border: "1px solid var(--color-warm-border)", background: "var(--color-warm-bg)", outline: "none" }} autoFocus />
                          <button onClick={() => handleResetPw(s.id)} className="cursor-pointer px-2.5 rounded-lg text-xs" style={{ height: "32px", background: "var(--color-blue)", color: "white", border: "none" }}>重置</button>
                          <button onClick={() => { setEditingPw(null); setNewPw(""); }} className="cursor-pointer px-1.5 rounded-lg text-xs" style={{ height: "32px", background: "none", color: "var(--color-warm-text-hint)", border: "none" }}>✕</button>
                        </div>
                      ) : (
                        <button onClick={() => setEditingPw(s.id)} className="cursor-pointer text-xs px-3 rounded-lg" style={{ height: "32px", color: "var(--color-warm-text-secondary)", background: "none", border: "1px solid var(--color-warm-border)" }}>
                          重置密碼
                        </button>
                      )}

                      <button onClick={() => handleDelete(s.id)} className="cursor-pointer text-xs px-3 rounded-lg" style={{ height: "32px", color: "var(--color-terracotta)", background: "none", border: "1px solid rgba(217,119,87,0.3)" }}>
                        刪除學生
                      </button>
                    </div>

                    {/* Booking link */}
                    <div className="mb-4">
                      <div className="text-xs mb-1" style={{ color: "var(--color-warm-text-secondary)" }}>預約鏈接</div>
                      <div
                        className="px-3 py-2 rounded-lg text-xs break-all flex items-center gap-2 transition-colors cursor-pointer"
                        style={{ background: copiedId === s.id ? "rgba(189,210,203,0.3)" : "var(--color-warm-bg)", color: "var(--color-blue)", fontFamily: "var(--font-mono)" }}
                        onClick={() => copyLink(s.id, `${baseUrl}/book/${s.booking_token}`)}
                      >
                        <span className="flex-1">{baseUrl}/book/{s.booking_token}</span>
                        <span style={{ fontSize: "11px", color: copiedId === s.id ? "var(--color-sage)" : "var(--color-warm-text-hint)", whiteSpace: "nowrap" }}>
                          {copiedId === s.id ? "✓ 已複製" : "複製"}
                        </span>
                      </div>
                    </div>

                    {/* Lessons */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs" style={{ color: "var(--color-warm-text-secondary)" }}>教材分配</span>
                        <button
                          onClick={() => setAssigningId(assigningId === s.id ? null : s.id)}
                          className="cursor-pointer text-xs"
                          style={{ color: "var(--color-blue)", background: "none", border: "none" }}
                        >
                          {assigningId === s.id ? "收起" : "編輯"}
                        </button>
                      </div>
                      {assigningId === s.id ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-1">
                          {lessons.map((l) => (
                            <label key={l.id} className="flex items-center gap-1.5 text-xs cursor-pointer py-1 px-2 rounded-lg hover:bg-[var(--color-warm-surface)]">
                              <input type="checkbox" checked={s.lesson_ids.includes(l.id)} onChange={(e) => handleAssign(s.id, l.id, e.target.checked)} />
                              <span className="truncate">{l.title}</span>
                            </label>
                          ))}
                        </div>
                      ) : (
                        <div className="flex flex-wrap gap-1">
                          {s.lesson_ids.length === 0 ? (
                            <span className="text-xs" style={{ color: "var(--color-warm-text-hint)" }}>未分配教材</span>
                          ) : (
                            s.lesson_ids.map((lid) => {
                              const lesson = lessons.find((l) => l.id === lid);
                              return lesson ? (
                                <span key={lid} className="text-xs px-2 py-0.5 rounded-full" style={{ background: "var(--color-beige)", color: "var(--color-warm-text-secondary)" }}>
                                  {lesson.title}
                                </span>
                              ) : null;
                            })
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
