/**
 * Single source of truth for the app's design tokens.
 *
 * This file is plain CommonJS (not TypeScript) so it can be `require()`d directly by
 * `tailwind.config.js`, which runs under plain Node during the Metro/PostCSS build — it must
 * not pull in `react-native` or `react-native-paper`, which assume a React Native runtime.
 *
 * `theme/paper.ts` imports the same object and layers it onto Paper's MD3 theme, so Tailwind
 * classes and Paper components always agree on colour.
 *
 * The `colors.light` / `colors.dark` values are the standard Material 3 baseline scheme (the
 * same values `MD3LightTheme` / `MD3DarkTheme` from react-native-paper ship by default) —
 * reproduced here, rather than imported, so this file has zero runtime dependencies.
 */

const colors = {
  light: {
    primary: '#6750A4',
    onPrimary: '#FFFFFF',
    primaryContainer: '#EADDFF',
    onPrimaryContainer: '#21005D',
    secondary: '#625B71',
    onSecondary: '#FFFFFF',
    secondaryContainer: '#E8DEF8',
    onSecondaryContainer: '#1D192B',
    tertiary: '#7D5260',
    onTertiary: '#FFFFFF',
    tertiaryContainer: '#FFD8E4',
    onTertiaryContainer: '#31111D',
    error: '#B3261E',
    onError: '#FFFFFF',
    errorContainer: '#F9DEDC',
    onErrorContainer: '#410E0B',
    background: '#FFFBFE',
    onBackground: '#1C1B1F',
    surface: '#FFFBFE',
    onSurface: '#1C1B1F',
    surfaceVariant: '#E7E0EC',
    onSurfaceVariant: '#49454F',
    outline: '#79747E',
    outlineVariant: '#CAC4D0',
    inverseSurface: '#313033',
    inverseOnSurface: '#F4EFF4',
    inversePrimary: '#D0BCFF',
  },
  dark: {
    primary: '#D0BCFF',
    onPrimary: '#381E72',
    primaryContainer: '#4F378B',
    onPrimaryContainer: '#EADDFF',
    secondary: '#CCC2DC',
    onSecondary: '#332D41',
    secondaryContainer: '#4A4458',
    onSecondaryContainer: '#E8DEF8',
    tertiary: '#EFB8C8',
    onTertiary: '#492532',
    tertiaryContainer: '#633B48',
    onTertiaryContainer: '#FFD8E4',
    error: '#F2B8B5',
    onError: '#601410',
    errorContainer: '#8C1D18',
    onErrorContainer: '#F9DEDC',
    background: '#1C1B1F',
    onBackground: '#E6E1E5',
    surface: '#1C1B1F',
    onSurface: '#E6E1E5',
    surfaceVariant: '#49454F',
    onSurfaceVariant: '#CAC4D0',
    outline: '#938F99',
    outlineVariant: '#49454F',
    inverseSurface: '#E6E1E5',
    inverseOnSurface: '#313033',
    inversePrimary: '#6750A4',
  },
};

// Per-pack accent swatches. Each is a single fixed tone (not a light/dark pair): they're used as
// filled surfaces (progress bar, badge, card border) with white content on top, so they stay
// legible in both themes without re-deriving per scheme. All verified >= 4.5:1 contrast against
// white text (WCAG AA).
const accents = {
  indigo: { color: '#4655A8', on: '#FFFFFF' },
  teal: { color: '#00696B', on: '#FFFFFF' },
  forest: { color: '#3C6B3F', on: '#FFFFFF' },
  amber: { color: '#7A5900', on: '#FFFFFF' },
  coral: { color: '#984061', on: '#FFFFFF' },
  purple: { color: '#7C4DAB', on: '#FFFFFF' },
  blue: { color: '#2B5FA8', on: '#FFFFFF' },
  brown: { color: '#7B5842', on: '#FFFFFF' },
};

const accentOrder = ['indigo', 'teal', 'forest', 'amber', 'coral', 'purple', 'blue', 'brown'];

const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

const radii = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 28, // Paper's default large-component radius (FAB, dialogs)
  full: 999,
};

module.exports = { colors, accents, accentOrder, spacing, radii };
