# Live Trading Setup Guide

This guide walks you through the three operational modes of the suite and how to safely progress between them.

---

## Mode 1 — `analysis_only` (Default)

**No API keys required. No real data consumed. Zero financial risk.**

The default mode for every new installation. The agent reads your prompts and produces analysis, plans, and order specs — but never connects to any exchange.

Set in `.env`:
```
DEFAULT_MODE=analysis_only
DRY_RUN=true
```

**Skills active in this mode:**
- All 21 skills operate normally for analysis and planning.
- `exchange-trading-executor` produces dry-run output only.
- `exchange-paper-trading` simulates fills using market prices from prompts.

**Exit criteria before moving to `paper_trading`:**
- [ ] You have read `docs/risk-management-guide.md` fully.
- [ ] You have run at least 10 `exchange-order-planner` sessions.
- [ ] You understand the output format of `crypto-risk-manager`.

---

## Mode 2 — `paper_trading`

**Read-only API keys required. Simulated fills. No real orders sent.**

Connect your exchange accounts with **read-only** keys. The suite fetches live prices, validates order specs against real market conditions, and records simulated fills in `data/paper-trades.json`.

Set in `.env`:
```
DEFAULT_MODE=paper_trading
DRY_RUN=true
BINANCE_API_KEY=your_read_only_key
BINANCE_API_SECRET=your_read_only_secret
OKX_API_KEY=your_read_only_key
OKX_API_SECRET=your_read_only_secret
OKX_API_PASSPHRASE=your_passphrase
```

**Verify connectivity:**
```bash
npm run check:binance
npm run check:okx
npm run market:test
npm run account:read
```

**Skills active in this mode:**
- All analysis and planning skills use live market data.
- `exchange-trading-executor` uses `src/services/risk-gate-service.ts` to validate specs but does not submit.
- `exchange-paper-trading` records to `~/.crypto-skills/paper-trades.jsonl`.

**Exit criteria before moving to `execution_ready`:**
- [ ] Minimum 30 paper trades completed over at least 2 weeks.
- [ ] Win rate and R:R ratio reviewed via `crypto-report-generator`.
- [ ] `tests/live-readiness-checklist.md` completed and all items pass.
- [ ] Kill-switch path configured and tested (`KILL_SWITCH_PATH`).
- [ ] Maximum trade size limits set (`MAX_TRADE_USDT`, `MAX_DAILY_LOSS_USDT`).

---

## Mode 3 — `execution_ready`

**Trade-scope API keys required. Real orders sent. Real money at risk.**

> ⚠ **WARNING:** Orders submitted in this mode move real funds. A misconfigured API key, an incorrect order spec, or a network failure can result in financial loss. Do not proceed until every item in `tests/live-readiness-checklist.md` is checked.

Set in `.env`:
```
DEFAULT_MODE=execution_ready
DRY_RUN=false
MAX_TRADE_USDT=500
MAX_DAILY_LOSS_USDT=150
BINANCE_API_KEY=your_trade_scope_key
BINANCE_API_SECRET=your_trade_scope_secret
```

**API key permissions required:**
- ✅ Spot / Futures trading: **ENABLED**
- ✅ Read account info: **ENABLED**
- ❌ Withdrawals: **MUST BE DISABLED**
- ❌ Internal transfers: **MUST BE DISABLED**

**Order flow in `execution_ready` mode:**

```
exchange-order-planner
       ↓
  src/services/risk-gate-service.ts  ← enforces MAX_TRADE_USDT, leverage cap, R:R
       ↓ (all gates pass)
  exchange-trading-executor
       ↓
  src/services/order-service.ts      ← submits to Binance / OKX API
       ↓
  ~/.crypto-skills/executor-ledger.jsonl
```

**Kill-switch (emergency stop):**
```bash
touch ~/.crypto-skills/KILLSWITCH   # all future submissions blocked immediately
rm ~/.crypto-skills/KILLSWITCH      # re-enable after investigation
```

---

## Quick Reference

| Mode | API Keys | Live Data | Live Orders | Ledger |
|------|----------|-----------|-------------|--------|
| `analysis_only` | None | No | No | No |
| `paper_trading` | Read-only | Yes | No | Paper |
| `execution_ready` | Trade-scope | Yes | Yes | Live |
