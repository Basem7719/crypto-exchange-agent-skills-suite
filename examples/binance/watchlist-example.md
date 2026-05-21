# Example — Binance Watchlist Scan

## Setup
Watchlist defined in `configs/watchlists.example.json` (or `~/.crypto-skills/watchlist.yaml`).

## User prompt
```
/crypto-watchlist-manager scan list=majors
```

## Output
```
=== Watchlist Scan — "majors" — Binance Spot — 2026-05-21 09:00 UTC ===

| pair        | price  | 24h Δ  | RSI(1h) | TA   | alert  |
|-------------|-------:|------:|-------:|-----:|--------|
| BTC/USDT    | 64,250 | +1.8% | 58     | 72   |        |
| ETH/USDT    |  3,180 | -0.6% | 48     | 56   |        |
| SOL/USDT    |   162  | +3.2% | 64     | 70   |        |
| BNB/USDT    |   614  | +0.4% | 52     | 60   |        |
| XRP/USDT    |   0.62 | +1.1% | 55     | 62   |        |
| ADA/USDT    |   0.49 | +2.7% | 61     | 65   |        |
| AVAX/USDT   |  37.4  | +0.9% | 50     | 58   |        |
| DOGE/USDT   |  0.146 | -1.4% | 43     | 50   |        |

TOP 3 by 24h Δ:
  SOL/USDT (+3.2%), ADA/USDT (+2.7%), BTC/USDT (+1.8%)

BOTTOM 3 by 24h Δ:
  DOGE/USDT (-1.4%), ETH/USDT (-0.6%), BNB/USDT (+0.4%)

ALERTS TRIGGERED
  (none)

SUGGESTED FOLLOW-UPS
  /crypto-report-generator pair=SOL/USDT exchange=binance market=spot timeframe=1h
```

## Add a pair
```
/crypto-watchlist-manager add LINK/USDT list=majors
```

## Remove
```
/crypto-watchlist-manager remove DOGE/USDT list=majors
```
