import type { Pack, PersistedState, SessionEntry } from '@/lib/types';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isPack(value: unknown): value is Pack {
  if (!isRecord(value)) return false;
  return (
    typeof value.id === 'string' &&
    typeof value.name === 'string' &&
    typeof value.totalSessions === 'number' &&
    Number.isInteger(value.totalSessions) &&
    value.totalSessions >= 1 &&
    typeof value.startDate === 'string' &&
    (value.expiryDate === undefined || typeof value.expiryDate === 'string') &&
    typeof value.accent === 'string' &&
    typeof value.archived === 'boolean' &&
    typeof value.createdAt === 'string'
  );
}

function isSession(value: unknown): value is SessionEntry {
  if (!isRecord(value)) return false;
  return (
    typeof value.id === 'string' && typeof value.packId === 'string' && typeof value.usedAt === 'string'
  );
}

export function serializeBackup(state: PersistedState): string {
  return JSON.stringify({ version: state.version, packs: state.packs, sessions: state.sessions }, null, 2);
}

export function parseBackup(text: string): PersistedState | null {
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    return null;
  }
  if (!isRecord(parsed) || parsed.version !== 1) return null;
  if (!Array.isArray(parsed.packs) || !Array.isArray(parsed.sessions)) return null;
  if (!parsed.packs.every(isPack) || !parsed.sessions.every(isSession)) return null;

  const packs: Pack[] = parsed.packs;
  const sessions: SessionEntry[] = parsed.sessions;
  const packIds = new Set(packs.map((pack) => pack.id));
  if (packIds.size !== packs.length) return null;
  if (!sessions.every((entry) => packIds.has(entry.packId))) return null;

  return { version: 1, packs, sessions };
}
