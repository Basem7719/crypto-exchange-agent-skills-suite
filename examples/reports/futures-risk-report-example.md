# Example — Futures Risk Report on BTC/USDT (Binance USDM)

Focused on risk + sizing, not setup quality.

## Command
```
/crypto-risk-manager pair=BTC/USDT exchange=binance market=usdm capital=2000 risk_pct=1 leverage=10 entry=64200 stop=63800 tp1=65500 profile=futures-low-leverage
```

## Output

```
=== Risk Report — BTC/USDT Binance USDM ===

PROFILE
  futures-low-leverage   (leverage_cap=5, daily_loss_cap=3%)

USER REQUEST
  leverage=10x          ⚠ exceeds profile cap (5x)
  risk_pct=1.0%         ✓ within profile (1.0% max)
  entry=64,200  stop=63,800  TP1=65,500  capital=2,000

GATE RESULTS
  G1: scope = trade-only (no withdraw)        ✓
  G2: pair listed on Binance USDM             ✓
  G3: stop distance / ATR ratio = 1.0         ✓
  G4: liquidation distance > stop distance    ✓ (liq ≈ 57,800 at 10x)
  G5: fees share = 8% of risk                 ✓
  G6: R:R to TP1 = 3.25                       ✓
  G7: notional 6,420 USDT (321% of equity)    ✓ (margin only 642)
  G8: leverage 10 > profile cap 5             ✗ NO-GO
  G9: daily cap not breached                  ✓

VERDICT: NO-GO
  - leverage exceeds futures-low-leverage profile cap (5)
  - fix: lower leverage to 5, or switch to futures-high-risk profile with
         allow_high_leverage=true

WITH LEVERAGE=5
  position size .... 0.05 BTC
  notional ......... 3,210 USDT
  margin ........... 642 USDT (32% of equity)
  liq @5x .......... ~53,500   (distance 10,700 USDT) ✓
  R:R to TP1 ....... 3.25 ✓
  → would be GO

ACTION: re-run with --leverage 5
```

## Notes
The risk-manager separates the math from the user's wishes. The user can override the profile only with an explicit flag.
