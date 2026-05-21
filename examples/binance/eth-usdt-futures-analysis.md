# Example — ETH/USDT Futures Analysis on Binance USDM

## User prompt
```
/crypto-exchange-master "futures analysis on ETH/USDT on Binance perp, 4h, capital 2000, leverage 5"
```

## Skills called
1. `crypto-exchange-master`
2. `binance-market-scan` (with `market_type=usdm`)
3. `crypto-futures-analysis`
4. `crypto-sentiment-scan`
5. `crypto-technical-analysis` (timeframe=4h)
6. `exchange-liquidity-depth`
7. `crypto-risk-manager` (capital=2000, risk_pct=1, leverage=5, profile=futures-low-leverage)
8. `crypto-entry-exit-planner`

## Expected output

```
=== ETH/USDT — Binance USDM — 4h ===

SNAPSHOT
  price ............ 3,180 USDT
  24h Δ ............ -0.6%
  vol_24h .......... 9.2 B USDT

FUTURES VIEW
  funding (8h) ..... +0.0125% (~13.8% annualized)
  funding_24h_avg .. +0.011%
  OI now ........... 5.8 B USDT
  OI Δ 24h ......... +3.2%
  L/S account ratio  1.18 (slight long skew)
  top-trader L/S ... 1.42 (top accounts long)
  liq map 24h ...... longs liq 38 M | shorts liq 27 M
  futures_score .... 58/100

SENTIMENT
  score ............ +42 (Greed)
  contrarian flag .. no
  dominant driver .. top-trader L/S

TECHNICAL (4h)
  trend ............ sideways (EMA20 ≈ EMA50, both below EMA200)
  RSI .............. 48
  S1 ............... 3,150     R1 ............... 3,220

RISK SIZING (2000 USDT, 1%, 5x, futures-low-leverage)
  entry ............ 3,160 (limit)
  stop ............. 3,140 (-0.6%)
  position size .... 1.0 ETH
  notional ......... 3,160 USDT
  margin used ...... 632 USDT (32% of equity)
  liq price ........ ~2,654 (distance: -506 USDT vs stop -20 USDT) ✓
  funding cost / 24h  ~0.93 USDT (negligible at this size)
  R:R to TP1 ....... 2.5 ✓
  → GO

ENTRY/EXIT PLAN
  entry ............ 3,160 (limit)
  stop ............. 3,140 (MARK_PRICE)
  TP1 .............. 3,210 (R=2.5, close 40%)
  TP2 .............. 3,250 (R=4.5, close 30%)
  TP3 .............. 3,310 (R=7.5, close 30%)
  time stop ........ 36h
```

## Notes
- Order spec via `exchange-order-planner` would use `reduce_only=false` for entry, `closePosition=true` for stop.
- Funding is mildly hot but not extreme; not enough to skip.
