---
name: okx-market-scan
description: Scan OKX markets (spot, perpetual swap, futures, options) for price, tickers, candles/OHLCV, order book depth, funding rates, open interest, mark price, index price, top movers, and technical indicators (RSI/MACD/EMA/Bollinger/KDJ/SuperTrend and 70+ more). Use this skill whenever the user asks about OKX specifically — "price of BTC on OKX", "OKX funding rate", "OKX top gainers", "OKX perp open interest", "is BILL listed on OKX", "OKX 1h candles SOL-USDT-SWAP". All operations are read-only and use public OKX v5 REST endpoints (no API credentials required). For Binance use binance-market-scan; for cross-exchange listing checks use exchange-pair-finder.
version: 1.0.0
category: data
compatible_with: [claude-code, openclaw, cursor, hermes]
exchanges: [binance, okx]
mode: analysis
license: MIT
---

# OKX Market Scan

Read-only OKX market data via public v5 REST endpoints. No API key required.

## Purpose

Scan OKX markets (spot, perpetual swap, futures, options) for price, tickers, candles/OHLCV, order book depth, funding rates, open interest, mark price, index price, top movers, and technical indicators (RSI/MACD/EMA/Bollinger/KDJ/SuperTrend and 70+ more). Use this skill whenever the user asks about OKX specifically — "price of BTC on OKX", "OKX funding rate", "OKX top gainers", "OKX perp open interest", "is BILL listed on OKX", "OKX 1h candles SOL-USDT-SWAP". All operations are read-only and use public OKX v5 REST endpoints (no API credentials required). For Binance use binance-market-scan; for cross-exchange listing checks use exchange-pair-finder.

This skill is part of the **crypto-exchange-agent-skills-suite**. See [`../../docs/architecture.md`](../../docs/architecture.md) for how it fits with the other 20 skills.

---

> **Compliance:** Public market data only. No order placement. Funding/OI/indicator outputs are objective numerical values; interpretation is the user's responsibility.

---

## When to Use

- "price of X on OKX"
- "OKX 1h candles for ETH-USDT-SWAP"
- "OKX funding rate for BTC-USDT-SWAP"
- "OKX top gainers / volume leaders"
- "OKX order book SOL-USDT depth"
- "is BILL listed on OKX"
- "open interest on OKX perp"
- any OKX-specific query

If the user did NOT specify OKX, ask or route through `crypto-exchange-master`.

---

## OKX Instrument ID Format (critical)

OKX uses **`-`** not `/` and explicit market suffixes:

| Market | Format | Example |
|--------|--------|---------|
| Spot | `BASE-QUOTE` | `BTC-USDT` |
| Perp swap | `BASE-QUOTE-SWAP` | `BTC-USDT-SWAP` |
| Futures | `BASE-QUOTE-YYMMDD` | `BTC-USDT-251226` |
| Options | `BASE-USD-YYMMDD-STRIKE-C/P` | `BTC-USD-251226-95000-C` |
| Index | `BASE-QUOTE` | `BTC-USD` (no `T`) |

**Always normalize user input** (e.g., `BTC/USDT` perp → `BTC-USDT-SWAP`).

---

## Required Inputs

| Input | Required? | Example | Notes |
|-------|-----------|---------|-------|
| `instId` | usually | `BTC-USDT-SWAP` | Use the canonical format above |
| `instType` | for screeners | `SPOT` \| `SWAP` \| `FUTURES` \| `OPTION` | Uppercase |
| `bar` | for candles | `1m`,`5m`,`15m`,`1H`,`4H`,`1D`,`1W` | **Uppercase** H/D/W |
| `limit` | optional | 1–300 | Default 100 |
| `sz` | for orderbook | 1–400 | Default 5 |

---

## Endpoint Map (Public, No Auth)

Base: `https://www.okx.com`

| Purpose | Endpoint |
|---------|----------|
| Ticker (one) | `GET /api/v5/market/ticker?instId=BTC-USDT-SWAP` |
| Tickers (by type) | `GET /api/v5/market/tickers?instType=SPOT` |
| Order book | `GET /api/v5/market/books?instId=BTC-USDT&sz=20` |
| Candles | `GET /api/v5/market/candles?instId=BTC-USDT&bar=1H&limit=200` |
| Historical candles (>~1500 bars ago) | `GET /api/v5/market/history-candles?instId=BTC-USDT&bar=1H` |
| Index candles | `GET /api/v5/market/index-candles?instId=BTC-USD&bar=1H` |
| Mark-price candles | `GET /api/v5/market/mark-price-candles?instId=BTC-USDT-SWAP&bar=1H` |
| Recent trades | `GET /api/v5/market/trades?instId=BTC-USDT&limit=100` |
| Funding rate (current) | `GET /api/v5/public/funding-rate?instId=BTC-USDT-SWAP` |
| Funding rate history | `GET /api/v5/public/funding-rate-history?instId=BTC-USDT-SWAP&limit=100` |
| Mark price | `GET /api/v5/public/mark-price?instType=SWAP&instId=BTC-USDT-SWAP` |
| Index ticker | `GET /api/v5/market/index-tickers?instId=BTC-USD` |
| Open interest | `GET /api/v5/public/open-interest?instType=SWAP&instId=BTC-USDT-SWAP` |
| Long/short ratio | `GET /api/v5/rubik/stat/contracts/long-short-account-ratio?ccy=BTC&period=1H` |
| Taker buy/sell volume | `GET /api/v5/rubik/stat/taker-volume?ccy=BTC&instType=SPOT&period=1H` |
| Instruments | `GET /api/v5/public/instruments?instType=SPOT` |
| Price limit | `GET /api/v5/public/price-limit?instId=BTC-USDT-SWAP` |

### Candle columns
`[ts, o, h, l, c, vol, volCcy, volCcyQuote, confirm]` — newest first.

---

## Workflow

### Step 1 — Normalize instId
- `BTC/USDT` (spot) → `BTC-USDT`
- `BTC/USDT` (perp/futures intent) → `BTC-USDT-SWAP`
- "BTC perp on OKX" → `BTC-USDT-SWAP`
- Always uppercase

### Step 2 — Identify data type
| User intent | Endpoint |
|-------------|----------|
| price/last | `/market/ticker` |
| 24h stats | `/market/ticker` (returns 24h fields too) |
| candles/chart | `/market/candles` |
| depth/orderbook | `/market/books` |
| funding | `/public/funding-rate` (+ history) |
| OI | `/public/open-interest` |
| mark price | `/public/mark-price` |
| top movers | `/market/tickers?instType=SPOT` then sort |

### Step 3 — Fetch with sane defaults
- `bar=1H` if not specified
- `limit=200` for candles (enough for indicators)
- `sz=20` for order book (depth at top of book)

### Step 4 — Convert + format
- Funding rate: returned as decimal (e.g., `0.0001` = 0.01%). Multiply by 100 for percent display, multiply by 3 (×8h periods/day) for daily.
- OI: `oi` is in contracts, `oiCcy` in base coin, `oiUsd` in USD.
- Timestamps are Unix ms.
- Candles sorted **newest first** — reverse before computing indicators.

---

## Output Format

Single-pair snapshot:

```
OKX · <instType> · <instId>
Last: <price> USDT  (24h: <±%>)
24h H/L: <high> / <low>
24h Vol: <volCcyQuote> USDT
Best bid/ask: <bid> / <ask>  (spread: <bps> bps)
[SWAP/FUTURES] Funding: <rate%>  (next: <time>)  | 8h
[SWAP/FUTURES] OI: <oi> contracts  ≈ <oiCcy> <COIN>  ≈ $<oiUsd>
[SWAP/FUTURES] Mark price: <mark>  (basis vs index: <bps> bps)
Trend (1H, last 200 bars): up/down/range   RSI(14): <value>
Notable: <e.g., funding flipped positive, OI +12% in 4h, etc.>
```

Top movers table: rank by `chg24h` or `volCcy24h`. Filter to `state == "live"`.

---

## Edge Cases

- **instId casing & dashes:** Always `BTC-USDT` (uppercase, dash). `btc-usdt` returns nothing.
- **Bar value casing:** `1H` `4H` `1D` `1W` — uppercase. For indicator endpoints OKX uses `1Dutc` / `1Wutc` — different from candle bars.
- **`history-candles` for old data:** `/market/candles` only returns the most recent ~1500 bars. For older history use `/market/history-candles`.
- **Funding only exists for SWAP** (perpetual). Calendar futures do NOT have funding; they have basis instead.
- **Mark price only for derivatives** (SWAP/FUTURES/OPTION). Spot has no mark price.
- **Index ticker uses `BTC-USD`** not `BTC-USDT`.
- **Symbol delisted / not listed:** API returns `code != "0"` with `msg` describing the error. Tell the user the pair isn't on OKX and suggest checking Binance.
- **Rate limit:** ~20 req / 2s per IP for public endpoints. Batch sensibly.
- **Demo mode flag (`x-simulated-trading: 1` header)** does NOT affect public market data — it only matters for trading endpoints.

---

## Handoff

- `crypto-exchange-master` → routes OKX queries here.
- `exchange-pair-finder` → uses `/public/instruments` to confirm listings.
- `crypto-technical-analysis` → reads klines.
- `crypto-futures-analysis` → reads funding/OI/long-short ratio.
- `exchange-liquidity-check` → reads `/market/books`.
- `crypto-compare-pairs` → calls in parallel.

---

## Example Commands

```
/okx-market-scan BTC-USDT
/okx-market-scan BTC-USDT-SWAP
/okx-market-scan candles ETH-USDT bar=4H limit=200
/okx-market-scan depth SOL-USDT sz=50
/okx-market-scan funding BTC-USDT-SWAP
/okx-market-scan top-gainers instType=SPOT quote=USDT
/okx-market-scan oi instType=SWAP instId=ETH-USDT-SWAP
/okx-market-scan is-listed BILL
```

Arabic:
```
/okx-market-scan افحص BTC-USDT-SWAP
/okx-market-scan أعلى الرابحين على OKX
/okx-market-scan تمويل ETH-USDT-SWAP
```

---

## Optional Inputs

| Input | Default | Example |
|-------|---------|---------|
| `timeframe` | `1h` | `15m`, `4h`, `1d` |
| `verbose` | `false` | `true` for raw endpoint dumps |

The full list of inputs is documented under [`## Required Inputs`](#required-inputs) above. Anything not marked required is optional with sensible defaults.

---

## Exchange-Specific Handling

### Binance
- Endpoints, symbol formats, and quirks are documented in [`../../docs/binance-guide.md`](../../docs/binance-guide.md).
- Symbol format: `BTCUSDT` (no separator). Perp uses USDM endpoints (`fapi.binance.com`).

### OKX
- Endpoints, bar values, and quirks are documented in [`../../docs/okx-guide.md`](../../docs/okx-guide.md).
- Symbol format: `BTC-USDT` (spot), `BTC-USDT-SWAP` (perp), `BTC-USDT-251226` (futures).
- Bar values are uppercase from `1H` upward.

---

## Quality Checks

- All required fields populated; no `null` in required positions.
- Numeric outputs within expected ranges (no negative volumes, RSI in [0,100], etc.).
- Data timestamp within last 5 minutes when the request is real-time.
- For multi-exchange outputs, both Binance and OKX figures use the same time window.
- If an endpoint returns an error, the skill surfaces it explicitly rather than inventing values.
