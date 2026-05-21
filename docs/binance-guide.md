# Binance Guide

What this suite knows about Binance and how it uses Binance APIs.

## Endpoints by Use Case

### Spot (`https://api.binance.com`)
| Use | Endpoint |
|-----|---------|
| Exchange info (filters) | `GET /api/v3/exchangeInfo` |
| 24h ticker | `GET /api/v3/ticker/24hr` |
| Klines | `GET /api/v3/klines?symbol=BTCUSDT&interval=1h` |
| Order book | `GET /api/v3/depth?symbol=BTCUSDT&limit=100` |
| Account (signed) | `GET /api/v3/account` |
| New order (signed) | `POST /api/v3/order` |
| OCO (signed) | `POST /api/v3/orderList/oco` |
| API restrictions (scope check) | `GET /sapi/v1/account/apiRestrictions` |

### USDM Perp (`https://fapi.binance.com`)
| Use | Endpoint |
|-----|---------|
| Exchange info | `GET /fapi/v1/exchangeInfo` |
| Klines | `GET /fapi/v1/klines` |
| Premium / funding | `GET /fapi/v1/premiumIndex`, `GET /fapi/v1/fundingRate` |
| Open interest hist | `GET /futures/data/openInterestHist` |
| Long/Short ratios | `GET /futures/data/globalLongShortAccountRatio`, `topLongShortAccountRatio`, `topLongShortPositionRatio` |
| Taker buy/sell vol | `GET /futures/data/takerlongshortRatio` |
| New order | `POST /fapi/v1/order` |
| Position info | `GET /fapi/v2/positionRisk` |

### COIN-M Perp (`https://dapi.binance.com`) — same endpoint patterns as USDM with `/dapi/` prefix.

## Symbol Convention

`BTCUSDT`, `ETHUSDT`, `BTCUSD_PERP` (COIN-M), `BTCUSDT_240927` (delivery futures).

## Auth

- Signed endpoints need `X-MBX-APIKEY` header + `signature` query param (HMAC-SHA256 of the query string with the secret).
- `timestamp` and `recvWindow` (default 5000ms) are required.
- Clock drift > recvWindow → `-1021`. Sync NTP.

## Rate Limits

- Spot: 1200 weight / minute / IP, 50 orders / 10s.
- USDM: 2400 weight / minute / IP.
- The data skills batch requests; the executor checks weight before submit (gate #10).

## Common Errors

| Code | Meaning | Fix |
|------|--------|-----|
| -1021 | Clock skew | NTP sync |
| -1022 | Invalid signature | regenerate; ensure UTF-8 encoding |
| -2010 | Insufficient balance | reduce qty |
| -2011 | Unknown order | check `clientOrderId` |
| -1013 | Filter failure | re-pull `exchangeInfo`, re-validate tick/lot/min-notional |

## Notes

- Binance distinguishes `LIMIT_MAKER` (post-only) — used by `exchange-order-planner` when `time_in_force=PO`.
- Spot OCO is `orderListId` — track separately from `orderId`.
- `closePosition=true` on a futures stop-market closes the entire side regardless of remaining size.

## Skills That Use Binance

`binance-market-scan`, `exchange-pair-finder`, `crypto-spot-analysis`, `crypto-futures-analysis`, `exchange-liquidity-depth`, `crypto-sentiment-scan`, `exchange-account-review`, `exchange-order-planner`, `exchange-trading-executor`, `crypto-report-generator`.
