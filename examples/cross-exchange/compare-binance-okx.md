# Example — Compare BTC/USDT Between Binance and OKX

## User prompt
```
/crypto-exchange-master "compare BTC/USDT on Binance spot vs OKX spot"
```

## Skills called
1. `crypto-exchange-master`
2. `binance-market-scan`
3. `okx-market-scan`
4. `exchange-liquidity-depth` (both)
5. `crypto-compare-pairs` (synthesis)

## Output

```
=== BTC/USDT — Binance Spot vs OKX Spot ===

| Metric                | Binance       | OKX           |
|-----------------------|--------------:|--------------:|
| price                 | 64,180.40     | 64,195.20     |
| 24h Δ                 | +1.8%         | +1.7%         |
| volume_24h_quote      | 28.4 B        | 1.9 B         |
| spread (bps)          | 0.8           | 1.4           |
| depth ±0.1% (USDT)    | 14.8 M        | 7.1 M         |
| slippage @ 5,000 USDT | ~0.2 bps      | ~0.6 bps      |
| taker fee (bps)       | 10            | 8             |

PRICE DIVERGENCE
  +14.80 USDT (OKX > Binance), ~2.3 bps.
  After fees + slippage, NOT arb-able for retail.

RECOMMENDATION
  - Best execution for size up to 100k USDT: Binance
  - OKX wins on taker fee but loses on spread + depth at this size
  - For micro size (<5k USDT), the difference is negligible
```
