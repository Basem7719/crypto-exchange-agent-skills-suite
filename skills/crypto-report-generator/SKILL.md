---
name: crypto-report-generator
description: Build a full, submission-ready research report for any pair on Binance or OKX. Orchestrates the entire skill pipeline — market scan, technical analysis, spot view, futures view, liquidity check, risk sizing, entry/exit plan — and emits a single coherent markdown document with a final verdict. Triggers on "give me the full report on BTC/USDT", "complete analysis of SOL on OKX", "research dossier for ETH/USDT", "تقرير كامل عن BTC", "حلل لي الزوج كامل". Output is a markdown file that can be exported to PDF. The report is informational only — not financial advice.
version: 1.0.0
category: report
compatible_with: [claude-code, openclaw, cursor, hermes]
exchanges: [binance, okx]
mode: analysis
license: MIT
---

# Crypto Report

A single command that produces the full research dossier for a pair. Pulls from every other skill in the package, weighs the evidence, and prints one document with a clear final verdict (BUY / WAIT / AVOID / SHORT / NO-TRADE).

## Purpose

Build a full, submission-ready research report for any pair on Binance or OKX. Orchestrates the entire skill pipeline — market scan, technical analysis, spot view, futures view, liquidity check, risk sizing, entry/exit plan — and emits a single coherent markdown document with a final verdict. Triggers on "give me the full report on BTC/USDT", "complete analysis of SOL on OKX", "research dossier for ETH/USDT", "تقرير كامل عن BTC", "حلل لي الزوج كامل". Output is a markdown file that can be exported to PDF. The report is informational only — not financial advice.

This skill is part of the **crypto-exchange-agent-skills-suite**. See [`../../docs/architecture.md`](../../docs/architecture.md) for how it fits with the other 20 skills.

---

> ⚠ **DISCLAIMER**
> This is automated research synthesis, not advice. Markets can move against any view in seconds. The verdict is a starting point for the user's own decision, never a substitute.

---

## When to Use

- "full report on BTC/USDT (Binance)"
- "complete analysis: SOL/USDT on OKX"
- "research dossier for ETH/USDT futures"
- "تقرير كامل عن BTC/USDT على Binance"
- "حلل لي الزوج كامل ووريني التقرير"
- End-of-day batch reports for a watchlist (loop this skill).

---

## Required Inputs

| Input | Required? | Example |
|-------|-----------|---------|
| `pair` | yes | `BTC/USDT`, `SOL/USDT` |
| `exchange` | yes | `binance` / `okx` |
| `market_type` | yes | `spot` / `usdm` / `swap` |
| `timeframe` | optional | `15m` / `1h` / `4h` / `1d` (default `1h`) |
| `capital` | optional | account equity for risk sizing |
| `risk_pct` | optional | default `1.0` (% of equity) |
| `output_path` | optional | path to write `.md` (default stdout) |
| `include_pdf` | optional | `true` → also render via pdf skill |

---

## Workflow

```
1. Normalize symbol per exchange (BTCUSDT vs BTC-USDT / BTC-USDT-SWAP).
2. Run pipeline in parallel where possible:
     a. binance-market-scan OR okx-market-scan   → snapshot
     b. crypto-technical-analysis                → TA score + S/R + indicators
     c. crypto-spot-analysis (if spot)            → spot score
     d. crypto-futures-analysis (if perp/futures) → funding, OI, basis, LSR
     e. exchange-liquidity-check                  → depth, spread, slippage
3. Combine into composite score:
     composite = 0.30*TA + 0.25*(spot or futures) + 0.20*liquidity + 0.15*momentum + 0.10*regime
4. crypto-risk-manager → position size, stop, TP ladder, R:R, fees, NO-GO checks
5. crypto-entry-exit-plan  → entry zone, invalidation, TP1/TP2/TP3, time stop
6. Determine final verdict (rules below).
7. Render markdown report with all sections.
8. (Optional) Convert to PDF via the pdf skill.
```

---

## Verdict Rules

| Verdict | Conditions |
|---------|-----------|
| **BUY** | composite ≥ 70, TA ≥ 65, liquidity ≥ 60, risk-manager = GO, regime not bearish |
| **WAIT** | composite 55–69 OR price above ideal entry zone OR funding extreme |
| **AVOID** | composite < 50, OR liquidity score < 40, OR risk-manager NO-GO |
| **SHORT** | composite ≤ 35, TA bearish, futures bearish (funding > +0.05% & price extended), risk-manager = GO on short side |
| **NO-TRADE** | data missing, market halted, spread > 0.5%, conflicting signals across timeframes |

---

## Output Format

```
# Crypto Report — BTC/USDT (Binance Spot)
Generated: 2026-05-20 10:45 UTC  |  Timeframe: 1h  |  Skill: crypto-report v1.0.0

## 1. Snapshot
Last:        64,128.50 USDT       24h Δ: +2.14%
24h Range:   62,800 – 64,910      24h Vol: 18,420 BTC (1.18B USDT)
Spread:      0.012%                Depth ±0.5%: 3.2M / 3.5M USDT (bid/ask)

## 2. Technical Analysis
Trend (EMA stack):     Bullish — EMA20 > EMA50 > EMA200
RSI(14):               58.4  (neutral, room to run)
MACD:                  Bullish cross, histogram rising
Bollinger Band width:  Expanding from squeeze
ATR(14):               412 USDT
Key S/R:               S1 63,400  S2 62,800  R1 64,950  R2 66,400
Technical Score:       72 / 100

## 3. Spot View
Volume profile:        High-volume node at 63,500
Buyer aggression:      55% (taker buy / total)
Spot Score:            68 / 100

## 4. Futures View (USDM)
Funding (next):        +0.0084%  (mildly long-biased, not extreme)
Open Interest 24h:     +6.4%  ($14.2B)
Basis (3m):            +1.2% annualized
Long/Short ratio:      1.18  (slight long crowd)
Liquidation map:       Heavy shorts at 65,500; longs at 62,400
Futures Score:         64 / 100

## 5. Liquidity & Microstructure
Spread:                1.2 bps  (excellent)
Depth ±0.1% / ±0.5% / ±1%:  580k / 3.2M / 6.8M USDT (bid side)
Slippage for 50k USDT market buy:  ~3.8 bps
Liquidity Score:       82 / 100

## 6. Risk Sizing (capital = 5,000 USDT, risk = 1%)
Risk budget:           50.00 USDT
Entry:                 63,800
Stop:                  62,950   (-1.33%)
Position size:         0.058 BTC  (~3,700 USDT notional, 74% of cash)
R per coin:            850 USDT
Fees round-trip est.:  4.30 USDT  (8.6% of risk — OK)
Risk-Manager Verdict:  GO ✓

## 7. Entry & Exit Plan
Entry zone:            63,600 – 63,950
Invalidation:          close below 62,800 on 4h
TP1 (1R):              64,650  → close 40%
TP2 (2R):              65,500  → close 35%
TP3 (3R+):             66,400+ → trail remainder with EMA20-1h
Time stop:             36h — if no progress, exit at market
Pre-trade checklist:   ✓ 8 / 8

## 8. Composite Score
0.30 * 72 (TA) + 0.25 * 68 (Spot) + 0.20 * 82 (Liq) + 0.15 * 64 (Mom) + 0.10 * 70 (Regime)
= 71.5 / 100

## 9. Final Verdict
BUY — composite 71.5, TA 72, liquidity 82, risk-manager GO.
Wait for pullback into 63,600–63,950 zone. Do not chase above 64,250.

## 10. Caveats
- Funding could flip if BTC tags 66,000; reassess.
- US CPI release in 18h — consider reducing size or holding off.
- This is research, not advice.
```

---

## Edge Cases

- **Stablecoin pair (e.g. USDC/USDT).** Skip TA/futures sections; only liquidity + spread + de-peg checks matter.
- **Newly listed pair (<7 days).** Print a "limited history" banner and downgrade composite by 10 points.
- **Delisted / halted.** Abort with a clear message; suggest closest active pair.
- **Pair on one exchange only.** Skip the other; report it explicitly in the snapshot.
- **API failure on one sub-skill.** Continue with the rest; mark the missing section "data unavailable".
- **Both spot and futures requested.** Produce two stacked verdicts (spot + futures), each with its own risk/plan section.
- **Extreme funding (|funding| > 0.1%/8h).** Auto-add a "funding warning" callout and bias verdict toward WAIT.
- **Spread > 0.5% or top-of-book < 1k USDT depth.** Force NO-TRADE regardless of TA.

---

## Handoff

This skill is the top-level synthesizer. It calls:

```
crypto-report
   ├── binance-market-scan / okx-market-scan
   ├── crypto-technical-analysis
   ├── crypto-spot-analysis           (if spot)
   ├── crypto-futures-analysis        (if perp/futures)
   ├── exchange-liquidity-check
   ├── crypto-risk-manager
   └── crypto-entry-exit-plan
```

Downstream, the user typically chains into:

```
crypto-report  →  exchange-order-planner  →  (paper)  →  exchange-trading-executor
```

---

## Example Commands

```
/crypto-report pair=BTC/USDT exchange=binance market=spot timeframe=1h capital=5000
/crypto-report pair=ETH/USDT exchange=okx market=swap timeframe=4h
/crypto-report pair=SOL/USDT exchange=binance capital=2000 risk_pct=0.5 include_pdf=true
/crypto-report pair=BILL/USDT exchange=okx        # micro-cap; expect "limited history" banner
```

Arabic:

```
/crypto-report تقرير كامل BTC/USDT على Binance spot رأس المال 5000 المخاطرة 1%
/crypto-report حلل لي ETH/USDT على OKX سواب على فريم 4 ساعات
/crypto-report SOL/USDT بـ PDF كمان
```

---

## Author Notes

The report is meant to be read in 60 seconds. If a section reads like filler, cut it. Numbers first, prose second. The verdict at the bottom must be defensible from the data above it — if you can't justify it from sections 1–8, it's wrong.

---

## Optional Inputs

| Input | Default | Example |
|-------|---------|---------|
| `timeframe` | `1h` | `15m`, `4h`, `1d` |
| `verbose` | `false` | `true` for raw endpoint dumps |

The full list of inputs is documented under [`## Required Inputs`](#required-inputs) above. Anything not marked required is optional with sensible defaults.

---

## Exchange-Specific Handling

### Binance
- Endpoints, symbol formats, and quirks are documented in [`../../docs/binance-guide.md`](../../docs/binance-guide.md).
- Symbol format: `BTCUSDT` (no separator). Perp uses USDM endpoints (`fapi.binance.com`).

### OKX
- Endpoints, bar values, and quirks are documented in [`../../docs/okx-guide.md`](../../docs/okx-guide.md).
- Symbol format: `BTC-USDT` (spot), `BTC-USDT-SWAP` (perp), `BTC-USDT-251226` (futures).
- Bar values are uppercase from `1H` upward.

---

## Quality Checks

- All required fields populated; no `null` in required positions.
- Numeric outputs within expected ranges (no negative volumes, RSI in [0,100], etc.).
- Data timestamp within last 5 minutes when the request is real-time.
- For multi-exchange outputs, both Binance and OKX figures use the same time window.
- If an endpoint returns an error, the skill surfaces it explicitly rather than inventing values.
