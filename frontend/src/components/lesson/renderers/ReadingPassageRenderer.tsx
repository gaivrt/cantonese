import type { TextUnit } from "../../../lib/api";
import TextUnitWrapper from "../TextUnitWrapper";
import JyutpingText from "../JyutpingText";

export default function ReadingPassageRenderer({ units }: { units: TextUnit[] }) {
  return (
    <div
      className="rounded-xl px-4 py-4 sm:px-6 sm:py-5 space-y-4"
      style={{ background: "rgba(228, 219, 205, 0.2)", border: "1px solid var(--color-warm-border)" }}
    >
      {units.map((unit) => (
        <TextUnitWrapper key={unit.id} unitId={unit.id} hasRecording={unit.has_recording}>
          <div>
            <JyutpingText cantonese={unit.cantonese} jyutping={unit.jyutping} charSize={16} />
            {unit.meaning && (
              <div className="mt-2" style={{ fontSize: "13px", color: "var(--color-warm-text-secondary)" }}>{unit.meaning}</div>
            )}
          </div>
        </TextUnitWrapper>
      ))}
    </div>
  );
}
