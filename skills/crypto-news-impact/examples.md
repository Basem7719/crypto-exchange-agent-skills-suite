# crypto-news-impact — examples

> Estimate price impact of an event

---

## English

```
/crypto-news-impact headline="SEC approves spot ETH ETF" pair=ETH/USDT exchange=binance
```

```
/crypto-news-impact url=https://... pair=BTC/USDT exchange=okx
```

---

## العربية

```
/crypto-news-impact كيف يؤثر خبر الفائدة على BTC
```

```
/crypto-news-impact أثر إدراج XYZ على Binance
```

---

## Notes

- All commands above assume the suite is installed under `~/.claude/skills/` (Claude Code) or the equivalent path for OpenClaw / Cursor / Hermes. See [`../../INSTALL.md`](../../INSTALL.md).
- For the full input/output details, see [`SKILL.md`](./SKILL.md).
- For a typical multi-skill flow that uses this skill, see [`../../workflows/`](../../workflows/).
