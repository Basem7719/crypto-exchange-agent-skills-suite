# Agent Workflows

End-to-end multi-skill flows. Each is also in [workflows/](../workflows/) as a runnable spec.

## 1. Analyze a Single Pair (Spot)

```
User: /crypto-exchange-master "analyze BTC/USDT on Binance spot"

Master:
  → binance-market-scan BTC/USDT
  → crypto-technical-analysis pair=BTC/USDT exchange=binance timeframe=1h
  → crypto-spot-analysis pair=BTC/USDT exchange=binance
  → exchange-liquidity-depth pair=BTC/USDT exchange=binance
  → synthesize → reply
```

End user output: a 60-second readable summary.

## 2. Build a Spot Trade Plan

```
1. crypto-technical-analysis    # TA inputs
2. exchange-liquidity-depth     # can we get in/out?
3. crypto-risk-manager          # size, GO/NO-GO
4. crypto-entry-exit-planner    # entry/stop/TP
5. exchange-order-planner       # order spec
6. (optional) exchange-paper-trading
7. (optional, opt-in) exchange-trading-executor
```

See [workflows/spot-trade-planning.workflow.md](../workflows/spot-trade-planning.workflow.md).

## 3. Build a Futures Trade Plan

```
1. crypto-futures-analysis      # funding, OI, basis, L/S
2. crypto-sentiment-scan        # is the trade crowded?
3. crypto-technical-analysis
4. exchange-liquidity-depth
5. crypto-risk-manager          # leverage check
6. crypto-entry-exit-planner
7. exchange-order-planner       # reduce-only, working_type, posSide
8. exchange-paper-trading       # strongly recommended on futures
9. (optional, opt-in) exchange-trading-executor
```

See [workflows/futures-trade-planning.workflow.md](../workflows/futures-trade-planning.workflow.md).

## 4. Cross-Exchange Comparison

```
User: "compare BTC/USDT between Binance and OKX"

Master:
  → binance-market-scan BTC/USDT
  → okx-market-scan BTC-USDT
  → exchange-liquidity-depth pair=BTC/USDT exchange=binance
  → exchange-liquidity-depth pair=BTC-USDT exchange=okx
  → synthesize: spread comparison, liquidity, fees, funding (if perp)
```

See [workflows/cross-exchange-comparison.workflow.md](../workflows/cross-exchange-comparison.workflow.md).

## 5. Watchlist Monitoring (Daily)

```
1. crypto-watchlist-manager scan       # composite scores + alert evaluation
2. for each triggered alert:
     → crypto-report-generator on that pair
3. summarize top-3 + bottom-3 by composite move since yesterday
```

See [workflows/watchlist-monitoring.workflow.md](../workflows/watchlist-monitoring.workflow.md).

## 6. Account Review

```
1. exchange-account-review exchange=binance market=spot
2. exchange-account-review exchange=okx market=swap
3. (optional) summary: total equity, open exposure by pair, daily PnL
```

See [workflows/account-review.workflow.md](../workflows/account-review.workflow.md).

## 7. Full Research Report

```
1. crypto-report-generator pair=<pair> exchange=<ex> market=<m> timeframe=<tf> capital=<c>
   → internally chains: market-scan, technical-analysis, spot or futures,
     liquidity, risk-manager, entry-exit-planner
   → outputs 10-section markdown report
```

See [workflows/report-generation.workflow.md](../workflows/report-generation.workflow.md).

## 8. Backtest Workflow (offline)

```
1. strategy-backtest-planner    # produces full plan
2. user runs backtest in their tool (vectorbt, nautilus, custom)
3. user pastes results back
4. crypto-risk-manager           # checks if metrics meet thresholds
5. if pass: exchange-paper-trading for 30 trades forward test
6. if pass: exchange-trading-executor (gated live)
```

## How Master Chains Skills

The master doesn't run skills in parallel by default. Each skill's output is fed into the next. Outputs that match a schema in `schemas/` are reused without re-fetching.

If a downstream skill needs data already fetched by an earlier skill (e.g. klines), the master passes through rather than calling the data skill twice. Saves rate limit and time.
