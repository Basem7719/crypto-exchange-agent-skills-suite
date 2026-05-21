# Workflow — Account Review

> Read-only review of balances, positions, open orders, recent PnL.

## Pre-conditions
- Mode: `planning` or higher.
- API key configured (read-only, no withdraw).

## Trigger phrases
- "review my Binance account"
- "what's my exposure on OKX"
- "راجع حسابي"

## Skill chain
```
1. exchange-account-review exchange=binance market=spot
   → checks scope: must be read+(optional trade), MUST NOT have withdraw
   → fetches: balances, open orders, recent fills, PnL 7d
2. (if applicable) exchange-account-review exchange=binance market=usdm
3. (if applicable) exchange-account-review exchange=okx market=spot
4. (if applicable) exchange-account-review exchange=okx market=swap
5. Synthesize:
   → total equity in USDT
   → exposure by pair (long/short, % of equity)
   → open orders count and notional
   → PnL 7d
   → flag stale orders > 14d
```

## Critical gate
If any account's API key has `withdraw=true`, the skill REFUSES and asks the user to rotate the key. No fallback. No exceptions.

## Output
A single dashboard view across all connected accounts.

## Reference
None yet — see `skills/exchange-account-review/SKILL.md` for the per-skill spec.
