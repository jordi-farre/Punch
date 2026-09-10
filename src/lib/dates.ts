import { addMonths, addWeeks, addYears, differenceInCalendarDays, format, formatDistanceStrict, parseISO } from 'date-fns';

import type { ExpiryStatus } from '@/lib/types';

/** A pack is flagged as expiring soon once it's within this many days of its expiry date. */
const EXPIRING_SOON_THRESHOLD_DAYS = 30;

/** Whole calendar days from `now` to the given ISO date. Negative once the date is past. */
export function daysUntil(iso: string, now: Date = new Date()): number {
  return differenceInCalendarDays(parseISO(iso), now);
}

export function formatShortDate(iso: string): string {
  return format(parseISO(iso), 'MMM d, yyyy');
}

export function expiryStatus(
  expiryDate: string | undefined,
  now: Date = new Date(),
): ExpiryStatus {
  if (!expiryDate) return 'ok';
  const days = daysUntil(expiryDate, now);
  if (days < 0) return 'expired';
  if (days <= EXPIRING_SOON_THRESHOLD_DAYS) return 'expiring-soon';
  return 'ok';
}

/** Human-readable expiry line, e.g. "Expires in 12 days" / "Expired 3 days ago". `null` when the
 * pack has no expiry date at all. */
export function expiryLabel(expiryDate: string | undefined, now: Date = new Date()): string | null {
  if (!expiryDate) return null;
  const days = daysUntil(expiryDate, now);
  if (days === 0) return 'Expires today';
  const expiry = parseISO(expiryDate);
  if (days < 0) return `Expired ${formatDistanceStrict(now, expiry)} ago`;
  return `Expires in ${formatDistanceStrict(expiry, now)}`;
}

export type ExpiryPresetKey = 'week' | 'month' | '3months' | 'year';

export const EXPIRY_PRESETS: { key: ExpiryPresetKey; label: string }[] = [
  { key: 'week', label: '1 week' },
  { key: 'month', label: '1 month' },
  { key: '3months', label: '3 months' },
  { key: 'year', label: '1 year' },
];

/** Applies an expiry preset relative to `base` (typically the pack's start date). */
export function applyExpiryPreset(base: Date, preset: ExpiryPresetKey): Date {
  switch (preset) {
    case 'week':
      return addWeeks(base, 1);
    case 'month':
      return addMonths(base, 1);
    case '3months':
      return addMonths(base, 3);
    case 'year':
      return addYears(base, 1);
  }
}
