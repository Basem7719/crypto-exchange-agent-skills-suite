# Pair Comparison Prompt Template

Compare two or more pairs in a single shot.

---

> **Prompt:**
>
> Compare these pairs: {{PAIR_1}}, {{PAIR_2}}, {{PAIR_3}}.
> Exchange: {{EXCHANGE}} ({{MARKET_TYPE}}).
> Timeframe: {{TIMEFRAME}}.
>
> Score and rank them by:
> - 24h % change
> - volume
> - TA score (trend, RSI, MACD)
> - liquidity (spread + depth at the size I'd trade)
> - {{INCLUDE_FUTURES?}} funding + OI (perp)
>
> Recommend the single best candidate for a {{LONG/SHORT}} swing trade.
