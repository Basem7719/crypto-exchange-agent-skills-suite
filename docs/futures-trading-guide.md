# Futures Trading Guide

How the suite handles futures (USDM perp, COIN-M perp, OKX swap, dated futures) on Binance and OKX.

## What is "Futures" here?

Leveraged contracts that track an underlying price. You don't own the coin; you have a margined position with funding (perp) or expiry (dated).

| Term | Meaning |
|------|--------|
| USDM (Binance) | USDT-margined perpetual |
| COIN-M (Binance) | Coin-margined (inverse) perpetual |
| Swap (OKX) | Perpetual contract on OKX |
| Futures (OKX) | Dated quarterly/biweekly futures |

## Why Futures Are Riskier

- **Leverage amplifies P&L and drawdowns.**
- **Funding rate** charges (perp) accrue every 8 hours.
- **Liquidation** is automatic once maintenance margin is breached.
- **Basis** between dated futures and spot can move violently around expiry.

## Skills Adapted to Futures

| Skill | Futures-aware? |
|-------|---------------|
| `crypto-futures-analysis` | ✅ funding, OI, basis, L/S, liq map |
| `crypto-sentiment-scan` | ✅ uses futures-native signals |
| `crypto-risk-manager` | ✅ leverage, margin, liquidation distance |
| `exchange-order-planner` | ✅ reduce-only, post-only, working_type, position_side |
| `exchange-trading-executor` | ✅ leverage cap (gate #7), separate API endpoints |
| `crypto-report-generator` | ✅ includes futures section when market_type=usdm/swap |

## Futures-specific Considerations

- **Funding is a fee.** Going long when funding is +0.05% per 8h costs ~5.4% per month. Often the trade fails on funding alone.
- **Liquidation distance must be > stop distance.** `crypto-risk-manager` enforces this as a NO-GO if the user's stop sits beyond liquidation.
- **Mark vs last price.** Binance offers `working_type=MARK_PRICE` for safer stops (avoid liquidation wicks). OKX has similar.
- **Hedge mode vs net mode.** Different `position_side` semantics. The executor checks before submit.
- **Leverage cap.** Default executor refuses leverage > 20 without explicit `allow_high_leverage=true`.

## Typical Futures Workflow

```
1. exchange-pair-finder          # is COIN-USDT-SWAP listed?
2. okx-market-scan               # snapshot
3. crypto-futures-analysis       # funding, OI, basis, L/S, liq
4. crypto-sentiment-scan         # is the trade crowded?
5. crypto-technical-analysis     # TA on the same timeframe
6. exchange-liquidity-depth      # perp book depth
7. crypto-risk-manager           # leverage, liquidation distance
8. crypto-entry-exit-planner     # entry/stop/TP plan
9. exchange-order-planner        # market/limit/stop spec
10. exchange-paper-trading       # optional dry run
11. exchange-trading-executor    # only if going live (12 gates)
```

## Examples

See [examples/binance/eth-usdt-futures-analysis.md](../examples/binance/eth-usdt-futures-analysis.md) and [examples/okx/sol-usdt-futures-analysis.md](../examples/okx/sol-usdt-futures-analysis.md).
