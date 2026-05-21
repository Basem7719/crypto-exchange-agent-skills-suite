# Overview

**crypto-exchange-agent-skills-suite** is a complete, opinionated, production-grade skill suite for AI agents that need to analyze and (optionally) trade on **Binance** and **OKX**.

## Goals

1. **Two-exchange depth, not many-exchange breadth.** Binance and OKX cover ~80% of the user base for spot + perp + futures. Doing those two excellently beats half-supporting ten.
2. **Risk-first, not feature-first.** Every trade-related skill funnels through `crypto-risk-manager` and a 12-gate executor.
3. **Composability.** Each skill has a clean input/output and a documented handoff. `crypto-exchange-master` orchestrates.
4. **Agent-runtime agnostic.** Works on Claude Code, OpenClaw, Cursor, Hermes — same files, different install paths.
5. **No fake autonomy.** Live trading is opt-in, gated behind `CONFIRM`, default `dry_run=true`, kill-switch supported.

## Non-Goals

- DEX / Web3 / DeFi (use a different suite).
- Headless 24/7 bots (the design assumes a human in the loop).
- Tax / accounting.
- Strategy hosting (we plan; you backtest; you deploy).

## Who Is This For?

- AI agent builders adding crypto capability to a Claude / OpenClaw / Cursor / Hermes setup.
- Quant-curious traders who want a structured agent workflow.
- Teams formalizing pre-trade safety checklists.
- Educators teaching crypto market microstructure.

## What's New vs Generic Crypto Skill Packs?

| Concern | Generic packs | This suite |
|---------|---------------|-----------|
| Routing | "ask the LLM" | explicit `crypto-exchange-master` with a routing table |
| Risk | inline disclaimers | dedicated `crypto-risk-manager` with GO/NO-GO gate |
| Execution | "call the API" | 12-gate safety executor, dry_run default, CONFIRM keyword |
| Schema | freeform JSON | 7 JSON Schemas under `schemas/` |
| Extensibility | edit files | `crypto-skill-builder` + templates |
| Tests | none | 8 markdown smoke tests + walkthroughs |
