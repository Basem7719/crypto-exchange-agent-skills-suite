# crypto-report-generator — examples

> Full orchestrated research report

---

## English

```
/crypto-report-generator pair=BTC/USDT exchange=binance market=spot timeframe=1h capital=5000
```

```
/crypto-report-generator pair=ETH/USDT exchange=okx market=swap include_pdf=true
```

---

## العربية

```
/crypto-report-generator تقرير كامل عن BTC
```

```
/crypto-report-generator حلل ETH كامل وحوله PDF
```

---

## Notes

- All commands above assume the suite is installed under `~/.claude/skills/` (Claude Code) or the equivalent path for OpenClaw / Cursor / Hermes. See [`../../INSTALL.md`](../../INSTALL.md).
- For the full input/output details, see [`SKILL.md`](./SKILL.md).
- For a typical multi-skill flow that uses this skill, see [`../../workflows/`](../../workflows/).
