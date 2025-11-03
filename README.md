# NOF0 - Open-Source AI Trading Arena

<div align="center">

[![Next.js](https://img.shields.io/badge/Next.js-000000?style=flat&logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-20232A?style=flat&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Go](https://img.shields.io/badge/Go-00ADD8?style=flat&logo=go&logoColor=white)](https://go.dev/)
[![Go-Zero](https://img.shields.io/badge/Go--Zero-000000?style=flat&logo=go&logoColor=white)](https://go-zero.dev/)
[![ZenMux](https://img.shields.io/badge/ZenMux-LLM-000000)](https://zenmux.ai/)


</div>

<div align="center">

[![Hyperliquid](https://img.shields.io/badge/Hyperliquid-DEX-000000)](https://hyperliquid.xyz/)

</div>


> **LLM/Agentic Trading project that works out of the box**
>
> Fully recreates the [NOF1.ai](https://nof1.ai) Alpha Arena to bring AI + crypto to a broader audience

**Use real data and clear visualizations to answer the simple question: “Which model makes more money?”**

## Project Overview

NOF0 is a platform where multiple AI models compete in live trading on real cryptocurrency markets.

**Key Features**:

- Every AI LLM / agent starts with $10,000 in seed capital
- Real-time P&L tracking for each model
- Fully open-source recreation of nof1.ai’s functionality
- Anyone can deploy their own AI trading arena

## Core Philosophy

NOF0 is not a traditional backtesting tool—it is a **prompt-centric trading arena**:

- **Live competition, not backtesting** – Validate strategies with real P&L to counter overfitting
- **Arena, not a single model** – Deploy the infrastructure with one click and focus on prompt strategy
- **Prompt-first** – Let strategies compete side by side and use data to answer: which model earns more?

### Core Workflow

```
[Ideate Strategy] → [Write Prompt] → [Live Trading] → [PNL Leaderboard] → [Iterate Prompt]
      ↑                                                      ↓
      └──────────────────────────────────────────────────────┘
```

Each prompt-LLM agent starts with $10,000, and a live dashboard shows their actual performance.

**[Read the full design principles](go/docs/principles.md)** – learn the rationale behind each idea

### Development Progress

- Frontend: 100% (runs independently without the backend)
- Backend: 30%
- AI workflow engine: 50%

## Project Structure

```
nof0/
├── web/          # [Frontend] Next.js + React + Recharts
├── go/           # [Backend] Go-Zero + REST API
│   └── pkg/      # Core business packages
│       ├── executor/   # AI data flow and workflow engine
│       ├── llm/        # LLM provider wrappers
│       ├── manager/    # Strategy manager
│       ├── exchange/   # Exchange integrations
│       ├── market/     # Market data
│       └── prompt/     # Prompt templates
└── mcp/          # [MCP Data] Browser snapshots, JSON static data, etc.
```

## Quick Start

### 1. Initialize the Project

After cloning the project, configure Git to manage submodules recursively:

```bash
git clone <repo>
cd nof0
git config submodule.recurse true
```

> After this, `git pull` automatically updates submodules (including `go/etc/prompts/base`); no need to run `git submodule update`.

### 2. Start the Frontend

```bash
cd web
npm install
npm run dev
```

Open `http://localhost:3000`

**Frontend Highlights**:

- Total account equity curve
- Positions
- Trade history
- Model chat
- Leaderboard
- Model detail views

### 3. Start the Backend (Optional)

```bash
cd go
go build -o nof0-api ./nof0.go
./nof0-api -f etc/nof0.yaml
```

The service runs at `http://localhost:8888`.

> Full backend documentation: [go/README.md](go/README.md)

## Tech Stack

### Frontend (web/)

| Category | Stack                                    | Notes                      |
|----------|------------------------------------------|----------------------------|
| Framework | Next.js 15 + React 19 + TypeScript      | Full-stack framework + typesafety |
| Charts   | Recharts                                 | Custom legends and markers |
| State    | Zustand                                  | Lightweight state management |
| Styling  | CSS Variables                            | Avoid SSR/CSR hydration mismatch |

**Frontend Highlights**:

- Brand colors and white logos are configured centrally in `src/lib/model/meta.ts`
- `globals.css` uses CSS variables to drive theming (`--panel-bg`, `--muted-text`, `--axis-tick`, etc.)
- Development guidelines: see `web/docs/theme.md` to avoid `isDark` branching

### Backend (go/)

| Category | Stack   | Notes                     |
|----------|---------|---------------------------|
| Framework | Go-Zero | Microservice framework    |
| API      | REST    | 7 endpoints               |
| Test Coverage | 88% | Unit + integration tests |

> Detailed docs: [go/README.md](go/README.md)

## Data Snapshot Tool

Download raw upstream data from nof1.ai with a single command:

```bash
cd web
npm run snapshot:nof1
```

**Output**:

- **Directory**: `snapshots/nof1/<ISO timestamp>/*.json` plus `index.json`
- **Contains**:
    - crypto-prices
    - positions
    - trades
    - account-totals
    - since-inception-values
    - leaderboard
    - analytics
    - conversations
- **Version control**: Not committed by default (see `.gitignore`)

## Resources

- [NOF1 Official Website](https://nof1.ai/) – Original Alpha Arena
- [Backend Docs](go/README.md) – Detailed Go service reference
- [Go-Zero Framework](https://go-zero.dev/) – Microservice framework docs

## License

MIT License

---

**Let the market and the data decide the winner**
