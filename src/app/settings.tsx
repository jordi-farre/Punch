import { router } from 'expo-router';
import { View } from 'react-native';
import { Appbar, SegmentedButtons, Switch, Text, useTheme } from 'react-native-paper';

import { syncAllReminders } from '@/lib/notifications';
import { usePacks } from '@/store/usePacks';
import { useReminderSettings } from '@/store/useReminderSettings';
import { useThemePreference } from '@/store/useThemePreference';

export default function SettingsScreen() {
  const theme = useTheme();
  const preference = useThemePreference((state) => state.preference);
  const setPreference = useThemePreference((state) => state.setPreference);

  const remindersEnabled = useReminderSettings((state) => state.enabled);
  const setRemindersEnabled = useReminderSettings((state) => state.setEnabled);

  function handleToggleReminders(value: boolean) {
    setRemindersEnabled(value);
    // Either resyncs every pack's reminder (now enabled) or clears them all (now disabled) —
    // syncAllReminders already branches on the setting itself, so one call covers both.
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
      </View>
    </View>
  );
}
