---
name: exchange-paper-trading
description: Simulate trades on Binance or OKX without sending real orders — paper-trade entries, stops, take profits, partial fills, slippage, fees, and funding (for perp). Tracks a virtual ledger across sessions. Use this skill whenever the user says "paper trade", "demo trade", "simulate this", "dry run", "what would happen if I bought X at Y", "test this strategy", "track my paper P&L". The skill never touches a real exchange account. It uses live market data (from binance-market-scan / okx-market-scan) and applies realistic fee + slippage models. Both Binance Spot Testnet and OKX Demo mode are supported as optional backends for users who want round-trip API behavior.
version: 1.0.0
category: simulation
compatible_with: [claude-code, openclaw, cursor, hermes]
exchanges: [binance, okx]
mode: simulation
license: MIT
---

# Exchange Paper Trading

Risk-free simulation. Tracks paper positions, P&L, fees, and funding using live market data.

## Purpose

Simulate trades on Binance or OKX without sending real orders — paper-trade entries, stops, take profits, partial fills, slippage, fees, and funding (for perp). Tracks a virtual ledger across sessions. Use this skill whenever the user says "paper trade", "demo trade", "simulate this", "dry run", "what would happen if I bought X at Y", "test this strategy", "track my paper P&L". The skill never touches a real exchange account. It uses live market data (from binance-market-scan / okx-market-scan) and applies realistic fee + slippage models. Both Binance Spot Testnet and OKX Demo mode are supported as optional backends for users who want round-trip API behavior.

This skill is part of the **crypto-exchange-agent-skills-suite**. See [`../../docs/architecture.md`](../../docs/architecture.md) for how it fits with the other 20 skills.

---

> **Hard rule:** This skill must NEVER send orders to a live exchange account, even if API keys are present. The paper ledger is local.

---

## When to Use

- "paper trade SOL/USDT long entry 195 stop 188 tp 210"
- "let me simulate this plan first"
- "open a paper short on BTC perp"
- "show my paper portfolio"
- "close my paper trade in ETH"
- "what's my paper P&L"
- the user explicitly wants no real funds risk

---

## Required Inputs

| Action | Inputs |
|--------|--------|
| `open` | pair, exchange, market_type, side, size (or notional), entry (or `market`), stop, takeprofits, [leverage for perp] |
| `close` | trade_id, optional partial size |
| `list` | optional filter (open / closed / all) |
| `pnl` | period (today / 7d / all) |
| `cancel` | order_id (paper limit/stop orders pending fill) |
| `reset` | wipe paper ledger (confirm) |

---

## Data Model

Persistent ledger (file or runtime KV):

```yaml
account:
  base_currency: USDT
  starting_balance: 10000
  current_balance: 10142.50
  total_realized_pnl: 142.50
  total_unrealized_pnl: 38.20
  open_count: 2
  closed_count: 7

trades:
  - id: t001
    pair: BTC/USDT
    exchange: binance
    market_type: spot
    side: long
    size_coin: 0.05
    entry_price: 65000
    entry_time: 2026-05-20T13:42:00Z
    stop: 63500
    takeprofits: [66500, 68000, 70000]
    state: open       # open | closed | pending_limit | pending_stop
    fills: [{price: 65003, qty: 0.05, fee: 0.0163}]
    unrealized_pnl: 12.50
    realized_pnl: 0
    notes: "swing pullback"
  - id: t002
    pair: ETH/USDT
    exchange: okx
    market_type: perp
    side: short
    size_coin: 1
    leverage: 3
    entry_price: 3520
    entry_time: 2026-05-19T09:15:00Z
    stop: 3580
    takeprofits: [3460, 3400]
    state: closed
    fills: [{price: 3520, qty: 1, fee: 0.88}, {price: 3460, qty: 1, fee: 0.86}]
    realized_pnl: 58.26
```

Storage:
- Claude Code: `~/.claude/data/paper-ledger.yaml`
- OpenClaw / Cursor / Hermes: project root `PAPER-LEDGER.yaml`
- Runtime with KV: `paper:ledger`

---

## Realistic Fill & Cost Model

Don't pretend fills are instant at mid. Apply:

| Cost component | Model |
|----------------|-------|
| Spread | half-spread on market entry/exit |
| Slippage | for size > top-of-book, walk the live book (from market-scan) — same model as `exchange-liquidity-check` |
| Fee (spot) | Binance taker 0.10% / maker 0.075%; OKX taker 0.08% / maker 0.06% (override-able) |
| Fee (perp) | Binance USDS-M taker 0.04% / maker 0.02%; OKX SWAP taker 0.05% / maker 0.02% |
| Funding (perp) | accrue from `okx-market-scan` / `binance-market-scan` funding history every 8h (Binance) or per the OKX schedule |
| Limit orders | fill only when bid ≥ limit (for buy) or ask ≤ limit (for sell), using subsequent candle data |
| Stop orders | fill at worst between stop price and next candle's high/low (gap penalty for perp) |

Mark-to-market updates use the latest price from market-scan whenever the user calls `list` or `pnl`.

---

## Workflow

### `open`
1. Validate inputs (`crypto-risk-manager` style sanity).
2. Fetch live mid + top of book (`exchange-liquidity-check`).
3. Simulate the entry fill:
   - `entry=market` → cross the spread, walk the book if needed.
   - `entry=<price>` → record as pending_limit; fill when the price is touched in subsequent candles.
4. Append to ledger. Return the trade id and an entry confirmation.

### `close`
1. Fetch live price.
2. Cross the spread / walk the book on the exit side.
3. Compute realized P&L:
   - Spot: (exit_avg − entry_avg) × size − fees_total
   - Perp: same plus accumulated funding (sign depends on side)
4. Update ledger state to `closed`.

### `list`
Show all open trades, mark them to market, sum unrealized.

### `pnl`
Aggregate realized P&L over the requested window plus current unrealized.

### `reset`
Require an explicit `CONFIRM RESET` to wipe the ledger.

---

## Output Format

For `open`:

```
Paper trade opened: t003
  Pair: SOL/USDT  Exchange: binance  Market: spot
  Side: LONG    Size: 5.13 SOL  Notional: $1000
  Entry: 195.10 (market, slipped 4 bps from mid)
  Stop: 188.00   Stop distance: 3.6%
  Take profits: 210, 220, 230
  Fees paid: 1.00 USDT (entry)
  Risk amount: 36.50 USDT (3.65% — exceeds 1% rule)
  Note: this exceeds typical 1% risk per trade.
  Ledger balance: 9999.00 USDT  Open trades: 3
```

For `list`:

```
Paper portfolio
Open trades (mark-to-market live)

ID    Pair       Side   Size      Entry    Now       uPnL    uPnL%   State
t001  BTC/USDT   LONG   0.05      65,000   65,420    +21.0   +0.65%  open
t002  ETH/USDT   SHORT  1.00      3,520    3,500     +20.0   +0.57%  open (perp 3×)
t003  SOL/USDT   LONG   5.13      195.10   197.00    +9.7    +0.10%  open

Realized YTD: +142.50 USDT
Unrealized:    +50.7 USDT
Total equity:  10,193.20 USDT  (starting 10,000)
Return:        +1.93%
```

For `pnl`:

```
Paper P&L  · period=7d
Realized:    +85.40 USDT  (8 trades, 5 wins / 3 losses → 62.5% win rate)
Avg win:     +28.10  · Avg loss: −9.80  · Profit factor: 2.86
Largest win:  +52.30  (SOL/USDT)
Largest loss: −18.40  (BNB/USDT)
Unrealized:  +50.70 USDT (3 open trades)
```

---

## Edge Cases

- **Backtest mode:** if user asks "what if I had entered yesterday at X", pull historical candles and replay fills against them. Mark output as "backtest, not paper."
- **Funding accruals on a long-running perp:** must be applied at every 8h boundary the trade was open, not just at close.
- **Multiple opens on the same pair:** allowed — they're independent trades, each with its own id.
- **Reset to a different starting balance:** allowed; require explicit confirm.
- **Stop gap on weekend:** if a stop sits below a weekend gap, fill at the gap-open price (extra slippage), and flag to the user.
- **Pending limit never fills:** mark as `pending_limit` indefinitely; user can cancel.

---

## Handoff

- Calls `binance-market-scan` / `okx-market-scan` for prices, candles, depth, funding.
- Consumes plans from `crypto-entry-exit-plan` for a one-shot open.
- Sanity-checks size against `crypto-risk-manager` (warns but doesn't block — paper is for learning).
- Mirrors `exchange-order-planner`'s order types (market, limit, stop, OCO, TP) so paper behavior matches live behavior.

---

## Example Commands

```
/exchange-paper-trading open pair=SOL/USDT exchange=binance market=spot side=long size=5 entry=market stop=188 tp=210,220
/exchange-paper-trading open pair=BTC/USDT exchange=okx market=perp side=long leverage=5 size_usdt=2000 entry=65000 stop=63800 tp=66500
/exchange-paper-trading list
/exchange-paper-trading pnl period=7d
/exchange-paper-trading close trade_id=t001
/exchange-paper-trading reset
```

Arabic:
```
/exchange-paper-trading افتح صفقة تجريبية Long على SOL/USDT بدون أموال حقيقية
/exchange-paper-trading أعرض محفظتي التجريبية
/exchange-paper-trading أغلق الصفقة t002
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
