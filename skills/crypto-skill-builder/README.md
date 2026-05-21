# crypto-skill-builder

**Category:** meta   |   **Mode:** analysis   |   **Exchanges:** Binance, OKX

> Scaffolding tool that creates new Skills inside this project (crypto-exchange-agent-skills-suite) following the same structure, frontmatter, and quality bar as the 21 existing skills. Triggers on "add a skill for X", "create a new skill that does Y", "اضف مهارة جديدة

---

## What this Skill does (1-paragraph)

See the full skill file: [`SKILL.md`](./SKILL.md).

This is one of the 21 skills inside the **crypto-exchange-agent-skills-suite** project. It is designed to be triggered automatically by `crypto-exchange-master` when the user's request matches its purpose, or invoked directly by name.

## Quick start

```
/crypto-skill-builder help
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
crypto-exchange-master  →  routes user requests  →  crypto-skill-builder  →  hands off to next skill
```

See [`../../docs/architecture.md`](../../docs/architecture.md) for the full call graph.

## License

MIT — see frontmatter in `SKILL.md`.
