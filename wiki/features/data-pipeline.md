---
title: 数据管线 — OCR → JSON → SQLite
type: feature
updated: 2026-05-25
---

# 数据管线

## 流程

```
PDF 教材（14个）
    ↓ Claude Vision OCR（并行 agent）
JSON 文件（backend/data/*.json）
    ↓ seed 脚本
SQLite 数据库（Lesson → Section → TextUnit）
```

## JSON 格式

每个文件对应一个 Lesson：

```json
{
  "title": "課程標題",
  "theme": "topic_slug",
  "level": "beginner|intermediate|advanced",
  "sections": [
    {
      "title": "章節標題",
      "type": "numbered_sentences|dialogue|vocab_table|...",
      "units": [
        {
          "cantonese": "粵語文本",
          "jyutping": "jyut6 jyu5",
          "meaning": "釋義",
          "speaker": "角色（dialogue 用）",
          "pos": "詞性（vocab 用）",
          "examples": [],
          "metadata": {}
        }
      ]
    }
  ]
}
```

## Seed 脚本

`backend/cli/seed.py`

```bash
uv run python -m backend.cli.seed          # 增量 seed（跳过已有）
uv run python -m backend.cli.seed --force   # 清空后重新 seed
```

- 创建 admin 账户（admin / admin123）
- 创建 demo 学生（gaivr / gaivr123，10 课时）
- 按文件名排序导入所有 JSON，文件序号即 sort_order
- `--force` 仅清空 Lesson/Section/TextUnit，不清空 User/StudentProfile

## 数据清洗

- 全部拼音统一为粤拼（Jyutping）
- Discussion questions 等讨论类 section 已移除
- 清理后：14 文件，111 sections，1274 units

## See Also

- [OCR 进度](../ocr/progress.md)
- [教材数据模型](../models/lesson-structure.md)
