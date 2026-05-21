# Example — Find BILL and PLAY on Binance

## User prompt
```
/exchange-pair-finder BILL and PLAY against USDT on Binance and OKX
```

## Output
```
=== Pair Finder — Binance & OKX ===

BILL/USDT
  Binance ..... NOT LISTED  (no BILLUSDT in /api/v3/exchangeInfo)
  OKX ......... LISTED      BILL-USDT (spot), no swap
              spot 24h vol ~ 2.1 M USDT, spread ~ 18 bps

PLAY/USDT
  Binance ..... LISTED      PLAYUSDT (spot), no perp
              spot 24h vol ~ 4.7 M USDT, spread ~ 22 bps
  OKX ......... LISTED      PLAY-USDT (spot), no swap
              spot 24h vol ~ 3.1 M USDT, spread ~ 15 bps

RECOMMENDATIONS
- BILL: only on OKX → use okx-market-scan + crypto-spot-analysis
- PLAY: better depth on Binance; check exchange-liquidity-depth for your size
```

## Follow-up commands
```
/exchange-liquidity-depth pair=BILL-USDT exchange=okx
/exchange-liquidity-depth pair=PLAYUSDT exchange=binance
```
