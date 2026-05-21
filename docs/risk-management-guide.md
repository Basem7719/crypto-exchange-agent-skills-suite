# Risk Management Guide

The risk model used by the suite. Implemented in `crypto-risk-manager` and enforced in `exchange-trading-executor` (gate #8).

## Core Idea

Risk is measured **per trade in % of equity** and per **day in % of equity**. Position size is derived from the user's stop distance and risk budget — never picked first.

## Inputs

- `capital` — total equity at trade time
- `risk_pct` — % of equity at risk on this trade (default 1.0)
- `entry` — planned entry price
- `stop` — invalidation level
- `leverage` (perp only)
- `daily_loss_cap_pct` — % of equity, daily ceiling (default 3.0)

## Math

```
risk_budget = capital * risk_pct / 100
r_per_unit  = |entry - stop|
position_size_in_coin = risk_budget / r_per_unit
notional = position_size_in_coin * entry
```

Fees check:
```
fees_round_trip = notional * (taker_bps_in + taker_bps_out) / 10000
fee_share = fees_round_trip / risk_budget
NO-GO if fee_share > 0.25
```

Liquidation check (perp):
```
liq_price = entry * (1 - 1/leverage + maintenance_margin_ratio)  # long, simplified
NO-GO if (entry - liq_price) <= (entry - stop)
```

R:R check:
```
R = |tp1 - entry| / r_per_unit
NO-GO if R < 1.5
```

## Risk Profiles

Defined in `configs/risk-profiles.json`. Six presets:

| Profile | risk_pct | leverage cap | daily cap | TP1 R floor |
|---------|---------:|-------------:|---------:|-----------:|
| conservative | 0.5 | 3 | 1.5 | 2.0 |
| balanced | 1.0 | 10 | 3.0 | 1.5 |
| aggressive | 2.0 | 20 | 5.0 | 1.2 |
| scalping | 0.5 | 10 | 2.0 | 1.0 |
| futures-low-leverage | 1.0 | 5 | 3.0 | 1.5 |
| futures-high-risk | 1.5 | 25 | 4.0 | 1.5 |

## GO / NO-GO Rules

`crypto-risk-manager` returns NO-GO if **any** of these is true:

1. `risk_pct > profile.risk_pct_max`
2. `leverage > profile.leverage_cap`
3. `stop` distance < 0.5 × ATR(14) (too tight)
4. `stop` distance > 5 × ATR(14) (too wide)
5. Liquidation price closer than stop (perp)
6. Daily loss cap already breached
7. Fees > 25% of risk budget
8. R:R to TP1 < `profile.tp1_R_floor`
9. Notional > 80% of available cash (spot) or 80% of free margin (perp)
10. Pair on blacklist

The executor will not submit if `crypto-risk-manager` returns NO-GO (gate #8).

## Daily Loss Cap

The suite tracks realized + open mark-to-market losses for the trading day (UTC). Once the cap is breached, all new entries are blocked until the next UTC day.

Tracking happens in `~/.crypto-skills/daily-pnl.jsonl`.

## Per-Pair Caps

Optional in `configs/risk-profiles.json`:

```json
{
  "balanced": {
    "per_pair_caps": {
      "BTC/USDT": 5.0,
      "DEFAULT": 2.0
    }
  }
}
```

## Position Sizing Examples

### Spot, 5,000 USDT, 1% risk
```
entry = 64,000   stop = 63,000   r = 1,000
risk_budget = 50 USDT
position_size = 50 / 1000 = 0.05 BTC
notional = 0.05 * 64,000 = 3,200 USDT (64% of cash) ✓
```

### Perp 5x, 1,000 USDT, 1% risk
```
entry = 3,200   stop = 3,150   r = 50
risk_budget = 10 USDT
position_size = 10 / 50 = 0.2 ETH
notional = 0.2 * 3,200 = 640 USDT
margin used = 640 / 5 = 128 USDT (12.8% of equity) ✓
liq_price ≈ 3,200 * (1 - 1/5 + 0.005) = 2,576
stop is at 3,150 → distance = 50; liq at 2,576 → distance = 624 ✓
```

## What Risk Management Won't Do

- Stop you from losing money. The model controls **per-trade and per-day exposure**, not market direction.
- Compensate for poor strategy edge. A bad strategy with tight stops still loses.
- Account for correlation across pairs (planned in v1.2 `crypto-portfolio-optimizer`).
