# Skill Loading Checklist

A pre-flight check to confirm the suite is installed correctly.

## Test
| Field | Value |
|------|-------|
| Name | skill-loading-checklist |
| Goal | Confirm all 21 skills are discoverable by the runtime |
| Command | `ls ~/.claude/skills | grep -cE '^(crypto-|binance-|okx-|exchange-|strategy-)'` |
| Expected output | `21` |

## Per-skill smoke test
For each of the 21 skills, the runtime should recognize the slash command:
```
/<skill-name> --help        # or any harmless invocation
```

Skills to verify:
1. crypto-exchange-master
2. exchange-pair-finder
3. binance-market-scan
4. okx-market-scan
5. crypto-spot-analysis
6. crypto-futures-analysis
7. crypto-technical-analysis
8. exchange-liquidity-depth
9. crypto-risk-manager
10. crypto-entry-exit-planner
11. exchange-order-planner
12. exchange-trading-executor
13. exchange-account-review
14. crypto-watchlist-manager
15. crypto-compare-pairs
16. crypto-sentiment-scan
17. crypto-news-impact
18. exchange-paper-trading
19. strategy-backtest-planner
20. crypto-report-generator
21. crypto-skill-builder

## Success criterion
Every skill name resolves to a known SKILL.md with valid frontmatter.

## Failure modes
- Folder name doesn't match `name:` in frontmatter → skill not discovered.
- Missing `SKILL.md` inside folder → runtime ignores.
- Broken YAML frontmatter (unquoted special chars) → parser fails.

## Validation script
```bash
node scripts/validate-skills.js
```

Expected:
```
21 skills checked.
PASS: 21   FAIL: 0
```
