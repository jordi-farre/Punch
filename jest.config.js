module.exports = {
  preset: 'jest-expo',
  // Reanimated 4 delegates its native runtime to react-native-worklets; this resolver makes
  // Jest resolve the web/JS implementation instead of the native one.
  resolver: 'react-native-worklets/jest/resolver',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  moduleNameMapper: {
    '\\.css$': '<rootDir>/jest.css-mock.js',
  },
  // jest-expo's default list doesn't include react-native-paper-dates (or its nested ESM-only
  // `color` dependency), so both are left untransformed and fail to `require()`. Same list as
  // the preset's default, with those two added.
  transformIgnorePatterns: [
    '/node_modules/(?!(.pnpm|react-native|@react-native|@react-native-community|expo|@expo|@expo-google-fonts|react-navigation|@react-navigation|@sentry/react-native|native-base|standard-navigation|react-native-paper-dates|color))',
    '/node_modules/react-native-reanimated/plugin/',
    '/node_modules/@react-native/babel-preset/',
  ],
};
