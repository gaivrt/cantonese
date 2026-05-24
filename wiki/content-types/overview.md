---
title: 教材内容类型总览
type: content-type
updated: 2026-05-25
---

# 教材内容类型

Section.type 的可选值及其对应 renderer。

| type | 说明 | Renderer | 典型来源 |
|------|------|----------|---------|
| `numbered_sentences` | 编号句子（粤拼/粤语/翻译三行） | SentenceRenderer | 課文、句子练习 |
| `dialogue` | 对话（角色标签 + 内容） | DialogueRenderer | 投诉、餐厅等场景对话 |
| `vocab_table` | 词汇表格（词/粤拼/释义/示例） | VocabTableRenderer | 否定词、动词、形容词分类表 |
| `vocab_list` | 结构化词汇列表（编号/词/粤拼/词性/英文） | VocabListRenderer | Vocabulary in use |
| `reference_table` | 参考表格（网格布局） | ReferenceTableRenderer | 时间、方位、量词 |
| `grammar_note` | 语法/文化说明段落 | GrammarNoteRenderer | "梗係啦"用法、忌讳词 |
| `reading_passage` | 长篇阅读 | ReadingPassageRenderer | 议论文 |
| `discussion_questions` | 讨论/对话练习题（已从数据移除） | DiscussionRenderer | ~~生活20问~~ |
| `phonetics` | 声母韵母对照表 | VocabListRenderer (fallback) | 试堂发音指南 |

> **注**：`discussion_questions` 类型的 section 已从所有 JSON 数据中移除（用户要求删除讨论练习题）。Renderer 仍保留以防未来需要。

## Renderer Registry

`frontend/src/components/lesson/rendererRegistry.ts` 维护 type → component 映射。`LessonViewer` 遍历 sections 时通过 `getRenderer(section.type)` 获取对应组件。

新增内容类型：
1. 在 `renderers/` 下创建新 renderer
2. 在 `rendererRegistry.ts` 注册
3. 不需要改动 `LessonViewer`

## 所有 renderer 共享的 Props

```typescript
interface UnitProps { units: TextUnit[] }
```

每个 unit 被 `TextUnitWrapper` 包裹，提供统一的点击交互和音频播放状态。

## See Also

- [教材数据模型](../models/lesson-structure.md)
- [Renderer Registry 决策](../decisions/renderer-registry.md)
