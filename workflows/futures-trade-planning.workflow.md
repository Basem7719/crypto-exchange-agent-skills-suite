# Workflow — Futures Trade Planning

> Plan a futures trade including funding cost, OI context, and leverage check.

## Pre-conditions
- Mode: `planning` or higher.
- Leverage decision is in the user's plan (or use default profile).

## Trigger phrases
- "plan a futures trade on BTC/USDT"
- "I want to long ETH perp"
- "خطة فيوتشرز على BTC/USDT"

## Skill chain
```
1. crypto-exchange-master
2. binance-market-scan or okx-market-scan
3. crypto-futures-analysis        (funding, OI, basis, L/S, liq map)
4. crypto-sentiment-scan          (is the trade crowded?)
5. crypto-technical-analysis
6. exchange-liquidity-depth
7. crypto-risk-manager             (leverage cap, liquidation distance)
8. crypto-entry-exit-planner
9. exchange-order-planner          (reduce-only, posSide, working_type)
```

## Critical gates
- `crypto-risk-manager` checks liquidation distance > stop distance.
- Leverage > 20 requires explicit `allow_high_leverage=true`.
- Funding `> +0.05%` per 8h flags as "expensive long".

## Output
- Full plan with leverage, liquidation price, expected funding cost over the planned hold time, and exchange-specific order spec.

## Optional follow-ups
- `exchange-paper-trading` — strongly recommended for futures.
- `exchange-trading-executor` — last step, all 12 gates apply.

## Reference example
[examples/okx/sol-usdt-futures-analysis.md](../examples/okx/sol-usdt-futures-analysis.md)
