# INSTALL — Detailed Installation Guide

Complete install instructions for **crypto-exchange-agent-skills-suite** on every supported runtime.

---

## Prerequisites

| Item | Required? | Notes |
|------|-----------|-------|
| OS | Linux / macOS / Windows (WSL) | All three tested |
| Node.js ≥ 18 | optional | needed only if you run the scripts/ helpers |
| Python ≥ 3.10 | optional | needed only for some examples that use Python |
| Binance / OKX API keys | optional | only for account-level skills; never use withdraw scope |
| Disk space | < 5 MB | the suite is mostly markdown |

---

## 1. Claude Code

```bash
# Clone or unzip the suite
cd crypto-exchange-agent-skills-suite

# One-liner
bash scripts/install-claude.sh

# Manual equivalent
mkdir -p ~/.claude/skills
cp -r skills/* ~/.claude/skills/
```

Verify:

```bash
ls ~/.claude/skills | grep -c -E '^(crypto-|binance-|okx-|exchange-|strategy-)'
# Expected: 21
```

Restart Claude Code and run `/crypto-exchange-master --help`.

---

## 2. OpenClaw

```bash
bash scripts/install-openclaw.sh

# OR manual
mkdir -p ~/.openclaw/skills
cp -r skills/* ~/.openclaw/skills/
```

Refresh OpenClaw's skill index (if the runtime requires it):

```bash
openclaw skills reload
```

---

## 3. Cursor

### Project-local (recommended for repo-specific use)
```bash
cd /your/project
mkdir -p .cursor/skills
cp -r /path/to/crypto-exchange-agent-skills-suite/skills/* .cursor/skills/
```

### User-global
```bash
mkdir -p ~/.cursor/skills
cp -r skills/* ~/.cursor/skills/
```

---

## 4. Hermes

```bash
# Find Hermes skill path
hermes config get skills_path
# example output: /home/user/.hermes/skills

# Install there
mkdir -p $(hermes config get skills_path)
cp -r skills/* $(hermes config get skills_path)/

# Or default
mkdir -p ~/.hermes/skills
cp -r skills/* ~/.hermes/skills/
```

---

## 5. All at Once

```bash
bash scripts/install-all.sh
```

This prompts you for each runtime and installs to the ones you accept.

---

## 6. API Credentials (optional)

```bash
cp .env.example .env
# Edit .env and add your keys
```

Critical safety rule:

> **NEVER enable `withdraw` permission on API keys used by an AI agent.**
> `exchange-account-review` will refuse to run if it detects withdraw permission.

For OKX, you need three values: `OKX_API_KEY`, `OKX_API_SECRET`, `OKX_API_PASSPHRASE`.

---

## 7. Optional CLI Helpers

Some users prefer the agent to call a CLI rather than direct REST. Two community CLIs work well:

```bash
npm install -g @binance/binance-cli
npm install -g @okx_ai/okx-trade-cli
```

These are not required; all skill workflows describe REST endpoints natively.

---

## 8. Verification

Run the validation script:

```bash
node scripts/validate-skills.js
```

Expected output:

```
21 skills checked.
All required files present:    ✓
All frontmatter valid:         ✓
All 11 sections present:       ✓
skills.json consistent:        ✓
```

Then try a no-credentials command:

```
/binance-market-scan BTC/USDT
```

If the agent recognizes the slash command and runs the skill, you're done.

---

## 9. Updating

```bash
git pull   # or re-unzip a new release
bash scripts/install-all.sh   # re-copies to all runtimes
```

---

## 10. Uninstalling

```bash
# Claude Code
rm -rf ~/.claude/skills/crypto-* ~/.claude/skills/binance-* ~/.claude/skills/okx-* ~/.claude/skills/exchange-* ~/.claude/skills/strategy-*

# OpenClaw
rm -rf ~/.openclaw/skills/crypto-* ~/.openclaw/skills/binance-* ~/.openclaw/skills/okx-* ~/.openclaw/skills/exchange-* ~/.openclaw/skills/strategy-*

# Cursor / Hermes — same pattern in the matching skills folder
```

---

## 11. Troubleshooting

See [docs/troubleshooting.md](docs/troubleshooting.md).

| Problem | Fix |
|---------|-----|
| Skills not discovered | Confirm folder name matches `name:` in frontmatter |
| `validate-skills.js` fails | Re-clone; manual edits often break frontmatter |
| Binance `-1021` | Sync system clock (NTP) |
| OKX `50111` | Wrong passphrase, or wrong account on a sub-account key |
| Executor stays in dry_run | That's the default. Pass `dry_run=false` AND `confirm=CONFIRM` |
