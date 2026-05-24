import type { TextUnit } from "../../../lib/api";
import TextUnitWrapper from "../TextUnitWrapper";
import JyutpingText from "../JyutpingText";

export default function SentenceRenderer({ units }: { units: TextUnit[] }) {
  return (
    <div className="space-y-3">
      {units.map((unit, i) => (
        <TextUnitWrapper key={unit.id} unitId={unit.id} hasRecording={unit.has_recording}>
          <div className="rounded-lg px-3 py-2.5 sm:px-4 sm:py-3" style={{ background: "rgba(228, 219, 205, 0.2)" }}>
            <div className="flex items-start gap-2 sm:gap-3">
              <span
                className="shrink-0 mt-1 w-6 h-6 flex items-center justify-center rounded-full"
                style={{ fontSize: "11px", fontWeight: 600, background: "var(--color-beige)", color: "var(--color-warm-text-secondary)" }}
              >
                {i + 1}
              </span>
              <div className="flex-1 min-w-0">
                <JyutpingText cantonese={unit.cantonese} jyutping={unit.jyutping} charSize={17} />
                {unit.meaning && (
                  <div
                    className="mt-2 pt-2"
                    style={{ fontSize: "13px", color: "var(--color-warm-text-secondary)", lineHeight: 1.5, borderTop: "1px solid var(--color-warm-border)" }}
                  >
                    {unit.meaning}
                  </div>
                )}
              </div>
            </div>
          </div>
        </TextUnitWrapper>
      ))}
    </div>
  );
}
