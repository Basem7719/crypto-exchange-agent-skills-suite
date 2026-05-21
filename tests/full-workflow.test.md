# Test — full-workflow integration

## Goal
End-to-end: from user intent → final report.

## Command
```
/crypto-exchange-master "give me a full report on BTC/USDT on Binance spot, 1h, with 5000 USDT capital"
```

## Expected chain
1. Master parses intent.
2. Calls `binance-market-scan` → market snapshot.
3. Calls `crypto-technical-analysis` → TA scores.
4. Calls `crypto-spot-analysis` → spot score.
5. Calls `exchange-liquidity-depth` → depth/spread.
6. Calls `crypto-risk-manager` → sizing.
7. Calls `crypto-entry-exit-planner` → plan.
8. Calls `crypto-report-generator` → final synthesis.
9. Returns a 10-section markdown report.

## Expected output sections (in order)
1. Snapshot
2. Technical Analysis
3. Spot View
4. Futures View (or "n/a — spot market")
5. Liquidity & Microstructure
6. Risk Sizing
7. Entry & Exit Plan
8. Composite Score
9. Final Verdict
10. Caveats

## Success criterion
- All 10 sections present.
- `composite_score` in 0-100.
- `verdict` in {BUY, WAIT, AVOID, SHORT, NO-TRADE}.
- Output validates against `schemas/trade-report.schema.json`.

## Negative tests
- Stop the chain after step 3 if `exchange-pair-finder` reports pair unlisted.
- Skip step 4 if `market_type=spot`.
- If any sub-skill fails, the report still completes with `data unavailable` in that section.
