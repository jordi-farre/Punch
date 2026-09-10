import type { AccentKey } from '@/theme/tokens';

export type Pack = {
  id: string;
  name: string;
  totalSessions: number;
  startDate: string; // ISO date (yyyy-MM-dd)
  expiryDate?: string; // ISO date (yyyy-MM-dd), optional
  accent: AccentKey;
  archived: boolean;
  createdAt: string; // ISO datetime
};

export type SessionEntry = {
  id: string;
  packId: string;
  usedAt: string; // ISO datetime
};

export type PersistedState = {
  version: 1;
  packs: Pack[];
  sessions: SessionEntry[];
};

export const EMPTY_STATE: PersistedState = { version: 1, packs: [], sessions: [] };

export type ExpiryStatus = 'ok' | 'expiring-soon' | 'expired';
