import { useEffect, useState, useRef, useCallback } from "react";
import { api, type TimeSlotOut } from "../../lib/api";

function fmtTime(iso: string) {
  return new Date(iso).toLocaleTimeString("zh-HK", { hour: "2-digit", minute: "2-digit", hour12: false });
}
function toHM(h: number, m: number) {
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}
function isoDate(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
function addDays(d: Date, n: number) {
  const r = new Date(d); r.setDate(r.getDate() + n); return r;
}

const HOUR_H = 52;
const START_H = 13;
const END_H = 24;
const TOTAL_H = END_H - START_H;
const LABEL_W = 56;

const ST: Record<string, { bg: string; bd: string; tx: string; glow: string }> = {
  available: { bg: "linear-gradient(135deg, rgba(189,210,203,0.5), rgba(189,210,203,0.35))", bd: "#8cbcab", tx: "#3d7565", glow: "rgba(189,210,203,0.3)" },
  booked: { bg: "linear-gradient(135deg, rgba(106,156,205,0.3), rgba(106,156,205,0.18))", bd: "#6a9ccd", tx: "#2d5f8a", glow: "rgba(106,156,205,0.2)" },
  completed: { bg: "linear-gradient(135deg, rgba(228,219,205,0.5), rgba(228,219,205,0.35))", bd: "#c4b9a5", tx: "rgba(80,75,65,0.4)", glow: "none" },
  cancelled: { bg: "rgba(80,75,65,0.04)", bd: "rgba(80,75,65,0.1)", tx: "rgba(80,75,65,0.2)", glow: "none" },
};

export default function SchedulingPanel() {
  const [slots, setSlots] = useState<TimeSlotOut[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [weekStart, setWeekStart] = useState(() => {
    const d = new Date(); d.setDate(d.getDate() - d.getDay() + 1); d.setHours(0, 0, 0, 0); return d;
  });

  const [dragCol, setDragCol] = useState<string | null>(null);
  const [dragA, setDragA] = useState<number | null>(null);
  const [dragB, setDragB] = useState<number | null>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const reload = useCallback(() => {
    setLoading(true); setError("");
    api.getSlots().then(setSlots).catch((e) => setError(e.message)).finally(() => setLoading(false));
  }, []);
  useEffect(() => { reload(); }, [reload]);

  const today = isoDate(new Date());
  const nowHour = new Date().getHours();

  const days = Array.from({ length: 7 }, (_, i) => {
    const d = addDays(weekStart, i);
    return { date: isoDate(d), day: d.getDate(), weekday: ["一", "二", "三", "四", "五", "六", "日"][i], month: d.getMonth() + 1, isWeekend: i >= 5 };
  });

  const slotMap = slots.reduce<Record<string, TimeSlotOut[]>>((a, s) => {
    const k = s.start_time.slice(0, 10); (a[k] ||= []).push(s); return a;
  }, {});

  const prevWeek = () => setWeekStart(addDays(weekStart, -7));
  const nextWeek = () => setWeekStart(addDays(weekStart, 7));
  const goToday = () => {
    const d = new Date(); d.setDate(d.getDate() - d.getDay() + 1); d.setHours(0, 0, 0, 0); setWeekStart(d);
  };

  const getMinFromY = (clientY: number, mode: "floor" | "round" = "round") => {
    if (!gridRef.current) return 0;
    const gridRect = gridRef.current.getBoundingClientRect();
    const relY = clientY - gridRect.top;
    const raw = (relY / (TOTAL_H * HOUR_H)) * TOTAL_H * 60;
    const snap = mode === "floor" ? Math.floor(raw / 30) * 30 : Math.round(raw / 30) * 30;
    return Math.max(0, Math.min(snap, TOTAL_H * 60));
  };

  const getDateFromX = (clientX: number): string | null => {
    if (!gridRef.current) return null;
    const rect = gridRef.current.getBoundingClientRect();
    const relX = clientX - rect.left;
    const colW = rect.width / 7;
    const idx = Math.floor(relX / colW);
    return idx >= 0 && idx < 7 ? days[idx].date : null;
  };

  const onPointerDown = (e: React.PointerEvent) => {
    if (e.button !== 0 || (e.target as HTMLElement).closest("[data-slot]")) return;
    const col = getDateFromX(e.clientX);
    if (!col) return;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    const m = getMinFromY(e.clientY, "floor");
    setDragCol(col); setDragA(m); setDragB(m);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (dragCol === null) return;
    setDragB(getMinFromY(e.clientY));
  };

  const onPointerUp = async () => {
    if (dragCol === null || dragA === null || dragB === null) { setDragCol(null); return; }
    const minS = Math.min(dragA, dragB), minE = Math.max(dragA, dragB);
    setDragCol(null); setDragA(null); setDragB(null);
    if (minE - minS < 30) return;
    const sh = START_H + Math.floor(minS / 60), sm = minS % 60;
    const eh = START_H + Math.floor(minE / 60), em = minE % 60;
    try {
      await api.createSlots([{ start_time: `${dragCol}T${toHM(sh, sm)}:00`, end_time: `${dragCol}T${toHM(eh, em)}:00` }]);
      reload();
    } catch (e: any) { alert(e.message); }
  };

  const act = async (fn: () => Promise<unknown>) => { try { await fn(); reload(); } catch (e: any) { alert(e.message); } };

  const now = Date.now();
  const stats = {
    av: slots.filter(s => s.status === "available").length,
    bk: slots.filter(s => s.status === "booked" && new Date(s.end_time).getTime() >= now).length,
    done: slots.filter(s => (s.status === "completed") || (s.status === "booked" && new Date(s.end_time).getTime() < now)).length,
  };

  if (error) return (
    <div className="rounded-2xl px-5 py-4" style={{ background: "rgba(217,119,87,0.08)", color: "var(--color-terracotta)", fontSize: "14px" }}>
      {error}
      <button onClick={reload} className="cursor-pointer ml-3 underline" style={{ background: "none", border: "none", color: "inherit" }}>重試</button>
    </div>
  );

  const dA = dragA !== null && dragB !== null ? Math.min(dragA, dragB) : 0;
  const dB = dragA !== null && dragB !== null ? Math.max(dragA, dragB) : 0;

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-5">
        <div>
          <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "26px", fontWeight: 700, margin: 0, lineHeight: 1.2 }}>排課</h2>
          <p style={{ fontSize: "13px", color: "var(--color-warm-text-secondary)", margin: "4px 0 0" }}>
            {weekStart.getMonth() + 1}月{weekStart.getDate()}日 – {addDays(weekStart, 6).getMonth() + 1}月{addDays(weekStart, 6).getDate()}日
          </p>
        </div>
        <div className="flex items-center gap-5">
          <div className="flex items-center gap-4" style={{ fontSize: "12px" }}>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full" style={{ background: "#8cbcab" }} />
              <span style={{ color: "var(--color-warm-text-secondary)" }}>{stats.av} 可約</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full" style={{ background: "#6a9ccd" }} />
              <span style={{ color: "var(--color-warm-text-secondary)" }}>{stats.bk} 已約</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full" style={{ background: "#c4b9a5" }} />
              <span style={{ color: "var(--color-warm-text-secondary)" }}>{stats.done} 完成</span>
            </span>
          </div>
          <div className="flex items-center gap-1">
            <button onClick={prevWeek} className="cursor-pointer w-9 h-9 rounded-xl flex items-center justify-center transition-colors hover:bg-[var(--color-warm-surface)]" style={{ background: "none", border: "1px solid var(--color-warm-border)", fontSize: "14px", color: "var(--color-warm-text-secondary)" }}>‹</button>
            <button onClick={goToday} className="cursor-pointer h-9 px-4 rounded-xl text-xs transition-colors hover:bg-[rgba(217,119,87,0.1)]" style={{ background: "none", border: "1px solid var(--color-warm-border)", color: "var(--color-terracotta)", fontWeight: 600 }}>今天</button>
            <button onClick={nextWeek} className="cursor-pointer w-9 h-9 rounded-xl flex items-center justify-center transition-colors hover:bg-[var(--color-warm-surface)]" style={{ background: "none", border: "1px solid var(--color-warm-border)", fontSize: "14px", color: "var(--color-warm-text-secondary)" }}>›</button>
          </div>
        </div>
      </div>

      {/* Calendar */}
      <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid var(--color-warm-border)", background: "var(--color-warm-bg)" }}>

        {/* Day headers */}
        <div className="flex" style={{ background: "var(--color-warm-card)", borderBottom: "1px solid var(--color-warm-border)" }}>
          <div className="shrink-0 flex items-end justify-end pr-3 pb-2" style={{ width: LABEL_W }}>
            <span style={{ fontSize: "10px", color: "var(--color-warm-text-hint)", letterSpacing: "0.05em" }}>時間</span>
          </div>
          {days.map((d) => {
            const isT = d.date === today;
            const hasSlots = (slotMap[d.date] || []).length > 0;
            return (
              <div
                key={d.date}
                className="flex-1 flex flex-col items-center py-3 transition-colors"
                style={{ borderLeft: "1px solid var(--color-warm-border)" }}
              >
                <span style={{ fontSize: "11px", color: d.isWeekend ? "var(--color-terracotta)" : "var(--color-warm-text-secondary)", letterSpacing: "0.06em", fontWeight: 500 }}>
                  {d.weekday}
                </span>
                <span
                  className="flex items-center justify-center rounded-full mt-1 transition-all"
                  style={{
                    width: 36, height: 36,
                    fontFamily: "var(--font-serif)", fontSize: "18px", fontWeight: isT ? 700 : 500,
                    color: isT ? "white" : "var(--color-warm-text)",
                    background: isT ? "var(--color-terracotta)" : "transparent",
                  }}
                >{d.day}</span>
                {hasSlots && !isT && (
                  <span className="w-1 h-1 rounded-full mt-1" style={{ background: "#8cbcab" }} />
                )}
              </div>
            );
          })}
        </div>

        {/* Time grid (scrollable) */}
        <div
          ref={scrollRef}
          className="overflow-y-auto overflow-x-hidden"
          style={{ maxHeight: "calc(100vh - 260px)", minHeight: "400px" }}
        >
          <div
            ref={gridRef}
            className="flex relative select-none"
            style={{ height: TOTAL_H * HOUR_H, touchAction: dragCol ? "none" : "pan-y" }}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
          >
            {/* Time labels */}
            <div className="shrink-0 relative" style={{ width: LABEL_W }}>
              {Array.from({ length: TOTAL_H }).map((_, i) => {
                const h = START_H + i;
                const isCurrent = h === nowHour && days.some(d => d.date === today);
                return (
                  <div key={i} className="absolute right-2" style={{ top: i * HOUR_H + 4 }}>
                    <span
                      style={{
                        fontFamily: "var(--font-serif)",
                        fontSize: "12px",
                        fontWeight: isCurrent ? 700 : 400,
                        color: isCurrent ? "var(--color-terracotta)" : "var(--color-warm-text-secondary)",
                      }}
                    >
                      {toHM(h, 0)}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Day columns */}
            {days.map((d) => {
              const isT = d.date === today;
              const colSlots = slotMap[d.date] || [];

              return (
                <div
                  key={d.date}
                  className="flex-1 relative"
                  style={{ borderLeft: "1px solid var(--color-warm-border)" }}
                >
                  {/* Hour rows */}
                  {Array.from({ length: TOTAL_H }).map((_, i) => (
                    <div
                      key={i}
                      className="absolute left-0 right-0"
                      style={{
                        top: i * HOUR_H,
                        height: HOUR_H,
                        borderTop: "1px solid var(--color-warm-border)",
                        background: i % 2 === 0 ? "transparent" : "rgba(80,75,65,0.015)",
                      }}
                    >
                      <div className="absolute left-0 right-0" style={{ top: HOUR_H / 2, borderTop: "1px dashed rgba(80,75,65,0.07)" }} />
                    </div>
                  ))}

                  {/* Today column overlay */}
                  {isT && (
                    <div className="absolute inset-0 pointer-events-none" style={{ background: "rgba(217,119,87,0.02)", zIndex: 1 }} />
                  )}

                  {/* Slots */}
                  {colSlots.map((s) => {
                    const sd = new Date(s.start_time), ed = new Date(s.end_time);
                    const sM = (sd.getHours() - START_H) * 60 + sd.getMinutes();
                    const eM = (ed.getHours() - START_H) * 60 + ed.getMinutes();
                    const top = (sM / (TOTAL_H * 60)) * TOTAL_H * HOUR_H;
                    const h = Math.max(((eM - sM) / (TOTAL_H * 60)) * TOTAL_H * HOUR_H, 32);
                    const isPast = ed.getTime() < Date.now();
                    const visualStatus = (s.status === "booked" && isPast) ? "completed" : s.status;
                    const c = ST[visualStatus] || ST.available;
                    return (
                      <div
                        key={s.id}
                        data-slot
                        className="absolute overflow-hidden group transition-all duration-200 hover:scale-[1.02] hover:z-20 cursor-default"
                        style={{
                          top: top + 1, height: h - 2,
                          left: 3, right: 3,
                          background: c.bg,
                          borderLeft: `3px solid ${c.bd}`,
                          borderRadius: 8,
                          zIndex: 10,
                          boxShadow: `0 1px 3px ${c.glow}`,
                        }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="px-2 py-1 h-full flex flex-col justify-center overflow-hidden">
                          <div className="flex items-center gap-1" style={{ lineHeight: 1.3 }}>
                            <span style={{ fontSize: "11px", fontWeight: 600, color: c.tx }}>{fmtTime(s.start_time)}</span>
                            {h <= 40 && s.student_name && (
                              <span className="truncate" style={{ fontSize: "10px", color: c.tx, opacity: 0.8 }}>{s.student_name}</span>
                            )}
                          </div>
                          {h > 40 && (
                            <div style={{ fontSize: "10px", color: c.tx, opacity: 0.6 }}>{fmtTime(s.end_time)}</div>
                          )}
                          {h > 40 && s.student_name && (
                            <div className="truncate mt-0.5" style={{ fontSize: "10px", fontWeight: 600, color: c.tx }}>
                              {s.student_name}
                            </div>
                          )}
                        </div>
                        <div className="absolute top-1 right-1 flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity" style={{ zIndex: 11 }}>
                          {s.status === "available" && (
                            <button onClick={() => { if (confirm("刪除此時段？")) act(() => api.deleteSlot(s.id)); }} className="cursor-pointer w-6 h-6 rounded-md flex items-center justify-center" style={{ background: "rgba(255,255,255,0.9)", color: "var(--color-warm-text-hint)", border: "none", fontSize: "11px" }} title="刪除">✕</button>
                          )}
                          {s.status === "booked" && !isPast && (
                            <button onClick={() => { if (confirm("取消此預約並退還課時？")) act(() => api.cancelSlot(s.id)); }} className="cursor-pointer w-6 h-6 rounded-md flex items-center justify-center" style={{ background: "rgba(255,255,255,0.9)", color: "var(--color-warm-text-hint)", border: "none", fontSize: "11px" }} title="取消">✕</button>
                          )}
                        </div>
                      </div>
                    );
                  })}

                  {/* Drag preview */}
                  {dragCol === d.date && dragA !== null && dragB !== null && dB - dA >= 30 && (
                    <div
                      className="absolute pointer-events-none"
                      style={{
                        top: (dA / (TOTAL_H * 60)) * TOTAL_H * HOUR_H + 1,
                        height: ((dB - dA) / (TOTAL_H * 60)) * TOTAL_H * HOUR_H - 2,
                        left: 3, right: 3,
                        background: "rgba(217,119,87,0.12)",
                        border: "2px solid rgba(217,119,87,0.5)",
                        borderRadius: 8,
                        zIndex: 20,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        backdropFilter: "blur(2px)",
                      }}
                    >
                      <div className="px-3 py-1 rounded-full" style={{ background: "rgba(217,119,87,0.15)" }}>
                        <span style={{ fontFamily: "var(--font-serif)", fontSize: "13px", color: "var(--color-terracotta)", fontWeight: 700 }}>
                          {toHM(START_H + Math.floor(dA / 60), dA % 60)} – {toHM(START_H + Math.floor(dB / 60), dB % 60)}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Current time line */}
                  {isT && (() => {
                    const now = new Date();
                    const nM = (now.getHours() - START_H) * 60 + now.getMinutes();
                    if (nM < 0 || nM > TOTAL_H * 60) return null;
                    const top = (nM / (TOTAL_H * 60)) * TOTAL_H * HOUR_H;
                    return (
                      <div className="absolute left-0 right-0 pointer-events-none" style={{ top, zIndex: 15 }}>
                        <div className="flex items-center -ml-1">
                          <div className="w-3 h-3 rounded-full" style={{ background: "var(--color-terracotta)", boxShadow: "0 0 8px rgba(217,119,87,0.5)" }} />
                          <div className="flex-1" style={{ height: 2, background: "var(--color-terracotta)", opacity: 0.6 }} />
                        </div>
                      </div>
                    );
                  })()}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {loading && <p className="mt-3 text-center" style={{ color: "var(--color-warm-text-hint)", fontSize: "12px" }}>載入中...</p>}
    </div>
  );
}
