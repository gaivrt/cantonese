---
title: Token-based 预约（免登录）
type: decision
updated: 2026-05-25
---

# 决策：Token-based 预约

## 背景

学生预约上课需要一个入口。最初方案是要求学生登录后在 dashboard 预约。但学生的主要场景是：收到老师分享的链接 → 打开 → 选时段 → 完成。登录流程是不必要的摩擦。

## 决策

每个 `StudentProfile` 有一个 `booking_token`（UUID），生成永久预约链接 `/book/{token}`。学生打开链接即可查看可用时段、预约、取消，无需登录。

## 权衡

- 优点：零摩擦预约体验，老师发链接即可
- 优点：前端无需管理预约页的 auth 状态
- 代价：token 泄露 = 他人可代预约（风险低——一对一教学场景，学生数有限）
- 缓解：token 是 UUID v4，不可猜测；可在 admin 端重新生成

## 实现

- 后端：`/api/scheduling/book/{token}` 系列端点，通过 token 查找 StudentProfile
- 前端：`BookingPage.tsx` 不走 AuthContext，直接用 URL 中的 token 调 API
- 学生端入口：教材列表页 header 的"預約上課"按钮（通过 `/api/auth/me` 获取自己的 token）

## See Also

- [排课系统功能](../features/scheduling.md)
- [用户与排课模型](../models/user-scheduling.md)
