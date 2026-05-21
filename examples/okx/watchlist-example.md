# Example — OKX Watchlist (low-cap focus)

## Setup
```json
{
  "user-custom": {
    "label": "User Custom",
    "exchange": "okx",
    "market_type": "spot",
    "pairs": ["BILL/USDT", "PLAY/USDT"],
    "alerts": [
      {"pair":"BILL/USDT", "rule":"price>1.5x 24h average"},
      {"pair":"PLAY/USDT", "rule":"vol Δ>+50% in 1h"}
    ]
  }
}
```

## User prompt
```
/crypto-watchlist-manager scan list=user-custom
```

## Output
```
=== Watchlist — "user-custom" — OKX Spot ===

| pair       | price  | 24h Δ  | RSI(1h) | TA  | alert         |
|------------|-------:|------:|-------:|----:|---------------|
| BILL-USDT  | 0.0287 | +8.1% | 71     | 64  |               |
| PLAY-USDT  | 0.451  | +14.7%| 76     | 70  | vol +62% 1h ⚡|

ALERT
  PLAY-USDT: volume +62% in last 1h crossed threshold
  → suggested: /crypto-report-generator pair=PLAY-USDT exchange=okx
```

## Notes
- Watchlist scans run cheap (no signed endpoints). Run hourly during volatile sessions.
