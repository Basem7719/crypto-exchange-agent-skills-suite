# Binance Adapter Spec

Contract this adapter implements for the suite.

## Identity
- **Exchange ID:** `binance`
- **Variants:** `spot`, `usdm`, `coinm`

## Required Public Capabilities
- Ping / system status
- Exchange info (symbol filters: tickSize, stepSize, minNotional, minQty)
- 24h ticker per symbol
- Klines (multiple intervals)
- Order book (depth ≥ 100 levels)
- Funding rate, OI, L/S ratio (perp only)
- Taker buy/sell volume (perp)
- Liquidation feed (perp; via WebSocket in production, REST summary endpoints for snapshots)

## Required Signed Capabilities
- Account info (balances, scope check)
- Open orders (read)
- New order (spot LIMIT, MARKET, STOP_LOSS_LIMIT, LIMIT_MAKER, OCO)
- New order (USDM LIMIT, MARKET, STOP_MARKET, TAKE_PROFIT_MARKET, TRAILING_STOP_MARKET)
- Cancel order, cancel all
- Position info (futures)
- Adjust leverage (futures)

## Symbol Normalization
- User input → adapter format:
  - `BTC/USDT` → spot: `BTCUSDT`, perp USDM: `BTCUSDT`
  - `BTC-USD` → COIN-M: `BTCUSD_PERP` or `BTCUSD_240927`
- Adapter rejects unknown symbols with a clear hint.

## Auth
- `X-MBX-APIKEY: <key>` header on signed endpoints
- `signature` query param = HMAC-SHA256(query string, secret), hex-encoded
- `timestamp` (millis since epoch) + `recvWindow` (default 5000ms) required

## Scope Detection
- `GET /sapi/v1/account/apiRestrictions` returns:
  - `enableReading`
  - `enableSpotAndMarginTrading`
  - `enableFutures`
  - `enableWithdrawals` ← MUST be false for this suite
- Adapter exposes this so `exchange-account-review` can refuse on `enableWithdrawals=true`.

## Rate Limits
- Spot: 1200 weight / minute (X-MBX-USED-WEIGHT-1M header)
- Spot orders: 50 / 10s, 160,000 / 24h
- USDM: 2400 weight / minute
- Adapter exposes current weight usage so `exchange-trading-executor` gate #10 can check.

## Errors

| Code | Action |
|------|--------|
| -1021 | re-sync clock, retry once |
| -1022 | regenerate signature, no retry |
| -1003 | rate-limit; back off |
| -2010 | report insufficient balance; do not auto-retry |
| -1013 | re-pull `exchangeInfo` and re-validate filters |
| 5xx HTTP | retry with backoff for public reads; do NOT retry signed writes |

## Idempotency
- `clientOrderId` is the idempotency key. Adapter generates a UUID-derived ID per submission and stores it before sending.
- Re-submitting with the same ID returns the original order without creating a duplicate.

## What This Adapter Does NOT Cover
- BLVT (leveraged tokens)
- Margin lending
- Earn / staking
- Sub-account management beyond scope check
