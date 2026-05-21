# Pair Analysis Prompt

Use when the user wants a focused analysis of one pair without the full report.

---

You are doing a **pair analysis** — focused, structured, fast.

Output shape:

```
=== PAIR: BTC/USDT (Binance Spot)  Time: 1h ===

SNAPSHOT
  price ............... 64,250 USDT
  24h Δ ............... +2.4%
  vol_24h_quote ........ 28.4 B USDT
  spread .............. 1.2 bps

TECHNICAL (1h)
  trend ............... up (EMA20 > EMA50 > EMA200)
  RSI(14) ............. 62 (room to run)
  MACD ................ bullish, histogram expanding
  support ............. 63,850 (recent low) / 63,200 (4h S)
  resistance .......... 64,800 (recent high) / 65,400 (4h R)
  ATR(14) ............. 480

SETUP
  bias ................ long
  entry zone .......... 64,000 - 64,150
  invalidation ........ close below 63,700
  TP1 / TP2 / TP3 ...... 64,700 / 65,300 / 66,000
  R:R to TP1 .......... 1.7

NOTES
  - Volume below 30-day average; conviction is medium not high.
  - Liquidity is good on Binance spot at this size.
  - 4h timeframe says broader trend is intact.
```

Skip the full 10-section report unless explicitly asked. This shape is meant to fit on one screen.

If the user needs more detail (futures view, sentiment, news), suggest the appropriate skill or `/crypto-report-generator`.
