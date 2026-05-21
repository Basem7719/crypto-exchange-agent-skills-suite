---
name: crypto-skill-builder
description: Scaffolding tool that creates new Skills inside this project (crypto-exchange-agent-skills-suite) following the same structure, frontmatter, and quality bar as the 21 existing skills. Triggers on "add a skill for X", "create a new skill that does Y", "اضف مهارة جديدة لـ Z", "ابني skill جديدة". Generates SKILL.md, README.md, examples.md, validates against the project schema, and updates skills.json. This is the meta-skill — use it to extend the suite cleanly instead of writing files by hand.
version: 1.0.0
category: meta
compatible_with: [claude-code, openclaw, cursor, hermes]
exchanges: [binance, okx]
mode: analysis
license: MIT
---

# Crypto Skill Builder

The skill that builds skills. Generates a new skill that matches this project's conventions exactly so the suite stays consistent as it grows.

> ⚠ **Use this instead of hand-writing files.** Manual additions drift in frontmatter, section order, and naming. Skills made by hand frequently fail `validate-skills.js`.

---

## Purpose

Provide a single command that creates a fully-formed skill directory with valid frontmatter, all 11 required sections, a README, an examples file, and an entry in `skills.json` — ready to be tested.

## When to Use

- "create a new skill called `binance-margin-analyzer`"
- "add a skill to detect token unlock dates"
- "build a skill that compares two timeframes on the same pair"
- "اضف مهارة جديدة لتحليل العملات الجديدة على Binance"
- After `strategy-backtest-planner` produces a winning strategy and you want to wrap the live logic as a skill.

## Required Inputs

| Input | Required? | Example |
|-------|-----------|---------|
| `skill_name` | yes | `binance-margin-analyzer` (kebab-case) |
| `purpose` | yes | one-sentence description |
| `category` | yes | `data` / `analysis` / `risk` / `planning` / `execution` / `account` / `monitoring` / `simulation` / `report` / `meta` / `strategy` / `router` |
| `mode` | yes | `analysis` / `execution` / `simulation` / `both` |

## Optional Inputs

| Input | Default | Example |
|-------|---------|---------|
| `exchanges` | `[binance, okx]` | `[binance]` only |
| `description_long` | auto from purpose | a richer paragraph for the frontmatter `description:` field |
| `triggers` | extracted from purpose | list of trigger phrases (English + Arabic) |
| `inputs` | empty table | structured list of inputs |
| `output_format` | generic template | example output block |
| `dry` | false | true → preview only, don't write files |

## Workflow

```
1. Validate skill_name:
     - kebab-case
     - unique (not already in skills/)
     - starts with one of the accepted prefixes:
       crypto-, binance-, okx-, exchange-, strategy-
2. Render SKILL.md from the project template with the user's fields.
3. Render README.md (short summary + link to SKILL.md).
4. Render examples.md (2 English + 2 Arabic example commands).
5. Create skills/<skill_name>/ directory.
6. Write the three files.
7. Validate with scripts/validate-skills.js (subprocess).
8. Run scripts/generate-skill-index.js to refresh skills.json.
9. Print a summary: paths created, validation result, next steps.
```

## Exchange-Specific Handling

This skill is exchange-agnostic. It accepts `exchanges` as an array and injects the value into the frontmatter and an "Exchange-Specific Handling" stub section. Provided template already includes Binance and OKX endpoint placeholders for new data skills.

## Output Format

```
=== Skill Created — binance-margin-analyzer ===
Files written:
  skills/binance-margin-analyzer/SKILL.md      (267 lines)
  skills/binance-margin-analyzer/README.md     (28 lines)
  skills/binance-margin-analyzer/examples.md   (44 lines)

Validation:
  frontmatter: PASS
  all 11 required sections: PASS
  name uniqueness: PASS

skills.json updated:
  total skills now: 22

Next steps:
  1. Fill in the "Exchange-Specific Handling" section with concrete endpoints.
  2. Add at least one realistic example to examples.md.
  3. Add an entry in tests/<skill>.test.md.
  4. Run scripts/validate-skills.js again before commit.
```

## Handoff

- Updates `skills.json` so `crypto-exchange-master` can route to the new skill.
- New skill is immediately discoverable by Claude Code / OpenClaw if dropped into the runtime skills folder.
- Optionally seeds `tests/<skill>.test.md` with a smoke test template (if `--seed-test` is passed).

## Quality Checks

- `skill_name` matches `^[a-z][a-z0-9-]*$`.
- All required frontmatter fields present: `name`, `description`, `version`, `category`, `compatible_with`, `exchanges`, `mode`, `license`.
- All 11 sections present: Purpose, When to Use, Required Inputs, Optional Inputs, Workflow, Exchange-Specific Handling, Output Format, Handoff, Quality Checks, Edge Cases, Example Commands.
- DISCLAIMER block in any skill with `mode: execution` is non-empty.
- README.md has at least one example command.

## Edge Cases

- **Name collision.** Refuse and suggest two alternatives (suffix `-v2`, or rename to disambiguate).
- **Unaccepted category.** Refuse with a list of valid categories.
- **Execution mode without DISCLAIMER.** Refuse; require an explicit disclaimer string.
- **Empty triggers list.** Auto-extract three trigger phrases from `purpose`; warn the user to review.
- **Exchanges array is `[]`.** Refuse — every skill must declare at least one supported exchange (use `[any]` for fully exchange-agnostic skills).

## Example Commands

```
/crypto-skill-builder skill_name=binance-margin-analyzer purpose="Analyze Binance cross-margin and isolated-margin positions" category=analysis mode=analysis
/crypto-skill-builder skill_name=okx-options-snapshot purpose="Snapshot OKX options chain by strike and expiry" category=data mode=analysis exchanges=[okx]
/crypto-skill-builder skill_name=token-unlock-watch purpose="Track upcoming token unlocks > 1% of supply for watchlist coins" category=monitoring mode=analysis
```

Arabic:
```
/crypto-skill-builder اضف مهارة جديدة لتحليل margin على Binance
/crypto-skill-builder ابني skill لمتابعة جداول unlock للعملات في الـ watchlist
```
