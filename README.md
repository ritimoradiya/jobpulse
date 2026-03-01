<div align="center">

<img src="https://img.shields.io/badge/JobPulse-⚡-6366f1?style=for-the-badge&labelColor=0a0a0f" alt="JobPulse"/>

# JobPulse ⚡
### Find FAANG jobs 3–4 hours before LinkedIn does.

*Direct scraping from company career portals — no aggregators, no delay.*

<br/>

[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat-square&logo=node.js&logoColor=white)](https://nodejs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=flat-square&logo=postgresql&logoColor=white)](https://postgresql.org/)
[![Socket.io](https://img.shields.io/badge/Socket.io-010101?style=flat-square&logo=socket.io&logoColor=white)](https://socket.io/)
[![Claude AI](https://img.shields.io/badge/Claude_API-D97706?style=flat-square&logo=anthropic&logoColor=white)](https://anthropic.com/)
[![Jest](https://img.shields.io/badge/Jest-14%2F14_passing-C21325?style=flat-square&logo=jest&logoColor=white)](/)
[![License](https://img.shields.io/badge/License-MIT-22c55e?style=flat-square)](LICENSE)

<br/>

> 💡 **The insight:** LinkedIn aggregates from company career portals with a 3–4 hour delay.  
> Early applicants (first 50–100) see **dramatically higher callback rates**.  
> JobPulse eliminates that delay.

</div>

---

## 📌 Table of Contents

- [JobPulse ⚡](#jobpulse-)
    - [Find FAANG jobs 3–4 hours before LinkedIn does.](#find-faang-jobs-34-hours-before-linkedin-does)
  - [📌 Table of Contents](#-table-of-contents)
  - [How It Works](#how-it-works)
  - [Features](#features)
  - [Architecture](#architecture)
  - [DSA Implementation](#dsa-implementation)
    - [1. Rabin-Karp String Matching — `O(n+m)` average](#1-rabin-karp-string-matching--onm-average)
    - [2. Min-Heap Job Ranking — `O(log n)` insertion](#2-min-heap-job-ranking--olog-n-insertion)
    - [3. Diff Engine — `O(n)` change detection](#3-diff-engine--on-change-detection)
  - [Tech Stack](#tech-stack)
  - [Companies Monitored](#companies-monitored)
  - [Getting Started](#getting-started)
    - [Prerequisites](#prerequisites)
    - [Installation](#installation)
    - [Environment Variables](#environment-variables)
  - [API Reference](#api-reference)
  - [Testing](#testing)
  - [Project Structure](#project-structure)
  - [Database Schema](#database-schema)

---

## How It Works

```
Career Portals                  JobPulse Engine                    You
──────────────                  ───────────────                    ───
Google (Puppeteer)  ──────┐
Netflix (Eightfold) ──────┤     ┌─────────────┐    WebSocket     ┌──────────────┐
Airbnb (Greenhouse) ──────┼────▶│ Diff Engine │───────────────▶  │  Dashboard   │
Nvidia  (Workday)   ──────┤     │  (every 10m)│    Email Alert   │  Real-time   │
Salesforce(Workday) ──────┤     └──────┬──────┘───────────────▶  │  Feed        │
Adobe   (Workday)   ──────┤            │                          └──────────────┘
Fidelity(Workday)   ──────┤            ▼
AthenaHealth        ──────┘     PostgreSQL DB
                                       │
                                       ▼
                               Claude API (AI Match)
                               Rabin-Karp + Min-Heap
                               ATS Score → Resume Gap Analysis
```

**The gap:** LinkedIn picks up the same postings 3–4 hours later.

---

## Features

| Feature | Description |
|---|---|
| ⚡ **Real-Time Scraping** | Puppeteer + Greenhouse + Eightfold + Workday APIs, every 10 minutes |
| 🤖 **AI Resume Matcher** | Claude-powered ATS scoring, skill gap analysis, improvement tips |
| 🔔 **Smart Email Alerts** | Keyword + company filters via Nodemailer + Gmail SMTP |
| 📡 **Live WebSocket Feed** | Socket.io pushes new jobs instantly — no refresh needed |
| 📊 **Analytics Dashboard** | Hiring trends, company breakdowns, AI-categorized role analytics |
| ✅ **Application Tracker** | Mark applied, track history, visualize role breakdown |
| 👤 **User Profiles** | Email/password management, account deletion |
| 🔐 **Secure Auth** | JWT + bcrypt, protected routes, token refresh |

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        FRONTEND                             │
│   React + TypeScript + Vite                                 │
│   ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────┐  │
│   │  Jobs    │ │Analytics │ │ AI Match │ │   Applied    │  │
│   │  Feed    │ │Dashboard │ │  Page    │ │   Tracker    │  │
│   └──────────┘ └──────────┘ └──────────┘ └──────────────┘  │
└────────────────────────┬────────────────────────────────────┘
                         │ REST + WebSocket
┌────────────────────────▼────────────────────────────────────┐
│                        BACKEND                              │
│   Node.js + Express                                         │
│   ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────┐  │
│   │  Auth    │ │  Jobs    │ │   AI     │ │  Analytics   │  │
│   │  Routes  │ │  Routes  │ │  Routes  │ │   Routes     │  │
│   └──────────┘ └──────────┘ └──────────┘ └──────────────┘  │
│   ┌─────────────────────────────────────────────────────┐   │
│   │              Core Services                          │   │
│   │  Diff Engine │ Scraper Manager │ Socket.io │ Cron   │   │
│   └─────────────────────────────────────────────────────┘   │
└────────────────────────┬────────────────────────────────────┘
                         │
          ┌──────────────┴──────────────┐
          ▼                             ▼
   ┌─────────────┐              ┌──────────────┐
   │ PostgreSQL  │              │  Claude API  │
   │  6 Tables   │              │  AI Scoring  │
   └─────────────┘              └──────────────┘
```

---

## DSA Implementation

Three custom data structure implementations — core talking points for technical interviews.

### 1. Rabin-Karp String Matching — `O(n+m)` average
```
Used for: Resume keyword scanning against job descriptions

Rolling hash approach scans resume text and job description simultaneously.
Avoids O(n×m) naive matching — critical when scoring hundreds of jobs.

Resume text: "...experience with distributed systems and Kubernetes..."
Job desc:    "...requires Kubernetes and distributed systems expertise..."
Match found: ["Kubernetes", "distributed systems"] → ATS Score += 2
```

### 2. Min-Heap Job Ranking — `O(log n)` insertion
```
Used for: Returning top-K matched jobs by ATS score

Jobs are inserted into a Min-Heap keyed by match score.
Extracting top 10 results: O(k log n) vs O(n log n) full sort.

Heap state after scoring 500 jobs:
          92%
         /    \
       88%    85%
      /  \   /  \
    79%  76% 71% 68%  ...
```

### 3. Diff Engine — `O(n)` change detection
```
Used for: Detecting new/removed/modified jobs between scrape cycles

Compares current scrape snapshot against stored DB snapshot.
Uses hash maps for O(1) lookup — flags additions, removals, edits.

Cycle N:   [Job A, Job B, Job C]
Cycle N+1: [Job A, Job C, Job D]
Diff:      REMOVED: Job B  |  ADDED: Job D  → trigger alert
```

---

## Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| Frontend | React + TypeScript + Vite | Dashboard UI |
| Styling | CSS Modules + custom design system | Dark glassmorphism UI |
| Backend | Node.js + Express | REST API server |
| Database | PostgreSQL | Jobs, users, alerts, applications |
| Scraping | Puppeteer | Google Careers (headless browser) |
| APIs | Greenhouse, Eightfold, Workday | Netflix, Airbnb, 5× Workday companies |
| Real-time | Socket.io + WebSockets | Live job feed |
| AI | Claude API (claude-sonnet-4-20250514) | ATS scoring + resume analysis |
| Email | Nodemailer + Gmail SMTP | Alert delivery |
| Auth | JWT + bcrypt | Secure sessions |
| Scheduler | node-cron | Automated scrape every 10 minutes |
| Testing | Jest | Unit tests for all DSA components |

---

## Companies Monitored

| Company | Integration | Jobs |
|---|---|---|
| 🔵 Google | Puppeteer (headless Chrome) | ~4,000+ |
| 🔴 Netflix | Eightfold API | ~650+ |
| 🔴 Airbnb | Greenhouse API | ~250+ |
| 🟢 Nvidia | Workday API | ~2,000+ |
| 🔵 Salesforce | Workday API | ~1,300+ |
| 🔴 Adobe | Workday API | ~1,100+ |
| 🟢 Fidelity | Workday API | ~600+ |
| 🔵 Athena Health | Workday API | ~160+ |

---

## Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- Claude API key ([get one here](https://console.anthropic.com/))
- Gmail account with App Password enabled

### Installation

```bash
# 1. Clone
git clone https://github.com/ritimoradiya/jobpulse.git
cd jobpulse

# 2. Backend setup
cd backend
npm install
cp .env.example .env

# 3. Database setup
createdb jobpulse
psql jobpulse < src/db/schema.sql

# 4. Start backend
npm run dev

# 5. Frontend setup (new terminal)
cd ../frontend
npm install
npm run dev
```

Open `http://localhost:5173`

### Environment Variables

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/jobpulse

# Auth
JWT_SECRET=your_jwt_secret_min_32_chars

# AI
ANTHROPIC_API_KEY=sk-ant-...

# Email
GMAIL_USER=your@gmail.com
GMAIL_PASS=your_16_char_app_password

# Server
PORT=5000
NODE_ENV=development
```

---

## API Reference

<details>
<summary><b>Auth</b></summary>

```
POST   /api/auth/register     Create account
POST   /api/auth/login        Login → JWT
PUT    /api/auth/email        Update email
PUT    /api/auth/password     Update password
DELETE /api/auth/account      Delete account
```
</details>

<details>
<summary><b>Jobs</b></summary>

```
GET    /api/jobs              List all jobs (search, filter, sort)
GET    /api/jobs/:id          Single job detail
POST   /api/jobs/scrape       Trigger manual scrape
POST   /api/jobs/:id/save     Save a job
POST   /api/jobs/:id/apply    Mark as applied
```
</details>

<details>
<summary><b>AI</b></summary>

```
POST   /api/ai/match          ATS score resume vs job description
                              → Returns: score, matched keywords,
                                skill gaps, improvement tips
```
</details>

<details>
<summary><b>Analytics</b></summary>

```
GET    /api/analytics/summary    Total jobs, new today, companies
GET    /api/analytics/trends     Jobs posted over time
GET    /api/analytics/applied    Application history breakdown
```
</details>

<details>
<summary><b>Alerts</b></summary>

```
GET    /api/alerts            Get user alerts
POST   /api/alerts            Create alert (keywords + companies)
DELETE /api/alerts/:id        Remove alert
```
</details>

---

## Testing

```bash
cd backend && npm test
```

```
 PASS  tests/rabin-karp.test.js
 PASS  tests/min-heap.test.js
 PASS  tests/diff-engine.test.js

Test Suites: 3 passed, 3 total
Tests:       14 passed, 14 total
```

---

## Project Structure

```
jobpulse/
├── backend/
│   ├── src/
│   │   ├── scrapers/
│   │   │   ├── google.js          # Puppeteer scraper
│   │   │   ├── greenhouse.js      # Airbnb via Greenhouse API
│   │   │   ├── eightfold.js       # Netflix via Eightfold API
│   │   │   └── workday.js         # Nvidia, Salesforce, Adobe, Fidelity, Athena
│   │   ├── services/
│   │   │   ├── diffEngine.js      # Rabin-Karp + diff detection
│   │   │   ├── minHeap.js         # Job ranking data structure
│   │   │   ├── emailService.js    # Nodemailer alert delivery
│   │   │   └── socketService.js   # WebSocket event emission
│   │   ├── routes/
│   │   │   ├── auth.js
│   │   │   ├── jobs.js
│   │   │   ├── ai.js
│   │   │   ├── analytics.js
│   │   │   └── alerts.js
│   │   ├── db/
│   │   │   └── schema.sql         # 6-table PostgreSQL schema
│   │   └── cron/
│   │       └── scrapeScheduler.js # node-cron every 10 min
│   └── tests/
│       ├── rabin-karp.test.js
│       ├── min-heap.test.js
│       └── diff-engine.test.js
└── frontend/
    └── src/
        ├── pages/
        │   ├── LandingPage.tsx
        │   ├── JobsPage.tsx
        │   ├── AIPage.tsx
        │   ├── AnalyticsPage.tsx
        │   ├── AppliedPage.tsx
        │   └── ProfilePage.tsx
        └── components/
            └── Navbar.tsx
```

---

## Database Schema

```sql
users         → id, name, email, password_hash, created_at
companies     → id, name, career_url, scrape_method, last_scraped_at
jobs          → id, company_id, title, location, url, description, posted_at, detected_at
applications  → id, user_id, job_id, status, applied_at
alerts        → id, user_id, keywords[], companies[], is_active
saved_jobs    → id, user_id, job_id, saved_at
```

---

<div align="center">

Built by **Riti Moradiya** · MS Data Science, Stevens Institute of Technology

[GitHub](https://github.com/ritimoradiya/jobpulse)

</div>