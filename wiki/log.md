# Wiki Log

## [2026-05-24] init | Wiki 初始化

创建 SCHEMA.md、wiki 目录结构、初始页面。

页面：overview.md, models/lesson-structure.md, models/user-scheduling.md, content-types/overview.md, features/recording-studio.md, features/scheduling.md, ocr/progress.md, decisions/renderer-registry.md, decisions/jyutping-unification.md, index.md, log.md

## [2026-05-24] ingest | 首次知识吸收

基于 Phase 1 项目搭建过程的完整知识沉淀：
- 数据模型文档化（Lesson 三层结构 + User/Scheduling）
- 9 种内容类型及 renderer 映射
- 录音工作台和排课系统的设计方案
- OCR 进度追踪（4/14 完成）
- 2 个关键设计决策记录（Renderer Registry + Jyutping 统一）

## [2026-05-24] ingest | 全部 14 个 PDF 教材 OCR 完成

通过 6 个并行 agent 完成剩余 10 个 PDF 的 OCR 提取。
总计 14 个 JSON 文件，1416 个 TextUnit，114 个 Section。
数据库已重新 seed。更新了 ocr/progress.md。

## [2026-05-25] ingest | Phase 2-3 完成后全量 wiki 更新

Phase 2（录音 + 学生管理）和 Phase 3（排课系统）全部实现完毕。本次 ingest 将所有变更同步到 wiki：

**更新的页面**（6 页）：
- overview.md — Phase 状态更新为 1-3 ✅，新增后端路由表、前端架构描述
- models/user-scheduling.md — 修正课时流转（预约扣→取消退），新增 LessonAssignment.assigned_at
- features/recording-studio.md — 状态改为已完成，补充 TextUnitWrapper 交互细节和 API 端点
- features/scheduling.md — 全面重写：Google Calendar 周视图、拖拽创建、token 预约、取消规则、API 端点
- ocr/progress.md — 修正数据：1274 units / 111 sections（移除 discussion sections 后）
- content-types/overview.md — 标注 discussion_questions 已从数据移除

**新增的页面**（5 页）：
- features/student-management.md — 学生管理功能全貌
- decisions/flexbox-jyutping.md — Flexbox 替代 ruby/rt 的决策
- decisions/token-booking.md — 免登录 token 预约的决策
- decisions/credit-lifecycle.md — 预约时扣课时的决策
- decisions/gaivrt-design-system.md — GAIVRT 设计系统采用

**更新 SCHEMA.md**：修正 routers 和 pages 列表

**更新 index.md**：收录全部新页面，更新摘要

## [2026-05-25] lint | Wiki 健康检查 + 修复

Lint 发现并修复：
- **断链**：lesson-structure.md → recording.md（不存在）→ 改为 ../features/recording-studio.md
- **交叉引用**：补充 4 处缺失的 See Also 链接
- **信息空白**：新建 decisions/auth-design.md（认证机制）、features/data-pipeline.md（数据管线）、overview.md 中补充前端路由表
- **过时**：lesson-structure.md 更新日期和 See Also

共涉及 8 个页面修改/新建。无矛盾、无孤立页面。
