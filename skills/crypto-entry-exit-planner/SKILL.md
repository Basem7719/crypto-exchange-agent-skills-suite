---
name: crypto-entry-exit-planner
description: Build a concrete, executable entry/exit plan for a single crypto pair on Binance or OKX — entry zone (limit/market), stop loss, take profit ladder, invalidation level, time-based exit, sizing reference, and pre-trade checklist. Use this skill whenever the user asks to "build a plan", "where do I enter", "where should I take profit", "give me a trade plan", "set up the trade", "entry and exit for X". Always invokes crypto-technical-analysis, crypto-risk-manager, and exchange-liquidity-check first. Never sends orders — produces a structured plan that exchange-order-planner can turn into draft orders.
version: 1.0.0
category: planning
compatible_with: [claude-code, openclaw, cursor, hermes]
exchanges: [binance, okx]
mode: both
license: MIT
---

# Crypto Entry/Exit Plan

Builds a single-pair trade plan: entry zone, stop, TP ladder, invalidation, time stop. Combines technicals + risk + liquidity into one coherent document.

## Purpose

Build a concrete, executable entry/exit plan for a single crypto pair on Binance or OKX — entry zone (limit/market), stop loss, take profit ladder, invalidation level, time-based exit, sizing reference, and pre-trade checklist. Use this skill whenever the user asks to "build a plan", "where do I enter", "where should I take profit", "give me a trade plan", "set up the trade", "entry and exit for X". Always invokes crypto-technical-analysis, crypto-risk-manager, and exchange-liquidity-check first. Never sends orders — produces a structured plan that exchange-order-planner can turn into draft orders.

This skill is part of the **crypto-exchange-agent-skills-suite**. See [`../../docs/architecture.md`](../../docs/architecture.md) for how it fits with the other 20 skills.

---

> **Disclaimer:** Educational only. The plan is a hypothesis, not a recommendation. Markets change; revisit before acting. Never execute live from this skill — pass through `exchange-order-planner` and only execute via `exchange-trading-executor` with explicit confirmation.

---

## When to Use

- "build me a plan for BTC/USDT"
- "where should I enter and exit ETH/USDT on OKX"
- "give me a swing trade setup for SOL"
- "set up a long on BILL/USDT"
- the user explicitly wants a structured plan (entry + stop + TP)

If the user only wants analysis without a plan → use `crypto-spot-analysis` or `crypto-futures-analysis` directly. If they want orders drafted → call this skill, then `exchange-order-planner`.

---

## Required Inputs

| Input | Required? | Example |
|-------|-----------|---------|
| `pair` | yes | `BTC/USDT` |
| `exchange` | yes | `binance` / `okx` |
| `market_type` | yes | `spot` / `perp` / `futures` |
| `direction` | yes | `long` / `short` / `auto` (derive from TA) |
| `timeframe` | optional | default `1h` for short-term, `4h` for swing, `1d` for position |
| `capital` | optional but recommended | account size USDT |
| `risk_pct` | optional | default 1% |
| `bias` | optional | `breakout` / `pullback` / `range` / `auto` |

---

## Workflow

### Step 1 — Pre-checks (skip none)
1. Resolve listing via `exchange-pair-finder` if symbol is uncommon.
2. Pull market snapshot via `binance-market-scan` or `okx-market-scan`.
3. Run `crypto-technical-analysis` at the chosen TF + one higher.
4. Run `crypto-futures-analysis` if `market_type` is perp/futures.
5. Run `exchange-liquidity-check` at planned size.
6. Run `crypto-risk-manager` for sizing math (needs entry + stop, so iterate after Step 2).

### Step 2 — Choose the setup type
Based on TA verdict:
- **strong-uptrend** → pullback-entry (buy a dip into a known support / EMA)
- **uptrend / weakening** → wait or breakout-entry on confirmation
- **ranging** → range-trade (buy low, sell high inside the range) — explicitly state range bounds
- **downtrend** → counter-trend is high-risk; default to "no trade" unless user explicitly asks short
- **strong-downtrend** + perp market → potential short on a bounce into resistance

### Step 3 — Define the entry zone
- A single price is too brittle. Define a 0.3–1.5% wide entry zone.
- For pullbacks: zone = EMA20 to EMA50 confluence
- For breakouts: zone = level break + retest, or break + first close above
- State both `limit-order zone` and `market-order trigger price`

### Step 4 — Define the stop
- Structural stop: just beyond the last swing low (long) or swing high (short)
- ATR-based fallback: 1.5× ATR(14) on the chosen TF
- Pick the wider of the two but cap at risk-manager limits
- State "If invalidated by close beyond <level>, this setup is dead — do not re-enter without re-analysis."

### Step 5 — Build the TP ladder
- TP1 = nearest resistance / support OR +1R
- TP2 = next major level OR +2R
- TP3 = stretch target OR +3R
- Default ladder: 33% / 33% / 34%
- After TP1, move stop to breakeven (state explicitly)

### Step 6 — Time stop
If the setup hasn't moved meaningfully in N candles of the chosen TF (default: 12 bars), close it. State the deadline.

### Step 7 — Apply the risk gate
Hand sizing inputs to `crypto-risk-manager`. If it returns `NO-GO`, surface the reason and offer an adjustment (wider stop, smaller size, different entry).

### Step 8 — Pre-trade checklist
A 6-item checklist the user must walk through before they execute (see Output Format).

---

## Output Format

```
Trade Plan · <EXCHANGE> · <PAIR> · <market_type> · <direction>  · TF=<tf>

Setup type: <pullback / breakout / range / counter-trend>
Thesis (2–3 lines):
  · <state the trend, the trigger, the level being respected, and why now>

Entry
  Zone:           <p_low> – <p_high>
  Limit ladder:   <p1>, <p2>  (split entry to average in)
  Market trigger: above <p_high>+0.3% with vol > 1.5× avg
  Time validity:  <N bars on TF or hard date>

Stop loss
  Structural:     <p>  (just beyond <named swing>)
  ATR-based:      <p>  (1.5×ATR)
  Final stop:     <p>   distance: <X%>   in R terms: 1.0

Take-profit ladder
  TP1: <p>  (<+1R / next resistance>)   close 33%   move stop to BE
  TP2: <p>  (<+2R / major level>)        close 33%
  TP3: <p>  (<+3R / stretch>)            runner, trail with 1×ATR

Time stop
  Close if no progress in <N> bars on <TF>  (deadline: <date>).

Sizing  (from crypto-risk-manager)
  Capital: <X>  Risk: <r%>  Risk amount: <amt>
  Position: <coin> <COIN>  ≈ <notional> USDT
  Perp only: leverage <L>×  required margin <m> USDT  est. liq <p>

Liquidity sanity (from exchange-liquidity-check)
  ±0.5% depth: bid $<x> / ask $<y>
  Estimated slippage at planned size: <bps> bps
  Verdict: <OK / CAUTION / THIN>

Risk gate: <GO / NO-GO>

Pre-trade checklist
  [ ] Setup still valid (price still in entry zone, structure intact)
  [ ] No upcoming high-impact event in next <X> hours (CPI, FOMC, major listing)
  [ ] Liquidity verdict still OK
  [ ] (perp) Funding still acceptable for direction
  [ ] Daily loss cap not breached
  [ ] You can lose this entire R-amount and your week is fine

Invalidation conditions (any of these → abandon plan)
  · Close beyond stop on the chosen TF
  · Time stop hit with no progress
  · Major news that invalidates the thesis
  · Liquidity collapses (spread > X bps or depth halves)

Next step
  · To draft the actual orders: call exchange-order-planner with this plan.
  · To simulate first: call exchange-paper-trading.
  · To execute (last resort, opt-in): call exchange-trading-executor with explicit CONFIRM.
```

---

## Edge Cases

- **No clear setup** (ranging with no edge): return "no trade", explain why, suggest revisit conditions.
- **Counter-trend short with positive funding:** harder than long with the trend; raise the risk gate threshold and require user acknowledgment.
- **Tiny stop distance (<0.3%):** likely noise — widen the stop or skip the trade. Don't compute a comically-large position size for a tight stop.
- **Wide stop with poor R:R (<1:1.5):** flag and suggest waiting for a better entry zone.
- **News-driven move in progress:** plan around the news, not against it. Wait for the first retracement and re-plan.
- **Multiple TFs disagree strongly:** lower confidence, mention it, prefer the higher TF.

---

## Handoff

- Calls: `crypto-technical-analysis`, `crypto-futures-analysis` (if perp), `exchange-liquidity-check`, `crypto-risk-manager`.
- Output consumed by: `exchange-order-planner`, `exchange-paper-trading`, `crypto-report`.

---

## Example Commands

```
/crypto-entry-exit-plan pair=BTC/USDT exchange=binance market=spot direction=long timeframe=4h capital=1000 risk_pct=1
/crypto-entry-exit-plan pair=ETH/USDT exchange=okx market=perp direction=long leverage=5 timeframe=1h
/crypto-entry-exit-plan pair=SOL/USDT exchange=binance bias=breakout timeframe=15m
/crypto-entry-exit-plan pair=BILL/USDT exchange=okx market=spot direction=auto
```

Arabic:
```
/crypto-entry-exit-plan خطة دخول وخروج BTC/USDT على Binance
/crypto-entry-exit-plan خطة Long على ETH/USDT perp OKX برافعة 5
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
