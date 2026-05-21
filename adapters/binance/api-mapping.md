# Binance API Mapping

Endpoint mapping from suite concepts to Binance endpoints.

## Spot (`https://api.binance.com`)

| Suite concept | Endpoint | Auth |
|---------------|----------|------|
| ping | `GET /api/v3/ping` | none |
| exchange info | `GET /api/v3/exchangeInfo` | none |
| 24h ticker | `GET /api/v3/ticker/24hr` | none |
| klines | `GET /api/v3/klines?symbol=&interval=&limit=` | none |
| order book | `GET /api/v3/depth?symbol=&limit=` | none |
| recent trades | `GET /api/v3/trades?symbol=&limit=` | none |
| account | `GET /api/v3/account` | signed |
| api restrictions | `GET /sapi/v1/account/apiRestrictions` | signed |
| new order | `POST /api/v3/order` | signed |
| new OCO | `POST /api/v3/orderList/oco` | signed |
| cancel order | `DELETE /api/v3/order` | signed |
| open orders | `GET /api/v3/openOrders` | signed |

## USDM (`https://fapi.binance.com`)

| Suite concept | Endpoint | Auth |
|---------------|----------|------|
| exchange info | `GET /fapi/v1/exchangeInfo` | none |
| premium / funding | `GET /fapi/v1/premiumIndex`, `GET /fapi/v1/fundingRate` | none |
| klines | `GET /fapi/v1/klines` | none |
| open interest hist | `GET /futures/data/openInterestHist` | none |
| L/S account | `GET /futures/data/globalLongShortAccountRatio` | none |
| top-trader L/S (acct) | `GET /futures/data/topLongShortAccountRatio` | none |
| top-trader L/S (pos) | `GET /futures/data/topLongShortPositionRatio` | none |
| taker vol ratio | `GET /futures/data/takerlongshortRatio` | none |
| position info | `GET /fapi/v2/positionRisk` | signed |
| new order | `POST /fapi/v1/order` | signed |
| change leverage | `POST /fapi/v1/leverage` | signed |
| change margin type | `POST /fapi/v1/marginType` | signed |

## COIN-M (`https://dapi.binance.com`)

Mirror of USDM with the `/dapi/v1/` prefix. Most endpoint names identical.

## Query String Conventions
- Numbers as plain decimal, never scientific notation.
- Boolean as `true`/`false`.
- `recvWindow` ≤ 60000.

## Signing

```python
import hmac, hashlib
sig = hmac.new(secret.encode(), query_string.encode(), hashlib.sha256).hexdigest()
```

`signature` is appended as the last query param.
