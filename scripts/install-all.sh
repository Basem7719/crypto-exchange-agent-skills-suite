#!/usr/bin/env bash
set -euo pipefail
SUITE_ROOT="$(cd "$(dirname "$0")/.." && pwd)"

prompt_install() {
  local label="$1"
  local target="$2"
  read -rp "Install to $label ($target)? [y/N] " yn
  case "$yn" in
    [Yy]*)
      mkdir -p "$target"
      cp -r "$SUITE_ROOT"/skills/* "$target"/
      echo "  ✓ $label installed."
      ;;
    *)
      echo "  ✗ Skipped $label."
      ;;
  esac
}

echo "==================================================="
echo " crypto-exchange-agent-skills-suite — install-all"
echo "==================================================="
prompt_install "Claude Code" "$HOME/.claude/skills"
prompt_install "OpenClaw"    "$HOME/.openclaw/skills"
prompt_install "Cursor"      "$HOME/.cursor/skills"
prompt_install "Hermes"      "$HOME/.hermes/skills"
echo ""
echo "Done. To verify:"
echo "  ls \$HOME/.claude/skills | wc -l   # expect 21"
