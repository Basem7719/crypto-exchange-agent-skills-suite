# Example — Liquidity Comparison Across Exchanges

## User prompt
```
/crypto-exchange-master "where's better liquidity for SOL/USDT at size 50,000 USDT?"
```

## Skills called
1. `binance-market-scan`
2. `okx-market-scan`
3. `exchange-liquidity-depth` × 2

## Output

```
=== Liquidity — SOL/USDT — Size 50,000 USDT ===

| Metric                | Binance Spot  | OKX Spot      |
|-----------------------|--------------:|--------------:|
| price                 | 162.10        | 162.18        |
| spread (bps)          | 0.6           | 1.1           |
| depth ±0.05% (USDT)   | 2.4 M         | 1.2 M         |
| depth ±0.1% (USDT)    | 5.8 M         | 2.7 M         |
| depth ±0.5% (USDT)    | 28.5 M        | 12.4 M        |
| expected slippage 50k | ~0.9 bps      | ~2.1 bps      |
| effective cost (rt)*  | 21.8 bps      | 22.2 bps      |

* effective round-trip cost = 2× (taker fee + slippage)

VERDICT
  Binance wins on slippage and depth.
  After fees, the round-trip cost is roughly equal.
  Choose Binance for execution speed; OKX for fee-sensitive strategies that can wait for fills.
```
