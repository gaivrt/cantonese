---
title: 用户与排课模型
type: data-model
updated: 2026-05-25
---

# 用户与排课模型

## User

admin 后台创建，无自助注册。密码使用 bcrypt 直接哈希（非 passlib，因兼容性问题）。

| 字段 | 说明 |
|------|------|
| username | 唯一登录名 |
| password_hash | bcrypt 哈希 |
| role | admin / student |
| name | 显示名 |

## StudentProfile

扩展学生信息，与 User 一对一。

| 字段 | 说明 |
|------|------|
| level | beginner / intermediate / advanced |
| credits | 剩余课时（float，支持半节课） |
| booking_token | UUID，学生专属预约链接凭证 |
| phone, notes | 联系方式和老师备注 |

关联：`LessonAssignment`（多对多，哪些教材分配给哪个学生，带 `assigned_at` 时间戳）

## LessonAssignment

| 字段 | 说明 |
|------|------|
| student_id | FK → StudentProfile |
| lesson_id | FK → Lesson |
| assigned_at | datetime，分配时间，用于排序 |

学生端教材列表按 `assigned_at ASC` 排序（最早分配的排最前）。

## 排课模型

### TimeSlot

老师灵活创建的可用时段。不预设周期，老师想开就开。

| 字段 | 说明 |
|------|------|
| start_time, end_time | datetime |
| status | available → booked → completed / cancelled |

创建时后端检查重叠：`start_time < end AND end_time > start`。

### Booking

学生预约记录。

| 字段 | 说明 |
|------|------|
| time_slot_id | FK |
| student_id | FK → StudentProfile |
| status | confirmed / completed / cancelled / no_show |

防冲突：`UPDATE time_slots SET status='booked' WHERE id=? AND status='available'`，原子操作。

### CreditLog

课时变动记录（充值、扣减），可追溯到具体 booking。

| 字段 | 说明 |
|------|------|
| student_id | FK → StudentProfile |
| amount | 变动量（+1 充值/退回，-1 预约扣除） |
| reason | 变动原因描述 |
| booking_id | FK → Booking（可选） |

## 课时流转

```
预约 → credits -= 1, CreditLog(-1, "booking")
学生取消(>4h) → credits += 1, CreditLog(+1, "student cancel")
老师取消 → credits += 1, CreditLog(+1, "teacher cancel")
老师充值 → credits += N, CreditLog(+N, "recharge")
完成 → 无课时变动（自动变色，时间驱动）
```

## See Also

- [教材数据模型](lesson-structure.md)
- [排课系统功能](../features/scheduling.md)
- [学生管理功能](../features/student-management.md)
