import type { TextUnit } from "../../../lib/api";
import TextUnitWrapper from "../TextUnitWrapper";
import JyutpingText from "../JyutpingText";

const PALETTE = [
  { bg: "rgba(106, 156, 205, 0.10)", border: "rgba(106, 156, 205, 0.3)", text: "#4a7da8" },
  { bg: "rgba(217, 119, 87, 0.08)", border: "rgba(217, 119, 87, 0.25)", text: "#b86040" },
  { bg: "rgba(189, 210, 203, 0.2)", border: "rgba(189, 210, 203, 0.5)", text: "#6a8f84" },
  { bg: "rgba(228, 219, 205, 0.35)", border: "rgba(228, 219, 205, 0.7)", text: "#8a7d6a" },
];

const speakerColorMap = new Map<string, (typeof PALETTE)[0]>();
let colorIndex = 0;

function getSpeakerStyle(speaker: string) {
  if (!speaker) return PALETTE[0];
  if (!speakerColorMap.has(speaker)) {
    speakerColorMap.set(speaker, PALETTE[colorIndex % PALETTE.length]);
    colorIndex++;
  }
  return speakerColorMap.get(speaker)!;
}

export default function DialogueRenderer({ units }: { units: TextUnit[] }) {
  return (
    <div className="space-y-2">
      {units.map((unit) => {
        const style = getSpeakerStyle(unit.speaker);
        return (
          <TextUnitWrapper key={unit.id} unitId={unit.id} hasRecording={unit.has_recording}>
            <div
              className="rounded-lg px-3 py-2.5 sm:px-4 sm:py-3"
              style={{ background: style.bg, borderLeft: `3px solid ${style.border}` }}
            >
              {unit.speaker && (
                <div className="mb-1.5" style={{ fontSize: "11px", fontWeight: 600, color: style.text, letterSpacing: "0.03em" }}>
                  {unit.speaker}
                </div>
              )}
              <JyutpingText cantonese={unit.cantonese} jyutping={unit.jyutping} charSize={16} />
              {unit.meaning && (
                <div className="mt-2" style={{ fontSize: "12px", color: "var(--color-warm-text-secondary)" }}>
                  {unit.meaning}
                </div>
              )}
            </div>
          </TextUnitWrapper>
        );
      })}
    </div>
  );
}
