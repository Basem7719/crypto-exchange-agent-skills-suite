# Workflow — Spot Trade Planning

> Plan a spot trade end-to-end without submitting it.

## Pre-conditions
- Mode: `planning` or higher.
- Capital amount known.

## Trigger phrases
- "build a trade plan for SOL/USDT on Binance"
- "I want to buy ETH, help me plan"
- "خطة تداول لـ SOL على Binance"

## Skill chain
```
1. crypto-exchange-master                     (route + normalize)
2. binance-market-scan / okx-market-scan      (snapshot)
3. crypto-technical-analysis                  (TA)
4. crypto-spot-analysis                       (spot score)
5. exchange-liquidity-depth                   (slippage estimate)
6. crypto-risk-manager                        (size + GO/NO-GO)
7. crypto-entry-exit-planner                  (entry/stop/TP plan)
8. exchange-order-planner                     (limit/market/OCO spec)
```

## Required inputs
- `pair`
- `exchange`
- `timeframe` (recommended)
- `capital`
- `risk_pct` (default 1.0 via balanced profile)

## Gate: risk-manager GO
If `crypto-risk-manager` returns `NO-GO`, the chain stops at step 6. The user gets the NO-GO reasons and a hint on what to change.

## Output
A complete plan with entry zone, stop, TP ladder, and a ready-to-submit (but not submitted) order spec.

## Optional follow-ups
- `exchange-paper-trading apply_plan last`
- `exchange-trading-executor spec=last dry_run=true` (preview only)

## Reference example
[examples/binance/order-plan-example.md](../examples/binance/order-plan-example.md)
