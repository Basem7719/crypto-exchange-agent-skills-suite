# okx-market-scan

**Category:** data   |   **Mode:** analysis   |   **Exchanges:** Binance, OKX

> Scan OKX markets (spot, perpetual swap, futures, options) for price, tickers, candles/OHLCV, order book depth, funding rates, open interest, mark price, index price, top movers, and technical indicators (RSI/MACD/EMA/Bollinger/KDJ/SuperTrend and 70+ more). Use this skill whenever

---

## What this Skill does (1-paragraph)

See the full skill file: [`SKILL.md`](./SKILL.md).

This is one of the 21 skills inside the **crypto-exchange-agent-skills-suite** project. It is designed to be triggered automatically by `crypto-exchange-master` when the user's request matches its purpose, or invoked directly by name.

## Quick start

```
/okx-market-scan help
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
crypto-exchange-master  →  routes user requests  →  okx-market-scan  →  hands off to next skill
```

See [`../../docs/architecture.md`](../../docs/architecture.md) for the full call graph.

## License

MIT — see frontmatter in `SKILL.md`.
