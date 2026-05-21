---
name: crypto-compare-pairs
description: Side-by-side comparison of two or more crypto pairs on Binance or OKX across price action, technical structure, momentum, volume, liquidity, funding (perp only), and a composite ranking. Use this skill whenever the user asks "compare X and Y", "BTC/USDT vs ETH/USDT", "which is stronger", "rank these pairs", "BILL vs PLAY", "should I trade SOL or AVAX". Returns a head-to-head matrix and an overall winner per dimension. Does not produce a trade plan — for that, run crypto-entry-exit-plan on the winner.
version: 1.0.0
category: analysis
compatible_with: [claude-code, openclaw, cursor, hermes]
exchanges: [binance, okx]
mode: analysis
license: MIT
---

# Crypto Compare Pairs

Head-to-head comparison of 2–6 pairs. Combines market-scan, technicals, liquidity, and (for perp) funding into one ranking table.

## Purpose

Side-by-side comparison of two or more crypto pairs on Binance or OKX across price action, technical structure, momentum, volume, liquidity, funding (perp only), and a composite ranking. Use this skill whenever the user asks "compare X and Y", "BTC/USDT vs ETH/USDT", "which is stronger", "rank these pairs", "BILL vs PLAY", "should I trade SOL or AVAX". Returns a head-to-head matrix and an overall winner per dimension. Does not produce a trade plan — for that, run crypto-entry-exit-plan on the winner.

This skill is part of the **crypto-exchange-agent-skills-suite**. See [`../../docs/architecture.md`](../../docs/architecture.md) for how it fits with the other 20 skills.

---

> **Disclaimer:** Educational only. "Winner" of the comparison is the higher composite score, not a recommendation.

---

## When to Use

- "compare BTC/USDT and ETH/USDT"
- "BILL vs PLAY on OKX"
- "which is the better setup — SOL or AVAX"
- "rank BTC ETH SOL XRP"
- the user names 2+ pairs and wants a side-by-side or a ranking

---

## Required Inputs

| Input | Required? | Example | Notes |
|-------|-----------|---------|-------|
| `pairs` | yes | `BTC/USDT, ETH/USDT, SOL/USDT` | 2–6 pairs |
| `exchange` | yes | `binance` / `okx` / per-pair | If pairs are on different exchanges, allow it |
| `market_type` | yes | `spot` / `perp` | Must be the same across pairs for fairness |
| `timeframe` | optional | `1h` / `4h` / `1d`. Default `1h`. |
| `weights` | optional | override default scoring weights |

---

## Workflow

### Step 1 — Validate listings
For each pair, call `exchange-pair-finder` (cached) to confirm the pair trades on the named exchange with the named market type. Drop or warn on missing.

### Step 2 — Pull data per pair
In parallel (or sequentially if the runtime doesn't support parallelism):
- `binance-market-scan` or `okx-market-scan` → ticker, 24h stats, candles
- `crypto-technical-analysis` → Technical Score
- `exchange-liquidity-check` → Liquidity Score
- `crypto-futures-analysis` if perp → Funding/OI Score

### Step 3 — Compute per-dimension scores

Each pair gets scores on:

| Dimension | What it measures |
|-----------|------------------|
| Trend | EMA stack, slope, HTF agreement |
| Momentum | RSI, MACD, 24h move |
| Volume | 24h quote vol absolute + volume-vs-average |
| Liquidity | Spread + depth |
| Volatility | ATR / price |
| Funding (perp) | Sign and magnitude favoring the assumed direction |
| Risk/Reward to nearest level | distance to nearest resistance vs support |

### Step 4 — Normalize and rank

Within the comparison set:
- For each dimension, rank pairs 1..N.
- Composite = weighted sum (defaults below).

```
Default weights:
  Trend         25
  Momentum      20
  Volume        15
  Liquidity     15
  Volatility    10
  Funding       10  (perp only; reallocated equally if spot)
  R:R           5
```

### Step 5 — Output

A comparison matrix (rows = pairs, columns = dimensions) plus a ranked summary plus a 2–3 line narrative on what differentiates them.

---

## Output Format

```
Compare · <EXCHANGE(s)> · <market_type> · TF=<tf>
Pairs: BTC/USDT, ETH/USDT, SOL/USDT

Dimension matrix (raw)
Dimension       | BTC        | ETH        | SOL
----------------+-----------+-----------+----------
Price (last)    | 65420     | 3520      | 195
24h %           | +1.1%     | +0.4%     | +5.2%
7d %            | +3.4%     | -1.2%     | +12.0%
24h Vol (USDT)  | $12.0B    | $7.8B     | $1.8B
Spread (bps)    | 0.2       | 0.2       | 0.8
Depth ±0.5%     | $4.5M     | $2.1M     | $300k
Trend (TF)      | uptrend   | ranging   | strong-up
RSI(14, TF)     | 58        | 51        | 71
ATR %           | 0.6%      | 0.8%      | 2.1%
Funding (perp)  | +0.008%   | +0.005%   | +0.025%

Score matrix (0–100)
Dimension       | BTC | ETH | SOL
----------------+-----+-----+-----
Trend           | 70  | 50  | 88
Momentum        | 60  | 50  | 82
Volume          | 95  | 80  | 55
Liquidity       | 98  | 92  | 72
Volatility      | 50  | 55  | 70
Funding         | 70  | 75  | 50
R:R             | 60  | 55  | 65
----------------+-----+-----+-----
Composite       | 73  | 62  | 75

Ranking
  1. SOL/USDT  (75)   — strongest trend + momentum, lower liquidity
  2. BTC/USDT  (73)   — solid all-around, best liquidity
  3. ETH/USDT  (62)   — ranging, no edge right now

Narrative
  · SOL has the strongest momentum and trend, but its higher ATR and tighter liquidity mean position sizes must be smaller to stay within the same risk.
  · BTC offers the cleanest execution at any size; trade-off is less directional energy.
  · ETH is the laggard this look; consider waiting for it to either lead or break range.

Suggested next steps
  · Want a full plan on the top pair? → /crypto-entry-exit-plan pair=<top>
  · Want to add all of these to your watchlist? → /crypto-watchlist add ...
```

---

## Edge Cases

- **Pairs on different exchanges:** allowed, but state explicitly per row. Note that scores aren't perfectly comparable (different fee tiers, different depth profiles).
- **One pair has perp, the other doesn't:** lower the Funding weight to zero for the spot-only pair; reallocate to other dimensions.
- **Very different market caps:** normalize Volume on a log scale or compare rank, not absolute.
- **Stablecoin in the set** (BUSD, USDC vs USDT): skip — peg pairs aren't directional.
- **6+ pairs:** suggest narrowing down or use `crypto-watchlist rank` instead.

---

## Handoff

- Calls (per pair): `exchange-pair-finder`, market-scan, `crypto-technical-analysis`, `exchange-liquidity-check`, `crypto-futures-analysis`.
- Hands off the winner to `crypto-entry-exit-plan` if user wants to act on the result.
- Output can be embedded in `crypto-report`.

---

## Example Commands

```
/crypto-compare-pairs BTC/USDT ETH/USDT exchange=binance market=spot
/crypto-compare-pairs BTC/USDT ETH/USDT SOL/USDT exchange=okx market=perp timeframe=4h
/crypto-compare-pairs BILL/USDT PLAY/USDT exchange=okx market=spot
/crypto-compare-pairs SOL/USDT XRP/USDT AVAX/USDT exchange=binance timeframe=1d
```

Arabic:
```
/crypto-compare-pairs قارن BTC/USDT و ETH/USDT على Binance
/crypto-compare-pairs قارن BILL/USDT و PLAY/USDT على OKX
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
