# Spot Trading Guide

How the suite handles spot trading on Binance and OKX.

## What is "Spot"?

Buying or selling the underlying asset for immediate settlement, with no leverage, no funding rate, no liquidation. You own the coin; the exchange custodies it.

## Skills That Cover Spot

| Skill | Role in spot flow |
|-------|------------------|
| `binance-market-scan` / `okx-market-scan` | Price, volume, klines, depth |
| `exchange-pair-finder` | Is the pair listed on this exchange's spot? |
| `exchange-liquidity-depth` | How thin is the book? What slippage on size X? |
| `crypto-spot-analysis` | Spot-specific score (trend, vol, buyer aggression) |
| `crypto-technical-analysis` | Pure TA — works on spot or perp |
| `crypto-risk-manager` | Position size in coin terms, percent-of-equity stop |
| `crypto-entry-exit-planner` | Entry zone, stop, TP ladder |
| `exchange-order-planner` | Limit / market / OCO order spec |
| `exchange-trading-executor` | Optional live submit |

## Spot-specific Considerations

- **No leverage.** Position size capped by cash balance.
- **Settlement is instant.** No funding, no liquidation.
- **OCO is real on Binance spot** (`/api/v3/orderList/oco`). Use it to attach a take-profit + stop-loss to a resting order.
- **Slippage matters more.** Without leverage, profits depend on tighter execution. Always check `exchange-liquidity-depth`.
- **Min notional.** Binance enforces a minimum order value (typically 10 USDT) — `exchange-order-planner` validates this before output.

## Typical Spot Workflow

```
1. exchange-pair-finder          # is COIN/USDT listed?
2. binance-market-scan           # snapshot
3. crypto-technical-analysis     # TA score, S/R, EMA stack
4. crypto-spot-analysis          # spot-specific score
5. exchange-liquidity-depth      # confirm we can enter/exit cleanly
6. crypto-risk-manager           # sizing + GO/NO-GO
7. crypto-entry-exit-planner     # entry/stop/TP plan
8. exchange-order-planner        # draft the limit or OCO spec
9. exchange-paper-trading        # optional dry run
10. exchange-trading-executor    # only if going live (gated)
```

## Examples

See [examples/binance/btc-usdt-spot-analysis.md](../examples/binance/btc-usdt-spot-analysis.md) and [examples/okx/btc-usdt-spot-analysis.md](../examples/okx/btc-usdt-spot-analysis.md).
