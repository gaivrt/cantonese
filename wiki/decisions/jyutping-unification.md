---
title: 拼音统一为粤拼（Jyutping）
type: decision
updated: 2026-05-24
---

# 决策：拼音统一为粤拼

## 背景

原始 PDF 教材使用两种拼音系统：
1. 数字声调耶鲁变体（m4, hei6, x→s, q→c）——生活、学校等课程
2. 标准耶鲁拼音（带变音符号如 chéng, Sīnsāang）——投诉服务、国家文化

需要统一为一种标准。

## 决策

统一为**粤拼（Jyutping）**。声母+韵母+数字声调，如 `m4`, `cing2`, `hei6`。

## 理由

- 粤拼是目前最通用的粤语拼音方案（香港语言学学会制定）
- 数字声调比变音符号更易输入、存储、检索
- 与大多数在线粤语词典一致（如粤典 words.hk）

## 转换要点

耶鲁 → 粤拼的主要差异：
- 声母：ch→c, sh→s, j→z, initial y→j
- 韵母：eu→eoi, ou→ou, a→aa（开音节长元音）
- 声调：Yale 变音符号 → 数字 1-6

## See Also

- [OCR 进度](../ocr/progress.md)
- [Flexbox 逐字粤拼对齐](flexbox-jyutping.md)
