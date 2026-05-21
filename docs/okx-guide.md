# OKX Guide

What this suite knows about OKX and how it uses the v5 API.

## v5 API Base

`https://www.okx.com/api/v5/`

Unified across spot/swap/futures/options.

## Endpoints by Use Case

### Public market data
| Use | Endpoint |
|-----|---------|
| Instruments (filters) | `GET /api/v5/public/instruments?instType=SPOT` (or `SWAP`, `FUTURES`, `OPTION`) |
| Ticker | `GET /api/v5/market/ticker?instId=BTC-USDT` |
| Candles | `GET /api/v5/market/candles?instId=BTC-USDT&bar=1H` |
| History candles | `GET /api/v5/market/history-candles` |
| Order book | `GET /api/v5/market/books?instId=BTC-USDT&sz=400` |
| Funding rate | `GET /api/v5/public/funding-rate?instId=BTC-USDT-SWAP` |
| Open interest | `GET /api/v5/public/open-interest?instType=SWAP` |
| System status | `GET /api/v5/system/status` |

### Rubik analytics
| Use | Endpoint |
|-----|---------|
| LSR by account | `GET /api/v5/rubik/stat/contracts/long-short-account-ratio` |
| LSR by volume / taker | `GET /api/v5/rubik/stat/taker-volume` |
| OI volume hist | `GET /api/v5/rubik/stat/contracts/open-interest-volume` |

### Account & trade (signed)
| Use | Endpoint |
|-----|---------|
| Balance | `GET /api/v5/account/balance` |
| Positions | `GET /api/v5/account/positions` |
| API key info / scope | `GET /api/v5/users/subaccount/apikey` |
| New order | `POST /api/v5/trade/order` (supports `attachAlgoOrds` for TP/SL) |
| Cancel order | `POST /api/v5/trade/cancel-order` |
| Order info | `GET /api/v5/trade/order` |

## Symbol Convention

| Market | Format | Example |
|--------|--------|---------|
| Spot | `<BASE>-<QUOTE>` | `BTC-USDT` |
| Perp | `<BASE>-<QUOTE>-SWAP` | `BTC-USDT-SWAP` |
| Dated futures | `<BASE>-<QUOTE>-YYMMDD` | `BTC-USDT-251226` |
| Options | `<BASE>-USD-YYMMDD-<STRIKE>-<C|P>` | `BTC-USD-251226-100000-C` |

## Bar values

UPPERCASE: `1m`, `3m`, `5m`, `15m`, `30m`, `1H`, `2H`, `4H`, `6H`, `12H`, `1D`, `1W`, `1M`. Note `1H` (not `1h`).

## Auth

OKX requires **four** headers:

- `OK-ACCESS-KEY` — your API key
- `OK-ACCESS-SIGN` — base64(HMAC-SHA256(prehash, secret))
- `OK-ACCESS-TIMESTAMP` — ISO-8601 with millis
- `OK-ACCESS-PASSPHRASE` — passphrase you set when creating the key

Prehash format: `timestamp + method + requestPath + body`.

## Rate Limits

- 20 requests / 2 seconds for most public endpoints.
- 60 / 2s for trade endpoints (per UID).
- Lower for Rubik (5 / 2s).

## Common Errors

| Code | Meaning | Fix |
|------|--------|-----|
| 50001 | Service unavailable | retry with backoff |
| 50111 | Invalid passphrase | regenerate; check key/passphrase pair |
| 51008 | Insufficient margin | reduce size or add margin |
| 51000 | Parameter error | check `instId` format, especially bar value casing |

## Modes

OKX has two account modes:

- **Net mode** — single position per `instId`. `posSide=net`.
- **Hedge mode** — separate long and short positions. `posSide=long` or `short`.

`exchange-trading-executor` checks the mode before submit and passes the right `posSide`.

## Attached TP/SL

OKX uniquely supports `attachAlgoOrds` on `POST /api/v5/trade/order` — attach take-profit and stop-loss at order placement. Saves a separate algo-order call.

## Skills That Use OKX

`okx-market-scan`, `exchange-pair-finder`, `crypto-spot-analysis`, `crypto-futures-analysis`, `exchange-liquidity-depth`, `crypto-sentiment-scan`, `exchange-account-review`, `exchange-order-planner`, `exchange-trading-executor`, `crypto-report-generator`.
