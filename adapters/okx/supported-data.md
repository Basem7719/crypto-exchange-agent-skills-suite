# OKX Supported Data

| Concept | SPOT | SWAP | FUTURES | OPTION | Notes |
|--------|:----:|:----:|:------:|:------:|------|
| Last price | ✅ | ✅ | ✅ | ✅ | `/market/ticker?instId=` |
| Candles (history) | ✅ | ✅ | ✅ | ✅ | `bar=1H, 4H, 1D, ...` |
| Order book | ✅ | ✅ | ✅ | ✅ | depth up to 400 levels |
| Funding rate | — | ✅ | ✅ | — | `/public/funding-rate` |
| Open interest | — | ✅ | ✅ | ✅ | `/public/open-interest` |
| LSR (Rubik) | — | ✅ | ✅ | — | account + volume |
| Account balance | ✅ | ✅ | ✅ | ✅ | unified `/account/balance` |
| Positions | — | ✅ | ✅ | ✅ | `/account/positions` |
| Place order | ✅ | ✅ | ✅ | ✅ | `/trade/order` |
| Attached TP/SL | ✅ | ✅ | ✅ | ✅ | `attachAlgoOrds` array |
| Conditional / algo | ✅ | ✅ | ✅ | ✅ | `/trade/order-algo` |
| Withdraw | NEVER | NEVER | NEVER | NEVER | suite refuses keys with withdraw scope |

## Bar values

UPPERCASE for hourly+: `1m, 3m, 5m, 15m, 30m, 1H, 2H, 4H, 6H, 12H, 1D, 1W, 1M`.

## Position-mode-aware fields

- Net mode: `posSide=net`
- Hedge mode: `posSide=long` or `posSide=short`
- `tdMode`: `cross` or `isolated` (margin mode)

These get validated by the adapter and passed correctly per account setting.
