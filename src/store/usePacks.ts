import { create } from 'zustand';
import { useShallow } from 'zustand/react/shallow';

import { makeId } from '@/lib/id';
import { cancelRemindersForPack, syncRemindersForPack } from '@/lib/notifications';
import { load, save } from '@/lib/storage';
import type { Pack, SessionEntry } from '@/lib/types';
import type { AccentKey } from '@/theme/tokens';

export type NewPackInput = {
  name: string;
  totalSessions: number;
  startDate: string;
  expiryDate?: string;
  accent: AccentKey;
};

export type PackPatch = Partial<Omit<Pack, 'id' | 'createdAt' | 'archived'>>;

type PacksState = {
  packs: Pack[];
  sessions: SessionEntry[];
  hydrated: boolean;
  hydrate: () => Promise<void>;
  addPack: (input: NewPackInput) => Pack;
  updatePack: (id: string, patch: PackPatch) => void;
  archivePack: (id: string, archived?: boolean) => void;
  deletePack: (id: string) => void;
  /** Records a check-in for the pack. Returns the created entry, or `null` if the pack has no
   * sessions remaining. */
  checkIn: (packId: string) => SessionEntry | null;
  /** Removes a single session entry (undoes a check-in, or deletes a history row). */
  undoSession: (entryId: string) => void;
};

function usedCount(sessions: SessionEntry[], packId: string): number {
  return sessions.filter((entry) => entry.packId === packId).length;
}

export function remainingFor(pack: Pack, sessions: SessionEntry[]): number {
  return Math.max(pack.totalSessions - usedCount(sessions, pack.id), 0);
}

export function sessionsFor(sessions: SessionEntry[], packId: string): SessionEntry[] {
  return sessions
    .filter((entry) => entry.packId === packId)
    .sort((a, b) => b.usedAt.localeCompare(a.usedAt));
}

function persist(state: Pick<PacksState, 'packs' | 'sessions'>) {
  void save({ version: 1, packs: state.packs, sessions: state.sessions });
}

export const usePacks = create<PacksState>((set, get) => ({
  packs: [],
  sessions: [],
  hydrated: false,

  hydrate: async () => {
    const state = await load();
    set({ packs: state.packs, sessions: state.sessions, hydrated: true });
  },

  addPack: (input) => {
    if (input.totalSessions < 1 || !Number.isInteger(input.totalSessions)) {
      throw new Error('totalSessions must be a positive integer');
    }
    const pack: Pack = {
      id: makeId(),
      name: input.name.trim(),
      totalSessions: input.totalSessions,
      startDate: input.startDate,
      expiryDate: input.expiryDate,
      accent: input.accent,
      archived: false,
      createdAt: new Date().toISOString(),
    };
    const packs = [...get().packs, pack];
    set({ packs });
    persist({ packs, sessions: get().sessions });
    void syncRemindersForPack(pack, get().sessions);
    return pack;
  },

  updatePack: (id, patch) => {
    const { packs, sessions } = get();
    const pack = packs.find((p) => p.id === id);
    if (!pack) return;
    if (patch.totalSessions !== undefined) {
      const used = usedCount(sessions, id);
      if (patch.totalSessions < used) {
        throw new Error(`totalSessions cannot be less than the ${used} session(s) already used`);
      }
    }
    const nextPacks = packs.map((p) => (p.id === id ? { ...p, ...patch } : p));
    set({ packs: nextPacks });
    persist({ packs: nextPacks, sessions });
    const updated = nextPacks.find((p) => p.id === id)!;
    void syncRemindersForPack(updated, sessions);
  },

  archivePack: (id, archived = true) => {
    const packs = get().packs.map((p) => (p.id === id ? { ...p, archived } : p));
    set({ packs });
    persist({ packs, sessions: get().sessions });
    if (archived) {
      void cancelRemindersForPack(id);
    } else {
      const restored = packs.find((p) => p.id === id);
      if (restored) void syncRemindersForPack(restored, get().sessions);
    }
  },

  deletePack: (id) => {
    const packs = get().packs.filter((p) => p.id !== id);
    const sessions = get().sessions.filter((entry) => entry.packId !== id);
    set({ packs, sessions });
    persist({ packs, sessions });
    void cancelRemindersForPack(id);
  },

  checkIn: (packId) => {
    const { packs, sessions } = get();
    const pack = packs.find((p) => p.id === packId);
    if (!pack || remainingFor(pack, sessions) <= 0) return null;
    const entry: SessionEntry = {
      id: makeId(),
      packId,
      usedAt: new Date().toISOString(),
    };
    const nextSessions = [...sessions, entry];
    set({ sessions: nextSessions });
    persist({ packs, sessions: nextSessions });
    void syncRemindersForPack(pack, nextSessions);
    return entry;
  },

  undoSession: (entryId) => {
    const { packs, sessions } = get();
    const entry = sessions.find((e) => e.id === entryId);
    const nextSessions = sessions.filter((e) => e.id !== entryId);
    set({ sessions: nextSessions });
    persist({ packs, sessions: nextSessions });
    const pack = entry && packs.find((p) => p.id === entry.packId);
    if (pack) void syncRemindersForPack(pack, nextSessions);
  },
}));

export function useRemaining(packId: string): number {
  return usePacks((state) => {
    const pack = state.packs.find((p) => p.id === packId);
    return pack ? remainingFor(pack, state.sessions) : 0;
  });
}

export function useSessionsFor(packId: string): SessionEntry[] {
  // `sessionsFor` builds a new filtered/sorted array every call. Its entries are still the same
  // object references from `state.sessions` though, so a shallow comparison correctly treats an
  // unchanged result as unchanged — without it, a new array reference every render trips
  // `useSyncExternalStore`'s "getSnapshot should be cached" loop guard.
  return usePacks(useShallow((state) => sessionsFor(state.sessions, packId)));
}
