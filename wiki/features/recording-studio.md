---
title: 录音工作台
type: feature
updated: 2026-05-25
---

# 录音工作台

**状态**：✅ Phase 2，已完成

## 核心交互

`frontend/src/components/lesson/TextUnitWrapper.tsx`

Admin 在教材页浏览时，hover 到任意 TextUnit 显示 🎙 录音按钮。点击后进入录音模式：

1. 点击 🎙 → 开始录音（MediaRecorder API，60 秒上限）
2. 再次点击 → 停止录音 → 自动上传绑定
3. 已有录音的 unit：可播放（play/pause）、重录、删除

## 技术方案

- **录音**：浏览器 `MediaRecorder` API，60 秒自动停止
- **格式**：Chrome/Firefox 产出 WebM/Opus，Safari 产出 MP4/AAC。后端通过 `mime_type` 字段兼容
- **存储**：`uploads/audio/{unit_id}_{timestamp}.webm`，通过 `FileResponse` + auth 检查 serve
- **交互**：pointer events，TextUnitWrapper 包裹所有 renderer 输出

## Recording 模型

| 字段 | 类型 | 说明 |
|------|------|------|
| text_unit_id | FK, unique | 一个 unit 最多一个录音 |
| file_path | str | 相对路径 |
| duration_ms | int | 时长 |
| mime_type | str | audio/webm 或 audio/mp4 |
| file_size | int | 字节数 |

## API 端点

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/recordings/units/{unit_id}` | 上传录音（FormData） |
| GET | `/api/recordings/units/{unit_id}/audio` | 获取音频文件 |
| DELETE | `/api/recordings/units/{unit_id}` | 删除录音 |

## 学生端播放

学生点击有录音的 TextUnit → 播放音频。`has_recording` 布尔字段标识哪些 unit 有录音。

## See Also

- [教材数据模型](../models/lesson-structure.md)
- [内容类型总览](../content-types/overview.md)
