# skrr-claude-custom

Minimal single-line statusline plugin for [Claude Code](https://docs.anthropic.com/en/docs/claude-code).

```
[Opus 4.6] │ Ctx ███░░░░░ 42% │ ~/projects/dashboard git:(main*) │ Usage │ ███░░░░░░░░░ 23% (per 5h, resets in 2h) │ █░░░░░░░░░░░ 8% (per 7d, resets in 4d 23h)
```

One line. Model, context, project, git, usage. That's it.

- Subscription usage (5h / 7d) is **auto-shown** when rate limits are present
- Non-subscription (API key) users see model + context + project only
- Colors shift green → yellow → red as usage increases

## Install

### Option A: Plugin Marketplace (Recommended)

Run the following commands **inside Claude Code**:

**Step 1: Add the marketplace**
```
/plugin marketplace add Daybreak312/skrr-claude-custom
```

**Step 2: Install the plugin**
```
/plugin install skrr-claude-custom
```

**Step 3: Reload plugins**
```
/reload-plugins
```

**Step 4: Configure the statusline**
```
/skrr-claude-custom:setup
```

Or manually edit `~/.claude/settings.json`:

```json
{
  "statusLine": {
    "type": "command",
    "command": "bash -c 'p=$(ls -d \"${CLAUDE_CONFIG_DIR:-$HOME/.claude}\"/plugins/cache/skrr-claude-custom/skrr-claude-custom/*/ 2>/dev/null | sort -V | tail -1); exec node \"${p}dist/index.js\"'"
  }
}
```

This command is **portable** — it dynamically finds the plugin path and uses `node` from PATH. Works on any machine without editing paths.

**Step 5: Restart Claude Code**

Quit and reopen Claude Code for the statusline to appear.

### Option B: Manual Clone

```bash
git clone https://github.com/Daybreak312/skrr-claude-custom.git ~/.skrr-claude-custom
```

Then edit `~/.claude/settings.json`:

```json
{
  "statusLine": {
    "type": "command",
    "command": "node ~/.skrr-claude-custom/dist/index.js"
  }
}
```

Restart Claude Code.

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
| Context | `Ctx ███░░░░░ 42%` | Always |
| Project + Git | `~/projects/app git:(main*)` | Always (git part only in repos) |
| Usage | `Usage` | Subscription only |
| 5h Usage | `███░░░░░░░░░ 23% (per 5h, resets in 2h)` | Subscription only |
| 7d Usage | `█░░░░░░░░░░░ 8% (per 7d, resets in 4d 23h)` | Subscription only |

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

## License

MIT
