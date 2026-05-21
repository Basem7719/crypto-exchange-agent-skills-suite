# strategy-backtest-planner — examples

> Design a rigorous backtest

---

## English

```
/strategy-backtest-planner "EMA20/50 cross with RSI filter" pair=BTC/USDT exchange=binance market=usdm timeframe=1h
```

```
/strategy-backtest-planner "funding fade" universe=top-20-perp exchange=binance
```

---

## العربية

```
/strategy-backtest-planner صمم backtest لتقاطع المتوسطات
```

```
/strategy-backtest-planner خطة اختبار لاستراتيجية funding
```

---

## Notes

- All commands above assume the suite is installed under `~/.claude/skills/` (Claude Code) or the equivalent path for OpenClaw / Cursor / Hermes. See [`../../INSTALL.md`](../../INSTALL.md).
- For the full input/output details, see [`SKILL.md`](./SKILL.md).
- For a typical multi-skill flow that uses this skill, see [`../../workflows/`](../../workflows/).
