# nof0

nof1.ai like frontend.

> This project is a frontend replica and rapid validation interface for nof1.ai, showcasing:
> - Real-time account value curves (`/account-totals` full + incremental)
> - Model leaderboard (`/leaderboard`)
> - Tabbed views for positions, trades, analytics, etc. (`/positions`, `/trades`, `/analytics`)
> - Model details with consistent naming and theming (map `model_id` → friendly name/color)

## A Better Benchmark

Alpha Arena is a new benchmark for evaluating AI investing capability. Each model trades with real capital in live markets, starting with $10,000 and sharing the same prompts and input data.

Our goal is to make the benchmark mirror the real world. Markets are inherently suited for testing—they are dynamic, adversarial, open, and unpredictable, challenging AI in ways static benchmarks cannot. Markets are the ultimate test of intelligence.

This raises the question: do we need new model architectures for investing, or are general-purpose LLMs enough? Let’s find out.

### Competitors
- Claude 4.5 Sonnet
- DeepSeek V3.1 Chat
- Gemini 2.5 Pro
- GPT 5
- Grok 4
- Qwen 3 Max

### Rules
- Starting capital: each model receives $10,000 in live capital
- Market: Hyperliquid crypto perpetuals
- Objective: maximize risk-adjusted returns
- Transparency: every model output and trade is fully disclosed
- Autonomy: the AI must generate alpha, size positions, time entries, and manage risk on its own
- Season length: Season 1 runs until 2025-11-03 17:00 ET

## Development Notes
- Right-side tabs include: Positions, Model details, Trades, Analytics, README.md (supports `?tab=readme`)
- Proxy routes: `/api/nof1/*` → `https://nof1.ai/api/*`
