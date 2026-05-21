# Bybit Adapter — Future Notes (v1.1)

> Placeholder. Not active in v1.0. Planned for v1.1.

## Why deferred
v1.0 focuses on Binance + OKX, the two exchanges covering the largest share of the suite's target users. Bybit is a strong third candidate and the natural next addition.

## Scope plan for v1.1
- Spot + USDT-perp (Bybit V5 unified API)
- Read-only by default; trade-scope opt-in mirror of the Binance/OKX patterns
- A `bybit-market-scan` skill mirroring `binance-market-scan`
- Extend `exchange-pair-finder`, `exchange-liquidity-depth`, `crypto-futures-analysis` to recognize `exchange=bybit`

## API specifics worth noting (for the implementer)
- Base: `https://api.bybit.com`
- v5 unified endpoint: `GET /v5/market/tickers?category=spot|linear|inverse|option&symbol=`
- Auth headers: `X-BAPI-API-KEY`, `X-BAPI-SIGN`, `X-BAPI-TIMESTAMP`, `X-BAPI-RECV-WINDOW`
- Signature: HMAC-SHA256 of `timestamp + apiKey + recvWindow + queryString_or_body`
- Symbol format: `BTCUSDT` (linear) / `BTCUSD` (inverse) — similar to Binance

## What this folder will look like (post-v1.1)
- `adapter-spec.md` (contract)
- `supported-data.md` (coverage matrix)
- `api-mapping.md` (endpoint table)

## How to contribute
Open an issue tagged `bybit-adapter`. PRs welcome that mirror `adapters/binance/`.
