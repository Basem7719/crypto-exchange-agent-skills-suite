---
name: exchange-order-planner
description: Convert an entry/exit plan or a user request into a structured set of draft orders for Binance or OKX — market, limit, stop-limit, stop-market, take profit, OCO (Binance spot) or attached TP/SL (OKX), trailing stop, post-only, reduce-only, and time-in-force flags. Use this skill whenever the user says "draft the order", "prepare the orders for this trade", "set up a limit at X with stop at Y", "I want to lay a buy ladder", "OCO for take-profit and stop". Returns a precise spec that exchange-trading-executor (or the user's own CLI/API) can submit. The skill DOES NOT submit orders. Validates symbol filters (tick size, lot size, min notional) before output.
version: 1.0.0
category: planning
compatible_with: [claude-code, openclaw, cursor, hermes]
exchanges: [binance, okx]
mode: both
license: MIT
---

# Exchange Order Planner

Turn a trade plan into clean, exchange-specific order specs. Validates against the exchange's filters (tick size, lot size, min notional). Output is ready to be submitted by `exchange-trading-executor` or pasted into a CLI.

## Purpose

Convert an entry/exit plan or a user request into a structured set of draft orders for Binance or OKX — market, limit, stop-limit, stop-market, take profit, OCO (Binance spot) or attached TP/SL (OKX), trailing stop, post-only, reduce-only, and time-in-force flags. Use this skill whenever the user says "draft the order", "prepare the orders for this trade", "set up a limit at X with stop at Y", "I want to lay a buy ladder", "OCO for take-profit and stop". Returns a precise spec that exchange-trading-executor (or the user's own CLI/API) can submit. The skill DOES NOT submit orders. Validates symbol filters (tick size, lot size, min notional) before output.

This skill is part of the **crypto-exchange-agent-skills-suite**. See [`../../docs/architecture.md`](../../docs/architecture.md) for how it fits with the other 20 skills.

---

> **Hard rule:** This skill NEVER submits orders. It returns specs. Submission requires the user's explicit opt-in via `exchange-trading-executor`.

---

## When to Use

- "draft the orders for this trade"
- "set up an entry limit + stop + TP"
- "OCO for BTC/USDT at 70k TP and 62k stop"
- "buy ladder: 0.1 BTC at 64k, 0.1 at 63.5k, 0.1 at 63k"
- "prepare a trailing stop on my SOL long"
- after `crypto-entry-exit-plan` when the user is ready to act

---

## Required Inputs

| Input | Required? | Example |
|-------|-----------|---------|
| `pair` | yes | `BTC/USDT` |
| `exchange` | yes | `binance` / `okx` |
| `market_type` | yes | `spot` / `usdm` / `coinm` / `swap` / `futures` |
| `side` | yes | `buy` / `sell` (spot) or `long` / `short` (perp) |
| `order_type` | yes | `market` / `limit` / `stop_limit` / `stop_market` / `oco` / `tp_sl` / `trailing` |
| `qty` (or `notional`) | yes | size in coin or quote |
| `price` | for limit | limit price |
| `stop_price` | for stop / OCO | trigger |
| `limit_price` | for stop_limit / OCO | post-trigger limit |
| `tp_price` | for tp_sl / OCO | take-profit trigger |
| `time_in_force` | optional | `GTC` / `IOC` / `FOK` / `PO` (post-only) |
| `reduce_only` | perp | `true` / `false` |
| `working_type` | perp | `MARK_PRICE` / `CONTRACT_PRICE` (Binance) |
| `position_side` | perp hedge mode | `LONG` / `SHORT` / `BOTH` |
| `leverage` | perp | int (1–125; cap by exchange) |
| `client_order_id` | optional | user-defined id for tracking |

---

## Workflow

### Step 1 — Resolve symbol + filters
Call the exchange's `exchangeInfo` (Binance) or `instruments` (OKX) endpoint. Extract:

| Filter | Use |
|--------|-----|
| `tickSize` / `tickSz` | snap prices to allowed increments |
| `stepSize` / `lotSz` | snap quantity to allowed increments |
| `minQty` / `minSz` | reject below |
| `minNotional` / `minOrderNotional` | reject below |
| `maxQty` | warn / split if above |
| `pricePrecision`, `quantityPrecision` | display formatting |

### Step 2 — Snap to filters
Round price down to nearest tickSize (for buys) or up (for sells), depending on aggressiveness. Round qty down to nearest stepSize. If after snapping the order is below `minNotional` → reject with a clear message.

### Step 3 — Build the spec per exchange

#### Binance Spot — `POST /api/v3/order`

| Type | Required params |
|------|-----------------|
| MARKET | `symbol, side, type=MARKET, quantity` |
| LIMIT | `symbol, side, type=LIMIT, timeInForce=GTC, quantity, price` |
| STOP_LOSS_LIMIT | `symbol, side, type=STOP_LOSS_LIMIT, timeInForce, quantity, price, stopPrice` |
| TAKE_PROFIT_LIMIT | `symbol, side, type=TAKE_PROFIT_LIMIT, timeInForce, quantity, price, stopPrice` |
| OCO | `POST /api/v3/orderList/oco` — `symbol, side, quantity, price (TP-limit), stopPrice, stopLimitPrice, stopLimitTimeInForce` |

#### Binance USDS-M Futures — `POST /fapi/v1/order`
Add `positionSide`, `reduceOnly`, `workingType`, `closePosition` as needed. Conditional types: `STOP`, `STOP_MARKET`, `TAKE_PROFIT`, `TAKE_PROFIT_MARKET`, `TRAILING_STOP_MARKET`.

#### OKX — `POST /api/v5/trade/order`

| Field | Notes |
|-------|-------|
| `instId` | `BTC-USDT` (spot) or `BTC-USDT-SWAP` (perp) |
| `tdMode` | `cash` (spot), `cross` / `isolated` (perp) |
| `side` | `buy` / `sell` |
| `posSide` | `long` / `short` / `net` (perp; `net` for one-way mode) |
| `ordType` | `market` / `limit` / `post_only` / `fok` / `ioc` / `optimal_limit_ioc` |
| `sz` | size (contracts for perp, base coin for spot) |
| `px` | price (limit only) |
| `attachAlgoOrds` | array of attached TP/SL: `[{tpTriggerPx, tpOrdPx, slTriggerPx, slOrdPx}]` |
| `clOrdId` | client-side id |

Algo (TP/SL/trailing) — `POST /api/v5/trade/order-algo`:

| `ordType` | Purpose |
|-----------|---------|
| `conditional` | single TP or SL |
| `oco` | OCO |
| `move_order_stop` | trailing |

### Step 4 — Validate semantically
- Buy limit price must be ≤ current ask (else it'll cross instantly, which is fine but flag).
- Sell limit price must be ≥ current bid.
- Stop loss for a long must be < entry (or current price if no entry).
- TP for a long must be > entry. Vice versa for short.
- OCO: TP price > stop trigger (long); TP < stop trigger (short).
- Perp reduce_only: confirm there's a position to reduce (via `exchange-account-review` if available).

### Step 5 — Output the spec(s) clearly

Group related orders together (entry + stop + TP triplet). Show both the JSON payload and a human-readable summary. Provide CLI equivalents when possible.

---

## Output Format

```
Order Plan · <EXCHANGE> · <PAIR> · <market_type>

Symbol filters (validated)
  tickSize: 0.01    stepSize: 0.00001    minQty: 0.00001   minNotional: 10 USDT

Plan: Long entry + stop + 3 TPs (33/33/34 split)
  Capital: 1000  Risk: 1%   Entry: 65,000 limit   Stop: 63,500   TPs: 66,500 / 68,000 / 70,000
  Size: 0.0066 BTC ≈ 429 USDT (snapped to stepSize)

Draft orders:

[1] ENTRY — LIMIT BUY
    Binance JSON:
    {
      "symbol": "BTCUSDT",
      "side": "BUY",
      "type": "LIMIT",
      "timeInForce": "GTC",
      "quantity": "0.00660",
      "price": "65000.00",
      "newClientOrderId": "plan-2026-05-20-001"
    }
    CLI: binance-cli spot order POST --symbol BTCUSDT --side BUY --type LIMIT --timeInForce GTC --quantity 0.00660 --price 65000.00

[2] STOP — STOP_LOSS_LIMIT SELL
    {
      "symbol": "BTCUSDT",
      "side": "SELL",
      "type": "STOP_LOSS_LIMIT",
      "timeInForce": "GTC",
      "quantity": "0.00660",
      "stopPrice": "63500.00",
      "price": "63400.00",
      "newClientOrderId": "plan-2026-05-20-001-stop"
    }
    Note: limit 100 USDT below stop trigger so it fills on a fast drop.

[3] TP1 — LIMIT SELL (33%)
    {
      "symbol": "BTCUSDT",
      "side": "SELL",
      "type": "LIMIT",
      "timeInForce": "GTC",
      "quantity": "0.00220",
      "price": "66500.00",
      "newClientOrderId": "plan-2026-05-20-001-tp1"
    }

[4] TP2 — LIMIT SELL (33%) — price 68000  qty 0.00220
[5] TP3 — LIMIT SELL (34%) — price 70000  qty 0.00220

Validation
  · All prices snapped to tickSize ✓
  · All qtys snapped to stepSize ✓
  · Total qty across TPs equals entry qty ✓
  · Stop trigger < entry ✓
  · TPs > entry ✓
  · Min notional satisfied on every leg ✓
  · No reduce_only conflicts (spot, N/A)

Next step
  · To submit: pass this spec to /exchange-trading-executor (requires explicit CONFIRM and opt-in).
  · To simulate first: /exchange-paper-trading open ...
  · To revise: edit the plan upstream in /crypto-entry-exit-plan.
```

For OKX, the equivalent spec uses `attachAlgoOrds` to bundle TP/SL with the entry — much cleaner. Show that form.

---

## Edge Cases

- **Min notional too small:** suggest the user increase size (and warn risk implications) or skip the trade.
- **Tick / lot rounding shifts R:** if rounding moves price by ≥0.1%, recompute R and warn.
- **OCO vs separate orders:** prefer OCO/attached when supported — saves margin/qty conflicts.
- **Maker-only (post-only) on a price that would cross:** the order will be rejected by the exchange. Adjust the price to one tick beyond the opposite best, and note this.
- **Stop-loss for a long inside the bid-ask spread:** trigger will fire immediately. Widen or refuse.
- **Trailing stop:** Binance uses `callbackRate` (%); OKX uses `callbackRatio` or `callbackSpread`. Map the user's "trail by 2%" or "trail by 50 USDT" to the right field.
- **Hedge mode positions** on Binance: `positionSide` must be explicit (LONG / SHORT). For one-way mode, use BOTH.

---

## Handoff

- Consumes plans from `crypto-entry-exit-plan`.
- Uses `binance-market-scan` / `okx-market-scan` for `exchangeInfo` and current price reference.
- Output goes to `exchange-trading-executor` (live) or `exchange-paper-trading` (sim).
- Cross-checks size against `crypto-risk-manager`.

---

## Example Commands

```
/exchange-order-planner pair=BTC/USDT exchange=binance market=spot side=buy type=limit qty=0.005 price=65000
/exchange-order-planner from-plan plan_id=last exchange=binance      # consume crypto-entry-exit-plan output
/exchange-order-planner pair=ETH/USDT exchange=okx market=perp side=long type=limit qty=1 price=3500 attach_tp=3650 attach_sl=3420 leverage=5
/exchange-order-planner pair=BTC/USDT exchange=binance market=spot type=oco side=sell qty=0.01 price=70000 stop_price=63500 limit_price=63400
/exchange-order-planner ladder pair=BTC/USDT exchange=binance side=buy levels=64000,63500,63000 sizes=0.01,0.01,0.01
```

Arabic:
```
/exchange-order-planner جهز أوامر limit + stop + TP لـ BTC/USDT على Binance
/exchange-order-planner OCO على ETH/USDT TP=3700 وقف=3380
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
