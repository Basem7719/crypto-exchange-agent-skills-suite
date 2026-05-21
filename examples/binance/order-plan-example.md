# Example — Binance Spot OCO Order Plan

## User prompt
```
/exchange-order-planner pair=BTC/USDT exchange=binance market=spot side=sell order_type=oco qty=0.05 price=66000 stop_price=63500 limit_price=63450
```

## Output
```
=== Order Plan — Binance Spot OCO ===

pair ................ BTC/USDT
symbol .............. BTCUSDT
side ................ SELL
order_type .......... OCO
qty ................. 0.05
price (take-profit) . 66,000.00  (tick OK)
stop_price .......... 63,500.00
limit_price ......... 63,450.00
notional ............ 3,300 USDT  (at TP)
time_in_force ....... GTC
client_order_id ..... cs-2026-0521-091203

VALIDATION
  tick_size ......... 0.01 ✓
  step_size ......... 0.00001 ✓
  min_notional ...... 10 USDT ✓
  price > current > stop ✓

EXCHANGE REQUEST PREVIEW
  POST /api/v3/orderList/oco
  params:
    symbol=BTCUSDT
    side=SELL
    quantity=0.05
    price=66000
    stopPrice=63500
    stopLimitPrice=63450
    stopLimitTimeInForce=GTC
    listClientOrderId=cs-2026-0521-091203
```

## How to submit (with all gates)
```
/exchange-trading-executor spec=last dry_run=true
# review the preview output, then:
/exchange-trading-executor spec=last dry_run=false confirm=CONFIRM
```

## Notes
- The order plan does NOT submit. Only `exchange-trading-executor` can submit, and only with `dry_run=false confirm=CONFIRM`.
- For OKX swap with attached TP/SL, use `order_type=tp_sl`.
