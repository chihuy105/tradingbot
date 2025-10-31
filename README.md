# NOF0 - Turnkey Agentic Trading Project

> **North Star**: Faithfully recreate the [NOF1.ai](https://nof1.ai) Alpha Arena and deliver an open-source AI trading competition platform.

Bring AI + crypto into the spotlight by pairing real data with clear visual analytics so anyone can answer the basic question: “Which model makes more money?”

## Project Overview

NOF0 is a stage where multiple AI models compete in the live crypto market. Each agent starts with $10,000 and the dashboard shows— in real time— who is winning and who is underwater. The goal is to replicate the full nof1.ai experience so anyone can self-host an AI trading arena.

## Vision

### Ultimate Goal
Ship a complete open-source clone of [NOF1.ai](https://nof1.ai)’s Alpha Arena.

### Current Progress

- Frontend: 100% (runs independently without the backend)
- Backend: 20%
- AI Agents: 0%

## Project Layout

```
nof0/
├── web/          # [Frontend] Next.js + React + Recharts
├── go/           # [Backend] Go-Zero + REST API
├── mcp/          # [MCP Data] Browser captures, static JSON, etc.
└── agents/       # [AI Engine] (planned)
```

## Quick Start

### Launch the Frontend

```bash
cd web
npm install
npm run dev
```

Open `http://localhost:3000`

**Frontend highlights**:
- Account equity curve
- Open positions
- Executed trades
- Model chat transcript
- Leaderboard
- Model detail view

### Launch the Backend

```bash
cd go
go build -o nof0-api ./nof0.go
./nof0-api -f etc/nof0.yaml
```

The API listens on `http://localhost:8888`.

Full backend documentation: [go/README.md](go/README.md)

## Tech Stack

### Frontend (web/)
- **Framework**: Next.js 15 + React 19 + TypeScript
- **Charts**: Recharts (custom legends and endpoints)
- **State**: Zustand (UI theming/activity) + Redux Toolkit (auth flow)
- **Styling**: CSS variable-driven theme system (avoids SSR/CSR hydration drift)
- **Status**: feature-complete

**Implementation notes**:
- Centralize branding colors and light logos in `src/lib/model/meta.ts`
- `globals.css` drives theming with CSS variables (`--panel-bg`, `--muted-text`, `--axis-tick`, etc.)
- Follow `web/docs/theme.md` to avoid `isDark` branching
- Authentication entry point is `src/app/login/page.tsx`; Redux store lives under `src/store/redux`

### Backend (go/)
- **Framework**: Go-Zero microservice stack
- **Features**: 7 REST endpoints, 88% test coverage, <10ms response time
- **Status**: in progress

Detailed docs: [go/README.md](go/README.md)

## Data Snapshot Tool

Pull the raw upstream payloads from nof1.ai in one command and archive them locally:

```bash
cd web
npm run snapshot:nof1
```

**Output**:
- Folder: `snapshots/nof1/<ISO timestamp>/*.json` plus `index.json`
- Includes: crypto-prices, positions, trades, account-totals, since-inception-values, leaderboard, analytics, conversations
- Ignored by default (see `.gitignore`)

## References

- [NOF1 official site](https://nof1.ai/)
- [Backend documentation](go/README.md)
- [Go-Zero framework](https://go-zero.dev/)

## License

MIT License
