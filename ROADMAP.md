# ROADMAP

Planned additions for **crypto-exchange-agent-skills-suite**. Community PRs welcome.

---

## v1.1 — Adapter Layer Hardening

- [ ] Promote `adapters/bybit/` from placeholder to functional adapter
  - mirror `binance-market-scan` for Bybit V5 API
- [ ] Promote `adapters/htx/` from placeholder to functional adapter
- [ ] Add `bybit-market-scan` and `htx-market-scan` skills
- [ ] Extend `crypto-exchange-master` routing table to include all four exchanges

## v1.2 — Strategy Library

- [ ] `crypto-strategy-library/` — a folder of ~20 pre-specified strategies that can be passed straight into `strategy-backtest-planner`
- [ ] `crypto-portfolio-optimizer` — given a list of pairs and a risk budget, allocate
- [ ] `crypto-correlation-scan` — pairwise correlation across watchlist

## v1.3 — Live Data Quality

- [ ] WebSocket adapter spec for Binance and OKX (currently REST-only descriptions)
- [ ] Stale-data detection in every data skill (latency > 1s → flag)
- [ ] L2 (order book) historical snapshot via reconstruction
- [ ] Per-symbol latency monitoring

## v1.4 — Sentiment & News Depth

- [ ] Replace optional Fear & Greed proxy with a multi-source aggregator
- [ ] News classifier fine-tuned on crypto headlines (currently rule-based)
- [ ] Telegram / Twitter / Discord ingestion adapter spec (read-only, opt-in)
- [ ] Token unlock calendar skill (`token-unlock-watch`)

## v1.5 — Operational Maturity

- [ ] CI workflow (GitHub Actions) running `validate-skills.js` on every push
- [ ] Versioned skill releases per SKILL.md (semantic versioning)
- [ ] Localized docs (English, Arabic, Spanish, Chinese)
- [ ] Conformance test suite that the agent runtime can run on install

## v2.0 — Multi-Account & Multi-Strategy

- [ ] Multi-account scoping (run different strategies on different subaccounts)
- [ ] Strategy-as-Skill (turn a passed backtest into a deployable skill via `crypto-skill-builder`)
- [ ] Cross-exchange arbitrage skill (real, not a stub)
- [ ] Funding rate carry skill

---

## Not Planned (out of scope)

- Web3 wallets and on-chain transactions
- DEX adapters (Uniswap, Curve, Raydium, etc.)
- DeFi lending and staking protocols
- Tax accounting
- Headless / unattended trading bots
- Copy-trading

Want one of these? It's a separate project — fork happily.
