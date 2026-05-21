---
name: crypto-sentiment-scan
description: Read the market mood for a coin or pair on Binance / OKX using a combination of futures funding rate, long/short ratio, open interest velocity, social-keyword volume, and exchange-listed sentiment proxies. Triggers on "what's the sentiment on BTC", "how bullish is SOL right now", "are people long or short on ETH", "ما هو شعور السوق على BTC", "هل الناس لونج أم شورت". Returns a Sentiment Score (-100 bearish .. +100 bullish), a regime label (extreme fear / fear / neutral / greed / euphoria), the dominant driver, and a contrarian flag when sentiment is at an extreme.
version: 1.0.0
category: analysis
compatible_with: [claude-code, openclaw, cursor, hermes]
exchanges: [binance, okx]
mode: analysis
license: MIT
---

# Crypto Sentiment Scan

Quantify how bullish or bearish the market is on a given pair. Uses **only exchange-native signals** (funding, OI, LSR, taker buy/sell ratio, top-trader positioning) plus optional public sentiment APIs. No black-box "vibes" — every component score is shown.

> ⚠ **DISCLAIMER**
> Sentiment is a contrarian / confirmation tool, not a signal by itself. Extreme readings often precede reversals but not always. Combine with `crypto-technical-analysis` and `crypto-futures-analysis` before any trade decision. Not financial advice.

---

## Purpose

Give an agent a single, defensible read on market mood for a pair so it can frame technical setups correctly (chase vs fade), warn the user about crowded trades, and detect funding flips and OI capitulations.

## When to Use

- "sentiment on BTC right now"
- "are traders bullish on SOL"
- "is the crowd long ETH"
- "ما هو شعور السوق على BTC/USDT"
- "هل التداول مزدحم على ETH"
- Routinely as part of `crypto-report-generator`.
- Before any contrarian setup (mean reversion, fade-the-extreme).

## Required Inputs

| Input | Required? | Example |
|-------|-----------|---------|
| `pair` | yes | `BTC/USDT`, `SOL/USDT` |
| `exchange` | yes | `binance` / `okx` |
| `market_type` | yes | `swap` / `usdm` / `coinm` (sentiment is futures-driven) |

## Optional Inputs

| Input | Default | Example |
|-------|---------|---------|
| `window` | `24h` | `1h`, `4h`, `24h`, `7d` |
| `include_social` | `false` | `true` to also probe public sentiment APIs |
| `compare_history` | `true` | percentile vs last 90 days |
| `top_trader_ratio` | `true` | include Binance top-trader long/short |

## Workflow

```
1. Pull funding rate (current + last 24h average).
2. Pull open interest now vs 24h ago (Δ%, USD value).
3. Pull long/short account ratio + position ratio (Binance) or LSR (OKX).
4. Pull taker buy/sell ratio (Binance) or buyVol/sellVol (OKX 24h).
5. Pull liquidation map (last 24h longs vs shorts liquidated).
6. (Optional) Pull Binance top-trader long/short ratio (Pro accounts).
7. (Optional) Pull public sentiment proxy (e.g. Fear & Greed index for BTC).
8. Normalize each component to a -100..+100 score.
9. Compute weighted Sentiment Score.
10. Compare each component to 90-day percentile → flag extremes.
11. Set regime label and contrarian flag.
```

## Exchange-Specific Handling

### Binance

| Signal | Endpoint |
|--------|----------|
| Funding (USDM) | `GET /fapi/v1/premiumIndex` and `/fapi/v1/fundingRate` |
| Open Interest | `GET /futures/data/openInterestHist` |
| Long/Short Account Ratio | `GET /futures/data/globalLongShortAccountRatio` |
| Top-Trader Account Ratio | `GET /futures/data/topLongShortAccountRatio` |
| Top-Trader Position Ratio | `GET /futures/data/topLongShortPositionRatio` |
| Taker Buy/Sell Vol | `GET /futures/data/takerlongshortRatio` |

### OKX

| Signal | Endpoint |
|--------|----------|
| Funding | `GET /api/v5/public/funding-rate?instId=BTC-USDT-SWAP` |
| Open Interest | `GET /api/v5/public/open-interest` |
| LSR (account) | `GET /api/v5/rubik/stat/contracts/long-short-account-ratio` |
| LSR (volume) | `GET /api/v5/rubik/stat/taker-volume` |
| OI by coin | `GET /api/v5/rubik/stat/contracts/open-interest-volume` |

## Component Scoring

| Component | Weight | +100 means | -100 means |
|-----------|--------|-----------|-----------|
| Funding | 25% | very negative funding (shorts paying) → contrarian bullish | very positive funding (longs paying) → contrarian bearish |
| OI Δ vs price | 15% | OI ↑ + price ↑ → trend conviction; OI ↑ + price ↓ → new shorts | OI ↓ + price ↑ → short squeeze; OI ↓ + price ↓ → capitulation |
| L/S account ratio | 15% | < 0.7 (shorts crowded) → contrarian bullish | > 1.5 (longs crowded) → contrarian bearish |
| Top-trader L/S | 15% | top traders heavily long | top traders heavily short |
| Taker buy/sell | 15% | aggressive buyers dominate | aggressive sellers dominate |
| Liquidations 24h | 10% | mostly shorts liq (shorts wrong) | mostly longs liq (longs wrong) |
| (Optional) Social | 5% | rising mention volume with positive lean | rising mentions with negative lean |

Regime label:

| Score | Regime |
|-------|--------|
| ≤ −60 | Extreme fear |
| −60 to −20 | Fear |
| −20 to +20 | Neutral |
| +20 to +60 | Greed |
| ≥ +60 | Euphoria |

Contrarian flag: any single component at the 5th or 95th percentile of its 90-day distribution.

## Output Format

```
=== Sentiment Scan — BTC/USDT (Binance USDM) | window=24h ===
Sentiment Score: +42 / 100  (Greed)
Regime:          Greed
Dominant driver: Funding (+0.0184% / 8h, 88th percentile)
Contrarian flag: YES (funding at 88th pct, top-trader L/S at 91st pct)

Components:
  Funding ............. +65   (longs paying, crowded)
  OI Δ vs price ....... +30   (OI +6.4%, price +2.1% → trend conviction, mild)
  L/S account ratio ... +25   (1.18 — slightly long-skewed)
  Top-trader L/S ...... +55   (top accounts 1.42 long)
  Taker buy/sell ...... +35   (54% taker buys 24h)
  Liquidations 24h .... +20   (longs liq 38M, shorts liq 27M → recent dip)
  Social .............. n/a

Reading:
  The crowd and the top traders are both long.
  Funding is hot but not extreme. A second leg up is possible
  but expect a sharp -3% wick if price tags major resistance.
  Suggested bias: WAIT for a pullback, do not chase.
```

## Handoff

- Feeds into `crypto-futures-analysis` → confirms or contradicts funding/OI read.
- Feeds into `crypto-report-generator` → section 9 (sentiment).
- Triggers `crypto-news-impact` if Sentiment Score moved > 30 points vs yesterday (likely a news event).

## Quality Checks

- All 6 mandatory components return data (no nulls).
- 90-day percentile uses at least 30 data points.
- Sentiment Score within −100..+100; no NaN.
- If `pair` has no futures market → skip sentiment scan, return `n/a` with clear reason.
- Stale data (last sample > 30 min old) → flag `stale=true`.

## Edge Cases

- Pair has spot only on the exchange → sentiment scan refuses; suggest a related futures pair (e.g. BTC-USDT-SWAP).
- Newly-listed perp (< 30 days) → percentile uses available history, mark `low_history`.
- Funding window mismatch (Binance 8h vs OKX 8h, but some OKX pairs 4h) → normalize to per-8h before comparing.
- Extreme one-sided liquidation event → cap component to ±100, do not over-weight.
- API outage on one signal → drop weight, normalize remaining weights to 100%.

## Example Commands

```
/crypto-sentiment-scan pair=BTC/USDT exchange=binance market=usdm window=24h
/crypto-sentiment-scan pair=SOL/USDT exchange=okx market=swap include_social=true
/crypto-sentiment-scan pair=ETH/USDT exchange=binance market=usdm window=7d
```

Arabic:
```
/crypto-sentiment-scan شعور السوق على BTC/USDT خلال آخر 24 ساعة على Binance
/crypto-sentiment-scan هل التداول مزدحم على SOL/USDT في OKX سواب
/crypto-sentiment-scan تحقق من ETH/USDT خلال أسبوع
```
