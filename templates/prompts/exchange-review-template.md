# Exchange Review Prompt Template

Review a pair across both supported exchanges.

---

> **Prompt:**
>
> Review {{PAIR}} on both Binance and OKX ({{MARKET_TYPE}}).
>
> For each exchange show:
> - price + 24h Δ
> - 24h volume (USDT)
> - top-of-book spread (bps)
> - depth ±0.1% (USDT)
> - {{INCLUDE_FUTURES?}} funding, OI
>
> Then tell me:
> - which exchange has better execution for size {{SIZE_USDT}} USDT?
> - any meaningful price divergence (after fees + slippage)?
> - if the trade is futures, where is the funding cheaper for {{DIRECTION}}?
