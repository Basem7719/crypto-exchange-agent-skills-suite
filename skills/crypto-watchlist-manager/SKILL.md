---
name: crypto-watchlist-manager
description: Build, score, and maintain a watchlist of crypto pairs on Binance and OKX with per-pair scores (technical, liquidity, momentum, risk) and condition-based alerts (price above/below, RSI cross, funding flip, volume spike, breakout of level). Use this skill whenever the user mentions "watchlist", "track these pairs", "monitor X Y Z", "alert me when", "add to my list", "show me my watchlist", "remove from watchlist", "rank my watchlist". Stores the list as a markdown file (or persistent storage if available in the runtime). Does NOT execute trades — purely a tracking and ranking tool.
version: 1.0.0
category: monitoring
compatible_with: [claude-code, openclaw, cursor, hermes]
exchanges: [binance, okx]
mode: analysis
license: MIT
---

# Crypto Watchlist

Build and maintain a watchlist with composite scoring across Binance and OKX. Persistent across sessions (via file or runtime storage).

## Purpose

Build, score, and maintain a watchlist of crypto pairs on Binance and OKX with per-pair scores (technical, liquidity, momentum, risk) and condition-based alerts (price above/below, RSI cross, funding flip, volume spike, breakout of level). Use this skill whenever the user mentions "watchlist", "track these pairs", "monitor X Y Z", "alert me when", "add to my list", "show me my watchlist", "remove from watchlist", "rank my watchlist". Stores the list as a markdown file (or persistent storage if available in the runtime). Does NOT execute trades — purely a tracking and ranking tool.

This skill is part of the **crypto-exchange-agent-skills-suite**. See [`../../docs/architecture.md`](../../docs/architecture.md) for how it fits with the other 20 skills.

---

> **Disclaimer:** Educational only. The watchlist score is a heuristic, not a recommendation to buy or sell.

---

## When to Use

- "add BTC, ETH, SOL to my watchlist"
- "show me my watchlist"
- "rank my watchlist by momentum"
- "remove DOGE from my list"
- "alert me when SOL/USDT > 200"
- "what's the top scoring pair on my watchlist right now"

---

## Required Inputs

| Action | Inputs |
|--------|--------|
| `add` | one or more pairs, exchange, optional notes |
| `remove` | pair (and exchange if pair exists on both lists) |
| `list` | optional sort criterion |
| `rank` | scoring weights (default predefined) |
| `alert add` | pair, condition, threshold |
| `alert list` | — |
| `alert remove` | alert id |
| `refresh` | force re-pull all current prices and scores |

---

## Data Model

Persist a list (one entry per pair-exchange combination):

```yaml
- pair: BTC/USDT
  exchange: binance
  market_type: spot
  added_at: 2026-05-20T12:00:00Z
  notes: "swing trade idea"
  tags: [large-cap, trend]
  alerts:
    - id: a1
      condition: price_above
      threshold: 70000
    - id: a2
      condition: rsi_above
      threshold: 70
      timeframe: 4h
```

Storage:
- Claude Code: `~/.claude/data/watchlist.yaml`
- OpenClaw / Cursor: write to the project root as `WATCHLIST.yaml`
- If runtime has persistent KV store (e.g., `window.storage` in browser): use `watchlist:entries` key, JSON-encoded.

Never store API keys here. This file is plain-text and may be shared with collaborators.

---

## Composite Score (0–100)

For each pair, compute on a fixed TF (default 1h, configurable):

| Component | Weight | Source |
|-----------|--------|--------|
| Technical Score | 35 | `crypto-technical-analysis` |
| Liquidity Score | 20 | `exchange-liquidity-check` |
| Momentum (24h % + 7d %) | 15 | market-scan |
| Volume tier (24h quote vol) | 10 | market-scan |
| Funding alignment (perp only, else neutral) | 10 | `crypto-futures-analysis` |
| Volatility regime (ATR percentile) | 10 | technical |

Rank from highest to lowest.

---

## Alert Conditions

| Condition | Inputs | Triggers when |
|-----------|--------|---------------|
| `price_above` | threshold | last > threshold |
| `price_below` | threshold | last < threshold |
| `rsi_above` | threshold, timeframe | RSI(14, tf) > threshold |
| `rsi_below` | threshold, timeframe | RSI(14, tf) < threshold |
| `ema_cross` | fast, slow, direction | fast EMA crosses slow |
| `vol_spike` | multiple (default 3) | last bar volume ≥ multiple × 20-period avg |
| `funding_flip` | direction | funding sign changes (perp only) |
| `oi_change` | pct, window | OI changes by ≥ pct over window |
| `breakout` | level | candle closes above/below level on TF |

Alerts are evaluated when the user calls `refresh` or `check-alerts`. The skill does NOT run a background loop — it must be triggered by the user or by the host environment's scheduler.

---

## Workflow

### Step 1 — Load the watchlist
Read from storage. If empty, prompt the user to add pairs.

### Step 2 — Execute the requested action
- `add`: validate listing via `exchange-pair-finder`, then append.
- `remove`: confirm exact (pair, exchange) match.
- `list`: load + display.
- `rank`: pull market data for each entry, compute score, sort.
- `alert *`: manage alerts as listed above.
- `refresh`: re-pull prices, re-compute scores, evaluate alerts.

### Step 3 — Display
Show a compact table.

---

## Output Format

For `list` / `rank`:

```
Watchlist (sorted by composite score)

Rank | Pair        | Exchange | TF  | Score | Trend       | 24h%   | Vol(24h)  | Notes
-----+-------------+----------+-----+-------+-------------+--------+-----------+--------
  1  | SOL/USDT    | okx      | 1h  |  78   | strong-up   | +5.2%  | $1.8B     | swing
  2  | BTC/USDT    | binance  | 4h  |  71   | uptrend     | +1.1%  | $12B      | core
  3  | ETH/USDT    | binance  | 4h  |  65   | ranging     | +0.4%  | $8B       | range
  4  | BILL/USDT   | okx      | 1h  |  44   | downtrend   | -3.0%  | $4M       | thin
  5  | PLAY/USDT   | okx      | 1h  |  38   | weakening   | -2.5%  | $2M       | thin

Triggered alerts (since last refresh):
  · SOL/USDT crossed above 200 USDT at 13:42 UTC.
  · ETH/USDT RSI(4h) crossed above 70 at 12:15 UTC.

Pending alerts: 6 active
```

For `add`:

```
Added 3 pairs:
  + SOL/USDT (okx, spot)
  + BTC/USDT (binance, spot)
  + ETH/USDT (binance, spot)
Total watchlist: 12 entries.
```

For `alert add`:

```
Alert created:
  id=a47  pair=SOL/USDT (okx)  condition=price_above  threshold=210
Will trigger on next refresh.
```

---

## Edge Cases

- **Same pair on both exchanges:** treat as two distinct entries. Allow.
- **Delisted while on watchlist:** mark with `state=delisted`, skip in ranking, prompt user to remove.
- **Mass refresh of >50 pairs:** batch the market-scan calls; expect ~10–30s.
- **No persistent storage:** session-only watchlist; warn the user it won't survive a new conversation.
- **Conflicting weight overrides:** if user passes weights summing to ≠100, normalize.

---

## Handoff

- Calls `exchange-pair-finder` to validate adds.
- Calls `binance-market-scan` / `okx-market-scan` / `crypto-technical-analysis` / `crypto-futures-analysis` / `exchange-liquidity-check` for refresh.
- Top-ranked pair can be auto-handed to `crypto-entry-exit-plan` if the user asks "plan the top pair".

---

## Example Commands

```
/crypto-watchlist add BTC/USDT ETH/USDT SOL/USDT exchange=binance
/crypto-watchlist add BILL/USDT PLAY/USDT exchange=okx
/crypto-watchlist list
/crypto-watchlist rank by=score tf=4h
/crypto-watchlist alert add pair=SOL/USDT exchange=okx condition=price_above threshold=210
/crypto-watchlist alert add pair=BTC/USDT exchange=binance condition=rsi_above threshold=70 timeframe=4h
/crypto-watchlist refresh
/crypto-watchlist remove DOGE/USDT exchange=binance
```

Arabic:
```
/crypto-watchlist أضف BTC ETH SOL على Binance
/crypto-watchlist رتب القائمة حسب النقاط
/crypto-watchlist تنبيه لو SOL/USDT تجاوز 210
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
