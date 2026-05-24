import { useState, type ReactNode } from "react";

interface Props {
  title: string;
  children: ReactNode;
}

export default function SectionHeader({ title, children }: Props) {
  const [open, setOpen] = useState(true);

  return (
    <div className="mb-8">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2.5 w-full text-left mb-4 cursor-pointer bg-transparent border-0 p-0"
      >
        <span
          className="transition-transform duration-250"
          style={{
            fontSize: "10px",
            color: "var(--color-warm-text-hint)",
            transform: open ? "rotate(90deg)" : "rotate(0deg)",
          }}
        >
          ▶
        </span>
        <h3 style={{ fontFamily: "var(--font-serif)", fontSize: "16px", fontWeight: 700, color: "var(--color-warm-text)", margin: 0 }}>
          {title}
        </h3>
      </button>
      {open && (
        <div className="pl-5" style={{ borderLeft: "1.5px solid var(--color-warm-border)" }}>
          {children}
        </div>
      )}
    </div>
  );
}
