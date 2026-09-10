export type MD3ColorRoles = {
  primary: string;
  onPrimary: string;
  primaryContainer: string;
  onPrimaryContainer: string;
  secondary: string;
  onSecondary: string;
  secondaryContainer: string;
  onSecondaryContainer: string;
  tertiary: string;
  onTertiary: string;
  tertiaryContainer: string;
  onTertiaryContainer: string;
  error: string;
  onError: string;
  errorContainer: string;
  onErrorContainer: string;
  background: string;
  onBackground: string;
  surface: string;
  onSurface: string;
  surfaceVariant: string;
  onSurfaceVariant: string;
  outline: string;
  outlineVariant: string;
  inverseSurface: string;
  inverseOnSurface: string;
  inversePrimary: string;
};

export type AccentKey =
  | 'indigo'
  | 'teal'
  | 'forest'
  | 'amber'
  | 'coral'
  | 'purple'
  | 'blue'
  | 'brown';

export type Accent = { color: string; on: string };

export const colors: { light: MD3ColorRoles; dark: MD3ColorRoles };
export const accents: Record<AccentKey, Accent>;
export const accentOrder: AccentKey[];
export const spacing: { xs: number; sm: number; md: number; lg: number; xl: number; xxl: number };
export const radii: { sm: number; md: number; lg: number; xl: number; full: number };
