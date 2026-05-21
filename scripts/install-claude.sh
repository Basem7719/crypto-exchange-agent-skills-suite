#!/usr/bin/env bash
set -euo pipefail
SUITE_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
TARGET="${CLAUDE_SKILLS_PATH:-$HOME/.claude/skills}"
echo "[install-claude] Copying skills from $SUITE_ROOT/skills to $TARGET"
mkdir -p "$TARGET"
cp -r "$SUITE_ROOT"/skills/* "$TARGET"/
echo "[install-claude] ✓ installed $(ls "$TARGET" | wc -l) entries"
echo "[install-claude] Restart Claude Code, then try:  /binance-market-scan BTC/USDT"
