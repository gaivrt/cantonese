<div align="center">

# 🧊 冰紅茶粵語課堂

**Interactive Cantonese Teaching Platform**

*Turn PDF textbooks into clickable, listenable web lessons with real teacher recordings*

[![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=flat-square&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React_19-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)

</div>

---

## What is this?

A one-on-one Cantonese teaching platform built for teacher **冰紅茶** (Iced Tea). The core idea: take 14 PDF textbooks, OCR them into structured data, and turn every sentence into a clickable unit where students hear the teacher's real voice pronouncing it.

```
PDF 教材 ──→ Claude OCR ──→ JSON ──→ seed ──→ SQLite
                                                  │
                          Browser ← React ← FastAPI API
```

## Features

<table>
<tr>
<td width="50%">

### 📖 Interactive Reader
- 14 textbooks, 1274 sentences, 9 content types
- Flexbox Jyutping alignment (逐字粤拼对齐)
- 8 specialized renderers via Registry pattern
- Click any sentence to hear pronunciation

</td>
<td width="50%">

### 🎙 Recording Studio
- Teacher records directly in the browser
- MediaRecorder API, 60s limit per unit
- Play / re-record / delete per sentence
- Progress tracking across all lessons

</td>
</tr>
<tr>
<td>

### 👥 Student Management
- Search, collapsible cards, inline editing
- Credit system (add / deduct / track)
- Lesson assignment with drag reorder
- One-click booking link copy

</td>
<td>

### 📅 Flexible Scheduling
- Google Calendar-style week view
- Drag-to-create on desktop
- Touch-optimized: adaptive grid fills viewport on iPad
- Token-based booking (no login needed)

</td>
</tr>
</table>

### Auth Design

| Track | Method | Use Case |
|-------|--------|----------|
| **JWT** | bcrypt + HS256, 24h expiry | Admin dashboard, lesson access |
| **Token** | UUID v4 per student | Booking page — zero friction |

No self-registration. Admin creates all accounts.

### Credit Lifecycle

```
Student books a slot    →  -1 credit
Student cancels (≥4h)   →  +1 credit (refund)
Lesson time passes      →  auto-complete (no manual button)
```

## Tech Stack

| Layer | Tech |
|-------|------|
| Backend | FastAPI + SQLAlchemy + SQLite |
| Frontend | React 19 + TypeScript + Vite + Tailwind CSS 4 |
| Design | GAIVRT Design System — warm paper texture, Georgia serif, restrained palette |
| OCR | Claude Vision API (14 PDFs processed in parallel) |
| Package Mgmt | `uv` (Python), `bun` (frontend) |

## Quick Start

```bash
# Backend
uv sync
cp .env.example .env          # edit credentials
uv run python -m backend.cli.seed
uv run uvicorn backend.main:app --reload

# Frontend
cd frontend
bun install
bun dev
```

Open `http://localhost:5173`. Login with the credentials you set in `.env`.

## Project Structure

```
├── backend/
│   ├── routers/          # auth, lessons, students, recordings, scheduling
│   ├── models.py         # SQLAlchemy models
│   ├── auth.py           # JWT + bcrypt
│   ├── data/             # 14 OCR JSON files
│   └── cli/seed.py       # DB seeder
├── frontend/src/
│   ├── pages/            # Login, LessonList, Lesson, Admin, Booking
│   ├── components/
│   │   ├── admin/        # StudentsPanel, SchedulingPanel, RecordingPanel
│   │   └── lesson/       # LessonViewer, renderers/, JyutpingText
│   └── lib/              # API client, Auth context
├── wiki/                 # LLM-maintained knowledge base
├── SCHEMA.md             # Wiki structure definition
└── uploads/audio/        # Teacher recordings (gitignored)
```

## Design System

<table>
<tr>
<td align="center"><strong>Background</strong><br><code>#faf9f5</code><br>warm off-white</td>
<td align="center"><strong>Blue</strong><br><code>#6a9ccd</code><br>links, info</td>
<td align="center"><strong>Sage</strong><br><code>#bdd2cb</code><br>success, audio</td>
<td align="center"><strong>Beige</strong><br><code>#e4dbcd</code><br>cards, dividers</td>
<td align="center"><strong>Terracotta</strong><br><code>#d97757</code><br>CTA, accent</td>
</tr>
</table>

Typography: **Georgia** for headings (28px+), **Cambria** for body, **Inter** for UI labels.

---

<div align="center">
<sub>Built with care for one teacher and her students.</sub>
</div>
