# HTX (formerly Huobi) Adapter — Future Notes (v1.1+)

> Placeholder. Not active in v1.0. Planned no earlier than v1.1.

## Why deferred
HTX has a meaningful Asian user base but lower share than Binance/OKX globally. After Bybit (planned v1.1), HTX is a candidate for v1.2.

## Scope plan
- Spot + USDT-perp + COIN-perp
- Read-only by default; trade-scope opt-in mirror of the Binance/OKX patterns
- An `htx-market-scan` skill mirroring `binance-market-scan`

## API specifics worth noting (for the implementer)
- Base: `https://api.huobi.pro` (spot), `https://api.hbdm.com` (futures)
- Symbol format: lowercase `btcusdt` for spot, `BTC-USDT` for derivatives
- Auth: HMAC-SHA256, query-string-based
- Multiple sub-products: spot, USDT-margined linear swap, coin-margined swap, dated futures

## What this folder will look like (post-v1.1)
- `adapter-spec.md`
- `supported-data.md`
- `api-mapping.md`

## Status
Open to community contribution. See [ROADMAP.md](../../ROADMAP.md).
