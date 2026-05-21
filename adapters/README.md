# Exchange Adapters

This folder defines the **adapter contract** that every exchange integration in this suite follows. Adapters describe the API surface the suite uses; they are documentation/spec, not runtime code.

| Adapter | Status | Skills using it |
|--------|--------|----------------|
| [binance/](binance/) | ✅ active | `binance-market-scan`, `crypto-spot-analysis`, `crypto-futures-analysis`, `exchange-liquidity-depth`, `exchange-account-review`, `exchange-order-planner`, `exchange-trading-executor` |
| [okx/](okx/) | ✅ active | `okx-market-scan`, `crypto-spot-analysis`, `crypto-futures-analysis`, `exchange-liquidity-depth`, `exchange-account-review`, `exchange-order-planner`, `exchange-trading-executor` |
| [bybit/](bybit/) | ⏳ placeholder (v1.1) | none yet |
| [htx/](htx/) | ⏳ placeholder (v1.1) | none yet |

## Adapter Contract

Each adapter folder contains:

- `adapter-spec.md` — the contract: what the adapter must provide
- `supported-data.md` — coverage matrix (spot, perp, futures, options, account)
- `api-mapping.md` — endpoint-by-endpoint mapping from suite concepts to exchange endpoints

## Adding a New Adapter

1. Copy `binance/` as a starting point.
2. Fill in the three docs for your exchange.
3. Create a `<exchange>-market-scan` skill mirroring `binance-market-scan`.
4. Add the exchange to `crypto-exchange-master`'s routing table.
5. Optionally extend `exchange-order-planner` and `exchange-trading-executor` with the new exchange's endpoints.

See [docs/skill-development-guide.md](../docs/skill-development-guide.md).
