#!/usr/bin/env bash
# Appends newly created /docs/*.md files to the doc list in CLAUDE.md
# under "## Code Generation Guidelines". Triggered by PostToolUse on Write.

set -euo pipefail

input="$(cat)"
file_path="$(printf '%s' "$input" | jq -r '.tool_input.file_path // empty')"

[ -z "$file_path" ] && exit 0

case "$file_path" in
  */docs/*.md) ;;
  *) exit 0 ;;
esac

repo_root="$(git -C "$(dirname "$file_path")" rev-parse --show-toplevel 2>/dev/null || pwd)"
claude_md="$repo_root/CLAUDE.md"

[ -f "$claude_md" ] || exit 0

rel_path="/docs/$(basename "$file_path")"

grep -qF -- "$rel_path" "$claude_md" && exit 0

section_line="$(grep -n '^## Code Generation Guidelines' "$claude_md" | head -1 | cut -d: -f1)"
[ -z "$section_line" ] && exit 0

# Find the last "- /docs/..." line at or after the section header, before the next "##" heading.
next_heading_line="$(awk -v start="$section_line" 'NR>start && /^##/ {print NR; exit}' "$claude_md")"
[ -z "$next_heading_line" ] && next_heading_line=$(($(wc -l < "$claude_md") + 1))

last_doc_line="$(awk -v start="$section_line" -v end="$next_heading_line" 'NR>start && NR<end && /^-[ ]\/docs\// {l=NR} END{print l+0}' "$claude_md")"

if [ "$last_doc_line" -gt 0 ]; then
  insert_at="$last_doc_line"
else
  insert_at="$section_line"
fi

sed -i.bak "${insert_at}a\\
- ${rel_path}
" "$claude_md"
rm -f "$claude_md.bak"

exit 0
