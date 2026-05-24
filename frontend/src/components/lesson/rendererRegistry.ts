import type { ComponentType } from "react";
import type { TextUnit } from "../../lib/api";
import SentenceRenderer from "./renderers/SentenceRenderer";
import VocabTableRenderer from "./renderers/VocabTableRenderer";
import DialogueRenderer from "./renderers/DialogueRenderer";
import VocabListRenderer from "./renderers/VocabListRenderer";
import GrammarNoteRenderer from "./renderers/GrammarNoteRenderer";
import ReferenceTableRenderer from "./renderers/ReferenceTableRenderer";
import ReadingPassageRenderer from "./renderers/ReadingPassageRenderer";
import DiscussionRenderer from "./renderers/DiscussionRenderer";

type RendererProps = { units: TextUnit[] };

const registry: Record<string, ComponentType<RendererProps>> = {
  numbered_sentences: SentenceRenderer,
  vocab_table: VocabTableRenderer,
  dialogue: DialogueRenderer,
  vocab_list: VocabListRenderer,
  grammar_note: GrammarNoteRenderer,
  reference_table: ReferenceTableRenderer,
  reading_passage: ReadingPassageRenderer,
  discussion_questions: DiscussionRenderer,
  phonetics: VocabListRenderer,
};

export function getRenderer(type: string): ComponentType<RendererProps> {
  return registry[type] || SentenceRenderer;
}
