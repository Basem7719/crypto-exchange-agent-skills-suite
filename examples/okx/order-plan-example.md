# Example — OKX Swap Order Plan with Attached TP/SL

## User prompt
```
/exchange-order-planner pair=BTC-USDT-SWAP exchange=okx market=swap side=long order_type=tp_sl qty=0.05 entry=64200 tp_price=66000 stop_price=63500 leverage=5 position_mode=hedge
```

## Output
```
=== Order Plan — OKX Swap — Attached TP/SL ===

pair ............... BTC-USDT-SWAP
side ............... long
order_type ......... tp_sl (entry + attached TP + SL)
qty (contracts) .... 50 (1 contract = 0.001 BTC; 0.05 BTC = 50 contracts)
entry .............. 64,200 (limit, post-only)
TP ................. 66,000  (algoOrdType=tp)
SL ................. 63,500  (algoOrdType=sl)
leverage ........... 5x
margin mode ........ isolated
position mode ...... hedge → posSide=long
notional ........... 3,210 USDT (at entry)
margin required .... 642 USDT (20% of equity)

VALIDATION
  contract size match ✓
  tick size .......... 0.1 ✓
  tp > entry > sl ✓
  liquidation @5x ≈ 53,832 (well below SL) ✓

EXCHANGE REQUEST PREVIEW
  POST /api/v5/trade/order
  body:
    instId=BTC-USDT-SWAP
    tdMode=isolated
    side=buy
    posSide=long
    ordType=post_only
    px=64200
    sz=50
    attachAlgoOrds=[
      {algoOrdType:"tp", tpTriggerPx:"66000", tpOrdPx:"-1"},
      {algoOrdType:"sl", slTriggerPx:"63500", slOrdPx:"-1"}
    ]
```

## Why OKX is nice here
A single POST attaches both TP and SL — fewer round-trips than Binance USDM (which needs separate TAKE_PROFIT_MARKET and STOP_MARKET orders).

## To submit (with gates)
```
/exchange-trading-executor spec=last dry_run=true
/exchange-trading-executor spec=last dry_run=false confirm=CONFIRM
```
