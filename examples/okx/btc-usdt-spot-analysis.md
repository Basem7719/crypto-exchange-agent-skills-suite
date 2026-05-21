# Example — BTC-USDT Spot Analysis on OKX

## User prompt
```
/crypto-exchange-master "analyze BTC-USDT on OKX spot at 1h"
```

## Skills called
1. `crypto-exchange-master` (normalizes BTC-USDT to OKX format)
2. `okx-market-scan`
3. `crypto-technical-analysis`
4. `crypto-spot-analysis`
5. `exchange-liquidity-depth`

## Expected output

```
=== BTC-USDT — OKX Spot — 1H ===

SNAPSHOT
  price ............ 64,195 USDT
  24h Δ ............ +1.7%
  vol_24h .......... 1.9 B USDT
  spread ........... 1.4 bps

TECHNICAL (1H)
  trend ............ up
  RSI(14) .......... 57
  MACD ............. bullish
  S1 ............... 63,820     R1 ............... 64,800
  ATR(14) .......... 425

SPOT VIEW
  buyer aggression .. 52% (taker vol)
  spot_score ....... 68/100

LIQUIDITY
  spread ........... 1.4 bps
  depth ±0.1% ...... 7.1 M USDT
  slippage @ 5k .... ~0.6 bps

NOTES
  - OKX spot depth is roughly half of Binance for BTC, but spread is acceptable.
  - For tighter execution, Binance is preferred at this size.
```

## Cross-reference
Compare with [examples/binance/btc-usdt-spot-analysis.md](../binance/btc-usdt-spot-analysis.md) and see [examples/cross-exchange/compare-binance-okx.md](../cross-exchange/compare-binance-okx.md).
