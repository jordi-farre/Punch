import { parseBackup, serializeBackup } from '@/lib/backup';
import type { PersistedState } from '@/lib/types';

const state: PersistedState = {
  version: 1,
  packs: [
    {
      id: 'p1',
      name: 'Coworking',
      totalSessions: 24,
      startDate: '2026-01-01',
      expiryDate: '2026-06-01',
      accent: 'teal',
      archived: false,
      createdAt: '2026-01-01T00:00:00.000Z',
    },
  ],
  sessions: [{ id: 's1', packId: 'p1', usedAt: '2026-01-02T09:00:00.000Z' }],
};

describe('backup', () => {
  it('round-trips a state through serialize and parse', () => {
    expect(parseBackup(serializeBackup(state))).toEqual(state);
  });

  it('accepts an empty state', () => {
    const empty: PersistedState = { version: 1, packs: [], sessions: [] };
    expect(parseBackup(serializeBackup(empty))).toEqual(empty);
  });

  it('rejects text that is not JSON', () => {
    expect(parseBackup('not json')).toBeNull();
  });

  it('rejects JSON that is not an object', () => {
    expect(parseBackup('[]')).toBeNull();
    expect(parseBackup('null')).toBeNull();
  });

  it('rejects an unknown version', () => {
    expect(parseBackup(JSON.stringify({ ...state, version: 2 }))).toBeNull();
  });

  it('rejects a pack with a missing field', () => {
    const { name: _name, ...incomplete } = state.packs[0];
    expect(parseBackup(JSON.stringify({ ...state, packs: [incomplete] }))).toBeNull();
  });

  it('rejects a pack with a non-positive total', () => {
    expect(parseBackup(JSON.stringify({ ...state, packs: [{ ...state.packs[0], totalSessions: 0 }] }))).toBeNull();
  });

  it('rejects a session that belongs to no pack', () => {
    const orphan = { id: 's2', packId: 'missing', usedAt: '2026-01-03T00:00:00.000Z' };
    expect(parseBackup(JSON.stringify({ ...state, sessions: [orphan] }))).toBeNull();
  });

  it('rejects duplicate pack ids', () => {
    expect(parseBackup(JSON.stringify({ ...state, packs: [state.packs[0], state.packs[0]] }))).toBeNull();
  });
});
