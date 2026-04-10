---
name: setup
description: Configure statusline for skrr-claude-custom
user-invocable: true
---

# skrr-claude-custom Setup

You are setting up the skrr-claude-custom statusline plugin. Follow these steps:

## Step 1: Verify plugin is installed

Run this bash command to find the plugin path:

```bash
ls -d "${CLAUDE_CONFIG_DIR:-$HOME/.claude}"/plugins/cache/skrr-claude-custom/skrr-claude-custom/*/ 2>/dev/null | sort -V | tail -1
```

If empty, the plugin is not installed. Ask the user to run `/plugin install skrr-claude-custom` first.

## Step 2: Verify node is available

```bash
command -v node 2>/dev/null
```

If empty, ask the user to install Node.js >= 18.

## Step 3: Test the command

Run this to verify it works:

```bash
bash -c 'p=$(ls -d "${CLAUDE_CONFIG_DIR:-$HOME/.claude}"/plugins/cache/skrr-claude-custom/skrr-claude-custom/*/ 2>/dev/null | sort -V | tail -1); exec node "${p}dist/index.js"'
```

It should output `[skrr-claude-custom] Ready.` or similar.

## Step 4: Write settings

Read `~/.claude/settings.json` (or `${CLAUDE_CONFIG_DIR:-$HOME/.claude}/settings.json`), then merge in the statusLine config while preserving all existing settings:

```json
{
  "statusLine": {
    "type": "command",
    "command": "bash -c 'p=$(ls -d \"${CLAUDE_CONFIG_DIR:-$HOME/.claude}\"/plugins/cache/skrr-claude-custom/skrr-claude-custom/*/ 2>/dev/null | sort -V | tail -1); exec node \"${p}dist/index.js\"'"
  }
}
```

**JSON safety**: Use a proper JSON editor/serializer to write settings.json. Do not use string concatenation.

## Step 5: Done

Tell the user:

> Setup complete. **Restart Claude Code** for the statusline to appear.
