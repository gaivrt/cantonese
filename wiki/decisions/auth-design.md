---
title: 认证设计 — JWT + bcrypt + Token 双轨
type: decision
updated: 2026-05-25
---

# 决策：认证设计

## 背景

平台有两种访问场景：
1. **管理端 + 教材阅读**：需要角色区分（admin vs student）
2. **预约页**：学生只想快速选时段，登录是多余摩擦

## 决策

双轨认证：

### JWT（管理端 + 教材）

- **后端**：`backend/auth.py`，使用 bcrypt 直接哈希（弃用 passlib，因 bcrypt 新版兼容性问题）
- **Token**：HS256 JWT，24 小时过期，payload 含 `sub`（user_id）和 `role`
- **依赖注入**：`get_current_user`（任意已登录用户）、`require_admin`（仅 admin）
- **前端**：`frontend/src/lib/auth.tsx`，AuthContext 管理 token/role/name，存 localStorage
- **401 处理**：API client 收到 401 自动清 localStorage 并跳转 `/login`

### booking_token（预约页）

- 每个 StudentProfile 有 UUID v4 的 `booking_token`
- `/book/{token}` 路由不经过 ProtectedRoute，无需 JWT
- 详见 [Token-based 预约决策](token-booking.md)

## 账户管理

- 无自助注册，admin 在后台创建所有账户
- admin 可重置学生密码（`POST /api/students/{id}/reset-password`）
- 密码不可查看（bcrypt 单向哈希）

## See Also

- [Token-based 预约](token-booking.md)
- [用户与排课模型](../models/user-scheduling.md)
- [项目全景](../overview.md)
