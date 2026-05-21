---
name: crypto-futures-analysis
description: Analyze perpetual/futures contracts on Binance USDS-M and OKX SWAP — funding rate (current + history), open interest and OI changes, basis vs spot, long/short ratios, taker buy/sell volume, mark vs index price, liquidation context, and leverage suggestions. Use this skill whenever the user mentions perpetuals, swaps, futures, funding, leverage, long/short, liquidations, "perp", or asks "should I long/short X" on a derivatives market. Combines positioning data with technicals to score the futures setup. For pure spot analysis use crypto-spot-analysis; for indicator-only work use crypto-technical-analysis.
version: 1.0.0
category: analysis
compatible_with: [claude-code, openclaw, cursor, hermes]
exchanges: [binance, okx]
mode: analysis
license: MIT
---

# Crypto Futures / Perpetual Analysis

End-to-end derivatives analysis on Binance USDS-M Futures and OKX SWAP: funding, OI, positioning, basis, mark/index, and a futures-specific setup score.

## Purpose

Analyze perpetual/futures contracts on Binance USDS-M and OKX SWAP — funding rate (current + history), open interest and OI changes, basis vs spot, long/short ratios, taker buy/sell volume, mark vs index price, liquidation context, and leverage suggestions. Use this skill whenever the user mentions perpetuals, swaps, futures, funding, leverage, long/short, liquidations, "perp", or asks "should I long/short X" on a derivatives market. Combines positioning data with technicals to score the futures setup. For pure spot analysis use crypto-spot-analysis; for indicator-only work use crypto-technical-analysis.

This skill is part of the **crypto-exchange-agent-skills-suite**. See [`../../docs/architecture.md`](../../docs/architecture.md) for how it fits with the other 20 skills.

---

> **Disclaimer:** Educational only. Leverage trading carries an outsized risk of total capital loss; mention this explicitly in every output. Skill must NEVER recommend specific leverage levels above 5× without explicit user request, and even then only as math, not as advice.

---

## When to Use

- "should I long BTC perp on OKX"
- "what's the funding rate on ETH/USDT-SWAP"
- "open interest on SOL perp"
- "long/short ratio for BTC futures"
- "is the basis stretched"
- "is now a good time to short XYZ perp"
- the user explicitly says "perp", "perpetual", "swap", "futures", "leverage", "funding", "liquidation"

If the user wants pure spot → `crypto-spot-analysis`. If they want indicators → `crypto-technical-analysis`.

---

## Required Inputs

| Input | Required? | Example |
|-------|-----------|---------|
| `pair` | yes | `BTC/USDT` (resolve to perp symbol per exchange) |
| `exchange` | yes | `binance` (USDS-M) or `okx` (SWAP) |
| `direction` | optional | `long` / `short` / `auto` |
| `timeframe` | optional | `15m` / `1h` / `4h`. Default `1h`. |
| `lookback` | optional | candles + funding history. Default 200 candles, 30 funding intervals. |

---

## Workflow

### Step 1 — Resolve the symbol per exchange

| Exchange | Perp symbol for BTC/USDT |
|----------|--------------------------|
| Binance USDS-M | `BTCUSDT` (on `fapi`) |
| OKX SWAP | `BTC-USDT-SWAP` |

### Step 2 — Pull derivatives data

Call `binance-market-scan` or `okx-market-scan` for:
- Mark price + index price + funding (current + last 30 funding intervals)
- Open interest now + OI history (1h × 24+ bars)
- Long/short account ratio + top trader position ratio (Binance) OR long-short-account-ratio (OKX rubik)
- Taker buy/sell volume
- Klines (200 bars)
- Spot price of the same pair for basis calculation

### Step 3 — Compute derivatives metrics

| Metric | Method |
|--------|--------|
| **Funding now** | rate as % per period and annualized (×3 for 8h or ×8 for 1h on some pairs) |
| **Funding trend** | mean of last N periods, direction (rising/falling), sign flips |
| **OI Δ 24h / 7d** | % change of open interest |
| **OI / volume ratio** | flags "all OI, no flow" (often before squeezes) |
| **Long/short skew** | top trader L/S ratio and global L/S ratio — divergences are noteworthy |
| **Basis** | (perp_mark − spot_mid) / spot_mid in bps; positive = contango; large positive = retail euphoria; deeply negative = panic |
| **Taker pressure** | buy vol / (buy+sell) over last hour |
| **Mark vs Index** | normally close; large gap = squeeze risk |
| **Liquidation proximity (educational)** | for a hypothetical 5×/10×/20× long or short from current price, estimate liquidation distance from MMR ≈ 0.5%–1% (varies by exchange). State as raw math; do NOT recommend a specific leverage. |

### Step 4 — Score the futures setup (0–100)

Composite (different from spot — positioning matters more):
- Trend + momentum (25 pts) — from technicals
- Funding alignment with direction (20 pts) — paying funding to be long when funding is +0.10% / 8h is a tax; getting paid is a tailwind
- OI behavior (15 pts) — rising OI with price = trend continuation; rising OI with stagnant price = leverage build-up, watch
- Positioning skew (15 pts) — extreme one-sided positioning often precedes a flush
- Basis (10 pts) — extreme contango/backwardation
- Liquidity (15 pts) — depth on the perp + mark-vs-index health

### Step 5 — Output a long-bias / short-bias / neutral verdict

Plus a short narrative on what would invalidate it.

---

## Output Format

```
Futures Analysis · <EXCHANGE> · <PERP_SYMBOL> · TF=<tf>

Snapshot
  Mark: <p>   Index: <i>   Basis: <bps> bps
  24h: <±%>   24h Vol: <quote_vol>
  Funding (current): <rate>%  ≈ <annualized>% APR
  Funding (last 8 periods avg): <avg>%   trend: <rising/falling/flat>

Open Interest
  OI now: <oi> contracts  ≈ $<oi_usd>
  OI 24h Δ:  <±%>     OI 7d Δ:  <±%>
  OI / 24h Vol: <ratio>  → <flow-driven / leverage-driven>

Positioning
  Top trader L/S (Binance) or L/S account ratio (OKX): <ratio>
  Global L/S: <ratio>
  Taker buy/sell (1h): <buy%> / <sell%>

Liquidation math (educational — NOT a recommendation)
  Long 5×:  liq at ≈ <p>  (-<%> from mark)
  Long 10×: liq at ≈ <p>  (-<%> from mark)
  Short 5×: liq at ≈ <p>  (+<%> from mark)
  Short 10×: liq at ≈ <p> (+<%> from mark)

Score: <0–100>
Bias: <long / short / neutral / wait>
Why: <2–3 lines tying funding + OI + positioning + trend together>
Invalidation: <level/condition>
Leverage caution: trading derivatives can lose more than your initial margin within minutes.
```

---

## Edge Cases

- **No funding data:** the pair might be a calendar future, not a perpetual. Switch to basis-only analysis.
- **Funding spike (>0.1% / 8h):** flag as a "crowded long" signal. Doesn't mean it must reverse, but it raises risk.
- **OI dropping while price holds:** position unwind, often a topping/bottoming signal. Worth highlighting.
- **Negative basis on perp vs spot:** rare and noteworthy — often signals short-squeeze setup.
- **Highly illiquid perp:** if 24h volume < $5M, treat liquidation math as approximate; slippage will be the larger risk.
- **Newly-listed perp:** the first 7–14 days have unstable funding and OI patterns; flag and reduce confidence.

---

## Handoff

- Pulls raw data from `binance-market-scan` / `okx-market-scan`.
- Calls `crypto-technical-analysis` for the technical component.
- Feeds `crypto-entry-exit-plan` (with leverage notes).
- Feeds `crypto-risk-manager` (which translates leverage into actual position size and stop math).
- Feeds `crypto-report`.

---

## Example Commands

```
/crypto-futures-analysis BTC/USDT exchange=okx
/crypto-futures-analysis ETH/USDT exchange=binance direction=long
/crypto-futures-analysis SOL/USDT exchange=okx timeframe=4h
/crypto-futures-analysis BTC perp funding only
```

Arabic:
```
/crypto-futures-analysis حلل BTC perpetual على OKX
/crypto-futures-analysis تمويل وفائدة مفتوحة ETH/USDT على Binance
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
