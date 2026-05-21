---
name: crypto-technical-analysis
description: Pure technical analysis of a crypto pair on Binance or OKX — multi-timeframe trend, RSI(14), MACD, Bollinger Bands, EMA 20/50/100/200, ATR, support/resistance zones, volume profile, momentum divergences, chart patterns, entry/exit/invalidation zones, and a Technical Score (0–100). Use this skill whenever the user mentions RSI, MACD, EMA, moving averages, support, resistance, trend, breakout, divergence, Bollinger, indicators, chart, "TA on X", "technicals for BTC", or asks for any indicator-driven view on a pair. Indicator-only — no funding, no on-chain, no fundamentals.
version: 1.0.0
category: analysis
compatible_with: [claude-code, openclaw, cursor, hermes]
exchanges: [binance, okx]
mode: analysis
license: MIT
---

# Crypto Technical Analysis

Indicator-driven analysis of a pair on Binance or OKX. Reads only OHLCV + volume from the market-scan skills. Returns a Technical Score and a structured setup.

## Purpose

Pure technical analysis of a crypto pair on Binance or OKX — multi-timeframe trend, RSI(14), MACD, Bollinger Bands, EMA 20/50/100/200, ATR, support/resistance zones, volume profile, momentum divergences, chart patterns, entry/exit/invalidation zones, and a Technical Score (0–100). Use this skill whenever the user mentions RSI, MACD, EMA, moving averages, support, resistance, trend, breakout, divergence, Bollinger, indicators, chart, "TA on X", "technicals for BTC", or asks for any indicator-driven view on a pair. Indicator-only — no funding, no on-chain, no fundamentals.

This skill is part of the **crypto-exchange-agent-skills-suite**. See [`../../docs/architecture.md`](../../docs/architecture.md) for how it fits with the other 20 skills.

---

> **Disclaimer:** Educational only. Indicators describe past price action; they do not predict it. No trade is recommended; outputs are objective math.

---

## When to Use

- "RSI for BTC/USDT on 4h"
- "MACD signal ETH/USDT"
- "show me support and resistance for SOL"
- "is BTC overbought"
- "EMA stack on Binance ETH"
- "do the technicals look bullish"
- the user mentions ANY indicator by name (RSI, MACD, BB, EMA, MA, ATR, KDJ, stochastic, SuperTrend, etc.)

For spot fundamentals → `crypto-spot-analysis`. For derivatives positioning → `crypto-futures-analysis`.

---

## Required Inputs

| Input | Required? | Example |
|-------|-----------|---------|
| `pair` | yes | `BTC/USDT` |
| `exchange` | yes | `binance` / `okx` |
| `timeframe` | yes | `15m` / `1h` / `4h` / `1d`. Default `1h`. |
| `lookback` | optional | candles. Default 300 (enough for EMA200 + buffer). |
| `indicators` | optional | comma list. Default: `trend,rsi,macd,bb,ema,atr,sr,volume`. |

---

## Workflow

### Step 1 — Pull candles
Call `binance-market-scan` (klines) or `okx-market-scan` (candles) at the requested timeframe + 1 higher TF for confluence.

Reverse OKX output (newest first) into chronological order before computing indicators.

### Step 2 — Compute the indicator set

#### Trend
- EMA20, EMA50, EMA100, EMA200 (closes only)
- Stack order: which EMAs are above which
- Slope of EMA50 over last 20 bars (rising / flat / falling)
- Price vs EMA200 (bull regime if above, bear if below)

#### Momentum
- RSI(14): value, divergence vs price (bullish/bearish), overbought (>70) / oversold (<30)
- MACD(12, 26, 9): line, signal, histogram, recent cross (date + bar), histogram trend
- Stochastic(14, 3, 3): %K, %D, cross

#### Volatility
- Bollinger Bands (20, 2σ): position of price (upper / mid / lower / outside), bandwidth percentile
- ATR(14): absolute and as % of price

#### Support / Resistance
- Recent swing highs / lows (last 50 + 200 bars)
- Round number levels (psychological)
- Anchored VWAP from most recent swing low (rough)
- Volume-by-price (lookback) — identify the highest-traded price range (rough POC)

#### Volume
- 20-period average volume
- Last 5 candles average vs 20-period
- Tag any candle with vol > 2× average ("volume spike")
- Recent OBV direction (rising/falling)

#### Patterns (best-effort)
- Higher highs + higher lows → uptrend
- Lower highs + lower lows → downtrend
- Range / contraction / triangle (lookback-based, low confidence — flag as "informal")

### Step 3 — Score (0–100)

| Component | Weight |
|-----------|--------|
| EMA alignment (stack + slope) | 25 |
| Momentum (RSI + MACD agreement) | 20 |
| Higher-TF agreement | 15 |
| Volume confirmation | 15 |
| Position relative to key levels (room to next resistance vs support) | 15 |
| Volatility context (not stuck in BB midline squeeze) | 10 |

Output the score, the contributing factors, and a verdict from this list:
`strong-uptrend / uptrend / ranging / weakening / downtrend / strong-downtrend / topping / bottoming`.

### Step 4 — Build a setup map (no recommendation)

- Bullish scenario: trigger, target, invalidation
- Bearish scenario: trigger, target, invalidation
- "Watch and wait" condition if neither side has confluence

---

## Output Format

```
Technical Analysis · <EXCHANGE> · <PAIR> · TF=<tf>  (HTF=<higher>)

Trend
  EMA stack: EMA20 <pos> EMA50 <pos> EMA100 <pos> EMA200
  Price vs EMA200: <above/below>   Regime: <bull/bear>
  EMA50 slope: <up/flat/down>
  HTF trend: <up/flat/down>

Momentum
  RSI(14): <val>    state: <oversold/neutral/overbought>   divergence: <bullish/bearish/none>
  MACD: line=<x> signal=<y> hist=<h>   last cross: <bull/bear> <n> bars ago
  Stoch: K=<a> D=<b>   <cross direction>

Volatility
  BB(20,2): price at <upper/mid/lower>   bandwidth: <pctile>
  ATR(14): <abs>  (<pct%> of price)

Volume
  20-avg: <v>   last 5 avg: <l>   ratio: <r>
  OBV: <rising/falling>
  Notable spikes: <bar dates>

Levels
  Resistance: R1 <p1>, R2 <p2>, R3 <p3>
  Support:    S1 <p1>, S2 <p2>, S3 <p3>
  Volume POC (approx): <price>

Technical Score: <0–100>
Verdict: <strong-uptrend / uptrend / ... / strong-downtrend>

Setup map (educational)
  Bullish trigger: <break of R1 with >1.5× avg vol>
    target: <R2>   invalidation: <below S1>
  Bearish trigger: <break of S1 + RSI <40>
    target: <S2>   invalidation: <above R1>
  Otherwise: wait for confluence.
```

---

## Edge Cases

- **Not enough bars** (e.g., new listing) for EMA200: compute what you can and clearly note "EMA200 unavailable (need ≥200 bars)."
- **All-zero volume bars** on illiquid pairs: filter out before averages.
- **Spread > 0.5%** affects level precision: flag.
- **Indicator divergences are easy to over-claim** — only report divergences over at least 2 swings, both visible in the lookback.
- **Different exchanges, slightly different candles:** OKX and Binance may differ by a few ticks on small caps. Always state which exchange's data was used.
- **Stablecoin pairs:** skip — indicators are meaningless on a tight peg.

---

## Handoff

- Consumes OHLCV from `binance-market-scan` / `okx-market-scan`.
- Feeds the technical component into `crypto-spot-analysis`, `crypto-futures-analysis`, `crypto-entry-exit-plan`, `crypto-compare-pairs`, and `crypto-report`.

---

## Example Commands

```
/crypto-technical-analysis BTC/USDT exchange=binance timeframe=4h
/crypto-technical-analysis ETH/USDT exchange=okx timeframe=1h indicators=rsi,macd,ema
/crypto-technical-analysis SOL/USDT exchange=binance timeframe=15m
/crypto-technical-analysis just-rsi BTC/USDT exchange=okx tf=1d
```

Arabic:
```
/crypto-technical-analysis تحليل فني BTC/USDT على Binance 4h
/crypto-technical-analysis RSI و MACD لـ ETH/USDT على OKX
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
