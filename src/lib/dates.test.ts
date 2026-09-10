import { format } from 'date-fns';

import { applyExpiryPreset, daysUntil, expiryLabel, expiryStatus, formatShortDate } from '@/lib/dates';

const NOW = new Date(2026, 0, 15); // Jan 15, 2026

function isoOffset(days: number): string {
  const date = new Date(NOW);
  date.setDate(date.getDate() + days);
  return format(date, 'yyyy-MM-dd');
}

describe('daysUntil', () => {
  it('is 0 for today', () => {
    expect(daysUntil(isoOffset(0), NOW)).toBe(0);
  });

  it('is positive for a future date', () => {
    expect(daysUntil(isoOffset(10), NOW)).toBe(10);
  });

  it('is negative for a past date', () => {
    expect(daysUntil(isoOffset(-5), NOW)).toBe(-5);
  });
});

describe('expiryStatus', () => {
  it('is "ok" when there is no expiry date', () => {
    expect(expiryStatus(undefined, NOW)).toBe('ok');
  });

  it('is "ok" more than 30 days out', () => {
    expect(expiryStatus(isoOffset(31), NOW)).toBe('ok');
  });

  it('is "expiring-soon" at exactly 30 days out', () => {
    expect(expiryStatus(isoOffset(30), NOW)).toBe('expiring-soon');
  });

  it('is "expiring-soon" on the expiry day itself', () => {
    expect(expiryStatus(isoOffset(0), NOW)).toBe('expiring-soon');
  });

  it('is "expired" the day after expiry', () => {
    expect(expiryStatus(isoOffset(-1), NOW)).toBe('expired');
  });

  it('is "expired" for a date well in the past', () => {
    expect(expiryStatus(isoOffset(-90), NOW)).toBe('expired');
  });
});

describe('expiryLabel', () => {
  it('is null when there is no expiry date', () => {
    expect(expiryLabel(undefined, NOW)).toBeNull();
  });

  it('reads "Expires today" on the expiry day', () => {
    expect(expiryLabel(isoOffset(0), NOW)).toBe('Expires today');
  });

  it('reads "Expires in ..." for a future date', () => {
    expect(expiryLabel(isoOffset(12), NOW)).toMatch(/^Expires in /);
  });

  it('reads "Expired ... ago" for a past date', () => {
    expect(expiryLabel(isoOffset(-3), NOW)).toMatch(/^Expired .* ago$/);
  });
});

describe('formatShortDate', () => {
  it('formats an ISO date as a short human date', () => {
    expect(formatShortDate('2026-03-05')).toBe('Mar 5, 2026');
  });
});

describe('applyExpiryPreset', () => {
  it('adds a week', () => {
    expect(format(applyExpiryPreset(NOW, 'week'), 'yyyy-MM-dd')).toBe('2026-01-22');
  });

  it('adds a month', () => {
    expect(format(applyExpiryPreset(NOW, 'month'), 'yyyy-MM-dd')).toBe('2026-02-15');
  });

  it('adds three months', () => {
    expect(format(applyExpiryPreset(NOW, '3months'), 'yyyy-MM-dd')).toBe('2026-04-15');
  });

  it('adds a year', () => {
    expect(format(applyExpiryPreset(NOW, 'year'), 'yyyy-MM-dd')).toBe('2027-01-15');
  });
});
