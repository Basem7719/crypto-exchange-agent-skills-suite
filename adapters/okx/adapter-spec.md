# OKX Adapter Spec

## Identity
- **Exchange ID:** `okx`
- **Variants:** `spot`, `swap`, `futures`, `option` (read-only metadata for options)

## Required Public Capabilities
- System status, instruments (full filter set: tickSz, lotSz, minSz, ctVal for derivatives)
- Ticker, candles, history candles
- Order book (multi-level)
- Funding rate (current + history) for SWAP and FUTURES
- Open interest
- Rubik analytics: LSR by account, LSR by volume, OI by coin

## Required Signed Capabilities
- Account balance and positions
- API key scope info
- Place order (with `attachAlgoOrds` for inline TP/SL)
- Cancel order, batch cancel
- Position close
- Set leverage, set margin mode

## Symbol Normalization
- `BTC/USDT` → spot: `BTC-USDT`, swap: `BTC-USDT-SWAP`
- Adapter rejects unknown `instId` with hint to use `exchange-pair-finder`.

## Auth
Headers:
- `OK-ACCESS-KEY`
- `OK-ACCESS-SIGN` = base64(HMAC-SHA256(prehash, secret))
- `OK-ACCESS-TIMESTAMP` (ISO-8601 with millis, e.g. `2026-05-21T09:00:00.123Z`)
- `OK-ACCESS-PASSPHRASE` (set when key was created)

Prehash:
```
timestamp + method + requestPath + body
```

## Scope Detection
- `GET /api/v5/users/subaccount/apikey` returns `perm` field.
- Adapter parses for `read`, `trade`, `withdraw` flags.
- If `withdraw=true`, suite refuses (account-review skill).

## Rate Limits
- 20 req / 2s default per IP
- 60 req / 2s trade endpoints per UID
- 5 req / 2s for Rubik endpoints
- Adapter throttles via token bucket; gate #10 in executor checks remaining tokens.

## Errors

| Code | Action |
|------|--------|
| 50001 | service unavailable; retry with backoff |
| 50011 | rate limit; back off |
| 50111 | invalid passphrase; do not retry |
| 51000 | parameter error (often `bar` casing); fix and retry |
| 51008 | insufficient margin; report; do not retry |

## Idempotency
- `clOrdId` (max 32 chars). Suite generates and stores before send.
- Re-using a `clOrdId` returns the same order, never duplicates.

## Position Mode
Two account-level settings:
- `net_mode` — single position per `instId`; `posSide=net`
- `hedge_mode` — separate `posSide=long` and `posSide=short`

Adapter caches the mode and passes the right `posSide` automatically.

## What This Adapter Does NOT Cover
- Earn / staking
- Crypto loan
- Convert
- Sub-account management (beyond scope check)
