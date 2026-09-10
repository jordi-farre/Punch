import AsyncStorage from '@react-native-async-storage/async-storage';

import { load, save, STORAGE_KEY_FOR_TESTS } from '@/lib/storage';
import { EMPTY_STATE, type PersistedState } from '@/lib/types';

describe('storage', () => {
  it('returns an empty state when nothing has been saved', async () => {
    expect(await load()).toEqual(EMPTY_STATE);
  });

  it('returns an empty state for corrupt JSON rather than throwing', async () => {
    await AsyncStorage.setItem(STORAGE_KEY_FOR_TESTS, '{not valid json');
    await expect(load()).resolves.toEqual(EMPTY_STATE);
  });

  it('returns an empty state for a value that is not a PersistedState shape', async () => {
    await AsyncStorage.setItem(STORAGE_KEY_FOR_TESTS, JSON.stringify({ foo: 'bar' }));
    await expect(load()).resolves.toEqual(EMPTY_STATE);
  });

  it('round-trips a real state through save and load', async () => {
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
    await save(state);
    expect(await load()).toEqual(state);
  });
});
