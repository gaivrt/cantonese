import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import { useAuth } from "../lib/auth";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await api.login(username, password);
      login(res.token, res.role, res.name);
      navigate(res.role === "admin" ? "/admin" : "/");
    } catch (err: any) {
      setError(err.message || "登錄失敗");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--color-warm-bg)" }}>
      <div className="w-full max-w-sm px-6">
        <h1
          className="text-center mb-1"
          style={{ fontFamily: "var(--font-serif)", fontSize: "32px", fontWeight: 700, color: "var(--color-warm-text)" }}
        >
          🧊 冰紅茶粵語課堂
        </h1>
        <p className="text-center mb-10" style={{ fontSize: "13px", letterSpacing: "0.08em", color: "var(--color-warm-text-secondary)" }}>
          登錄你的賬戶
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div
              className="text-sm px-3 py-2 rounded-md"
              style={{ background: "rgba(217, 119, 87, 0.1)", color: "var(--color-terracotta)" }}
            >
              {error}
            </div>
          )}

          <div>
            <label
              className="block mb-1.5"
              style={{ fontSize: "11px", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--color-warm-text-secondary)" }}
            >
              用戶名
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-0 py-2 text-base bg-transparent border-0 border-b transition-colors duration-250"
              style={{
                fontFamily: "var(--font-serif)",
                borderBottomWidth: "1.5px",
                borderBottomColor: "var(--color-warm-border)",
                color: "var(--color-warm-text)",
                caretColor: "var(--color-terracotta)",
                outline: "none",
              }}
              onFocus={(e) => e.target.style.borderBottomColor = "var(--color-terracotta)"}
              onBlur={(e) => e.target.style.borderBottomColor = "var(--color-warm-border)"}
              autoFocus
            />
          </div>

          <div>
            <label
              className="block mb-1.5"
              style={{ fontSize: "11px", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--color-warm-text-secondary)" }}
            >
              密碼
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-0 py-2 text-base bg-transparent border-0 border-b transition-colors duration-250"
              style={{
                fontFamily: "var(--font-serif)",
                borderBottomWidth: "1.5px",
                borderBottomColor: "var(--color-warm-border)",
                color: "var(--color-warm-text)",
                caretColor: "var(--color-terracotta)",
                outline: "none",
              }}
              onFocus={(e) => e.target.style.borderBottomColor = "var(--color-terracotta)"}
              onBlur={(e) => e.target.style.borderBottomColor = "var(--color-warm-border)"}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 mt-2 cursor-pointer transition-all duration-250"
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "13px",
              letterSpacing: "0.1em",
              color: loading ? "var(--color-warm-text-hint)" : "var(--color-warm-text-secondary)",
              background: "transparent",
              border: "1px solid var(--color-warm-border)",
              borderRadius: "6px",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.color = "var(--color-warm-text)"; e.currentTarget.style.borderColor = "var(--color-warm-border-hover)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = "var(--color-warm-text-secondary)"; e.currentTarget.style.borderColor = "var(--color-warm-border)"; }}
          >
            {loading ? "登錄中..." : "登錄"}
          </button>
        </form>
      </div>
    </div>
  );
}
