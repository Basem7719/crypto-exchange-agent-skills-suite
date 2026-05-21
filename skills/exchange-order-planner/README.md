# exchange-order-planner

**Category:** planning   |   **Mode:** both   |   **Exchanges:** Binance, OKX

> Convert an entry/exit plan or a user request into a structured set of draft orders for Binance or OKX — market, limit, stop-limit, stop-market, take profit, OCO (Binance spot) or attached TP/SL (OKX), trailing stop, post-only, reduce-only, and time-in-force flags. Use this skil

---

## What this Skill does (1-paragraph)

See the full skill file: [`SKILL.md`](./SKILL.md).

This is one of the 21 skills inside the **crypto-exchange-agent-skills-suite** project. It is designed to be triggered automatically by `crypto-exchange-master` when the user's request matches its purpose, or invoked directly by name.

## Quick start

```
/exchange-order-planner help
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
crypto-exchange-master  →  routes user requests  →  exchange-order-planner  →  hands off to next skill
```

See [`../../docs/architecture.md`](../../docs/architecture.md) for the full call graph.

## License

MIT — see frontmatter in `SKILL.md`.
