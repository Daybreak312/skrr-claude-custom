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

After the plugin is installed, set up the statusline command. Run this **inside Claude Code**:

```
Tell Claude: "Set my statusLine to use skrr-claude-custom plugin"
```

Or manually edit `~/.claude/settings.json`:

```json
{
  "statusLine": {
    "type": "command",
    "command": "node ~/.claude/plugins/cache/skrr-claude-custom/skrr-claude-custom/<VERSION>/dist/index.js"
  }
}
```

Replace `<VERSION>` with the installed version (e.g. `0.0.1`).

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

## License

MIT
