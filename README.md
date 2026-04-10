# skrr-claude-custom

Minimal single-line statusline plugin for [Claude Code](https://docs.anthropic.com/en/docs/claude-code).

```
[Opus 4.6] │ ███░░░░░ 42% │ dashboard git:(main*) │ 5h 23%(2h) │ 7d 8%(96h)
```

One line. Model, context, project, git, usage. That's it.

- Subscription usage (5h / 7d) is **auto-shown** when rate limits are present
- Non-subscription (API key) users see model + context + project only
- Colors shift green → yellow → red as usage increases

## Install

### Option A: Claude Code Plugin Marketplace (Recommended)

Register the repo as a marketplace source, then install:

```bash
# 1. Add marketplace source to settings
claude settings set extraKnownMarketplaces.skrr-claude-custom.source.source github
claude settings set extraKnownMarketplaces.skrr-claude-custom.source.repo Daybreak312/skrr-claude-custom

# 2. Install plugin
claude /plugin install skrr-claude-custom

# 3. Configure statusline (find your node path first)
NODE_PATH=$(which node)
PLUGIN_DIR="$HOME/.claude/plugins/cache/skrr-claude-custom/skrr-claude-custom"
VERSION=$(ls "$PLUGIN_DIR" | sort -V | tail -1)

# 4. Write statusline config
claude settings set statusLine.type command
claude settings set statusLine.command "$NODE_PATH $PLUGIN_DIR/$VERSION/dist/index.js"
```

Or add this to `~/.claude/settings.json` manually:

```jsonc
{
  // Register marketplace
  "extraKnownMarketplaces": {
    "skrr-claude-custom": {
      "source": { "source": "github", "repo": "Daybreak312/skrr-claude-custom" }
    }
  },
  // Enable plugin
  "enabledPlugins": {
    "skrr-claude-custom@skrr-claude-custom": true
  },
  // Statusline command (adjust path to your node)
  "statusLine": {
    "type": "command",
    "command": "node ~/.claude/plugins/cache/skrr-claude-custom/skrr-claude-custom/<VERSION>/dist/index.js"
  }
}
```

### Option B: Manual Clone

```bash
# 1. Clone
git clone https://github.com/Daybreak312/skrr-claude-custom.git ~/.skrr-claude-custom

# 2. Set statusline in ~/.claude/settings.json
```

```json
{
  "statusLine": {
    "type": "command",
    "command": "node ~/.skrr-claude-custom/dist/index.js"
  }
}
```

### Option C: Build from Source

```bash
git clone https://github.com/Daybreak312/skrr-claude-custom.git
cd skrr-claude-custom
npm install
npm run build
```

Then point `statusLine.command` to the built `dist/index.js`.

## What's Displayed

| Segment | Example | When |
|---------|---------|------|
| Model | `[Opus 4.6]` | Always |
| Context | `███░░░░░ 42%` | Always |
| Project + Git | `dashboard git:(main*)` | Always (git part only in repos) |
| 5h Usage | `5h 23%(2h)` | Subscription only |
| 7d Usage | `7d 8%(96h)` | Subscription only |

### Color Thresholds

| Range | Context Bar | Usage % |
|-------|-------------|---------|
| 0–69% | Green | Blue |
| 50–69% | — | Yellow |
| 70–89% | Yellow | Magenta |
| 90–100% | Red | Red |

## Requirements

- Node.js >= 18 (or Bun)
- Claude Code with statusLine support

## Restart

After changing `settings.json`, **restart Claude Code** for the statusline to take effect.

## License

MIT
