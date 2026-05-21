# Skill Development Guide

How to add or modify skills in this suite consistently.

## 1. Use the Builder

The fastest path:
```
/crypto-skill-builder skill_name=<name> purpose="..." category=<...> mode=<...>
```

It creates the folder, SKILL.md, README.md, examples.md, validates, and updates skills.json.

## 2. Manual Path

If you must:

```bash
cp -r templates/skill skills/<your-skill-name>
mv skills/<your-skill-name>/SKILL.template.md skills/<your-skill-name>/SKILL.md
$EDITOR skills/<your-skill-name>/SKILL.md
```

Then fill in:

### Required frontmatter

```yaml
---
name: your-skill-name
description: Pushy multi-trigger description with English + Arabic phrases.
version: 1.0.0
category: data | analysis | risk | planning | execution | account | monitoring | simulation | report | strategy | meta | router
compatible_with: [claude-code, openclaw, cursor, hermes]
exchanges: [binance, okx]
mode: analysis | execution | simulation | both
license: MIT
---
```

### Required sections (in order)

1. **Purpose** — what the skill does, 2-3 sentences.
2. **When to Use** — bullet list of trigger phrases (English + Arabic).
3. **Required Inputs** — table.
4. **Optional Inputs** — table with defaults.
5. **Workflow** — numbered steps.
6. **Exchange-Specific Handling** — Binance subsection + OKX subsection.
7. **Output Format** — code block with a realistic sample output.
8. **Handoff** — what other skills consume this skill's output.
9. **Quality Checks** — bullet list of things that must be true for the output to be considered valid.
10. **Edge Cases** — bullet list, 5–10 items.
11. **Example Commands** — 2 English + 2 Arabic.

### Disclaimer

If `mode: execution` (or there's any risk of live action), include a clear disclaimer block near the top:
```
> ⚠ **DISCLAIMER**
> ...
```

## 3. Validate

```bash
node scripts/validate-skills.js
```

This checks:

- Frontmatter fields are present and well-typed.
- All 11 sections exist (by heading).
- `name:` matches the folder name.
- README.md and examples.md exist.
- The skill is listed in `skills.json` (run `node scripts/generate-skill-index.js` to refresh).

## 4. Style Notes

- Tables for inputs and endpoint maps.
- Numbered lists for workflows.
- Code blocks (` ``` `) for output samples.
- Keep each skill ≤ 300 lines. Anything longer = split it.
- Examples are concrete (real pair names, real numbers), not placeholders.

## 5. Add Exchange Coverage

To add Bybit (or HTX):

1. Create `adapters/bybit/adapter-spec.md` mirroring `adapters/binance/adapter-spec.md`.
2. Create `bybit-market-scan/` skill mirroring `binance-market-scan/`.
3. Add `bybit` to the routing table in `crypto-exchange-master`.
4. Optionally extend `exchange-order-planner` and `exchange-trading-executor` with Bybit endpoints.
5. Re-run validate + index scripts.

## 6. Test

Add a `tests/<skill-name>.test.md` file. Include:

- Test name
- Goal
- Command
- Expected sub-skills called
- Inputs
- Expected output shape (point to the schema in `schemas/` if there is one)
- Success criterion

## 7. PR Checklist

Before opening a PR:

- [ ] `node scripts/validate-skills.js` passes
- [ ] `skills.json` regenerated
- [ ] `tests/<skill>.test.md` exists
- [ ] CHANGELOG.md has an entry under `[Unreleased]`
