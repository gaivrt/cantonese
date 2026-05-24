---
title: 教材数据模型 — Lesson / Section / TextUnit
type: data-model
updated: 2026-05-25
---

# 教材数据模型

三层结构：`Lesson → Section → TextUnit`

## Lesson

对应一个完整课程（一个 PDF 教材）。

| 字段 | 类型 | 说明 |
|------|------|------|
| id | int PK | |
| title | str | 课程标题（如"試堂"、"投訴服務"） |
| theme | str | 主题标签（如 trial, complaining, daily_life） |
| level | str | 级别（beginner/intermediate/advanced） |
| sort_order | int | 排序序号 |

## Section

课内章节。每个 section 有统一的内容类型。

| 字段 | 类型 | 说明 |
|------|------|------|
| id | int PK | |
| lesson_id | FK → Lesson | |
| title | str | 章节标题（如"一 課文"、"三 補充語彙"） |
| type | str | 内容类型，决定前端 renderer |
| sort_order | int | |

type 可选值见 [内容类型总览](../content-types/overview.md)。

## TextUnit

最小可点读单元。核心表。

| 字段 | 类型 | 说明 |
|------|------|------|
| id | int PK | |
| section_id | FK → Section | |
| sort_order | int | |
| cantonese | text | 粤语文本 |
| jyutping | text | 粤拼 |
| meaning | text | 释义（普通话或英文） |
| speaker | str | 对话说话人（dialogue 类型用） |
| pos | str | 词性（vocab_list 类型用） |
| examples | JSON | 示例句子列表（vocab_table 类型用） |
| metadata_ | JSON | 类型特定扩展数据 |

关联：`TextUnit` 可选绑定一个 `Recording`（一对一）。

## API 返回

`GET /api/lessons/{id}` 返回嵌套 JSON，一次加载完整课程：

```
Lesson → sections[] → units[] → has_recording (bool)
```

前端不做 N+1 请求。

## See Also

- [用户与排课模型](user-scheduling.md)
- [录音工作台（含 Recording 模型）](../features/recording-studio.md)
- [内容类型总览](../content-types/overview.md)
