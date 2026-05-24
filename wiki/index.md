# Wiki Index

## Overview
- [项目全景](overview.md) — 架构、功能模块、前后端路由、Phase 1-3 已完成

## 数据模型
- [教材结构 Lesson/Section/TextUnit](models/lesson-structure.md) — 三层教材数据模型，API 嵌套返回
- [用户与排课](models/user-scheduling.md) — User、StudentProfile、TimeSlot、Booking、CreditLog、课时流转

## 内容类型
- [内容类型总览](content-types/overview.md) — 9 种 Section.type 及 renderer 映射（discussion_questions 已从数据移除）

## 功能模块
- [录音工作台](features/recording-studio.md) — ✅ MediaRecorder 录音 + TextUnit 绑定 + 播放/重录/删除
- [灵活排课系统](features/scheduling.md) — ✅ Google Calendar 周视图 + 拖拽创建 + token 预约 + 课时扣减
- [学生管理](features/student-management.md) — ✅ 搜索/折叠卡片/密码重置/课时/教材分配/预约链接
- [数据管线](features/data-pipeline.md) — OCR → JSON → seed → SQLite 全流程

## OCR 进度
- [提取进度](ocr/progress.md) — 14/14 全部完成（1274 units，111 sections）

## 设计决策
- [Renderer Registry 模式](decisions/renderer-registry.md) — type→component 映射，解耦渲染逻辑
- [拼音统一为粤拼](decisions/jyutping-unification.md) — 耶鲁拼音全部转为 Jyutping 标准
- [Flexbox 逐字粤拼对齐](decisions/flexbox-jyutping.md) — 替代 HTML ruby/rt，字号可控，移动端可读
- [Token-based 预约](decisions/token-booking.md) — 免登录预约，UUID token 永久链接
- [课时在预约时扣除](decisions/credit-lifecycle.md) — 预约扣、取消退、完成自动变色
- [GAIVRT Design System](decisions/gaivrt-design-system.md) — 暖纸质感、Georgia 衬线、克制配色
- [认证设计](decisions/auth-design.md) — JWT + bcrypt + booking_token 双轨认证
