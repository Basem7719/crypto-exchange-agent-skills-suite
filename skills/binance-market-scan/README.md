# binance-market-scan

**Category:** data   |   **Mode:** analysis   |   **Exchanges:** Binance, OKX

> Scan Binance markets (spot, USDS-M futures, COIN-M futures) for price, 24h stats, OHLCV candles, order book depth, recent trades, funding rates, open interest, and top movers. Use this skill whenever the user asks about Binance specifically — "what's BTC doing on Binance", "Bin

---

## What this Skill does (1-paragraph)

See the full skill file: [`SKILL.md`](./SKILL.md).

This is one of the 21 skills inside the **crypto-exchange-agent-skills-suite** project. It is designed to be triggered automatically by `crypto-exchange-master` when the user's request matches its purpose, or invoked directly by name.

## Quick start

```
/binance-market-scan help
```

For full input/output details, workflow, edge cases and quality checks, open `SKILL.md`. For ready-to-paste commands, see `examples.md`.

## Files in this folder

| File | Purpose |
|------|---------|
| `SKILL.md` | Full skill spec (frontmatter + 11 sections) |
| `README.md` | This summary |
| `examples.md` | Copy-paste example commands (English + Arabic) |

## Position in the suite

```
crypto-exchange-master  →  routes user requests  →  binance-market-scan  →  hands off to next skill
```

See [`../../docs/architecture.md`](../../docs/architecture.md) for the full call graph.

## License

MIT — see frontmatter in `SKILL.md`.
