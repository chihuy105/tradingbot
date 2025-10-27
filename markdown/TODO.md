# TODO

Tracking ongoing progress for the nof0 MVP. Last updated: 2025-10-22

## Phase 1: Scaffolding & Infrastructure
- [x] Read `README.md`, `API_DISCOVERY.md`, `PLAN.md`
- [x] Create a Next.js 16 + Tailwind v4 + TS project under `web/`
- [x] Install deps: `swr`, `zustand`, `date-fns`, `numeral`, `clsx`, `recharts`
- [ ] Baseline design tokens and dark theme

## Phase 2: API Integration Layer
- [x] Create shared `fetcher` and `BASE_URL`
- [x] Implement hooks: `useCryptoPrices`, `usePositions`, `useTrades`, `useAccountTotals`, `useSinceInception`
- [x] CORS proxy: `/api/nof1/[...path]` with frontend routed through local API
- [ ] Retry logic and backoff tuning

## Phase 3: Core UI (MVP)
- [x] Top nav `Header`
- [x] Live price ticker `PriceTicker`
- [x] Home: embed ticker + positions overview (compact table)
 - [x] POSITIONS header sorting (side/symbol/lev/entry/price/unreal)
 - [x] Exit Plan modal (target/stop/invalid condition)
 - [ ] Leaderboard page skeleton

## Phase 4: Utilities & Formatting
- [x] Currency, percentage, and time format helpers
- [ ] Color coding for PnL up/down

## Later
- [x] Recharts account value line chart (since-inception-values)
- [ ] Zustand state + filters
- [ ] shadcn/ui integration and component swap
- [ ] Deploy scripts and README

---

## New Backlog Items (Deep Dive)

### High Priority (1-2 days)
- [x] Leaderboard implementation (new `/leaderboard` endpoint)
  - [ ] Add hook: `useLeaderboard` (`equity`, `return_pct`, `num_trades`, `num_wins/num_losses`, `sharpe`)
  - [x] Ranking table: sort (return/net equity/sharpe/trade count), percentage formatting
  - [x] Highlight top 1, reserve `/models/[id]` link (placeholder)
- [ ] Positions summary enhancements (align with `account-totals`)
  - [x] Cards for available cash ≈ equity - margin, realized/unrealized PnL, cumulative risk, avg confidence
  - [ ] Inline badges/hints (confidence/risk)
- [ ] Error/network states
  - [ ] Global error banner (upstream failure/offline)
  - [ ] SWR retry/backoff (exponential, max 3 attempts)
- [ ] Account value chart (`since-inception-values` + `account-totals`)
  - [x] Merge endpoints; session-level incremental accrual (Zustand)
  - [x] 72H sampling (≤600 pts); empty-state hint + debug link
  - [x] Line colors pulled from model mapping
  - [x] Collapse identical timestamps; legend toggle
- [ ] Proxy configurability
  - [ ] `.env`: `NOF1_BASE`, default `https://nof1.ai/api`; 5s cache for simple GET
  - [ ] Rate limiting per route + lightweight circuit breaker
  - [ ] Proxy logging switch (errors only)

### A. API/Data Layer
- [ ] Proxy config: read upstream from `process.env.NOF1_BASE`, default `https://nof1.ai/api`
- [ ] Proxy resilience: propagate upstream status/body, surface errors in UI
- [ ] Rate limiting + cache: add light throttling and optional 5s cache for GETs
- [ ] Zod validation: runtime schemas for `positions`, `trades`, `since-inception-values`
- [ ] Model metadata map: `model_id` → friendly name, color, icon
- [ ] Timestamp normalization: wrap Unix seconds → `Date`
 - [ ] `/analytics` integration: fees/PnL breakdown, winners vs losers (feeds leaderboard advanced view)
 - [ ] `account-totals` pagination: use `lastHourlyMarker` at boot to avoid full dump

### B. UI/Interaction
- [ ] Positions filters: by model, asset, side
- [ ] Exit Plan modal: copy button and quick share
- [ ] Completed Trades tab: latest N trades with search + pagination
- [ ] ModelChat tab: scaffold (real logs later)
- [ ] Leaderboard: aggregate net equity, return %, P&L via `account-totals`
- [ ] Chart: multi-model equity lines (ALL/72H, $/% toggles)
- [ ] Skeleton + empty states: loading skeletons, empty messaging
- [ ] Error banner: sticky dismissible top-level alert on upstream failure
- [x] Sticky table headers, PnL color helper, price/table skeletons
 - [ ] Legend “focus” gesture (Cmd/Ctrl click isolates model, double-click resets)
 - [ ] Ticker disconnected indicator + last update timestamp
 - [ ] `/models/[id]` detail: overview (equity/return), positions, trades, equity curve (matching color)

### C. Design & Styling
- [ ] Dark theme tokens: semantic color/spacing/radius variables
- [ ] PnL color behavior: intensity + blink on change only
- [ ] Monospace numerals + arrow glyphs: highlight deltas
- [ ] Terminal styling polish: scanlines, grid, subtle noise toggles
- [x] Global tabular numerals, terminal scanline background
 - [ ] Custom scrollbar (dark, narrow, only on overflow)

### New: Model Metadata
- [x] `model_id → name/color/icon` map in `lib/model/meta.ts`
- [ ] Share chart palette and table badges from that map

### D. Performance & Stability
- [ ] SWR retry/backoff: exponential, max attempts, offline notice
- [ ] Chart sampling: downsample when >1000 points
- [ ] Virtualized lists as needed
- [ ] Dev/prod diff: lower poll rate in dev
 - [ ] Chart incremental updates: recompute lazily on tab/window/resize without full redraw

### E. Engineering & Quality
- [ ] Lightweight logging: front end + proxy errors (optional Sentry hook)
- [ ] Strict TS mode: fill missing types, `noImplicitAny`
- [ ] E2E smoke: simple Playwright check (page renders + proxy 200)
- [ ] Unit tests: formatting + data transforms (Vitest)
 - [ ] Tighten lint + CI (eslint:recommended + typescript-eslint)

### F. Config & Deployment
- [ ] `.env` template: `NOF1_BASE`, `NEXT_PUBLIC_APP_NAME`
- [ ] Vercel/Node deploy guide: stateless proxy caveats
- [ ] SEO/meta: `metadata`, `robots.txt`, `sitemap`
- [ ] Monitoring: optional Sentry DSN (env aware)
 - [ ] Build-time env validation + fallback (warn when NOF1_BASE missing)

### G. Legal & Compliance
- [ ] Data attribution & disclaimer: not investment advice, third-party data, latency disclaimer
- [ ] Branding note: clarify relationship with `nof1.ai`, avoid confusion
 - [ ] Display rate-limit/ToS notice if upstream tightens access

### H. Usability & Accessibility
- [ ] Keyboard navigation & focus order
- [ ] Semantic tags + `aria-*`
- [ ] Internationalization hooks: split CN/EN copy

### I. Roadmap (Optional)
- [ ] WebSocket evolution (if upstream exposes)
- [ ] Custom model comparison view
- [ ] Risk metrics (drawdown, Sharpe, win rate, R/R)
