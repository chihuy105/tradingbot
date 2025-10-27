# nof1.ai API Discovery Document

## Overview

Through browser network analysis, we learned that nof1.ai exposes a complete public REST API that can be consumed directly from the frontend—no mock data required!

## API Endpoint Catalog

### Base URL
```
https://nof1.ai/api
```

### 1. Crypto Prices
**Endpoint**: `/crypto-prices`
**Method**: GET
**Refresh cadence**: every 2-5 seconds

**Sample response**:
```json
{
  "prices": {
    "BTC": { "symbol": "BTC", "price": 108199.5, "timestamp": 1761151919417 },
    "ETH": { "symbol": "ETH", "price": 3832.05, "timestamp": 1761151919417 },
    "SOL": { "symbol": "SOL", "price": 183.635, "timestamp": 1761151919417 },
    "BNB": { "symbol": "BNB", "price": 1074.35, "timestamp": 1761151919417 },
    "DOGE": { "symbol": "DOGE", "price": 0.191425, "timestamp": 1761151919417 },
    "XRP": { "symbol": "XRP", "price": 2.3914, "timestamp": 1761151919417 }
  },
  "serverTime": 1761151919417
}
```

### 2. Position Details
**Endpoint**: `/positions`
**Method**: GET
**Params**: `?limit=1000` (optional)
**Refresh cadence**: every 5-10 seconds

**Key fields**:
- `exit_plan`: contains `profit_target`, `stop_loss`, `invalidation_condition`
- `unrealized_pnl`: unrealized profit or loss
- `leverage`: leverage multiplier
- `confidence`: model confidence (0-1)
- `risk_usd`: risk exposure in USD

### 3. Trade History
**Endpoint**: `/trades`
**Method**: GET
**Refresh cadence**: every 10-30 seconds

**Key fields**:
- `realized_net_pnl`: net PnL after fees
- `realized_gross_pnl`: gross PnL
- `total_commission_dollars`: total fees
- `entry_human_time`, `exit_human_time`: human-readable timestamps

### 4. Account Totals
**Endpoint**: `/account-totals`
**Method**: GET
**Params**: `?lastHourlyMarker=114` (optional, incremental fetch)
**Refresh cadence**: every 5-10 seconds

**Purpose**: fetch the richest position payload with all fields included

### 5. Since-Inception Values
**Endpoint**: `/since-inception-values`
**Method**: GET
**Purpose**: drive the account value history chart

**Sample response**:
```json
{
  "serverTime": 1761151919417,
  "sinceInceptionValues": [
    {
      "id": "uuid",
      "nav_since_inception": 10000,
      "inception_date": 1760738409.834185,
      "num_invocations": 0,
      "model_id": "gpt-5"
    }
  ]
}
```

### 6. Leaderboard Data
**Endpoint**: `/leaderboard`
**Method**: GET
**Purpose**: retrieve leaderboard statistics for every model

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
- `win_dollars`: aggregate gains
- `lose_dollars`: aggregate losses
- `num_wins`: winning trades
- `num_losses`: losing trades
- `sharpe`: Sharpe ratio
- `return_pct`: return percentage
- `equity`: current account value

### 7. Advanced Analytics
**Endpoint**: `/analytics`
**Method**: GET
**Purpose**: pull detailed analytics and stats per model

**Response tables**:
- `fee_pnl_moves_breakdown_table`: fees and PnL breakdown
- `winners_losers_breakdown_table`: winners versus losers
- `signals_breakdown_table`: signal counts (long/short/hold)
- `longs_shorts_breakdown_table`: long-short allocation
- `overall_trades_overview_table`: overall trade summary
- `invocation_breakdown_table`: invocation frequency

**Key fields**:
- `avg_holding_period_mins`: average holding period (minutes)
- `median_holding_period_mins`: median holding period
- `avg_size_of_trade_notional`: average trade notional
- `median_size_of_trade_notional`: median trade notional
- `avg_convo_leverage`: average leverage
- `median_convo_leverage`: median leverage
- `avg_confidence`: average confidence
- `median_confidence`: median confidence
- `long_short_trades_ratio`: long-to-short ratio
- `win_rate`: win rate (percentage)

## AI Model List

Model IDs identified from the API:
- `gpt-5`
- `claude-sonnet-4-5`
- `deepseek-chat-v3.1`
- `gemini-2-5-pro`
- `grok-4`
- `qwen3-max`
- `buynhold_btc` (BTC buy-and-hold benchmark)

## Implementation Ideas

### Fetching with SWR

```typescript
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then(r => r.json());

// Price feed - refresh every 2 seconds
export function useCryptoPrices() {
  return useSWR('https://nof1.ai/api/crypto-prices', fetcher, {
    refreshInterval: 2000,
    revalidateOnFocus: true,
  });
}

// Positions - refresh every 5 seconds
export function usePositions() {
  return useSWR('https://nof1.ai/api/positions?limit=1000', fetcher, {
    refreshInterval: 5000,
    dedupingInterval: 2000,
  });
}

// Trades - refresh every 10 seconds
export function useTrades() {
  return useSWR('https://nof1.ai/api/trades', fetcher, {
    refreshInterval: 10000,
  });
}
```

### CORS Configuration

The API accepts cross-origin requests, so no proxy layer is required. Calls can originate directly from the frontend.

### Error Handling

```typescript
export function usePositions() {
  const { data, error, isLoading } = useSWR(
    'https://nof1.ai/api/positions?limit=1000',
    fetcher,
    {
      refreshInterval: 5000,
      onErrorRetry: (error, key, config, revalidate, { retryCount }) => {
        if (retryCount >= 3) return; // stop after 3 retries
        setTimeout(() => revalidate({ retryCount }), 5000); // try again after 5 seconds
      },
    }
  );

  return {
    positions: data?.positions || [],
    isLoading,
    isError: error,
  };
}
```

## Data Characteristics

### Exit Plan Structure
Every position includes a detailed exit plan:
```typescript
interface ExitPlan {
  profit_target: number;        // take-profit price
  stop_loss: number;            // stop-loss price
  invalidation_condition: string; // description of the invalidation trigger
}
```

Example invalidation rules:
- "BTC breaks below 105,000, confirming deeper market correction"
- "Close if a 4h candle closes > 2.455 (20EMA + 1xATR14) AND the 4h MACD histogram turns >= 0"

### Timestamp Format
- The API returns Unix timestamps (seconds)
- Convert with `new Date(timestamp * 1000)`

### Position Side Detection
```typescript
const side = position.quantity > 0 ? 'LONG' : 'SHORT';
```

## MVP Benefits

1. **Real data**: production AI trading data, no fabrication
2. **Time savings**: avoid 2-3 days of mock data setup
3. **Live updates**: real-time state automatically reflected
4. **Easy validation**: observe actual model performance
5. **Production ready**: ship the same stack you build

## Caveats

1. **API stability**: public API; nof1.ai could change it at any time
2. **Rate limits**: none observed, but throttle responsibly
3. **Data consistency**: expect slight timing gaps across endpoints
4. **Model naming**: map internal IDs to display names

## Useful Links

- [nof1.ai website](https://nof1.ai)
- [PLAN.md – full implementation plan](./PLAN.md)
- [SWR docs](https://swr.vercel.app/)

---

**Last updated**: 2025-10-23
**Discoverer**: Claude Code (via browser network analysis)
