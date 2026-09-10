import { load } from '@/lib/storage';
import { remainingFor, usePacks, type NewPackInput } from '@/store/usePacks';

function addTestPack(overrides: Partial<NewPackInput> = {}) {
  return usePacks.getState().addPack({
    name: 'Coworking',
    totalSessions: 3,
    startDate: '2026-01-01',
    accent: 'teal',
    ...overrides,
  });
}

describe('usePacks store', () => {
  it('adds a pack with 0 sessions used', () => {
    const pack = addTestPack();
    expect(usePacks.getState().packs).toHaveLength(1);
    expect(remainingFor(pack, usePacks.getState().sessions)).toBe(3);
  });

  it('checkIn decrements the remaining count', () => {
    const pack = addTestPack();
    usePacks.getState().checkIn(pack.id);
    expect(remainingFor(pack, usePacks.getState().sessions)).toBe(2);
  });

  it('checkIn does nothing once the pack is at zero remaining', () => {
    const pack = addTestPack({ totalSessions: 1 });
    const first = usePacks.getState().checkIn(pack.id);
    const second = usePacks.getState().checkIn(pack.id);
    expect(first).not.toBeNull();
    expect(second).toBeNull();
    expect(remainingFor(pack, usePacks.getState().sessions)).toBe(0);
  });

  it('undoSession restores a used session', () => {
    const pack = addTestPack();
    const entry = usePacks.getState().checkIn(pack.id)!;
    usePacks.getState().undoSession(entry.id);
    expect(remainingFor(pack, usePacks.getState().sessions)).toBe(3);
  });

  it('deletePack cascades to its session entries', () => {
    const packA = addTestPack({ name: 'A' });
    const packB = addTestPack({ name: 'B' });
    usePacks.getState().checkIn(packA.id);
    usePacks.getState().checkIn(packB.id);

    usePacks.getState().deletePack(packA.id);

    const { packs, sessions } = usePacks.getState();
    expect(packs.map((p) => p.id)).toEqual([packB.id]);
    expect(sessions.every((s) => s.packId === packB.id)).toBe(true);
  });

  it('updatePack rejects a totalSessions below the number already used', () => {
    const pack = addTestPack({ totalSessions: 2 });
    usePacks.getState().checkIn(pack.id);
    usePacks.getState().checkIn(pack.id);

    expect(() => usePacks.getState().updatePack(pack.id, { totalSessions: 1 })).toThrow();
    expect(usePacks.getState().packs[0].totalSessions).toBe(2);
  });

  it('updatePack allows setting totalSessions to exactly the number used', () => {
    const pack = addTestPack({ totalSessions: 3 });
    usePacks.getState().checkIn(pack.id);
    usePacks.getState().updatePack(pack.id, { totalSessions: 1 });
    expect(usePacks.getState().packs[0].totalSessions).toBe(1);
  });

  it('archivePack marks a pack archived without touching its sessions', () => {
    const pack = addTestPack();
    usePacks.getState().checkIn(pack.id);
    usePacks.getState().archivePack(pack.id);
    expect(usePacks.getState().packs[0].archived).toBe(true);
    expect(usePacks.getState().sessions).toHaveLength(1);
  });

  it('persists mutations and hydrate reads them back', async () => {
    const pack = addTestPack();
    usePacks.getState().checkIn(pack.id);

    const persisted = await load();
    expect(persisted.packs).toHaveLength(1);
    expect(persisted.sessions).toHaveLength(1);

    usePacks.setState({ packs: [], sessions: [], hydrated: false });
    await usePacks.getState().hydrate();

    expect(usePacks.getState().packs).toHaveLength(1);
    expect(usePacks.getState().sessions).toHaveLength(1);
    expect(usePacks.getState().hydrated).toBe(true);
  });
});
