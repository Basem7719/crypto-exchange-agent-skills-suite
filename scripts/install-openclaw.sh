#!/usr/bin/env bash
set -euo pipefail
SUITE_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
TARGET="${OPENCLAW_SKILLS_PATH:-$HOME/.openclaw/skills}"
echo "[install-openclaw] Copying skills from $SUITE_ROOT/skills to $TARGET"
mkdir -p "$TARGET"
cp -r "$SUITE_ROOT"/skills/* "$TARGET"/
echo "[install-openclaw] ✓ installed $(ls "$TARGET" | wc -l) entries"
echo "[install-openclaw] You may need to run: openclaw skills reload"
