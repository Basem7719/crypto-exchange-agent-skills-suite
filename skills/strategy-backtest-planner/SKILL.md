---
name: strategy-backtest-planner
description: Design a rigorous backtest plan for a crypto trading strategy on Binance or OKX before any code is written. Takes a strategy description ("EMA cross with RSI filter", "funding-rate fade", "OI breakout"), produces a complete backtest specification: data sources, sample period, walk-forward windows, entry/exit logic in pseudocode, fee/slippage/funding models, metrics, robustness tests, and a go/no-go decision rubric. Triggers on "plan a backtest for X strategy", "I want to backtest Y", "صمم لي backtest لاستراتيجية", "ابني خطة اختبار للاستراتيجية". Output is a structured plan; this skill does NOT run the backtest — it specifies it for the user (or another tool) to execute.
version: 1.0.0
category: strategy
compatible_with: [claude-code, openclaw, cursor, hermes]
exchanges: [binance, okx]
mode: analysis
license: MIT
---

# Strategy Backtest Planner

Translate a strategy idea into a complete, fair, reproducible backtest plan. The plan is exhaustive enough that two independent developers running it on the same data would get the same metrics within noise.

> ⚠ **DISCLAIMER**
> Backtests show what *would have* happened on past data with idealized assumptions. They consistently overstate real-world performance. Use this plan as a starting point; require **walk-forward + paper-trading** before any live capital. Not financial advice.

---

## Purpose

Force every strategy idea through a checklist before any code is written:
- Is the edge plausible?
- Is the data clean enough?
- Are fees/slippage/funding modeled honestly?
- What metrics will we trust?
- What are the robustness tests?
- What's the kill criterion?

## When to Use

- "plan a backtest for EMA20/EMA50 cross with RSI > 50 filter"
- "I want to backtest a funding-rate fade strategy on BTC perp"
- "design a backtest for breakout above 24h high on Binance USDM"
- "صمم لي backtest لاستراتيجية تقاطع المتوسطات"
- Before passing a strategy to any execution tool.

## Required Inputs

| Input | Required? | Example |
|-------|-----------|---------|
| `strategy_summary` | yes | one-paragraph description |
| `universe` | yes | `BTC/USDT`, `top-20-perp`, `custom-list` |
| `exchange` | yes | `binance` / `okx` |
| `market_type` | yes | `spot` / `usdm` / `swap` / `coinm` |
| `timeframe` | yes | `1m` / `5m` / `15m` / `1h` / `4h` / `1d` |
| `direction` | yes | `long_only` / `short_only` / `both` |

## Optional Inputs

| Input | Default | Example |
|-------|---------|---------|
| `sample_start` / `sample_end` | last 3 yrs | `2022-01-01` / `2025-12-31` |
| `walk_forward_window` | 6m / 1m | train / oos |
| `initial_capital` | 10000 USDT | |
| `risk_per_trade_pct` | 1.0 | |
| `max_concurrent_positions` | 3 | |
| `fee_model` | `taker_only`, 4 bps | per exchange |
| `slippage_model` | `0.5 bps + spread/2` | |
| `funding_model` | `realized_8h` | only for perp |
| `benchmark` | `buy_and_hold_BTC` | |

## Workflow

```
1. Restate the strategy in unambiguous pseudocode.
2. List required data series (price/OHLCV, funding, OI, depth?, indicators).
3. Choose sample window + walk-forward schedule.
4. Specify fee/slippage/funding models per exchange.
5. Define entry, exit, position-sizing, and risk rules.
6. List metrics + thresholds.
7. List robustness tests.
8. Define the go / no-go rubric.
9. Output the full plan as a checkable document.
```

## Exchange-Specific Handling

The plan's data, fees, and funding models differ per exchange.

### Binance
- Spot klines: `GET /api/v3/klines` (up to 1000/req).
- USDM klines: `GET /fapi/v1/klines` (up to 1500/req).
- Funding history: `GET /fapi/v1/fundingRate` (perp only).
- Fees defaulted to spot taker 10 bps / maker 10 bps; USDM taker 4 bps / maker 2 bps.

### OKX
- Candles: `GET /api/v5/market/candles` (up to 300/req) or `/api/v5/market/history-candles` (up to 1500).
- Funding history: `GET /api/v5/public/funding-rate-history` (swap only).
- Fees defaulted to spot taker 8 bps / maker 6 bps; swap taker 5 bps / maker 2 bps.
- Remember bar values are uppercase from `1H` upward.

The plan's `Data Requirements` section names the exact endpoints used.

---

## Plan Sections

The skill produces a plan with these exact sections:

### 1. Strategy Pseudocode
```python
# Long-only EMA20/EMA50 cross with RSI filter, BTC/USDT 1h on Binance USDM
def on_bar(bar, state):
    ema20  = ema(close, 20)
    ema50  = ema(close, 50)
    rsi14  = rsi(close, 14)

    long_entry = cross_up(ema20, ema50) and rsi14 > 50 and rsi14 < 70
    long_exit  = cross_down(ema20, ema50) or rsi14 > 80

    if state.flat and long_entry:
        size = position_size_from_atr(bar.close, atr14, risk_pct=1.0, equity=state.equity)
        return open_long(size, stop=bar.close - 2*atr14)
    if state.long and long_exit:
        return close_long()
```

### 2. Data Requirements
| Series | Source | Resolution | Cleaning |
|--------|--------|-----------|----------|
| OHLCV | Binance `/api/v3/klines` (spot) or `/fapi/v1/klines` (USDM) | 1h | drop bars with `volume==0` (halts) |
| Funding (perp) | `/fapi/v1/fundingRate` | 8h | forward-fill within 8h |
| ATR(14) | derived from OHLCV | 1h | n/a |

### 3. Sample & Walk-Forward
- In-sample: 2022-01-01 → 2024-06-30
- Out-of-sample: 2024-07-01 → 2025-12-31
- Walk-forward: 6-month train, 1-month OOS, roll monthly.
- Reserved holdout: last 60 days, **never tune on it**.

### 4. Fee / Slippage / Funding Models

| Exchange | Taker | Maker | Slippage | Funding |
|----------|------:|------:|---------|---------|
| Binance Spot | 10 bps | 10 bps | 0.5 bps + spread/2 | n/a |
| Binance USDM | 4 bps | 2 bps | 0.5 bps + spread/2 | realized 8h |
| OKX Spot | 8 bps | 6 bps | 0.5 bps + spread/2 | n/a |
| OKX Swap | 5 bps | 2 bps | 0.5 bps + spread/2 | realized 8h |

Adjust fees down only with concrete proof of VIP tier.

### 5. Entry / Exit / Sizing Rules
- Entry: at next bar open after signal.
- Stop: hard stop at `entry - k*ATR(14)` (k specified per strategy).
- TP: optional trailing or fixed-R; specify exact rule.
- Sizing: % of equity / ATR.
- Max concurrent positions: `n` (configurable).
- One trade per signal: no pyramiding unless explicitly justified.
- No look-ahead: indicators computed on closed bars only.

### 6. Metrics & Thresholds
| Metric | Threshold for "viable" |
|--------|----------------------:|
| Sharpe (annualized) | ≥ 1.0 |
| Sortino | ≥ 1.5 |
| Calmar | ≥ 0.8 |
| Max drawdown | ≤ 25% |
| Profit factor | ≥ 1.3 |
| Win rate | informational |
| Avg R | ≥ +0.2 |
| OOS / IS Sharpe ratio | ≥ 0.6 |
| Trades / year | ≥ 30 (to be statistically meaningful) |

### 7. Robustness Tests
- Parameter sensitivity: vary EMA windows ±20%, check Sharpe stability.
- Subsample stability: split OOS into quarters, no single quarter < 0 Sharpe.
- Monte Carlo on trade order: 1,000 resamples → 5th-pct equity curve still positive.
- Cost stress: 2× fees, 2× slippage, still profitable?
- Regime split: bull / chop / bear quarters — does the strategy degrade in any single regime to ruin?
- Look-ahead audit: replace future-only indicator with `shift(1)`; results must not change.

### 8. Go / No-Go Rubric
A strategy graduates to paper trading if it clears **all** of:
- OOS Sharpe ≥ 1.0
- OOS max drawdown ≤ 25%
- OOS / IS Sharpe ratio ≥ 0.6
- Survives 2× cost stress (Sharpe ≥ 0.7)
- No single regime quarter < −0.5 Sharpe

If any one fails → revise, retest, do **not** average results.

## Output Format

```
=== Backtest Plan — "EMA20/50 Cross + RSI Filter" — BTC/USDT 1h (Binance USDM) ===

Direction:      long_only
Universe:       BTC/USDT
Period:         2022-01-01 → 2025-12-31  (3 yrs IS, 1.5 yr OOS, walk-forward 6m/1m)
Capital:        10,000 USDT, risk 1% / trade
Fees:           Binance USDM taker 4 bps + slippage 0.5 bps + spread/2
Funding model:  realized 8h, debited/credited at funding stamps

Strategy pseudocode:
  long_entry = cross_up(ema20, ema50) and 50 < rsi14 < 70
  long_exit  = cross_down(ema20, ema50) or rsi14 > 80
  stop = entry - 2*ATR14, hard
  size = (equity * 0.01) / (entry - stop)

Metrics to track:
  [list above]

Robustness tests:
  [6 tests above]

Go / no-go:
  [rubric above]

Estimated runtime:  ~ 30 sec on a single-machine vectorbt run; ~ 2 min event-driven.
Suggested tool:     vectorbt / nautilus_trader / backtrader / own walk-forward harness.
```

## Handoff

- Feeds an external backtest engine (vectorbt, backtrader, nautilus, custom).
- After backtest runs, feeds results into `exchange-paper-trading` for live forward test.
- Survived paper test → optionally feeds `exchange-order-planner` for live deployment.

## Quality Checks

- Pseudocode contains no future references (`shift(-n)` or `future_value`).
- Fee/slippage/funding numbers match the chosen exchange's current schedule.
- Walk-forward window is at least 6 months / 1 month.
- Reserved holdout is named and never referenced inside parameter selection.
- Direction and universe are consistent (you can't long-only a stablecoin pair against another stable).

## Edge Cases

- **Strategy needs depth or L2 data.** Note that Binance/OKX historical L2 is limited and often paid; suggest alternatives or downgrade the strategy.
- **Strategy uses funding rate.** Verify the historical funding endpoint goes back far enough; some pairs have < 1 year history.
- **Very short timeframe (1m).** Warn about fee drag and overfitting risk; recommend cost-stressed metrics first.
- **Universe = top-20 perp.** Specify the rebalancing rule (snapshot at each walk-forward window) to avoid survivorship bias.
- **Strategy depends on listings / events.** Backtest will be biased by analog selection; mark as "exploratory only".

## Example Commands

```
/strategy-backtest-planner "EMA20/50 cross with RSI filter" pair=BTC/USDT exchange=binance market=usdm timeframe=1h direction=long_only
/strategy-backtest-planner "funding rate fade: short when 8h funding > +0.03%" universe=top-20-perp exchange=binance market=usdm timeframe=8h
/strategy-backtest-planner "breakout above 24h high with OI confirmation" pair=ETH/USDT exchange=okx market=swap timeframe=1h direction=both
```

Arabic:
```
/strategy-backtest-planner صمم اختبار لاستراتيجية تقاطع EMA20 و EMA50 مع فلتر RSI على BTC/USDT
/strategy-backtest-planner خطة اختبار لاستراتيجية كسر القمة 24h على OKX
```
