import { differenceInCalendarDays, parseISO, subDays } from 'date-fns';

import type { Pack, SessionEntry } from '@/lib/types';

/** A pack needs this many days of history before its pace is trusted enough to remind on. */
const MIN_HISTORY_DAYS = 14;

/** How many days before expiry the last-chance reminder fires, if sessions remain. */
const LAST_CHANCE_DAYS_BEFORE_EXPIRY = 3;

/** Multiplies the pace-projected time needed, so the reminder fires with room to spare rather
 * than exactly when the pack would run out at the current pace. */
const PACE_BUFFER = 1.25;

export type ReminderPlan = {
  /** The ideal date to nudge that the pack is behind pace, or `null` if it doesn't qualify (see
   * `computeReminderPlan`'s doc comment). Can be in the past — e.g. right after editing a pack to
   * a much sooner expiry date, the pack is immediately "behind". The caller (`lib/notifications.ts`)
   * is responsible for turning this into an actual trigger time, not this function. */
  behindAt: Date | null;
  /** When to send the final "sessions remain, pack is about to expire" nudge, or `null`. */
  lastChanceAt: Date | null;
};

/**
 * Decides when (if at all) to remind about a pack's unused sessions before it expires. Recomputed
 * — not stored — every time a pack's sessions or fields change, so it always reflects the pack's
 * current pace; the caller reschedules using a stable per-pack notification id, which naturally
 * replaces a stale pending reminder rather than stacking new ones.
 *
 * No reminder at all when: there's no expiry date, the pack has no sessions left, or it's already
 * expired.
 *
 * `behindAt`: the pack's pace so far (`sessions used / days since start`) is projected forward to
 * estimate how many more days are needed to use the rest — with `PACE_BUFFER` headroom, since
 * people's pace isn't perfectly steady. That's compared against the pack's expiry date. Withheld
 * for a pack's first `MIN_HISTORY_DAYS` days (too little history for the pace to mean anything),
 * and skipped entirely when it would fall within `LAST_CHANCE_DAYS_BEFORE_EXPIRY` of expiry — the
 * last-chance reminder already has that window covered.
 *
 * `lastChanceAt`: always `LAST_CHANCE_DAYS_BEFORE_EXPIRY` days before expiry, independent of
 * pace, as long as any sessions remain.
 */
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
  const projected = Number.isFinite(daysNeeded) ? subDays(expiry, Math.ceil(daysNeeded * PACE_BUFFER)) : now;

  const latest = subDays(expiry, LAST_CHANCE_DAYS_BEFORE_EXPIRY);
  const behindAt = projected > latest ? null : projected;

  return { behindAt, lastChanceAt };
}

/** The next 9am at or after `from` — never earlier than `from` itself. Used to turn a
 * `ReminderPlan` date (which can be in the past, or land at an odd hour) into an actual
 * notification trigger time that never fires immediately and always lands at a sane hour. */
export function nextNineAM(from: Date, now: Date = new Date()): Date {
  const base = from < now ? now : from;
  const candidate = new Date(base);
  candidate.setHours(9, 0, 0, 0);
  if (candidate < base) candidate.setDate(candidate.getDate() + 1);
  return candidate;
}
