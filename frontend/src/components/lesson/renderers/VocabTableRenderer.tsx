import type { TextUnit } from "../../../lib/api";
import TextUnitWrapper from "../TextUnitWrapper";
import JyutpingText from "../JyutpingText";

export default function VocabTableRenderer({ units }: { units: TextUnit[] }) {
  const avgLen = units.reduce((sum, u) => sum + u.cantonese.length, 0) / (units.length || 1);
  const isLongContent = avgLen > 8;

  if (isLongContent) {
    return (
      <div className="space-y-2">
        {units.map((unit) => (
          <TextUnitWrapper key={unit.id} unitId={unit.id} hasRecording={unit.has_recording}>
            <div className="rounded-lg px-3 py-2.5 sm:px-4 sm:py-3" style={{ background: "rgba(228, 219, 205, 0.2)" }}>
              <JyutpingText cantonese={unit.cantonese} jyutping={unit.jyutping} charSize={16} />
              {unit.meaning && (
                <div className="mt-2" style={{ fontSize: "13px", color: "var(--color-warm-text-secondary)" }}>
                  {unit.meaning}
                </div>
              )}
              {unit.examples && unit.examples.length > 0 && (
                <div className="mt-1" style={{ fontSize: "12px", color: "var(--color-warm-text-hint)", lineHeight: 1.6 }}>
                  {unit.examples.join(" · ")}
                </div>
              )}
            </div>
          </TextUnitWrapper>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
      {units.map((unit) => (
        <TextUnitWrapper key={unit.id} unitId={unit.id} hasRecording={unit.has_recording}>
          <div className="rounded-lg px-3 py-2.5 sm:px-4 sm:py-3" style={{ background: "rgba(228, 219, 205, 0.3)" }}>
            <div className="mb-1.5">
              <JyutpingText cantonese={unit.cantonese} jyutping={unit.jyutping} charSize={20} />
            </div>
            <div style={{ fontSize: "13px", color: "var(--color-warm-text-secondary)" }}>
              {unit.meaning}
            </div>
            {unit.examples && unit.examples.length > 0 && (
              <div className="mt-1" style={{ fontSize: "12px", color: "var(--color-warm-text-hint)", lineHeight: 1.6 }}>
                {unit.examples.join(" · ")}
              </div>
            )}
          </div>
        </TextUnitWrapper>
      ))}
    </div>
  );
}
