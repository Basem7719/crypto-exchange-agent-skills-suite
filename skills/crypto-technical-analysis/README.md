# crypto-technical-analysis

**Category:** analysis   |   **Mode:** analysis   |   **Exchanges:** Binance, OKX

> Pure technical analysis of a crypto pair on Binance or OKX — multi-timeframe trend, RSI(14), MACD, Bollinger Bands, EMA 20/50/100/200, ATR, support/resistance zones, volume profile, momentum divergences, chart patterns, entry/exit/invalidation zones, and a Technical Score (0–

---

## What this Skill does (1-paragraph)

See the full skill file: [`SKILL.md`](./SKILL.md).

This is one of the 21 skills inside the **crypto-exchange-agent-skills-suite** project. It is designed to be triggered automatically by `crypto-exchange-master` when the user's request matches its purpose, or invoked directly by name.

## Quick start

```
/crypto-technical-analysis help
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
crypto-exchange-master  →  routes user requests  →  crypto-technical-analysis  →  hands off to next skill
```

See [`../../docs/architecture.md`](../../docs/architecture.md) for the full call graph.

## License

MIT — see frontmatter in `SKILL.md`.
