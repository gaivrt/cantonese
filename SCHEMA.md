# SCHEMA — LLM Wiki

## Project

粤语一对一教学平台（冰紅茶粵語課堂）——教材数字化点读 + 学生管理 + 灵活排课 + 真人录音

## Project Structure

| 路径 | 角色 |
|------|------|
| `backend/` | FastAPI 后端（models, auth, routers, schemas, database） |
| `backend/data/` | OCR 提取的 JSON 教材数据 |
| `backend/cli/seed.py` | 数据库 seed 工具（JSON → SQLite） |
| `backend/routers/` | API 路由（auth, lessons, students, recordings, scheduling） |
| `frontend/` | React + TypeScript + Vite + TailwindCSS 前端 |
| `frontend/src/components/lesson/` | 教材渲染器（Renderer Registry 模式，8 种内容类型） |
| `frontend/src/pages/` | 页面组件（Login, LessonList, LessonPage, AdminDashboard, BookingPage） |
| `frontend/src/lib/` | API 客户端、Auth context |
| `all/` | 原始 PDF 教材（14 个，冰紅茶老师制作） |
| `uploads/audio/` | 老师录音文件存储 |

## Wiki Structure

```
wiki/
├── index.md          # 内容索引（必须）
├── log.md            # 操作日志（必须）
├── overview.md       # 项目全景
├── models/           # 数据模型说明
├── features/         # 功能模块设计与状态
├── content-types/    # 教材内容类型定义与渲染逻辑
├── ocr/              # PDF 教材 OCR 提取进度与内容摘要
└── decisions/        # 架构/设计决策及理由
```

## Page Types

- **overview** — 项目全景综述
- **data-model** — 数据库表的设计说明（字段、关系、约束）
- **content-type** — 教材内容类型的定义、JSON 格式、对应 renderer
- **feature** — 功能模块的设计思路、API 接口、实现状态
- **ocr-status** — 单个 PDF 教材的 OCR 提取进度、内容摘要、章节结构
- **decision** — 架构/设计决策、背景、权衡、结论

## Conventions

- 文件名：kebab-case（如 `recording-studio.md`）
- 内链：相对路径 markdown link `[页面名](path/to/page.md)`
- Frontmatter：每个 wiki 页面带 YAML frontmatter
  ```yaml
  ---
  title: 页面标题
  type: overview | data-model | content-type | feature | ocr-status | decision
  updated: YYYY-MM-DD
  ---
  ```
- 交叉引用：页面底部 `## See Also` 区域列出相关页面链接

## Ingest Workflow

1. 读取 source 文件
2. 与用户讨论要点（除非用户要求静默处理）
3. 写新 wiki 页面或更新已有页面
4. 连锁更新：检查新信息是否影响其他已有页面
5. 更新 `wiki/index.md`
6. 在 `wiki/log.md` 追加记录

**特殊：PDF 教材 ingest**
- 每完成一个 PDF 的 OCR 提取，创建/更新对应的 `ocr/` 页面
- 记录章节结构、内容类型分布、unit 数量、已知问题

## Query Workflow

1. 读 `wiki/index.md` 定位相关页面
2. 读取相关 wiki 页面
3. 如果 wiki 信息不足，回溯到源文件或代码
4. 回答问题
5. 有价值的新分析可（征求用户同意后）存入 wiki

## Lint Checklist

- [ ] 页面间矛盾
- [ ] 过时信息（被新 source 取代的旧声明）
- [ ] 孤立页面（没有入链）
- [ ] 缺失页面（被引用但不存在的概念）
- [ ] 缺失交叉引用
- [ ] 可通过搜索填补的信息空白

## Log Format

每条记录以二级标题开头，便于 grep 解析：

```markdown
## [YYYY-MM-DD] operation | description

简要说明做了什么、影响了哪些页面。
```
