#!/bin/bash
# Extracts the edited file path from CLAUDE_TOOL_INPUT and runs Prettier on it.
# Always exits 0 so it never blocks the tool call.
FILE=$(node -e "
  const i = JSON.parse(process.env.CLAUDE_TOOL_INPUT || '{}');
  process.stdout.write(i.file_path || i.notebook_path || '');
")
[ -n "$FILE" ] && ./node_modules/.bin/prettier --write --ignore-unknown "$FILE" 2>/dev/null
exit 0
