# exchange-trading-executor — examples

> Live submit (gated)

---

## English

```
/exchange-trading-executor spec=last_plan dry_run=true
```

```
/exchange-trading-executor spec=last_plan dry_run=false confirm=CONFIRM
```

---

## العربية

```
/exchange-trading-executor نفذ بـ dry_run أولاً
```

```
/exchange-trading-executor نفذ مباشرة بـ CONFIRM
```

---

## Notes

- All commands above assume the suite is installed under `~/.claude/skills/` (Claude Code) or the equivalent path for OpenClaw / Cursor / Hermes. See [`../../INSTALL.md`](../../INSTALL.md).
- For the full input/output details, see [`SKILL.md`](./SKILL.md).
- For a typical multi-skill flow that uses this skill, see [`../../workflows/`](../../workflows/).
