---
title: 灵活排课系统
type: feature
updated: 2026-05-25
---

# 灵活排课系统

**状态**：✅ Phase 3，已完成

## 设计原则

完全灵活，不预设周期。老师不是每周固定时间上课，也不是每周都有课。

## Admin 端 — Google Calendar 周视图

`frontend/src/components/admin/SchedulingPanel.tsx`

- **布局**：7 天 × 时间格（13:00–24:00），每格 52px 高
- **拖拽创建**：pointer events 实现 drag-to-create，30 分钟 snap 颗粒度
  - pointerDown 用 `Math.floor` 定位起点（避免跳到下一格）
  - pointerMove 用 `Math.round` 定位终点（跟手）
  - gridRef 计算 Y 坐标（非 scrollRef）
- **状态色彩**：available（蓝）→ booked（绿，显示学生姓名）→ completed（灰）
- **自动完成**：booked 状态的时段过了 end_time 后自动渲染为 "completed" 颜色，无需手动标记
- **重叠检测**：后端创建时段时检查 `start_time < end AND end_time > start`
- **统计栏**：显示 available / booked / completed 数量

## 学生端 — Token-based 预约页

`frontend/src/pages/BookingPage.tsx`

- **免登录**：通过 `/book/{booking_token}` 访问，无需 JWT
- **UI 风格**：Calendly-style 日期选择条 + 时间段网格
- **功能**：
  - 查看可用时段（按日期分组）
  - 一键预约（课时 > 0 时）
  - 查看已确认预约
  - 取消预约（距上课 > 4 小时可取消）
  - 查看已完成课程历史

## 课时（Credits）生命周期

```
预约成功 → 扣 1 课时
学生取消（>4h）→ 退回 1 课时
老师取消（anytime）→ 退回 1 课时
时间到 → 自动变色为 completed（不触发课时变动）
```

- **不在 complete 时扣**——预约即扣，避免"上完课忘标记"导致不扣费
- CreditLog 记录每笔变动，可追溯到具体 booking

## API 端点

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/scheduling/slots` | 批量创建时段（含重叠检测） |
| GET | `/api/scheduling/slots` | 列出时段（admin 全部，joinedload） |
| PATCH | `/api/scheduling/slots/{id}/complete` | 标记完成 |
| PATCH | `/api/scheduling/slots/{id}/cancel` | 老师取消（退课时） |
| DELETE | `/api/scheduling/slots/{id}` | 删除空闲时段 |
| GET | `/api/scheduling/book/{token}` | 获取预约页数据 |
| POST | `/api/scheduling/book/{token}` | 学生预约（扣课时） |
| POST | `/api/scheduling/book/{token}/cancel` | 学生取消（>4h，退课时） |

## 学生端入口

学生登录后在教材列表页 header 看到"預約上課"按钮，点击跳转到 `/book/{booking_token}`。booking_token 通过 `/api/auth/me` 获取。

## See Also

- [用户与排课模型](../models/user-scheduling.md)
- [Token-based 预约决策](../decisions/token-booking.md)
- [Credit 生命周期决策](../decisions/credit-lifecycle.md)
