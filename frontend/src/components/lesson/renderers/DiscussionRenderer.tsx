import type { TextUnit } from "../../../lib/api";

export default function DiscussionRenderer({ units }: { units: TextUnit[] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
      {units.map((unit, i) => (
        <div
          key={unit.id}
          className="flex gap-3 px-3 py-2.5 sm:px-4 sm:py-3 rounded-lg"
          style={{ background: "rgba(228, 219, 205, 0.2)" }}
        >
          <span
            className="shrink-0 w-6 h-6 flex items-center justify-center rounded-full"
            style={{ fontSize: "11px", fontWeight: 600, background: "var(--color-beige)", color: "var(--color-warm-text-secondary)" }}
          >
            {i + 1}
          </span>
          <div style={{ fontFamily: "var(--font-serif)", fontSize: "14px", lineHeight: 1.7 }}>{unit.cantonese}</div>
        </div>
      ))}
    </div>
  );
}
