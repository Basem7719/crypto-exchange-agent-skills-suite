---
name: {{SKILL_NAME}}
description: {{PURPOSE}} Triggers on TODO (English + Arabic phrases).
version: 1.0.0
category: {{CATEGORY}}
compatible_with: [claude-code, openclaw, cursor, hermes]
exchanges: [binance, okx]
mode: {{MODE}}
license: MIT
---

# {{SKILL_NAME}}

{{PURPOSE}}

> ⚠ **DISCLAIMER**
> TODO: write a one-paragraph disclaimer if this skill touches live execution or significant decisions.

---

## Purpose

TODO: 2-3 sentences. What does this skill produce, and why?

## When to Use

- TODO: trigger phrase 1
- TODO: trigger phrase 2 (Arabic)

## Required Inputs

| Input | Required? | Example |
|-------|-----------|---------|
| `pair` | yes | `BTC/USDT` |
| `exchange` | yes | `binance` / `okx` |

## Optional Inputs

| Input | Default | Example |
|-------|---------|---------|
| `timeframe` | `1h` | `15m`, `4h` |

## Workflow

```
1. TODO: step 1
2. TODO: step 2
3. TODO: step 3
```

## Exchange-Specific Handling

### Binance
TODO

### OKX
TODO

## Output Format

```
TODO: realistic example output
```

## Handoff

- Feeds into: TODO (which downstream skill consumes this output?)
- Triggers: TODO (does this skill trigger any follow-up skill?)

## Quality Checks

- TODO: condition for output to be valid

## Edge Cases

- TODO
- TODO

## Example Commands

```
/{{SKILL_NAME}} TODO
```

Arabic:
```
/{{SKILL_NAME}} TODO
```
