# Workflow — Watchlist Monitoring

> Daily scan of a persistent watchlist with alert evaluation.

## Pre-conditions
- A watchlist exists at `~/.crypto-skills/watchlist.yaml` (or via `configs/watchlists.example.json`).

## Trigger phrases
- "scan my watchlist"
- "any alerts firing today?"
- "افحص قائمة المتابعة"

## Skill chain
```
1. crypto-watchlist-manager scan
   → for each pair:
        binance-market-scan or okx-market-scan
        crypto-technical-analysis
        (if perp) crypto-futures-analysis
   → compute composite score per pair
   → evaluate alert rules
2. if any alert fires:
   → crypto-report-generator on that pair  (auto)
3. summarize:
   → top-3 by composite Δ vs yesterday
   → bottom-3 by composite Δ vs yesterday
   → alerts triggered today
```

## Alert rule grammar
- `RSI<30 on 1h`
- `cross EMA50 from below on 4h`
- `funding>+0.05% on swap`
- `OI Δ>+10% in 24h`
- `price>72000`

## Output
A digest: scores, alerts, suggested follow-up reports.

## Recurrence
Recommended: once per UTC day, plus a quick mid-day scan in volatile regimes.

## Reference
[examples/binance/watchlist-example.md](../examples/binance/watchlist-example.md)
