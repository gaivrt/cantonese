import { useState, useRef, useCallback, type ReactNode } from "react";
import { api } from "../../lib/api";
import { useAuth } from "../../lib/auth";

interface Props {
  children: ReactNode;
  hasRecording: boolean;
  unitId: number;
}

export default function TextUnitWrapper({ children, hasRecording, unitId }: Props) {
  const { role } = useAuth();
  const isAdmin = role === "admin";
  const [playing, setPlaying] = useState(false);
  const [recording, setRecording] = useState(false);
  const [hasAudio, setHasAudio] = useState(hasRecording);
  const [uploading, setUploading] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const objUrlRef = useRef<string | null>(null);

  const cleanup = useCallback(() => {
    if (objUrlRef.current) {
      URL.revokeObjectURL(objUrlRef.current);
      objUrlRef.current = null;
    }
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
  }, []);

  const handlePlay = useCallback(async () => {
    if (!hasAudio) return;
    if (playing) {
      audioRef.current?.pause();
      setPlaying(false);
      return;
    }
    try {
      cleanup();
      const token = localStorage.getItem("token");
      const res = await fetch(api.getAudioUrl(unitId) + `?t=${Date.now()}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error("Failed to fetch audio");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      objUrlRef.current = url;
      const audio = new Audio(url);
      audio.addEventListener("ended", () => setPlaying(false));
      audio.addEventListener("error", () => setPlaying(false));
      audioRef.current = audio;
      audio.play();
      setPlaying(true);
    } catch {
      setPlaying(false);
    }
  }, [hasAudio, playing, unitId, cleanup]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];
      recorder.ondataavailable = (e) => chunksRef.current.push(e.data);
      recorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType });
        setUploading(true);
        try {
          await api.uploadRecording(unitId, blob, recorder.mimeType);
          setHasAudio(true);
        } finally {
          setUploading(false);
          setRecording(false);
        }
      };
      recorder.start();
      recorderRef.current = recorder;
      setRecording(true);
      setTimeout(() => {
        if (recorderRef.current?.state === "recording") recorderRef.current.stop();
      }, 60000);
    } catch {
      alert("無法訪問麥克風");
    }
  };

  const stopRecording = () => recorderRef.current?.stop();

  const handleDelete = async () => {
    if (!confirm("刪除此錄音？")) return;
    await api.deleteRecording(unitId);
    cleanup();
    setHasAudio(false);
  };

  return (
    <div
      className="relative group"
      style={{ borderLeft: hasAudio ? "2px solid var(--color-sage)" : undefined }}
    >
      <div
        className="flex items-start gap-0"
        style={{ cursor: hasAudio ? "pointer" : undefined }}
        onClick={hasAudio && !recording ? handlePlay : undefined}
      >
        <div
          className="flex-1 min-w-0 rounded-md transition-colors duration-200"
          style={{ background: playing ? "rgba(189, 210, 203, 0.15)" : undefined }}
        >
          {children}
        </div>

        {isAdmin && (
          <div className="shrink-0 flex items-center gap-1 pt-2.5 pr-1 pl-1">
            {recording ? (
              <button
                onClick={(e) => { e.stopPropagation(); stopRecording(); }}
                className="cursor-pointer flex items-center justify-center rounded-full animate-pulse"
                style={{ width: 32, height: 32, background: "var(--color-terracotta)", color: "white", border: "none" }}
                title="停止錄音"
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor"><rect x="2" y="2" width="10" height="10" rx="1.5"/></svg>
              </button>
            ) : uploading ? (
              <span
                className="flex items-center justify-center rounded-full"
                style={{ width: 32, height: 32, color: "var(--color-warm-text-hint)" }}
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="animate-spin">
                  <circle cx="8" cy="8" r="6" strokeDasharray="30" strokeDashoffset="10" strokeLinecap="round"/>
                </svg>
              </span>
            ) : (
              <>
                {hasAudio && (
                  <button
                    onClick={(e) => { e.stopPropagation(); handlePlay(); }}
                    className="cursor-pointer flex items-center justify-center rounded-full transition-colors duration-200"
                    style={{
                      width: 32, height: 32, border: "none",
                      background: playing ? "var(--color-sage)" : "rgba(189, 210, 203, 0.25)",
                      color: playing ? "white" : "#6a8f84",
                    }}
                    title={playing ? "暫停" : "播放"}
                  >
                    {playing ? (
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor"><rect x="1" y="1" width="3.5" height="10" rx="1"/><rect x="7.5" y="1" width="3.5" height="10" rx="1"/></svg>
                    ) : (
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor"><path d="M2.5 1L10.5 6L2.5 11V1Z"/></svg>
                    )}
                  </button>
                )}
                {isAdmin && (
                  <button
                    onClick={(e) => { e.stopPropagation(); startRecording(); }}
                    className={`cursor-pointer flex items-center justify-center rounded-full transition-all duration-200 ${hasAudio ? "opacity-0 group-hover:opacity-100 touch-visible" : ""}`}
                    style={{
                      width: 32, height: 32, border: "none",
                      background: hasAudio ? "transparent" : "rgba(228, 219, 205, 0.3)",
                      color: "var(--color-warm-text-hint)",
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.color = "var(--color-terracotta)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.color = "var(--color-warm-text-hint)"; }}
                    title={hasAudio ? "重新錄音" : "錄音"}
                  >
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
                      <rect x="5" y="1" width="4" height="7" rx="2"/>
                      <path d="M3 6.5a4 4 0 008 0" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
                      <line x1="7" y1="11" x2="7" y2="13" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
                    </svg>
                  </button>
                )}
                {isAdmin && hasAudio && (
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDelete(); }}
                    className="cursor-pointer flex items-center justify-center rounded-full transition-all duration-200 opacity-0 group-hover:opacity-100 touch-visible"
                    style={{ width: 32, height: 32, border: "none", background: "transparent", color: "var(--color-warm-text-hint)" }}
                    onMouseEnter={(e) => { e.currentTarget.style.color = "var(--color-terracotta)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.color = "var(--color-warm-text-hint)"; }}
                    title="刪除錄音"
                  >
                    <svg width="10" height="10" viewBox="0 0 10 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><line x1="2" y1="2" x2="8" y2="8"/><line x1="8" y1="2" x2="2" y2="8"/></svg>
                  </button>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
