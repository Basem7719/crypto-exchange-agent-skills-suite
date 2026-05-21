# Troubleshooting

Common errors and fixes.

## Install issues

### "Skill not found" / "/skill-name not recognized"
- Check the folder name in `~/.claude/skills/` (or equivalent) matches the `name:` in the SKILL.md frontmatter.
- Restart the runtime after install.
- Verify with `ls ~/.claude/skills | grep <skill-name>`.

### `validate-skills.js` reports missing sections
- Open the offending SKILL.md and confirm all 11 headings are present (`## Purpose`, `## When to Use`, …, `## Example Commands`).
- Case sensitive.

## Binance issues

### `-1021` Timestamp for this request is outside of the recvWindow
- Clock drift. Sync NTP:
  - Linux: `sudo ntpdate -s time.nist.gov` or `sudo systemctl restart systemd-timesyncd`
  - macOS: `sudo sntp -sS time.apple.com`
- Or pass a larger `BINANCE_RECV_WINDOW` (max 60000).

### `-1022` Signature for this request is not valid
- Re-derive the signature: HMAC-SHA256 of the canonical query string with the API secret. Watch for trailing whitespace.
- Re-encode params as URL-encoded UTF-8.
- Confirm the API key is for the right environment (mainnet vs testnet).

### `-2010` Account has insufficient balance
- Reduce `qty` or `notional`. The executor refuses to auto-shrink — that's intentional.

### `-1013` Filter failure
- Re-pull `exchangeInfo` and re-validate tick/lot/min-notional. `exchange-order-planner` does this automatically.

## OKX issues

### `50111` Invalid passphrase
- The passphrase in your `.env` doesn't match the one you set when creating the key. Recreate the key and the passphrase together.

### `51008` Insufficient margin
- Add margin or reduce position size. For futures, the executor's gate #6 (notional cap) and gate #8 (risk-manager verdict) should have caught this — check those.

### `50001` Service unavailable
- Transient. Retry with exponential backoff (skills do this for read endpoints; executor does NOT auto-retry).

## Executor issues

### "Stuck in dry_run"
- That's the default. To go live, pass **both** `dry_run=false` **and** `confirm=CONFIRM` (uppercase exact match).

### "Gate #1 (Credentials scope) failed"
- Your API key has `enableWithdrawals=true`. Create a new key with trade-only (no withdraw) scope.

### "Gate #4 (Spec freshness) failed"
- Order spec is > 5 minutes old. Re-run `exchange-order-planner` to generate a fresh one.

### "Gate #8 (Risk-manager) failed"
- Re-run `crypto-risk-manager` to see which sub-check fired. Common: fees > 25% of risk, R:R < 1.5, leverage cap, daily cap.

## Skill chaining issues

### "Master keeps asking the same clarifying question"
- The skill needs one of `pair`, `exchange`, `market_type`. Provide them explicitly:
  `/crypto-exchange-master "analyze BTC/USDT spot binance"`.

### "Report generator output is incomplete"
- One sub-skill returned an error. Look for `data unavailable` notes in the report. Re-run the failed sub-skill directly to see its error.

## State / file issues

### Watchlist not persisting
- Check `CRYPTO_SKILLS_HOME` env var (default `~/.crypto-skills`). Confirm the path exists and is writable.

### Paper ledger missing
- Same path. Check `~/.crypto-skills/paper-ledger.jsonl`. If absent, the skill was likely run before the path was created — re-run `exchange-paper-trading start ...`.

### Kill-switch fires every time
- A file at `~/.crypto-skills/KILLSWITCH` blocks all executor submissions. Delete it to re-enable:
  `rm ~/.crypto-skills/KILLSWITCH`.

## "I think the skill is wrong about X"

Run it with explicit args; compare to the raw endpoint output. The data skills document their endpoints in the `Exchange-Specific Handling` section — you can hit them directly and verify.

If you find a real bug, open an issue with:
- The exact command
- The raw skill output
- What you expected
- What you saw
