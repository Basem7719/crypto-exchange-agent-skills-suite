# Test — exchange-pair-finder

## Goal
Confirm a coin is correctly identified on each exchange.

## Test cases

### Case 1 — coin on both exchanges
```
/exchange-pair-finder BTC USDT on Binance and OKX
```
Expected:
- Binance: listed as `BTCUSDT`
- OKX: listed as `BTC-USDT`, swap `BTC-USDT-SWAP`

### Case 2 — coin on OKX only
```
/exchange-pair-finder BILL USDT on Binance and OKX
```
Expected:
- Binance: not listed
- OKX: listed as `BILL-USDT`

### Case 3 — coin on neither
```
/exchange-pair-finder FAKECOIN12345 USDT on Binance and OKX
```
Expected:
- Binance: not listed
- OKX: not listed
- Suggestion: spell-check or check Coinbase/Kraken separately.

## Success criterion
- Skill returns one of: `listed` / `not_listed` / `delisted` for each exchange.
- Canonical symbol returned per exchange.
