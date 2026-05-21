# exchange-pair-finder

**Category:** data   |   **Mode:** analysis   |   **Exchanges:** Binance, OKX

> Check whether a coin or trading pair is listed on Binance, OKX, Bybit, or HTX, on which markets (spot, perpetual, futures), and with what trading status (live, suspended, delisted). Use this skill whenever the user asks "is X listed on", "where can I trade X", "does Binance have 

---

## What this Skill does (1-paragraph)

See the full skill file: [`SKILL.md`](./SKILL.md).

This is one of the 21 skills inside the **crypto-exchange-agent-skills-suite** project. It is designed to be triggered automatically by `crypto-exchange-master` when the user's request matches its purpose, or invoked directly by name.

## Quick start

```
/exchange-pair-finder help
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
crypto-exchange-master  →  routes user requests  →  exchange-pair-finder  →  hands off to next skill
```

See [`../../docs/architecture.md`](../../docs/architecture.md) for the full call graph.

## License

MIT — see frontmatter in `SKILL.md`.
