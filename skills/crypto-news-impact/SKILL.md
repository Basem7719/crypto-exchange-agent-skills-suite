---
name: crypto-news-impact
description: Estimate the price-impact of a specific news event on a coin or pair traded on Binance / OKX. Takes a news headline or URL plus the pair, classifies the event (listing, delisting, hack, partnership, regulation, ETF, mainnet upgrade, token unlock, macro), benchmarks against historical analogs, and returns expected direction, magnitude band, time-to-fade, and a trade-or-skip recommendation. Triggers on "how will X news affect Y", "is this news bullish for BTC", "هل هذا الخبر مؤثر على SOL", "أثر خبر الفائدة على الكريبتو". Pure analysis — does not execute trades.
version: 1.0.0
category: analysis
compatible_with: [claude-code, openclaw, cursor, hermes]
exchanges: [binance, okx]
mode: analysis
license: MIT
---

# Crypto News Impact

Map a specific news event to an expected price reaction. Uses historical analogs (Binance/OKX kline data around past similar events), event taxonomy, and current market context (funding, OI, sentiment) to produce a defensible impact estimate.

> ⚠ **DISCLAIMER**
> Markets price news in unpredictable ways. The same headline can rally in one regime and dump in another. This skill produces **probabilistic bands**, not predictions. Combine with `crypto-sentiment-scan` and `crypto-technical-analysis` before any decision. Not financial advice.

---

## Purpose

Translate a free-text news headline (or short article) into structured fields the agent can reason about: event_type, severity, direction, expected_move_band, time_to_fade, and a tradeable / not-tradeable verdict.

## When to Use

- "how will the SEC ruling affect BTC"
- "is the new ETF listing bullish for ETH"
- "Coinbase listed XYZ — should I trade it on Binance"
- "كيف يؤثر خبر الفائدة على الكريبتو"
- "هل قرار الـ ETF يدعم BTC"
- After `crypto-sentiment-scan` detects a > 30-point shift overnight (likely news-driven).

## Required Inputs

| Input | Required? | Example |
|-------|-----------|---------|
| `headline` or `url` | yes | `"SEC approves spot Ethereum ETF"` |
| `pair` | yes | `BTC/USDT`, `ETH/USDT` |
| `exchange` | yes | `binance` / `okx` |

## Optional Inputs

| Input | Default | Example |
|-------|---------|---------|
| `event_time` | now | ISO timestamp the event was published |
| `market_type` | `spot` | `spot` / `usdm` / `swap` |
| `lookback_for_analogs` | `3 years` | how far back to search for similar events |
| `confidence_floor` | `0.5` | refuse to publish a verdict below this confidence |

## Workflow

```
1. Classify the headline into one of the canonical event_types:
     - listing (CEX listing on Binance/OKX/Coinbase/Kraken)
     - delisting / suspension
     - exploit / hack / depeg
     - partnership / integration
     - regulation (positive/negative)
     - ETF approval / rejection / inflows / outflows
     - mainnet / upgrade / fork
     - token unlock (cliff/vesting)
     - macro (CPI, FOMC, jobs)
     - exchange outage / withdrawal halt
2. Score severity (1–5) and direction (bullish/bearish/mixed).
3. Find 3–5 historical analogs in the lookback window.
   For each analog, measure: 1h move, 24h move, 7d move on the same exchange & market_type.
4. Compute the analog distribution → median and 25/75 bands.
5. Adjust for current context:
     - sentiment score (greed amplifies bullish, fear amplifies bearish)
     - funding extreme (squeeze potential)
     - liquidity depth (thin book → bigger move)
     - time-of-day / weekend
6. Output expected_move_band (USDT %), time_to_fade, tradeable y/n.
7. If tradeable, suggest a setup outline (entry zone, invalidation) — forwarded to crypto-entry-exit-planner.
```

## Exchange-Specific Handling

### Binance
- Listings on Binance Spot trigger a well-documented "Binance effect" — measure historical analog set from `/api/v3/klines` around Binance announcement timestamps.
- Delistings: pull the official Binance announcement RSS / API, measure 24h/7d post-announcement decline.

### OKX
- OKX listings have a smaller but distinct pop pattern; use `/api/v5/market/history-candles` for the analog set.
- OKX's spot/swap/options listings frequently bundle — check if a perp listing followed the spot listing.

### Both
- Macro events (CPI, FOMC) affect majors symmetrically across both exchanges; use Binance USDM funding as the proxy for the move.

## Event Taxonomy → Default Direction & Median Band

| Event Type | Default Direction | Median 24h Move (Majors) | Median 24h (Mid-cap) |
|------------|-------------------|-------------------------|----------------------|
| Binance spot listing | bullish | +12% | +35% |
| OKX spot listing | bullish | +6% | +18% |
| Major CEX delisting | bearish | −18% | −35% |
| Exchange exploit (own coin) | bearish | −12% | n/a |
| Mainnet/major upgrade | bullish | +4% | +10% |
| Token unlock (>5% supply) | bearish | −3% | −9% |
| ETF approval (BTC/ETH) | bullish | +6% | +3% (alt) |
| ETF rejection / delay | bearish | −5% | −2% |
| Hostile regulation | bearish | −7% | −12% |
| Friendly regulation | bullish | +4% | +6% |
| FOMC hawkish surprise | bearish | −3% | −5% |
| FOMC dovish surprise | bullish | +4% | +6% |
| CPI hot | bearish | −2% | −3% |
| CPI cool | bullish | +3% | +4% |

These are **starting priors**, not predictions; the analog distribution overrides them when there are enough samples.

## Output Format

```
=== News Impact — "SEC approves spot ETH ETF" on ETH/USDT (Binance Spot) ===
Event classification:
  type:        regulation / ETF approval
  severity:    5 / 5
  direction:   bullish
  confidence:  0.82

Historical analogs (4 found):
  BTC spot ETF approval, Jan 2024:    +0.4% 1h | +2.5% 24h | -8.0% 7d (sell-the-news)
  Grayscale ETF win, Aug 2023:        +3.1% 1h | +6.8% 24h | +4.0% 7d
  ProShares ETF launch, Oct 2021:     +5.2% 1h | +8.1% 24h | -4.5% 7d
  CME futures launch, Dec 2017:       +9.0% 1h | +12% 24h  | -25% 30d (top)

Expected move bands (24h, 75% CI):
  1h:   +0.5% to +4.0%
  24h:  +2.5% to +8.0%
  7d:   -10% to +5%   (high "sell-the-news" risk)

Context adjustment:
  Sentiment: +52 (greed) → amplifies upside but raises sell-the-news risk
  Funding:   +0.018% (hot) → crowded longs
  OI:        +14% in 7d → leveraged into the event

Verdict: TRADEABLE but cautious
  Bias:    Long the dip, NOT chase the spike
  Plan:    wait for first -2% pullback into 24h VWAP
  Watch:   funding flip negative → strong support
  Skip if: funding stays > +0.02% 4h after event
```

## Handoff

- Feeds `crypto-entry-exit-planner` when verdict is TRADEABLE.
- Updates `crypto-watchlist-manager` with an `event_active` flag on the pair for next 7 days.
- Adds an annotation to `crypto-report-generator` (section 10 caveats).

## Quality Checks

- At least 3 historical analogs found, or confidence forced ≤ 0.5.
- Headline classification disagrees with explicit direction tag → flag for human review.
- If event_time > 24h old, downgrade severity by 1 (most of the move is in the rear-view).
- Expected band must include zero or have justification why it doesn't.

## Edge Cases

- **No analogs found.** Use the taxonomy prior, mark confidence ≤ 0.5, output "limited basis".
- **Conflicting headlines on same event.** Aggregate; if direction split > 30/70, mark `mixed` and refuse a directional verdict.
- **Rumor vs confirmed.** If headline contains "reportedly", "may", "could", downgrade severity by 1.
- **Event already priced in.** If pair moved > 1 ATR in the 24h before headline, expected residual move is ≤ 25% of taxonomy prior.
- **Stablecoin de-peg news.** Treat as severity 5 bearish for the stablecoin's pairs; check for contagion to lending protocols.

## Example Commands

```
/crypto-news-impact headline="Binance lists $XYZ on spot" pair=XYZ/USDT exchange=binance
/crypto-news-impact url="https://www.coindesk.com/..." pair=ETH/USDT exchange=okx
/crypto-news-impact headline="FOMC hikes 25bps, hawkish dot plot" pair=BTC/USDT exchange=binance market=usdm
```

Arabic:
```
/crypto-news-impact كيف يؤثر إدراج XYZ على Binance على الزوج XYZ/USDT
/crypto-news-impact أثر قرار الفائدة على BTC/USDT
/crypto-news-impact هل خبر الـ ETF بيدفع ETH للأعلى
```
