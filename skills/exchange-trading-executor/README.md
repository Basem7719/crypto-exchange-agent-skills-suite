# exchange-trading-executor

**Category:** execution   |   **Mode:** execution   |   **Exchanges:** Binance, OKX

> OPTIONAL live order submission to Binance or OKX. Reads draft order specs from exchange-order-planner and submits them to the exchange — ONLY after the user types an explicit CONFIRM keyword, API credentials have been verified as trade-scope (NOT withdraw-scope) via exchange-ac

---

## What this Skill does (1-paragraph)

See the full skill file: [`SKILL.md`](./SKILL.md).

This is one of the 21 skills inside the **crypto-exchange-agent-skills-suite** project. It is designed to be triggered automatically by `crypto-exchange-master` when the user's request matches its purpose, or invoked directly by name.

## Quick start

```
/exchange-trading-executor help
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
crypto-exchange-master  →  routes user requests  →  exchange-trading-executor  →  hands off to next skill
```

See [`../../docs/architecture.md`](../../docs/architecture.md) for the full call graph.

## License

MIT — see frontmatter in `SKILL.md`.
