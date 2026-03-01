<div align="center">

# JobPulse ⚡

**Real-time job intelligence. Direct from the source.**

[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat-square&logo=node.js&logoColor=white)](https://nodejs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=flat-square&logo=postgresql&logoColor=white)](https://postgresql.org/)
[![Socket.io](https://img.shields.io/badge/Socket.io-010101?style=flat-square&logo=socket.io&logoColor=white)](https://socket.io/)
[![Jest](https://img.shields.io/badge/Jest-14%2F14_passing-C21325?style=flat-square&logo=jest&logoColor=white)](/)

</div>

---

## The Problem

I was applying to new grad roles at FAANG companies. Every morning I'd open LinkedIn, find a role posted "3 hours ago", and apply only to get an automated rejection days later.

I started wondering *who actually gets through?*

After digging into it, the pattern was clear. Companies post jobs directly to their career portals. LinkedIn crawls those portals and republishes them but with a 3–4 hour delay. By the time most people see a posting on LinkedIn, the role already has hundreds of applicants.

The candidates getting callbacks weren't more qualified. They were just **earlier**.

So I built JobPulse a system that monitors company career portals directly, detects new postings the moment they go live, and alerts you before the role ever reaches other job portals. No aggregators. No delay. Just the source.

---

## Features

- **Real-Time Scraping** — Puppeteer + Greenhouse, Eightfold, and Workday APIs monitoring 8 companies every 10 minutes
- **AI Resume Matcher** — Claude-powered ATS scoring with Rabin-Karp string matching and Min-Heap job ranking
- **Smart Email Alerts** — Keyword + company filters via Nodemailer + Gmail SMTP
- **Live WebSocket Feed** — Socket.io pushes new jobs to the dashboard instantly
- **Analytics Dashboard** — Hiring trends, company breakdowns, AI-categorized role analytics
- **Application Tracker** — Mark applied, track history, visualize role breakdown
- **Secure Auth** — JWT + bcrypt, protected routes

---

## Architecture

```
Career Portals                  JobPulse Engine                  You
──────────────                  ───────────────                  ───
Google (Puppeteer)  ──────┐
Netflix (Eightfold) ──────┤     ┌─────────────┐   WebSocket    ┌─────────────┐
Airbnb (Greenhouse) ──────┼────▶│ Diff Engine │──────────────▶ │  Dashboard  │
Nvidia  (Workday)   ──────┤     │ (every 10m) │   Email Alert  │  Real-time  │
Salesforce(Workday) ──────┤     └──────┬──────┘──────────────▶ │  Feed       │
Adobe   (Workday)   ──────┘            │                        └─────────────┘
                                       ▼
                               PostgreSQL + Claude API
                               Rabin-Karp + Min-Heap
```

---

## DSA Implementation

### Rabin-Karp String Matching — `O(n+m)` average
Rolling hash scans resume text against job descriptions simultaneously. Avoids `O(n×m)` naive matching — critical when scoring hundreds of jobs per scrape cycle.

### Min-Heap Job Ranking — `O(log n)` insertion
Jobs are inserted into a Min-Heap keyed by ATS match score. Extracting top-K results runs in `O(k log n)` vs `O(n log n)` for a full sort.

### Diff Engine — `O(n)` change detection
Compares current scrape snapshot against the stored DB snapshot using hash maps for `O(1)` lookup. Flags additions, removals, and edits — then triggers alerts only on new roles.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React + TypeScript + Vite |
| Backend | Node.js + Express |
| Database | PostgreSQL |
| Scraping | Puppeteer, Greenhouse API, Eightfold API, Workday API |
| Real-time | Socket.io + WebSockets |
| AI | Claude API (`claude-sonnet-4-20250514`) |
| Email | Nodemailer + Gmail SMTP |
| Auth | JWT + bcrypt |
| Scheduler | node-cron |
| Testing | Jest — 14/14 passing |

---

## Companies Monitored

| Company | Integration |
|---|---|
| Google | Puppeteer (headless Chrome) |
| Netflix | Eightfold API |
| Airbnb | Greenhouse API |
| Nvidia | Workday API |
| Salesforce | Workday API |
| Adobe | Workday API |
| Fidelity | Workday API |
| Athena Health | Workday API |

---

## Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- Claude API key
- Gmail account with App Password enabled

### Installation

```bash
git clone https://github.com/ritimoradiya/jobpulse.git
cd jobpulse

# Backend
cd backend && npm install
cp .env.example .env
npm run dev

# Frontend (new terminal)
cd frontend && npm install
npm run dev
```

### Environment Variables

```env
DATABASE_URL=postgresql://user:password@localhost:5432/jobpulse
JWT_SECRET=your_jwt_secret
ANTHROPIC_API_KEY=sk-ant-...
GMAIL_USER=your@gmail.com
GMAIL_PASS=your_app_password
PORT=5000
```

---

## Testing

```bash
cd backend && npm test
```

```
PASS  tests/rabin-karp.test.js
PASS  tests/min-heap.test.js
PASS  tests/diff-engine.test.js

Tests: 14 passed, 14 total
```

---

## Project Structure

```
jobpulse/
├── backend/
│   ├── src/
│   │   ├── scrapers/        # Puppeteer + API scrapers per company
│   │   ├── services/        # Diff engine, Min-Heap, email, socket
│   │   ├── routes/          # Auth, jobs, alerts, analytics, AI
│   │   ├── db/              # PostgreSQL schema
│   │   └── cron/            # Scrape scheduler
│   └── tests/               # Jest — Rabin-Karp, Min-Heap, Diff Engine
└── frontend/
    └── src/
        ├── pages/           # Jobs, AI Match, Analytics, Applied, Profile
        └── components/      # Navbar, shared UI
```

---

<div align="center">
Built by <b>Riti Moradiya</b> · MS Data Science, Stevens Institute of Technology
</div>