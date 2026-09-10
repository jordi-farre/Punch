import { MD3DarkTheme, MD3LightTheme, type MD3Theme } from 'react-native-paper';

import { accentOrder, accents, colors, radii, type AccentKey } from '@/theme/tokens';

export const paperLightTheme: MD3Theme = {
  ...MD3LightTheme,
  colors: { ...MD3LightTheme.colors, ...colors.light },
  roundness: radii.md / 4, // Paper's `roundness` is a multiplier, not a pixel value
};

export const paperDarkTheme: MD3Theme = {
  ...MD3DarkTheme,
  colors: { ...MD3DarkTheme.colors, ...colors.dark },
  roundness: radii.md / 4,
};

export { accentOrder, accents };
export type { AccentKey };

export function accentFor(key: string): { color: string; on: string } {
  return accents[key as AccentKey] ?? accents[accentOrder[0]];
}
