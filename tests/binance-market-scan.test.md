# Test — binance-market-scan

## Goal
Verify the skill returns valid market data for a known pair on Binance.

## Command
```
/binance-market-scan BTC/USDT
```

## Expected sub-skills called
None. This is a leaf data skill.

## Inputs
- `pair=BTC/USDT`
- `market_type=spot` (default)

## Expected output shape
Conforms to `schemas/market-scan.schema.json`:
- `pair="BTC/USDT"`
- `exchange="binance"`
- `market_type="spot"`
- `price` (number > 0)
- `price_change_pct_24h` (number)
- `volume_24h_quote` (number > 0 for BTC/USDT)
- `spread_bps` (number ≥ 0, expected ≤ 5 bps for BTC/USDT)
- `range_24h.{low,high}` both > 0
- `timestamp` ISO-8601

## Success criterion
- Output validates against `market-scan.schema.json`.
- `price` within ±10% of `binance` last price visible on any public ticker.
- `spread_bps ≤ 10` for BTC/USDT.

## Failure modes
- HTTP error → skill should report and not invent values.
- Pair not listed → skill should suggest using `exchange-pair-finder`.
