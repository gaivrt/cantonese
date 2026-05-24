---
title: Renderer Registry 模式
type: decision
updated: 2026-05-24
---

# 决策：Renderer Registry 模式

## 背景

教材有 9 种内容类型，每种需要不同的 UI 渲染逻辑。最初方案是在 `LessonViewer` 中用 switch/if 分支渲染，但会导致单文件膨胀且新类型需要改动编排器。

## 决策

使用 Registry 模式：`rendererRegistry.ts` 维护 `Record<string, ComponentType<{units: TextUnit[]}>>`。`LessonViewer` 通过 `getRenderer(type)` 查表获取组件，完全解耦。

## 权衡

- 优点：新增类型只需一个文件 + 一行注册，不动 LessonViewer
- 优点：每个 renderer 独立维护，职责单一
- 代价：多了一层间接引用，但在 8-10 种类型的规模下完全值得

## 实现位置

- Registry：`frontend/src/components/lesson/rendererRegistry.ts`
- Renderers：`frontend/src/components/lesson/renderers/*.tsx`
- 编排器：`frontend/src/components/lesson/LessonViewer.tsx`

## See Also

- [内容类型总览](../content-types/overview.md)
- [项目全景](../overview.md)
