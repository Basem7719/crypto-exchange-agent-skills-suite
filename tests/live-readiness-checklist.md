# Live Readiness Checklist

Complete every item below before switching from `paper_trading` to `execution_ready`.

---

## 1. Environment & Configuration

- [ ] `.env` copied from `.env.example` and all values filled in
- [ ] `DEFAULT_MODE=execution_ready` set intentionally
- [ ] `DRY_RUN=false` set intentionally (understand the implication)
- [ ] `MAX_TRADE_USDT` set to a value you can afford to lose entirely
- [ ] `MAX_DAILY_LOSS_USDT` set to a daily loss you can tolerate
- [ ] `KILL_SWITCH_PATH` configured and the directory exists
- [ ] `CRYPTO_SKILLS_HOME` directory exists and is writable

---

## 2. API Key Security

- [ ] Binance key created with **Spot Trading** enabled, **No Withdrawals**
- [ ] OKX key created with **Trade** permission, **No Withdrawals**
- [ ] IP whitelist configured on both exchanges (strongly recommended)
- [ ] API keys stored in `.env` file only — never committed to git
- [ ] `.gitignore` verified to exclude `.env`
- [ ] `exchange-account-review` skill run and confirmed: no withdraw scope

---

## 3. Connectivity Tests

Run each command and confirm output:

- [ ] `npm run check:binance` → `✅ Binance reachable`
- [ ] `npm run check:okx` → `✅ OKX reachable`
- [ ] `npm run market:test` → prices displayed for BTC on both exchanges
- [ ] `npm run account:read binance` → balances shown correctly
- [ ] `npm run account:read okx` → balances shown correctly

---

## 4. Risk Gate Validation

- [ ] `npm run order:dry-run` → risk gate output reviewed
- [ ] Risk gate correctly rejects orders above `MAX_TRADE_USDT`
- [ ] Risk gate correctly rejects leverage above 20x
- [ ] Risk gate correctly rejects stale order specs (> 5 minutes old)

---

## 5. Paper Trading Review

- [ ] Minimum 30 paper trades completed
- [ ] Paper trading period spans at least 2 calendar weeks
- [ ] `crypto-report-generator` run on paper trade history
- [ ] Win rate reviewed and considered acceptable
- [ ] Average R:R ratio is ≥ 1.5
- [ ] Largest single paper loss is within your `MAX_DAILY_LOSS_USDT` limit

---

## 6. Kill-Switch Test

- [ ] Create kill-switch file: `touch ~/.crypto-skills/KILLSWITCH`
- [ ] Attempt `order:dry-run` — confirm it is blocked
- [ ] Remove kill-switch file: `rm ~/.crypto-skills/KILLSWITCH`
- [ ] Confirm orders unblocked after removal

---

## 7. Skills Validation

- [ ] `npm run validate` → `PASS: 21   FAIL: 0`
- [ ] `npm run generate:index` → `skills.json` regenerated successfully
- [ ] `exchange-trading-executor` SKILL.md reviewed and understood
- [ ] `docs/live-trading-setup.md` read in full

---

## 8. Acknowledgement

By completing this checklist, you confirm that:

- You understand crypto trading involves substantial risk of loss.
- Nothing in this suite constitutes financial advice.
- You are solely responsible for every order submitted using this software.
- You have tested the paper trading flow and are satisfied with the results.

**Signed:** _________________________ **Date:** _________________________

---

_Minimum recommended time from `analysis_only` to `execution_ready`: 4 weeks._
