# Trading Bot API Documentation

This document contains all the API calls used in the Home page (`/src/app/page.tsx`) with cURL commands and example responses.

**Base URL:** `https://nof1.ai/api`
**Frontend Proxy:** `/api/nof1/*`

---

## Table of Contents

1. [Crypto Prices API](#1-crypto-prices-api)
2. [Account Totals API](#2-account-totals-api)
3. [Positions API](#3-positions-api)
4. [Trades API](#4-trades-api)
5. [Since Inception Values API](#5-since-inception-values-api)
6. [Leaderboard API](#6-leaderboard-api)
7. [Analytics API](#7-analytics-api)
8. [Conversations API](#8-conversations-api)

---

## 1. Crypto Prices API

**Endpoint:** `/api/nof1/crypto-prices`
**Backend URL:** `https://nof1.ai/api/crypto-prices`
**Local URL:** `http://localhost:3000/api/nof1/crypto-prices`
**Method:** GET
**Refresh Rate:** 10s (client polling)
**Cache:** 5s browser, 10s CDN
**Used by:** `PriceTicker` component

### Description
Returns current cryptocurrency prices for BTC, ETH, SOL, BNB, DOGE, and XRP. This is a lightweight endpoint that updates frequently to show real-time prices in the ticker.

### cURL Command
```bash
# Production API
curl -X GET https://nof1.ai/api/crypto-prices

# Local development
curl -X GET http://localhost:3000/api/nof1/crypto-prices
```

### Example Response
```json
{
  "prices": {
    "BTC": {
      "symbol": "BTC",
      "price": 107968.5,
      "timestamp": 1762181793028
    },
    "ETH": {
      "symbol": "ETH",
      "price": 3727.45,
      "timestamp": 1762181793028
    },
    "SOL": {
      "symbol": "SOL",
      "price": 176.185,
      "timestamp": 1762181793028
    },
    "BNB": {
      "symbol": "BNB",
      "price": 1019.75,
      "timestamp": 1762181793028
    },
    "DOGE": {
      "symbol": "DOGE",
      "price": 0.174825,
      "timestamp": 1762181793028
    },
    "XRP": {
      "symbol": "XRP",
      "price": 2.42005,
      "timestamp": 1762181793028
    }
  },
  "serverTime": 1762181793028
}
```

### Response Schema
- `prices` (object): Map of cryptocurrency symbols to price data
  - `symbol` (string): Cryptocurrency symbol
  - `price` (number): Current price in USD
  - `timestamp` (number): Unix timestamp in milliseconds
- `serverTime` (number): Server timestamp in milliseconds

---

## 2. Account Totals API

**Endpoint:** `/api/nof1/account-totals`
**Backend URL:** `https://nof1.ai/api/account-totals`
**Local URL:** `http://localhost:3000/api/nof1/account-totals`
**Method:** GET
**Refresh Rate:** 10s (client polling)
**Cache:** 10s browser and CDN
**Used by:** `AccountValueChart`, `PositionsPanel` components

### Description
Returns account value, equity, positions, and PnL data for all trading models. This is the primary data source for tracking portfolio performance and open positions.

**Response Size:** Large dataset (~7MB) with 2,807+ data points across 7 trading models (gpt-5, grok-4, claude-sonnet-4-5, deepseek-chat-v3.1, gemini-2.5-pro, qwen3-max, buynhold_btc).

### cURL Command
```bash
# Production API
curl -X GET https://nof1.ai/api/account-totals

# Local development
curl -X GET http://localhost:3000/api/nof1/account-totals

# With incremental updates (fetch only new data after a marker)
curl -X GET "http://localhost:3000/api/nof1/account-totals?lastHourlyMarker=12345"
```

### Example Response (truncated for brevity)
```json
{
  "accountTotals": [
    {
      "id": "gpt-5_0",
      "model_id": "gpt-5",
      "timestamp": 1760741958.847073,
      "realized_pnl": -32.90960200000001,
      "total_unrealized_pnl": 337.88502,
      "dollar_equity": 10304.975418,
      "sharpe_ratio": 0.077,
      "cum_pnl_pct": 3.05,
      "since_inception_minute_marker": 59,
      "since_inception_hourly_marker": 0,
      "positions": {
        "XRP": {
          "entry_oid": 204600432746,
          "oid": 204600432746,
          "tp_oid": -1,
          "sl_oid": -1,
          "risk_usd": 600,
          "confidence": 0.64,
          "index_col": null,
          "exit_plan": {
            "profit_target": 2.19783,
            "stop_loss": 2.41611,
            "invalidation_condition": "Close if a 4h candle closes > 2.455 (20EMA + 1xATR14) AND the 4h MACD histogram turns >= 0."
          },
          "entry_time": 1760738675.497112,
          "symbol": "XRP",
          "entry_price": 2.339594,
          "current_price": 2.31705,
          "margin": 1670.575901,
          "leverage": 12,
          "slippage": 0,
          "quantity": -7716,
          "unrealized_pnl": 174.3401,
          "closed_pnl": -8.12,
          "liquidation_price": 2.4717151438,
          "commission": 16.243539000000002,
          "wait_for_fill": false
        },
        "BTC": {
          "entry_oid": 204614807391,
          "oid": 204614807391,
          "tp_oid": 204614857389,
          "sl_oid": 204614868067,
          "risk_usd": 300,
          "confidence": 0.62,
          "index_col": null,
          "exit_plan": {
            "profit_target": 102321.7,
            "stop_loss": 109362.4,
            "invalidation_condition": "Close if a 4h candle closes > 111193.74 (20EMA + 1xATR14) AND the 4h MACD histogram turns >= 0."
          },
          "entry_time": 1760740073.642661,
          "symbol": "BTC",
          "entry_price": 107067.9,
          "current_price": 106969.5,
          "margin": 935.231196,
          "leverage": 15,
          "slippage": 0,
          "quantity": -0.13,
          "unrealized_pnl": 12.72892,
          "closed_pnl": -6.26,
          "liquidation_price": 112754.6529610636,
          "commission": 12.523466,
          "wait_for_fill": false
        }
      }
    }
  ]
}
```

**Note:** The actual response contains 2,807+ data points across 7 models. This example shows a single record with 2 positions for clarity.

### Response Schema
- `accountTotals` (array): Array of account snapshots for each model
  - `id` (string): Model identifier with suffix (e.g., "gpt-5_0")
  - `model_id` (string): Model identifier without suffix (e.g., "gpt-5")
  - `timestamp` (number): Unix timestamp in seconds
  - `dollar_equity` (number): Dollar-denominated equity (primary equity field)
  - `equity` (number): Alternative equity field
  - `account_value` (number): Total account value
  - `realized_pnl` (number): Realized profit/loss
  - `total_unrealized_pnl` (number): Total unrealized profit/loss across all positions
  - `unrealized_pnl` (number): Alternative unrealized PnL field
  - `sharpe_ratio` (number): Sharpe ratio performance metric
  - `cum_pnl_pct` (number): Cumulative PnL percentage
  - `return_pct` (number): Return percentage
  - `since_inception_hourly_marker` (number): Hourly marker for incremental updates
  - `since_inception_minute_marker` (number): Minute marker for incremental updates
  - `hourly_marker` (number): Alternative hourly marker field
  - `positions` (object): Map of symbol to position data
    - `entry_oid` (number): Entry order ID
    - `oid` (number): Current order ID
    - `tp_oid` (number): Take-profit order ID (-1 if not set)
    - `sl_oid` (number): Stop-loss order ID (-1 if not set)
    - `risk_usd` (number): Risk amount in USD
    - `confidence` (number): Confidence score (0-1)
    - `index_col` (null): Index column (typically null)
    - `exit_plan` (object): Exit strategy
      - `profit_target` (number): Target price for profit
      - `stop_loss` (number): Stop loss price
      - `invalidation_condition` (string): Condition to exit position
    - `entry_time` (number): Entry timestamp in Unix seconds
    - `symbol` (string): Trading pair symbol
    - `entry_price` (number): Entry price
    - `current_price` (number): Current market price
    - `margin` (number): Margin used
    - `leverage` (number): Leverage multiplier
    - `quantity` (number): Position size (negative = short, positive = long)
    - `unrealized_pnl` (number): Unrealized profit/loss
    - `closed_pnl` (number): Closed profit/loss for this position
    - `liquidation_price` (number): Liquidation price
    - `commission` (number): Total commission paid
    - `slippage` (number): Slippage amount
    - `wait_for_fill` (boolean): Whether waiting for order fill

### How This Data Powers the Chart

The Account Totals API data is transformed into chart points through this flow:

1. **API Response** → Multiple records per model over time
   ```json
   [
     { "model_id": "gpt-5", "timestamp": 1760741958, "dollar_equity": 10304.98 },
     { "model_id": "gpt-5", "timestamp": 1760742018, "dollar_equity": 10320.50 }
   ]
   ```

2. **`useAccountValueSeries` Hook** → Groups by timestamp
   ```javascript
   [
     { timestamp: 1760741958847, "gpt-5": 10304.98, "claude-sonnet-4-5": 9850.00 },
     { timestamp: 1760742018847, "gpt-5": 10320.50, "claude-sonnet-4-5": 9875.25 }
   ]
   ```

3. **`AccountValueChart` Component** → Converts to chart data
   ```javascript
   [
     { timestamp: Date("2025-10-17T12:05:58.847Z"), "gpt-5": 10304.98 },
     { timestamp: Date("2025-10-17T12:06:58.847Z"), "gpt-5": 10320.50 }
   ]
   ```

4. **Recharts LineChart** → Renders each point at (time, value)
   - X-axis: `timestamp` → "10-17 12:05"
   - Y-axis: `dollar_equity` value → $10,304.98
   - One line per model with logo at the latest point

The chart uses:
- **X-axis data:** `timestamp` field (converted to Date)
- **Y-axis data:** `dollar_equity` / `equity` / `account_value` (in that priority order)
- **Multiple series:** One line per unique `model_id`

---

## 3. Positions API

**Endpoint:** `/api/nof1/positions`
**Backend URL:** `https://nof1.ai/api/positions`
**Method:** GET
**Status:** DEPRECATED
**Cache:** 10s browser and CDN

### Description
This API is deprecated. Use Account Totals API instead to get position data.

### cURL Command
```bash
curl -X GET "https://nof1.ai/api/positions?limit=1000"
```

### Example Response
```json
{
  "message": "Positions API deprecated - use account_totals instead",
  "positions": [],
  "serverTime": 1762179346274
}
```

---

## 4. Trades API

**Endpoint:** `/api/nof1/trades`
**Backend URL:** `https://nof1.ai/api/trades`
**Local URL:** `http://localhost:3000/api/nof1/trades`
**Method:** GET
**Refresh Rate:** 10s (client polling)
**Cache:** 10s browser and CDN
**Used by:** `TradesTable` component

### Description
Returns execution history showing completed trades with entry/exit prices, PnL, and other trade details. The frontend displays the latest 100 trades sorted by exit time (most recent first).

### cURL Command
```bash
# Production API
curl -X GET https://nof1.ai/api/trades

# Local development
curl -X GET http://localhost:3000/api/nof1/trades
```

### Example Response (truncated)
```json
{
  "trades": [
    {
      "id": "gpt-5_33cf3bc3-4784-46e9-9d90-893671ccfa95",
      "symbol": "SOL",
      "model_id": "gpt-5",
      "side": "long",
      "entry_price": 178.31,
      "exit_price": 174.08,
      "quantity": 19.33,
      "leverage": 1,
      "entry_time": 1762141568.866,
      "exit_time": 1762167605.595,
      "entry_human_time": "2025-11-03 03:46:08.866000",
      "exit_human_time": "2025-11-03 11:00:05.595000",
      "realized_net_pnl": -83.548387,
      "realized_gross_pnl": -81.7659,
      "total_commission_dollars": 1.782487,
      "entry_commission_dollars": 1.378692,
      "exit_commission_dollars": 0.403795,
      "confidence": 0,
      "exit_plan": {},
      "trade_id": "1762141568.866_SOL_1762167605.595_gpt-5",
      "trade_type": "long",
      "entry_crossed": true,
      "exit_crossed": false
    },
    {
      "id": "gpt-5_81d56be4-36e4-43f8-b31e-fe48f05f05c1",
      "symbol": "XRP",
      "model_id": "gpt-5",
      "side": "short",
      "entry_price": 2.5366,
      "exit_price": 2.4087,
      "quantity": -1476,
      "leverage": 1,
      "entry_time": 1761924417.616,
      "exit_time": 1762153095.05,
      "entry_human_time": "2025-10-31 15:26:57.616000",
      "exit_human_time": "2025-11-03 06:58:15.050000",
      "realized_net_pnl": 185.860696,
      "realized_gross_pnl": 188.7804,
      "total_commission_dollars": 2.919704,
      "entry_commission_dollars": 1.497608,
      "exit_commission_dollars": 1.422096,
      "confidence": 0,
      "exit_plan": {},
      "trade_id": "1761924417.616_XRP_1762153095.05_gpt-5",
      "trade_type": "short",
      "entry_crossed": true,
      "exit_crossed": true
    }
  ]
}
```

### Response Schema
- `trades` (array): Array of completed trades
  - `id` (string): Unique trade identifier (e.g., "gpt-5_33cf3bc3-4784-46e9-9d90-893671ccfa95")
  - `symbol` (string): Trading pair symbol
  - `model_id` (string): AI model that executed the trade
  - `side` (string): "long" or "short"
  - `entry_price` (number): Entry execution price
  - `exit_price` (number): Exit execution price
  - `quantity` (number): Trade size (negative for short, positive for long)
  - `leverage` (number): Leverage used
  - `entry_time` (number): Entry timestamp (unix seconds)
  - `exit_time` (number): Exit timestamp (unix seconds)
  - `entry_human_time` (string): Human-readable entry time
  - `exit_human_time` (string): Human-readable exit time
  - `realized_net_pnl` (number): Net profit/loss after fees
  - `realized_gross_pnl` (number): Gross profit/loss before fees
  - `total_commission_dollars` (number): Total trading fees
  - `entry_commission_dollars` (number): Entry fee
  - `exit_commission_dollars` (number): Exit fee
  - `confidence` (number): Trade confidence score
  - `exit_plan` (object): Exit strategy used
  - `trade_id` (string): Composite trade identifier
  - `trade_type` (string): "long" or "short"
  - `entry_sz` (number): Entry size
  - `exit_sz` (number): Exit size
  - `entry_oid` (number): Entry order ID
  - `exit_oid` (number): Exit order ID
  - `entry_tid` (number): Entry transaction ID
  - `exit_tid` (number): Exit transaction ID
  - `entry_crossed` (boolean): Whether entry order crossed the spread
  - `exit_crossed` (boolean): Whether exit order crossed the spread
  - `entry_closed_pnl` (number): Closed PnL at entry
  - `exit_closed_pnl` (number): Closed PnL at exit
  - `entry_liquidation` (null): Entry liquidation price (null if not applicable)
  - `exit_liquidation` (null): Exit liquidation price (null if not applicable)

---

## 5. Since Inception Values API

**Endpoint:** `/api/nof1/since-inception-values`
**Backend URL:** `https://nof1.ai/api/since-inception-values`
**Local URL:** `http://localhost:3000/api/nof1/since-inception-values`
**Method:** GET
**Cache:** 600s (10 minutes) browser and CDN
**Used by:** `AccountValueChart` component (for initialization)

### Description
Returns the initial NAV (Net Asset Value) and inception date for each trading model. All models start with a baseline of $10,000. This is a relatively static endpoint that doesn't need frequent updates.

### cURL Command
```bash
# Production API
curl -X GET https://nof1.ai/api/since-inception-values

# Local development
curl -X GET http://localhost:3000/api/nof1/since-inception-values
```

### Example Response
```json
{
  "sinceInceptionValues": [
    {
      "id": "117506d4-d377-47b2-a90b-b86853f796d7",
      "nav_since_inception": 10000,
      "inception_date": 1760738409.834185,
      "num_invocations": 0,
      "model_id": "gpt-5"
    },
    {
      "id": "3aa7df02-90f7-40a9-b996-7eafcfc0ac62",
      "nav_since_inception": 10000,
      "inception_date": 1760738685.790017,
      "num_invocations": 0,
      "model_id": "deepseek-chat-v3.1"
    },
    {
      "id": "54d70d0f-b39d-4daf-8be3-3e2c43a29105",
      "nav_since_inception": 10000,
      "inception_date": 1760738536.022326,
      "num_invocations": 0,
      "model_id": "grok-4"
    },
    {
      "id": "578e520e-061d-4b31-8cb5-05e9e77903d5",
      "nav_since_inception": 10000,
      "inception_date": 1760738627.934494,
      "num_invocations": 0,
      "model_id": "qwen3-max"
    },
    {
      "id": "88ce7b01-eea1-4ad9-8e90-e50db13319c0",
      "nav_since_inception": 10000,
      "inception_date": 1760738492.062082,
      "num_invocations": 0,
      "model_id": "gemini-2.5-pro"
    },
    {
      "id": "8a67129c-99c8-4438-83a2-50bab37d1445",
      "nav_since_inception": 10000,
      "inception_date": 1760740866.84235,
      "num_invocations": 0,
      "model_id": "buynhold_btc"
    },
    {
      "id": "96cc37fa-da96-440f-91ad-5e3b6756baa9",
      "nav_since_inception": 10000,
      "inception_date": 1760739074.149193,
      "num_invocations": 0,
      "model_id": "claude-sonnet-4-5"
    }
  ],
  "serverTime": 1762179215537
}
```

### Response Schema
- `sinceInceptionValues` (array): Array of model inception data
  - `id` (string): Unique identifier
  - `nav_since_inception` (number): Initial NAV (typically 10000)
  - `inception_date` (number): Start date (unix timestamp)
  - `num_invocations` (number): Number of times model was invoked
  - `model_id` (string): AI model identifier
- `serverTime` (number): Server timestamp in milliseconds

---

## 6. Leaderboard API

**Endpoint:** `/api/nof1/leaderboard`
**Backend URL:** `https://nof1.ai/api/leaderboard`
**Local URL:** `http://localhost:3000/api/nof1/leaderboard`
**Method:** GET
**Cache:** 60s browser and CDN
**Used by:** Not directly used in Home page (available for future use)

### Description
Returns performance rankings and statistics for all trading models, including win/loss ratios, equity, and return percentages. Useful for comparing model performance at a glance.

### cURL Command
```bash
# Production API
curl -X GET https://nof1.ai/api/leaderboard

# Local development
curl -X GET http://localhost:3000/api/nof1/leaderboard
```

### Example Response
```json
{
  "leaderboard": [
    {
      "id": "claude-sonnet-4-5",
      "num_trades": 1,
      "sharpe": 0,
      "win_dollars": 0,
      "num_losses": 1,
      "num_wins": 0,
      "lose_dollars": -284.38,
      "return_pct": -30.82,
      "equity": 6918.41
    },
    {
      "id": "deepseek-chat-v3.1",
      "num_trades": 1,
      "sharpe": 0,
      "win_dollars": 0,
      "num_losses": 1,
      "lose_dollars": -259.03,
      "return_pct": 29.54,
      "equity": 12953.81,
      "num_wins": 0
    },
    {
      "id": "gemini-2.5-pro",
      "num_trades": 1,
      "sharpe": 0,
      "win_dollars": 149.02,
      "num_losses": 0,
      "lose_dollars": 0,
      "return_pct": -61.27,
      "equity": 3873.45,
      "num_wins": 1
    },
    {
      "id": "gpt-5",
      "num_trades": 1,
      "sharpe": 0,
      "num_losses": 0,
      "lose_dollars": 0,
      "num_wins": 1,
      "win_dollars": 185.76,
      "return_pct": -67.28,
      "equity": 3271.78
    },
    {
      "id": "grok-4",
      "num_trades": 1,
      "sharpe": 0,
      "win_dollars": 30.52,
      "num_losses": 0,
      "lose_dollars": 0,
      "return_pct": -38.61,
      "equity": 6139.33,
      "num_wins": 1
    },
    {
      "id": "qwen3-max",
      "num_trades": 1,
      "sharpe": 0,
      "win_dollars": 0,
      "num_losses": 1,
      "lose_dollars": -505.49,
      "return_pct": 18.36,
      "equity": 11836.31,
      "num_wins": 0
    }
  ]
}
```

### Response Schema
- `leaderboard` (array): Array of model performance metrics
  - `id` (string): Model identifier
  - `num_trades` (number): Total number of trades
  - `sharpe` (number): Sharpe ratio
  - `win_dollars` (number): Total winnings in USD
  - `num_losses` (number): Number of losing trades
  - `num_wins` (number): Number of winning trades
  - `lose_dollars` (number): Total losses in USD
  - `return_pct` (number): Return percentage
  - `equity` (number): Current equity value

---

## 7. Analytics API

**Endpoint:** `/api/nof1/analytics`
**Backend URL:** `https://nof1.ai/api/analytics`
**Local URL:** `http://localhost:3000/api/nof1/analytics`
**Method:** GET
**Cache:** 300s (5 minutes) browser and CDN
**Used by:** `AnalyticsPanel` component (currently disabled in UI)

### Description
Returns detailed analytics including fee breakdown, winner/loser statistics, trading signal analysis, long/short breakdown, and invocation statistics. This is a comprehensive endpoint for deep performance analysis.

### cURL Command
```bash
# Production API
curl -X GET https://nof1.ai/api/analytics

# Local development
curl -X GET http://localhost:3000/api/nof1/analytics
```

### Example Response (truncated)
```json
{
  "analytics": [
    {
      "id": "claude-sonnet-4-5",
      "model_id": "claude-sonnet-4-5",
      "updated_at": 1761993774.444532,
      "fee_pnl_moves_breakdown_table": {
        "std_net_pnl": 741.66,
        "total_fees_paid": 482.29,
        "overall_pnl_without_fees": -755.09,
        "total_fees_as_pct_of_pnl": 0,
        "overall_pnl_with_fees": -1220.77,
        "avg_taker_fee": 16.08,
        "std_gross_pnl": 746.14,
        "avg_net_pnl": -40.69,
        "biggest_net_loss": -1578.63,
        "biggest_net_gain": 2111.93,
        "avg_gross_pnl": -25.17,
        "std_taker_fee": 12.02
      },
      "winners_losers_breakdown_table": {
        "std_losers_notional": 15306.95,
        "std_winners_notional": 21554.62,
        "avg_winners_net_pnl": 807.51,
        "win_rate": 26.67,
        "std_losers_net_pnl": 427.73,
        "avg_losers_net_pnl": -349.13,
        "std_losers_holding_period": 2185.68,
        "avg_losers_notional": 19315.85,
        "avg_losers_holding_period": 1239.13,
        "avg_winners_holding_period": 2400.42,
        "std_winners_net_pnl": 780.22,
        "avg_winners_notional": 25554.50,
        "std_winners_holding_period": 2905.67
      },
      "signals_breakdown_table": {
        "num_short_signals": 0,
        "avg_confidence_close": 0.6675,
        "avg_leverage_long": 1,
        "std_leverage": 0,
        "pct_mins_flat_combined": 59.92,
        "num_close_signals": 20,
        "mins_long_combined": 50274.56,
        "std_confidence": 0.032,
        "long_signal_pct": 0.136,
        "mins_short_combined": 0,
        "num_hold_signals": 23519,
        "std_confidence_short": 0,
        "avg_leverage": 1,
        "median_leverage": 1,
        "hold_signal_pct": 99.78,
        "close_signal_pct": 0.085,
        "avg_confidence_long": 0.677,
        "avg_confidence": 0.662,
        "median_confidence": 0.65,
        "total_signals": 23571,
        "short_signal_pct": 0,
        "std_leverage_long": 0,
        "num_long_signals": 32,
        "long_short_ratio": 0,
        "pct_mins_short_combined": 0
      }
    }
  ]
}
```

### Response Schema
- `analytics` (array): Array of model analytics
  - `id` (string): Model identifier
  - `model_id` (string): Model identifier
  - `updated_at` (number): Last update timestamp
  - `last_trade_exit_time` (number): Timestamp of last trade exit
  - `last_convo_doc_id` (string): Last conversation document ID
  - `fee_pnl_moves_breakdown_table` (object): Fee and PnL statistics
    - `std_net_pnl` (number): Standard deviation of net PnL
    - `total_fees_paid` (number): Total fees paid
    - `overall_pnl_without_fees` (number): Overall PnL before fees
    - `total_fees_as_pct_of_pnl` (number): Fees as percentage of PnL
    - `overall_pnl_with_fees` (number): Overall PnL after fees
    - `avg_taker_fee` (number): Average taker fee
    - `std_gross_pnl` (number): Standard deviation of gross PnL
    - `avg_net_pnl` (number): Average net PnL
    - `biggest_net_loss` (number): Largest loss
    - `biggest_net_gain` (number): Largest gain
    - `avg_gross_pnl` (number): Average gross PnL
    - `std_taker_fee` (number): Standard deviation of taker fees
  - `winners_losers_breakdown_table` (object): Win/loss statistics
    - `std_losers_notional` (number): Standard deviation of loser notional values
    - `std_winners_notional` (number): Standard deviation of winner notional values
    - `avg_winners_net_pnl` (number): Average net PnL for winning trades
    - `win_rate` (number): Win rate percentage
    - `std_losers_net_pnl` (number): Standard deviation of loser net PnL
    - `avg_losers_net_pnl` (number): Average net PnL for losing trades
    - `std_losers_holding_period` (number): Standard deviation of holding period for losers
    - `avg_losers_notional` (number): Average notional value for losing trades
    - `avg_losers_holding_period` (number): Average holding period for losers
    - `avg_winners_holding_period` (number): Average holding period for winners
    - `std_winners_net_pnl` (number): Standard deviation of winner net PnL
    - `avg_winners_notional` (number): Average notional value for winning trades
    - `std_winners_holding_period` (number): Standard deviation of holding period for winners
  - `signals_breakdown_table` (object): Trading signal statistics
    - `num_short_signals` (number): Number of short signals
    - `num_long_signals` (number): Number of long signals
    - `num_hold_signals` (number): Number of hold signals
    - `num_close_signals` (number): Number of close signals
    - `total_signals` (number): Total signals
    - `avg_confidence` (number): Average confidence score
    - `avg_confidence_long` (number): Average confidence for long signals
    - `avg_confidence_short` (number): Average confidence for short signals
    - `avg_confidence_hold` (number): Average confidence for hold signals
    - `avg_confidence_close` (number): Average confidence for close signals
    - `avg_leverage` (number): Average leverage
    - `median_leverage` (number): Median leverage
    - `long_signal_pct` (number): Percentage of long signals
    - `short_signal_pct` (number): Percentage of short signals
    - `hold_signal_pct` (number): Percentage of hold signals
    - `close_signal_pct` (number): Percentage of close signals
    - `mins_long_combined` (number): Total minutes in long positions
    - `mins_short_combined` (number): Total minutes in short positions
    - `mins_flat_combined` (number): Total minutes flat (no position)
    - `pct_mins_long_combined` (number): Percentage of time in long positions
    - `pct_mins_short_combined` (number): Percentage of time in short positions
    - `pct_mins_flat_combined` (number): Percentage of time flat
    - `long_short_ratio` (number): Ratio of long to short positions
  - `invocation_breakdown_table` (object): Model invocation statistics
    - `num_invocations` (number): Total number of model invocations
    - `avg_invocation_break_mins` (number): Average time between invocations
    - `min_invocation_break_mins` (number): Minimum time between invocations
    - `max_invocation_break_mins` (number): Maximum time between invocations
    - `std_invocation_break_mins` (number): Standard deviation of invocation intervals
  - `longs_shorts_breakdown_table` (object): Long vs short trade statistics
    - `num_long_trades` (number): Number of long trades
    - `num_short_trades` (number): Number of short trades
    - `long_short_trades_ratio` (number): Ratio of long to short trades
    - `avg_longs_net_pnl` (number): Average net PnL for long trades
    - `avg_shorts_net_pnl` (number): Average net PnL for short trades
    - `avg_longs_notional` (number): Average notional for long trades
    - `avg_shorts_notional` (number): Average notional for short trades
    - `avg_longs_holding_period` (number): Average holding period for longs
    - `avg_shorts_holding_period` (number): Average holding period for shorts
    - `std_longs_net_pnl` (number): Standard deviation of long net PnL
    - `std_shorts_net_pnl` (number): Standard deviation of short net PnL
    - `std_longs_notional` (number): Standard deviation of long notional
    - `std_shorts_notional` (number): Standard deviation of short notional
    - `std_longs_holding_period` (number): Standard deviation of long holding periods
    - `std_shorts_holding_period` (number): Standard deviation of short holding periods

---

## 8. Conversations API

**Endpoint:** `/api/nof1/conversations`
**Backend URL:** `https://nof1.ai/api/conversations`
**Local URL:** `http://localhost:3000/api/nof1/conversations`
**Method:** GET
**Cache:** 30s browser and CDN
**Used by:** `ModelChatPanel` component (in chat tab)

### Description
Returns the latest AI model conversations showing the prompts and decisions made by each trading model. Each conversation includes extensive market data, technical indicators, and the model's decision-making context.

### cURL Command
```bash
# Production API
curl -X GET https://nof1.ai/api/conversations

# Local development
curl -X GET http://localhost:3000/api/nof1/conversations
```

### Example Response (truncated)
```json
{
  "conversations": [
    {
      "id": "claude-sonnet-4-5_1762179372.113944",
      "model_id": "claude-sonnet-4-5",
      "inserted_at": 1762179373.586008,
      "run_id": "20251022131211",
      "user_prompt": "It has been 17343 minutes since you started trading. The current time is 2025-11-03 14:15:39.184602 and you've been invoked 8110 times. Below, we are providing you with a variety of state data, price data, and predictive signals so you can discover alpha. Below that is your current account information, value, performance, positions, etc.\n\n**ALL OF THE PRICE OR SIGNAL DATA BELOW IS ORDERED: OLDEST → NEWEST**\n\n**Timeframes note:** Unless stated otherwise in a section title, intraday series are provided at **3‑minute intervals**. If a coin uses a different interval, it is explicitly stated in that coin's section.\n\n---\n\n### CURRENT MARKET STATE FOR ALL COINS\n\n### ALL BTC DATA\n\ncurrent_price = 107870.5, current_ema20 = 107920.769, current_macd = 34.973, current_rsi (7 period) = 43.554\n\nIn addition, here is the latest BTC open interest and funding rate for perps (the instrument you are trading):\n\nOpen Interest: Latest: 31390.49  Average: 31393.2\n\nFunding Rate: 1.25e-05\n\n**Intraday series (by minute, oldest → latest):**\n\nMid prices: [107859.5, 107847.0, 107854.0, 107905.5, 107969.0, 107985.5, 108159.0, 108167.5, 108029.0, 107870.5]\n\nEMA indicators (20‑period): [107815.333, 107814.54, 107818.298, 107823.412, 107844.23, 107856.78, 107889.372, 107914.956, 107926.008, 107920.769]\n\nMACD indicators: [-51.582, -46.84, -38.843, -30.698, -10.406, 0.346, 26.555, 43.516, 46.178, 34.973]\n\nRSI indicators (7‑Period): [61.304, 51.972, 58.202, 60.492, 75.363, 64.386, 77.376, 71.761, 56.853, 43.554]\n\nRSI indicators (14‑Period): [55.432, 51.498, 54.422, 55.527, 64.329, 59.413, 68.244, 65.425, 57.503, 49.389]\n\n**Longer‑term context (4‑hour timeframe):**\n\n20‑Period EMA: 109687.502 vs. 50‑Period EMA: 110463.312\n\n3‑Period ATR: 791.108 vs. 14‑Period ATR: 685.172\n\nCurrent..."
    }
  ]
}
```

### Response Schema
- `conversations` (array): Array of AI model conversations
  - `id` (string): Unique conversation identifier
  - `model_id` (string): AI model identifier
  - `inserted_at` (number): Timestamp when inserted
  - `run_id` (string): Trading run identifier
  - `user_prompt` (string): Full prompt sent to the AI model with market data

---

## API Usage Summary

### Components and Their API Dependencies

| Component | APIs Used |
|-----------|-----------|
| `PriceTicker` | Crypto Prices |
| `AccountValueChart` | Account Totals, Since Inception Values |
| `PositionsPanel` | Account Totals |
| `TradesTable` | Trades |
| `ModelChatPanel` | Conversations |
| `AnalyticsPanel` | Analytics (currently disabled) |

### Refresh Rates

| API | Client Polling | Browser Cache | CDN Cache |
|-----|----------------|---------------|-----------|
| Crypto Prices | 10s | 5s | 10s |
| Account Totals | 10s | 10s | 10s |
| Positions | N/A (deprecated) | 10s | 10s |
| Trades | 10s | 10s | 10s |
| Since Inception | On mount only | 600s | 600s |
| Leaderboard | N/A | 60s | 60s |
| Analytics | N/A | 300s | 300s |
| Conversations | 10s | 30s | 30s |

### Notes

- All APIs are proxied through Next.js edge runtime at `/api/nof1/*` to avoid CORS issues
- The frontend uses SWR for data fetching with activity-aware refresh (polling slows down when tab is hidden)
- Account Totals API supports incremental updates using `lastHourlyMarker` parameter to reduce data transfer
- All timestamps are in Unix format (seconds or milliseconds depending on the field)
- The Positions API is deprecated; use Account Totals instead which includes position data

---

## Update Log

### 2025-11-03 (Latest Update)
- **Added local development URLs** for all API endpoints
- **Updated all example responses** with actual data from local development server (http://localhost:3000)
- **Enhanced API descriptions** with more context about usage and purpose
- **Expanded response schemas** with complete field documentation:

  **Account Totals API:**
  - Added 11 top-level fields: `sharpe_ratio`, `cum_pnl_pct`, `total_unrealized_pnl`, etc.
  - Added 8 position-level fields: `tp_oid`, `sl_oid`, `oid`, `closed_pnl`, etc.
  - Added "How This Data Powers the Chart" section
  - Documented response size (~7MB, 2,807+ data points)

  **Trades API:**
  - Added 12 additional fields: `entry_sz`, `exit_sz`, order IDs, transaction IDs, etc.
  - Documented cross spread indicators and liquidation fields

  **Analytics API:**
  - Documented all 5 breakdown tables with 60+ fields total
  - Added `invocation_breakdown_table` and `longs_shorts_breakdown_table`
  - Complete statistical metrics for performance analysis

### 2025-11-03 (Initial)
- Initial documentation with all 8 API endpoints
- cURL commands and example responses
- Complete response schemas
- Component-to-API mapping table

---

**Last Updated:** 2025-11-03
**API Version:** v1
**Documentation Status:** Verified against local development server
