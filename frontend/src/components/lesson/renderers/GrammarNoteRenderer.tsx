import type { TextUnit } from "../../../lib/api";
import TextUnitWrapper from "../TextUnitWrapper";
import JyutpingText from "../JyutpingText";

export default function GrammarNoteRenderer({ units }: { units: TextUnit[] }) {
  return (
    <div className="space-y-2">
      {units.map((unit) => (
        <TextUnitWrapper key={unit.id} unitId={unit.id} hasRecording={unit.has_recording}>
          <div
            className="rounded-lg px-3 py-2.5 sm:px-4 sm:py-3"
            style={{ background: "rgba(189, 210, 203, 0.12)", borderLeft: "3px solid var(--color-sage)" }}
          >
            <JyutpingText cantonese={unit.cantonese} jyutping={unit.jyutping} charSize={15} />
            {unit.meaning && (
              <div className="mt-2" style={{ fontSize: "13px", color: "var(--color-warm-text-secondary)" }}>{unit.meaning}</div>
            )}
          </div>
        </TextUnitWrapper>
      ))}
    </div>
  );
}
