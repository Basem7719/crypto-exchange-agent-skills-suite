# crypto-spot-analysis

**Category:** analysis   |   **Mode:** analysis   |   **Exchanges:** Binance, OKX

> Analyze a spot trading pair on Binance or OKX — current price, 24h move, trend, volume profile, order book depth, key support/resistance, and a spot-specific setup quality score. Use this skill whenever the user asks to "analyze X spot", "look at the spot market for X", "is X a

---

## What this Skill does (1-paragraph)

See the full skill file: [`SKILL.md`](./SKILL.md).

This is one of the 21 skills inside the **crypto-exchange-agent-skills-suite** project. It is designed to be triggered automatically by `crypto-exchange-master` when the user's request matches its purpose, or invoked directly by name.

## Quick start

```
/crypto-spot-analysis help
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
crypto-exchange-master  →  routes user requests  →  crypto-spot-analysis  →  hands off to next skill
```

See [`../../docs/architecture.md`](../../docs/architecture.md) for the full call graph.

## License

MIT — see frontmatter in `SKILL.md`.
