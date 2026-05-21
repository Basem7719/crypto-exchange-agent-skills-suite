# crypto-exchange-agent-skills-suite

> **A production-grade suite of 21 Skills** for AI agents to analyze and trade crypto on **Binance** and **OKX**.
> Compatible with **Claude Code**, **OpenClaw**, **Cursor**, and **Hermes**.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Skills](https://img.shields.io/badge/Skills-21-green.svg)](skills/)
[![Exchanges](https://img.shields.io/badge/Exchanges-Binance%20%2B%20OKX-orange.svg)](docs/supported-exchanges.md)

---

## نظرة عامة (Arabic Intro)

`crypto-exchange-agent-skills-suite` هي حزمة احترافية ضخمة من **21 مهارة** لـ AI Agents متخصصة في تحليل وتداول الكريبتو على المنصتين المركزيتين **Binance** و **OKX**.

**ما الذي تقدمه الحزمة؟**
- 21 مهارة متكاملة (Skill) مكتوبة بشكل احترافي.
- نظام Master skill ينسق بين المهارات تلقائياً.
- ملفات إعداد جاهزة، قوالب، schemas، اختبارات، workflows.
- تنفيذ مباشر **اختياري** ومحمي بـ 12 بوابة أمان.
- متوافق مع Claude Code, OpenClaw, Cursor, Hermes.
- لا يتعامل إطلاقاً مع DEX أو DeFi أو محافظ Web3.

**التركيز:** Binance + OKX فقط. (Bybit و HTX جاهزان كـ adapters مستقبلية).

---

## Why This Suite?

The crypto-skill ecosystem on AI agents today is fragmented: most packs are toy demos, hardcoded to one exchange, or dump arbitrary Python snippets without a coherent workflow. This suite is different:

1. **Two-exchange coverage done well.** Binance and OKX get **first-class adapters** with full spot, USDM, COIN-M, swap, and futures support — not "best effort".
2. **Risk-first architecture.** Every trade-related skill goes through `crypto-risk-manager` and a 12-gate safety check before any live action.
3. **No fake autonomy.** The executor refuses to submit without an explicit `CONFIRM` keyword, never has withdraw scope, and stays in `dry_run` by default.
4. **Composable.** `crypto-exchange-master` routes user intent → one or more skills → final synthesis. Every skill has a documented handoff.
5. **Extensible.** Add Bybit, HTX, or a new analysis skill in minutes using `crypto-skill-builder` + the templates in `templates/skill/`.

---

## The 21 Skills

| # | Skill | Category | Purpose |
|---|-------|----------|---------|
| 1 | [crypto-exchange-master](skills/crypto-exchange-master/) | router | Routes user intent to the right skill(s) |
| 2 | [exchange-pair-finder](skills/exchange-pair-finder/) | data | "Is COIN/USDT listed on Binance or OKX?" |
| 3 | [binance-market-scan](skills/binance-market-scan/) | data | Public market data from Binance |
| 4 | [okx-market-scan](skills/okx-market-scan/) | data | Public market data from OKX |
| 5 | [crypto-spot-analysis](skills/crypto-spot-analysis/) | analysis | Spot-specific score (trend, vol, depth) |
| 6 | [crypto-futures-analysis](skills/crypto-futures-analysis/) | analysis | Funding, OI, basis, L/S, liquidation map |
| 7 | [crypto-technical-analysis](skills/crypto-technical-analysis/) | analysis | EMA, RSI, MACD, BB, ATR, S/R |
| 8 | [exchange-liquidity-depth](skills/exchange-liquidity-depth/) | data | Order book depth + slippage estimate |
| 9 | [crypto-risk-manager](skills/crypto-risk-manager/) | risk | Position sizing, R-math, GO / NO-GO |
| 10 | [crypto-entry-exit-planner](skills/crypto-entry-exit-planner/) | planning | Entry zone, stop, TP ladder, time stop |
| 11 | [exchange-order-planner](skills/exchange-order-planner/) | planning | Draft order specs (never submits) |
| 12 | [exchange-trading-executor](skills/exchange-trading-executor/) | execution | Optional live submit, 12-gate safety |
| 13 | [exchange-account-review](skills/exchange-account-review/) | account | Read-only account review |
| 14 | [crypto-watchlist-manager](skills/crypto-watchlist-manager/) | monitoring | Persistent watchlist + alerts |
| 15 | [crypto-compare-pairs](skills/crypto-compare-pairs/) | analysis | Side-by-side ranking of 2–6 pairs |
| 16 | [crypto-sentiment-scan](skills/crypto-sentiment-scan/) | analysis | Funding/OI/LSR-based market mood |
| 17 | [crypto-news-impact](skills/crypto-news-impact/) | analysis | Estimate news → price impact |
| 18 | [exchange-paper-trading](skills/exchange-paper-trading/) | simulation | Virtual ledger with realistic fills |
| 19 | [strategy-backtest-planner](skills/strategy-backtest-planner/) | strategy | Design rigorous backtests |
| 20 | [crypto-report-generator](skills/crypto-report-generator/) | report | Full end-to-end research report |
| 21 | [crypto-skill-builder](skills/crypto-skill-builder/) | meta | Scaffolds new skills consistent with this suite |

Every skill follows the same 11-section template (frontmatter + Purpose, When to Use, Required Inputs, Optional Inputs, Workflow, Exchange-Specific Handling, Output Format, Handoff, Quality Checks, Edge Cases, Examples). See [templates/skill/SKILL.template.md](templates/skill/SKILL.template.md).

---

## Supported Exchanges

| Exchange | Spot | USDM / Swap | COIN-M | Futures (dated) | Options | Account |
|---------|:----:|:-----------:|:------:|:--------------:|:-------:|:-------:|
| **Binance** | ✅ | ✅ (USDM) | ✅ | ✅ (delivery) | — | ✅ (read-only enforced) |
| **OKX** | ✅ | ✅ (swap) | — | ✅ | (metadata only) | ✅ (read-only enforced) |
| Bybit | adapter stub | adapter stub | — | — | — | — |
| HTX | adapter stub | adapter stub | — | — | — | — |

See [docs/supported-exchanges.md](docs/supported-exchanges.md) for the full feature matrix and adapter status.

---

## Installation (one-liner)

### Claude Code
```bash
bash scripts/install-claude.sh
```

### OpenClaw
```bash
bash scripts/install-openclaw.sh
```

### Cursor / Hermes / All
```bash
bash scripts/install-all.sh
```

Full manual install (and per-runtime notes) is in [INSTALL.md](INSTALL.md).

---

## Quick Start (5 minutes)

See [QUICKSTART.md](QUICKSTART.md). The 5 first commands to try:

```
/exchange-pair-finder BILL USDT on Binance and OKX
/binance-market-scan BTC/USDT
/okx-market-scan BTC-USDT
/crypto-technical-analysis pair=BTC/USDT exchange=binance timeframe=1h
/crypto-report-generator pair=BTC/USDT exchange=binance market=spot timeframe=1h capital=5000
```

---

## Folder Map

```
crypto-exchange-agent-skills-suite/
├── README.md, QUICKSTART.md, INSTALL.md, USAGE.md, ROADMAP.md, CHANGELOG.md, LICENSE
├── .env.example, .gitignore, package.json, skills.json, project.config.json
├── skills/                21 skills, each with SKILL.md + README.md + examples.md
├── docs/                  13 documentation files (architecture, guides, troubleshooting)
├── configs/               7 config files (exchanges, risk profiles, agent modes, watchlists)
├── prompts/               9 system & mode prompts (analysis, scalping, swing, futures…)
├── examples/              real-world example flows (Binance, OKX, cross-exchange, reports)
├── templates/             output / skill / prompt templates for fast generation
├── schemas/               7 JSON schemas for every structured output
├── scripts/               install + validation + index + new-skill scripts
├── tests/                 8 markdown-based smoke and integration tests
├── workflows/             7 end-to-end multi-skill workflows
└── adapters/              Binance & OKX adapter specs; Bybit & HTX placeholders
```

---

## Safety Model (in one paragraph)

The default mode of the suite is **analysis_only**. Account access requires a read-only API key; the `exchange-account-review` skill refuses to run if the key has `enableWithdrawals=true`. Live order submission is **opt-in**, gated behind the `exchange-trading-executor` skill which runs in `dry_run=true` by default and requires the user to type the exact uppercase token `CONFIRM` to go live. There are 12 pre-flight gates (scope check, freshness, notional cap, leverage cap, risk-manager verdict, kill-switch file, rate-limit guard, maintenance check, clientOrderId idempotency, etc.) — if any single gate fails, no order is sent.

Full details: [docs/risk-management-guide.md](docs/risk-management-guide.md) and the executor skill's [SKILL.md](skills/exchange-trading-executor/SKILL.md).

---

## Extending the Suite

Add a new skill in one command:

```bash
npm run new-skill -- --name binance-margin-analyzer --category analysis --mode analysis
```

Add a new exchange adapter: copy `adapters/binance/` → `adapters/<your-exchange>/`, fill in `api-mapping.md` and `supported-data.md`, then update `crypto-exchange-master`'s routing table. See [docs/skill-development-guide.md](docs/skill-development-guide.md).

---

## Disclaimer

> Crypto trading carries substantial risk. Nothing in this suite is financial advice. The skills produce analysis, scores, and recommendations based on public market data; users make all final decisions. Always start with `exchange-paper-trading` before any live capital. Use read-only API keys whenever possible. Never enable withdraw permission on keys given to an AI agent.
>
> تداول الكريبتو فيه مخاطرة عالية. الحزمة لا تقدم نصيحة مالية. ابدأ دائماً بـ `exchange-paper-trading` قبل أي رأس مال حقيقي. استخدم مفاتيح API بصلاحية قراءة فقط، ولا تفعّل صلاحية withdraw على أي مفتاح تستخدمه مع AI Agent.

---

## License

[MIT](LICENSE) — free to use, modify, redistribute.

---

## Links

- [QUICKSTART.md](QUICKSTART.md) — 5-minute start
- [INSTALL.md](INSTALL.md) — install on Claude Code / OpenClaw / Cursor / Hermes
- [USAGE.md](USAGE.md) — full usage guide with examples
- [docs/architecture.md](docs/architecture.md) — how skills cooperate
- [docs/agent-workflows.md](docs/agent-workflows.md) — common multi-skill flows
- [ROADMAP.md](ROADMAP.md) — what's next
- [CHANGELOG.md](CHANGELOG.md) — version history
