---
title: 学生管理
type: feature
updated: 2026-05-25
---

# 学生管理

**状态**：✅ Phase 2，已完成

## Admin UI

`frontend/src/components/admin/StudentsPanel.tsx`

### 搜索与列表

- 搜索框过滤：姓名 / 用户名 / 手机号
- 学生卡片：折叠式（expandedId 控制），展开显示详情和操作

### 学生卡片功能

| 功能 | 说明 |
|------|------|
| 基本信息 | 姓名、用户名、手机、等级、备注 |
| 课时管理 | 充值 / 扣减课时，输入金额和原因 |
| 重置密码 | 输入新密码，确认后更新 |
| 教材分配 | 多选教材列表，optimistic update（无页面闪烁） |
| 预约链接 | 点击一键复制 `/book/{token}`，显示"✓ 已複製"反馈 |
| 删除学生 | 确认后删除 |

### UI 细节

- 所有操作按钮统一 32px 高度 + `items-center` 对齐
- 展开区域与 border 之间 `pt-3` 间距
- 教材分配使用 optimistic local state update（不触发 `reload()`，避免全页闪烁）

## API 端点

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/students/` | 列出所有学生 |
| POST | `/api/students/` | 创建学生（hash_password） |
| PATCH | `/api/students/{id}` | 更新学生信息 |
| DELETE | `/api/students/{id}` | 删除学生 |
| POST | `/api/students/{id}/reset-password` | 重置密码 |
| POST | `/api/students/{id}/credits` | 增减课时 |
| PUT | `/api/students/{id}/lessons` | 分配教材 |

## 学生端视角

- 登录后看到教材列表（仅已分配的，按 `assigned_at ASC` 排序）
- Header 显示剩余课时 badge（≥3 绿色，<3 赤陶橙）
- "預約上課"按钮跳转到自己的预约页

## See Also

- [用户与排课模型](../models/user-scheduling.md)
- [排课系统](scheduling.md)
