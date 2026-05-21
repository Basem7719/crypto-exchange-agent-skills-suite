# Architecture

How the 21 skills cooperate.

## Layered Model

```
              ┌─────────────────────────────┐
              │  User intent (natural lang) │
              └─────────────┬───────────────┘
                            ▼
              ╔═════════════════════════════╗
              ║  crypto-exchange-master     ║ (routing layer)
              ╚═════════════╦═══════════════╝
                            ▼
   ┌──────────────────────────────────────────────────┐
   │  DATA LAYER                                       │
   │  binance-market-scan   okx-market-scan            │
   │  exchange-pair-finder  exchange-liquidity-depth   │
   │  exchange-account-review                          │
   └─────────────────────┬────────────────────────────┘
                         ▼
   ┌──────────────────────────────────────────────────┐
   │  ANALYSIS LAYER                                   │
   │  crypto-technical-analysis                        │
   │  crypto-spot-analysis    crypto-futures-analysis  │
   │  crypto-sentiment-scan   crypto-news-impact       │
   │  crypto-compare-pairs    crypto-watchlist-manager │
   └─────────────────────┬────────────────────────────┘
                         ▼
   ┌──────────────────────────────────────────────────┐
   │  DECISION LAYER                                   │
   │  crypto-risk-manager (GATE)                       │
   │  crypto-entry-exit-planner                        │
   │  exchange-order-planner                           │
   └─────────────────────┬────────────────────────────┘
                         ▼
   ┌──────────────────────────────────────────────────┐
   │  EXECUTION LAYER                                  │
   │  exchange-paper-trading                           │
   │  exchange-trading-executor (12-gate safety)       │
   └─────────────────────┬────────────────────────────┘
                         ▼
   ┌──────────────────────────────────────────────────┐
   │  REPORT / META LAYER                              │
   │  crypto-report-generator                          │
   │  strategy-backtest-planner                        │
   │  crypto-skill-builder                             │
   └──────────────────────────────────────────────────┘
```

## Routing Table (excerpt)

| User says (intent) | Master routes to |
|--------------------|-----------------|
| "is COIN listed on Binance/OKX?" | `exchange-pair-finder` |
| "scan BTC market" | `binance-market-scan` or `okx-market-scan` |
| "technical analysis" | `crypto-technical-analysis` |
| "spot analysis" | `crypto-spot-analysis` |
| "funding / OI / futures" | `crypto-futures-analysis` |
| "sentiment / how bullish" | `crypto-sentiment-scan` |
| "news impact" | `crypto-news-impact` |
| "compare X and Y" | `crypto-compare-pairs` |
| "watchlist" | `crypto-watchlist-manager` |
| "position size / risk" | `crypto-risk-manager` |
| "entry/exit plan" | `crypto-entry-exit-planner` |
| "prepare orders" | `exchange-order-planner` |
| "submit live" | `exchange-trading-executor` (after gates) |
| "paper trade" | `exchange-paper-trading` |
| "review my account" | `exchange-account-review` |
| "backtest" | `strategy-backtest-planner` |
| "full report" | `crypto-report-generator` (calls many) |
| "add a skill" | `crypto-skill-builder` |

The full routing table is inside [skills/crypto-exchange-master/SKILL.md](../skills/crypto-exchange-master/SKILL.md).

## Handoff Contracts

Each skill declares its **Handoff** section in `SKILL.md`. The skill produces structured output (matching `schemas/<skill>.schema.json` where applicable), and the next skill in the chain consumes those fields. Handoffs are always explicit, never implicit through global state.

Examples:

- `crypto-technical-analysis` → produces `{ ta_score, ema_stack, rsi, macd, support, resistance, atr }` → consumed by `crypto-entry-exit-planner` (for stop placement) and `crypto-report-generator` (section 2).
- `crypto-risk-manager` → produces `{ go_no_go, position_size, stop, R, fees, daily_cap }` → consumed by `crypto-entry-exit-planner` (sizing), `exchange-order-planner` (qty), and `exchange-trading-executor` (gate #8).

## State Files

Persistent state goes under `~/.crypto-skills/` (configurable via `CRYPTO_SKILLS_HOME`):

```
~/.crypto-skills/
├── watchlist.yaml
├── paper-ledger.jsonl
├── executor-ledger.jsonl
├── blacklist.txt          (optional symbol blacklist)
└── KILLSWITCH             (presence = stop all executions)
```

These are listed in `.gitignore` — never commit them.

## Master Skill Internals

`crypto-exchange-master` does five things:

1. **Parse intent.** Map free-text to a primary skill + ordered list of follow-on skills.
2. **Normalize symbol.** Binance uses `BTCUSDT`; OKX uses `BTC-USDT` (spot) / `BTC-USDT-SWAP` (perp) / `BTC-USDT-251226` (futures).
3. **Pick market_type.** Default to `spot` unless the request mentions perp / futures / funding / OI.
4. **Dispatch.** Call sub-skills with normalized arguments.
5. **Synthesize.** Combine outputs into a coherent reply (or hand off to `crypto-report-generator`).
