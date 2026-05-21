# Test — crypto-futures-analysis

## Goal
Verify futures data (funding, OI, LSR, basis, liquidation map) is fetched and scored.

## Command
```
/crypto-futures-analysis pair=BTC/USDT exchange=binance market=usdm
```

## Expected output shape
- `funding_now`        (number, %)
- `funding_8h_avg_24h` (number)
- `open_interest_usd`  (number > 0)
- `open_interest_delta_24h_pct` (number)
- `ls_account_ratio`   (number)
- `top_ls_account_ratio` (number)
- `taker_buy_sell_ratio` (number)
- `liquidations_24h`   {long, short} both numbers
- `futures_score`      (0-100)
- `regime`             (one of: trending_up, trending_down, neutral, squeeze_risk)

## Sub-tests

### Case A — OKX swap
```
/crypto-futures-analysis pair=ETH/USDT exchange=okx market=swap
```
Should switch endpoints to `/api/v5/public/funding-rate` etc.

### Case B — Pair with no perp market
```
/crypto-futures-analysis pair=BILL/USDT exchange=okx market=swap
```
Should refuse cleanly: "BILL/USDT has no swap market on OKX. Try /exchange-pair-finder."

## Success criterion
- All required fields populated.
- `futures_score` within 0-100.
- Sub-test B exits gracefully with a clear hint.
