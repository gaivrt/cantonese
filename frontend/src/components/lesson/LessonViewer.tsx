import type { LessonDetail } from "../../lib/api";
import SectionHeader from "./SectionHeader";
import { getRenderer } from "./rendererRegistry";

interface Props {
  lesson: LessonDetail;
}

export default function LessonViewer({ lesson }: Props) {
  return (
    <div className="space-y-2">
      {lesson.sections.map((section) => {
        const Renderer = getRenderer(section.type);
        return (
          <SectionHeader key={section.id} title={section.title}>
            <Renderer units={section.units} />
          </SectionHeader>
        );
      })}
    </div>
  );
}
