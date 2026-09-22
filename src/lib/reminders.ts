import { differenceInCalendarDays, parseISO, subDays } from 'date-fns';

import type { Pack, SessionEntry } from '@/lib/types';

const MIN_HISTORY_DAYS = 14;
const LAST_CHANCE_DAYS_BEFORE_EXPIRY = 3;
const PACE_BUFFER = 1.25;

export type ReminderPlan = {
  behindAt: Date | null;
  lastChanceAt: Date | null;
};

export function computeReminderPlan(pack: Pack, sessions: SessionEntry[], now: Date = new Date()): ReminderPlan {
  if (!pack.expiryDate) return { behindAt: null, lastChanceAt: null };

  const usedCount = sessions.filter((entry) => entry.packId === pack.id).length;
  const remaining = Math.max(pack.totalSessions - usedCount, 0);
  if (remaining <= 0) return { behindAt: null, lastChanceAt: null };

  const expiry = parseISO(pack.expiryDate);
  if (differenceInCalendarDays(expiry, now) < 0) return { behindAt: null, lastChanceAt: null };

  const lastChanceAt = subDays(expiry, LAST_CHANCE_DAYS_BEFORE_EXPIRY);

  const start = parseISO(pack.startDate);
  const daysSinceStart = differenceInCalendarDays(now, start);
  if (daysSinceStart < MIN_HISTORY_DAYS) return { behindAt: null, lastChanceAt };

  const pace = usedCount / daysSinceStart;
  const daysNeeded = pace > 0 ? remaining / pace : Infinity;
  const projectedBehindAt = Number.isFinite(daysNeeded) ? subDays(expiry, Math.ceil(daysNeeded * PACE_BUFFER)) : now;

  const behindAt = projectedBehindAt > lastChanceAt ? null : projectedBehindAt;

  return { behindAt, lastChanceAt };
}

export function nextNineAM(from: Date, now: Date = new Date()): Date {
  const base = from < now ? now : from;
  const candidate = new Date(base);
  candidate.setHours(9, 0, 0, 0);
  if (candidate < base) candidate.setDate(candidate.getDate() + 1);
  return candidate;
}
