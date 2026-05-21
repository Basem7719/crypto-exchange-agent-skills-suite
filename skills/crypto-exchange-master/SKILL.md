---
name: crypto-exchange-master
description: Master orchestrator for centralized crypto exchange (CEX) trading on Binance and OKX. Use this skill whenever the user mentions Binance, OKX, Bybit, HTX, "the exchange", spot trading, futures trading, perpetuals, leverage, a trading pair like BTC/USDT or ETH/USDT, market scanning, account review, watchlist, paper trading, or any request that combines analysis with order planning on a centralized exchange. Routes the request to the correct specialist skill (market scan, technical analysis, spot/futures analysis, risk manager, entry-exit planner, liquidity check, order planner, executor, or report). Always use this skill first when the user's request touches more than one of these areas, or when it's unclear which specific skill applies. Scope: Binance + OKX (primary), Bybit + HTX (optional/secondary). Out of scope: Web3 wallets, DEX/AMM trading, DeFi yield.
version: 1.0.0
category: router
compatible_with: [claude-code, openclaw, cursor, hermes]
exchanges: [binance, okx]
mode: both
license: MIT
---

# Crypto Exchange Master

Router and orchestrator for all centralized exchange trading skills. This is the entry point — it does NOT execute analysis itself. It decides which specialist skill to load and in what order.

## Purpose

Master orchestrator for centralized crypto exchange (CEX) trading on Binance and OKX. Use this skill whenever the user mentions Binance, OKX, Bybit, HTX, "the exchange", spot trading, futures trading, perpetuals, leverage, a trading pair like BTC/USDT or ETH/USDT, market scanning, account review, watchlist, paper trading, or any request that combines analysis with order planning on a centralized exchange. Routes the request to the correct specialist skill (market scan, technical analysis, spot/futures analysis, risk manager, entry-exit planner, liquidity check, order planner, executor, or report). Always use this skill first when the user's request touches more than one of these areas, or when it's unclear which specific skill applies. Scope: Binance + OKX (primary), Bybit + HTX (optional/secondary). Out of scope: Web3 wallets, DEX/AMM trading, DeFi yield.

This skill is part of the **crypto-exchange-agent-skills-suite**. See [`../../docs/architecture.md`](../../docs/architecture.md) for how it fits with the other 20 skills.

---

> **IMPORTANT DISCLAIMER:** This skill package is for educational, research, and planning purposes only. It is NOT financial advice. Skills must NEVER:
> - Execute real trades without explicit user confirmation typed in plain text (e.g., `CONFIRM`).
> - Request private keys, seed phrases, or full-permission API keys.
> - Use API keys that have withdrawal permission enabled.
>
> Default behavior is read-only / paper-trading. Any live order requires the user to explicitly opt-in by configuring `exchange-trading-executor` separately.

---

## When to Use This Skill

Trigger phrases include any of:

- "analyze BTC/USDT on Binance"
- "what's happening on OKX right now"
- "should I long ETH perp"
- "give me a full report on SOL/USDT"
- "compare BTC/USDT and ETH/USDT"
- "build me a watchlist on Binance"
- "plan an entry for SOL/USDT"
- "is BILL listed on Binance or OKX"
- mixed Arabic/English: "حلل BTC/USDT على Binance", "ابحث BILL على OKX و Binance"

If the user names a single, narrow task ("just give me the RSI"), you can skip the router and call the specific skill (`crypto-technical-analysis`) directly. Use the router when the request is broad, multi-step, or ambiguous.

---

## Required Inputs

Collect (or infer) before routing:

| Input | Required? | Notes |
|-------|-----------|-------|
| `exchange` | yes | `binance` \| `okx` \| `bybit` \| `htx` \| `auto` (try both Binance and OKX) |
| `market_type` | yes | `spot` \| `futures` \| `perp` \| `swap` \| `auto` |
| `pair` or `symbol` | usually | e.g., `BTC/USDT`, `ETH-USDT-SWAP`. If unknown, route to `exchange-pair-finder` first. |
| `intent` | yes | `scan` \| `analyze` \| `plan` \| `compare` \| `watchlist` \| `report` \| `execute` |
| `timeframe` | optional | `5m`/`15m`/`1h`/`4h`/`1d` — default `1h` |
| `capital` | optional, required for risk | account size in USDT for position sizing |
| `risk_pct` | optional | default `1%` per trade |

If any required input is missing, ASK ONE clarifying question, then proceed with sensible defaults.

---

## Routing Table

Match user intent to the correct specialist skill:

| User Intent | Skill to Call | Notes |
|-------------|---------------|-------|
| "is X listed on Binance/OKX?" | `exchange-pair-finder` | Always first when symbol unfamiliar |
| "scan Binance market" / "top movers on Binance" | `binance-market-scan` | Binance-only |
| "scan OKX market" / "OKX top gainers" | `okx-market-scan` | OKX-only |
| "what's the price/depth/candles of X on Binance" | `binance-market-scan` | Single-pair drill-down |
| "what's the price/depth/candles of X on OKX" | `okx-market-scan` | Single-pair drill-down |
| "analyze X spot on <exchange>" | `crypto-spot-analysis` | Add `crypto-technical-analysis` if requested |
| "analyze X perp/futures on <exchange>" | `crypto-futures-analysis` | Pulls funding + OI + leverage |
| "RSI/MACD/support/resistance of X" | `crypto-technical-analysis` | Pure TA |
| "position size for X" / "stop loss for X" | `crypto-risk-manager` | Needs capital + risk_pct |
| "is there liquidity / can I get in and out" | `exchange-liquidity-check` | Order book depth + spread |
| "plan an entry/exit for X" | `crypto-entry-exit-plan` | Combines TA + risk + liquidity |
| "build a watchlist" / "track these pairs" | `crypto-watchlist` | Persistent list |
| "compare X vs Y" | `crypto-compare-pairs` | Side-by-side |
| "show my balances/positions" | `exchange-account-review` | Requires read API key |
| "paper trade X" / "simulate this" | `exchange-paper-trading` | No live funds |
| "prepare a market/limit/OCO order for X" | `exchange-order-planner` | Plans, does NOT send |
| "place the order" / "execute this" | `exchange-trading-executor` | Requires explicit confirmation + opt-in |
| "give me a full report on X" | `crypto-report` | Orchestrates the others |

---

## Multi-Skill Workflows

For broad requests, run skills in sequence. Examples:

### "Should I long BTC/USDT perp on OKX?"
1. `okx-market-scan` → current price, 24h stats, funding rate, OI
2. `crypto-technical-analysis` → trend, RSI, MACD, key levels
3. `crypto-futures-analysis` → funding/basis/leverage context
4. `exchange-liquidity-check` → depth at entry zone
5. `crypto-risk-manager` → position size + stop loss
6. `crypto-entry-exit-plan` → entry zone, targets, invalidation
7. (optional) `exchange-order-planner` → draft the limit/stop orders

### "Full report on SOL/USDT on Binance"
1. `exchange-pair-finder` → confirm listing + tradable status
2. `binance-market-scan` → market snapshot
3. `crypto-technical-analysis`
4. `crypto-spot-analysis` (and `crypto-futures-analysis` if perp exists)
5. `exchange-liquidity-check`
6. `crypto-risk-manager`
7. `crypto-report` → consolidates into one document

### "Compare BILL/USDT and PLAY/USDT on Binance and OKX"
1. `exchange-pair-finder` → confirm both pairs on both exchanges
2. `crypto-compare-pairs` → side-by-side analysis (calls market-scan + TA internally)

---

## Workflow

1. **Parse the request.** Identify exchange, market type, pair, and intent. State your understanding in one sentence.
2. **Resolve missing inputs.** If `pair` is given but exchange is `auto`, run `exchange-pair-finder` first.
3. **Pick the route.** Use the table above. For multi-step intents, list the planned chain before executing.
4. **Execute in order.** Call each specialist skill, feed its output forward.
5. **Consolidate.** Present one coherent answer to the user, not a dump of every skill's output. If the user asked for a full report, hand off to `crypto-report`.
6. **No live orders unless explicit.** Even with a clear "execute" intent, route to `exchange-order-planner` first and require the user to type `CONFIRM` before `exchange-trading-executor`.

---

## Output Format

Always start the response with a 1-line route summary:

```
Route: [exchange] · [market_type] · [pair] · intent=[intent]
Skills called: skill-1 → skill-2 → skill-3
```

Then deliver the consolidated result. End with a short "What's next?" section offering 2–3 follow-up actions (e.g., "want me to draft the limit order?", "should I add this to your watchlist?").

---

## Handoff

This skill is the entry router; every other skill in the package can be called from here. Each specialist skill is also callable directly when the user is precise about what they want. The contract between this skill and the specialists:

- The router passes a normalized JSON-like object: `{ exchange, market_type, pair, timeframe, capital, risk_pct, ... }`.
- Each specialist returns a structured snapshot (price levels, scores, key numbers) — not free prose — so downstream skills can chain.
- Final user-facing prose is assembled by either this router or `crypto-report`.

---

## Exchange Scope

| Exchange | Status | Notes |
|----------|--------|-------|
| Binance | primary | spot + USDS-M futures + COIN-M futures + margin |
| OKX | primary | spot + perp swap + futures + options |
| Bybit | optional | enable via `references/bybit.md` (future) |
| HTX | optional | enable via `references/htx.md` (future) |

If the user names an unsupported exchange, fall back to web search for a public quote, then explicitly tell them this package does not yet have a specialist for that venue.

---

## Example Commands

```
/crypto-exchange-master analyze BTC/USDT on Binance spot
/crypto-exchange-master compare BTC/USDT vs ETH/USDT on OKX
/crypto-exchange-master is BILL listed on Binance or OKX
/crypto-exchange-master full report SOL/USDT exchange=auto
```

In Arabic:
```
/crypto-exchange-master حلل BTC/USDT على Binance
/crypto-exchange-master قارن BTC/USDT و ETH/USDT على OKX
/crypto-exchange-master تقرير كامل SOL/USDT
```

---

## Optional Inputs

| Input | Default | Example |
|-------|---------|---------|
| `timeframe` | `1h` | `15m`, `4h`, `1d` |
| `verbose` | `false` | `true` for raw endpoint dumps |

The full list of inputs is documented under [`## Required Inputs`](#required-inputs) above. Anything not marked required is optional with sensible defaults.

---

## Exchange-Specific Handling

### Binance
- Endpoints, symbol formats, and quirks are documented in [`../../docs/binance-guide.md`](../../docs/binance-guide.md).
- Symbol format: `BTCUSDT` (no separator). Perp uses USDM endpoints (`fapi.binance.com`).

### OKX
- Endpoints, bar values, and quirks are documented in [`../../docs/okx-guide.md`](../../docs/okx-guide.md).
- Symbol format: `BTC-USDT` (spot), `BTC-USDT-SWAP` (perp), `BTC-USDT-251226` (futures).
- Bar values are uppercase from `1H` upward.

---

## Quality Checks

- All required fields populated; no `null` in required positions.
- Numeric outputs within expected ranges (no negative volumes, RSI in [0,100], etc.).
- Data timestamp within last 5 minutes when the request is real-time.
- For multi-exchange outputs, both Binance and OKX figures use the same time window.
- If an endpoint returns an error, the skill surfaces it explicitly rather than inventing values.

---

## Edge Cases

- **Ambiguous pair (e.g. `BTC` only).** Ask one clarifying question — `BTC/USDT` on which exchange?
- **Unsupported exchange.** If the user names Bybit/HTX/Kraken/Coinbase, respond that v1.0 supports Binance and OKX only, with placeholders for Bybit/HTX in v1.1.
- **Symbol on one exchange but not the other.** Route to the exchange that has it, mention the other doesn't list it.
- **Conflicting modes.** If user is in `analysis_only` and asks for a live order, refuse and explain how to switch.
- **Multiple skills could apply.** Prefer the most specific (e.g. `crypto-futures-analysis` over generic `crypto-technical-analysis` when the user mentions funding).
- **Stale state.** If `~/.crypto-skills/` contains state older than 24h for the requested pair, refresh before dispatching.
- **Rate-limit pressure.** If the data layer recently hit a rate limit, the master queues requests and warns the user.
- **Kill-switch present.** Any routing to execution skills fails fast with the kill-switch reason — never silently ignored.
