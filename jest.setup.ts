import AsyncStorage from '@react-native-async-storage/async-storage';

import { usePacks } from '@/store/usePacks';

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

require('react-native-reanimated').setUpTests();

afterEach(async () => {
  await AsyncStorage.clear();
  usePacks.setState({ packs: [], sessions: [], hydrated: false });
});
