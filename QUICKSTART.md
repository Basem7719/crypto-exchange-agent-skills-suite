# QUICKSTART — Run in 5 Minutes

Get the **crypto-exchange-agent-skills-suite** running with one of Claude Code, OpenClaw, Cursor, or Hermes.

---

## 1. Install (pick one)

### Claude Code
```bash
git clone <this-repo>   # or unzip the bundle
cd crypto-exchange-agent-skills-suite
bash scripts/install-claude.sh
```

This copies `skills/*` into `~/.claude/skills/`.

### OpenClaw
```bash
bash scripts/install-openclaw.sh
```

Copies `skills/*` into `~/.openclaw/skills/`.

### Cursor (project-local)
```bash
mkdir -p .cursor/skills && cp -r skills/* .cursor/skills/
```

### Hermes
```bash
mkdir -p ~/.hermes/skills && cp -r skills/* ~/.hermes/skills/
```

---

## 2. Verify

```bash
ls ~/.claude/skills | wc -l
# Expected: at least 21
```

---

## 3. First 5 Commands to Try

These commands only use **public market data** — no API keys needed.

```
# 1. Is BILL listed on Binance and OKX?
/exchange-pair-finder BILL USDT on Binance and OKX

# 2. Quick snapshot of BTC/USDT on Binance
/binance-market-scan BTC/USDT

# 3. Same on OKX
/okx-market-scan BTC-USDT

# 4. Pure technical view on the 1h timeframe
/crypto-technical-analysis pair=BTC/USDT exchange=binance timeframe=1h

# 5. Full research report
/crypto-report-generator pair=BTC/USDT exchange=binance market=spot timeframe=1h capital=5000
```

Each command prints a focused, structured output (60 seconds to read).

---

## 4. Add API Keys (optional, for account features)

Copy `.env.example` to `.env` and fill in **read-only** keys. Never enable withdraw permission.

```bash
cp .env.example .env
# edit .env with your keys
```

Then try:

```
/exchange-account-review exchange=binance market=spot
```

`exchange-account-review` will **refuse to run** if your key has withdraw permission. That's intentional.

---

## 5. Paper Trade (optional)

```
/exchange-paper-trading start pair=BTC/USDT exchange=binance capital=10000
/crypto-entry-exit-planner pair=BTC/USDT exchange=binance timeframe=1h
/exchange-paper-trading apply_plan last
/exchange-paper-trading status
```

The ledger lives at `~/.crypto-skills/paper-ledger.jsonl`.

---

## 6. Live Trading (advanced, opt-in)

Live trading is **off by default** and requires multiple safety gates. See [exchange-trading-executor/SKILL.md](skills/exchange-trading-executor/SKILL.md) before going anywhere near `dry_run=false`.

Order of operations:

```
1. /exchange-account-review (must show withdraw=false)
2. /crypto-entry-exit-planner (build the plan)
3. /exchange-order-planner (build the order spec)
4. /exchange-trading-executor spec=... dry_run=true   # sanity check
5. /exchange-trading-executor spec=... dry_run=false confirm=CONFIRM
```

If anything is unclear, stop and read the executor's full SKILL.md.

---

## Where to Go Next

- [USAGE.md](USAGE.md) — full usage guide
- [docs/agent-workflows.md](docs/agent-workflows.md) — common multi-skill flows
- [docs/troubleshooting.md](docs/troubleshooting.md) — fixes for common errors
