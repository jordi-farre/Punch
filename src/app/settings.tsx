import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { AppState, Linking, View } from 'react-native';
import { Appbar, Button, SegmentedButtons, Switch, Text, useTheme } from 'react-native-paper';

import { getNotificationPermissionStatus, syncAllReminders, type NotificationPermissionStatus } from '@/lib/notifications';
import { usePacks } from '@/store/usePacks';
import { useReminderSettings } from '@/store/useReminderSettings';
import { useThemePreference } from '@/store/useThemePreference';

export default function SettingsScreen() {
  const theme = useTheme();
  const preference = useThemePreference((state) => state.preference);
  const setPreference = useThemePreference((state) => state.setPreference);

  const remindersEnabled = useReminderSettings((state) => state.enabled);
  const setRemindersEnabled = useReminderSettings((state) => state.setEnabled);

  const [permissionStatus, setPermissionStatus] = useState<NotificationPermissionStatus>('undetermined');

  useEffect(() => {
    function refresh() {
      void getNotificationPermissionStatus().then(setPermissionStatus);
    }
    refresh();
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') refresh();
    });
    return () => subscription.remove();
  }, []);

  function handleToggleReminders(value: boolean) {
    setRemindersEnabled(value);
    void syncAllReminders(usePacks.getState().packs, usePacks.getState().sessions);
  }

  return (
    <View className="flex-1" style={{ backgroundColor: theme.colors.background }}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title="Settings" />
      </Appbar.Header>

      <View className="p-md gap-sm">
        <Text variant="labelLarge">Theme</Text>
        <SegmentedButtons
          value={preference}
          onValueChange={(value) => setPreference(value as typeof preference)}
          buttons={[
            { value: 'system', label: 'System', icon: 'theme-light-dark' },
            { value: 'light', label: 'Light', icon: 'white-balance-sunny' },
            { value: 'dark', label: 'Dark', icon: 'moon-waning-crescent' },
          ]}
        />

        <View className="flex-row items-center justify-between mt-lg">
          <View className="flex-1 pr-md">
            <Text variant="labelLarge">Expiry reminders</Text>
            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
              Lets you know if a pack looks likely to expire with sessions unused.
            </Text>
          </View>
          <Switch value={remindersEnabled} onValueChange={handleToggleReminders} />
        </View>

        {remindersEnabled && permissionStatus === 'blocked' ? (
          <View
            className="flex-row items-center justify-between p-sm mt-sm"
            style={{ backgroundColor: theme.colors.errorContainer, borderRadius: theme.roundness }}>
            <Text variant="bodySmall" className="flex-1" style={{ color: theme.colors.onErrorContainer }}>
              Blocked in system settings
            </Text>
            <Button
              onPress={() => {
                if (typeof Linking.openSettings === 'function') Linking.openSettings();
              }}
              textColor={theme.colors.onErrorContainer}>
              Open Settings
            </Button>
          </View>
        ) : null}
      </View>
    </View>
  );
}
