import { useState, useRef, type ReactNode } from "react";
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
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const handlePlay = () => {
    if (!hasAudio) return;
    if (playing) {
      audioRef.current?.pause();
      setPlaying(false);
      return;
    }
    const audio = new Audio(api.getAudioUrl(unitId) + `?t=${Date.now()}`);
    audio.addEventListener("ended", () => setPlaying(false));
    audio.addEventListener("error", () => setPlaying(false));
    audioRef.current = audio;
    audio.play();
    setPlaying(true);
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];
      recorder.ondataavailable = (e) => chunksRef.current.push(e.data);
      recorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType });
        await api.uploadRecording(unitId, blob, recorder.mimeType);
        setHasAudio(true);
        setRecording(false);
      };
      recorder.start();
      recorderRef.current = recorder;
      setRecording(true);
      setTimeout(() => { if (recorderRef.current?.state === "recording") recorderRef.current.stop(); }, 60000);
    } catch {
      alert("無法訪問麥克風");
    }
  };

  const stopRecording = () => {
    recorderRef.current?.stop();
  };

  const handleDelete = async () => {
    if (!confirm("刪除此錄音？")) return;
    await api.deleteRecording(unitId);
    setHasAudio(false);
  };

  return (
    <div
      className="rounded-md transition-all duration-200 relative group"
      style={{ borderLeft: hasAudio ? "2px solid var(--color-sage)" : "2px solid transparent" }}
    >
      <div
        onClick={hasAudio ? handlePlay : undefined}
        className="px-3 py-2 cursor-pointer"
        style={{ background: playing ? "rgba(189, 210, 203, 0.25)" : undefined }}
      >
        {children}
      </div>

      <div className="flex items-center gap-1 mt-1 ml-3 mb-1" style={{ minHeight: "24px" }}>
        {hasAudio && (
          <button
            onClick={handlePlay}
            className="cursor-pointer text-xs px-2 py-0.5 rounded"
            style={{ background: playing ? "var(--color-sage)" : "rgba(189, 210, 203, 0.3)", color: playing ? "white" : "#6a8f84", border: "none" }}
          >
            {playing ? "⏸ 暫停" : "▶ 播放"}
          </button>
        )}
        {isAdmin && (
          <>
            {recording ? (
              <button
                onClick={stopRecording}
                className="cursor-pointer text-xs px-2 py-0.5 rounded animate-pulse"
                style={{ background: "var(--color-terracotta)", color: "white", border: "none" }}
              >
                ● 停止錄音
              </button>
            ) : (
              <button
                onClick={startRecording}
                className="cursor-pointer text-xs px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ color: "var(--color-warm-text-hint)", background: "none", border: "1px solid var(--color-warm-border)" }}
              >
                🎙 錄音
              </button>
            )}
            {hasAudio && !recording && (
              <button
                onClick={handleDelete}
                className="cursor-pointer text-xs px-1 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ color: "var(--color-warm-text-hint)", background: "none", border: "none" }}
              >
                ✕
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
