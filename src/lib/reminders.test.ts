import { format, parseISO, subDays } from 'date-fns';

import { computeReminderPlan, nextNineAM } from '@/lib/reminders';
import type { Pack, SessionEntry } from '@/lib/types';

const NOW = new Date(2026, 0, 15);

function isoOffset(days: number, from: Date = NOW): string {
  const date = new Date(from);
  date.setDate(date.getDate() + days);
  return format(date, 'yyyy-MM-dd');
}

function makePack(overrides: Partial<Pack> = {}): Pack {
  return {
    id: 'p1',
    name: 'Coworking',
    totalSessions: 10,
    startDate: isoOffset(-40),
    accent: 'teal',
    archived: false,
    createdAt: `${isoOffset(-40)}T00:00:00.000Z`,
    ...overrides,
  };
}

function makeSessions(packId: string, count: number): SessionEntry[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `s${i}`,
    packId,
    usedAt: `${isoOffset(-1)}T00:00:00.000Z`,
  }));
}

describe('computeReminderPlan', () => {
  it('has no reminders when the pack has no expiry date', () => {
    const pack = makePack({ expiryDate: undefined });
    expect(computeReminderPlan(pack, [], NOW)).toEqual({ behindAt: null, lastChanceAt: null });
  });

  it('has no reminders once all sessions are used', () => {
    const pack = makePack({ totalSessions: 5, expiryDate: isoOffset(30) });
    const sessions = makeSessions(pack.id, 5);
    expect(computeReminderPlan(pack, sessions, NOW)).toEqual({ behindAt: null, lastChanceAt: null });
  });

  it('has no reminders once the pack has already expired', () => {
    const pack = makePack({ expiryDate: isoOffset(-1) });
    expect(computeReminderPlan(pack, [], NOW)).toEqual({ behindAt: null, lastChanceAt: null });
  });

  it('withholds the behind-pace reminder in a pack\'s first 14 days, but still sets last chance', () => {
    const pack = makePack({ startDate: isoOffset(-13), expiryDate: isoOffset(60) });
    const plan = computeReminderPlan(pack, [], NOW);
    expect(plan.behindAt).toBeNull();
    expect(plan.lastChanceAt).toEqual(subDays(parseISO(pack.expiryDate!), 3));
  });

  it('allows the behind-pace reminder from exactly 14 days old', () => {
    const pack = makePack({
      startDate: isoOffset(-14),
      expiryDate: isoOffset(60),
      totalSessions: 20,
    });
    const plan = computeReminderPlan(pack, [], NOW);
    expect(plan.behindAt).toEqual(NOW);
  });

  it('always sets last chance to 3 days before expiry when sessions remain, regardless of pace', () => {
    const pack = makePack({ startDate: isoOffset(-40), expiryDate: isoOffset(30), totalSessions: 20 });
    const sessions = makeSessions(pack.id, 18);
    const plan = computeReminderPlan(pack, sessions, NOW);
    expect(plan.lastChanceAt).toEqual(subDays(parseISO(pack.expiryDate!), 3));
  });

  it('projects a clean pace forward with the buffer applied', () => {
    const pack = makePack({ startDate: isoOffset(-40), expiryDate: isoOffset(40), totalSessions: 30 });
    const sessions = makeSessions(pack.id, 20);
    const plan = computeReminderPlan(pack, sessions, NOW);
    expect(plan.behindAt).toEqual(subDays(parseISO(pack.expiryDate!), 25));
  });

  it('suppresses the behind-pace reminder once the projection would land within the last-chance window', () => {
    const pack = makePack({ startDate: isoOffset(-40), expiryDate: isoOffset(30), totalSessions: 41 });
    const sessions = makeSessions(pack.id, 40);
    const plan = computeReminderPlan(pack, sessions, NOW);
    expect(plan.behindAt).toBeNull();
    expect(plan.lastChanceAt).not.toBeNull();
  });

  it('projects an immediate reminder when no sessions have been used at all', () => {
    const pack = makePack({ startDate: isoOffset(-30), expiryDate: isoOffset(60), totalSessions: 15 });
    const plan = computeReminderPlan(pack, [], NOW);
    expect(plan.behindAt).toEqual(NOW);
  });

  it('has no behind-pace reminder when even an immediate one would fall in the last-chance window', () => {
    const pack = makePack({ startDate: isoOffset(-30), expiryDate: isoOffset(2), totalSessions: 15 });
    const plan = computeReminderPlan(pack, [], NOW);
    expect(plan.behindAt).toBeNull();
    expect(plan.lastChanceAt).not.toBeNull();
  });
});

describe('nextNineAM', () => {
  it('rolls forward to today at 9am when earlier the same day', () => {
    const from = new Date(2026, 0, 10, 3, 0);
    const now = new Date(2026, 0, 1);
    expect(nextNineAM(from, now)).toEqual(new Date(2026, 0, 10, 9, 0, 0, 0));
  });

  it('rolls forward to the next day at 9am when later the same day', () => {
    const from = new Date(2026, 0, 10, 14, 0);
    const now = new Date(2026, 0, 1);
    expect(nextNineAM(from, now)).toEqual(new Date(2026, 0, 11, 9, 0, 0, 0));
  });

  it('never lands before "now", even when the target date is in the past', () => {
    const from = new Date(2026, 0, 1, 3, 0);
    const now = new Date(2026, 0, 10, 12, 0);
    const result = nextNineAM(from, now);
    expect(result.getTime()).toBeGreaterThanOrEqual(now.getTime());
    expect(result).toEqual(new Date(2026, 0, 11, 9, 0, 0, 0));
  });

  it('stays put when already exactly 9am at or after "now"', () => {
    const from = new Date(2026, 0, 10, 9, 0, 0, 0);
    const now = new Date(2026, 0, 10, 8, 0);
    expect(nextNineAM(from, now)).toEqual(from);
  });
});
