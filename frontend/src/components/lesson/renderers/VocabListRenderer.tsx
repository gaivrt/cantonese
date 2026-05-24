import type { TextUnit } from "../../../lib/api";
import TextUnitWrapper from "../TextUnitWrapper";
import JyutpingText from "../JyutpingText";

export default function VocabListRenderer({ units }: { units: TextUnit[] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
      {units.map((unit) => (
        <TextUnitWrapper key={unit.id} unitId={unit.id} hasRecording={unit.has_recording}>
          <div className="rounded-lg px-3 py-2.5 sm:px-4 sm:py-3" style={{ background: "rgba(228, 219, 205, 0.3)" }}>
            <div className="flex items-start gap-2 mb-1">
              <JyutpingText cantonese={unit.cantonese} jyutping={unit.jyutping} charSize={18} />
              {unit.pos && (
                <span
                  className="shrink-0 mt-1 rounded px-1.5 py-0.5"
                  style={{ fontSize: "9px", background: "var(--color-beige)", color: "var(--color-warm-text-secondary)" }}
                >
                  {unit.pos}
                </span>
              )}
            </div>
            <div style={{ fontSize: "13px", color: "var(--color-warm-text-secondary)" }}>
              {unit.meaning}
            </div>
          </div>
        </TextUnitWrapper>
      ))}
    </div>
  );
}
