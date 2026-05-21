# Workflow — Report Generation

> Full 10-section research report for a pair.

## Trigger phrases
- "full report on BTC/USDT"
- "complete analysis of ETH"
- "research dossier for SOL"
- "تقرير كامل عن BTC"

## Skill chain
This is the canonical fan-out workflow:

```
crypto-report-generator
   ├── binance-market-scan / okx-market-scan
   ├── crypto-technical-analysis
   ├── crypto-spot-analysis              (if spot)
   ├── crypto-futures-analysis           (if perp/futures)
   ├── exchange-liquidity-depth
   ├── crypto-sentiment-scan             (if perp)
   ├── crypto-risk-manager
   └── crypto-entry-exit-planner
```

## Output sections (in order)
1. Snapshot
2. Technical Analysis
3. Spot View (or skipped)
4. Futures View (or skipped)
5. Liquidity & Microstructure
6. Sentiment (if applicable)
7. Risk Sizing
8. Entry & Exit Plan
9. Composite Score
10. Final Verdict + Caveats

## Final verdict rule
- BUY if composite ≥ 70, TA ≥ 65, liquidity ≥ 60, risk-manager = GO, regime ≠ bearish.
- WAIT if 55 ≤ composite < 70 OR price above ideal entry zone.
- AVOID if composite < 50 OR liquidity score < 40 OR risk-manager NO-GO.
- SHORT if composite ≤ 35, TA bearish, futures bearish, risk-manager = GO on short.
- NO-TRADE if data missing OR halted OR spread > 0.5%.

## Optional PDF export
With `include_pdf=true`, the report is also rendered to PDF via the `pdf` skill in the runtime.

## Reference
[examples/reports/full-market-report-example.md](../examples/reports/full-market-report-example.md)
[examples/reports/pair-report-example.md](../examples/reports/pair-report-example.md)
[examples/reports/futures-risk-report-example.md](../examples/reports/futures-risk-report-example.md)
