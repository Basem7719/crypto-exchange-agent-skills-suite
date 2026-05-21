---
name: exchange-trading-executor
description: OPTIONAL live order submission to Binance or OKX. Reads draft order specs from exchange-order-planner and submits them to the exchange — ONLY after the user types an explicit CONFIRM keyword, API credentials have been verified as trade-scope (NOT withdraw-scope) via exchange-account-review, and the run is not in dry-run mode. Supports market, limit, stop, OCO (Binance spot), attached TP/SL (OKX), trailing stop, post-only, reduce-only. Uses clientOrderId for idempotency, has a kill-switch, dry-run by default. Triggers on "submit the order", "place this trade live", "execute on Binance/OKX", "run the order now". Refuses if any safety check fails. Use sparingly; prefer exchange-paper-trading first.
version: 1.0.0
category: execution
compatible_with: [claude-code, openclaw, cursor, hermes]
exchanges: [binance, okx]
mode: execution
license: MIT
---

# Exchange Trading Executor

Submit pre-validated order specs to Binance or OKX. **Live money is at risk.** This skill is the only one in the package that can move funds on the exchange. Every safety gate below must pass before a single order is sent.

## Purpose

OPTIONAL live order submission to Binance or OKX. Reads draft order specs from exchange-order-planner and submits them to the exchange — ONLY after the user types an explicit CONFIRM keyword, API credentials have been verified as trade-scope (NOT withdraw-scope) via exchange-account-review, and the run is not in dry-run mode. Supports market, limit, stop, OCO (Binance spot), attached TP/SL (OKX), trailing stop, post-only, reduce-only. Uses clientOrderId for idempotency, has a kill-switch, dry-run by default. Triggers on "submit the order", "place this trade live", "execute on Binance/OKX", "run the order now". Refuses if any safety check fails. Use sparingly; prefer exchange-paper-trading first.

This skill is part of the **crypto-exchange-agent-skills-suite**. See [`../../docs/architecture.md`](../../docs/architecture.md) for how it fits with the other 20 skills.

---

> ⚠ **DISCLAIMER**
> Live trading can lose money fast. Crypto markets are volatile, exchanges go down, APIs misbehave, and you can be liquidated. Nothing here is financial advice. The user is fully responsible for every order submitted. Run `exchange-paper-trading` first. When in doubt, do not execute.

---

## When to Use

- "submit the order"
- "place this trade live on Binance"
- "execute the plan on OKX"
- "run my OCO now"
- "send the limit order, here is CONFIRM"

## When NOT to Use

- Any request that hasn't first been through `exchange-order-planner`.
- API key with withdraw permission, IP whitelist mismatch, or unknown scope.
- User is unsure, asking "should I?", or just exploring — route to `crypto-entry-exit-plan` or `exchange-paper-trading`.
- Market is halted, symbol is delisted, or maintenance window is active.
- Dry-run flag is on (default).

---

## Required Inputs

| Input | Required? | Example |
|-------|-----------|---------|
| `order_spec` | yes | output object from `exchange-order-planner` |
| `exchange` | yes | `binance` / `okx` |
| `market_type` | yes | `spot` / `usdm` / `coinm` / `swap` / `futures` |
| `confirm` | yes | must equal the exact uppercase token `CONFIRM` |
| `dry_run` | yes | `true` (default) / `false` |
| `account_check_ok` | yes | bool — `exchange-account-review` returned read+trade scope, NO withdraw |
| `client_order_id` | yes | unique idempotency key (skill generates one if missing) |
| `max_slippage_bps` | optional | reject if expected slippage exceeds, default 50 bps |
| `kill_switch_path` | optional | filesystem path; if file exists, abort |

If `confirm != "CONFIRM"`, **stop and ask the user to retype it exactly**. Do not infer consent from "yes", "ok", "go", "execute".

---

## Pre-Flight Safety Gates

All gates below MUST pass. Any single failure → abort and print which gate failed.

1. **Credentials scope.** Call `exchange-account-review` first. Reject if `permissions` includes `withdraw` / `enableWithdrawals=true`. Required: `spot`/`futures` trade + read only.
2. **CONFIRM keyword.** Exact match `CONFIRM` (uppercase). Anything else → abort.
3. **Dry-run flag.** Default `dry_run=true`. To go live, the user must explicitly pass `dry_run=false`.
4. **Spec freshness.** Reject if `order_spec.generated_at` is older than 5 minutes; require a re-plan.
5. **Symbol filter re-validation.** Re-pull `exchangeInfo` (Binance) or `instruments` (OKX) and re-check tick size, lot size, min notional. Markets move; filters can change.
6. **Notional cap.** Reject if order notional > `max_order_notional` (default 5% of account equity for spot; 2% for futures). User can raise the cap explicitly.
7. **Leverage cap.** Reject if `leverage > 20` unless user explicitly passes `allow_high_leverage=true`.
8. **Risk-manager pre-trade check.** Compute %-of-equity risked, R:R, fees-vs-risk; reject if `crypto-risk-manager` would say NO-GO.
9. **Kill-switch file.** If `kill_switch_path` exists on disk, abort all submissions.
10. **Rate-limit guard.** Check we're under 50% of Binance/OKX request weight; if not, wait or abort.
11. **Maintenance window.** Hit `GET /api/v3/ping` (Binance) and `GET /api/v5/system/status` (OKX). Abort on maintenance.
12. **Idempotency key.** `client_order_id` must be unique within the session. Re-using one with different params → abort.

---

## Workflow

```
1. Load order_spec from exchange-order-planner (or accept inline).
2. Run all 12 pre-flight gates.
3. If dry_run=true:
     - Print the exact HTTP request(s) we WOULD send.
     - Print expected fill, fees, post-trade balance estimate.
     - STOP. Do not call the exchange.
4. If dry_run=false:
     - Acquire a per-symbol lock (avoid duplicate submission).
     - Submit:
         Binance spot:    POST /api/v3/order        (or /order/oco for OCO)
         Binance USDM:    POST /fapi/v1/order
         Binance COINM:   POST /dapi/v1/order
         OKX (all):       POST /api/v5/trade/order  (TP/SL attached via attachAlgoOrds)
     - Capture orderId / ordId, status, timestamp, fills.
5. Post-submit:
     - GET status once to confirm acceptance.
     - Record to ledger file (~/.crypto-skills/executor-ledger.jsonl).
     - Print human-readable summary.
6. On HTTP error:
     - Do NOT retry automatically. Print error, recovery hint.
     - Critical errors (-2010 insufficient balance, 51008 insufficient margin) → abort the rest of the batch.
```

---

## Endpoint Reference

| Action | Binance (spot) | Binance (USDM) | OKX (v5) |
|--------|---------------|---------------|----------|
| New order | `POST /api/v3/order` | `POST /fapi/v1/order` | `POST /api/v5/trade/order` |
| OCO / TP+SL | `POST /api/v3/orderList/oco` | (use TP/SL params) | `attachAlgoOrds` array on POST |
| Cancel | `DELETE /api/v3/order` | `DELETE /fapi/v1/order` | `POST /api/v5/trade/cancel-order` |
| Status | `GET /api/v3/order` | `GET /fapi/v1/order` | `GET /api/v5/trade/order` |
| Open orders | `GET /api/v3/openOrders` | `GET /fapi/v1/openOrders` | `GET /api/v5/trade/orders-pending` |

All Binance writes need `signature` (HMAC-SHA256 of query string with secret) + `timestamp` + `recvWindow`. OKX needs `OK-ACCESS-KEY`, `OK-ACCESS-SIGN`, `OK-ACCESS-TIMESTAMP`, `OK-ACCESS-PASSPHRASE`.

---

## Output Format

### Dry-run (default)

```
=== DRY RUN — no order submitted ===
Exchange:   binance (spot)
Symbol:     BTCUSDT
Action:     LIMIT BUY  0.0150 BTC @ 64,250.00
Notional:   963.75 USDT  (1.92% of equity)
TIF:        GTC, postOnly=true
clientOrderId: ces-2026-05-20-001
Expected request:
  POST /api/v3/order
  body: symbol=BTCUSDT&side=BUY&type=LIMIT_MAKER&quantity=0.0150&price=64250.00&newClientOrderId=ces-2026-05-20-001
Pre-flight: ALL 12 GATES PASS ✓
To go live, re-run with dry_run=false and confirm=CONFIRM.
```

### Live submission

```
=== LIVE ORDER SUBMITTED ===
Exchange:   binance (spot)
Symbol:     BTCUSDT
orderId:    28457139201
clientOrderId: ces-2026-05-20-001
Status:     NEW (resting)
Type:       LIMIT_MAKER
Side:       BUY
Price:      64,250.00
Qty:        0.01500 BTC
Notional:   963.75 USDT
Submitted:  2026-05-20 10:42:18 UTC
Recorded to: ~/.crypto-skills/executor-ledger.jsonl
```

### Refusal (any gate failed)

```
=== EXECUTION REFUSED ===
Failed gate: #1 (Credentials scope)
Reason:     API key has enableWithdrawals=true
Action:     Create a new key with trade-only scope, no withdrawals.
No order was submitted.
```

---

## Edge Cases

- **Partial fills.** Don't auto-chase. Print partial state; let user decide to cancel + reprice.
- **OCO on Binance spot only.** USDM/COINM use separate TP/SL via `STOP_MARKET` + `TAKE_PROFIT_MARKET` with `closePosition=true`.
- **OKX hedge mode.** Pass `posSide=long`/`short` explicitly; in net mode pass `posSide=net`.
- **Reduce-only mismatch.** If `reduce_only=true` but no opposing position exists → reject before submit.
- **Network failure mid-submit.** Treat as unknown. Query order by `clientOrderId` before any retry.
- **Clock skew.** Binance `recvWindow` rejects if local clock drifts > 5s — re-sync NTP, do not retry blindly.
- **Insufficient balance.** Print exact shortfall; don't try to reduce qty automatically.
- **Symbol blacklist.** Maintain optional `~/.crypto-skills/blacklist.txt`; reject those symbols outright.
- **Multiple legs (ladder, OCO).** Submit sequentially; on first failure, cancel any already-resting legs from the same batch.

---

## Runtime Implementation (v1.1)

This skill is backed by two TypeScript services in the `src/` layer:

### `src/services/order-service.ts`
Handles actual order submission to Binance and OKX. Responsible for:
- Building signed HTTP requests for each exchange
- Mapping raw API responses to a normalised `OrderResult`
- Recording every submission to `~/.crypto-skills/executor-ledger.jsonl`
- Refusing submission if the kill-switch file exists

### `src/services/risk-gate-service.ts`
Enforces all pre-flight safety gates before any order is constructed. Checks:
- Notional vs `MAX_TRADE_USDT` cap
- % of equity at risk vs `maxRiskPctPerTrade`
- Leverage cap (default 20×)
- R:R ratio minimum (1.5)
- Order spec freshness (must be < 5 minutes old)
- DRY_RUN flag enforcement

Both services are instantiated by `src/cli/index.ts` and respect the environment variables defined in `.env.example`.

---

## Handoff

```
crypto-entry-exit-plan → exchange-order-planner → exchange-account-review → exchange-trading-executor
                                                       ↑ (verifies scope)         ↓
                            crypto-risk-manager ──────┘ (pre-trade gate)   src/services/risk-gate-service.ts
                                                                                   ↓
                                                                            src/services/order-service.ts
                                                                                   ↓
                                                                     ~/.crypto-skills/executor-ledger.jsonl
```

- **Inputs:** `order_spec` from `exchange-order-planner`; scope confirmation from `exchange-account-review`; risk verdict from `crypto-risk-manager`.
- **Optional pre-step:** `exchange-paper-trading` to dry-run the same plan against historical/live ticks before going live.
- **Outputs:** ledger entries consumed by `crypto-report` and `exchange-account-review` for post-trade review.

---

## Example Commands

```
/exchange-trading-executor spec=last_planner_output dry_run=true
/exchange-trading-executor spec=oco_btcusdt confirm=CONFIRM dry_run=false
/exchange-trading-executor cancel order_id=28457139201 exchange=binance market=spot
```

Arabic:

```
/exchange-trading-executor نفّذ الأمر الذي خططه exchange-order-planner — ابدأ بـ dry_run=true
/exchange-trading-executor نفّذ مباشرة، أؤكد بـ CONFIRM، dry_run=false
/exchange-trading-executor ألغِ الأمر 28457139201 على Binance Spot
```

---

## Author Notes

This skill is intentionally conservative. If a feature would let the agent move funds with less than full user awareness, it is not implemented here. Users who want speed/automation should build their own pipeline on top of the planner's JSON output — not weaken the gates in this skill.

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
