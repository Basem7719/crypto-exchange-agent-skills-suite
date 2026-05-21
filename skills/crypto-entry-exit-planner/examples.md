# crypto-entry-exit-planner — examples

> Entry zone TP ladder stop

---

## English

```
/crypto-entry-exit-planner pair=BTC/USDT exchange=binance timeframe=1h
```

```
/crypto-entry-exit-planner pair=SOL/USDT exchange=okx market=swap
```

---

## العربية

```
/crypto-entry-exit-planner خطة دخول وخروج BTC
```

```
/crypto-entry-exit-planner خطة لـ SOL futures
```

---

## Notes

- All commands above assume the suite is installed under `~/.claude/skills/` (Claude Code) or the equivalent path for OpenClaw / Cursor / Hermes. See [`../../INSTALL.md`](../../INSTALL.md).
- For the full input/output details, see [`SKILL.md`](./SKILL.md).
- For a typical multi-skill flow that uses this skill, see [`../../workflows/`](../../workflows/).
