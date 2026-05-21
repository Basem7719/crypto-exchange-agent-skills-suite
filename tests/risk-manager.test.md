# Test — crypto-risk-manager

## Goal
Verify the risk math and GO/NO-GO gates.

## Test cases

### Case 1 — valid spot trade
```
/crypto-risk-manager pair=BTC/USDT exchange=binance market=spot capital=5000 risk_pct=1 entry=64000 stop=63000 tp1=66000
```
Expected:
- `position_size ≈ 0.05` BTC
- `notional ≈ 3200` USDT (64% of cash → OK)
- `go_no_go = GO`
- `R_per_unit = 1000`

### Case 2 — stop too tight
```
/crypto-risk-manager pair=BTC/USDT exchange=binance capital=5000 risk_pct=1 entry=64000 stop=63990 tp1=64200
```
Expected:
- `go_no_go = NO-GO`
- `no_go_reasons` includes "stop too tight (< 0.5 ATR)"

### Case 3 — fees > 25% of risk
```
/crypto-risk-manager pair=SHIB/USDT exchange=binance capital=200 risk_pct=0.5 entry=0.00001 stop=0.00000999 tp1=0.0000102
```
Expected:
- `go_no_go = NO-GO`
- `no_go_reasons` includes "fees > 25% of risk budget"

### Case 4 — perp with liquidation closer than stop
```
/crypto-risk-manager pair=BTC/USDT exchange=binance market=usdm capital=1000 risk_pct=1 leverage=50 entry=64000 stop=62000
```
Expected:
- `go_no_go = NO-GO`
- `no_go_reasons` includes "liquidation price closer than stop"

### Case 5 — leverage cap
```
/crypto-risk-manager pair=BTC/USDT exchange=binance market=usdm capital=1000 risk_pct=1 leverage=50 profile=balanced
```
Expected:
- NO-GO with reason `leverage > profile cap (10)`.

## Success criterion
All four GO/NO-GO cases produce the expected verdict and reason.
