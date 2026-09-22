import '@/theme/cssInterop';
import '@/global.css';

import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { PaperProvider } from 'react-native-paper';
import { en, registerTranslation } from 'react-native-paper-dates';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { syncAllReminders } from '@/lib/notifications';
import { usePacks } from '@/store/usePacks';
import { useReminderSettings } from '@/store/useReminderSettings';
import { useThemePreference } from '@/store/useThemePreference';
import { colors } from '@/theme/tokens';
import { paperDarkTheme, paperLightTheme } from '@/theme/paper';

SplashScreen.preventAutoHideAsync();
registerTranslation('en', en);

const navigationLightTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: colors.light.primary,
    background: colors.light.background,
    card: colors.light.surface,
    text: colors.light.onSurface,
    border: colors.light.outlineVariant,
  },
};

const navigationDarkTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: colors.dark.primary,
    background: colors.dark.background,
    card: colors.dark.surface,
    text: colors.dark.onSurface,
    border: colors.dark.outlineVariant,
  },
};

export default function RootLayout() {
  const systemScheme = useColorScheme();
  const themePreference = useThemePreference((state) => state.preference);
  const themeHydrated = useThemePreference((state) => state.hydrated);
  const hydrateTheme = useThemePreference((state) => state.hydrate);
  const isDark = themePreference === 'system' ? systemScheme === 'dark' : themePreference === 'dark';

  const hydrate = usePacks((state) => state.hydrate);
  const hydrated = usePacks((state) => state.hydrated);

  const hydrateReminderSettings = useReminderSettings((state) => state.hydrate);
  const reminderSettingsHydrated = useReminderSettings((state) => state.hydrated);

  useEffect(() => {
    hydrate();
    hydrateTheme();
    hydrateReminderSettings();
  }, [hydrate, hydrateTheme, hydrateReminderSettings]);

  const ready = hydrated && themeHydrated && reminderSettingsHydrated;

  useEffect(() => {
    if (ready) SplashScreen.hideAsync();
  }, [ready]);

  useEffect(() => {
    if (ready) void syncAllReminders(usePacks.getState().packs, usePacks.getState().sessions);
  }, [ready]);

  if (!ready) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <PaperProvider theme={isDark ? paperDarkTheme : paperLightTheme}>
          <ThemeProvider value={isDark ? navigationDarkTheme : navigationLightTheme}>
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="index" />
              <Stack.Screen name="archived" />
              <Stack.Screen name="settings" />
              <Stack.Screen name="pack/[id]" />
              <Stack.Screen name="pack/edit" options={{ presentation: 'modal' }} />
            </Stack>
          </ThemeProvider>
        </PaperProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
