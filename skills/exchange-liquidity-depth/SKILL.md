---
name: exchange-liquidity-depth
description: Check liquidity, order book depth, spread, slippage estimate, and entry/exit feasibility for any pair on Binance or OKX (spot, perpetual, or futures). Use this skill whenever the user asks "can I trade size X without moving the market", "what's the spread on BILL/USDT", "is there enough liquidity to exit", "depth chart for PLAY/USDT", "slippage estimate for a $5000 order", or before any order plan on a small-cap or new pair. Returns cumulative depth at ±0.1%, ±0.5%, ±1%, estimated slippage for a given size, and a liquidity score.
version: 1.0.0
category: data
compatible_with: [claude-code, openclaw, cursor, hermes]
exchanges: [binance, okx]
mode: analysis
license: MIT
---

# Exchange Liquidity Check

Inspects the order book on Binance or OKX to answer "can I get in/out at this size without paying a big slippage tax."

## Purpose

Check liquidity, order book depth, spread, slippage estimate, and entry/exit feasibility for any pair on Binance or OKX (spot, perpetual, or futures). Use this skill whenever the user asks "can I trade size X without moving the market", "what's the spread on BILL/USDT", "is there enough liquidity to exit", "depth chart for PLAY/USDT", "slippage estimate for a $5000 order", or before any order plan on a small-cap or new pair. Returns cumulative depth at ±0.1%, ±0.5%, ±1%, estimated slippage for a given size, and a liquidity score.

This skill is part of the **crypto-exchange-agent-skills-suite**. See [`../../docs/architecture.md`](../../docs/architecture.md) for how it fits with the other 20 skills.

---

> **Disclaimer:** Order books are snapshots. Real fills depend on conditions at execution time. Spoof orders and quote-stuffing are common on small-cap pairs.

---

## When to Use

- "is BILL/USDT liquid enough"
- "depth of ETH/USDT on OKX"
- "slippage if I market-buy $5k of SOL"
- "spread on PLAY/USDT"
- before `exchange-order-planner` for any non-top-50 pair
- before `crypto-entry-exit-plan` to sanity-check that the planned size is executable

---

## Required Inputs

| Input | Required? | Example | Default |
|-------|-----------|---------|---------|
| `pair` | yes | `BTC/USDT` / `BILL/USDT` | — |
| `exchange` | yes | `binance` / `okx` | — |
| `market_type` | yes | `spot` / `perp` / `futures` | `spot` |
| `size_quote` | optional | `5000` (USDT to buy/sell) | — |
| `size_base` | optional | `0.1` (BTC) | — |
| `direction` | optional | `buy` / `sell` | `both` |

---

## Workflow

### Step 1 — Fetch the order book
- Binance spot: `GET /api/v3/depth?symbol=BILLUSDT&limit=500`
- Binance perp: `GET /fapi/v1/depth?symbol=BILLUSDT&limit=500`
- OKX: `GET /api/v5/market/books?instId=BILL-USDT&sz=400`

Request the maximum depth allowed.

### Step 2 — Compute spread and depth bands

```
mid = (best_ask + best_bid) / 2
spread_bps = (best_ask - best_bid) / mid × 10000
```

Cumulative depth bands (both sides):
- ±0.1% from mid (very tight)
- ±0.5% from mid (typical)
- ±1% from mid (wider)
- ±2% from mid

For each band, compute total notional (USDT) and total base size.

### Step 3 — Slippage estimate for a target size

If `size_quote` or `size_base` is provided, walk the book level by level on the relevant side until size is filled. Output:
- avg_fill_price
- worst_fill_price
- slippage_bps vs mid
- depth_exhausted? (true if size exceeds book within ±2%)

### Step 4 — Score liquidity (0–100)

| Factor | Weight |
|--------|--------|
| Spread (tighter is better) | 25 |
| Cumulative depth at ±0.5% relative to "common" size on that pair (proxy: 1% of 24h volume) | 30 |
| Symmetry — bid vs ask depth (lopsided book is a flag) | 15 |
| Top-level size vs avg level size (book stacked with tiny levels = brittle) | 10 |
| 24h quote volume tier | 20 |

Categorize:
- 80–100: deep / institutional-grade
- 60–79: solid retail liquidity
- 40–59: tradable but be careful with size
- 20–39: thin — limit orders only, small size
- 0–19: untradeable at any meaningful size; high manipulation risk

### Step 5 — Verdict

- `OK` to trade up to size X (compute the max size at ≤30 bps slippage)
- `CAUTION` — quote how much the user can actually move without >50 bps slippage
- `THIN` — strongly suggest limit-only, no market orders

---

## Output Format

```
Liquidity Check · <EXCHANGE> · <PAIR> · <market_type>
Snapshot taken: <ts>

Top of book
  Best bid: <p>  size: <b> <COIN>  ($<usd>)
  Best ask: <p>  size: <a> <COIN>  ($<usd>)
  Mid: <mid>     Spread: <bps> bps

Cumulative depth (both sides combined, in USDT)
  ±0.1%:  bid $<x>  ask $<y>
  ±0.5%:  bid $<x>  ask $<y>
  ±1%:    bid $<x>  ask $<y>
  ±2%:    bid $<x>  ask $<y>

[If size given]
Slippage estimate for <size_quote> USDT <buy/sell>:
  Avg fill: <p>     Worst fill: <p>
  Slippage: <bps> bps
  Depth exhausted: <yes/no>

Liquidity score: <0–100>   Tier: <deep / solid / careful / thin / untradeable>

Max size at ≤30 bps slippage (estimate):
  Buy:  <X> USDT
  Sell: <Y> USDT

Verdict: <OK / CAUTION / THIN>
Notes:
  · <e.g., book is very lopsided — ask side 4× deeper than bid>
  · <e.g., top bid is a single 100 BTC level — likely a spoof or maker MM order>
  · <e.g., 24h vol is $4M, ±0.5% depth $35k → typical for a small-cap>
```

---

## Edge Cases

- **Stale snapshot** (>30s old): tell the user; suggest refreshing.
- **Iceberg / hidden orders:** order book doesn't show them. Real depth may be higher than reported, especially on top venues like Binance.
- **Spoofing:** a giant level near mid that vanishes when you approach. If a single level is >50% of the band, flag it as "single-level-dominant — possible spoof; verify by checking again in 1–2 minutes."
- **Stablecoin pairs** (USDC/USDT): always deep, near-zero spread — short-circuit and return "OK, institutional liquidity."
- **Off-hours / weekend low liquidity:** Sundays UTC and crypto-quiet hours (8–14 UTC) sometimes have 30–50% thinner books. Note time-of-day.
- **News spikes:** order book becomes unreliable during the first 30s of a fast move. Flag.

---

## Handoff

- Pulls depth from `binance-market-scan` / `okx-market-scan`.
- Sanity-checks size proposed by `crypto-risk-manager`.
- Gates `exchange-order-planner` (no orders larger than the OK-tier size unless explicitly overridden).
- Embedded into `crypto-spot-analysis`, `crypto-futures-analysis`, `crypto-entry-exit-plan`.

---

## Example Commands

```
/exchange-liquidity-check BTC/USDT exchange=binance
/exchange-liquidity-check BILL/USDT exchange=okx market=spot size_quote=5000
/exchange-liquidity-check PLAY/USDT exchange=binance size_base=10000 direction=sell
/exchange-liquidity-check ETH/USDT exchange=okx market=perp size_quote=100000
```

Arabic:
```
/exchange-liquidity-check افحص سيولة BILL/USDT على OKX
/exchange-liquidity-check سبريد وعمق BTC/USDT على Binance
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
