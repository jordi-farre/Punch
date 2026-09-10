const tokens = require('./src/theme/tokens');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/app/**/*.{js,jsx,ts,tsx}', './src/components/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        // MD3 roles as static utilities, e.g. `bg-md-surface`. These do NOT react to light/dark
        // mode on their own (Tailwind classes are compiled once) — for anything that must follow
        // the active color scheme, use Paper's `useTheme().colors.*` instead, which already
        // switches at runtime. These exist for the rare case of a deliberately fixed tone.
        md: tokens.colors.light,
        'md-dark': tokens.colors.dark,
        // Per-pack accents, e.g. `bg-accent-teal`.
        accent: Object.fromEntries(
          Object.entries(tokens.accents).map(([key, value]) => [key, value.color]),
        ),
        'on-accent': Object.fromEntries(
          Object.entries(tokens.accents).map(([key, value]) => [key, value.on]),
        ),
      },
      spacing: tokens.spacing,
      borderRadius: tokens.radii,
    },
  },
  plugins: [],
};
