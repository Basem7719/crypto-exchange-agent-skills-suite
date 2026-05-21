---
name: binance-market-scan
description: Scan Binance markets (spot, USDS-M futures, COIN-M futures) for price, 24h stats, OHLCV candles, order book depth, recent trades, funding rates, open interest, and top movers. Use this skill whenever the user asks about Binance specifically — "what's BTC doing on Binance", "Binance price of ETH/USDT", "top gainers Binance", "Binance order book SOL/USDT", "Binance funding rate", "is PLAY/USDT tradable on Binance", "klines Binance 1h BTC", or anything that explicitly names Binance as the venue. All operations are read-only and use public Binance REST endpoints (no API key required for market data). For OKX use okx-market-scan; for cross-exchange listing checks use exchange-pair-finder.
version: 1.0.0
category: data
compatible_with: [claude-code, openclaw, cursor, hermes]
exchanges: [binance, okx]
mode: analysis
license: MIT
---

# Binance Market Scan

Read-only Binance market data: tickers, candles, depth, trades, funding, open interest, top movers. No API key needed.

## Purpose

Scan Binance markets (spot, USDS-M futures, COIN-M futures) for price, 24h stats, OHLCV candles, order book depth, recent trades, funding rates, open interest, and top movers. Use this skill whenever the user asks about Binance specifically — "what's BTC doing on Binance", "Binance price of ETH/USDT", "top gainers Binance", "Binance order book SOL/USDT", "Binance funding rate", "is PLAY/USDT tradable on Binance", "klines Binance 1h BTC", or anything that explicitly names Binance as the venue. All operations are read-only and use public Binance REST endpoints (no API key required for market data). For OKX use okx-market-scan; for cross-exchange listing checks use exchange-pair-finder.

This skill is part of the **crypto-exchange-agent-skills-suite**. See [`../../docs/architecture.md`](../../docs/architecture.md) for how it fits with the other 20 skills.

---

> **Compliance:** Public market data only. No order placement. For orders see `exchange-order-planner` and `exchange-trading-executor`.

---

## When to Use

- "what's the price of X on Binance"
- "show me 1h candles for BTC/USDT"
- "Binance top gainers / losers / volume leaders"
- "order book depth for ETH/USDT spot"
- "funding rate for BTC/USDT perp"
- "open interest on Binance futures"
- "is PLAY/USDT trading on Binance and is it active?"
- any Binance-specific query about price, volume, or market structure

If the user does NOT specify Binance, ask or route through `crypto-exchange-master`. If they want both Binance and OKX, run this skill AND `okx-market-scan`, then compare.

---

## Required Inputs

| Input | Required? | Example | Notes |
|-------|-----------|---------|-------|
| `symbol` | usually | `BTCUSDT`, `ETHUSDT` | Binance uses no separator |
| `pair` | alt. | `BTC/USDT` | Convert to symbol (remove `/`) |
| `market` | yes | `spot` \| `usdm` \| `coinm` | Default `spot` |
| `interval` | for klines | `1m`,`5m`,`15m`,`1h`,`4h`,`1d`,`1w` | Default `1h` |
| `limit` | optional | 1–1000 | Default 100 (500 for klines) |
| `depth` | optional | 5/10/20/50/100/500/1000 | For order book |

---

## Endpoint Map (Public, No Auth)

### Spot — base `https://api.binance.com`

| Purpose | Endpoint |
|---------|----------|
| Ping | `GET /api/v3/ping` |
| Server time | `GET /api/v3/time` |
| Exchange info | `GET /api/v3/exchangeInfo?symbol=BTCUSDT` |
| 24h ticker | `GET /api/v3/ticker/24hr?symbol=BTCUSDT` |
| All 24h tickers | `GET /api/v3/ticker/24hr` |
| Price ticker | `GET /api/v3/ticker/price?symbol=BTCUSDT` |
| Book ticker (best bid/ask) | `GET /api/v3/ticker/bookTicker?symbol=BTCUSDT` |
| Order book | `GET /api/v3/depth?symbol=BTCUSDT&limit=100` |
| Recent trades | `GET /api/v3/trades?symbol=BTCUSDT&limit=500` |
| Klines | `GET /api/v3/klines?symbol=BTCUSDT&interval=1h&limit=200` |
| Average price | `GET /api/v3/avgPrice?symbol=BTCUSDT` |
| Rolling window stats | `GET /api/v3/ticker?symbol=BTCUSDT&windowSize=4h` |

### USDS-M Futures — base `https://fapi.binance.com`

| Purpose | Endpoint |
|---------|----------|
| Exchange info | `GET /fapi/v1/exchangeInfo` |
| 24h ticker | `GET /fapi/v1/ticker/24hr?symbol=BTCUSDT` |
| Mark price + funding | `GET /fapi/v1/premiumIndex?symbol=BTCUSDT` |
| Funding rate history | `GET /fapi/v1/fundingRate?symbol=BTCUSDT&limit=100` |
| Klines | `GET /fapi/v1/klines?symbol=BTCUSDT&interval=1h&limit=200` |
| Order book | `GET /fapi/v1/depth?symbol=BTCUSDT&limit=100` |
| Open interest | `GET /fapi/v1/openInterest?symbol=BTCUSDT` |
| OI history | `GET /futures/data/openInterestHist?symbol=BTCUSDT&period=1h&limit=100` |
| Top long/short ratio (accounts) | `GET /futures/data/topLongShortAccountRatio?symbol=BTCUSDT&period=1h` |
| Top long/short ratio (positions) | `GET /futures/data/topLongShortPositionRatio?symbol=BTCUSDT&period=1h` |
| Global long/short | `GET /futures/data/globalLongShortAccountRatio?symbol=BTCUSDT&period=1h` |
| Taker buy/sell volume | `GET /futures/data/takerlongshortRatio?symbol=BTCUSDT&period=1h` |

### COIN-M Futures — base `https://dapi.binance.com` (less commonly needed; same shape, replace `fapi` with `dapi`).

### Klines (kline columns)
Each kline row: `[openTime, open, high, low, close, volume, closeTime, quoteVolume, trades, takerBuyVol, takerBuyQuoteVol, ignore]`.

---

## Workflow

### Step 1 — Normalize the symbol
- `BTC/USDT` → `BTCUSDT`
- `BTC-USDT` → `BTCUSDT`
- Always uppercase
- If user gave only a coin (e.g., "BTC"), assume `<COIN>USDT`

### Step 2 — Pick the right base URL
- spot → `api.binance.com`
- perp / futures / "swap" / "linear" → `fapi.binance.com`
- inverse / coin-margined → `dapi.binance.com`

### Step 3 — Decide what to fetch
- "price" only → `/ticker/price`
- "24h stats" → `/ticker/24hr`
- "candles/klines/chart" → `/klines`
- "depth/order book" → `/depth`
- "funding" → `/premiumIndex` + history
- "OI / open interest" → `/openInterest` + `openInterestHist`
- "top movers" → all `/ticker/24hr` then sort by `priceChangePercent` (filter to USDT pairs)

### Step 4 — Fetch (use built-in HTTP, no auth header needed)
- Respect rate limits: REST spot is ~6000 weight/min; most endpoints weight 1–10.
- If user asks for many pairs, batch sensibly (e.g., one call to `/ticker/24hr` returns all).

### Step 5 — Format
Default output is a compact, structured snapshot (see Output Format below). Don't dump raw JSON unless the user asks.

---

## Output Format

For a single-pair snapshot, return:

```
Binance · <market> · <SYMBOL>
Price: <last> USDT  (24h: <±%>)
24h high / low: <high> / <low>
24h volume: <quote_vol> USDT  (base: <base_vol> <COIN>)
Best bid / ask: <bid> / <ask>  (spread: <bps> bps)
[Futures only] Funding: <funding_rate> %  (next: <time>)
[Futures only] OI: <oi> <COIN>  ($<oi_usd>)
Trend (1h): <up|down|range>   RSI(14): <value>
Notable: <e.g., volume +180% vs 7d avg, funding flipped negative, etc.>
```

For top movers, return a short table sorted by `priceChangePercent`, top 10–20 rows.

For order book, return cumulative depth at ±0.1%, ±0.5%, ±1% from mid, plus top 5 levels each side.

---

## Edge Cases

- **Symbol not found:** Binance returns `400 {"code":-1121,"msg":"Invalid symbol"}`. Tell the user the pair isn't listed on Binance and suggest `exchange-pair-finder` or `okx-market-scan`.
- **Spot vs perp same symbol:** `BTCUSDT` exists on both. Always state which market you queried.
- **24h ticker returns hundreds of pairs without `symbol` filter** — only fetch the all-tickers form when the user explicitly wants a market-wide scan.
- **Klines `interval`:** lowercase: `1m`, `1h`, `1d`. Not `1H`.
- **Funding rate** is in decimal — 0.0001 = 0.01% per 8h. Convert when presenting.
- **Open interest** in `openInterest` is in contracts; multiply by index price for USD value.
- **Geo restrictions:** Binance blocks some IPs (US, restricted regions). If the fetch returns 451/403, suggest `binance.us` endpoint or fall back to OKX.
- **PLAY / BILL / niche tokens:** Binance lists many small caps but quickly delists. Always check `exchangeInfo` for `status == TRADING` before treating as live.

---

## Handoff

- `crypto-exchange-master` → calls this skill for any Binance-specific request.
- `exchange-pair-finder` → uses `/exchangeInfo` to confirm a symbol exists.
- `crypto-technical-analysis` → consumes klines from this skill.
- `crypto-futures-analysis` → consumes funding + OI + long/short ratios.
- `exchange-liquidity-check` → consumes `/depth` output.
- `crypto-compare-pairs` → calls this skill in parallel for each pair.
- `crypto-report` → embeds the snapshot.

---

## Example Commands

```
/binance-market-scan BTC/USDT
/binance-market-scan ETH/USDT market=usdm
/binance-market-scan PLAY/USDT
/binance-market-scan top-gainers quote=USDT limit=20
/binance-market-scan klines symbol=SOLUSDT interval=4h limit=200
/binance-market-scan depth BTCUSDT limit=100 market=spot
/binance-market-scan funding ETHUSDT
```

Arabic:
```
/binance-market-scan افحص BTC/USDT
/binance-market-scan أعلى الرابحين على Binance
/binance-market-scan شموع 1h SOL/USDT
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
