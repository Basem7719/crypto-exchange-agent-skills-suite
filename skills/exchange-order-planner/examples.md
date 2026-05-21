# exchange-order-planner — examples

> Draft order specs (no submit)

---

## English

```
/exchange-order-planner pair=BTC/USDT exchange=binance market=spot order_type=limit qty=0.01 price=64250
```

```
/exchange-order-planner pair=ETH/USDT exchange=okx market=swap order_type=oco
```

---

## العربية

```
/exchange-order-planner جهز أمر limit على BTC
```

```
/exchange-order-planner OCO على ETH
```

---

## Notes

- All commands above assume the suite is installed under `~/.claude/skills/` (Claude Code) or the equivalent path for OpenClaw / Cursor / Hermes. See [`../../INSTALL.md`](../../INSTALL.md).
- For the full input/output details, see [`SKILL.md`](./SKILL.md).
- For a typical multi-skill flow that uses this skill, see [`../../workflows/`](../../workflows/).
