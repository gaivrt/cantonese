import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { api, type BookingPage as BookingData, type TimeSlotOut } from "../lib/api";

function fmtDateFull(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("zh-HK", { year: "numeric", month: "long", day: "numeric", weekday: "long" });
}

function fmtDateShort(iso: string) {
  const d = new Date(iso);
  return { day: d.getDate(), weekday: d.toLocaleDateString("zh-HK", { weekday: "short" }), month: d.toLocaleDateString("zh-HK", { month: "short" }) };
}

function fmtTime(iso: string) {
  return new Date(iso).toLocaleTimeString("zh-HK", { hour: "2-digit", minute: "2-digit", hour12: false });
}

function isToday(iso: string) {
  return new Date(iso).toDateString() === new Date().toDateString();
}

export default function BookingPage() {
  const { token } = useParams<{ token: string }>();
  const [data, setData] = useState<BookingData | null>(null);
  const [error, setError] = useState("");
  const [booking, setBooking] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [tab, setTab] = useState<"book" | "history">("book");

  const reload = () => {
    if (!token) return;
    api.getBookingPage(token).then((d) => {
      setData(d);
      if (!selectedDate && d.available_slots.length > 0) {
        setSelectedDate(d.available_slots[0].start_time.slice(0, 10));
      }
    }).catch((e) => setError(e.message));
  };

  useEffect(() => { reload(); }, [token]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--color-warm-bg)" }}>
        <div className="text-center">
          <p style={{ color: "var(--color-terracotta)", marginBottom: "12px" }}>{error}</p>
          <button onClick={() => { setError(""); reload(); }} className="cursor-pointer px-4 py-2 rounded-lg text-sm" style={{ background: "var(--color-terracotta)", color: "white", border: "none" }}>
            重試
          </button>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--color-warm-bg)" }}>
        <p style={{ color: "var(--color-warm-text-hint)", fontFamily: "var(--font-serif)" }}>載入中...</p>
      </div>
    );
  }

  const handleBook = async (slotId: number) => {
    if (booking || !token) return;
    setBooking(true);
    try {
      await api.bookSlot(token, slotId);
      reload();
    } catch (e: any) { alert(e.message); }
    finally { setBooking(false); }
  };

  const handleCancel = async (slotId: number) => {
    if (!token || !confirm("確定取消此預約？")) return;
    try {
      await api.cancelBooking(token, slotId);
      reload();
    } catch (e: any) { alert(e.message); }
  };

  const canCancel = (startTime: string) => {
    const hoursUntil = (new Date(startTime).getTime() - Date.now()) / (1000 * 3600);
    return hoursUntil >= 4;
  };

  const dateGroups = data.available_slots.reduce<Record<string, TimeSlotOut[]>>((acc, s) => {
    const key = s.start_time.slice(0, 10);
    (acc[key] ||= []).push(s);
    return acc;
  }, {});
  const dates = Object.keys(dateGroups).sort();
  const selectedSlots = selectedDate ? (dateGroups[selectedDate] || []) : [];
  const confirmedBookings = data.my_bookings.filter((b) => b.status !== "completed");
  const completedBookings = data.my_bookings.filter((b) => b.status === "completed");

  return (
    <div className="min-h-screen" style={{ background: "var(--color-warm-bg)" }}>
      <header style={{ borderBottom: "1px solid var(--color-warm-border)" }}>
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-4">
          <h1 style={{ fontFamily: "var(--font-serif)", fontSize: "18px", fontWeight: 700, margin: 0 }}>
            🧊 冰紅茶粵語課堂
          </h1>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-4" style={{ borderBottom: "1px solid var(--color-warm-border)" }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: "var(--color-beige)", fontFamily: "var(--font-serif)", fontWeight: 700, fontSize: "16px" }}>
              {data.student_name[0]}
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: "15px" }}>{data.student_name}</div>
              <div style={{ fontSize: "12px", color: "var(--color-warm-text-secondary)" }}>學生</div>
            </div>
          </div>
          <div className="text-right">
            <div style={{ fontSize: "12px", color: "var(--color-warm-text-secondary)" }}>剩餘課時</div>
            <div style={{ fontFamily: "var(--font-serif)", fontSize: "24px", fontWeight: 700, color: data.credits > 0 ? "var(--color-warm-text)" : "var(--color-terracotta)" }}>
              {data.credits}
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-6">
        <div className="flex gap-1 mb-6 p-1 rounded-lg" style={{ background: "var(--color-warm-surface)", display: "inline-flex" }}>
          {([["book", "預約上課"], ["history", "上課記錄"]] as const).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className="cursor-pointer px-4 py-2 rounded-md text-sm transition-all"
              style={{
                background: tab === key ? "white" : "transparent",
                color: tab === key ? "var(--color-warm-text)" : "var(--color-warm-text-secondary)",
                border: "none", fontWeight: tab === key ? 600 : 400,
                boxShadow: tab === key ? "0 1px 3px rgba(0,0,0,0.06)" : "none",
              }}
            >
              {label}
            </button>
          ))}
        </div>

        {tab === "book" && (
          <>
            {data.credits < 1 && (
              <div className="rounded-lg px-4 py-3 mb-5" style={{ background: "rgba(217, 119, 87, 0.08)", color: "var(--color-terracotta)", fontSize: "14px", borderLeft: "3px solid var(--color-terracotta)" }}>
                課時不足，請聯繫老師充值後再預約
              </div>
            )}

            {dates.length === 0 ? (
              <div className="text-center py-12" style={{ color: "var(--color-warm-text-hint)" }}>
                <div style={{ fontSize: "32px", marginBottom: "8px" }}>📅</div>
                <p className="text-sm">暫無可預約的時段</p>
                <p className="text-xs mt-1">請等待老師開放新的上課時間</p>
              </div>
            ) : (
              <div>
                <div className="flex gap-2 overflow-x-auto pb-3 mb-5 -mx-1 px-1" style={{ scrollbarWidth: "none" }}>
                  {dates.map((d) => {
                    const info = fmtDateShort(dateGroups[d][0].start_time);
                    const active = selectedDate === d;
                    const isTd = isToday(dateGroups[d][0].start_time);
                    return (
                      <button
                        key={d}
                        onClick={() => setSelectedDate(d)}
                        className="shrink-0 cursor-pointer flex flex-col items-center px-2.5 sm:px-3 py-2 sm:py-2.5 rounded-xl transition-all"
                        style={{
                          minWidth: "56px",
                          background: active ? "var(--color-terracotta)" : "var(--color-warm-card)",
                          color: active ? "white" : "var(--color-warm-text)",
                          border: isTd && !active ? "2px solid var(--color-terracotta)" : "2px solid transparent",
                        }}
                      >
                        <span style={{ fontSize: "10px", opacity: 0.7 }}>{info.month}</span>
                        <span style={{ fontFamily: "var(--font-serif)", fontSize: "18px", fontWeight: 700, lineHeight: 1.2 }}>{info.day}</span>
                        <span style={{ fontSize: "11px", opacity: 0.7 }}>{info.weekday}</span>
                        <div className="flex gap-0.5 mt-1">
                          {dateGroups[d].map((_, i) => (
                            <span key={i} className="w-1 h-1 rounded-full" style={{ background: active ? "rgba(255,255,255,0.5)" : "var(--color-sage)" }} />
                          ))}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {selectedDate && selectedSlots.length > 0 && (
                  <div>
                    <h3 className="mb-3" style={{ fontFamily: "var(--font-serif)", fontSize: "15px", fontWeight: 600, color: "var(--color-warm-text-secondary)" }}>
                      {fmtDateFull(selectedSlots[0].start_time)}
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                      {selectedSlots.map((s) => (
                        <button
                          key={s.id}
                          onClick={() => handleBook(s.id)}
                          disabled={data.credits < 1 || booking}
                          className="cursor-pointer rounded-xl py-4 px-3 text-center transition-all disabled:opacity-40 hover:scale-[1.02]"
                          style={{ background: "rgba(189, 210, 203, 0.25)", border: "1px solid rgba(189, 210, 203, 0.5)" }}
                        >
                          <span style={{ fontFamily: "var(--font-serif)", fontSize: "16px", fontWeight: 700 }}>
                            {fmtTime(s.start_time)}
                          </span>
                          <span style={{ fontSize: "12px", color: "var(--color-warm-text-secondary)", display: "block", marginTop: "2px" }}>
                            – {fmtTime(s.end_time)}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {confirmedBookings.length > 0 && (
              <div className="mt-8">
                <h3 className="mb-3" style={{ fontFamily: "var(--font-serif)", fontSize: "15px", fontWeight: 600 }}>即將上課</h3>
                <div className="space-y-2">
                  {confirmedBookings.map((s) => (
                    <div key={s.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 rounded-lg px-4 py-3" style={{ background: "rgba(106, 156, 205, 0.1)", borderLeft: "3px solid #6a9ccd" }}>
                      <span style={{ fontFamily: "var(--font-serif)", fontSize: "14px" }}>
                        {fmtDateFull(s.start_time)} {fmtTime(s.start_time)} – {fmtTime(s.end_time)}
                      </span>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-xs px-2 py-0.5 rounded" style={{ color: "#4a7da8" }}>已確認</span>
                        {canCancel(s.start_time) ? (
                          <button
                            onClick={() => handleCancel(s.id)}
                            className="cursor-pointer text-xs px-3 py-2 sm:px-2 sm:py-1 rounded-lg"
                            style={{ color: "var(--color-warm-text-hint)", background: "none", border: "1px solid var(--color-warm-border)" }}
                          >
                            取消
                          </button>
                        ) : (
                          <span className="text-xs" style={{ color: "var(--color-warm-text-hint)" }} title="距開課不足4小時，無法取消">
                            不可取消
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {tab === "history" && (
          completedBookings.length === 0 ? (
            <div className="text-center py-12" style={{ color: "var(--color-warm-text-hint)" }}>
              <p className="text-sm">暫無上課記錄</p>
            </div>
          ) : (
            <div className="space-y-2">
              {completedBookings.map((s) => (
                <div key={s.id} className="flex items-center justify-between rounded-lg px-4 py-3" style={{ background: "rgba(228, 219, 205, 0.3)" }}>
                  <span style={{ fontFamily: "var(--font-serif)", fontSize: "14px" }}>
                    {fmtDateFull(s.start_time)} {fmtTime(s.start_time)} – {fmtTime(s.end_time)}
                  </span>
                  <span className="text-xs" style={{ color: "var(--color-warm-text-secondary)" }}>✓ 已完成</span>
                </div>
              ))}
            </div>
          )
        )}
      </main>
    </div>
  );
}
