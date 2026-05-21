# Test — exchange-order-planner

## Goal
Verify order spec generation, filter validation, no-submission behavior.

## Test cases

### Case 1 — Binance spot LIMIT
```
/exchange-order-planner pair=BTC/USDT exchange=binance market=spot side=buy order_type=limit qty=0.0150 price=64250 time_in_force=GTC
```
Expected:
- Conforms to `schemas/order-plan.schema.json`
- Includes `exchange_request_preview` with `POST /api/v3/order`
- `qty` is a valid step multiple
- `price` is a valid tick multiple
- `notional ≥ min_notional` (10 USDT default)
- `client_order_id` auto-generated if missing

### Case 2 — Binance spot OCO
```
/exchange-order-planner pair=BTC/USDT exchange=binance market=spot side=sell order_type=oco qty=0.01 price=66000 stop_price=63000 limit_price=62950
```
Expected:
- Endpoint `POST /api/v3/orderList/oco`
- `price > current > stop_price` validated (here side=sell, so inverted check)

### Case 3 — OKX swap with attached TP/SL
```
/exchange-order-planner pair=BTC/USDT exchange=okx market=swap side=long order_type=tp_sl qty=0.01 entry=64000 tp_price=66000 stop_price=62000 leverage=5
```
Expected:
- Endpoint `POST /api/v5/trade/order`
- `attachAlgoOrds` array present with both tp and sl
- `posSide` correctly set (`long` in hedge mode, `net` in net mode)

### Case 4 — Filter rejection
```
/exchange-order-planner pair=BTC/USDT exchange=binance market=spot side=buy order_type=limit qty=0.00001 price=64000
```
Expected:
- Rejected: "qty below minimum step size" or "notional below min_notional"

## Critical behavior
Planner NEVER submits. Output is a spec only.

## Success criterion
- Case 1, 2, 3 produce valid specs.
- Case 4 is rejected with a clear reason.
