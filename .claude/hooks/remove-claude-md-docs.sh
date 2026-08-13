#!/usr/bin/env bash
# Removes references to deleted /docs/*.md files from the doc list in CLAUDE.md
# under "## Code Generation Guidelines". Triggered by PostToolUse on Bash.

set -euo pipefail

input="$(cat)"
command="$(printf '%s' "$input" | jq -r '.tool_input.command // empty')"

[ -z "$command" ] && exit 0

# Only proceed if the command looks like a deletion/rename touching /docs.
case "$command" in
  *rm*docs/*.md*|*"git rm"*docs/*.md*|*mv*docs/*.md*) ;;
  *) exit 0 ;;
esac

repo_root="$(git rev-parse --show-toplevel 2>/dev/null || pwd)"
claude_md="$repo_root/CLAUDE.md"

[ -f "$claude_md" ] || exit 0

# Extract candidate /docs/*.md paths mentioned in the command.
paths="$(printf '%s' "$command" | grep -oE '([A-Za-z0-9_./-]*/)?docs/[A-Za-z0-9_-]+\.md' || true)"

[ -z "$paths" ] && exit 0

while IFS= read -r p; do
  [ -z "$p" ] && continue
  rel_path="/docs/$(basename "$p")"

  # Only clean up if the file is actually gone from disk.
  if [ -e "$repo_root/docs/$(basename "$p")" ]; then
    continue
  fi

  grep -qF -- "$rel_path" "$claude_md" || continue

  section_line="$(grep -n '^## Code Generation Guidelines' "$claude_md" | head -1 | cut -d: -f1)"
  [ -z "$section_line" ] && continue

  next_heading_line="$(awk -v start="$section_line" 'NR>start && /^##/ {print NR; exit}' "$claude_md")"
  [ -z "$next_heading_line" ] && next_heading_line=$(($(wc -l < "$claude_md") + 1))

  doc_line="$(awk -v start="$section_line" -v end="$next_heading_line" -v target="- ${rel_path}" \
    'NR>start && NR<end && $0==target {print NR; exit}' "$claude_md")"

  if [ -n "$doc_line" ]; then
    sed -i.bak "${doc_line}d" "$claude_md"
    rm -f "$claude_md.bak"
  fi
done <<< "$paths"

exit 0
