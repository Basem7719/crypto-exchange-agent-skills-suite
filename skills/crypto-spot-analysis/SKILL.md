---
name: crypto-spot-analysis
description: Analyze a spot trading pair on Binance or OKX — current price, 24h move, trend, volume profile, order book depth, key support/resistance, and a spot-specific setup quality score. Use this skill whenever the user asks to "analyze X spot", "look at the spot market for X", "is X a good spot buy", "spot setup for BTC/USDT", or when an analysis explicitly excludes leverage/perp considerations. This skill focuses on spot-only dynamics (no funding, no liquidation, no leverage); for perpetual/leveraged analysis use crypto-futures-analysis. Works for Binance spot and OKX spot.
version: 1.0.0
category: analysis
compatible_with: [claude-code, openclaw, cursor, hermes]
exchanges: [binance, okx]
mode: analysis
license: MIT
---

# Crypto Spot Analysis

End-to-end spot analysis for a single pair on Binance or OKX: price action, volume, depth, levels, and a spot setup score. Read-only.

## Purpose

Analyze a spot trading pair on Binance or OKX — current price, 24h move, trend, volume profile, order book depth, key support/resistance, and a spot-specific setup quality score. Use this skill whenever the user asks to "analyze X spot", "look at the spot market for X", "is X a good spot buy", "spot setup for BTC/USDT", or when an analysis explicitly excludes leverage/perp considerations. This skill focuses on spot-only dynamics (no funding, no liquidation, no leverage); for perpetual/leveraged analysis use crypto-futures-analysis. Works for Binance spot and OKX spot.

This skill is part of the **crypto-exchange-agent-skills-suite**. See [`../../docs/architecture.md`](../../docs/architecture.md) for how it fits with the other 20 skills.

---

> **Disclaimer:** Educational only. Not financial advice. Outputs are objective summaries of public market data. Trading decisions remain the user's responsibility.

---

## When to Use

- "analyze BTC/USDT spot on Binance"
- "look at ETH spot OKX"
- "is SOL/USDT a good spot entry right now"
- "give me a spot snapshot for BILL/USDT"
- the user explicitly says "spot" or "cash market" (not perp/futures/leverage)

If the user wants leverage, funding, or perpetuals → route to `crypto-futures-analysis` instead. If they want pure technical indicators → `crypto-technical-analysis`.

---

## Required Inputs

| Input | Required? | Example |
|-------|-----------|---------|
| `pair` | yes | `BTC/USDT` |
| `exchange` | yes | `binance` \| `okx` |
| `timeframe` | optional | `15m` / `1h` / `4h` / `1d`. Default `1h` for short-term, `4h` for swing. |
| `lookback` | optional | candles to pull. Default 200. |

---

## Workflow

### Step 1 — Resolve listing
- If unsure the pair is listed, call `exchange-pair-finder` first.

### Step 2 — Pull data
- Call `binance-market-scan` or `okx-market-scan` for:
  - 24h ticker (price, %, high, low, volume)
  - Klines × 2 timeframes (the chosen one + one higher TF for context)
  - Order book depth (top 20–50 levels)
  - Recent trades (last 100) for tape feel

### Step 3 — Compute spot metrics

| Metric | How |
|--------|-----|
| Trend (chosen TF) | EMA20 vs EMA50 slope; price vs EMA200 |
| Trend (higher TF) | Same on the 4× higher TF |
| Volume regime | Last 5 candles vs 20-period average |
| Volume profile | Identify the price range with the highest traded volume in lookback (rough POC) |
| RSI(14) | Standard |
| Range/Volatility | ATR(14) and ATR/price % |
| Support/Resistance | Swing highs/lows in lookback + round numbers + VWAP-from-recent-low |
| Bid/ask spread | (ask − bid) / mid in bps |
| Top-of-book depth | Cumulative size at ±0.1%, ±0.5%, ±1% |
| Taker pressure | Recent trades: buy volume vs sell volume ratio (last 100 trades) |

### Step 4 — Score the spot setup (0–100)

Composite of:
- Trend alignment across timeframes (30 pts)
- Momentum (RSI not extreme, MACD direction) (20 pts)
- Volume confirmation (15 pts)
- Liquidity (spread + depth) (15 pts)
- Risk/reward to nearest key level (20 pts)

Output the score, the contributing factors, and a 1-line verdict (`accumulation` / `breakout` / `range` / `distribution` / `downtrend`).

### Step 5 — Provide a spot plan sketch

Only as educational scaffolding, never as a recommendation:
- Possible entry zone (range)
- Invalidation level (where the setup fails)
- First take-profit zone (next resistance)
- Sizing should be deferred to `crypto-risk-manager`

---

## Output Format

```
Spot Analysis · <EXCHANGE> · <PAIR> · TF=<tf>

Snapshot
  Price: <last> USDT   24h: <±%>   Volume(24h): <quote_vol> USDT
  Spread: <bps> bps    Depth ±0.5%: bid $<x>k / ask $<y>k

Trend
  <TF>:   EMA20 <above/below> EMA50, slope <up/down>, price vs EMA200 <above/below>
  Higher TF (<4×>):  <same readout>

Momentum
  RSI(14) <tf>: <value>   MACD: <signal cross / divergence / neutral>

Volume
  Last 5 candles avg vol: <x>  vs 20-period avg: <y>  → <strong / normal / weak>
  Recent taker pressure: buy <a%> / sell <b%>

Key Levels
  Resistance: R1 <p1>, R2 <p2>
  Support:    S1 <p1>, S2 <p2>
  Volume POC (approx): <price>

Setup Score: <0–100>
Verdict: <accumulation / breakout / range / distribution / downtrend>

Plan sketch (educational, not a recommendation)
  Entry zone:        <range>
  Invalidation:      <below S2 / above R2>
  First target:      <R1 or next swing>
  Suggested sizing:  defer to crypto-risk-manager
```

---

## Edge Cases

- **Thin / very illiquid pair** (small caps like BILL, PLAY): depth at ±0.5% may be a few hundred USDT. Flag this loudly — the setup may be untradable at any meaningful size.
- **Low volume timeframe:** if 24h quote volume < $1M, mark as **micro-cap caution** and recommend using `exchange-liquidity-check` before any plan.
- **Extreme RSI but flat price:** could be a low-volume range, not a real momentum read. Note it.
- **News-driven spikes:** if last 1h candle is >5×ATR, structural levels are unreliable; flag and suggest waiting.
- **Stablecoin pairs (USDT/USDC, USDC/USDT):** this skill is not designed for them — they trade in a tight band; return a short note rather than a full analysis.

---

## Handoff

- Calls `binance-market-scan` or `okx-market-scan` for raw data.
- Calls `crypto-technical-analysis` for indicator-heavy work (if user asks for it).
- Hands off to `crypto-entry-exit-plan` to formalize the plan sketch.
- Feeds `crypto-report` if a full document is requested.
- Defers sizing to `crypto-risk-manager`.

---

## Example Commands

```
/crypto-spot-analysis BTC/USDT exchange=binance
/crypto-spot-analysis SOL/USDT exchange=okx timeframe=4h
/crypto-spot-analysis BILL/USDT exchange=okx
/crypto-spot-analysis ETH/USDT exchange=binance timeframe=15m
```

Arabic:
```
/crypto-spot-analysis حلل BTC/USDT spot على Binance
/crypto-spot-analysis تحليل سبوت SOL/USDT على OKX
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
