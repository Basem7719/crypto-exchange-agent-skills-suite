# crypto-sentiment-scan — examples

> Market mood from funding/OI/LSR

---

## English

```
/crypto-sentiment-scan pair=BTC/USDT exchange=binance market=usdm
```

```
/crypto-sentiment-scan pair=SOL/USDT exchange=okx market=swap window=7d
```

---

## العربية

```
/crypto-sentiment-scan ما هو شعور السوق على BTC
```

```
/crypto-sentiment-scan هل التداول مزدحم على SOL
```

---

## Notes

- All commands above assume the suite is installed under `~/.claude/skills/` (Claude Code) or the equivalent path for OpenClaw / Cursor / Hermes. See [`../../INSTALL.md`](../../INSTALL.md).
- For the full input/output details, see [`SKILL.md`](./SKILL.md).
- For a typical multi-skill flow that uses this skill, see [`../../workflows/`](../../workflows/).
