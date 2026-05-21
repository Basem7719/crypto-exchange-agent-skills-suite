# Supported Exchanges

## Coverage Matrix

| Feature | Binance | OKX | Bybit (planned) | HTX (planned) |
|--------|:-------:|:---:|:--------------:|:------------:|
| Spot public data | ✅ | ✅ | stub | stub |
| Spot account | ✅ (read-only enforced) | ✅ (read-only enforced) | — | — |
| USDM / USDT-margined perp | ✅ | ✅ (swap) | — | — |
| COIN-M / inverse perp | ✅ | — | — | — |
| Dated futures | ✅ (delivery) | ✅ | — | — |
| Options (metadata) | — | ✅ (read-only) | — | — |
| WebSocket | spec only (REST is primary) | spec only | — | — |
| Funding rate | ✅ | ✅ | — | — |
| Open interest | ✅ | ✅ | — | — |
| Long/Short ratio | ✅ (account + position + top-trader) | ✅ (LSR via Rubik) | — | — |
| Liquidations feed | ✅ | ✅ | — | — |

## Why Binance?

- Largest spot volume across most pairs.
- Deepest USDM perp liquidity.
- Strong, stable, well-documented REST API.
- Generous request weight limits.
- Rich futures data (top-trader L/S, taker buy/sell, OI history).

## Why OKX?

- Strong derivatives book, growing market share.
- v5 API is **unified** across spot/swap/futures/options — fewer endpoints to learn.
- Popular in MENA (matches this suite's audience).
- Rubik analytics endpoint is unique (LSR by account vs by volume).

## Symbol Format Differences

| Concept | Binance | OKX |
|--------|---------|-----|
| Spot | `BTCUSDT` (no separator) | `BTC-USDT` (dash) |
| Perp / Swap | `BTCUSDT` (USDM context) | `BTC-USDT-SWAP` |
| Inverse perp | `BTCUSD_PERP` (COIN-M) | n/a |
| Dated futures | `BTCUSDT_240927` | `BTC-USDT-251226` |
| Options | n/a | `BTC-USD-251226-100000-C` |

`crypto-exchange-master` normalizes user input (`BTC/USDT`, `BTC-USDT`, `BTCUSDT`) to the exchange-specific format before dispatching.

## Tick / Lot / MinNotional

| Exchange | Source endpoint |
|---------|-----------------|
| Binance spot | `GET /api/v3/exchangeInfo` → `filters[]` |
| Binance USDM | `GET /fapi/v1/exchangeInfo` |
| Binance COINM | `GET /dapi/v1/exchangeInfo` |
| OKX (all) | `GET /api/v5/public/instruments?instType=SPOT/SWAP/FUTURES/OPTION` |

These are pulled fresh by `exchange-order-planner` and `exchange-trading-executor` (gate #5).

## Adding a New Exchange

See [docs/skill-development-guide.md](skill-development-guide.md) and the adapter spec template at [adapters/binance/adapter-spec.md](../adapters/binance/adapter-spec.md). High level:

1. Create `adapters/<name>/` mirroring `adapters/binance/`.
2. Create `<name>-market-scan/` skill mirroring `binance-market-scan/`.
3. Update `crypto-exchange-master`'s routing table.
4. Run `node scripts/validate-skills.js` to confirm.
