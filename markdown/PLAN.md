# nof0 MVP Frontend Implementation Plan

## Project Overview

**nof0** is a mirror build of nof1.ai that focuses on surfacing AI trading agent logic, prompts, and position data. The MVP is a Next.js app that **talks directly to the public REST API exposed by nof1.ai**, so we can skip mock data and validate with real feeds immediately.

## Key Discovery: nof1.ai REST API

Browser network inspection revealed that nof1.ai ships with a complete public REST API. We can therefore ship against production-grade data without fabricating a mock layer, shaving multiple days off the schedule.

## nof1.ai REST API Notes

### API Basics
- **Base URL**: `https://nof1.ai/api`
- **Auth**: none (fully public)
- **CORS**: cross-origin requests are allowed

### Available Endpoints

#### 1. Crypto Prices `/crypto-prices`
Pulls live crypto quotes.

**Request**:
```http
GET /api/crypto-prices
```

**Sample response**:
```json
{
  "prices": {
    "BTC": {
      "symbol": "BTC",
      "price": 108199.5,
      "timestamp": 1761151919417
    },
    "ETH": {
      "symbol": "ETH",
      "price": 3832.05,
      "timestamp": 1761151919417
    },
    "SOL": { "symbol": "SOL", "price": 183.635, "timestamp": 1761151919417 },
    "BNB": { "symbol": "BNB", "price": 1074.35, "timestamp": 1761151919417 },
    "DOGE": { "symbol": "DOGE", "price": 0.191425, "timestamp": 1761151919417 },
    "XRP": { "symbol": "XRP", "price": 2.3914, "timestamp": 1761151919417 }
  },
  "serverTime": 1761151919417
}
```

#### 2. Positions `/positions`
Returns the active positions for every model.

**Request**:
```http
GET /api/positions?limit=1000
```

**Params**:
- `limit` (optional): defaults to 1000

**Sample response**:
```json
{
  "positions": [
    {
      "id": "claude-sonnet-4-5",
      "positions": {
        "XRP": {
          "entry_oid": 204655970889,
          "risk_usd": 594.7,
          "confidence": 0.62,
          "exit_plan": {
            "profit_target": 2.6485,
            "stop_loss": 2.1877,
            "invalidation_condition": "BTC breaks below 105,000, confirming deeper market correction"
          },
          "entry_time": 1760744224.108066,
          "symbol": "XRP",
          "entry_price": 2.3031,
          "margin": 1968.147779,
          "leverage": 8,
          "quantity": 5164,
          "current_price": 2.39705,
          "unrealized_pnl": 483.3504,
          "closed_pnl": -5.35
        }
      }
    }
  ]
}
```

#### 3. Trade History `/trades`
Lists completed trades across models.

**Request**:
```http
GET /api/trades
```

**Sample response**:
```json
{
  "trades": [
    {
      "id": "gpt-5_e5516874-14bd-4971-a50f-c09ca575f745",
      "symbol": "DOGE",
      "model_id": "gpt-5",
      "side": "long",
      "entry_price": 0.19651,
      "exit_price": 0.1901,
      "quantity": 14258,
      "leverage": 1,
      "entry_time": 1760901231.033,
      "exit_time": 1761130495.339,
      "entry_human_time": "2025-10-19 19:13:51.033000",
      "exit_human_time": "2025-10-22 10:54:55.339000",
      "realized_net_pnl": -93.738785,
      "realized_gross_pnl": -91.39378,
      "total_commission_dollars": 2.345005,
      "exit_plan": {}
    }
  ]
}
```

#### 4. Account Totals `/account-totals`
Fetches equity, PnL, and rich position data per model.

**Request**:
```http
GET /api/account-totals
GET /api/account-totals?lastHourlyMarker=114
```

**Params**:
- `lastHourlyMarker` (optional): use for incremental syncs

**Response**: includes full position payloads, unrealized/realized PnL, and more.

#### 5. Since-Inception Values `/since-inception-values`
Delivers historical account value series.

**Request**:
```http
GET /api/since-inception-values
```

**Sample response**:
```json
{
  "serverTime": 1761151919417,
  "sinceInceptionValues": [
    {
      "id": "117506d4-d377-47b2-a90b-b86853f796d7",
      "nav_since_inception": 10000,
      "inception_date": 1760738409.834185,
      "num_invocations": 0,
      "model_id": "gpt-5"
    }
  ]
}
```

#### 6. Leaderboard `/leaderboard`
Aggregates leaderboard stats for all models.

**Request**:
```http
GET /api/leaderboard
```

**Sample response**:
```json
{
  "leaderboard": [
    {
      "id": "deepseek-chat-v3.1",
      "num_trades": 8,
      "win_dollars": 1489.52,
      "num_losses": 7,
      "num_wins": 1,
      "sharpe": 1.268,
      "lose_dollars": -1065.65,
      "return_pct": 7.41,
      "equity": 10741.0
    }
  ]
}
```

**Key fields**:
- `num_trades`: total trade count
- `sharpe`: Sharpe ratio
- `return_pct`: return percentage
- `equity`: current equity
- `win_rate`: compute via `num_wins / num_trades`

#### 7. Advanced Analytics `/analytics`
Detailed KPIs per model (drives the Advanced Analytics tab on the leaderboard).

**Request**:
```http
GET /api/analytics
```

**Response tables**:
- `overall_trades_overview_table`: trade summary (avg holding time, trade size, etc.)
- `longs_shorts_breakdown_table`: long-short positioning
- `winners_losers_breakdown_table`: winners vs losers
- `signals_breakdown_table`: signal mix (long/short/hold)
- `fee_pnl_moves_breakdown_table`: fee and PnL breakdown
- `invocation_breakdown_table`: invocation cadence

**Key fields**:
- `avg_holding_period_mins` / `median_holding_period_mins`: holding periods
- `avg_size_of_trade_notional` / `median_size_of_trade_notional`: trade size
- `avg_convo_leverage` / `median_convo_leverage`: leverage
- `avg_confidence` / `median_confidence`: confidence
- `long_short_trades_ratio`: long-short ratio
- `win_rate`: win rate

### API Usage Tips

1. **Polling cadence**
   - Prices: 2-5 seconds
   - Positions: 5-10 seconds
   - Trades: 10-30 seconds
   - Leaderboard: ~30 seconds
   - Analytics: ~60 seconds (heavy payload; update less frequently)

2. **Caching**
   - Lean on SWR or React Query
   - Tune `revalidateOnFocus` and `refreshInterval`

3. **Error handling**
   - Implement retries with backoff
   - Gracefully fall back to the last good payload

## Core MVP Requirements

Based on the live site analysis and API surface, the MVP must ship these pillars:

1. **Agent Logic**
   - Pull `exit_plan` from `/account-totals`
   - Surface decision logic and risk management context
   - Highlight `confidence` and `risk_usd`

2. **Prompts**
   - Reconstruct system prompts from API material
   - Show market data input schema
   - Explain the decision framework

3. **Positions**
   - Read active positions via `/positions`
   - Display exit plans (`profit_target`, `stop_loss`, `invalidation_condition`)
   - Show `unrealized_pnl`
   - Display leverage ratios

## Tech Stack

### Core Framework
- **Next.js 14+** (App Router)
- **TypeScript**
- **React 18+**

### UI Layer & Styling
- **Tailwind CSS** – tight financial UI layouts
- **shadcn/ui** – quality component primitives
- **Recharts** – charting similar to CoinGecko
- **Framer Motion** – micro-interactions

### State & Data
- **Zustand** – lightweight state management
- **React Query / SWR** – API data fetching (future production API ready)

### Utilities
- **date-fns** – date ops
- **numeral** – numeric formatting
- **clsx / cn** – class helpers

## UI/UX Principles

### Visual Style (CoinGecko inspired)
1. **Compact layout**
   - High information density
   - Minimal whitespace
   - Table-first presentation

2. **Color system**
   - Dark theme (terminal vibe)
   - Green (profit) / red (loss) as financial defaults
   - High-contrast text
   - Brand accents: purple/blue in line with nof1.ai

3. **Typography**
   - Monospace for numbers (JetBrains Mono)
   - Clear hierarchy

4. **Responsiveness**
   - Desktop-first
   - Mobile: horizontal scroll for tables

## Pro Trading UI/UX Guidelines

### Core Ideas

#### 1. Information Hierarchy & Scan Patterns
Traders need **instant scanability**:

- **F-pattern**
  - Anchor critical stats top-left (price, PnL)
  - Secondary info down the left column
  - Deep detail to the right or bottom

- **Visual weight**
  - Large type: price, total PnL, equity
  - Medium type: positions, trades
  - Small type: timestamps, indicators

- **Color encoding**
  - Red: loss, warning, negative moves (`text-red-500/600`)
  - Green: gain, success, positive moves (`text-green-500/600`)
  - Gray: neutral data (`text-gray-400/500`)
  - Amber: caution / pending (`text-amber-500`)
  - Blue/Purple: brand accents, links, secondary actions

#### 2. Density vs Readability

**High-density rules**:
- Keep critical info on a single screen
- Table line height: `leading-tight` (1.25)
- Gaps: `gap-2` or `gap-3` (8-12px)
- Font sizes: headline data 14-16px, secondary 12-13px

**Readability safeguards**:
- Contrast >= 4.5:1 (WCAG AA)
- Monospace for numbers and code
- Sufficient line spacing to avoid clutter
- Visual grouping via borders/backgrounds

#### 3. Real-Time Feedback

**Highlight changes**:
```typescript
// Price flash logic
- Up move: quick green flash (200ms)
- Down move: quick red flash (200ms)
- Use transition-colors duration-200
```

**Loading states**:
- Prefer skeletons over spinners
- Refresh panels, not entire screens
- Keep stale data visible (SWR default)

**Errors**:
- Toast alerts (top-right, auto-dismiss)
- Inline messaging on failure
- Degraded state: show cached data + “may be stale” banner

#### 4. Interaction Efficiency

**Keyboard shortcuts** (optional but professional):
- `1-4`: switch home tabs
- `L`: go to leaderboard
- `M`: open model selector
- `Esc`: dismiss modals

**Hit areas**:
- Buttons >= 44x44px on mobile
- Make entire table rows clickable (`cursor-pointer`)
- Avoid tiny targets

**Hover feedback**:
- Table rows: subtle background (`hover:bg-gray-800/50`)
- Buttons: darker color + slight scale (`hover:scale-105`)
- Cards: border glow or deeper shadow

### Key Component Interactions

#### Price Ticker
```
Placement: top of page, fixed or sticky
Height: 32-40px
Behavior:
  - Continuous marquee (CSS animation)
  - Pause on hover
  - Click symbol: spotlight related positions
Updates: refresh every 2 seconds, flash on change
```

#### Chart Control Layout
```
┌─────────────────────────────────────────────┐
│ [Loading...]           [ALL] [72H]  [$] [%] │ ← controls top-right
│                                             │
│                Chart Area                    │
│                                             │
│                                             │
└─────────────────────────────────────────────┘
```

**Behavior**:
- Time range buttons: mutually exclusive with strong active states
- Format toggles: icon + label
- Legend: tap to toggle model lines

#### Positions Table

**Column widths**:
```
SIDE      COIN    LEVERAGE  NOTIONAL   EXIT PLAN  UNREAL P&L
8%        12%     10%       15%        20%        15%
└─Key      └─Asset  └─Risk    └─Size     └─Strategy  └─Outcome (priority)
```

**Sorting**:
- Default: unrealized PnL descending
- Click headers to toggle ASC/DESC
- Active column shows arrow indicator ↑↓

**Grouping**:
- Group by model with collapse/expand
- Group header: model name + total PnL + position count
- Within group, sort by PnL

#### Exit Plan Modal

**Triggers**:
- “VIEW” button in the table
- Eye icon on row hover

**Layout**:
```
┌─ Exit Plan: XRP Long 8x ──────────────┐
│                                     [×]│
│  [TARGET] Profit Target                │
│     $2.6485  (+15.0% from entry)       │
│                                        │
│  [STOP] Stop Loss                      │
│     $2.1877  (-5.0% from entry)        │
│                                        │
│  [WARN] Invalidation Condition         │
│     BTC breaks below 105,000,          │
│     confirming deeper market correction│
│                                        │
│  [INFO] Risk/Reward Ratio: 3.0         │
│                                        │
│                      [UNDERSTOOD]      │
└────────────────────────────────────────┘
```

**Visual treatment**:
- Semi-transparent backdrop with blur
- Centered modal, max width 500px
- Iconography for clarity
- Color code: green (target), red (stop), amber (invalidation)

#### Leaderboard Table

**Rank visualization**:
```
RANK  MODEL              RETURN %    P&L
 #1   DeepSeek V3.1     +7.41%      $740.99  ━━━━━━━
 #2   Qwen3 Max         +3.75%      $375.09  ━━━
 #3   Grok 4            -3.19%      -$319.07 ▄▄▄
```

- Top three get special badges or highlight
- Embed spark bars for PnL (GitHub Insights vibe)
- Highlight the sorted column

**Advanced Analytics tab**:
- Compact type (12px) with horizontal scroll
- Freeze first column (model name)
- Tooltips describe metrics

### Layout Focus

#### Home 60/40 Split

**Why**:
- **Left 60% (charts)**: macro trend view
- **Right 40% (tabs)**: detailed decision data
- Mirrors left-to-right scanning pattern

**Responsive breakpoints**:
- Desktop (≥1280px): 60/40 split
- Tablet (768-1279px): vertical stack, charts first
- Mobile (<768px): single column, chart priority

#### Tab Navigation

**Placement**: top of content region  
**Style**:
```
┌─────────────────────────────────────────┐
│ [COMPLETED TRADES] MODELCHAT POSITIONS  │ ← active tab bold + underline
│ ─────────────────                       │
│                                         │
│             Tab content                  │
```

**Interaction**:
- Click to swap views (client-side transitions)
- Active state via color, weight, underline
- Keyboard accessible (Tab key)

### Status Patterns

#### Empty States
```
┌─────────────────────────────────────────┐
│                                         │
│         No Active Positions             │
│                                         │
│   All models are currently in cash.     │
│   New positions will appear here when   │
│   AI models enter the market.           │
└─────────────────────────────────────────┘
```

#### Loading States
```
┌─────────────────────────────────────────┐
│  Loading positions...                   │
│                                         │
│  [Skeleton rows showing expected layout]│
└─────────────────────────────────────────┘
```

#### Error States
```
┌─────────────────────────────────────────┐
│                                         │
│      Failed to Load Positions           │
│                                         │
│   [RETRY]          [USE CACHED DATA]    │
└─────────────────────────────────────────┘
```

### Motion & Transitions

**Rule: subtle but informative**

```typescript
// Data updates
- Price move: flash (200ms)
- New position: slide in from left (300ms)
- Closed position: fade out (200ms)

// Interaction
- Button press: scale down (100ms)
- Modal entrance: fade + scale (250ms, ease-out)
- Tab swap: fade (150ms)

// Avoid
- Animations >500ms
- Heavy 3D transforms
- Distracting infinite loops
```

### Performance Considerations

**Virtualized tables** (100+ rows):
- `react-window` or `react-virtuoso`
- Only render visible rows

**Charting**:
- Sample down if >1000 points
- Prefer Canvas (Recharts default)
- Debounce interactions (100ms)

**Images**:
- Model badges as WebP
- Use Next.js Image
- Lazy-load offscreen assets

## Core Pages

### 1. Home (`/`)

#### Top Navigation
```
Logo | LIVE | LEADERBOARD | MODELS
```

#### Live Price Ticker
```
BTC $108,367.50  ETH $3,833.45  SOL $183.65  BNB $1,074.75  DOGE $0.1916  XRP $2.39
HIGHEST: QWEN3 MAX $11,340.35 +13.40%  LOWEST: GPT 5 $3,392.73 -66.07%
```

#### Main Content
**Left (60%) – Charts**
- Account equity line chart
- Time range toggles (ALL / 72H)
- Value format toggle ($ / %)
- Multiple lines (one per model)

**Right (40%) – Tabs**
- Tabs: COMPLETED TRADES | MODELCHAT | POSITIONS | README.TXT
- Dynamic content per tab

### 2. POSITIONS Tab (Core)

```
┌─ FILTER: ALL MODELS ▼ ──────────────────────────┐
│                                                  │
│ CLAUDE SONNET 4.5    TOTAL UNREALIZED P&L: $359.99 │
│                                                  │
│ ┌─────────────────────────────────────────────┐ │
│ │ SIDE │ COIN │ LEVERAGE │ NOTIONAL │ EXIT PLAN │ UNREAL P&L │
│ │ LONG │ XRP  │   8X     │ $12,348  │   VIEW    │  $454.95   │
│ │ LONG │ DOGE │   8X     │ $10,322  │   VIEW    │  -$94.95   │
│ └─────────────────────────────────────────────┘ │
│ AVAILABLE CASH: $5,232.54                        │
│                                                  │
│ [Open Exit Plan modal]                           │
│ ┌─ Exit Plan: ─────────────────────────────────┐│
│ │ Target: $2.65                                 ││
│ │ Stop: $2.19                                   ││
│ │ Invalid Condition: BTC breaks below 105,000   ││
│ └──────────────────────────────────────────────┘│
└──────────────────────────────────────────────────┘
```

### 3. MODELCHAT Tab (Logic & Prompts)

```
┌─ MODEL: CLAUDE SONNET 4.5 ▼ ────────────────────┐
│                                                  │
│ Agent Chat Log                                   │
│ ┌──────────────────────────────────────────────┐ │
│ │ [System] 08:15:23                            │ │
│ │ You are a crypto trading AI...               │ │
│ │                                              │ │
│ │ [Assistant] 08:15:45                         │ │
│ │ Analyzing market conditions...               │ │
│ │ - BTC showing bullish momentum               │ │
│ │ - XRP breakout above resistance              │ │
│ │ Decision: LONG XRP 8x leverage               │ │
│ │ Reasoning: Technical breakout + volume       │ │
│ │                                              │ │
│ │ [User] 08:16:00                              │ │
│ │ Current positions status?                    │ │
│ └──────────────────────────────────────────────┘ │
│                                                  │
│ Prompt Template                                  │
│ ┌──────────────────────────────────────────────┐ │
│ │ System Prompt:                               │ │
│ │ You are an expert crypto trader...          │ │
│ │                                              │ │
│ │ Market Data Format:                          │ │
│ │ {                                            │ │
│ │   "btc": { "price": 108367.50, ... },       │ │
│ │   "eth": { "price": 3833.45, ... }          │ │
│ │ }                                            │ │
│ └──────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────┘
```

### 4. LEADERBOARD (`/leaderboard`)

```
┌─ LEADERBOARD ────────────────────────────────────┐
│                                                  │
│ [OVERALL STATS] [ADVANCED ANALYTICS]             │
│                                                  │
│ ┌────┬──────────────┬────────┬─────────┬────────┐ │
│ │RANK│ MODEL        │ ACCT   │ RETURN  │ P&L    │ │
│ ├────┼──────────────┼────────┼─────────┼────────┤ │
│ │ 1  │ QWEN3 MAX    │$11,586 │ +15.86% │$1,586  │ │
│ │ 2  │ DEEPSEEK V3  │$11,056 │ +10.56% │$1,056  │ │
│ │ 3  │ GROK 4       │ $9,824 │  -1.76% │ -$176  │ │
│ └────┴──────────────┴────────┴─────────┴────────┘ │
│                                                  │
│ WINNING MODEL: QWEN3 MAX                         │
│ TOTAL EQUITY: $11,586                            │
│ ACTIVE POSITIONS: ETH, BTC                       │
└──────────────────────────────────────────────────┘
```

## Data Structures

### Model
```typescript
interface Model {
  id: string;
  name: string;
  icon: string; // icon path or component
  color: string; // chart line color
  totalEquity: number;
  returnPercent: number;
  unrealizedPnL: number;
  realizedPnL: number;
  availableCash: number;
  positions: Position[];
  trades: Trade[];
  chatHistory: ChatMessage[];
  systemPrompt: string;
}
```

### Position
```typescript
interface Position {
  id: string;
  modelId: string;
  side: 'LONG' | 'SHORT';
  coin: string;
  leverage: number;
  notional: number; // notional exposure
  entryPrice: number;
  currentPrice: number;
  unrealizedPnL: number;
  exitPlan: ExitPlan;
  openedAt: Date;
}

interface ExitPlan {
  target: number; // take-profit
  stop: number; // stop-loss
  invalidCondition: string; // invalidation rule
}
```

### Trade
```typescript
interface Trade {
  id: string;
  modelId: string;
  type: 'long' | 'short';
  coin: string;
  entryPrice: number;
  exitPrice: number;
  quantity: number;
  notional: number;
  holdingTime: string; // "7H 44M"
  netPnL: number;
  completedAt: Date;
}
```

### ChatMessage
```typescript
interface ChatMessage {
  id: string;
  modelId: string;
  role: 'system' | 'user' | 'assistant';
  content: string;
  timestamp: Date;
  metadata?: {
    decision?: string; // "LONG XRP 8x"
    reasoning?: string;
  };
}
```

### ChartDataPoint
```typescript
interface ChartDataPoint {
  timestamp: Date;
  [modelId: string]: number; // account value per model
}
```

## Component Architecture

### Pages
```
app/
├── layout.tsx                 # root layout
├── page.tsx                   # home
├── leaderboard/
│   └── page.tsx              # leaderboard
└── globals.css
```

### Feature Components
```
components/
├── layout/
│   ├── Header.tsx            # top nav
│   ├── PriceTicker.tsx       # price ticker
│   └── Footer.tsx
├── chart/
│   ├── AccountValueChart.tsx # equity chart
│   └── ChartControls.tsx     # time/value toggles
├── tabs/
│   ├── TabContainer.tsx      # tabs wrapper
│   ├── CompletedTrades.tsx   # completed trades
│   ├── ModelChat.tsx         # logic & prompts
│   ├── Positions.tsx         # positions list
│   └── Readme.tsx            # README view
├── positions/
│   ├── PositionCard.tsx      # model position summary
│   ├── PositionTable.tsx     # positions table
│   └── ExitPlanModal.tsx     # exit plan modal
├── leaderboard/
│   ├── LeaderboardTable.tsx  # leaderboard table
│   └── WinnerCard.tsx        # winning model card
├── model/
│   ├── ModelIcon.tsx         # model icon
│   └── ModelSelector.tsx     # model selector
└── ui/                       # shadcn/ui exports
    ├── button.tsx
    ├── table.tsx
    ├── tabs.tsx
    ├── card.tsx
    └── ...
```

### State Management
```
store/
├── useModelsStore.ts         # model data
├── useChartStore.ts          # chart controls
└── useFilterStore.ts         # filters
```

### API Layer
```
lib/
├── api/
│   ├── client.ts             # API client config
│   ├── nof1.ts              # nof1.ai wrapper
│   └── hooks/
│       ├── useCryptoPrices.ts    # prices hook
│       ├── usePositions.ts       # positions hook
│       ├── useTrades.ts          # trades hook
│       ├── useAccountTotals.ts   # account totals hook
│       ├── useSinceInception.ts  # inception values hook
│       ├── useLeaderboard.ts     # leaderboard hook
│       └── useAnalytics.ts       # analytics hook
└── utils/
    ├── formatters.ts         # number/date helpers
    ├── calculations.ts       # pnl utilities
    └── transformers.ts       # API transformers
```

## API Integration Strategy

### 1. Fetch Layer

Use **SWR** for stale-while-revalidate behavior:

```typescript
// lib/api/hooks/useCryptoPrices.ts
import useSWR from 'swr';

export function useCryptoPrices() {
  return useSWR('/api/crypto-prices', fetcher, {
    refreshInterval: 2000, // 2s refresh
    revalidateOnFocus: true,
  });
}

// lib/api/hooks/usePositions.ts
export function usePositions(limit = 1000) {
  return useSWR(`/api/positions?limit=${limit}`, fetcher, {
    refreshInterval: 5000, // 5s refresh
    dedupingInterval: 2000,
  });
}
```

### 2. API Client

```typescript
// lib/api/client.ts
const BASE_URL = 'https://nof1.ai/api';

export async function fetcher<T>(endpoint: string): Promise<T> {
  const response = await fetch(`${BASE_URL}${endpoint}`);
  if (!response.ok) {
    throw new Error('API request failed');
  }
  return response.json();
}

// lib/api/nof1.ts
export const nof1API = {
  getCryptoPrices: () => fetcher('/crypto-prices'),
  getPositions: (limit?: number) =>
    fetcher(`/positions${limit ? `?limit=${limit}` : ''}`),
  getTrades: () => fetcher('/trades'),
  getAccountTotals: (lastHourlyMarker?: number) =>
    fetcher(`/account-totals${lastHourlyMarker ? `?lastHourlyMarker=${lastHourlyMarker}` : ''}`),
  getSinceInceptionValues: () => fetcher('/since-inception-values'),
  getLeaderboard: () => fetcher('/leaderboard'),
  getAnalytics: () => fetcher('/analytics'),
};
```

### 3. Transformation Layer

Normalize API payloads into app structures:

```typescript
// lib/utils/transformers.ts
export function transformPositionsData(apiData: any): Position[] {
  return apiData.positions.flatMap((model: any) =>
    Object.entries(model.positions).map(([symbol, pos]: [string, any]) => ({
      id: `${model.id}_${symbol}`,
      modelId: model.id,
      side: pos.quantity > 0 ? 'LONG' : 'SHORT',
      coin: symbol,
      leverage: pos.leverage,
      notional: Math.abs(pos.quantity * pos.current_price),
      entryPrice: pos.entry_price,
      currentPrice: pos.current_price,
      unrealizedPnL: pos.unrealized_pnl,
      exitPlan: {
        target: pos.exit_plan?.profit_target,
        stop: pos.exit_plan?.stop_loss,
        invalidCondition: pos.exit_plan?.invalidation_condition,
      },
      openedAt: new Date(pos.entry_time * 1000),
    }))
  );
}
```

### 4. Live Update Strategy

- **Prices**: refresh every 2 seconds
- **Positions**: refresh every 5 seconds
- **Trades**: refresh every 10 seconds
- **Charts**: refresh on demand / user action

### 5. Error Handling & Degradation

```typescript
export function usePositions() {
  const { data, error, isLoading } = useSWR('/api/positions', fetcher, {
    refreshInterval: 5000,
    onErrorRetry: (error, key, config, revalidate, { retryCount }) => {
      // Retry up to 3 times
      if (retryCount >= 3) return;
      // Wait 5 seconds before retrying
      setTimeout(() => revalidate({ retryCount }), 5000);
    },
  });

  return {
    positions: data ? transformPositionsData(data) : [],
    isLoading,
    isError: error,
  };
}
```

### 6. Model Catalog

Discovered automatically from the API:
- gpt-5
- claude-sonnet-4-5
- deepseek-chat-v3.1
- gemini-2-5-pro
- grok-4
- qwen3-max
- buynhold_btc (buy-and-hold BTC benchmark)

## Implementation Roadmap

### Phase 1: Infrastructure (1-2 days)
- [x] Bootstrap Next.js project
- [x] Discover + document nof1.ai REST API
- [ ] Wire Tailwind CSS + shadcn/ui
- [ ] Define baseline TypeScript types
- [ ] Build core layout components
- [ ] Implement responsive header

### Phase 2: API Layer (1 day, simplified)
- [ ] Configure SWR defaults
- [ ] Ship API client (`lib/api/client.ts`)
- [ ] Implement seven data hooks:
  - useCryptoPrices, usePositions, useTrades
  - useAccountTotals, useSinceInception
  - useLeaderboard, useAnalytics
- [ ] Add transformer functions
- [ ] Add error handling and retry logic

### Phase 3: Home Page (2-3 days)
- [ ] Price ticker
- [ ] Account value chart (Recharts)
- [ ] Chart controls (range/value toggles)
- [ ] Tab container
- [ ] README tab content

### Phase 4: Positions (2 days)
- [ ] Positions table
- [ ] Model filter
- [ ] Exit plan modal
- [ ] Collapsible position cards
- [ ] PnL color coding

### Phase 5: ModelChat (2 days)
- [ ] Chat timeline
- [ ] Role-aware message formatting
- [ ] Prompt showcase panel
- [ ] Decision callouts
- [ ] Auto-scroll to latest message

### Phase 6: Completed Trades (1 day)
- [ ] Trades list
- [ ] Model filters
- [ ] Trade detail view
- [ ] PnL computation display

### Phase 7: Leaderboard (1-2 days)
- [ ] Leaderboard table
- [ ] Rank visualization
- [ ] Winner highlight card
- [ ] Summary charts
- [ ] Advanced analytics tab

### Phase 8: Motion & Polish (1 day)
- [ ] Page transitions
- [ ] Data update cues
- [ ] Performance pass
- [ ] Mobile refinement

### Phase 9: Live Simulation (1 day)
- [ ] Real-time price updates
- [ ] Live PnL recalcs
- [ ] New trade animations
- [ ] Chart live updates

### Phase 10: Finish & Ship (1 day)
- [ ] UI refinements
- [ ] Terminal styling
- [ ] SEO prep
- [ ] Vercel deployment
- [ ] README polish

**Total: 10-12 days**, saving 2-3 days versus a mock-data approach.

## Key Technical Pieces

### 1. Live Price Ticker
```typescript
// CSS animation or Framer Motion
// infinite marquee
```

### 2. Account Value Chart

**Data**: `/api/since-inception-values`

**Approach**:
1. Fetch via SWR every 10 seconds
2. Transform to Recharts-friendly series
3. Support range filters (ALL / 72H)
4. Toggle currency vs percentage
5. Distinct colors per model
6. Sample when >1000 points

**Features**:
- Multi-line chart (one per model)
- Time axis (X) vs value/% (Y)
- Tooltip on hover
- Legend toggles
- Responsive container

### 3. PnL Color Helper
```typescript
const getPnLColor = (value: number) => {
  if (value > 0) return 'text-green-500';
  if (value < 0) return 'text-red-500';
  return 'text-gray-400';
};
```

### 4. Terminal Styling
```css
/* CRT scanline effect */
.terminal-effect {
  background:
    linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%),
    linear-gradient(90deg, rgba(255, 0, 0, 0.06), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.06));
  background-size: 100% 2px, 3px 100%;
}

/* Blinking caret */
@keyframes blink {
  50% { opacity: 0; }
}
```

## Future Enhancements

1. **Backend readiness**
   - API contracts
   - WebSocket real-time feeds
   - Exchange integration

2. **Advanced capabilities**
   - Model comparisons
   - Backtests
   - Risk metrics
   - Custom AI models

3. **User features**
   - Accounts
   - Favorites
   - Notifications

## Design Reference

### Palette
```
Primary: #7c3aed (purple – brand)
Secondary: #3b82f6 (blue)
Success: #10b981 (green – profit)
Danger: #ef4444 (red – loss)
Background: #0a0a0a (deep background)
Surface: #1a1a1a (card surface)
Text: #e5e5e5 (primary text)
Text Muted: #737373 (secondary text)
```

### Typography
```
Monospace: 'JetBrains Mono', 'Fira Code', monospace
Sans: 'Inter', 'Helvetica Neue', sans-serif
```

## Closing Notes

This plan maps the full MVP path for nof0 with a sharp focus on surfacing AI trading agent insights.

### Core Advantages

1. **Real data**
   - Direct access to nof1.ai’s public REST API
   - No mock layer to maintain
   - Live AI trading data in sync
   - Saves 2-3 days of fabrication

2. **Modern stack**
   - Next.js + TypeScript + Tailwind CSS
   - SWR for data fetching and caching
   - shadcn/ui for polished components
   - Recharts for pro-grade charts

3. **Rapid iteration**
   - API schemas already known
   - No backend dependency
   - Focus on UI/UX polish
   - Easy to debug and test

4. **Production ready**
   - Realtime updates
   - Robust error handling
   - Performance strategies baked in
   - Deployable as-is

### Design Direction

Blend CoinGecko’s compact finance UI with nof1.ai’s terminal aesthetic to deliver a professional, modern AI trading dashboard.

### Next Steps

1. Kick off Phase 1 — finalize infrastructure
2. Finish Phase 2 — lock down the API layer
3. Prioritize core experiences — Positions and Logic
4. Iterate on UX polish

**Estimated 10-12 days for a feature-complete MVP!**
