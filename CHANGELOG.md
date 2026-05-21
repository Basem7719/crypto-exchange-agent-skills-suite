# CHANGELOG

All notable changes to **crypto-exchange-agent-skills-suite** are documented here.
Format based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).
This project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.0.0] — 2026-05-20

### Added — Initial release

- **21 skills** spanning routing, data, analysis, planning, execution, monitoring, simulation, strategy, reporting, and meta.
- **Routing:** `crypto-exchange-master`
- **Data:** `binance-market-scan`, `okx-market-scan`, `exchange-pair-finder`, `exchange-liquidity-depth`, `exchange-account-review`
- **Analysis:** `crypto-technical-analysis`, `crypto-spot-analysis`, `crypto-futures-analysis`, `crypto-compare-pairs`, `crypto-sentiment-scan`, `crypto-news-impact`, `crypto-watchlist-manager`
- **Risk & planning:** `crypto-risk-manager`, `crypto-entry-exit-planner`, `exchange-order-planner`
- **Execution:** `exchange-paper-trading`, `exchange-trading-executor` (12-gate safety)
- **Strategy & reporting:** `strategy-backtest-planner`, `crypto-report-generator`
- **Meta:** `crypto-skill-builder`
- 13 documentation files in `docs/`.
- 7 configuration JSONs in `configs/`.
- 9 system & mode prompts in `prompts/`.
- 7 JSON schemas in `schemas/`.
- 6 helper scripts in `scripts/`.
- 8 markdown test files in `tests/`.
- 7 multi-skill workflows in `workflows/`.
- 20+ examples in `examples/`.
- 13 templates in `templates/`.
- Compatible with Claude Code, OpenClaw, Cursor, Hermes.
- MIT License.

### Safety

- Read-only API key enforcement in `exchange-account-review`.
- `dry_run=true` default in `exchange-trading-executor`.
- `CONFIRM` keyword required for live submission.
- 12 pre-flight gates on every live order.
- Kill-switch file support.

### Scope

- **In scope:** Binance + OKX, spot + USDM/COIN-M + swap + futures, public data + (optional) account.
- **Out of scope:** Web3 wallets, DEX, DeFi, on-chain analytics, tax accounting.

---

## [Unreleased]

See [ROADMAP.md](ROADMAP.md) for planned v1.1+ features.
