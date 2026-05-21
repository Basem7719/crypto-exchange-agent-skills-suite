# Example — SOL/USDT Futures Analysis on OKX Swap

## User prompt
```
/crypto-exchange-master "futures analysis on SOL on OKX swap, 4H timeframe"
```

## Skills called
1. `crypto-exchange-master` → normalizes SOL to `SOL-USDT-SWAP`
2. `okx-market-scan` (swap)
3. `crypto-futures-analysis`
4. `crypto-sentiment-scan`
5. `crypto-technical-analysis` (4H)

## Expected output

```
=== SOL-USDT-SWAP — OKX — 4H ===

SNAPSHOT
  price ............ 162.40 USDT
  24h Δ ............ +3.2%
  vol_24h .......... 320 M USDT (swap)

FUTURES VIEW
  funding (8h) ..... +0.0098%   (~10.7% annualized)
  funding_24h_avg .. +0.0085%
  OI now ........... 280 M USDT
  OI Δ 24h ......... +8.4%
  LSR (account) .... 1.3 (long-skewed)
  LSR (volume) ..... 1.5
  futures_score .... 65/100

SENTIMENT
  score ............ +48 (Greed)
  contrarian flag .. no
  dominant driver .. LSR + OI velocity

TECHNICAL (4H)
  trend ............ up (EMA20 > EMA50, both rising)
  RSI(14) .......... 62
  MACD ............. bullish, expanding
  S1 ............... 159    R1 ............... 165

VERDICT
  Setup is constructive but already up 3.2% on the day.
  Wait for a -0.5 to -1% pullback before entry, or enter half-size now.
```

## Notes
- OKX swap symbol is `SOL-USDT-SWAP` (note the dashes and `SWAP` suffix).
- OKX uniquely supports `attachAlgoOrds` on the entry order for TP/SL — see `exchange-order-planner`.
