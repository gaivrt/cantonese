---
title: 项目全景
type: overview
updated: 2026-05-25
---

# 冰紅茶粵語教學平台

## 定位

为粤语老师（冰紅茶）搭建的一对一教学管理平台。核心价值：把 PDF 教材变成可点读的交互式网页，老师录真人发音绑定到每个句子，学生点击即播放。

## 架构

- **后端**：FastAPI + SQLAlchemy + SQLite
- **前端**：React 19 + TypeScript + Vite + TailwindCSS
- **认证**：JWT（admin 后台创建账户，无自助注册）+ booking_token（预约页免登录）
- **设计系统**：[GAIVRT Design System](decisions/gaivrt-design-system.md)——暖纸质感、Georgia/Cambria 衬线、克制配色
- **包管理**：Python 用 uv，前端用 bun

## 数据流

```
PDF 教材 → Claude OCR → JSON 文件 → seed 脚本 → SQLite
                                                    ↓
                        浏览器 ← React 前端 ← FastAPI API
```

## 功能模块

| Phase | 模块 | 状态 |
|-------|------|------|
| 1 | 教材 OCR + 网页阅读器 | ✅ 完成（14/14 PDF，1274 units） |
| 2 | 录音工作台 + 学生管理 | ✅ 完成 |
| 3 | 灵活排课系统 | ✅ 完成 |
| 4 | 响应式 + 部署 | 待开始 |

## 数据模型核心

三层教材结构：`Lesson → Section → TextUnit`

- **Lesson**：一个完整课程（对应一个 PDF）
- **Section**：课内章节，带类型标识（numbered_sentences, dialogue, vocab_table 等）
- **TextUnit**：最小可点读单元（一个句子/一个词条），绑定粤拼和可选录音

用户体系：`User`（admin/student）→ `StudentProfile`（课时、booking_token）→ `LessonAssignment`（教材分配，带 assigned_at 时间戳）

排课体系：`TimeSlot` → `Booking` → `CreditLog`

课时生命周期：预约扣课时 → 取消退回 → 完成自动变色（时间驱动，无手动按钮）

## 教材内容

14 个 PDF，来自"冰紅茶粵語課堂"系列。每个 PDF 是一个主题课程。Discussion sections 已从数据中移除（原始 1416 → 清理后 1274 units）。

全部拼音统一转换为粤拼（Jyutping），不保留原始耶鲁拼音。

## 前端架构

- **教材阅读器**：[Renderer Registry 模式](decisions/renderer-registry.md)，8 种 renderer
- **粤拼对齐**：[Flexbox 逐字对齐](decisions/flexbox-jyutping.md)，替代 HTML ruby/rt
- **排课 UI**：Google Calendar 周视图 + 拖拽创建时段
- **预约页**：[Token-based 免登录](decisions/token-booking.md)，Calendly 风格
- **学生管理**：搜索、折叠卡片、重置密码、课时管理、教材分配

## 前端路由

| 路径 | 组件 | 保护 | 说明 |
|------|------|------|------|
| `/login` | LoginPage | 无（已登录自动跳 `/`） | 登录页 |
| `/` | LessonListPage | JWT | 教材列表（学生看已分配，admin 看全部） |
| `/lessons/:id` | LessonPage | JWT | 教材阅读器 |
| `/admin` | AdminDashboard | JWT | 管理后台（学生管理 + 排课） |
| `/book/:token` | BookingPage | 无（token 认证） | 学生预约页 |

AuthContext（`frontend/src/lib/auth.tsx`）管理 JWT 状态。ProtectedRoute 未登录自动跳转 `/login`。详见 [认证设计](decisions/auth-design.md)。

## 后端路由

| Router | 路径前缀 | 职责 |
|--------|---------|------|
| auth_router | `/api/auth` | 登录、/me |
| lessons | `/api/lessons` | 教材列表（学生按分配过滤）、课程详情 |
| recordings | `/api/recordings` | 录音上传/播放/删除 |
| students | `/api/students` | 学生 CRUD + 密码重置 + 课时 + 教材分配 |
| scheduling | `/api/scheduling` | 时段管理 + token 预约 + 取消 |

## See Also

- [数据模型](models/lesson-structure.md)
- [排课系统](features/scheduling.md)
- [录音工作台](features/recording-studio.md)
- [学生管理](features/student-management.md)
- [OCR 进度](ocr/progress.md)
- [数据管线](features/data-pipeline.md)
- [认证设计](decisions/auth-design.md)
- [内容类型总览](content-types/overview.md)
