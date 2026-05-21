# exchange-liquidity-depth

**Category:** data   |   **Mode:** analysis   |   **Exchanges:** Binance, OKX

> Check liquidity, order book depth, spread, slippage estimate, and entry/exit feasibility for any pair on Binance or OKX (spot, perpetual, or futures). Use this skill whenever the user asks "can I trade size X without moving the market", "what's the spread on BILL/USDT", "is there

---

## What this Skill does (1-paragraph)

See the full skill file: [`SKILL.md`](./SKILL.md).

This is one of the 21 skills inside the **crypto-exchange-agent-skills-suite** project. It is designed to be triggered automatically by `crypto-exchange-master` when the user's request matches its purpose, or invoked directly by name.

## Quick start

```
/exchange-liquidity-depth help
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
crypto-exchange-master  →  routes user requests  →  exchange-liquidity-depth  →  hands off to next skill
```

See [`../../docs/architecture.md`](../../docs/architecture.md) for the full call graph.

## License

MIT — see frontmatter in `SKILL.md`.
