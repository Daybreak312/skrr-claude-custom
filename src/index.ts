import { execSync } from 'node:child_process';

// ─── Types ───────────────────────────────────────────────────────────

interface StdinData {
  cwd?: string;
  model?: { id?: string; display_name?: string };
  context_window?: {
    context_window_size?: number;
    used_percentage?: number | null;
    current_usage?: {
      input_tokens?: number;
      output_tokens?: number;
      cache_creation_input_tokens?: number;
      cache_read_input_tokens?: number;
    } | null;
  };
  rate_limits?: {
    five_hour?: { used_percentage?: number | null; resets_at?: number | null } | null;
    seven_day?: { used_percentage?: number | null; resets_at?: number | null } | null;
  } | null;
  transcript_path?: string;
}

// ─── ANSI Colors ─────────────────────────────────────────────────────

const RESET = '\x1b[0m';
const DIM = '\x1b[2m';
const CYAN = '\x1b[36m';
const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';
const RED = '\x1b[31m';
const MAGENTA = '\x1b[35m';
const BLUE = '\x1b[34m';
const BRIGHT_BLUE = '\x1b[94m';
const BRIGHT_MAGENTA = '\x1b[95m';

// ─── Stdin Reader ────────────────────────────────────────────────────

function readStdin(): Promise<StdinData | null> {
  if (process.stdin.isTTY) return Promise.resolve(null);

  return new Promise((resolve) => {
    let raw = '';
    let settled = false;
    let firstByteTimer: ReturnType<typeof setTimeout> | undefined;
    let idleTimer: ReturnType<typeof setTimeout> | undefined;

    const finish = (value: StdinData | null): void => {
      if (settled) return;
      settled = true;
      clearTimeout(firstByteTimer);
      clearTimeout(idleTimer);
      process.stdin.off('data', onData);
      process.stdin.off('end', onEnd);
      process.stdin.pause();
      resolve(value);
    };

    const tryParse = (): StdinData | null | undefined => {
      const trimmed = raw.trim();
      if (!trimmed) return null;
      try { return JSON.parse(trimmed) as StdinData; }
      catch { return undefined; }
    };

    const onData = (chunk: string | Buffer): void => {
      clearTimeout(firstByteTimer);
      raw += String(chunk);
      if (raw.length > 256 * 1024) { finish(null); return; }
      const parsed = tryParse();
      if (parsed !== undefined) { finish(parsed); return; }
      clearTimeout(idleTimer);
      idleTimer = setTimeout(() => finish(tryParse() ?? null), 30);
    };

    const onEnd = (): void => finish(tryParse() ?? null);

    firstByteTimer = setTimeout(() => { if (!raw) finish(null); }, 250);

    process.stdin.setEncoding('utf8');
    process.stdin.on('data', onData);
    process.stdin.on('end', onEnd);
    process.stdin.on('error', () => finish(null));
  });
}

// ─── Data Extractors ─────────────────────────────────────────────────

function getModelLabel(stdin: StdinData): string {
  const name = stdin.model?.display_name?.trim();
  if (!name) return stdin.model?.id ?? '?';
  // Strip context suffix: "Opus 4.6 (1M context)" → "Opus 4.6"
  return name.replace(/\s*\([^)]*\bcontext\b[^)]*\)/i, '').trim();
}

function getContextPercent(stdin: StdinData): number {
  const native = stdin.context_window?.used_percentage;
  if (typeof native === 'number' && !Number.isNaN(native)) {
    return Math.min(100, Math.max(0, Math.round(native)));
  }
  const size = stdin.context_window?.context_window_size;
  if (!size || size <= 0) return 0;
  const usage = stdin.context_window?.current_usage;
  const total = (usage?.input_tokens ?? 0)
    + (usage?.cache_creation_input_tokens ?? 0)
    + (usage?.cache_read_input_tokens ?? 0);
  return Math.min(100, Math.round((total / size) * 100));
}

function getProjectName(cwd?: string): string {
  if (!cwd) return '';
  const segments = cwd.split(/[/\\]/).filter(Boolean);
  return segments.length > 0 ? segments[segments.length - 1] : '/';
}

function getGitBranch(cwd?: string): string | null {
  if (!cwd) return null;
  try {
    const branch = execSync('git rev-parse --abbrev-ref HEAD', {
      cwd, encoding: 'utf8', timeout: 500,
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim();
    return branch || null;
  } catch { return null; }
}

function isGitDirty(cwd?: string): boolean {
  if (!cwd) return false;
  try {
    const status = execSync('git status --porcelain -uno', {
      cwd, encoding: 'utf8', timeout: 500,
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim();
    return status.length > 0;
  } catch { return false; }
}

function parsePercent(value: number | null | undefined): number | null {
  if (typeof value !== 'number' || !Number.isFinite(value)) return null;
  return Math.round(Math.min(100, Math.max(0, value)));
}

function formatResetTime(resetAt: number | null | undefined): string {
  if (typeof resetAt !== 'number' || resetAt <= 0) return '';
  const diffMs = resetAt * 1000 - Date.now();
  if (diffMs <= 0) return '';
  const mins = Math.ceil(diffMs / 60000);
  if (mins < 60) return `${mins}m`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m > 0 ? `${h}h${m}m` : `${h}h`;
}

// ─── Bar Renderers ───────────────────────────────────────────────────

function contextBar(percent: number, width: number): string {
  const filled = Math.round((percent / 100) * width);
  const empty = width - filled;
  const color = percent >= 90 ? RED : percent >= 70 ? YELLOW : GREEN;
  return `${color}${'█'.repeat(filled)}${DIM}${'░'.repeat(empty)}${RESET}`;
}

function usageColor(percent: number): string {
  if (percent >= 90) return RED;
  if (percent >= 70) return BRIGHT_MAGENTA;
  if (percent >= 50) return YELLOW;
  return BRIGHT_BLUE;
}

// ─── Render ──────────────────────────────────────────────────────────

function render(stdin: StdinData): void {
  const parts: string[] = [];

  // [Model]
  const model = getModelLabel(stdin);
  parts.push(`${CYAN}[${model}]${RESET}`);

  // Context bar + percent
  const percent = getContextPercent(stdin);
  const bar = contextBar(percent, 8);
  const pColor = percent >= 90 ? RED : percent >= 70 ? YELLOW : GREEN;
  parts.push(`${bar} ${pColor}${percent}%${RESET}`);

  // Project + git
  const project = getProjectName(stdin.cwd);
  if (project) {
    const branch = getGitBranch(stdin.cwd);
    if (branch) {
      const dirty = isGitDirty(stdin.cwd) ? '*' : '';
      parts.push(`${YELLOW}${project}${RESET} ${MAGENTA}git:(${CYAN}${branch}${dirty}${MAGENTA})${RESET}`);
    } else {
      parts.push(`${YELLOW}${project}${RESET}`);
    }
  }

  // Usage — only shown when rate_limits exist (= subscription)
  const rateLimits = stdin.rate_limits;
  if (rateLimits) {
    const fiveHour = parsePercent(rateLimits.five_hour?.used_percentage);
    const sevenDay = parsePercent(rateLimits.seven_day?.used_percentage);

    if (fiveHour !== null) {
      const reset = formatResetTime(rateLimits.five_hour?.resets_at);
      const resetStr = reset ? `${DIM}(${reset})${RESET}` : '';
      parts.push(`${DIM}5h${RESET} ${usageColor(fiveHour)}${fiveHour}%${RESET}${resetStr}`);
    }

    if (sevenDay !== null) {
      const reset = formatResetTime(rateLimits.seven_day?.resets_at);
      const resetStr = reset ? `${DIM}(${reset})${RESET}` : '';
      parts.push(`${DIM}7d${RESET} ${usageColor(sevenDay)}${sevenDay}%${RESET}${resetStr}`);
    }
  }

  console.log(parts.join(`${DIM} │ ${RESET}`));
}

// ─── Main ────────────────────────────────────────────────────────────

async function main(): Promise<void> {
  const stdin = await readStdin();
  if (!stdin) {
    console.log('[skrr-claude-custom] Ready.');
    return;
  }
  render(stdin);
}

main().catch((err) => {
  console.log(`[skrr-claude-custom] Error: ${err instanceof Error ? err.message : 'Unknown'}`);
});
