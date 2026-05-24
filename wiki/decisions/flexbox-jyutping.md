---
title: Flexbox 逐字粤拼对齐
type: decision
updated: 2026-05-25
---

# 决策：Flexbox 逐字粤拼对齐

## 背景

教材中粤拼（Jyutping）需要与汉字逐字对齐。经历了三个方案迭代：

1. **分行显示**：粤拼和汉字分两行，无法对齐
2. **HTML ruby/rt**：浏览器原生注音标签，但 `<rt>` 字号约 0.55em（≈9px），过小难读，尤其移动端
3. **Flexbox columns**（最终方案）

## 决策

`frontend/src/components/lesson/JyutpingText.tsx` 使用 inline-flex column 布局：

- `parseRuby()` 将 CJK 字符与 Jyutping 音节一一配对
- 每对渲染为 inline-flex column：注音在上、汉字在下
- 标点符号独立渲染，不带注音
- `charSize` prop 控制整体大小，适配不同 renderer

## 权衡

- 优点：字号完全可控，移动端可读性好
- 优点：每个字符对独立布局，自然换行
- 代价：比 ruby/rt 多一层 DOM，但在教材规模下无性能问题

## See Also

- [拼音统一为粤拼](jyutping-unification.md)
- [内容类型总览](../content-types/overview.md)
