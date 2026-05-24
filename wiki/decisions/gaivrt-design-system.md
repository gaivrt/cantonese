---
title: GAIVRT Design System 采用
type: decision
updated: 2026-05-25
---

# 决策：采用 GAIVRT Design System

## 背景

初版 UI 配色和排版缺乏统一风格，用户反馈"太丑"。需要一套成熟的设计语言。

## 决策

全面采用 GAIVRT Design System，核心要素：

- **背景**：暖白 `#faf9f5`（旧书页质感）
- **核心四色**：Blue `#6a9ccd`、Sage Green `#bdd2cb`、Warm Beige `#e4dbcd`、Terracotta Orange `#d97757`
- **字体**：Georgia/Cambria（标题/正文），Inter（UI 辅助文字）
- **原则**：克制优于装饰、大量留白、信息层级靠字重和透明度

## 前端实现

`frontend/src/index.css` 通过 `@theme` 定义 CSS variables：

- `--color-warm-bg`, `--color-warm-card`, `--color-warm-border`
- `--color-warm-text`, `--color-warm-text-secondary`, `--color-warm-text-hint`
- `--color-blue`, `--color-sage`, `--color-beige`, `--color-terracotta`
- `--font-serif`, `--font-sans`

所有组件通过 CSS variables 引用颜色，不硬编码。

## See Also

- [项目全景](../overview.md)
