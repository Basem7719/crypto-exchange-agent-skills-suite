# crypto-risk-manager — examples

> Position sizing and GO/NO-GO

---

## English

```
/crypto-risk-manager pair=BTC/USDT exchange=binance capital=5000 risk_pct=1
```

```
/crypto-risk-manager pair=ETH/USDT exchange=okx market=swap capital=1000 leverage=5
```

---

## العربية

```
/crypto-risk-manager احسب حجم المركز على BTC براس مال 5000
```

```
/crypto-risk-manager ETH على OKX بـ 5x
```

---

## Notes

- All commands above assume the suite is installed under `~/.claude/skills/` (Claude Code) or the equivalent path for OpenClaw / Cursor / Hermes. See [`../../INSTALL.md`](../../INSTALL.md).
- For the full input/output details, see [`SKILL.md`](./SKILL.md).
- For a typical multi-skill flow that uses this skill, see [`../../workflows/`](../../workflows/).
