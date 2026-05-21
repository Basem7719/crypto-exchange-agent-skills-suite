# Example — BTC/USDT Spot Analysis on Binance

## User prompt
```
/crypto-exchange-master "analyze BTC/USDT on Binance spot at 1h, my capital is 5000 USDT"
```

## Skills called (in order)
1. `crypto-exchange-master` (routing)
2. `binance-market-scan`
3. `crypto-technical-analysis` (timeframe=1h)
4. `crypto-spot-analysis`
5. `exchange-liquidity-depth`
6. `crypto-risk-manager` (capital=5000, risk_pct=1, profile=balanced)
7. `crypto-entry-exit-planner`

## Expected output (abridged)

```
=== BTC/USDT — Binance Spot — 1h ===

SNAPSHOT
  price ............ 64,180 USDT
  24h Δ ............ +1.8%
  vol_24h .......... 28.4 B USDT
  spread ........... 0.8 bps

TECHNICAL (1h)
  trend ............ up (EMA20 > EMA50 > EMA200)
  RSI(14) .......... 58
  MACD ............. bullish, histogram +
  S1 ............... 63,800   S2: 63,200
  R1 ............... 64,800   R2: 65,400
  ATR(14) .......... 420

SPOT VIEW
  buyer aggression .. 54% (taker buy/sell, 24h)
  recent listing? .. no
  spot_score ....... 72/100

LIQUIDITY
  spread ........... 0.8 bps
  depth ±0.1% ...... 14.8 M USDT
  slippage @ 5k .... ~0.2 bps

RISK SIZING (5000 USDT capital, 1% risk, balanced)
  entry zone ....... 64,050 - 64,150
  stop ............. 63,650
  position size .... 0.099 BTC
  notional ......... 6,360 USDT  ← 127% of cash → NO-GO
                    (caller: pls reduce or raise capital)

EVERY GATE PASSED EXCEPT NOTIONAL → NO-GO
```

## Expected output (after user re-runs with risk_pct=0.5)

```
RISK SIZING (5000 USDT capital, 0.5% risk, balanced)
  entry zone ....... 64,050 - 64,150
  stop ............. 63,650
  position size .... 0.049 BTC
  notional ......... 3,150 USDT (63% of cash) ✓
  R:R to TP1 ....... 1.8 ✓
  fees share ....... 12% of risk ✓
  → GO

ENTRY/EXIT PLAN
  entry zone ....... 64,050 - 64,150 (limit)
  stop ............. 63,650
  TP1 .............. 64,750 (close 40%)
  TP2 .............. 65,300 (close 30%, move stop to BE)
  TP3 .............. 66,000 (close 30%)
  time stop ........ 24h
```

## Notes
- This example is conservative; reduce `risk_pct` further if 127% of cash exceeded.
- For perp version, swap `binance-market-scan` for `crypto-futures-analysis` and use leverage.
