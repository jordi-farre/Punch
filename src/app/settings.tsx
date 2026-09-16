import { router } from 'expo-router';
import { View } from 'react-native';
import { Appbar, SegmentedButtons, Text, useTheme } from 'react-native-paper';

import { useThemePreference } from '@/store/useThemePreference';

export default function SettingsScreen() {
  const theme = useTheme();
  const preference = useThemePreference((state) => state.preference);
  const setPreference = useThemePreference((state) => state.setPreference);

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
      </View>
    </View>
  );
}
