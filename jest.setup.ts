import AsyncStorage from '@react-native-async-storage/async-storage';
import { cleanup } from '@testing-library/react-native';

import { usePacks } from '@/store/usePacks';

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

jest.mock('expo-notifications', () => ({
  getPermissionsAsync: jest.fn().mockResolvedValue({ granted: false, canAskAgain: false }),
  requestPermissionsAsync: jest.fn().mockResolvedValue({ granted: false, canAskAgain: false }),
  scheduleNotificationAsync: jest.fn().mockResolvedValue('mock-notification-id'),
  cancelScheduledNotificationAsync: jest.fn().mockResolvedValue(undefined),
  cancelAllScheduledNotificationsAsync: jest.fn().mockResolvedValue(undefined),
  getAllScheduledNotificationsAsync: jest.fn().mockResolvedValue([]),
  SchedulableTriggerInputTypes: { DATE: 'date', TIME_INTERVAL: 'timeInterval' },
}));

require('react-native-reanimated').setUpTests();
require('react-native-gesture-handler/jestSetup');

// react-native-gesture-handler's worklet-detection warning ("Some of the callbacks in the
// gesture are worklets and some are not...") fires from ReanimatedSwipeable in this Jest
// environment but not in the real app (verified in-browser) — Reanimated's babel plugin marks
// worklets differently under babel-jest than under Metro. It's not actionable (the library isn't
// user-configurable here, and the installed version is pinned by Expo SDK 57), so filter just
// this one known message rather than let it bury real console.error output in test runs.
const originalConsoleError = console.error;
console.error = (...args: unknown[]) => {
  if (typeof args[0] === 'string' && args[0].includes('Some of the callbacks in the gesture are worklets')) {
    return;
  }
  originalConsoleError(...args);
};

afterEach(async () => {
  // RNTL also auto-registers its own `afterEach(cleanup)`, but only once a test file imports
  // it — that happens after this file's afterEach is registered, so ours would otherwise run
  // FIRST each time, resetting the store (and AsyncStorage) while the previous test's component
  // tree is still mounted. That's a real state update outside of `act()`, not just log noise —
  // unmount explicitly, first, so nothing is listening when the store resets.
  cleanup();
  await AsyncStorage.clear();
  usePacks.setState({ packs: [], sessions: [], hydrated: false });
});
