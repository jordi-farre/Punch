import * as Notifications from 'expo-notifications';

import { expiryLabel } from '@/lib/dates';
import { computeReminderPlan, nextNineAM } from '@/lib/reminders';
import type { Pack, SessionEntry } from '@/lib/types';
import { useReminderSettings } from '@/store/useReminderSettings';

function behindId(packId: string): string {
  return `pack-behind-${packId}`;
}

function lastChanceId(packId: string): string {
  return `pack-last-chance-${packId}`;
}

async function requestPermissionIfNeeded(): Promise<boolean> {
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return true;
  if (!current.canAskAgain) return false;
  const requested = await Notifications.requestPermissionsAsync();
  return requested.granted;
}

async function scheduleAt(identifier: string, date: Date, title: string, body: string, now: Date) {
  await Notifications.cancelScheduledNotificationAsync(identifier).catch(() => {});
  const granted = await requestPermissionIfNeeded();
  if (!granted) return;
  await Notifications.scheduleNotificationAsync({
    identifier,
    content: { title, body },
    trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: nextNineAM(date, now) },
  });
}

/** Cancels both of a pack's reminders — call when it's archived or deleted, or when reminders are
 * turned off entirely. */
export async function cancelRemindersForPack(packId: string): Promise<void> {
  await Promise.all([
    Notifications.cancelScheduledNotificationAsync(behindId(packId)).catch(() => {}),
    Notifications.cancelScheduledNotificationAsync(lastChanceId(packId)).catch(() => {}),
  ]);
}

/**
 * Recomputes a pack's reminder plan and (re)schedules it, replacing whatever was previously
 * scheduled for this pack — safe to call after any change to the pack or its sessions. A `null`
 * date from `computeReminderPlan` cancels the corresponding reminder rather than leaving a stale
 * one in place. No-ops (and clears any pending reminders) when the user has turned reminders off.
 */
export async function syncRemindersForPack(pack: Pack, sessions: SessionEntry[], now: Date = new Date()): Promise<void> {
  if (!useReminderSettings.getState().enabled) {
    await cancelRemindersForPack(pack.id);
    return;
  }

  const { behindAt, lastChanceAt } = computeReminderPlan(pack, sessions, now);
  const remaining = Math.max(pack.totalSessions - sessions.filter((s) => s.packId === pack.id).length, 0);
  const label = expiryLabel(pack.expiryDate, now);
  const sessionWord = remaining === 1 ? 'session' : 'sessions';

  if (behindAt) {
    await scheduleAt(
      behindId(pack.id),
      behindAt,
      pack.name,
      `${remaining} ${sessionWord} left${label ? ` — ${label.toLowerCase()}` : ''}`,
      now,
    );
  } else {
    await Notifications.cancelScheduledNotificationAsync(behindId(pack.id)).catch(() => {});
  }

  if (lastChanceAt) {
    await scheduleAt(
      lastChanceId(pack.id),
      lastChanceAt,
      pack.name,
      `Last chance — ${remaining} ${sessionWord} left${label ? `, ${label.toLowerCase()}` : ''}`,
      now,
    );
  } else {
    await Notifications.cancelScheduledNotificationAsync(lastChanceId(pack.id)).catch(() => {});
  }
}

/** Re-syncs every pack's reminders — call once on app start, since time (and therefore pace) has
 * moved on while the app was closed, with no per-pack mutation to trigger a resync. */
export async function syncAllReminders(packs: Pack[], sessions: SessionEntry[], now: Date = new Date()): Promise<void> {
  if (!useReminderSettings.getState().enabled) {
    await Notifications.cancelAllScheduledNotificationsAsync().catch(() => {});
    return;
  }
  for (const pack of packs) {
    if (pack.archived) {
      await cancelRemindersForPack(pack.id);
      continue;
    }
    await syncRemindersForPack(pack, sessions, now);
  }
}
