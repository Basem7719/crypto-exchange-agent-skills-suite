# Example — Short-Form Pair Report

For when the full 10-section report is overkill.

## Command
```
/crypto-exchange-master "quick report on ETH/USDT on OKX, 4H"
```

## Output

```
=== ETH-USDT — OKX Spot — 4H — quick report ===

SNAPSHOT
  3,182  -0.6% 24h  | vol 1.1 B USDT | spread 1.2 bps

TECHNICAL (4H)
  trend sideways (EMA20 ≈ EMA50, both below EMA200)
  RSI 48, MACD flat
  S 3,150 / R 3,220

LIQUIDITY
  Good for size < 50k USDT (slippage < 1 bps)

VERDICT
  WAIT. Range-bound. No setup. Re-evaluate on 4H close above 3,220 or below 3,150.
```

## Notes
Short reports are the master skill's fallback when timeframe/timeframe-context suggests no need for a full dossier.
