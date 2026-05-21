---
name: crypto-risk-manager
description: Compute position size, stop loss, take profit ladders, max-loss per trade, daily max-loss caps, leverage math, and a go/no-go risk gate before any spot or futures trade on Binance or OKX. Use this skill whenever the user mentions "how much to buy", "position size", "stop loss", "risk per trade", "how much can I lose", "is this trade size OK", "leverage", "1% risk", "Kelly", or asks for any sizing math. Also use as the mandatory gate before crypto-entry-exit-plan, exchange-order-planner, or exchange-trading-executor. Never recommends trades — only computes risk math from user-supplied account size and risk tolerance.
version: 1.0.0
category: risk
compatible_with: [claude-code, openclaw, cursor, hermes]
exchanges: [binance, okx]
mode: both
license: MIT
---

# Crypto Risk Manager

Computes position size, stop loss, take profit, and a go/no-go risk gate. Pure math — no recommendations.

## Purpose

Compute position size, stop loss, take profit ladders, max-loss per trade, daily max-loss caps, leverage math, and a go/no-go risk gate before any spot or futures trade on Binance or OKX. Use this skill whenever the user mentions "how much to buy", "position size", "stop loss", "risk per trade", "how much can I lose", "is this trade size OK", "leverage", "1% risk", "Kelly", or asks for any sizing math. Also use as the mandatory gate before crypto-entry-exit-plan, exchange-order-planner, or exchange-trading-executor. Never recommends trades — only computes risk math from user-supplied account size and risk tolerance.

This skill is part of the **crypto-exchange-agent-skills-suite**. See [`../../docs/architecture.md`](../../docs/architecture.md) for how it fits with the other 20 skills.

---

> **Disclaimer:** Educational only. The math is correct; the trade decision is yours. Crypto can gap, exchanges can halt withdrawals, stops can slip. Real risk often exceeds modeled risk. Never risk more than you can afford to lose entirely.

---

## When to Use

- "how much BTC should I buy at this price"
- "what's the position size for ETH/USDT if I risk 1%"
- "where should my stop be"
- "is 10× leverage safe on this trade"
- "what's my max-loss for the day"
- the user mentions risk %, capital, position size, stop loss, leverage, Kelly, R-multiple

This skill is **mandatory** before `crypto-entry-exit-plan`, `exchange-order-planner`, or `exchange-trading-executor`.

---

## Required Inputs

| Input | Required? | Example | Default |
|-------|-----------|---------|---------|
| `capital` | yes | `1000` (USDT) | — |
| `risk_pct` | yes | `1` (% of capital per trade) | `1%` |
| `entry` | yes | `65000` | — |
| `stop` | yes | `63500` (or compute via ATR if not given) | ATR×1.5 below entry |
| `targets` | optional | `66500, 68000, 70000` | compute from R-multiples |
| `direction` | yes | `long` / `short` | `long` |
| `pair` | yes | `BTC/USDT` | — |
| `exchange` | yes | `binance` / `okx` | — |
| `market_type` | yes | `spot` / `perp` | `spot` |
| `leverage` | optional, perp only | `5`× | `1`× |
| `account_currency` | optional | `USDT` | `USDT` |
| `daily_loss_cap_pct` | optional | `3` (% of capital/day) | `3%` |
| `max_concurrent_trades` | optional | `3` | `3` |

---

## Core Math

### Position size (R-based)

```
risk_amount = capital × (risk_pct / 100)
stop_distance = |entry − stop|
position_size_coin = risk_amount / stop_distance
position_size_quote = position_size_coin × entry
```

### Notional and margin (perp)

```
notional = position_size_coin × entry
required_margin = notional / leverage
risk_to_margin = risk_amount / required_margin  (informational ratio)
```

### Liquidation distance (educational, per-exchange MMR varies)

For Binance USDS-M cross at small size, approximate maintenance margin rate at lower tiers:
- BTC/ETH: ~0.4%
- Top-50: ~0.5%–1%
- Small caps: 1%–2.5%

```
liq_long  ≈ entry × (1 − 1/leverage + mmr)
liq_short ≈ entry × (1 + 1/leverage − mmr)
```

This is an estimate; the exchange's calculator is authoritative. Always say so.

### Take profit ladder

If user gives no targets, propose R-multiples:
- TP1 = entry + 1R (long) — close 1/3, move stop to breakeven
- TP2 = entry + 2R — close 1/3
- TP3 = entry + 3R — runner

### Fees impact

Binance spot taker ≈ 0.10% (lower with BNB/VIP). USDS-M taker ≈ 0.04%.
OKX spot taker ≈ 0.08%. SWAP taker ≈ 0.05%.
Funding (perp): add to or subtract from holding cost. Pull from `okx-market-scan` / `binance-market-scan`.

Round-trip fee estimate for the calculation:
```
fee_cost = 2 × fee_rate × notional
real_R = (target_distance − fee_cost/position_size_coin) / stop_distance
```

Flag when fees eat >10% of the planned R.

### Daily / weekly caps

Apply the daily_loss_cap_pct as a hard ceiling — total losses across all trades today should not exceed it. State remaining capacity each time.

---

## Workflow

### Step 1 — Validate inputs
- `capital > 0`
- `0 < risk_pct ≤ 2` is sane; >5% is high-risk — flag clearly, do not silently accept
- `stop` and `entry` must be on the correct side for the direction
- For perp: `1 ≤ leverage ≤ 50` and remind: higher leverage just changes margin, NOT the risk-per-trade math; risk_pct already captures real risk

### Step 2 — Compute the four numbers
- position_size_coin
- position_size_quote (notional)
- required_margin (perp)
- liq distance (perp)

### Step 3 — Build the take-profit ladder
If user supplied targets, use them. Otherwise propose 1R/2R/3R.

### Step 4 — Apply the go/no-go gate

Block (return `NO-GO`) if any of:
- risk_pct > 5%
- stop_distance > 25% of entry (you're using too wide a stop; consider a different setup)
- stop_distance < 0.2% of entry (too tight; will be stopped out by noise)
- liq distance < 1.5× stop distance (your position will hit liquidation before stop in many cases)
- daily_loss_cap already breached
- fee_cost > 25% of risk_amount (the trade is structurally unprofitable)

Otherwise return `GO` with all the math.

---

## Output Format

```
Risk Math · <PAIR> · <EXCHANGE> · <market_type> · <direction>

Inputs
  Capital: <X> USDT     Risk per trade: <r%>     Daily cap: <d%>
  Entry: <e>            Stop: <s>     Targets: <t1, t2, t3>
  Leverage (perp only): <L>×

Sizing
  Risk amount: <amt> USDT
  Stop distance: <d> USDT  (<pct%>)
  Position size: <coin> <COIN>  ≈ <notional> USDT
  [Perp] Required margin: <m> USDT
  [Perp] Estimated liquidation: <liq>  (distance: <pct%>, ratio to stop: <x>×)

Take-Profit Ladder
  TP1 (1R): <p>   close 1/3   move stop to breakeven
  TP2 (2R): <p>   close 1/3
  TP3 (3R): <p>   runner, trail with ATR

Fees
  Round-trip estimate: <fee> USDT  (<pct%> of risk)
  Adjusted R after fees: <real_R>

Risk Gate: <GO / NO-GO>
Reasons:
  - <each blocker if NO-GO>
  - or "all checks passed" if GO

Reminders
  · Real fills slip on small caps. Use limit orders.
  · Stops can gap on news. Consider reduced size around catalysts.
  · Daily P&L so far: <X> / <cap>
```

---

## Edge Cases

- **No stop given:** compute one with ATR(14) × 1.5 from `crypto-technical-analysis`. Always tell the user you derived it.
- **Very small caps (BILL, PLAY):** depth is so thin that the modeled R is unreachable; flag and suggest cutting size by 2–5×.
- **High funding rate (perp):** if funding is paying ≥0.05% / 8h against your direction, factor 24h holding cost into the R math; over a multi-day trade this can flip the trade negative.
- **Multiple open positions:** check correlation. BTC, ETH, SOL are highly correlated; three concurrent longs is effectively one BTC long at 3× the risk. Reduce per-trade risk_pct accordingly.
- **Leverage misunderstanding:** if user says "I want to risk $50 at 10× leverage on BTC" — make clear: $50 is the *risk*, leverage just changes margin. The position size is determined by the stop distance, not the leverage. Re-derive the proper math.

---

## Handoff

- Reads ATR + price from `crypto-technical-analysis`.
- Reads liquidity from `exchange-liquidity-check` to sanity-check whether the computed size is actually executable.
- Reads funding from `crypto-futures-analysis` for holding-cost math.
- Output is consumed by `crypto-entry-exit-plan`, `exchange-order-planner`, and `exchange-trading-executor`.

---

## Example Commands

```
/crypto-risk-manager pair=BTC/USDT capital=1000 risk_pct=1 entry=65000 stop=63500 exchange=binance market=spot
/crypto-risk-manager pair=ETH/USDT capital=500 risk_pct=0.5 entry=3500 stop=3380 direction=long leverage=5 exchange=okx market=perp
/crypto-risk-manager pair=SOL/USDT capital=2000 risk_pct=1 entry=145 stop=142 targets=151,158 exchange=binance
/crypto-risk-manager check daily-cap capital=1000 cap_pct=3 today_loss=20
```

Arabic:
```
/crypto-risk-manager احسب حجم الصفقة pair=ETH/USDT رأسمال=100 مخاطرة=1% منصة=Binance
/crypto-risk-manager نسبة المخاطرة 1% على BTC/USDT بـ 1000 دولار
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
