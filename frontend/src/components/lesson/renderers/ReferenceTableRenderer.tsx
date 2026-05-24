import type { TextUnit } from "../../../lib/api";
import TextUnitWrapper from "../TextUnitWrapper";
import JyutpingText from "../JyutpingText";

export default function ReferenceTableRenderer({ units }: { units: TextUnit[] }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
      {units.map((unit) => (
        <TextUnitWrapper key={unit.id} unitId={unit.id} hasRecording={unit.has_recording}>
          <div className="text-center py-3 px-2 rounded-lg" style={{ background: "rgba(228, 219, 205, 0.3)" }}>
            <JyutpingText cantonese={unit.cantonese} jyutping={unit.jyutping} charSize={16} />
            <div className="mt-1" style={{ fontSize: "11px", color: "var(--color-warm-text-secondary)" }}>{unit.meaning}</div>
          </div>
        </TextUnitWrapper>
      ))}
    </div>
  );
}
