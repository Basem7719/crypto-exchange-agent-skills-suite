# Binance Supported Data

Coverage matrix of what the adapter exposes to the suite.

| Concept | Spot | USDM | COIN-M | Notes |
|--------|:----:|:----:|:------:|------|
| Last price | ✅ | ✅ | ✅ | `/ticker/24hr` or `/ticker/price` |
| 24h volume | ✅ | ✅ | ✅ | quote and base |
| Klines 1m..1M | ✅ | ✅ | ✅ | up to 1500 per call |
| Depth (≤5000) | ✅ | ✅ | ✅ | weight scales with limit |
| Trades (recent) | ✅ | ✅ | ✅ | last 1000 |
| Aggregate trades | ✅ | ✅ | ✅ | for tape reading |
| Symbol filters | ✅ | ✅ | ✅ | tick/step/minNotional/minQty |
| Funding rate | — | ✅ | ✅ | `/fapi/v1/fundingRate` |
| Open interest | — | ✅ | ✅ | `/futures/data/openInterestHist` |
| L/S account ratio | — | ✅ | — | `/futures/data/globalLongShortAccountRatio` |
| Top-trader L/S | — | ✅ | — | `topLongShortAccountRatio`, `topLongShortPositionRatio` |
| Taker buy/sell | — | ✅ | ✅ | `takerlongshortRatio` |
| Liquidation snapshot | — | ✅ | ✅ | aggregated from public stream |
| Account balance | ✅ | ✅ | ✅ | signed |
| Open orders | ✅ | ✅ | ✅ | signed |
| Position info | — | ✅ | ✅ | `/fapi/v2/positionRisk` |
| Place order | ✅ | ✅ | ✅ | signed |
| Cancel order | ✅ | ✅ | ✅ | signed |
| OCO (one-cancels-other) | ✅ | — | — | spot only via `/orderList/oco` |
| Attached TP/SL at placement | — | partial | partial | use closePosition + reduceOnly pattern |
| Bracket / trailing stop | — | ✅ | ✅ | `TRAILING_STOP_MARKET` |
| Withdraw history | (not exposed by suite) | (not exposed) | (not exposed) | out of scope |
| Withdraw submit | NEVER | NEVER | NEVER | suite refuses keys with withdraw scope |

## Klines Intervals
`1m, 3m, 5m, 15m, 30m, 1h, 2h, 4h, 6h, 8h, 12h, 1d, 3d, 1w, 1M`

## Depth Limits
`5, 10, 20, 50, 100, 500, 1000, 5000` (weight increases with limit)
