const API_BASE = "/api";

function getToken(): string | null {
  return localStorage.getItem("token");
}

function authHeaders(): Record<string, string> {
  const token = getToken();
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, { ...init, headers: authHeaders() });
  if (res.status === 401) {
    localStorage.removeItem("token");
    window.location.href = "/login";
    throw new Error("Unauthorized");
  }
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.detail || res.statusText);
  }
  return res.json();
}

// --- Types ---

export interface LoginResponse { token: string; role: string; name: string; credits?: number }
export interface MeResponse { name: string; role: string; credits: number | null; booking_token: string | null }

export interface LessonSummary {
  id: number; title: string; theme: string; level: string;
  sort_order: number; section_count: number; unit_count: number;
  recording_count: number; assigned_at?: string;
}

export interface TextUnit {
  id: number; sort_order: number; cantonese: string; jyutping: string;
  meaning: string; speaker: string; pos: string;
  examples: string[] | null; metadata_: Record<string, unknown> | null;
  has_recording: boolean;
}

export interface Section { id: number; title: string; type: string; sort_order: number; units: TextUnit[] }
export interface LessonDetail { id: number; title: string; theme: string; level: string; sections: Section[] }

export interface Student {
  id: number; user_id: number; username: string; name: string;
  level: string; phone: string; notes: string; credits: number;
  booking_token: string; lesson_ids: number[];
}

export interface TimeSlotOut {
  id: number; start_time: string; end_time: string;
  status: string; student_name?: string;
}

export interface BookingPage {
  student_name: string; credits: number;
  available_slots: TimeSlotOut[]; my_bookings: TimeSlotOut[];
}

// --- API ---

export const api = {
  login: (username: string, password: string) =>
    request<LoginResponse>("/auth/login", { method: "POST", body: JSON.stringify({ username, password }) }),

  getMe: () => request<MeResponse>("/auth/me"),
  getLessons: () => request<LessonSummary[]>("/lessons/"),
  getLesson: (id: number) => request<LessonDetail>(`/lessons/${id}`),

  // Recordings
  uploadRecording: async (unitId: number, blob: Blob, mimeType: string) => {
    const token = getToken();
    const form = new FormData();
    const ext = mimeType.includes("mp4") ? "mp4" : "webm";
    form.append("file", blob, `recording.${ext}`);
    const res = await fetch(`${API_BASE}/recordings/units/${unitId}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: form,
    });
    if (!res.ok) throw new Error("Upload failed");
    return res.json();
  },
  getAudioUrl: (unitId: number) => `${API_BASE}/recordings/units/${unitId}/audio`,
  deleteRecording: (unitId: number) =>
    request("/recordings/units/" + unitId, { method: "DELETE" }),

  // Students
  getStudents: () => request<Student[]>("/students/"),
  createStudent: (data: { username: string; password: string; name: string; level?: string; phone?: string; credits?: number }) =>
    request<Student>("/students/", { method: "POST", body: JSON.stringify(data) }),
  updateStudent: (id: number, data: Record<string, unknown>) =>
    request<Student>(`/students/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
  deleteStudent: (id: number) =>
    request(`/students/${id}`, { method: "DELETE" }),
  resetPassword: (id: number, newPassword: string) =>
    request(`/students/${id}/reset-password`, { method: "POST", body: JSON.stringify({ new_password: newPassword }) }),
  addCredits: (id: number, amount: number, reason: string) =>
    request(`/students/${id}/credits`, { method: "POST", body: JSON.stringify({ amount, reason }) }),
  assignLessons: (id: number, lessonIds: number[]) =>
    request(`/students/${id}/lessons`, { method: "PUT", body: JSON.stringify({ lesson_ids: lessonIds }) }),

  // Scheduling
  getSlots: () => request<TimeSlotOut[]>("/scheduling/slots"),
  createSlots: (slots: Array<{ start_time: string; end_time: string }>) =>
    request("/scheduling/slots", { method: "POST", body: JSON.stringify({ slots }) }),
  completeSlot: (id: number) =>
    request(`/scheduling/slots/${id}/complete`, { method: "PATCH" }),
  cancelSlot: (id: number) =>
    request(`/scheduling/slots/${id}/cancel`, { method: "PATCH" }),
  deleteSlot: (id: number) =>
    request(`/scheduling/slots/${id}`, { method: "DELETE" }),

  // Booking (token-based, no login required)
  getBookingPage: (token: string) => request<BookingPage>(`/scheduling/book/${token}`),
  bookSlot: (token: string, slotId: number) =>
    request(`/scheduling/book/${token}`, { method: "POST", body: JSON.stringify({ slot_id: slotId }) }),
  cancelBooking: (token: string, slotId: number) =>
    request(`/scheduling/book/${token}/cancel`, { method: "POST", body: JSON.stringify({ slot_id: slotId }) }),
};
