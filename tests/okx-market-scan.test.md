# Test — okx-market-scan

## Goal
Verify the skill returns valid market data for a known pair on OKX.

## Command
```
/okx-market-scan BTC-USDT
```

## Inputs
- `pair=BTC-USDT`
- `market_type=spot` (default)

## Expected output shape
Conforms to `schemas/market-scan.schema.json`:
- `exchange="okx"`
- `market_type="spot"`
- `price`, `volume_24h_quote`, `spread_bps`, `range_24h` all populated

## Success criterion
- Output validates against schema.
- For BTC-USDT-SWAP variant, output also includes funding fields when `market_type=swap`.

## Variant tests
```
/okx-market-scan BTC-USDT-SWAP
/okx-market-scan ETH-USDT timeframe=4h
```

## Notes
OKX uses uppercase `bar` values (`1H`, `4H`). The skill normalizes user input automatically.
