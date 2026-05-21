# Order Types Guide

Order types supported by `exchange-order-planner` and `exchange-trading-executor`.

## Reference Table

| Order type | Binance Spot | Binance USDM | OKX (spot/swap) | Notes |
|-----------|:------------:|:------------:|:---------------:|-------|
| Market | ✅ | ✅ | ✅ | Fills at best available; high slippage risk on thin books |
| Limit | ✅ | ✅ | ✅ | Specify price; rests until filled or canceled |
| Limit-Maker / Post-Only | ✅ (`LIMIT_MAKER`) | ✅ (`postOnly`) | ✅ (`postOnly`) | Rejected if it would take liquidity |
| Stop-Market | — (use STOP_LOSS) | ✅ (`STOP_MARKET`) | ✅ (algo `conditional`) | Trigger fires a market order |
| Stop-Limit | ✅ (`STOP_LOSS_LIMIT`) | ✅ (`STOP`) | ✅ (algo `conditional` w/ price) | Trigger fires a limit order |
| Take-Profit | ✅ (`TAKE_PROFIT_LIMIT`) | ✅ (`TAKE_PROFIT_MARKET`) | ✅ (attached `tp` on order) | Symmetric to stop-loss |
| OCO (one-cancels-other) | ✅ (spot only) | — | — | Use attached TP/SL on OKX |
| Attached TP/SL | — | partially | ✅ (`attachAlgoOrds`) | OKX uniquely attaches at placement |
| Trailing stop | — | ✅ (`TRAILING_STOP_MARKET`) | ✅ (algo `move_order_stop`) | Server-side trailing |
| Reduce-only | — | ✅ | ✅ | Only reduces an existing position |
| Iceberg | ✅ | — | — | Limit with hidden quantity (spot only on Binance) |

## Time-in-Force

| TIF | Meaning |
|-----|--------|
| GTC | Good-till-canceled (default) |
| IOC | Immediate-or-cancel — unfilled portion canceled |
| FOK | Fill-or-kill — all or nothing |
| PO | Post-only (maker only) |

## Choosing the Right Type

| Goal | Order type |
|------|-----------|
| Get in fast, accept slippage | Market |
| Bid below market, save fees | Limit (PO if you must be maker) |
| Cap risk on a position | Stop-Market (perp) or Stop-Loss (spot) |
| Lock in profit | Take-Profit limit (spot) / Take-Profit Market (perp) |
| One trade with both stop + TP attached | OCO (Binance spot) / `attachAlgoOrds` (OKX) |
| Trail a winner | Trailing stop (Binance USDM, OKX algo) |
| Build a ladder | Multiple limits at separate prices |

## Validation by `exchange-order-planner`

Before printing the spec, the planner validates:

- `price` is a multiple of `tick_size`
- `qty` is a multiple of `step_size` (Binance) / `lotSz` (OKX)
- `qty * price >= min_notional`
- `qty >= min_qty`
- All required fields are present for the chosen type
- For OCO: `tp_price > current > stop_price` (long) or inverted (short)
- For reduce-only: a matching position exists (gate #6 in executor)

## Bracket Order Pattern

To open a position with both stop and TP at the same time:

- **Binance spot:** single OCO order via `POST /api/v3/orderList/oco`.
- **Binance USDM:** entry order + separate STOP_MARKET + TAKE_PROFIT_MARKET, both with `closePosition=true` and `reduceOnly=true`.
- **OKX:** single `POST /api/v5/trade/order` with `attachAlgoOrds` array.

`exchange-order-planner` chooses the right primitive for each exchange/market_type automatically.
